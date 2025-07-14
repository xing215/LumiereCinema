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

/**
 * Middleware để kiểm tra vai trò của người dùng
 * @param {...string} roles - Các vai trò được phép truy cập
 */
const restrictTo = (...roles) => {
    return (req, res, next) => {
        // Kiểm tra xem user có tồn tại không (từ middleware protect)
        if (!req.user) {
            return res.status(401).json({ message: 'Vui lòng đăng nhập để truy cập.' });
        }

        // Kiểm tra xem user có ít nhất một vai trò được phép không
        const hasPermission = req.user.roles.some(role => roles.includes(role));
        
        if (!hasPermission) {
            return res.status(403).json({ 
                message: 'Bạn không có quyền truy cập vào tài nguyên này.' 
            });
        }

        next();
    };
};

module.exports = { protect, restrictTo };