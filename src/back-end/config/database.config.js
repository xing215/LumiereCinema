// config/db.js

const mongoose = require('mongoose');
const redis = require('redis');

// Hàm kết nối MongoDB
const connectDB = async () => {
  try {
    // Đã xóa các options không cần thiết
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('MongoDB Connected... ✅');
  } catch (err) {
    console.error('Could not connect to MongoDB:', err.message);
    process.exit(1);
  }
};

// Hàm kết nối Redis
const connectRedis = async () => {
  const redisClient = redis.createClient({
    url: process.env.REDIS_URL
  });

  redisClient.on('error', (err) => console.log('Redis Client Error', err));
  
  try {
    await redisClient.connect(); 
    console.log('Redis Connected... ✅');
  } catch (err) {
    console.error('Could not connect to Redis:', err);
    process.exit(1);
  }

  return redisClient;
};

// Export cả hai hàm
module.exports = { connectDB, connectRedis };