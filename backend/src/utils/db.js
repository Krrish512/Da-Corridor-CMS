const path = require('path');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
// Explicitly resolve backend/.env regardless of the working directory Node is invoked from.
// Using `require('dotenv/config')` (no path) was CWD-dependent and caused stale or missing env vars
// when the script was run from the project root or via a shell with pre-existing process.env values.
require('dotenv').config({ path: path.resolve(__dirname, '../../.env'), override: false });

// Connection pool setup using pg & @prisma/adapter-pg for Prisma 7+
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/dacorridorcms?schema=public';

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Prevents instantiating multiple PrismaClient connections in development
const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;
