const cron = require('node-cron');
const winston = require('winston');
const APIIntegration = require('./apiIntegration');
const CacheService = require('./cacheService');
require('dotenv').config();

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: process.env.LOG_FILE || 'logs/scheduler.log' })
  ]
});

class SchedulerService {
  constructor() {
    this.apiIntegration = new APIIntegration();
    this.cache = new CacheService();
    this.jobs = new Map();
    this.isRunning = false;
    
    // Default schedules (can be overridden by environment variables)
    this.schedules = {
      // Daily refresh at 2 AM for all data
      dailyRefresh: process.env.DATA_REFRESH_SCHEDULE || '0 2 * * *',
      
      // Hourly refresh for critical government schemes
      hourlyGovernmentRefresh: '0 * * * *',
      
      // Weekly cache cleanup on Sunday at 3 AM
      weeklyCleanup: '0 3 * * 0',
      
      // Every 6 hours for market data (if enabled)
      marketDataRefresh: '0 */6 * * *',
      
      // Health check every 30 minutes
      healthCheck: '*/30 * * * *'
    };
    
    this.lastRunStatus = {
      dailyRefresh: { lastRun: null, status: 'never', error: null },
      hourlyGovernmentRefresh: { lastRun: null, status: 'never', error: null },
      weeklyCleanup: { lastRun: null, status: 'never', error: null },
      marketDataRefresh: { lastRun: null, status: 'never', error: null },
      healthCheck: { lastRun: null, status: 'never', error: null }
    };
  }

  // Start all scheduled jobs
  start() {
    if (this.isRunning) {
      logger.warn('Scheduler is already running');
      return;
    }

    logger.info('Starting scheduler service...');

    // Daily full refresh
    this.jobs.set('dailyRefresh', cron.schedule(this.schedules.dailyRefresh, async () => {
      await this.runDailyRefresh();
    }, {
      scheduled: false,
      timezone: "UTC"
    }));

    // Hourly government schemes refresh (if enabled)
    if (process.env.ENABLE_HOURLY_REFRESH === 'true') {
      this.jobs.set('hourlyGovernmentRefresh', cron.schedule(this.schedules.hourlyGovernmentRefresh, async () => {
        await this.runHourlyGovernmentRefresh();
      }, {
        scheduled: false,
        timezone: "UTC"
      }));
    }

    // Weekly cache cleanup
    this.jobs.set('weeklyCleanup', cron.schedule(this.schedules.weeklyCleanup, async () => {
      await this.runWeeklyCleanup();
    }, {
      scheduled: false,
      timezone: "UTC"
    }));

    // Market data refresh (if Alpha Vantage is enabled)
    if (process.env.ENABLE_ALPHA_VANTAGE === 'true') {
      this.jobs.set('marketDataRefresh', cron.schedule(this.schedules.marketDataRefresh, async () => {
        await this.runMarketDataRefresh();
      }, {
        scheduled: false,
        timezone: "UTC"
      }));
    }

    // Health check
    this.jobs.set('healthCheck', cron.schedule(this.schedules.healthCheck, async () => {
      await this.runHealthCheck();
    }, {
      scheduled: false,
      timezone: "UTC"
    }));

    // Start all jobs
    this.jobs.forEach((job, name) => {
      job.start();
      logger.info(`Started scheduled job: ${name}`);
    });

    this.isRunning = true;
    logger.info('Scheduler service started successfully');

    // Run initial health check
    setTimeout(() => this.runHealthCheck(), 5000);
  }

  // Stop all scheduled jobs
  stop() {
    if (!this.isRunning) {
      logger.warn('Scheduler is not running');
      return;
    }

    logger.info('Stopping scheduler service...');

    this.jobs.forEach((job, name) => {
      job.stop();
      job.destroy();
      logger.info(`Stopped scheduled job: ${name}`);
    });

    this.jobs.clear();
    this.isRunning = false;
    logger.info('Scheduler service stopped');
  }

