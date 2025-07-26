// app.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 2. Nạp biến môi trường (LUÔN ĐẶT LÊN ĐẦU)
dotenv.config();

// 1. Import các hàm kết nối từ file config
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

// 3. Thực hiện kết nối tới các cơ sở dữ liệu
connectDB();
connectRedis();

const app = express();

// 4. Sử dụng các middleware chung
app.use(cors());
app.use(express.json());

// 5. Sử dụng các router
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes); 
app.use('/api/reports', reportRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/admin', adminRoutes);

// Route mặc định để kiểm tra server
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running at port ${PORT}`));
