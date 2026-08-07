require('dotenv').config();
const logger = require('./logger');

/**
 * Validates mandatory environment variables on backend startup.
 * Fails fast with clear diagnostic output if critical variables are missing.
 */
const validateEnvironment = () => {
  const mandatoryVars = [
    { key: 'DATABASE_URL', description: 'PostgreSQL connection string' },
    { key: 'JWT_SECRET', description: 'JWT signing secret key' },
  ];

  const missing = [];

  for (const envVar of mandatoryVars) {
    if (!process.env[envVar.key] || !process.env[envVar.key].trim()) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.error(`\n===================================================`);
    console.error(` ❌ CRITICAL STARTUP ERROR: MISSING ENVIRONMENT VARS`);
    console.error(`===================================================`);
    missing.forEach((v) => {
      console.error(` - ${v.key}: ${v.description} is required.`);
    });
    console.error(`\nPlease configure these variables in backend/.env before starting the server.\n`);
    process.exit(1);
  }

  // Warnings for fallback values
  if (!process.env.PORT) {
    console.warn(`[ENV WARNING]: PORT is not set. Defaulting to 5000.`);
  }

  if (!process.env.ALLOWED_ORIGINS) {
    console.warn(`[ENV WARNING]: ALLOWED_ORIGINS is not set. Defaulting to local dev origins.`);
  }
};

module.exports = {
  validateEnvironment,
};
