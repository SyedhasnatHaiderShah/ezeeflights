const Redis = require('ioredis');

const client = new Redis({
  host: '127.0.0.1',
  port: 6379,
  maxRetriesPerRequest: 1,
  connectTimeout: 2000,
});

client.on('connect', () => {
  console.log('Redis connected successfully!');
  client.quit();
});

client.on('error', (err) => {
  console.error('Failed to connect to Redis:', err.message);
  client.quit();
});
