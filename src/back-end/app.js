// app.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 1. Import các hàm kết nối từ file config
const { connectDB } = require('./config/database.config.js'); 
const { connectRedis } = require('./config/redis.config.js');

// Import các router
const authRoutes = require('./routes/auth.route.js');
const movieRoutes = require('./routes/movie.route.js'); 

// 2. Nạp biến môi trường (LUÔN ĐẶT LÊN ĐẦU)
dotenv.config();

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

// Route mặc định để kiểm tra server
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server đang chạy tại cổng ${PORT}`));
