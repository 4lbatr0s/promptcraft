import Redis from 'ioredis';
import pino from "pino";
const logger = pino();

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

async function testRedis() {
  try {
    await redis.ping();
    logger.info('✅ Redis connection successful');
    
    // Test demo token storage
    const testToken = 'test-token-123';
    await redis.setex(`demo_token:${testToken}`, 60, '127.0.0.1');
    const exists = await redis.exists(`demo_token:${testToken}`);
    logger.info('✅ Demo token storage test:', exists === 1 ? 'PASSED' : 'FAILED');
    
    // Clean up test token
    await redis.del(`demo_token:${testToken}`);
    
    logger.info('🚀 Redis is ready for demo functionality!');
  } catch (error) {
    logger.error('❌ Redis connection failed:', error.message);
    logger.log('\n📋 To set up Redis:');
    logger.log('1. Install Redis: brew install redis (macOS) or apt-get install redis-server (Ubuntu)');
    logger.log('2. Start Redis: redis-server');
    logger.log('3. Or use Docker: docker run -d -p 6379:6379 redis:alpine');
  } finally {
    await redis.quit();
  }
}

testRedis(); 