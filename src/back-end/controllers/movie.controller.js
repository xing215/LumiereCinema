const Movie = require('../models/Movie.js');
const Schedule = require('../models/Schedule.js');
const MovieRating = require('../models/MovieRating.js');
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
            // Cache hit
            return res.status(200).json(JSON.parse(cachedMovies));
        }

        // 2. NẾU KHÔNG CÓ TRONG CACHE (CACHE MISS) -> TRUY VẤN DATABASE
        // Cache miss - fetch from database
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
            // Cache hit
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

/**
 * @desc    Lấy tất cả phim cho quản lý
 * @route   GET /api/movies/all
 * @access  Administrator
 */
const getAllMovies = async (req, res) => {
    try {
        const movies = await Movie.find({})
            .sort({ createdAt: -1 })
            .select('title posterURL duration genre status ageRating ratingsAverage createdAt');
        
        res.status(200).json(movies);
    } catch (error) {
        console.error('Get All Movies Error:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra ở máy chủ.' });
    }
};

/**
 * @desc    Thêm phim mới
 * @route   POST /api/movies
 * @access  Administrator
 */
const addMovie = async (req, res) => {
    try {
        const movieData = req.body;
        
        // Kiểm tra xem phim có tồn tại chưa
        const existingMovie = await Movie.findOne({ title: movieData.title });
        if (existingMovie) {
            return res.status(400).json({ message: 'Phim với tên này đã tồn tại.' });
        }

        const newMovie = new Movie(movieData);
        await newMovie.save();
        
        // Xóa cache để cập nhật dữ liệu mới
        await redisClient.del('movies:now-showing');
        await redisClient.del('movies:upcoming');
        
        res.status(201).json({
            message: 'Thêm phim thành công.',
            movie: newMovie
        });
    } catch (error) {
        console.error('Add Movie Error:', error);
        // MongoDB duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Phim với tên này đã tồn tại.' });
        }
        res.status(500).json({ message: 'Đã có lỗi xảy ra ở máy chủ.' });
    }
};

/**
 * @desc    Cập nhật phim (PUT/PATCH - toàn bộ hoặc một phần)
 * @route   PUT /api/movies/:movieId
 * @route   PATCH /api/movies/:movieId
 * @access  Administrator
 */
const updateMovie = async (req, res) => {
    try {
        const { movieId } = req.params;
        const updateData = req.body;
        
        // Sử dụng $set để cập nhật chỉ các trường được cung cấp
        // Ok cho cả PUT và PATCH
        const movie = await Movie.findByIdAndUpdate(
            movieId,
            { $set: updateData },
            { new: true, runValidators: true }
        );
        
        if (!movie) {
            return res.status(404).json({ message: 'Không tìm thấy phim.' });
        }
        
        // Xóa cache liên quan
        await redisClient.del('movies:now-showing');
        await redisClient.del('movies:upcoming');
        await redisClient.del(`movie:${movieId}`);
        
        res.status(200).json({
            message: 'Cập nhật phim thành công.',
            movie
        });
    } catch (error) {
        console.error('Update Movie Error:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra ở máy chủ.' });
    }
};

/**
 * @desc    Xóa phim
 * @route   DELETE /api/movies/:movieId
 * @access  Administrator
 */
const deleteMovie = async (req, res) => {
    try {
        const { movieId } = req.params;
        
        // Kiểm tra xem phim có lịch chiếu nào không
        const hasSchedules = await Schedule.findOne({ movie: movieId });
        if (hasSchedules) {
            // Trước khi trả về response, cần lấy thông tin phim
            const movie = await Movie.findById(movieId);
            if (!movie) {
                return res.status(404).json({ message: 'Không tìm thấy phim.' });
            }
            
            // Nếu có lịch chiếu, không cho xóa - sử dụng status code 400 thay vì 200
            return res.status(400).json({
                message: 'Phim này đang có lịch chiếu, không thể xóa.',
                movie
            });
        }
        
        // Nếu không có lịch chiếu, xóa hoàn toàn
        const movie = await Movie.findByIdAndDelete(movieId);
        
        if (!movie) {
            return res.status(404).json({ message: 'Không tìm thấy phim.' });
        }
        
        // Xóa cache liên quan
        await redisClient.del('movies:now-showing');
        await redisClient.del('movies:upcoming');
        await redisClient.del(`movie:${movieId}`);
        
        res.status(200).json({
            message: 'Phim đã được xóa khỏi hệ thống.',
            movie
        });
    } catch (error) {
        console.error('Delete Movie Error:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra ở máy chủ.' });
    }
};

/**
 * @desc    Lấy lịch chiếu của phim
 * @route   GET /api/movies/:movieId/showscreen
 * @access  Customer
 */
const getMovieShowtimes = async (req, res) => {
    try {
        const { movieId } = req.params;
        const { date } = req.query;
        
        // Kiểm tra phim có tồn tại không
        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({ message: 'Không tìm thấy phim.' });
        }
        
        let query = { movie: movieId };
        
        // Nếu có filter theo ngày
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            
            query.startTime = {
                $gte: startDate,
                $lt: endDate
            };
        } else {
            // Chỉ lấy lịch chiếu từ hiện tại trở đi
            query.startTime = { $gte: new Date() };
        }
        
        const schedules = await Schedule.find(query)
            .populate('screen', 'screenName capacity')
            .populate('movie', 'title duration')
            .sort({ startTime: 1 });
        
        res.status(200).json(schedules);
    } catch (error) {
        console.error('Get Movie Showtimes Error:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra ở máy chủ.' });
    }
};

/**
 * @desc    Lấy tổng hợp đánh giá của phim
 * @route   GET /api/movies/:movieId/get-ratings
 * @access  Customer
 */
const getMovieRatingSummary = async (req, res) => {
    try {
        const { movieId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        
        // Kiểm tra phim có tồn tại không
        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({ message: 'Không tìm thấy phim.' });
        }
        
        const skip = (page - 1) * limit;
        
        const ratings = await MovieRating.find({ movie: movieId })
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const totalRatings = await MovieRating.countDocuments({ movie: movieId });
        
        res.status(200).json({
            ratings,
            totalRatings,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalRatings / limit),
            ratingsAverage: movie.ratingsAverage,
            ratingsQuantity: movie.ratingsQuantity
        });
    } catch (error) {
        console.error('Get Movie Rating Summary Error:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra ở máy chủ.' });
    }
};

// Cập nhật lại module.exports để thêm các hàm mới
module.exports = {
    getNowShowingMovies,
    getUpcomingMovies,
    getMovieDetails,
    searchMovies,
    getAllMovies,
    addMovie,
    updateMovie,
    deleteMovie,
    getMovieShowtimes,
    getMovieRatingSummary,
};