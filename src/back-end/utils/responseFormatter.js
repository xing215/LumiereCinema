// utils/responseFormatter.js

class ResponseFormatter {
  constructor() {    // Các mẫu câu trả lời ngẫu nhiên để chatbot tự nhiên hơn + Non-movie handling
    this.templates = {
      greeting: [
        "Xin chào! Tôi là AI Assistant của Lumiere Cinema. Tôi có thể giúp bạn tìm phim, xem lịch chiếu, và đặt vé. Bạn cần hỗ trợ gì?",
        "Chào bạn! 👋 Lumiere Cinema có gì có thể giúp bạn hôm nay? Tìm phim hay, xem lịch chiếu, hay đặt vé luôn?",
        "Hi! Tôi sẵn sàng giúp bạn khám phá thế giới điện ảnh tại Lumiere Cinema! 🎬"
      ],
        non_movie_fallback: [
        "Tôi là AI chuyên hỗ trợ về phim ảnh và dịch vụ rạp chiếu phim Lumiere Cinema. Bạn có muốn xem phim gì hay không? 🎬",
        "Câu hỏi này nằm ngoài chuyên môn của tôi. Tôi chỉ giúp bạn về phim, lịch chiếu và đặt vé thôi ạ. Có phim nào bạn quan tâm không?",
        "Hmm, tôi không thể trả lời về chủ đề này. Nhưng tôi có thể giúp bạn tìm phim hay đang chiếu! Bạn thích thể loại gì?",
        "Xin lỗi, tôi chỉ am hiểu về lĩnh vực điện ảnh thôi. Bạn có muốn khám phá phim mới tại Lumiere Cinema không? 🍿"
      ],

      search_conversation: [
        "Tôi hiểu bạn đang tìm phim hay! 🎬 Để gợi ý phù hợp, bạn có thể cho tôi biết:\n• Thích thể loại gì? (hành động, tình cảm, kinh dị, hài...)\n• Muốn xem phim đang chiếu hay sắp chiếu?\n• Có diễn viên hoặc đạo diễn yêu thích không?",
        "Hay quá! Tôi sẽ giúp bạn tìm phim tuyệt vời 🌟 Bạn có thể:\n• Nói thể loại yêu thích\n• Hỏi \"phim gì đang chiếu?\"\n• Tìm theo tên diễn viên/đạo diễn\n• Hoặc xem phim hot nhất hiện tại!",
        "Chúng tôi có rất nhiều phim hay! 🍿 Bạn muốn:\n• Xem phim đang chiếu hot nhất?\n• Khám phá phim sắp ra mắt?\n• Tìm theo thể loại cụ thể?\n• Hay để tôi gợi ý phim theo sở thích?",
        "Tuyệt! Lumiere Cinema có nhiều bộ phim hấp dẫn 🎭 Bạn có thể:\n• Hỏi \"có phim gì hay đang chiếu?\"\n• Nói thể loại yêu thích (VD: \"tìm phim hành động\")\n• Tìm phim của diễn viên cụ thể\n• Xem danh sách phim sắp chiếu"
      ],

      movie_list_header: [
        "Tôi tìm thấy {count} phim {filter} cho bạn:",
        "Hiện có {count} phim {filter} rất hay:",
        "Đây là {count} phim {filter} bạn có thể xem:"
      ],
      
      missing_info_specific: {
        movie_title: [
          "Bạn muốn xem lịch chiếu phim gì ạ? (VD: Avatar, Spider-Man, Iron Man)",
          "Cho tôi biết tên phim bạn quan tâm nhé!",
          "Phim nào bạn đang muốn tìm lịch chiếu?"
        ],        location: [
          "Bạn muốn xem ở rạp nào? Lumiere Cinema có: Nguyễn Văn Cừ, Nguyễn Huệ, Huỳnh Tấn Phát",
          "Chọn chi nhánh bạn muốn đến: Nguyễn Văn Cừ, Nguyễn Huệ, hay Huỳnh Tấn Phát?",
          "Rạp nào tiện cho bạn? (Nguyễn Văn Cừ / Nguyễn Huệ / Huỳnh Tấn Phát)"
        ],
        date: [
          "Bạn muốn xem vào ngày nào? (VD: hôm nay, mai, thứ 7, hoặc 25/12)",
          "Ngày nào phù hợp với bạn? Có thể nói 'hôm nay', 'mai' hoặc ngày cụ thể",
          "Chọn ngày xem phim: hôm nay, ngày mai, hay ngày khác?"
        ]
      },

      missing_info_prefix: [
        "Để tìm lịch chiếu chính xác, tôi cần biết thêm ",
        "Cho tôi biết thêm ",
        "Bạn vui lòng cung cấp thêm "
      ],

      schedule_found: [
        "Tìm thấy lịch chiếu phim {movie} tại {location} ngày {date}:",
        "Lịch chiếu phim {movie} - {location} - {date}:",
        "Đây là các suất chiếu phim {movie} tại {location} vào {date}:"
      ],

      no_schedules: [
        "Rất tiếc, không có suất chiếu phim {movie} tại {location} vào {date}",
        "Hiện tại chưa có lịch chiếu phim {movie} ở {location} ngày {date}",
        "Phim {movie} chưa có suất chiếu tại {location} vào {date}"
      ]
    };
  }

