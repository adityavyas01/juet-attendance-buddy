import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

let redisClient: RedisClientType;

export const connectRedis = async (): Promise<void> => {
  // Skip Redis if no URL is provided
  if (!process.env.REDIS_URL) {
    logger.info('🔴 Redis skipped - no REDIS_URL configured');
    return;
  }
  
  try {
    const redisURL = process.env.REDIS_URL;

    redisClient = createClient({
      url: redisURL,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: false, // Disable reconnection attempts
      },
    });

    redisClient.on('error', (err: Error) => {
      logger.warn('Redis Client Error (Redis is optional):', err.message);
    });

    redisClient.on('connect', () => {
      logger.info('🔴 Redis Client Connected');
    });

    redisClient.on('ready', () => {
      logger.info('🔴 Redis Client Ready');
    });

    redisClient.on('end', () => {
      logger.warn('🔴 Redis Client Disconnected');
    });

    await redisClient.connect();
  } catch (error) {
    logger.error('Redis connection failed:', error);
    // Redis is optional - don't exit process on failure
    logger.info('🔴 Continuing without Redis (optional service)');
  }
};

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
  }
};
