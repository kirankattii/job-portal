/**
 * Simple console logger wrapper
 * Provides consistent logging format across the application
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

/**
 * Format timestamp for log entries
 */
const getTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Format log message with timestamp and level
 */
const formatMessage = (level, message, data = null) => {
  const timestamp = getTimestamp();
  const levelUpper = level.toUpperCase().padEnd(5);
  
  let formattedMessage = `[${timestamp}] ${levelUpper} ${message}`;
  
  if (data) {
    if (typeof data === 'object') {
      formattedMessage += `\n${JSON.stringify(data, null, 2)}`;
    } else {
      formattedMessage += ` ${data}`;
    }
  }
  
  return formattedMessage;
};

/**
 * Get color for log level
 */
const getColor = (level) => {
  switch (level.toLowerCase()) {
    case 'error': return colors.red;
    case 'warn': return colors.yellow;
    case 'info': return colors.green;
    case 'debug': return colors.blue;
    default: return colors.white;
  }
};

/**
 * Logger object with different log levels
 */
const logger = {
  /**
   * Log error messages
   */
  error: (message, data = null) => {
    const formattedMessage = formatMessage('error', message, data);
    console.error(`${colors.red}${formattedMessage}${colors.reset}`);
  },

  /**
   * Log warning messages
   */
  warn: (message, data = null) => {
    const formattedMessage = formatMessage('warn', message, data);
    console.warn(`${colors.yellow}${formattedMessage}${colors.reset}`);
  },

  /**
   * Log info messages
   */
  info: (message, data = null) => {
    const formattedMessage = formatMessage('info', message, data);
    console.log(`${colors.green}${formattedMessage}${colors.reset}`);
  },

  /**
   * Log debug messages (only in development)
   */
  debug: (message, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      const formattedMessage = formatMessage('debug', message, data);
      console.log(`${colors.blue}${formattedMessage}${colors.reset}`);
    }
  },

  /**
   * Log HTTP requests
   */
  http: (req, res, responseTime) => {
    const method = req.method;
    const url = req.originalUrl || req.url;
    const statusCode = res.statusCode;
    const userAgent = req.get('User-Agent') || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress;
    
    const color = statusCode >= 400 ? colors.red : 
                  statusCode >= 300 ? colors.yellow : colors.green;
    
    const message = `${method} ${url} ${statusCode} ${responseTime}ms - ${ip} - ${userAgent}`;
    console.log(`${color}${message}${colors.reset}`);
  },

  /**
   * Log database operations
   */
  db: (operation, collection, data = null) => {
    const message = `DB ${operation.toUpperCase()} on ${collection}`;
    const formattedMessage = formatMessage('info', message, data);
    console.log(`${colors.cyan}${formattedMessage}${colors.reset}`);
  },

  /**
   * Log authentication events
   */
  auth: (event, userId, data = null) => {
    const message = `AUTH ${event.toUpperCase()} for user ${userId}`;
    const formattedMessage = formatMessage('info', message, data);
    console.log(`${colors.magenta}${formattedMessage}${colors.reset}`);
  }
};

module.exports = logger;
