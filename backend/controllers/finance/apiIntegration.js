const axios = require('axios');
const winston = require('winston');
const CacheService = require('./cacheService');
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
    new winston.transports.File({ filename: process.env.LOG_FILE || 'logs/api_integration.log' })
  ]
});

class APIIntegration {
  constructor() {
    this.cache = new CacheService();
    
    this.apiKeys = {
      indiaDataGov: process.env.INDIA_DATA_GOV_API_KEY,
      alphaVantage: process.env.ALPHA_VANTAGE_API_KEY,
      rapidApi: process.env.RAPIDAPI_KEY,
      plaid: process.env.PLAID_CLIENT_ID,
      plaidSecret: process.env.PLAID_SECRET
    };
    
    this.endpoints = {
      indiaDataGov: process.env.INDIA_DATA_GOV_BASE_URL || 'https://api.data.gov.in/resource',
      usSBA: process.env.USA_SBA_API_BASE || 'https://api.sba.gov',
      ukGov: process.env.UK_GOV_API_BASE || 'https://www.gov.uk/api',
      alphaVantage: 'https://www.alphavantage.co/query',
      rapidApiLoans: `https://${process.env.RAPIDAPI_HOST || 'loan-data-api.p.rapidapi.com'}`
    };
    
    // Rate limiting tracking
    this.rateLimits = {
      alphaVantage: { used: 0, limit: parseInt(process.env.ALPHA_VANTAGE_DAILY_LIMIT) || 500, resetTime: Date.now() + 24*60*60*1000 },
      rapidApi: { used: 0, limit: parseInt(process.env.RAPIDAPI_DAILY_LIMIT) || 1000, resetTime: Date.now() + 24*60*60*1000 },
      indiaDataGov: { used: 0, limit: parseInt(process.env.INDIA_DATA_GOV_DAILY_LIMIT) || 1000, resetTime: Date.now() + 24*60*60*1000 }
    };
    
    // Feature flags
    this.enabledSources = {
      indiaDataGov: process.env.ENABLE_INDIA_DATA_GOV === 'true',
      usaSBA: process.env.ENABLE_USA_SBA === 'true',
      alphaVantage: process.env.ENABLE_ALPHA_VANTAGE === 'true',
      rapidApi: process.env.ENABLE_RAPIDAPI === 'true'
    };
  }
  
  // Check if we can make API calls within rate limits
  canMakeRequest(source) {
    const rateLimit = this.rateLimits[source];
    if (!rateLimit) return true;
    
    // Reset rate limit if time has passed
    if (Date.now() > rateLimit.resetTime) {
      rateLimit.used = 0;
      rateLimit.resetTime = Date.now() + 24*60*60*1000;
    }
    
    return rateLimit.used < rateLimit.limit;
  }
  
  // Increment rate limit counter
  incrementRateLimit(source) {
    if (this.rateLimits[source]) {
      this.rateLimits[source].used++;
    }
  }