  // Daily refresh job - fetches all loan data from all enabled sources
  async runDailyRefresh() {
    const jobName = 'dailyRefresh';
    logger.info('Starting daily refresh job...');

    try {
      this.lastRunStatus[jobName].lastRun = new Date();
      this.lastRunStatus[jobName].status = 'running';

      // Force refresh all API data
      const result = await this.apiIntegration.fetchAllLoansFromAPIs(true);

      if (result.loans && result.loans.length > 0) {
        this.lastRunStatus[jobName].status = 'success';
        this.lastRunStatus[jobName].error = null;
        
        logger.info(`Daily refresh completed successfully: ${result.loans.length} loans fetched from ${result.sources.totalEnabled} sources`);
        
        // Send success notification if configured
        await this.sendNotification('Daily Refresh Success', 
          `Successfully refreshed ${result.loans.length} loans from ${result.sources.totalEnabled} API sources`);
      } else {
        this.lastRunStatus[jobName].status = 'warning';
        this.lastRunStatus[jobName].error = 'No loans fetched from any source';
        
        logger.warn('Daily refresh completed but no loans were fetched');
        
        // Send warning notification
        await this.sendNotification('Daily Refresh Warning', 
          'Daily refresh completed but no loans were fetched from any API source');
      }

    } catch (error) {
      this.lastRunStatus[jobName].status = 'error';
      this.lastRunStatus[jobName].error = error.message;
      
      logger.error('Daily refresh failed:', error);
      
      // Send error notification
      await this.sendNotification('Daily Refresh Failed', 
        `Daily refresh job failed: ${error.message}`);
    }
  }

  // Hourly government schemes refresh
  async runHourlyGovernmentRefresh() {
    const jobName = 'hourlyGovernmentRefresh';
    logger.info('Starting hourly government schemes refresh...');

    try {
      this.lastRunStatus[jobName].lastRun = new Date();
      this.lastRunStatus[jobName].status = 'running';

      let totalFetched = 0;

      // Refresh Indian government schemes
      if (process.env.ENABLE_INDIA_DATA_GOV === 'true') {
        const indianSchemes = await this.apiIntegration.fetchIndianGovernmentSchemes();
        totalFetched += indianSchemes.length;
      }

      // Refresh US SBA loans
      if (process.env.ENABLE_USA_SBA === 'true') {
        const sbaLoans = await this.apiIntegration.fetchUSASBALoans();
        totalFetched += sbaLoans.length;
      }

      this.lastRunStatus[jobName].status = 'success';
      this.lastRunStatus[jobName].error = null;
      
      logger.info(`Hourly government refresh completed: ${totalFetched} schemes fetched`);

    } catch (error) {
      this.lastRunStatus[jobName].status = 'error';
      this.lastRunStatus[jobName].error = error.message;
      logger.error('Hourly government refresh failed:', error);
    }
  }

  // Weekly cache cleanup
  async runWeeklyCleanup() {
    const jobName = 'weeklyCleanup';
    logger.info('Starting weekly cache cleanup...');

    try {
      this.lastRunStatus[jobName].lastRun = new Date();
      this.lastRunStatus[jobName].status = 'running';

      const cleanedCount = await this.cache.cleanup();
      
      this.lastRunStatus[jobName].status = 'success';
      this.lastRunStatus[jobName].error = null;
      
      logger.info(`Weekly cleanup completed: ${cleanedCount} expired cache entries removed`);

    } catch (error) {
      this.lastRunStatus[jobName].status = 'error';
      this.lastRunStatus[jobName].error = error.message;
      logger.error('Weekly cleanup failed:', error);
    }
  }

  // Market data refresh
  async runMarketDataRefresh() {
    const jobName = 'marketDataRefresh';
    logger.info('Starting market data refresh...');

    try {
      this.lastRunStatus[jobName].lastRun = new Date();
      this.lastRunStatus[jobName].status = 'running';

      const marketData = await this.apiIntegration.fetchMarketData();
      
      if (marketData) {
        this.lastRunStatus[jobName].status = 'success';
        this.lastRunStatus[jobName].error = null;
        logger.info('Market data refresh completed successfully');
      } else {
        this.lastRunStatus[jobName].status = 'warning';
        this.lastRunStatus[jobName].error = 'No market data fetched';
        logger.warn('Market data refresh completed but no data was fetched');
      }

    } catch (error) {
      this.lastRunStatus[jobName].status = 'error';
      this.lastRunStatus[jobName].error = error.message;
      logger.error('Market data refresh failed:', error);
    }
  }

