const Movie = require('../models/Movie.js');
// Import redisClient đã được khởi tạo từ file config của bạn
const { redisClient } = require('../config/redis.config.js');

// Thời gian cache hết hạn mặc định (tính bằng giây), ở đây là 10 phút
const DEFAULT_EXPIRATION = 600;
const DETAIL_CACHE_EXPIRATION = 3600;

/**
 * @desc    Lấy danh sách phim đang chiếu (tối ưu với Redis & Projection)
 * @route   GET /api/movies/now-showing
 */
const getNowShowingMovies = async (req, res) => {
    const cacheKey = 'movies:now-showing';

    try {
        // 1. KIỂM TRA TRONG CACHE TRƯỚC
        const cachedMovies = await redisClient.get(cacheKey);
        if (cachedMovies) {
            console.log('Cache Hit for now-showing movies!');
            return res.status(200).json(JSON.parse(cachedMovies));
        }

        // 2. NẾU KHÔNG CÓ TRONG CACHE (CACHE MISS) -> TRUY VẤN DATABASE
        console.log('Cache Miss! Fetching from DB...');
        // Dùng .select() để chỉ lấy các trường cần thiết, giảm lượng dữ liệu truyền tải
        const movies = await Movie.find({ status: 'Now Showing' })
            .sort({ releaseDate: -1 })
            .select('title posterURL duration genre ageRating ratingsAverage');

        // 3. LƯU KẾT QUẢ VÀO CACHE ĐỂ DÙNG CHO LẦN SAU
        await redisClient.set(cacheKey, JSON.stringify(movies), {
            EX: DEFAULT_EXPIRATION,
        });

        res.status(200).json(movies);

    } catch (error) {
        console.error('Get Now Showing Movies Error:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra ở máy chủ.' });
    }
};

/**
 * @desc    Lấy danh sách phim sắp chiếu (tối ưu với Redis)
 * @route   GET /api/movies/upcoming
 * @access  Public
 */

const getUpcomingMovies = async (req, res) => {
    // Định nghĩa một cache key riêng cho "upcoming"
    const cacheKey = 'movies:upcoming';

    try {
        // 1. Kiểm tra cache trước
        const cachedMovies = await redisClient.get(cacheKey);
        if (cachedMovies) {
            console.log('Cache Hit for upcoming movies!');
            return res.status(200).json(JSON.parse(cachedMovies));
        }

        // 2. Nếu cache miss, truy vấn DB
        console.log('Cache Miss! Fetching upcoming movies from DB...');
        const movies = await Movie.find({ status: 'Upcoming' })
            .sort({ releaseDate: 1 }) // Sắp xếp theo ngày phát hành gần nhất
            .select('title posterURL releaseDate genre');

        // 3. Lưu vào cache
        await redisClient.set(cacheKey, JSON.stringify(movies), {
            EX: DEFAULT_EXPIRATION,
        });

        res.status(200).json(movies);
    } catch (error) {
        console.error('Get Upcoming Movies Error:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra ở máy chủ.' });
    }
};

/**
 * @desc    Lấy chi tiết một bộ phim theo ID (tối ưu với Redis)
 * @route   GET /api/movies/:id
 * @access  Public
 */
const getMovieDetails = async (req, res) => {
    // Khóa cache sẽ là duy nhất cho mỗi phim, ví dụ: 'movie:6860b11d3d13366261a33aca'
    const cacheKey = `movie:${req.params.id}`;

    try {
        const cachedMovie = await redisClient.get(cacheKey);
        if (cachedMovie) {
            console.log(`Cache Hit for movie ID: ${req.params.id}!`);
            return res.status(200).json(JSON.parse(cachedMovie));
        }

        console.log(`Cache Miss! Fetching movie ID: ${req.params.id} from DB...`);
        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({ message: 'Không tìm thấy phim.' });
        }

        // Lưu vào cache với thời gian hết hạn dự phòng là 1 giờ
        await redisClient.set(cacheKey, JSON.stringify(movie), {
            EX: DETAIL_CACHE_EXPIRATION,
        });

        res.status(200).json(movie);
    } catch (error) {
        console.error('Get Movie Details Error:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra ở máy chủ.' });
    }
};


/**
 * @desc    Tìm kiếm phim bằng Atlas Search
 * @route   GET /api/movies/search?q=...
 * @access  Public
 */
const searchMovies = async (req, res) => {
    try {
        const keyword = req.query.q;
        if (!keyword) {
            return res.status(400).json({ message: 'Vui lòng cung cấp từ khóa tìm kiếm.' });
        }

        // Dùng aggregation pipeline với giai đoạn $search
        const movies = await Movie.aggregate([
            {
                $search: {
                    index: 'movie_search_index', // Tên index bạn đã tạo trên MongoDB Atlas
                    text: {
                        query: keyword,
                        path: {
                            'wildcard': '*' // Tìm trên tất cả các trường đã được index (title, description, cast, director)
                        },
                        fuzzy: {
                            maxEdits: 1 // Cho phép sai khác 1 ký tự (xử lý lỗi chính tả)
                        }
                    }
                }
            },
            {
                $project: { // Tương tự .select(), chỉ lấy các trường cần thiết
                    title: 1,
                    posterURL: 1,
                    duration: 1,
                    genre: 1,
                    ageRating: 1,
                    ratingsAverage: 1,
                    score: { $meta: "searchScore" } // Lấy điểm liên quan do Atlas Search chấm
                }
            },
            {
                $sort: { score: -1 } // Sắp xếp theo điểm liên quan cao nhất
            },
            {
                $limit: 5 // Giới hạn kết quả trả về để tránh quá tải
            },
        ]);

        res.status(200).json(movies);

    } catch (error) {
        console.error('Search Movies Error:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra ở máy chủ.' });
    }
};

// Cập nhật lại module.exports để thêm hàm mới
module.exports = {
    getNowShowingMovies,
    getUpcomingMovies,
    getMovieDetails,
    searchMovies, // Thêm hàm mới
};