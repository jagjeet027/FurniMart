const fs = require('fs').promises;
const path = require('path');
const winston = require('winston');
require('dotenv').config();

// Optional Redis support
let redis = null;
try {
  if (process.env.REDIS_URL) {
    const Redis = require('redis');
    redis = Redis.createClient({ url: process.env.REDIS_URL });
    redis.on('error', (err) => console.log('Redis Client Error', err));
  }
} catch (error) {
  console.log('Redis not available, using file-based cache');
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: process.env.LOG_FILE || 'logs/cache_service.log' })
  ]
});

class CacheService {
  constructor() {
    this.cacheDir = path.join(__dirname, '..', 'cache');
    this.defaultExpiry = parseInt(process.env.CACHE_EXPIRY_HOURS || 24) * 60 * 60 * 1000; // 24 hours in milliseconds
    this.initializeCache();
  }

  async initializeCache() {
    try {
      // Create cache directory if it doesn't exist
      await fs.mkdir(this.cacheDir, { recursive: true });
      
      // Initialize Redis connection if available
      if (redis && !redis.isOpen) {
        await redis.connect();
        logger.info('Redis cache connected successfully');
      }
    } catch (error) {
      logger.warn('Cache initialization warning:', error.message);
    }
  }

  // Generate cache key
  getCacheKey(source, params = {}) {
    const paramsStr = Object.keys(params).length > 0 ? JSON.stringify(params) : '';
    return `loan_data_${source}_${Buffer.from(paramsStr).toString('base64')}`;
  }

  // Get data from cache
  async get(source, params = {}) {
    const key = this.getCacheKey(source, params);
    
    try {
      // Try Redis first if available
      if (redis && redis.isOpen) {
        const cached = await redis.get(key);
        if (cached) {
          const data = JSON.parse(cached);
          if (this.isValidCache(data)) {
            logger.info(`Cache hit (Redis): ${key}`);
            return data.value;
          } else {
            await redis.del(key); // Remove expired data
          }
        }
      }
      
      // Fall back to file cache
      const filePath = path.join(this.cacheDir, `${key}.json`);
      try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        
        if (this.isValidCache(data)) {
          logger.info(`Cache hit (File): ${key}`);
          return data.value;
        } else {
          await fs.unlink(filePath); // Remove expired file
        }
      } catch (fileError) {
        // File doesn't exist or is corrupted
      }
      
    } catch (error) {
      logger.error('Cache retrieval error:', error.message);
    }
    
    logger.info(`Cache miss: ${key}`);
    return null;
  }

  // Set data in cache
  async set(source, data, params = {}, customExpiry = null) {
    const key = this.getCacheKey(source, params);
    const expiry = customExpiry || this.defaultExpiry;
    const cacheData = {
      value: data,
      timestamp: Date.now(),
      expiry: Date.now() + expiry,
      source: source,
      params: params
    };

    try {
      // Store in Redis if available
      if (redis && redis.isOpen) {
        await redis.setEx(key, Math.floor(expiry / 1000), JSON.stringify(cacheData));
        logger.info(`Cache set (Redis): ${key}`);
      }
      
      // Always store in file as backup
      const filePath = path.join(this.cacheDir, `${key}.json`);
      await fs.writeFile(filePath, JSON.stringify(cacheData, null, 2));
      logger.info(`Cache set (File): ${key}`);
      
    } catch (error) {
      logger.error('Cache storage error:', error.message);
    }
  }

  // Check if cached data is still valid
  isValidCache(cacheData) {
    if (!cacheData || !cacheData.expiry || !cacheData.timestamp) {
      return false;
    }
    return Date.now() < cacheData.expiry;
  }

  // Clear cache for a specific source
  async clear(source, params = {}) {
    const key = this.getCacheKey(source, params);
    
    try {
      // Clear from Redis
      if (redis && redis.isOpen) {
        await redis.del(key);
      }
      
      // Clear from file
      const filePath = path.join(this.cacheDir, `${key}.json`);
      await fs.unlink(filePath);
      
      logger.info(`Cache cleared: ${key}`);
    } catch (error) {
      logger.warn('Cache clear warning:', error.message);
    }
  }

  // Clear all cache
  async clearAll() {
    try {
      // Clear Redis
      if (redis && redis.isOpen) {
        const keys = await redis.keys('loan_data_*');
        if (keys.length > 0) {
          await redis.del(keys);
        }
      }
      
      // Clear file cache
      const files = await fs.readdir(this.cacheDir);
      const deletePromises = files
        .filter(file => file.endsWith('.json'))
        .map(file => fs.unlink(path.join(this.cacheDir, file)));
      
      await Promise.all(deletePromises);
      
      logger.info('All cache cleared successfully');
    } catch (error) {
      logger.error('Clear all cache error:', error.message);
    }
  }

  // Get cache statistics
  async getStats() {
    const stats = {
      redis: { available: false, keys: 0 },
      file: { available: true, files: 0, totalSize: 0 },
      sources: {}
    };

    try {
      // Redis stats
      if (redis && redis.isOpen) {
        stats.redis.available = true;
        const keys = await redis.keys('loan_data_*');
        stats.redis.keys = keys.length;
      }

      // File stats
      const files = await fs.readdir(this.cacheDir);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      stats.file.files = jsonFiles.length;

      for (const file of jsonFiles) {
        try {
          const filePath = path.join(this.cacheDir, file);
          const stat = await fs.stat(filePath);
          stats.file.totalSize += stat.size;

          // Read file to get source info
          const content = await fs.readFile(filePath, 'utf8');
          const data = JSON.parse(content);
          
          if (data.source) {
            if (!stats.sources[data.source]) {
              stats.sources[data.source] = { count: 0, valid: 0, expired: 0 };
            }
            stats.sources[data.source].count++;
            
            if (this.isValidCache(data)) {
              stats.sources[data.source].valid++;
            } else {
              stats.sources[data.source].expired++;
            }
          }
        } catch (fileError) {
          // Skip corrupted files
        }
      }

    } catch (error) {
      logger.error('Cache stats error:', error.message);
    }

    return stats;
  }

  // Clean up expired cache entries
  async cleanup() {
    let cleanedCount = 0;

    try {
      // Cleanup file cache
      const files = await fs.readdir(this.cacheDir);
      const jsonFiles = files.filter(file => file.endsWith('.json'));

      for (const file of jsonFiles) {
        try {
          const filePath = path.join(this.cacheDir, file);
          const content = await fs.readFile(filePath, 'utf8');
          const data = JSON.parse(content);

          if (!this.isValidCache(data)) {
            await fs.unlink(filePath);
            cleanedCount++;
          }
        } catch (fileError) {
          // Remove corrupted files
          await fs.unlink(path.join(this.cacheDir, file));
          cleanedCount++;
        }
      }

      logger.info(`Cache cleanup completed: ${cleanedCount} files removed`);
    } catch (error) {
      logger.error('Cache cleanup error:', error.message);
    }

    return cleanedCount;
  }

  // Close connections
  async close() {
    try {
      if (redis && redis.isOpen) {
        await redis.disconnect();
        logger.info('Redis connection closed');
      }
    } catch (error) {
      logger.error('Cache close error:', error.message);
    }
  }
}

module.exports = CacheService;