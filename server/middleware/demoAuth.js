import { randomBytes } from 'crypto';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import pino from "pino";
const logger = pino();

dotenv.config();

let redis = null;

const connectRedis = () => {
  try {
    logger.info('Attempting to connect to Redis...');
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    
    redis.on('connect', () => {
      logger.info('✅ Redis connected successfully!');
    });
    
    redis.on('ready', () => {
      logger.info('✅ Redis is ready to accept commands');
    });
    
    redis.on('error', (error) => {
      logger.error('❌ Redis connection error:', error.message);
      redis = null; // Set to null on error
    });
    
    redis.on('close', () => {
      logger.info('⚠️  Redis connection closed');
    });
    
    redis.on('reconnecting', () => {
      logger.info('🔄 Redis reconnecting...');
    });
    
  } catch (error) {
    logger.error('❌ Failed to create Redis instance:', error.message);
    redis = null;
  }
};

// Connect immediately when module is imported
connectRedis();


// Rest of your existing code...
const DEMO_LIMIT = 3;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const TOKEN_EXPIRY = 24 * 60 * 60; // 24 hours in seconds

// Memory fallback (existing code)
const memoryStorage = new Map();
const rateLimitData = new Map();


// Simple cleanup for memory storage
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of memoryStorage.entries()) {
    if (data.expiresAt < now) memoryStorage.delete(token);
  }
  for (const [key, data] of rateLimitData.entries()) {
    if (data.resetTime < now) rateLimitData.delete(key);
  }
}, 60 * 60 * 1000);

// Rate limiter with simple store
const demoRateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: DEMO_LIMIT,
  store: {
    incr: async (key, callback) => {
      try {
        if (redis) {
          const count = await redis.incr(key);
          if (count === 1) await redis.expire(key, Math.ceil(WINDOW_MS / 1000));
          callback(null, count);
        } else {
          const now = Date.now();
          const data = rateLimitData.get(key);
          if (!data || data.resetTime < now) {
            rateLimitData.set(key, { count: 1, resetTime: now + WINDOW_MS });
            callback(null, 1);
          } else {
            data.count++;
            callback(null, data.count);
          }
        }
      } catch (error) {
        // Fallback to memory
        const now = Date.now();
        const data = rateLimitData.get(key);
        if (!data || data.resetTime < now) {
          rateLimitData.set(key, { count: 1, resetTime: now + WINDOW_MS });
          callback(null, 1);
        } else {
          data.count++;
          callback(null, data.count);
        }
      }
    },
    decrement: async (key) => {
      try {
        if (redis) {
          await redis.decr(key);
        } else {
          const data = rateLimitData.get(key);
          if (data && data.count > 0) data.count--;
        }
      } catch (error) {
        const data = rateLimitData.get(key);
        if (data && data.count > 0) data.count--;
      }
    },
    resetKey: async (key) => {
      try {
        if (redis) {
          await redis.del(key);
        } else {
          rateLimitData.delete(key);
        }
      } catch (error) {
        rateLimitData.delete(key);
      }
    }
  },
  keyGenerator: (req) => `demo:${ipKeyGenerator(req)}`,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Demo limit reached. Please sign up for unlimited access.',
      limitReached: true
    });
  }
});

const generateDemoToken = () => randomBytes(32).toString('hex');

const validateDemoToken = async (token) => {
  try {
    if (redis) {
      const exists = await redis.exists(`demo_token:${token}`);
      return exists === 1;
    } else {
      const tokenData = memoryStorage.get(token);
      if (!tokenData || tokenData.expiresAt < Date.now()) {
        memoryStorage.delete(token);
        return false;
      }
      return true;
    }
  } catch (error) {
    const tokenData = memoryStorage.get(token);
    if (!tokenData || tokenData.expiresAt < Date.now()) {
      memoryStorage.delete(token);
      return false;
    }
    return true;
  }
};

const storeDemoToken = async (token, ip) => {
  try {
    if (redis) {
      await redis.setex(`demo_token:${token}`, TOKEN_EXPIRY, ip);
    } else {
      memoryStorage.set(token, {
        ip,
        expiresAt: Date.now() + (TOKEN_EXPIRY * 1000)
      });
      setTimeout(() => memoryStorage.delete(token), TOKEN_EXPIRY * 1000);
    }
  } catch (error) {
    memoryStorage.set(token, {
      ip,
      expiresAt: Date.now() + (TOKEN_EXPIRY * 1000)
    });
    setTimeout(() => memoryStorage.delete(token), TOKEN_EXPIRY * 1000);
  }
};

export const demoAuthMiddleware = async (req, res, next) => {
  try {
    if (req.user) return next();

    const demoToken = req.headers['X-Demo-Token'];
    
    if (demoToken && await validateDemoToken(demoToken)) {
      req.isDemoUser = true;
      req.demoToken = demoToken;
      return next();
    }

    return demoRateLimiter(req, res, next);
  } catch (error) {
    logger.error('Demo auth error:', error);
    return demoRateLimiter(req, res, next);
  }
};

export const generateDemoTokenHandler = async (req, res) => {
  try {
    const token = generateDemoToken();
    await storeDemoToken(token, req.ip);
    
    res.json({
      success: true,
      data: {
        token,
        expiresIn: '24 hours'
      }
    });
  } catch (error) {
    logger.error('Token generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate demo token'
    });
  }
};

export const checkDemoUsage = async (req, res) => {
  try {
    const key = `demo:${req.ip}`;
    let usage = 0;
    
    if (redis) {
      const count = await redis.get(key);
      usage = count ? parseInt(count) : 0;
    } else {
      const data = rateLimitData.get(key);
      usage = data?.count || 0;
    }
    
    res.json({
      success: true,
      data: {
        remaining: Math.max(0, DEMO_LIMIT - usage),
        total: DEMO_LIMIT,
        usage
      }
    });
  } catch (error) {
    logger.error('Usage check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check usage'
    });
  }
};

export { redis };