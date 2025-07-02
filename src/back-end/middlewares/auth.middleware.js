const jwt = require('jsonwebtoken');
const User = require('../models/User.js'); // Đảm bảo đường dẫn đến model là chính xác

/**
 * Middleware để bảo vệ các route yêu cầu xác thực.
 * Nó sẽ kiểm tra token trong header của request.
 */
const protect = async (req, res, next) => {
    let token;

    // 1. Kiểm tra xem header 'Authorization' có tồn tại và bắt đầu bằng 'Bearer' không
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 2. Tách lấy token từ header (loại bỏ chữ 'Bearer ')
            token = req.headers.authorization.split(' ')[1];

            // 3. Xác thực token bằng secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Lấy thông tin người dùng từ ID trong token và gắn vào request
            // Chúng ta loại bỏ trường hashedPassword để đảm bảo an toàn
            req.user = await User.findById(decoded.id).select('-hashedPassword');

            // 5. Nếu mọi thứ hợp lệ, cho phép request đi tiếp
            next();
        } catch (error) {
            // Nếu token không hợp lệ (hết hạn, sai chữ ký,...)
            return res.status(401).json({ message: 'Xác thực không thành công, token không hợp lệ.' });
        }
    }

    // Nếu không tìm thấy token trong header
    if (!token) {
        return res.status(401).json({ message: 'Xác thực không thành công, không tìm thấy token.' });
    }
};

module.exports = { protect };