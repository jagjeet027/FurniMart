const winston = require('winston');
require('dotenv').config();

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: process.env.LOG_FILE || 'logs/validation.log' })
  ]
});

class ValidationService {
  constructor() {
    // Define the standard loan schema that all external data should conform to
    this.loanSchema = {
      id: { type: 'string', required: true },
      name: { type: 'string', required: true, minLength: 1, maxLength: 200 },
      lender: { type: 'string', required: true, minLength: 1, maxLength: 100 },
      lenderType: { 
        type: 'string', 
        required: true, 
        enum: ['government', 'bank', 'nbfc', 'private', 'fintech', 'other'] 
      },
      category: { 
        type: 'string', 
        required: true, 
        enum: ['startup', 'sme', 'ngo', 'education', 'agriculture', 'personal', 'home', 'general'] 
      },
      country: { type: 'string', required: true, minLength: 1, maxLength: 50 },
      interestRate: { type: 'string', required: true },
      loanAmount: {
        type: 'object',
        required: true,
        properties: {
          min: { type: 'number', required: true, minimum: 0 },
          max: { type: 'number', required: true, minimum: 0 }
        }
      },
      repaymentTerm: {
        type: 'object',
        required: false,
        properties: {
          min: { type: 'number', required: true, minimum: 0 },
          max: { type: 'number', required: true, minimum: 0 }
        }
      },
      processingFee: { type: 'string', required: false },
      collateral: { type: 'boolean', required: true },
      description: { type: 'string', required: true, minLength: 10, maxLength: 1000 },
      benefits: { 
        type: 'array', 
        required: false, 
        items: { type: 'string' } 
      },
      documents: { 
        type: 'array', 
        required: false, 
        items: { type: 'string' } 
      },
      eligibility: {
        type: 'object',
        required: true,
        properties: {
          minAge: { type: 'number', required: true, minimum: 16, maximum: 100 },
          maxAge: { type: 'number', required: true, minimum: 16, maximum: 100 },
          minIncome: { type: 'number', required: true, minimum: 0 },
          creditScoreMin: { type: 'number', required: true, minimum: 0, maximum: 900 },
          organizationType: { 
            type: 'array', 
            required: true, 
            items: { 
              type: 'string', 
              enum: ['startup', 'sme', 'ngo', 'individual', 'institution', 'farmer', 'cooperative'] 
            }
          },
          businessAge: { type: 'number', required: true, minimum: 0 },
          sector: { 
            type: 'array', 
            required: true, 
            items: { type: 'string' } 
          }
        }
      },
      applicationUrl: { type: 'string', required: true, pattern: '^https?://' },
      processingTime: { type: 'string', required: false },
      features: { 
        type: 'array', 
        required: false, 
        items: { type: 'string' } 
      },
      lastUpdated: { type: 'string', required: true }
    };

    // Statistics for validation results
    this.validationStats = {
      totalProcessed: 0,
      valid: 0,
      invalid: 0,
      normalized: 0,
      errors: []
    };
  }

  // Validate a single loan object
  validateLoan(loan, source = 'unknown') {
    const errors = [];
    const warnings = [];

    try {
      // Check if loan is an object
      if (!loan || typeof loan !== 'object') {
        errors.push('Loan must be an object');
        return { isValid: false, errors, warnings, normalizedLoan: null };
      }

      // Deep clone the loan to avoid modifying the original
      const normalizedLoan = JSON.parse(JSON.stringify(loan));

      // Validate each field according to schema
      this._validateField(normalizedLoan, 'id', this.loanSchema.id, errors, warnings);
      this._validateField(normalizedLoan, 'name', this.loanSchema.name, errors, warnings);
      this._validateField(normalizedLoan, 'lender', this.loanSchema.lender, errors, warnings);
      this._validateField(normalizedLoan, 'lenderType', this.loanSchema.lenderType, errors, warnings);
      this._validateField(normalizedLoan, 'category', this.loanSchema.category, errors, warnings);
      this._validateField(normalizedLoan, 'country', this.loanSchema.country, errors, warnings);
      this._validateField(normalizedLoan, 'interestRate', this.loanSchema.interestRate, errors, warnings);
      this._validateField(normalizedLoan, 'collateral', this.loanSchema.collateral, errors, warnings);
      this._validateField(normalizedLoan, 'description', this.loanSchema.description, errors, warnings);
      this._validateField(normalizedLoan, 'applicationUrl', this.loanSchema.applicationUrl, errors, warnings);
      this._validateField(normalizedLoan, 'lastUpdated', this.loanSchema.lastUpdated, errors, warnings);

      // Validate complex objects
      this._validateLoanAmount(normalizedLoan, errors, warnings);
      this._validateRepaymentTerm(normalizedLoan, errors, warnings);
      this._validateEligibility(normalizedLoan, errors, warnings);
      this._validateArrayFields(normalizedLoan, errors, warnings);

      // Normalize the loan data
      this._normalizeLoan(normalizedLoan, warnings);

      const isValid = errors.length === 0;

      if (isValid) {
        this.validationStats.valid++;
      } else {
        this.validationStats.invalid++;
        this.validationStats.errors.push({
          source,
          loanId: loan.id || 'unknown',
          errors: [...errors],
          warnings: [...warnings]
        });
      }

      this.validationStats.totalProcessed++;

      return {
        isValid,
        errors,
        warnings,
        normalizedLoan: isValid ? normalizedLoan : null
      };

    } catch (error) {
      errors.push(`Validation error: ${error.message}`);
      this.validationStats.invalid++;
      this.validationStats.totalProcessed++;

      return {
        isValid: false,
        errors,
        warnings,
        normalizedLoan: null
      };
    }
  }

