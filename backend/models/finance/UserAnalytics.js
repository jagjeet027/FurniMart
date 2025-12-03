const mongoose = require('mongoose');

const userAnalyticsSchema = new mongoose.Schema({
  // Session Information
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  
  // Action Information
  action: {
    type: String,
    required: true,
    enum: ['page_view', 'loan_click', 'search', 'filter_apply', 'comparison_add', 'comparison_remove', 'form_submit', 'other'],
    index: true
  },
  
  page: {
    type: String,
    required: false,
    trim: true
  },
  
  // Additional data (flexible JSON object)
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  
  // User Information
  userIp: {
    type: String,
    required: false
  },
  
  userAgent: {
    type: String,
    required: false
  },
  
  // Browser/Device Information
  deviceInfo: {
    browser: {
      type: String,
      required: false
    },
    os: {
      type: String,
      required: false
    },
    device: {
      type: String,
      required: false
    },
    isMobile: {
      type: Boolean,
      default: false
    }
  },
  
  // Geographic Information
  location: {
    country: {
      type: String,
      required: false
    },
    region: {
      type: String,
      required: false
    },
    city: {
      type: String,
      required: false
    }
  },
  
  // Referrer Information
  referrer: {
    type: String,
    required: false
  },
  
  utm: {
    source: {
      type: String,
      required: false
    },
    medium: {
      type: String,
      required: false
    },
    campaign: {
      type: String,
      required: false
    },
    term: {
      type: String,
      required: false
    },
    content: {
      type: String,
      required: false
    }
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'user_analytics'
});

// Indexes for better query performance
userAnalyticsSchema.index({ createdAt: -1 });
userAnalyticsSchema.index({ sessionId: 1, createdAt: -1 });
userAnalyticsSchema.index({ action: 1, createdAt: -1 });
userAnalyticsSchema.index({ page: 1, action: 1 });

// Static methods for analytics
userAnalyticsSchema.statics.getPageViews = function(days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    { 
      $match: { 
        action: 'page_view',
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: "$page",
        views: { $sum: 1 },
        uniqueVisitors: { $addToSet: "$sessionId" }
      }
    },
    {
      $project: {
        page: "$_id",
        views: 1,
        uniqueVisitors: { $size: "$uniqueVisitors" }
      }
    },
    { $sort: { views: -1 } }
  ]);
};

userAnalyticsSchema.statics.getUserJourney = function(sessionId) {
  return this.find({ sessionId })
    .sort({ createdAt: 1 })
    .select('action page data createdAt');
};

userAnalyticsSchema.statics.getActionStats = function(days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    { 
      $match: { 
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: "$action",
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: "$sessionId" }
      }
    },
    {
      $project: {
        action: "$_id",
        count: 1,
        uniqueUsers: { $size: "$uniqueUsers" }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

userAnalyticsSchema.statics.getDeviceStats = function(days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    { 
      $match: { 
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: "$sessionId",
        browser: { $first: "$deviceInfo.browser" },
        os: { $first: "$deviceInfo.os" },
        device: { $first: "$deviceInfo.device" },
        isMobile: { $first: "$deviceInfo.isMobile" }
      }
    },
    {
      $group: {
        _id: {
          browser: "$browser",
          os: "$os",
          isMobile: "$isMobile"
        },
        users: { $sum: 1 }
      }
    },
    { $sort: { users: -1 } }
  ]);
};

userAnalyticsSchema.statics.getTrafficSources = function(days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    { 
      $match: { 
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: "$sessionId",
        referrer: { $first: "$referrer" },
        utmSource: { $first: "$utm.source" },
        utmMedium: { $first: "$utm.medium" },
        utmCampaign: { $first: "$utm.campaign" }
      }
    },
    {
      $group: {
        _id: {
          source: { $ifNull: ["$utmSource", "$referrer"] },
          medium: "$utmMedium",
          campaign: "$utmCampaign"
        },
        sessions: { $sum: 1 }
      }
    },
    { $sort: { sessions: -1 } }
  ]);
};

// Instance methods
userAnalyticsSchema.methods.enrichWithDeviceInfo = function(userAgent) {
  // Simple device detection (you can use a library like 'device' for better detection)
  const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
  const browser = this.detectBrowser(userAgent);
  const os = this.detectOS(userAgent);
  
  this.deviceInfo = {
    browser,
    os,
    device: isMobile ? 'mobile' : 'desktop',
    isMobile
  };
  
  return this;
};

userAnalyticsSchema.methods.detectBrowser = function(userAgent) {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown';
};

userAnalyticsSchema.methods.detectOS = function(userAgent) {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac OS')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
};

module.exports = mongoose.model('UserAnalytics', userAnalyticsSchema);