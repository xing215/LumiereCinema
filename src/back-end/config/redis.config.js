const redis = require('redis');

// Tạo một client Redis
const redisClient = redis.createClient({
    // url: 'redis://your_remote_redis_url' // Nếu dùng Redis trên server khác
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Hàm để kết nối
const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log('✅ Redis Connected');
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
        process.exit(1);
    }
};

// Xuất client và hàm kết nối để các file khác có thể dùng
module.exports = {
    connectRedis,
    redisClient
};
