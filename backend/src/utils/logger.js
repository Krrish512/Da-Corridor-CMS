const isProduction = process.env.NODE_ENV === 'production';

// Helper to mask sensitive fields in objects/logs
const maskSensitiveData = (data) => {
  if (!data || typeof data !== 'object') return data;

  const sensitiveKeys = ['password', 'token', 'jwt', 'secret', 'authorization', 'cookie'];
  const masked = Array.isArray(data) ? [...data] : { ...data };

  for (const key of Object.keys(masked)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      masked[key] = '***MASKED***';
    } else if (typeof masked[key] === 'object' && masked[key] !== null) {
      masked[key] = maskSensitiveData(masked[key]);
    }
  }

  return masked;
};

// Structured Logger instance
const logger = {
  info: (message, meta = {}) => {
    const logObj = {
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      meta: maskSensitiveData(meta),
    };
    console.log(JSON.stringify(logObj));
  },

  warn: (message, meta = {}) => {
    const logObj = {
      level: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      meta: maskSensitiveData(meta),
    };
    console.warn(JSON.stringify(logObj));
  },

  error: (message, error = null, meta = {}) => {
    const logObj = {
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: isProduction ? undefined : error.stack,
          }
        : undefined,
      meta: maskSensitiveData(meta),
    };
    console.error(JSON.stringify(logObj));
  },

  debug: (message, meta = {}) => {
    if (!isProduction) {
      const logObj = {
        level: 'DEBUG',
        timestamp: new Date().toISOString(),
        message,
        meta: maskSensitiveData(meta),
      };
      console.log(JSON.stringify(logObj));
    }
  },
};

module.exports = logger;
