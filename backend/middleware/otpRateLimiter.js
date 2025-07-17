const otpRateLimiter = (req, res, next) => {
  const { phone } = req.body;
  const currentTime = Date.now();
  
  // Check if phone has recent OTP requests
  const recentRequests = otpStorage.get(`${phone}_requests`) || [];
  
  // Remove expired requests
  const validRequests = recentRequests.filter(
    requestTime => currentTime - requestTime < 5 * 60 * 1000
  );

  // Limit to 3 OTP requests in 5 minutes
  if (validRequests.length >= 3) {
    return res.status(429).json({
      message: 'Too many OTP requests. Please try again later.'
    });
  }

  // Add current request time
  validRequests.push(currentTime);
  otpStorage.set(`${phone}_requests`, validRequests);

  next();
};

export default otpRateLimiter;