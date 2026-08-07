const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// 1. Startup Fail-Fast Environment Validation
const { validateEnvironment } = require('./utils/envValidator');
validateEnvironment();

const { configureSecurityHeaders } = require('./middleware/securityHeaders');
const requestIdMiddleware = require('./middleware/requestId');
const { authLimiter, publicFormLimiter, apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const apiRouter = require('./routes');
const { initScheduler } = require('./utils/scheduler');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable reverse proxy trust (1 hop: Nginx / Cloudflare / Load Balancers)
app.set('trust proxy', 1);

// Configure Security Headers
app.use(configureSecurityHeaders());

// Correlation ID Tracking
app.use(requestIdMiddleware);

// Setup CORS
const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

const normalizeOrigin = (origin) => origin ? origin.trim().replace(/\/+$/, '') : '';
const envOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(normalizeOrigin).filter(Boolean)
  : [];
const allowedOrigins = Array.from(new Set([...envOrigins, ...defaultOrigins.map(normalizeOrigin)]));
const isDev = (process.env.NODE_ENV || 'development') === 'development';

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalizedRequestOrigin = normalizeOrigin(origin);
    if (allowedOrigins.includes(normalizedRequestOrigin)) {
      return callback(null, true);
    }
    logger.warn(`[CORS REJECTED] Origin "${origin}" is not allowed by CORS policy.`);
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200,
}));

app.use(morgan(isDev ? 'dev' : 'combined'));
app.use(compression());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Static uploads serving
const uploadsPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath, {
  // Uploaded files have timestamp+random suffixes — content-addressed, safe to cache aggressively
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Vary', 'Accept-Encoding');
  },
}));


// Apply Rate Limiters to sensitive endpoints
app.use('/api/auth/login', authLimiter);
app.use('/api/users/reset-password', authLimiter);
app.use('/api', apiLimiter);

// Bind API Routes
app.use('/api', apiRouter);

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: `API Route Not Found: ${req.originalUrl}`,
      code: 'ROUTE_NOT_FOUND',
      timestamp: new Date().toISOString(),
    },
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Start Server
const server = app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` Da' Corridor Portfolio CMS Server Running on Port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(` API Endpoint: http://localhost:${PORT}/api`);
  console.log(`===================================================`);
  initScheduler();
});

// Graceful Shutdown Handler
const gracefulShutdown = (signal) => {
  console.log(`\n[SIGNAL RECEIVED]: ${signal}. Initiating graceful shutdown...`);
  server.close(() => {
    console.log('[HTTP SERVER CLOSED]: Pending requests finished.');
    process.exit(0);
  });

  // Force shutdown after 10 seconds if connections remain open
  setTimeout(() => {
    console.error('[FORCE SHUTDOWN]: Could not close connections in time, forcing exit.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[PORT CONFLICT ERROR]: Port ${PORT} is already in use by another process.`);
    console.error(`Please stop the process running on port ${PORT} or configure a different PORT in your .env file.\n`);
    process.exit(1);
  } else {
    console.error('[SERVER LISTEN ERROR]:', err);
    process.exit(1);
  }
});
