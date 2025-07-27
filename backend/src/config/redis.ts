import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

let redisClient: RedisClientType;

export const connectRedis = async (): Promise<void> => {
  try {
    const redisURL = process.env.NODE_ENV === 'production' 
      ? process.env.REDIS_URL_PROD 
      : process.env.REDIS_URL || 'redis://localhost:6379';

    redisClient = createClient({
      url: redisURL,
      socket: {
        connectTimeout: 60000,
      },
    });

    redisClient.on('error', (err: Error) => {
      logger.error('Redis Client Error:', err);
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
    // Don't exit process for Redis failure in development
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
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
