const express = require('express');
const router = express.Router();
const APIIntegration = require('../services/apiIntegration');
const LoanDataScraper = require('../services/loanDataScraper');
const CacheService = require('../services/cacheService');
const ValidationService = require('../services/validationService');
const SchedulerService = require('../services/schedulerService');
const winston = require('winston');
require('dotenv').config();

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: process.env.LOG_FILE || 'logs/loan_routes.log' })
  ]
});

// Static loan data (your existing curated data)
let staticLoans = [];
try {
  staticLoans = require('../data/loans.json');
} catch (error) {
  logger.warn('Could not load static loans data:', error.message);
  staticLoans = [];
}

// Initialize services
const apiIntegration = new APIIntegration();
const dataScraper = new LoanDataScraper();
const cache = new CacheService();
const validator = new ValidationService();
const scheduler = new SchedulerService();

// Start scheduler if enabled
if (process.env.ENABLE_SCHEDULER !== 'false') {
  scheduler.start();
  logger.info('Loan data scheduler started');
}

// GET /api/loans - Get all loans (static + real-time data)
router.get('/', async (req, res) => {
  try {
    const { 
      country, 
      source = 'all', 
      category, 
      lenderType, 
      minAmount, 
      maxAmount, 
      collateralFree, 
      forceRefresh = 'false' 
    } = req.query;
    
    logger.info(`Fetching loans - country: ${country}, source: ${source}, category: ${category}`);
    
    let allLoans = [];
    const sourceStats = {
      static: 0,
      api: 0,
      scraped: 0,
      validation: {
        total: 0,
        valid: 0,
        invalid: 0
      }
    };
    
    // Include static data
    if (source === 'all' || source === 'static') {
      let staticData = [...staticLoans];
      
      // Validate static data
      const staticValidation = validator.validateLoans(staticData, 'static');
      staticData = staticValidation.validLoans;
      sourceStats.static = staticData.length;
      sourceStats.validation.total += staticValidation.stats.total;
      sourceStats.validation.valid += staticValidation.stats.valid;
      sourceStats.validation.invalid += staticValidation.stats.invalid;
      
      allLoans.push(...staticData);
      logger.info(`Loaded ${staticData.length} validated static loans`);
    }
    
    // Include real-time API data
    if (source === 'all' || source === 'api') {
      try {
        const apiResult = await apiIntegration.fetchAllLoansFromAPIs(forceRefresh === 'true');
        
        if (apiResult.loans && apiResult.loans.length > 0) {
          // Validate API data
          const apiValidation = validator.validateLoans(apiResult.loans, 'api');
          const validApiLoans = apiValidation.validLoans;
          
          sourceStats.api = validApiLoans.length;
          sourceStats.validation.total += apiValidation.stats.total;
          sourceStats.validation.valid += apiValidation.stats.valid;
          sourceStats.validation.invalid += apiValidation.stats.invalid;
          
          allLoans.push(...validApiLoans);
          logger.info(`Loaded ${validApiLoans.length} validated API loans`);
        }
      } catch (apiError) {
        logger.error('Error fetching API data:', apiError.message);
        // Continue with other sources
      }
    }
    
    // Include scraped data if requested and enabled
    if ((source === 'all' || source === 'scraped') && process.env.ENABLE_WEB_SCRAPING === 'true') {
      try {
        const scrapedLoans = await getScrapedData(country);
        if (scrapedLoans.length > 0) {
          // Validate scraped data
          const scrapedValidation = validator.validateLoans(scrapedLoans, 'scraped');
          const validScrapedLoans = scrapedValidation.validLoans;
          
          sourceStats.scraped = validScrapedLoans.length;
          sourceStats.validation.total += scrapedValidation.stats.total;
          sourceStats.validation.valid += scrapedValidation.stats.valid;
          sourceStats.validation.invalid += scrapedValidation.stats.invalid;
          
          allLoans.push(...validScrapedLoans);
          logger.info(`Loaded ${validScrapedLoans.length} validated scraped loans`);
        }
      } catch (scrapedError) {
        logger.error('Error fetching scraped data:', scrapedError.message);
        // Continue with other sources
      }
    }
    
    // Apply filters
    let filteredLoans = applyFilters(allLoans, {
      country,
      category,
      lenderType,
      minAmount: minAmount ? parseInt(minAmount) : null,
      maxAmount: maxAmount ? parseInt(maxAmount) : null,
      collateralFree: collateralFree === 'true'
    });
    
    // Remove duplicates based on name, lender, and country
    filteredLoans = removeDuplicateLoans(filteredLoans);
    
    // Sort by relevance and last updated
    filteredLoans.sort((a, b) => {
      // Government schemes first
      if (a.lenderType === 'government' && b.lenderType !== 'government') return -1;
      if (b.lenderType === 'government' && a.lenderType !== 'government') return 1;
      
      // Then by last updated (newest first)
      return new Date(b.lastUpdated) - new Date(a.lastUpdated);
    });
    
    // Limit results if too many (prevent performance issues)
    const maxResults = parseInt(process.env.MAX_LOAN_RESULTS) || 1000;
    if (filteredLoans.length > maxResults) {
      filteredLoans = filteredLoans.slice(0, maxResults);
      logger.info(`Limited results to ${maxResults} loans`);
    }
    
    res.json({
      success: true,
      count: filteredLoans.length,
      data: filteredLoans,
      sources: sourceStats,
      filters: {
        country: country || 'all',
        source,
        category: category || 'all',
        lenderType: lenderType || 'all',
        appliedFilters: Object.keys(req.query).length
      },
      meta: {
        lastUpdated: new Date().toISOString(),
        totalAvailable: allLoans.length,
        afterFiltering: filteredLoans.length,
        validationStats: sourceStats.validation
      }
    });
    
  } catch (error) {
    logger.error('Error in GET /api/loans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch loan data',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/loans/refresh - Force refresh external data
router.post('/refresh', async (req, res) => {
  try {
    logger.info('Manual refresh requested');
    
    const { source = 'api', clearCache = 'false' } = req.body;
    let refreshedData = [];
    let validationResults = null;
    
    // Clear cache if requested
    if (clearCache === 'true') {
      await cache.clearAll();
      logger.info('Cache cleared');
    }
    
    if (source === 'api' || source === 'all') {
      // Force refresh API data
      const apiResult = await apiIntegration.fetchAllLoansFromAPIs(true);
      refreshedData = apiResult.loans || [];
      
      // Validate the refreshed data
      validationResults = validator.validateLoans(refreshedData, 'api_refresh');
      refreshedData = validationResults.validLoans;
      
      logger.info(`API refresh completed: ${refreshedData.length} valid loans`);
      
    } else if (source === 'scraper') {
      // Refresh scraped data
      refreshedData = await dataScraper.fetchAllSchemes();
      
      // Validate the scraped data
      validationResults = validator.validateLoans(refreshedData, 'scraper_refresh');
      refreshedData = validationResults.validLoans;
      
      logger.info(`Scraper refresh completed: ${refreshedData.length} valid loans`);
    }
    
    // Trigger scheduler job if requested
    if (source === 'scheduler') {
      const jobName = req.body.job || 'dailyRefresh';
      await scheduler.triggerJob(jobName);
      
      res.json({
        success: true,
        message: `Scheduler job '${jobName}' triggered successfully`,
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    res.json({
      success: true,
      message: `Successfully refreshed ${refreshedData.length} valid loans from ${source}`,
      count: refreshedData.length,
      validation: validationResults ? {
        total: validationResults.stats.total,
        valid: validationResults.stats.valid,
        invalid: validationResults.stats.invalid,
        invalidLoans: validationResults.invalidLoans.length
      } : null,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Error refreshing loan data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh loan data',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/loans/countries - Get available countries
router.get('/countries', async (req, res) => {
  try {
    // Get countries from static data
    const staticCountries = [...new Set(staticLoans?.map(loan => loan.country) || [])];
    
    // Get countries from external data
    const externalCountries = [...new Set(externalDataCache.loans.map(loan => loan.country))];
    
    // Combine and deduplicate
    const allCountries = [...new Set([...staticCountries, ...externalCountries])].sort();
    
    res.json({
      success: true,
      countries: allCountries,
      count: allCountries.length
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch countries',
      message: error.message
    });
  }
});

// GET /api/loans/stats - Get loan statistics
router.get('/stats', async (req, res) => {
  try {
    const allLoans = [...(staticLoans || []), ...externalDataCache.loans];
    
    const stats = {
      totalLoans: allLoans.length,
      byCountry: {},
      byLenderType: {},
      byCategory: {},
      lastUpdated: externalDataCache.lastFetched
    };
    
    // Calculate statistics
    allLoans.forEach(loan => {
      // By country
      stats.byCountry[loan.country] = (stats.byCountry[loan.country] || 0) + 1;
      
      // By lender type
      stats.byLenderType[loan.lenderType] = (stats.byLenderType[loan.lenderType] || 0) + 1;
      
      // By category
      stats.byCategory[loan.category] = (stats.byCategory[loan.category] || 0) + 1;
    });
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

// GET /api/loans/system/status - Get system status including scheduler, cache, etc.
router.get('/system/status', async (req, res) => {
  try {
    const status = {
      scheduler: scheduler.getStatus(),
      cache: await cache.getStats(),
      validation: validator.getStats(),
      apiIntegration: {
        enabledSources: apiIntegration.enabledSources,
        rateLimits: apiIntegration.rateLimits
      },
      system: {
        nodeVersion: process.version,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: new Date().toISOString()
      }
    };
    
    res.json({
      success: true,
      status
    });
    
  } catch (error) {
    logger.error('Error getting system status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get system status',
      message: error.message
    });
  }
});

// POST /api/loans/system/cache/clear - Clear cache
router.post('/system/cache/clear', async (req, res) => {
  try {
    await cache.clearAll();
    logger.info('Cache cleared via API');
    
    res.json({
      success: true,
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Error clearing cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache',
      message: error.message
    });
  }
});

// GET /api/loans/validation/test - Test validation with sample data
router.get('/validation/test', async (req, res) => {
  try {
    const sampleLoan = validator.createSampleLoan();
    const validationResult = validator.validateLoan(sampleLoan, 'test');
    
    res.json({
      success: true,
      sampleLoan,
      validationResult,
      validationStats: validator.getStats()
    });
    
  } catch (error) {
    logger.error('Error testing validation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test validation',
      message: error.message
    });
  }
});

// Helper functions

// Apply filters to loan data
function applyFilters(loans, filters) {
  let filtered = [...loans];
  
  // Filter by country
  if (filters.country && filters.country !== 'All Countries' && filters.country !== 'all') {
    filtered = filtered.filter(loan => 
      loan.country && loan.country.toLowerCase() === filters.country.toLowerCase()
    );
  }
  
  // Filter by category
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(loan => 
      loan.category && loan.category.toLowerCase() === filters.category.toLowerCase()
    );
  }
  
  // Filter by lender type
  if (filters.lenderType && filters.lenderType !== 'all') {
    filtered = filtered.filter(loan => 
      loan.lenderType && loan.lenderType.toLowerCase() === filters.lenderType.toLowerCase()
    );
  }
  
  // Filter by loan amount range
  if (filters.minAmount || filters.maxAmount) {
    filtered = filtered.filter(loan => {
      if (!loan.loanAmount) return false;
      
      const loanMin = loan.loanAmount.min || 0;
      const loanMax = loan.loanAmount.max || Infinity;
      
      // Check if requested amount falls within loan range
      if (filters.minAmount && filters.maxAmount) {
        return loanMin <= filters.maxAmount && loanMax >= filters.minAmount;
      } else if (filters.minAmount) {
        return loanMax >= filters.minAmount;
      } else if (filters.maxAmount) {
        return loanMin <= filters.maxAmount;
      }
      
      return true;
    });
  }
  
  // Filter by collateral requirement
  if (filters.collateralFree === true) {
    filtered = filtered.filter(loan => loan.collateral === false);
  }
  
  return filtered;
}

// Remove duplicate loans based on key attributes
function removeDuplicateLoans(loans) {
  const seen = new Map();
  
  return loans.filter(loan => {
    // Create a unique key based on name, lender, and country
    const key = `${loan.name.toLowerCase().trim()}-${loan.lender.toLowerCase().trim()}-${loan.country.toLowerCase().trim()}`;
    
    if (seen.has(key)) {
      // Keep the more recently updated loan
      const existing = seen.get(key);
      const existingDate = new Date(existing.lastUpdated || 0);
      const currentDate = new Date(loan.lastUpdated || 0);
      
      if (currentDate > existingDate) {
        seen.set(key, loan);
        return true;
      }
      return false;
    }
    
    seen.set(key, loan);
    return true;
  });
}

// Get scraped data (legacy function)
async function getScrapedData(country) {
  try {
    // Check cache first
    const cached = await cache.get('scraped_data', { country: country || 'all' });
    if (cached) {
      return cached;
    }
    
    // Fetch fresh scraped data
    const scrapedLoans = await dataScraper.fetchAllSchemes();
    
    // Filter by country if specified
    let filtered = scrapedLoans;
    if (country && country !== 'All Countries') {
      filtered = scrapedLoans.filter(loan => loan.country === country);
    }
    
    // Cache the results
    await cache.set('scraped_data', filtered, { country: country || 'all' });
    
    return filtered;
    
  } catch (error) {
    logger.error('Error getting scraped data:', error);
    return [];
  }
}

module.exports = router;
