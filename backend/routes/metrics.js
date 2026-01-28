const express = require('express');
const router = express.Router();
const { getPool } = require('../config/postgres');
const { getRedisClient } = require('../config/redis');
const { mongoose } = require('../config/mongodb');

// Get system metrics
router.get('/', async (req, res) => {
  try {
    const redisClient = getRedisClient();
    const pgPool = getPool();

    // MongoDB metrics
    const mongoStats = await mongoose.connection.db.stats();
    const mongoConnections = mongoose.connection.client.topology.s.sessionPool.sessions.size;

    // PostgreSQL metrics
    const pgResult = await pgPool.query(`
      SELECT 
        count(*) as total_connections,
        pg_database_size(current_database()) as db_size
      FROM pg_stat_activity
      WHERE datname = current_database()
    `);

    // Redis metrics
    const redisInfo = await redisClient.info('memory');
    const redisKeys = await redisClient.dbSize();
    const memoryMatch = redisInfo.match(/used_memory_human:(.+)/);
    const redisMemory = memoryMatch ? memoryMatch[1].trim() : 'N/A';

    const metrics = {
      mongodb: {
        status: 'healthy',
        connections: mongoConnections || 0,
        storage: `${(mongoStats.dataSize / 1024 / 1024 / 1024).toFixed(2)} GB`
      },
      postgres: {
        status: 'healthy',
        connections: parseInt(pgResult.rows[0].total_connections),
        storage: `${(pgResult.rows[0].db_size / 1024 / 1024 / 1024).toFixed(2)} GB`
      },
      redis: {
        status: 'healthy',
        keys: redisKeys,
        memory: redisMemory
      }
    };

    res.json({ metrics });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch metrics',
      details: error.message 
    });
  }
});

// Get performance metrics from PostgreSQL
router.get('/performance', async (req, res) => {
  try {
    const pgPool = getPool();
    
    const result = await pgPool.query(`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
        n_live_tup as row_count
      FROM pg_stat_user_tables
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      LIMIT 10
    `);

    res.json({ 
      tables: result.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
});

// Cache test endpoint
router.post('/cache', async (req, res) => {
  try {
    const redisClient = getRedisClient();
    const { key, value, ttl } = req.body;

    if (!key || !value) {
      return res.status(400).json({ error: 'Key and value are required' });
    }

    if (ttl) {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
    } else {
      await redisClient.set(key, JSON.stringify(value));
    }

    res.json({ 
      message: 'Cache set successfully',
      key,
      ttl: ttl || 'no expiration'
    });
  } catch (error) {
    console.error('Error setting cache:', error);
    res.status(500).json({ error: 'Failed to set cache' });
  }
});

router.get('/cache/:key', async (req, res) => {
  try {
    const redisClient = getRedisClient();
    const { key } = req.params;

    const value = await redisClient.get(key);

    if (!value) {
      return res.status(404).json({ error: 'Key not found' });
    }

    res.json({ 
      key,
      value: JSON.parse(value)
    });
  } catch (error) {
    console.error('Error getting cache:', error);
    res.status(500).json({ error: 'Failed to get cache' });
  }
});

module.exports = router;