  // Validate multiple loans
  validateLoans(loans, source = 'unknown') {
    if (!Array.isArray(loans)) {
      logger.error('validateLoans expects an array of loans');
      return { validLoans: [], invalidLoans: [], stats: { total: 0, valid: 0, invalid: 0 } };
    }

    const validLoans = [];
    const invalidLoans = [];

    loans.forEach((loan, index) => {
      const result = this.validateLoan(loan, source);
      
      if (result.isValid) {
        validLoans.push(result.normalizedLoan);
      } else {
        invalidLoans.push({
          index,
          loan,
          errors: result.errors,
          warnings: result.warnings
        });
      }
    });

    logger.info(`Validation completed for ${source}: ${validLoans.length} valid, ${invalidLoans.length} invalid out of ${loans.length} total`);

    return {
      validLoans,
      invalidLoans,
      stats: {
        total: loans.length,
        valid: validLoans.length,
        invalid: invalidLoans.length
      }
    };
  }

  // Private method to validate individual fields
  _validateField(loan, fieldName, schema, errors, warnings) {
    const value = loan[fieldName];

    // Check required fields
    if (schema.required && (value === undefined || value === null || value === '')) {
      errors.push(`Field '${fieldName}' is required`);
      return;
    }

    // Skip validation if field is not present and not required
    if (!schema.required && (value === undefined || value === null)) {
      return;
    }

    // Type validation
    if (schema.type === 'string' && typeof value !== 'string') {
      errors.push(`Field '${fieldName}' must be a string`);
      return;
    }

    if (schema.type === 'number' && typeof value !== 'number') {
      errors.push(`Field '${fieldName}' must be a number`);
      return;
    }

    if (schema.type === 'boolean' && typeof value !== 'boolean') {
      errors.push(`Field '${fieldName}' must be a boolean`);
      return;
    }

    if (schema.type === 'array' && !Array.isArray(value)) {
      errors.push(`Field '${fieldName}' must be an array`);
      return;
    }

    // String-specific validations
    if (schema.type === 'string' && typeof value === 'string') {
      if (schema.minLength && value.length < schema.minLength) {
        errors.push(`Field '${fieldName}' must be at least ${schema.minLength} characters long`);
      }
      if (schema.maxLength && value.length > schema.maxLength) {
        warnings.push(`Field '${fieldName}' is longer than recommended ${schema.maxLength} characters`);
      }
      if (schema.enum && !schema.enum.includes(value)) {
        errors.push(`Field '${fieldName}' must be one of: ${schema.enum.join(', ')}`);
      }
      if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
        errors.push(`Field '${fieldName}' does not match required pattern`);
      }
    }

