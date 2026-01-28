const express = require('express');
const router = express.Router();
const Deployment = require('../models/Deployment');
const { getRedisClient } = require('../config/redis');

// Get all deployments with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Check cache
    const redisClient = getRedisClient();
    const cacheKey = `deployments:page:${page}:limit:${limit}`;
    
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    } catch (redisError) {
      console.error('Redis cache error:', redisError);
    }

    const deployments = await Deployment
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Deployment.countDocuments();

    const response = {
      deployments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };

    // Cache for 30 seconds
    try {
      await redisClient.setEx(cacheKey, 30, JSON.stringify(response));
    } catch (redisError) {
      console.error('Redis cache set error:', redisError);
    }

    res.json(response);
  } catch (error) {
    console.error('Error fetching deployments:', error);
    res.status(500).json({ error: 'Failed to fetch deployments' });
  }
});

// Get deployment statistics
router.get('/stats', async (req, res) => {
  try {
    const redisClient = getRedisClient();
    const cacheKey = 'deployments:stats';

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    } catch (redisError) {
      console.error('Redis cache error:', redisError);
    }

    const total = await Deployment.countDocuments();
    const successful = await Deployment.countDocuments({ status: 'success' });
    const failed = await Deployment.countDocuments({ status: 'failed' });
    
    const avgDuration = await Deployment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, avgDuration: { $avg: '$duration' } } }
    ]);

    const stats = {
      totalDeployments: total,
      successfulDeployments: successful,
      failedDeployments: failed,
      avgDeploymentTime: Math.round(avgDuration[0]?.avgDuration || 0)
    };

    const response = { stats };

    // Cache for 60 seconds
    try {
      await redisClient.setEx(cacheKey, 60, JSON.stringify(response));
    } catch (redisError) {
      console.error('Redis cache set error:', redisError);
    }

    res.json(response);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get recent deployments
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const deployments = await Deployment
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ deployments });
  } catch (error) {
    console.error('Error fetching recent deployments:', error);
    res.status(500).json({ error: 'Failed to fetch recent deployments' });
  }
});

// Create new deployment
router.post('/', async (req, res) => {
  try {
    const deployment = new Deployment(req.body);
    await deployment.save();

    // Invalidate cache
    const redisClient = getRedisClient();
    try {
      const keys = await redisClient.keys('deployments:*');
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (redisError) {
      console.error('Redis cache invalidation error:', redisError);
    }

    res.status(201).json(deployment);
  } catch (error) {
    console.error('Error creating deployment:', error);
    res.status(500).json({ error: 'Failed to create deployment' });
  }
});

// Update deployment
router.patch('/:id', async (req, res) => {
  try {
    const deployment = await Deployment.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    if (!deployment) {
      return res.status(404).json({ error: 'Deployment not found' });
    }

    // Invalidate cache
    const redisClient = getRedisClient();
    try {
      const keys = await redisClient.keys('deployments:*');
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (redisError) {
      console.error('Redis cache invalidation error:', redisError);
    }

    res.json(deployment);
  } catch (error) {
    console.error('Error updating deployment:', error);
    res.status(500).json({ error: 'Failed to update deployment' });
  }
});

module.exports = router;