  // Fetch Indian government schemes from data.gov.in
  async fetchIndianGovernmentSchemes() {
    if (!this.enabledSources.indiaDataGov) {
      logger.info('India Data.gov.in source is disabled');
      return [];
    }
    
    if (!this.canMakeRequest('indiaDataGov')) {
      logger.warn('India Data.gov.in rate limit exceeded');
      return [];
    }
    
    try {
      logger.info('Fetching Indian government schemes from data.gov.in');
      
      // Try multiple endpoints for Indian government data
      const endpoints = [
        '/financial-schemes',
        '/loan-schemes', 
        '/government-schemes'
      ];
      
      let allSchemes = [];
      
      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(`${this.endpoints.indiaDataGov}${endpoint}`, {
            params: {
              api_key: this.apiKeys.indiaDataGov,
              format: 'json',
              limit: 50
            },
            timeout: 10000
          });
          
          this.incrementRateLimit('indiaDataGov');
          
          const schemes = response.data.records?.map(scheme => ({
            id: `gov-india-${scheme.scheme_id || scheme.id || Math.random().toString(36).substr(2, 9)}`,
            name: scheme.scheme_name || scheme.name || 'Unknown Scheme',
            lender: scheme.implementing_agency || scheme.ministry || 'Government of India',
            lenderType: 'government',
            category: this.mapCategory(scheme.category || scheme.type),
            country: 'India',
            interestRate: scheme.interest_rate || scheme.rate || 'Variable',
            loanAmount: {
              min: this.parseAmount(scheme.min_amount || scheme.minimum_loan),
              max: this.parseAmount(scheme.max_amount || scheme.maximum_loan)
            },
            repaymentTerm: {
              min: this.parseMonths(scheme.min_tenure),
              max: this.parseMonths(scheme.max_tenure)
            },
            processingFee: scheme.processing_fee || '0%',
            collateral: scheme.collateral_required === 'yes' || scheme.secured === 'true',
            description: scheme.description || scheme.details || 'Government scheme details not available',
            benefits: this.parseList(scheme.benefits || scheme.features),
            documents: this.parseList(scheme.required_documents || scheme.documents),
            eligibility: {
              minAge: parseInt(scheme.min_age) || 18,
              maxAge: parseInt(scheme.max_age) || 65,
              minIncome: this.parseAmount(scheme.min_income) || 0,
              creditScoreMin: parseInt(scheme.min_credit_score) || 0,
              organizationType: this.parseOrganizationTypes(scheme.eligible_entities),
              businessAge: this.parseMonths(scheme.min_business_age) || 0,
              sector: this.parseList(scheme.eligible_sectors)
            },
            applicationUrl: scheme.application_url || scheme.portal_link || 'https://www.india.gov.in/',
            processingTime: scheme.processing_time || 'As per guidelines',
            features: this.parseList(scheme.key_features || scheme.highlights),
            lastUpdated: new Date().toISOString()
          })) || [];
          
          allSchemes.push(...schemes);
          logger.info(`Fetched ${schemes.length} schemes from ${endpoint}`);
          
        } catch (endpointError) {
          logger.warn(`Failed to fetch from ${endpoint}:`, endpointError.message);
          // Continue to next endpoint
        }
      }
      
      // Fallback to static Indian government schemes if API fails
      if (allSchemes.length === 0) {
        logger.info('Using fallback Indian government schemes data');
        allSchemes = this.getFallbackIndianSchemes();
      }
      