    // Number-specific validations
    if (schema.type === 'number' && typeof value === 'number') {
      if (schema.minimum !== undefined && value < schema.minimum) {
        errors.push(`Field '${fieldName}' must be at least ${schema.minimum}`);
      }
      if (schema.maximum !== undefined && value > schema.maximum) {
        errors.push(`Field '${fieldName}' must not exceed ${schema.maximum}`);
      }
    }
  }

  // Validate loan amount object
  _validateLoanAmount(loan, errors, warnings) {
    if (!loan.loanAmount || typeof loan.loanAmount !== 'object') {
      errors.push('loanAmount is required and must be an object');
      return;
    }

    const { min, max } = loan.loanAmount;

    if (typeof min !== 'number' || min < 0) {
      errors.push('loanAmount.min must be a non-negative number');
    }

    if (typeof max !== 'number' || max < 0) {
      errors.push('loanAmount.max must be a non-negative number');
    }

    if (typeof min === 'number' && typeof max === 'number' && min > max) {
      errors.push('loanAmount.min cannot be greater than loanAmount.max');
    }

    // Reasonable limits check
    if (typeof max === 'number' && max > 10000000000) { // 10 billion
      warnings.push('loanAmount.max seems unusually high');
    }
  }

  // Validate repayment term object
  _validateRepaymentTerm(loan, errors, warnings) {
    if (!loan.repaymentTerm) {
      // Set default if missing
      loan.repaymentTerm = { min: 12, max: 60 };
      warnings.push('repaymentTerm was missing, set to default values');
      return;
    }

    if (typeof loan.repaymentTerm !== 'object') {
      errors.push('repaymentTerm must be an object');
      return;
    }

    const { min, max } = loan.repaymentTerm;

    if (typeof min !== 'number' || min < 0) {
      errors.push('repaymentTerm.min must be a non-negative number');
    }

    if (typeof max !== 'number' || max < 0) {
      errors.push('repaymentTerm.max must be a non-negative number');
    }

    if (typeof min === 'number' && typeof max === 'number' && min > max) {
      errors.push('repaymentTerm.min cannot be greater than repaymentTerm.max');
    }
  }

  // Validate eligibility object
  _validateEligibility(loan, errors, warnings) {
    if (!loan.eligibility || typeof loan.eligibility !== 'object') {
      errors.push('eligibility is required and must be an object');
      return;
    }

    const eligibility = loan.eligibility;

    // Validate each eligibility field
    this._validateField(loan.eligibility, 'minAge', this.loanSchema.eligibility.properties.minAge, errors, warnings);
    this._validateField(loan.eligibility, 'maxAge', this.loanSchema.eligibility.properties.maxAge, errors, warnings);
    this._validateField(loan.eligibility, 'minIncome', this.loanSchema.eligibility.properties.minIncome, errors, warnings);
    this._validateField(loan.eligibility, 'creditScoreMin', this.loanSchema.eligibility.properties.creditScoreMin, errors, warnings);
    this._validateField(loan.eligibility, 'businessAge', this.loanSchema.eligibility.properties.businessAge, errors, warnings);

    // Special validation for organizationType array
    if (!Array.isArray(eligibility.organizationType)) {
      errors.push('eligibility.organizationType must be an array');
    } else {
      const validTypes = this.loanSchema.eligibility.properties.organizationType.items.enum;
      eligibility.organizationType.forEach((type, index) => {
        if (!validTypes.includes(type)) {
          errors.push(`eligibility.organizationType[${index}] must be one of: ${validTypes.join(', ')}`);
        }
      });
    }

    // Special validation for sector array
    if (!Array.isArray(eligibility.sector)) {
      errors.push('eligibility.sector must be an array');
    } else if (eligibility.sector.length === 0) {
      warnings.push('eligibility.sector is empty');
    }

    // Cross-field validation
    if (typeof eligibility.minAge === 'number' && typeof eligibility.maxAge === 'number' && 
        eligibility.minAge > eligibility.maxAge) {
      errors.push('eligibility.minAge cannot be greater than eligibility.maxAge');
    }
  }

  // Validate array fields
  _validateArrayFields(loan, errors, warnings) {
    const arrayFields = ['benefits', 'documents', 'features'];

    arrayFields.forEach(field => {
      if (loan[field] !== undefined) {
        if (!Array.isArray(loan[field])) {
          warnings.push(`${field} should be an array, converting from string`);
          // Try to convert string to array
          if (typeof loan[field] === 'string') {
            loan[field] = loan[field].split(',').map(item => item.trim()).filter(item => item);
          } else {
            loan[field] = [];
          }
        }

        // Validate array items are strings
        loan[field].forEach((item, index) => {
          if (typeof item !== 'string') {
            warnings.push(`${field}[${index}] should be a string`);
          }
        });
      }
    });
  }

  // Normalize loan data to ensure consistency
  _normalizeLoan(loan, warnings) {
    // Normalize strings - trim whitespace and handle empty strings
    const stringFields = ['name', 'lender', 'description', 'interestRate', 'processingFee', 'processingTime'];
    stringFields.forEach(field => {
      if (typeof loan[field] === 'string') {
        loan[field] = loan[field].trim();
        if (loan[field] === '') {
          if (field === 'processingFee' || field === 'processingTime') {
            loan[field] = 'Not specified';
          }
        }
      }
    });

    // Normalize country names
    loan.country = this._normalizeCountryName(loan.country);

    // Normalize lender type to lowercase
    if (loan.lenderType) {
      loan.lenderType = loan.lenderType.toLowerCase();
    }

    // Normalize category to lowercase
    if (loan.category) {
      loan.category = loan.category.toLowerCase();
    }

    // Ensure arrays exist for optional fields
    if (!loan.benefits) loan.benefits = [];
    if (!loan.documents) loan.documents = [];
    if (!loan.features) loan.features = [];

    // Normalize URL
    if (loan.applicationUrl && !loan.applicationUrl.startsWith('http')) {
      loan.applicationUrl = 'https://' + loan.applicationUrl;
      warnings.push('applicationUrl was missing protocol, added https://');
    }

    // Ensure lastUpdated is ISO string
    if (loan.lastUpdated) {
      try {
        loan.lastUpdated = new Date(loan.lastUpdated).toISOString();
      } catch (error) {
        loan.lastUpdated = new Date().toISOString();
        warnings.push('Invalid lastUpdated date, set to current time');
      }
    }

    // Normalize organization types in eligibility
    if (loan.eligibility && Array.isArray(loan.eligibility.organizationType)) {
      loan.eligibility.organizationType = loan.eligibility.organizationType.map(type => type.toLowerCase());
    }

    // Normalize sectors to lowercase
    if (loan.eligibility && Array.isArray(loan.eligibility.sector)) {
      loan.eligibility.sector = loan.eligibility.sector.map(sector => sector.toLowerCase());
    }

    this.validationStats.normalized++;
  }

  // Normalize country names to standard format
  _normalizeCountryName(country) {
    if (!country || typeof country !== 'string') return 'Unknown';

    const countryMappings = {
      'usa': 'United States',
      'us': 'United States',
      'united states of america': 'United States',
      'uk': 'United Kingdom',
      'great britain': 'United Kingdom',
      'england': 'United Kingdom',
      'in': 'India',
      'ind': 'India',
      'republic of india': 'India'
    };

    const normalized = country.toLowerCase().trim();
    return countryMappings[normalized] || 
           country.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  }

  // Get validation statistics
  getStats() {
    return {
      ...this.validationStats,
      successRate: this.validationStats.totalProcessed > 0 ? 
        (this.validationStats.valid / this.validationStats.totalProcessed * 100).toFixed(2) : 0
    };
  }

  // Reset validation statistics
  resetStats() {
    this.validationStats = {
      totalProcessed: 0,
      valid: 0,
      invalid: 0,
      normalized: 0,
      errors: []
    };
  }

  // Create a sample loan for testing
  createSampleLoan() {
    return {
      id: "sample-loan-1",
      name: "Sample Business Loan",
      lender: "Sample Bank",
      lenderType: "bank",
      category: "sme",
      country: "India",
      interestRate: "10-15%",
      loanAmount: {
        min: 100000,
        max: 5000000
      },
      repaymentTerm: {
        min: 12,
        max: 60
      },
      processingFee: "2%",
      collateral: true,
      description: "This is a sample business loan for demonstration purposes",
      benefits: ["Quick processing", "Competitive rates", "Flexible terms"],
      documents: ["Business registration", "Financial statements", "Bank statements"],
      eligibility: {
        minAge: 21,
        maxAge: 65,
        minIncome: 500000,
        creditScoreMin: 650,
        organizationType: ["sme", "startup"],
        businessAge: 12,
        sector: ["manufacturing", "services", "trading"]
      },
      applicationUrl: "https://example.com/apply",
      processingTime: "7-15 days",
      features: ["Digital application", "Quick approval", "Doorstep service"],
      lastUpdated: new Date().toISOString()
    };
  }
}

module.exports = ValidationService;