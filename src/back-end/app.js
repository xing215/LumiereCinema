// app.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, connectRedis } = require('./config/database.config'); // Import từ file config

// Nạp biến môi trường
dotenv.config();

// Thực hiện kết nối
connectDB();
connectRedis();

const app = express();
app.use(cors());
app.use(express.json());

// Example route
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));