// app.js

// 1. Nạp biến môi trường NGAY ĐẦU TIÊN
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');

// 3. Import các hàm kết nối từ file config
const { connectDB } = require('./config/database.config.js');
const { connectRedis } = require('./config/redis.config.js');

// Import các router
const authRoutes = require('./routes/auth.route.js');
const movieRoutes = require('./routes/movie.route.js');
const reportRoutes = require('./routes/report.route.js');
const branchRoutes = require('./routes/branch.route.js');
const ticketsRoutes = require('./routes/tickets.route.js');
const userRoutes = require('./routes/user.route.js');
const chatbotRoutes = require('./routes/chatbot.route.js');
const adminRoutes = require('./routes/admin.route.js');
const qrRoutes = require('./routes/qr.route.js');

// 4. Thực hiện kết nối tới các cơ sở dữ liệu
connectDB();
connectRedis();

const app = express();

// 5. Sử dụng các middleware chung
app.use(cors());
app.use(express.json());

// 6. Sử dụng các router
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/qr', qrRoutes);

// Route mặc định để kiểm tra server
app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

// Khởi động server và preload ticket cache
app.listen(PORT, async () => {
    console.log(`Server is running at port ${PORT}`);

    // Preload ticket cache sau khi server khởi động
    try {
        const TicketCacheManager = require('./utils/ticketCacheManager');

        // Delay 5 giây để đảm bảo database đã kết nối
        setTimeout(async () => {
            const result = await TicketCacheManager.preloadRecentTickets();
            if (result.error) {
                console.warn('Failed to preload ticket cache:', result.error);
            } else {
                console.log('Ticket cache initialized successfully');
            }
        }, 5000);
    } catch (error) {
        console.warn('⚠️ Ticket cache initialization failed:', error.message);
    }
});
