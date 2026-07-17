const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const apiRouter = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Setup Middlewares
app.use(cors({
  origin: '*', // Adjust in production to frontend url
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Ensure uploads folder is served statically
const uploadsPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// Health Check API
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Bind API Routes
app.use('/api', apiRouter);

// Page Not Found handler
app.use((req, res, next) => {
  res.status(404).json({ message: `API Route Not Found: ${req.originalUrl}` });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('[SERVER EXCEPTION]:', err);
  
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` ArchStudio Portfolio CMS Server Running on Port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Health Check: http://localhost:${PORT}/health`);
  console.log(` API Endpoint: http://localhost:${PORT}/api`);
  console.log(`===================================================`);
});
