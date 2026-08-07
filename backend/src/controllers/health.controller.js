const prisma = require('../utils/db');

// Complete diagnostic health check
const getHealthStatus = async (req, res) => {
  const startTime = Date.now();
  let dbStatus = 'DOWN';
  let dbLatencyMs = null;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
    dbStatus = 'UP';
  } catch (error) {
    dbStatus = 'DOWN';
  }

  const isHealthy = dbStatus === 'UP';
  const memoryUsage = process.memoryUsage();

  const healthData = {
    status: isHealthy ? 'HEALTHY' : 'UNHEALTHY',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      system: {
        memoryHeapUsedMB: Math.round(memoryUsage.heapUsed / (1024 * 1024)),
        memoryHeapTotalMB: Math.round(memoryUsage.heapTotal / (1024 * 1024)),
        memoryRssMB: Math.round(memoryUsage.rss / (1024 * 1024)),
      },
    },
    responseTimeMs: Date.now() - startTime,
  };

  res.status(isHealthy ? 200 : 503).json(healthData);
};

// Readiness probe (Load Balancer check)
const getReadinessProbe = async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'READY', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'NOT_READY', reason: 'Database connection failed', timestamp: new Date().toISOString() });
  }
};

// Liveness probe (Process manager check)
const getLivenessProbe = (req, res) => {
  res.status(200).json({ status: 'ALIVE', timestamp: new Date().toISOString() });
};

module.exports = {
  getHealthStatus,
  getReadinessProbe,
  getLivenessProbe,
};