      logger.info(`Total Indian schemes fetched: ${allSchemes.length}`);
      return allSchemes;
      
    } catch (error) {
      logger.error('Error fetching Indian schemes:', error.message);
      return this.getFallbackIndianSchemes();
    }
  }

  // Helper methods for data parsing
  parseAmount(amountStr) {
    if (!amountStr) return 0;
    const amount = typeof amountStr === 'string' ? amountStr.replace(/[^\d.-]/g, '') : amountStr;
    return parseInt(amount) || 0;
  }
  
  parseMonths(termStr) {
    if (!termStr) return 0;
    const term = typeof termStr === 'string' ? termStr.replace(/[^\d.-]/g, '') : termStr;
    return parseInt(term) || 0;
  }
  
  parseList(listStr) {
    if (!listStr) return [];
    if (Array.isArray(listStr)) return listStr;
    return listStr.split(',').map(item => item.trim()).filter(item => item);
  }
  
  mapCategory(category) {
    if (!category) return 'general';
    const cat = category.toLowerCase();
    if (cat.includes('startup') || cat.includes('entrepreneur')) return 'startup';
    if (cat.includes('sme') || cat.includes('business') || cat.includes('msme')) return 'sme';
    if (cat.includes('education') || cat.includes('student')) return 'education';
    if (cat.includes('agriculture') || cat.includes('farmer')) return 'agriculture';
    if (cat.includes('ngo') || cat.includes('non-profit')) return 'ngo';
    return 'general';
  }
  
  parseOrganizationTypes(typesStr) {
    if (!typesStr) return ['individual'];
    const types = this.parseList(typesStr);
    return types.map(type => {
      const t = type.toLowerCase();
      if (t.includes('startup')) return 'startup';
      if (t.includes('sme') || t.includes('business')) return 'sme';
      if (t.includes('ngo')) return 'ngo';
      if (t.includes('farmer')) return 'farmer';
      if (t.includes('cooperative')) return 'cooperative';
      return 'individual';
    });
  }
  
  getFallbackIndianSchemes() {
    return [
      {
        id: "fallback-mudra-1",
        name: "MUDRA Yojana - Shishu",
        lender: "MUDRA (Government)",
        lenderType: "government",
        category: "sme",
        country: "India",
        interestRate: "8.5-12%",
        loanAmount: { min: 10000, max: 50000 },
        repaymentTerm: { min: 12, max: 60 },
        processingFee: "0%",
        collateral: false,
        description: "Micro-credit for small businesses and entrepreneurs",
        benefits: ["No collateral", "Subsidized interest", "Easy documentation"],
        documents: ["Aadhaar card", "Business registration", "Bank statements"],
        eligibility: {
          minAge: 18, maxAge: 65, minIncome: 100000, creditScoreMin: 0,
          organizationType: ["sme", "individual"], businessAge: 0,
          sector: ["manufacturing", "trading", "services"]
        },
        applicationUrl: "https://www.mudra.org.in/",
        processingTime: "15-30 days",
        features: ["Government guarantee", "Flexible repayment"],
        lastUpdated: new Date().toISOString()
      }
    ];
  }
  
  // Fetch US SBA loans
  async fetchUSASBALoans() {
    if (!this.enabledSources.usaSBA) {
      logger.info('USA SBA source is disabled');
      return [];
    }
    
    try {
      logger.info('Fetching US SBA loans');
      
      // SBA API endpoints (these are example endpoints - real SBA API structure may differ)
      const endpoints = [
        '/loans/7a',
        '/loans/504', 
        '/loans/microloans'
      ];
      
      let allLoans = [];
      
      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(`${this.endpoints.usSBA}${endpoint}`, {
            headers: {
              'Accept': 'application/json',
              'User-Agent': process.env.SCRAPING_USER_AGENT || 'LoanCompare-App/1.0'
            },
            params: {
              format: 'json',
              limit: 25
            },
            timeout: 15000
          });
          
          const loans = response.data?.programs?.map(loan => ({
            id: `sba-${loan.program_id || Math.random().toString(36).substr(2, 9)}`,
            name: loan.program_name || loan.name || 'SBA Loan Program',
            lender: 'U.S. Small Business Administration',
            lenderType: 'government',
            category: this.mapCategory(loan.loan_type || loan.category) || 'sme',
            country: 'United States',
            interestRate: loan.interest_rate || `${loan.min_rate || 5}-${loan.max_rate || 13}%`,
            loanAmount: {
              min: this.parseAmount(loan.min_loan_amount) || 500000,
              max: this.parseAmount(loan.max_loan_amount) || 50000000
            },
            repaymentTerm: {
              min: parseInt(loan.min_term) || 12,
              max: parseInt(loan.max_term) || 300
            },
            processingFee: loan.processing_fee || '3%',
            collateral: loan.collateral_required !== 'false',
            description: loan.description || 'SBA guaranteed loan program',
            benefits: this.parseList(loan.benefits) || ['Government guarantee', 'Lower down payments'],
            documents: this.parseList(loan.required_documents) || ['Business plan', 'Financial statements'],
            eligibility: {
              minAge: 18,
              maxAge: 70,
              minIncome: this.parseAmount(loan.min_revenue) || 500000,
              creditScoreMin: parseInt(loan.min_credit_score) || 680,
              organizationType: this.parseOrganizationTypes(loan.eligible_entities) || ['sme', 'startup'],
              businessAge: this.parseMonths(loan.min_business_age) || 24,
              sector: this.parseList(loan.eligible_sectors) || ['manufacturing', 'services']
            },
            applicationUrl: loan.application_url || 'https://www.sba.gov/funding-programs/loans',
            processingTime: loan.processing_time || '30-90 days',
            features: this.parseList(loan.features) || ['Government guarantee', 'Competitive rates'],
            lastUpdated: new Date().toISOString()
          })) || [];
          
          allLoans.push(...loans);
          logger.info(`Fetched ${loans.length} loans from SBA ${endpoint}`);
          
        } catch (endpointError) {
          logger.warn(`Failed to fetch from SBA ${endpoint}:`, endpointError.message);
        }
      }
      
      // Fallback to static SBA data if API fails
      if (allLoans.length === 0) {
        logger.info('Using fallback SBA loan data');
        allLoans = this.getFallbackSBALoans();
      }
      
      logger.info(`Total SBA loans fetched: ${allLoans.length}`);
      return allLoans;
      
    } catch (error) {
      logger.error('Error fetching SBA loans:', error.message);
      return this.getFallbackSBALoans();
    }
  }
  
  getFallbackSBALoans() {
    return [
      {
        id: "fallback-sba-7a",
        name: "SBA 7(a) Loan Program",
        lender: "U.S. Small Business Administration",
        lenderType: "government",
        category: "sme",
        country: "United States",
        interestRate: "5-13%",
        loanAmount: { min: 500000, max: 500000000 },
        repaymentTerm: { min: 12, max: 300 },
        processingFee: "3%",
        collateral: true,
        description: "Government-backed loans for small businesses",
        benefits: ["Government guarantee", "Lower down payments", "Flexible terms"],
        documents: ["Business plan", "Financial statements", "Tax returns"],
        eligibility: {
          minAge: 18, maxAge: 70, minIncome: 500000, creditScoreMin: 680,
          organizationType: ["sme", "startup"], businessAge: 24,
          sector: ["manufacturing", "retail", "services"]
        },
        applicationUrl: "https://www.sba.gov/funding-programs/loans",
        processingTime: "30-90 days",
        features: ["85% government guarantee", "Competitive rates"],
        lastUpdated: new Date().toISOString()
      }
    ];
  }

  // Fetch from RapidAPI loan marketplace
  async fetchRapidAPILoans() {
    if (!this.apiKeys.rapidApi) {
      console.log('RapidAPI key not found, skipping...');
      return [];
    }

    try {
      const response = await axios.get(`${this.endpoints.rapidApiLoans}/loans`, {
        headers: {
          'X-RapidAPI-Key': this.apiKeys.rapidApi,
          'X-RapidAPI-Host': 'loan-data-api.p.rapidapi.com'
        },
        params: {
          country: 'all',
          limit: 100
        }
      });

      return response.data?.loans?.map(loan => ({
        id: `rapid-${loan.id}`,
        name: loan.name,
        lender: loan.lender,
        lenderType: loan.lender_type,
        category: loan.category,
        country: loan.country,
        interestRate: loan.interest_rate,
        loanAmount: loan.amount_range,
        description: loan.description,
        applicationUrl: loan.apply_url,
        lastUpdated: new Date().toISOString()
      })) || [];
    } catch (error) {
      console.error('Error fetching RapidAPI loans:', error);
      return [];
    }
  }

  // Fetch financial market data (interest rates, etc.)
  async fetchMarketData() {
    if (!this.apiKeys.alphaVantage) {
      return null;
    }

    try {
      const response = await axios.get(this.endpoints.alphaVantage, {
        params: {
          function: 'FEDERAL_FUNDS_RATE',
          interval: 'monthly',
          apikey: this.apiKeys.alphaVantage
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching market data:', error);
      return null;
    }
  }

  // Fetch RapidAPI loans (updated implementation)
  async fetchRapidAPILoans() {
    if (!this.enabledSources.rapidApi || !this.apiKeys.rapidApi) {
      logger.info('RapidAPI source is disabled or API key not provided');
      return [];
    }
    
    if (!this.canMakeRequest('rapidApi')) {
      logger.warn('RapidAPI rate limit exceeded');
      return [];
    }
    
    // Check cache first
    const cached = await this.cache.get('rapidapi', {});
    if (cached) {
      return cached;
    }
    
    try {
      logger.info('Fetching loans from RapidAPI');
      
      const response = await axios.get(`${this.endpoints.rapidApiLoans}/loans`, {
        headers: {
          'X-RapidAPI-Key': this.apiKeys.rapidApi,
          'X-RapidAPI-Host': process.env.RAPIDAPI_HOST || 'loan-data-api.p.rapidapi.com'
        },
        params: {
          country: 'all',
          limit: 100
        },
        timeout: 10000
      });
      
      this.incrementRateLimit('rapidApi');
      
      const loans = response.data?.loans?.map(loan => ({
        id: `rapid-${loan.id || Math.random().toString(36).substr(2, 9)}`,
        name: loan.name || 'Loan Product',
        lender: loan.lender || 'Financial Institution',
        lenderType: loan.lender_type || 'bank',
        category: this.mapCategory(loan.category),
        country: loan.country || 'Unknown',
        interestRate: loan.interest_rate || 'Variable',
        loanAmount: {
          min: this.parseAmount(loan.min_amount),
          max: this.parseAmount(loan.max_amount)
        },
        repaymentTerm: {
          min: this.parseMonths(loan.min_term),
          max: this.parseMonths(loan.max_term)
        },
        processingFee: loan.processing_fee || 'Variable',
        collateral: loan.collateral_required === true,
        description: loan.description || 'Loan product from financial institution',
        benefits: this.parseList(loan.benefits),
        documents: this.parseList(loan.required_documents),
        eligibility: {
          minAge: parseInt(loan.min_age) || 18,
          maxAge: parseInt(loan.max_age) || 65,
          minIncome: this.parseAmount(loan.min_income) || 0,
          creditScoreMin: parseInt(loan.min_credit_score) || 0,
          organizationType: this.parseOrganizationTypes(loan.eligible_types) || ['individual'],
          businessAge: this.parseMonths(loan.min_business_age) || 0,
          sector: this.parseList(loan.eligible_sectors) || ['all']
        },
        applicationUrl: loan.apply_url || loan.website || '#',
        processingTime: loan.processing_time || 'Variable',
        features: this.parseList(loan.features),
        lastUpdated: new Date().toISOString()
      })) || [];
      
      // Cache the results
      await this.cache.set('rapidapi', loans, {});
      
      logger.info(`Fetched ${loans.length} loans from RapidAPI`);
      return loans;
      
    } catch (error) {
      logger.error('Error fetching RapidAPI loans:', error.message);
      return [];
    }
  }
  
  // Fetch market data
  async fetchMarketData() {
    if (!this.enabledSources.alphaVantage || !this.apiKeys.alphaVantage) {
      return null;
    }
    
    if (!this.canMakeRequest('alphaVantage')) {
      logger.warn('Alpha Vantage rate limit exceeded');
      return null;
    }
    
    try {
      const response = await axios.get(this.endpoints.alphaVantage, {
        params: {
          function: 'FEDERAL_FUNDS_RATE',
          interval: 'monthly',
          apikey: this.apiKeys.alphaVantage
        },
        timeout: 10000
      });
      
      this.incrementRateLimit('alphaVantage');
      return response.data;
      
    } catch (error) {
      logger.error('Error fetching market data:', error.message);
      return null;
    }
  }
  
  // Main function to fetch all available data with caching
  async fetchAllLoansFromAPIs(forceRefresh = false) {
    try {
      logger.info('Starting to fetch loans from all API sources');
      
      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cachedData = await this.cache.get('all_apis', {});
        if (cachedData) {
          logger.info('Returning cached API data');
          return cachedData;
        }
      }
      
      const results = {
        loans: [],
        marketData: null,
        fetchedAt: new Date().toISOString(),
        sources: {
          indianSchemes: 0,
          sbaLoans: 0,
          rapidApiLoans: 0,
          totalEnabled: 0
        },
        errors: []
      };
      
      // Fetch from enabled sources concurrently
      const fetchPromises = [];
      
      if (this.enabledSources.indiaDataGov) {
        fetchPromises.push(
          this.fetchIndianGovernmentSchemes()
            .then(loans => ({ source: 'indianSchemes', loans }))
            .catch(error => ({ source: 'indianSchemes', loans: [], error: error.message }))
        );
        results.sources.totalEnabled++;
      }
      
      if (this.enabledSources.usaSBA) {
        fetchPromises.push(
          this.fetchUSASBALoans()
            .then(loans => ({ source: 'sbaLoans', loans }))
            .catch(error => ({ source: 'sbaLoans', loans: [], error: error.message }))
        );
        results.sources.totalEnabled++;
      }
      
      if (this.enabledSources.rapidApi) {
        fetchPromises.push(
          this.fetchRapidAPILoans()
            .then(loans => ({ source: 'rapidApiLoans', loans }))
            .catch(error => ({ source: 'rapidApiLoans', loans: [], error: error.message }))
        );
        results.sources.totalEnabled++;
      }
      
      // Fetch market data separately
      if (this.enabledSources.alphaVantage) {
        fetchPromises.push(
          this.fetchMarketData()
            .then(data => ({ source: 'marketData', data }))
            .catch(error => ({ source: 'marketData', data: null, error: error.message }))
        );
      }
      
      // Wait for all promises to complete
      const fetchResults = await Promise.all(fetchPromises);
      
      // Process results
      fetchResults.forEach(result => {
        if (result.source === 'marketData') {
          results.marketData = result.data;
        } else {
          results.loans.push(...result.loans);
          results.sources[result.source] = result.loans.length;
        }
        
        if (result.error) {
          results.errors.push({ source: result.source, error: result.error });
        }
      });
      
      // Remove duplicates based on name and lender
      results.loans = this.removeDuplicateLoans(results.loans);
      
      // Cache the results for 1 hour (shorter than individual source cache)
      await this.cache.set('all_apis', results, {}, 60 * 60 * 1000);
      
      logger.info(`Successfully fetched ${results.loans.length} loans from ${results.sources.totalEnabled} API sources`);
      
      if (results.errors.length > 0) {
        logger.warn('Some API sources had errors:', results.errors);
      }
      
      return results;
      
    } catch (error) {
      logger.error('Error in fetchAllLoansFromAPIs:', error.message);
      return {
        loans: [],
        marketData: null,
        error: error.message,
        fetchedAt: new Date().toISOString(),
        sources: { totalEnabled: 0 },
        errors: [{ source: 'main', error: error.message }]
      };
    }
  }
  
  // Helper method to remove duplicate loans
  removeDuplicateLoans(loans) {
    const seen = new Map();
    return loans.filter(loan => {
      const key = `${loan.name}-${loan.lender}-${loan.country}`;
      if (seen.has(key)) {
        return false;
      }
      seen.set(key, true);
      return true;
    });
  }

  // Fetch specific country data
  async fetchLoansByCountry(country) {
    const countryMethods = {
      'India': () => this.fetchIndianGovernmentSchemes(),
      'United States': () => this.fetchUSASBALoans(),
      'All': () => this.fetchAllLoansFromAPIs()
    };

    const method = countryMethods[country];
    if (method) {
      return await method();
    } else {
      console.log(`No specific API method for country: ${country}`);
      return [];
    }
  }
}

module.exports = APIIntegration;