  /**
   * Lấy một mẫu câu ngẫu nhiên từ template
   * @param {string} type - Loại template (ví dụ: 'greeting')
   * @returns {string} Một câu ngẫu nhiên
   */
  getRandomTemplate(type) {
    const templates = this.templates[type] || [''];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * [MỚI] Format cho phản hồi chi tiết phim
   * @param {object} movie - Đối tượng movie từ database
   * @returns {object} Phản hồi có cấu trúc
   */
  formatMovieDetails(movie) {
    if (!movie) {
      return this.formatErrorResponse('movie_not_found');
    }

    return {
      type: 'movie_details',
      message: `Đây là thông tin chi tiết về phim "${movie.title}":`,
      data: {
        _id: movie._id,
        title: movie.title,
        description: movie.description,
        posterURL: movie.posterURL,
        trailerURL: movie.trailerURL,
        genre: movie.genre,
        director: movie.director,
        cast: movie.cast,
        releaseDate: new Date(movie.releaseDate).toLocaleDateString('vi-VN'),
        duration: `${movie.duration} phút`,
        ageRating: movie.ageRating,
        rating: `⭐ ${movie.ratingsAverage?.toFixed(1) || 'Chưa có'}/10 (${movie.ratingsQuantity || 0} lượt)`
      },
      quick_actions: [
        { text: 'Xem lịch chiếu', action: 'find_schedules', data: { movie_id: movie._id, movie_title: movie.title } },
        { text: 'Đặt vé phim này', action: 'booking_flow', data: { movie_id: movie._id, movie_title: movie.title } },
        { text: 'Thêm vào danh sách yêu thích', action: 'add_to_wishlist', data: { movie_id: movie._id } }
      ]
    };
  }

  /**
   * [MỚI] Format cho câu hỏi lại khi thiếu thông tin
   * @param {string[]} missingFields - Mảng các thông tin bị thiếu (ví dụ: ['location', 'date'])
   * @param {object} context - Ngữ cảnh hiện tại của cuộc hội thoại
   * @returns {object} Phản hồi có cấu trúc
   */
  formatMissingInfoQuestion(missingFields, context) {
    const fieldTranslations = {
      movie_title: 'tên phim',
      location: 'rạp bạn muốn xem',
      date: 'ngày bạn muốn xem'
    };

    const translatedFields = missingFields.map(field => fieldTranslations[field] || field);
    const messagePrefix = this.getRandomTemplate('missing_info_prefix');
    const question = `${messagePrefix}${translatedFields.join(' và ')} nhé.`;    // Gợi ý cho người dùng
    const suggestions = [];
    if (missingFields.includes('location')) {
      suggestions.push({ text: '📍 Nguyễn Văn Cừ', action: 'provide_info', data: { location: 'Nguyễn Văn Cừ' } });
      suggestions.push({ text: '📍 Nguyễn Huệ', action: 'provide_info', data: { location: 'Nguyễn Huệ' } });
      suggestions.push({ text: '📍 Huỳnh Tấn Phát', action: 'provide_info', data: { location: 'Huỳnh Tấn Phát' } });
    }
    if (missingFields.includes('date')) {
      suggestions.push({ text: 'Hôm nay', action: 'provide_info', data: { date: 'hôm nay' } });
      suggestions.push({ text: 'Ngày mai', action: 'provide_info', data: { date: 'ngày mai' } });
    }

    return {
      type: 'follow_up_question',
      message: question,
      context_provided: context.entities, // Nhắc lại những gì chatbot đã biết
      suggestions: suggestions,
      quick_actions: ['Hôm nay', 'Ngày mai', 'Cuối tuần']
    };
  }

  /**
   * [MỚI] Format phản hồi cho câu hỏi không liên quan phim
   * @returns {object} Phản hồi từ chối lịch sự và hướng về phim
   */
  formatNonMovieResponse() {
    const message = this.getRandomTemplate('non_movie_fallback');
    return {
      type: 'non_movie_related',
      message: message,
      suggestions: [
        { text: 'Phim đang chiếu', action: 'get_now_showing' },
        { text: 'Phim sắp chiếu', action: 'get_upcoming' },
        { text: 'Tìm phim hay', action: 'search_movies' },
        { text: 'Xem lịch chiếu', action: 'find_schedules' }
      ],
      quick_actions: ['Phim hot', 'Phim mới', 'Action', 'Comedy']
    };
  }

  /**
   * [NÂNG CẤP] Format câu hỏi thông minh cho từng tham số thiếu
   * @param {string} missingParam - Tham số đang thiếu ('movie_title', 'location', 'date')
   * @param {object} context - Context hiện tại
   * @returns {object} Phản hồi thông minh
   */
  formatSmartMissingQuestion(missingParam, context = {}) {
    const templates = this.templates.missing_info_specific[missingParam] || [];
    const message = templates[Math.floor(Math.random() * templates.length)] || `Bạn vui lòng cung cấp ${missingParam}`;
    
    // Suggestions thông minh dựa trên tham số thiếu
    let suggestions = [];
    let quickActions = [];

    switch (missingParam) {
      case 'movie_title':
        suggestions = [
          { text: 'Phim đang hot', action: 'get_popular_movies' },
          { text: 'Phim mới nhất', action: 'get_latest_movies' }
        ];
        quickActions = ['Avatar', 'Spider-Man', 'Iron Man', 'Fast & Furious'];
        break;
          case 'location':
        suggestions = [
          { text: '📍 Nguyễn Văn Cừ', action: 'select_branch', data: { location: 'Nguyễn Văn Cừ' } },
          { text: '📍 Nguyễn Huệ', action: 'select_branch', data: { location: 'Nguyễn Huệ' } },
          { text: '📍 Huỳnh Tấn Phát', action: 'select_branch', data: { location: 'Huỳnh Tấn Phát' } }
        ];
        quickActions = ['Nguyễn Văn Cừ', 'Nguyễn Huệ', 'Huỳnh Tấn Phát', 'Gần tôi'];
        break;
        
      case 'date':
        suggestions = [
          { text: 'Hôm nay', action: 'select_date', data: { date: 'today' } },
          { text: 'Ngày mai', action: 'select_date', data: { date: 'tomorrow' } },
          { text: 'Cuối tuần', action: 'select_date', data: { date: 'weekend' } }
        ];
        quickActions = ['Hôm nay', 'Mai', 'Thứ 7', 'Chủ nhật'];
        break;
    }

    return {
      type: 'parameter_request',
      message: message,
      missing_parameter: missingParam,
      current_context: context.entities || {},
      suggestions: suggestions,
      quick_actions: quickActions
    };
  }

  /**
   * [HOÀN THIỆN] Format cho các thông báo lỗi
   * @param {string} errorType - Loại lỗi (ví dụ: 'movie_not_found')
   * @returns {object} Phản hồi có cấu trúc
   */
  formatErrorResponse(errorType = 'api_error') {
    const errorTemplates = {
      movie_not_found: {
        message: '😅 Xin lỗi, tôi không tìm thấy phim nào với tên đó. Bạn có muốn thử tìm tên khác không?',
        suggestions: [
          { text: 'Xem tất cả phim đang chiếu', action: 'find_movies', data: { status: 'now-showing' } }
        ]
      },
      branch_not_found: {
        message: '😕 Rất tiếc, tôi không tìm thấy rạp nào ở địa điểm đó. Bạn có muốn xem danh sách các rạp đang hoạt động không?',
        suggestions: [
          { text: 'Tất cả các rạp', action: 'list_branches' }
        ]
      },
      schedule_not_found: {
        message: '📅 Không tìm thấy lịch chiếu nào phù hợp. Bạn muốn thử tìm ngày khác hay rạp khác không?',
        suggestions: [
          { text: 'Chọn ngày khác', action: 'change_date' },
          { text: 'Chọn rạp khác', action: 'change_branch' }
        ]
      },
      api_error: {
        message: '⚠️ Đã có lỗi xảy ra từ hệ thống. Vui lòng thử lại sau ít phút.',
        suggestions: []
      }
    };    return {
      type: 'error',
      ...errorTemplates[errorType] || errorTemplates.api_error
    };
  }

  /**
   * [MỚI] Format response cho search conversation (câu hỏi chung chung)
   * @returns {object} Phản hồi conversational với gợi ý
   */
  formatSearchConversationResponse() {
    const message = this.getRandomTemplate('search_conversation');

    return {
      type: 'search_conversation',
      message: message,
      suggestions: [
        { text: '🎬 Phim đang chiếu', action: 'get_now_showing' },
        { text: '🔜 Phim sắp chiếu', action: 'get_upcoming' },
        { text: '🔥 Phim hành động', action: 'search_movies', data: { genre: 'Action' } },
        { text: '💕 Phim tình cảm', action: 'search_movies', data: { genre: 'Romance' } },
        { text: '😱 Phim kinh dị', action: 'search_movies', data: { genre: 'Horror' } },
        { text: '😂 Phim hài', action: 'search_movies', data: { genre: 'Comedy' } }
      ],
      quick_actions: [
        'Phim hay đang chiếu',
        'Phim sắp ra',
        'Phim hành động',
        'Phim Marvel'
      ]
    };
  }

  // --- CÁC HÀM CŨ GIỮ NGUYÊN VÀ CẢI TIẾN ---
  formatMovieList(movies, query = {}) {
    if (!movies || movies.length === 0) {
      return this.formatErrorResponse('movie_not_found');
    }

    // Tạo message header dựa trên loại tìm kiếm
    let header;
    if (query.search_type) {
      switch (query.search_type) {
        case 'actor':
          header = `Tìm thấy ${movies.length} phim có diễn viên "${query.search_keyword}":`;
          break;
        case 'director':
          header = `Tìm thấy ${movies.length} phim của đạo diễn "${query.search_keyword}":`;
          break;
        case 'genre':
          header = `Tìm thấy ${movies.length} phim thể loại "${query.search_keyword}":`;
          break;
        default:
          header = `Tìm thấy ${movies.length} phim phù hợp với "${query.search_keyword || query.movie_title}":`;
      }
    } else {
      const filterText = query.status === 'upcoming' ? 'sắp chiếu' : 'đang chiếu';
      header = this.getRandomTemplate('movie_list_header')
        .replace('{count}', movies.length)
        .replace('{filter}', filterText);
    }return {
      type: 'movie_list',
      message: header,
      status: query.status, // Thêm status để frontend biết loại danh sách
      data: movies.map(movie => ({
        _id: movie._id,
        title: movie.title,
        posterURL: movie.posterURL,
        //... các trường khác
        quick_actions: [
          { text: 'Xem lịch chiếu', action: 'find_schedules', data: { movie_title: movie.title } },
          { text: 'Xem chi tiết', action: 'movie_details', data: { movie_id: movie._id } }
        ]
      }))
    };
  }
  /**
   * [NÂNG CẤP] Format phản hồi lịch chiếu với thông tin đầy đủ
   * @param {object} scheduleData - Dữ liệu lịch chiếu từ API
   * @param {object} entities - Thông tin movie, location, date
   * @returns {object} Phản hồi có cấu trúc
   */
  formatScheduleResponse(scheduleData, entities) {
    // Xử lý cấu trúc API: schedules nằm trong screens array
    let allSchedules = [];
    
    if (scheduleData && scheduleData.screens && Array.isArray(scheduleData.screens)) {
      // Lấy tất cả schedules từ các screen
      scheduleData.screens.forEach(screen => {
        if (screen.schedules && Array.isArray(screen.schedules)) {
          allSchedules = allSchedules.concat(screen.schedules.map(schedule => ({
            ...schedule,
            screenInfo: screen.screenInfo // Thêm thông tin screen
          })));
        }
      });
    }

    // Kiểm tra nếu không có lịch chiếu nào
    if (allSchedules.length === 0) {
      const noScheduleMsg = this.getRandomTemplate('no_schedules')
        .replace('{movie}', entities.movie_title || 'phim này')
        .replace('{location}', entities.location || 'rạp này')
        .replace('{date}', entities.date || 'ngày này');
      
      return {
        type: 'no_schedules',
        message: noScheduleMsg,
        suggestions: [
          { text: 'Chọn ngày khác', action: 'change_date' },
          { text: 'Chọn rạp khác', action: 'change_location' },
          { text: 'Xem phim khác', action: 'browse_movies' }
        ]
      };
    }

    const headerMsg = this.getRandomTemplate('schedule_found')
      .replace('{movie}', entities.movie_title || 'phim này')
      .replace('{location}', entities.location || 'rạp này')
      .replace('{date}', entities.date || 'ngày này');    return {
      type: 'schedule_list',
      message: headerMsg,
      data: {
        movie_id: scheduleData.movieId || entities.movie_id, // Thêm movie_id
        branch_id: scheduleData.branchId || entities.branch_id, // Thêm branch_id
        movie_title: entities.movie_title,
        branch_location: entities.location,
        date: entities.date,
        total_schedules: allSchedules.length,        schedules: allSchedules.map(schedule => ({
          _id: schedule._id,
          time: schedule.startTime,
          room: schedule.screenInfo?.screenName || 'N/A',
          available_seats: schedule.seatInfo?.availableSeatsCount || 'N/A',
          price: schedule.price || 'N/A',
          quick_actions: [
            { text: 'Đặt vé suất này', action: 'book_ticket', data: { 
              schedule_id: schedule._id,
              movie_id: scheduleData.movieId || entities.movie_id,
              branch_id: scheduleData.branchId || entities.branch_id
            } }
          ]
        }))
      },
      suggestions: [
        { text: 'Đặt vé ngay', action: 'start_booking' },
        { text: 'Xem ngày khác', action: 'change_date' },
        { text: 'Tìm phim khác', action: 'browse_movies' }
      ]
    };
  }
}

module.exports = new ResponseFormatter();