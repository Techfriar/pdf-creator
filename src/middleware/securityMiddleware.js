const config = require('../config/config');
const { logger } = require('../utils/logger');

/**
 * Middleware to restrict access based on IP whitelist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const ipWhitelist = (req, res, next) => {
  // Skip IP check for health check endpoint
  if (req.path === '/api/health') {
    return next();
  }

  // If no IPs are whitelisted, allow all
  if (config.security.allowedIPs.length === 0) {
    return next();
  }

  const clientIP = req.ip || 
                  req.connection.remoteAddress || 
                  req.socket.remoteAddress || 
                  req.connection.socket.remoteAddress;

  // Clean the IP address (remove IPv6 prefix if present)
  const cleanIP = clientIP.replace(/^::ffff:/, '');

  if (!config.security.allowedIPs.includes(cleanIP)) {
    logger.warn(`Access denied: IP not in whitelist. IP: ${cleanIP}`);
    return res.status(403).json({
      status: false,
      error: 'Forbidden: IP not allowed'
    });
  }

  next();
};

/**
 * Configure CORS for specific origins
 * @returns {Function} CORS middleware configured for allowed origins
 */
const corsConfig = () => {
  return (req, res, next) => {
    // If no origins are specified, allow all
    if (config.security.allowedOrigins.length === 0) {
      res.header('Access-Control-Allow-Origin', '*');
    } else {
      const origin = req.headers.origin;
      if (config.security.allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
      }
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    next();
  };
};

module.exports = {
  ipWhitelist,
  corsConfig
};
