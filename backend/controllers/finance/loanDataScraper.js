const axios = require('axios');
const cheerio = require('cheerio');

class LoanDataScraper {
  constructor() {
    this.sources = {
      india: {
        mudra: 'https://www.mudra.org.in/',
        startupIndia: 'https://www.startupindia.gov.in/',
        msme: 'https://msme.gov.in/',
        sbi: 'https://sbi.co.in/business-banking/',
        hdfc: 'https://www.hdfcbank.com/business/',
        icici: 'https://www.icicibank.com/business-banking/'
      },
      usa: {
        sba: 'https://www.sba.gov/funding-programs/',
        bankOfAmerica: 'https://www.bankofamerica.com/smallbusiness/',
        chase: 'https://www.chase.com/business/'
      },
      uk: {
        britishBusinessBank: 'https://www.british-business-bank.co.uk/',
        startuploans: 'https://www.startuploans.co.uk/'
      }
    };
  }

  async scrapeIndianGovernmentSchemes() {
    const schemes = [];
    
    try {
      // Scrape MUDRA schemes
      const mudraResponse = await axios.get(this.sources.india.mudra);
      const mudra$ = cheerio.load(mudraResponse.data);
      
      // Extract MUDRA scheme details
      mudra$('.scheme-card').each((i, element) => {
        const scheme = {
          id: `mudra-${i}`,
          name: mudra$(element).find('.scheme-name').text(),
          lender: 'MUDRA (Government)',
          lenderType: 'government',
          category: 'sme',
          country: 'India',
          interestRate: mudra$(element).find('.interest-rate').text(),
          description: mudra$(element).find('.description').text(),
          applicationUrl: mudra$(element).find('.apply-link').attr('href')
        };
        schemes.push(scheme);
      });

      // Scrape Startup India schemes
      const startupResponse = await axios.get(this.sources.india.startupIndia);
      const startup$ = cheerio.load(startupResponse.data);
      
      startup$('.funding-scheme').each((i, element) => {
        const scheme = {
          id: `startup-india-${i}`,
          name: startup$(element).find('.scheme-title').text(),
          lender: 'Government of India',
          lenderType: 'government',
          category: 'startup',
          country: 'India',
          description: startup$(element).find('.scheme-desc').text(),
          applicationUrl: startup$(element).find('.apply-btn').attr('href')
        };
        schemes.push(scheme);
      });

    } catch (error) {
      console.error('Error scraping Indian schemes:', error);
    }
    
    return schemes;
  }

  async scrapeBankLoans() {
    const loans = [];
    
    try {
      // Scrape SBI business loans
      const sbiResponse = await axios.get(this.sources.india.sbi);
      const sbi$ = cheerio.load(sbiResponse.data);
      
      sbi$('.loan-product').each((i, element) => {
        const loan = {
          id: `sbi-${i}`,
          name: sbi$(element).find('.product-name').text(),
          lender: 'State Bank of India',
          lenderType: 'bank',
          category: 'sme',
          country: 'India',
          interestRate: sbi$(element).find('.rate').text(),
          description: sbi$(element).find('.product-desc').text()
        };
        loans.push(loan);
      });

    } catch (error) {
      console.error('Error scraping bank loans:', error);
    }
    
    return loans;
  }

  async scrapeUSASchemes() {
    const schemes = [];
    
    try {
      // Scrape SBA loans
      const sbaResponse = await axios.get(this.sources.usa.sba);
      const sba$ = cheerio.load(sbaResponse.data);
      
      sba$('.funding-program').each((i, element) => {
        const scheme = {
          id: `sba-${i}`,
          name: sba$(element).find('.program-name').text(),
          lender: 'US Small Business Administration',
          lenderType: 'government',
          country: 'United States',
          description: sba$(element).find('.program-desc').text(),
          applicationUrl: sba$(element).find('.apply-link').attr('href')
        };
        schemes.push(scheme);
      });

    } catch (error) {
      console.error('Error scraping USA schemes:', error);
    }
    
    return schemes;
  }

  async fetchAllSchemes() {
    const allSchemes = [];
    
    try {
      // Fetch from all sources concurrently
      const [indianSchemes, bankLoans, usaSchemes] = await Promise.all([
        this.scrapeIndianGovernmentSchemes(),
        this.scrapeBankLoans(),
        this.scrapeUSASchemes()
      ]);
      
      allSchemes.push(...indianSchemes, ...bankLoans, ...usaSchemes);
      
      // Cache the results
      await this.cacheResults(allSchemes);
      
      return allSchemes;
    } catch (error) {
      console.error('Error fetching all schemes:', error);
      return [];
    }
  }

  async cacheResults(schemes) {
    // Cache results to reduce API calls
    const fs = require('fs');
    const cacheFile = '../data/cached_schemes.json';
    
    const cacheData = {
      timestamp: new Date().toISOString(),
      schemes: schemes
    };
    
    fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));
  }

  async getCachedResults() {
    try {
      const fs = require('fs');
      const cacheFile = '../data/cached_schemes.json';
      
      if (fs.existsSync(cacheFile)) {
        const cacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        const cacheAge = Date.now() - new Date(cacheData.timestamp).getTime();
        
        // Return cached data if less than 24 hours old
        if (cacheAge < 24 * 60 * 60 * 1000) {
          return cacheData.schemes;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  }
}

module.exports = LoanDataScraper;