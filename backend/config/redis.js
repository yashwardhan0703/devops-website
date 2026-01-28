const redis = require('redis');

let redisClient;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || 'redis',
        port: process.env.REDIS_PORT || 6379,
      },
      legacyMode: false,
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    redisClient.on('disconnect', () => {
      console.log('Redis disconnected');
    });

    await redisClient.connect();

  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    throw error;
  }
};

const getRedisClient = () => {
  if (!redisClient || !redisClient.isOpen) {
    throw new Error('Redis client not initialized or not connected');
  }
  return redisClient;
};

module.exports = { connectRedis, getRedisClient };
