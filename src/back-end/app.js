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
const reportRoutes = require('./routes/report.route.js'); 
const branchRoutes = require('./routes/branch.route.js');
const ticketRoute = require('./routes/ticket.route.js');

// 2. Load environment variables (ALWAYS PLACE AT THE TOP)
dotenv.config();

// 3. Connect to databases
connectDB();
connectRedis();

const app = express();

// 4. Use common middleware
const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));
app.use(express.json());

// 5. Sử dụng các router
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes); 
app.use('/api/reports', reportRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/tickets', ticketRoute);
// Route mặc định để kiểm tra server
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Uncomment the following lines if you want to run the server locally
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server đang chạy tại cổng ${PORT}`));

// For Vercel deployment, we need to export the app
// Comment this line if you want to run the server locally
module.exports = app;