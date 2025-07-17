import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

async function testRedis() {
  try {
    await redis.ping();
    console.log('✅ Redis connection successful');
    
    // Test demo token storage
    const testToken = 'test-token-123';
    await redis.setex(`demo_token:${testToken}`, 60, '127.0.0.1');
    const exists = await redis.exists(`demo_token:${testToken}`);
    console.log('✅ Demo token storage test:', exists === 1 ? 'PASSED' : 'FAILED');
    
    // Clean up test token
    await redis.del(`demo_token:${testToken}`);
    
    console.log('🚀 Redis is ready for demo functionality!');
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    console.log('\n📋 To set up Redis:');
    console.log('1. Install Redis: brew install redis (macOS) or apt-get install redis-server (Ubuntu)');
    console.log('2. Start Redis: redis-server');
    console.log('3. Or use Docker: docker run -d -p 6379:6379 redis:alpine');
  } finally {
    await redis.quit();
  }
}

testRedis(); 