  // Health check
  async runHealthCheck() {
    const jobName = 'healthCheck';
    
    try {
      this.lastRunStatus[jobName].lastRun = new Date();
      this.lastRunStatus[jobName].status = 'running';

      // Check cache health
      const cacheStats = await this.cache.getStats();
      
      // Check API endpoints (lightweight checks)
      const healthStatus = {
        cache: cacheStats,
        apis: {},
        timestamp: new Date().toISOString()
      };

      // Simple connectivity check for enabled APIs
      if (process.env.ENABLE_INDIA_DATA_GOV === 'true') {
        healthStatus.apis.indiaDataGov = await this.checkAPIHealth('https://api.data.gov.in', 5000);
      }

      if (process.env.ENABLE_USA_SBA === 'true') {
        healthStatus.apis.usaSBA = await this.checkAPIHealth('https://api.sba.gov', 5000);
      }

      this.lastRunStatus[jobName].status = 'success';
      this.lastRunStatus[jobName].error = null;
      
      // Store health status in cache for monitoring endpoints
      await this.cache.set('system_health', healthStatus, {}, 30 * 60 * 1000); // 30 minutes

    } catch (error) {
      this.lastRunStatus[jobName].status = 'error';
      this.lastRunStatus[jobName].error = error.message;
      logger.error('Health check failed:', error);
    }
  }

  // Check API endpoint health
  async checkAPIHealth(baseUrl, timeout = 5000) {
    try {
      const axios = require('axios');
      const response = await axios.get(baseUrl, { 
        timeout,
        validateStatus: () => true // Accept any status code
      });
      
      return {
        status: response.status < 500 ? 'healthy' : 'unhealthy',
        responseTime: response.headers['x-response-time'] || 'unknown',
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.code || error.message,
        lastChecked: new Date().toISOString()
      };
    }
  }

  // Send notifications (email, webhook, etc.)
  async sendNotification(subject, message) {
    try {
      // Email notification if configured
      if (process.env.SMTP_HOST && process.env.ALERT_EMAIL) {
        await this.sendEmailNotification(subject, message);
      }

      // Webhook notification if configured
      if (process.env.WEBHOOK_URL) {
        await this.sendWebhookNotification(subject, message);
      }

    } catch (error) {
      logger.error('Failed to send notification:', error);
    }
  }

  // Send email notification
  async sendEmailNotification(subject, message) {
    // Implementation would depend on email service (nodemailer, etc.)
    // For now, just log the notification
    logger.info(`Email notification: ${subject} - ${message}`);
  }

  // Send webhook notification (Slack, Discord, etc.)
  async sendWebhookNotification(subject, message) {
    try {
      const axios = require('axios');
      await axios.post(process.env.WEBHOOK_URL, {
        text: `**${subject}**\n${message}`,
        timestamp: new Date().toISOString()
      }, {
        timeout: 5000
      });
    } catch (error) {
      logger.error('Webhook notification failed:', error);
    }
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      jobs: Array.from(this.jobs.keys()),
      schedules: this.schedules,
      lastRunStatus: this.lastRunStatus,
      uptime: this.isRunning ? Date.now() - this.startTime : 0
    };
  }

  // Manually trigger a specific job
  async triggerJob(jobName) {
    if (!this.isRunning) {
      throw new Error('Scheduler service is not running');
    }

    logger.info(`Manually triggering job: ${jobName}`);

    switch (jobName) {
      case 'dailyRefresh':
        return await this.runDailyRefresh();
      case 'hourlyGovernmentRefresh':
        return await this.runHourlyGovernmentRefresh();
      case 'weeklyCleanup':
        return await this.runWeeklyCleanup();
      case 'marketDataRefresh':
        return await this.runMarketDataRefresh();
      case 'healthCheck':
        return await this.runHealthCheck();
      default:
        throw new Error(`Unknown job: ${jobName}`);
    }
  }

  // Update schedule for a job
  updateSchedule(jobName, newSchedule) {
    if (!this.jobs.has(jobName)) {
      throw new Error(`Job not found: ${jobName}`);
    }

    const job = this.jobs.get(jobName);
    job.stop();
    job.destroy();

    // Create new job with updated schedule
    const newJob = cron.schedule(newSchedule, async () => {
      await this.triggerJob(jobName);
    }, {
      scheduled: false,
      timezone: "UTC"
    });

    this.jobs.set(jobName, newJob);
    this.schedules[jobName] = newSchedule;

    if (this.isRunning) {
      newJob.start();
    }

    logger.info(`Updated schedule for ${jobName}: ${newSchedule}`);
  }
}

module.exports = SchedulerService;