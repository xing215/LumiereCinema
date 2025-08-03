// controllers/chatbot.controller.js

const ResponseFormatter = require('../utils/responseFormatter.js');
const ConversationManager = require('../utils/conversationManager.js');
const { analyzeQuery } = require('../utils/LLMService.js');

// Import các controller nghiệp vụ
const movieController = require('./movie.controller.js');
const ticketController = require('./ticket.controller.js');
const branchController = require('./branch.controller.js');

/**
 * @desc    Query chatbot - Xử lý 5 chức năng cốt lõi 
 * @route   POST /api/chatbot/query
 * @access  Public
 */
const queryChatbot = async (req, res) => {
  let capturedData = null; 

  const mockRes = {
    status: function(code) {
      return this; // Cho phép chaining .status().json()
    },
    json: function(data) {
      capturedData = data; // "Bắt" dữ liệu và gán vào biến bên ngoài
    }
  };
  // ======================================================

  try {
    const { question, sessionId } = req.body;

    // Validation
    if (!question || typeof question !== 'string' || question.trim() === '') {
      return res.status(400).json({ error: 'Câu hỏi không được để trống' });
    }
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId là bắt buộc để duy trì hội thoại' });
    }    // === BƯỚC 1: LẤY NGỮ CẢNH & PHÂN TÍCH CÂU HỎI ===
    const context = await ConversationManager.getContext(sessionId);
    const analysis = await analyzeQuery(question.trim(), sessionId, context);

    let finalResponse;

    // === BƯỚC 2: XỬ LÝ CÂU HỎI KHÔNG LIÊN QUAN PHIM ===
    if (analysis.intent === 'non_movie_related') {
      finalResponse = ResponseFormatter.formatNonMovieResponse();
      await ConversationManager.addToHistory(sessionId, question, finalResponse, analysis);
      return res.status(200).json(finalResponse);
    }

    // === BƯỚC 3: XỬ LÝ CHỨC NĂNG getScheduleByBranch (QUAN TRỌNG NHẤT) ===
    if (analysis.intent === 'find_schedules') {
      finalResponse = await handleScheduleSearch(analysis, context, sessionId, question, mockRes, req);
      
      await ConversationManager.addToHistory(sessionId, question, finalResponse, analysis);
      return res.status(200).json(finalResponse);
    }

    // === BƯỚC 4: XỬ LÝ 4 CHỨC NĂNG CỐT LÕI KHÁC ===
    switch (analysis.intent) {
      case 'get_now_showing': {
        try {
          // Gọi hàm controller, nó sẽ không trả về gì nhưng sẽ gọi mockRes.json
          await movieController.getNowShowingMovies(req, mockRes);
          // Bây giờ, dữ liệu đã nằm trong capturedData
          const movies = capturedData; 
          finalResponse = ResponseFormatter.formatMovieList(movies, { status: 'now-showing' });
        } catch (error) {
          console.error('Error getting now showing movies:', error);
          finalResponse = ResponseFormatter.formatErrorResponse('api_error');
        }
        break;
      }

      case 'get_upcoming': {
        try {
          await movieController.getUpcomingMovies(req, mockRes);
          const movies = capturedData;
          finalResponse = ResponseFormatter.formatMovieList(movies, { status: 'upcoming' });
        } catch (error) {
          console.error('Error getting upcoming movies:', error);
          finalResponse = ResponseFormatter.formatErrorResponse('api_error');
        }
        break;
      }      case 'search_movies': {
        // Kiểm tra có thông tin tìm kiếm không (title hoặc keyword)
        if (!analysis.entities.movie_title && !analysis.entities.search_keyword) {
          finalResponse = ResponseFormatter.formatSmartMissingQuestion('movie_title', { entities: analysis.entities });
          break;
        }
        
        try {          // Xác định từ khóa tìm kiếm
          const searchQuery = analysis.entities.movie_title || analysis.entities.search_keyword;
          const searchReq = { query: { q: searchQuery } };
          
          await movieController.searchMovies(searchReq, mockRes);
          const movies = capturedData;
          finalResponse = ResponseFormatter.formatMovieList(movies, analysis.entities);
        } catch (error) {
          console.error('Error searching movies:', error);
          finalResponse = ResponseFormatter.formatErrorResponse('api_error');
        }
        break;
      }      case 'search_conversation': {
        // Trả lời conversational thay vì tìm kiếm trực tiếp
        finalResponse = ResponseFormatter.formatSearchConversationResponse();
        break;
      }      case 'schedule_conversation': {
        // Hỏi người dùng muốn xem lịch chiếu phim nào
        finalResponse = ResponseFormatter.formatScheduleConversationResponse();
        break;
      }

      case 'search_for_schedule': {
        // User đã nhập tên phim, tìm và hiển thị top 3 kết quả
        if (!analysis.entities.movie_title) {
          finalResponse = ResponseFormatter.formatSmartMissingQuestion('movie_title', { entities: analysis.entities });
          break;
        }
        
        try {
          const searchReq = { query: { q: analysis.entities.movie_title } };
          await movieController.searchMovies(searchReq, mockRes);
          const movies = capturedData;
          
          if (movies && movies.length > 0) {
            // Format as movie list với context cho schedule
            const scheduleFocusedMovies = movies.map(movie => ({
              ...movie,
              context: 'schedule' // Đánh dấu để frontend biết context
            }));
            finalResponse = ResponseFormatter.formatMovieListForSchedule(scheduleFocusedMovies, analysis.entities);
          } else {
            finalResponse = ResponseFormatter.formatErrorResponse('movie_not_found');
          }
        } catch (error) {
          console.error('Error searching movies for schedule:', error);
          finalResponse = ResponseFormatter.formatErrorResponse('api_error');
        }
        break;
      }

      case 'movie_details': {
        let movieId = analysis.entities.movie_id;
        
        if (!movieId && analysis.entities.movie_title) {
          try {
            const searchReq = { query: { q: analysis.entities.movie_title } };
            await movieController.searchMovies(searchReq, mockRes);
            const searchResult = capturedData;
            if (searchResult && searchResult.length > 0) {
              movieId = searchResult[0]._id;
            }
          } catch (error) {
            console.error('Error searching for movie ID:', error);
          }
        }

        if (!movieId) {
          finalResponse = ResponseFormatter.formatErrorResponse('movie_not_found');
          break;
        }

        try {
          const detailReq = { params: { id: movieId } };
          await movieController.getMovieDetails(detailReq, mockRes);
          const movieDetails = capturedData;
          finalResponse = ResponseFormatter.formatMovieDetails(movieDetails);
        } catch (error) {
          console.error('Error getting movie details:', error);
          finalResponse = ResponseFormatter.formatErrorResponse('api_error');
        }
        break;
      }

      default: {
        finalResponse = { 
          type: 'greeting',
          message: ResponseFormatter.getRandomTemplate('greeting'),
          suggestions: [
            { text: 'Phim đang chiếu', action: 'get_now_showing' },
            { text: 'Phim sắp chiếu', action: 'get_upcoming' },
            { text: 'Tìm phim', action: 'search_movies' },
            { text: 'Xem lịch chiếu', action: 'find_schedules' }
          ]
        };
      }
    }

    // === BƯỚC 5: LƯU LỊCH SỬ VÀ TRẢ VỀ PHẢN HỒI ===
    await ConversationManager.addToHistory(sessionId, question, finalResponse, analysis);

    return res.status(200).json(finalResponse);

  } catch (error) {
    console.error('Chatbot Controller Error:', error);
    const errorResponse = ResponseFormatter.formatErrorResponse('api_error');
    return res.status(500).json(errorResponse);
  }
};

// Hàm handleScheduleSearch cũng cần sử dụng kỹ thuật "bắt" dữ liệu này
async function handleScheduleSearch(analysis, context, sessionId, question, mockRes, req) {
  // Biến "bắt" dữ liệu chỉ dùng trong hàm này
  let capturedData = null;
  const localMockRes = {
    status: function(code) { return this; },
    json: function(data) { capturedData = data; }
  };
  
  try {    const combinedEntities = { ...(context.entities || {}), ...(analysis.entities || {}) };
    const requiredParams = ['movie_title', 'location', 'date'];
    const missingParams = requiredParams.filter(param => !combinedEntities[param]);

    if (missingParams.length > 0) {
      await ConversationManager.smartUpdateContext(sessionId, {
        lastIntent: 'find_schedules',
        entities: combinedEntities,
        missingParams: missingParams,
        step: 'collecting_params'
      });
      return ResponseFormatter.formatSmartMissingQuestion(missingParams[0], { entities: combinedEntities });
    }

    // 1. Tìm movie ID
    const searchReq = { query: { q: combinedEntities.movie_title } };
    await movieController.searchMovies(searchReq, localMockRes);
    const movies = capturedData;
    
    if (!movies || movies.length === 0) {
      await ConversationManager.clearContext(sessionId);
      return ResponseFormatter.formatErrorResponse('movie_not_found');    }
    const movieId = movies[0]._id;

    // 2. Tìm branch ID
    await branchController.getAvailableBranches(req, localMockRes);
    const branchesData = capturedData;
    const targetBranch = branchesData.branches?.find(b => 
      b.name.toLowerCase().includes(combinedEntities.location.toLowerCase()) ||
      b.address.toLowerCase().includes(combinedEntities.location.toLowerCase())
    );

    if (!targetBranch) {
      await ConversationManager.clearContext(sessionId);      return ResponseFormatter.formatErrorResponse('branch_not_found');
    }    // 3. Chuẩn hóa date format
    const normalizedDate = normalizeDateString(combinedEntities.date);
    
    // 4. Gọi API lịch chiếu
    const scheduleReq = { params: { branchId: targetBranch._id }, query: { date: normalizedDate, movieId } };
    await ticketController.getSchedulesByBranch(scheduleReq, localMockRes);
    const schedules = capturedData;

    // 5. Format response và clear context - Thêm movieId và branchId vào schedules object
    const schedulesWithIds = {
      ...schedules,
      movieId: movieId,
      branchId: targetBranch._id
    };
    
    // Cũng thêm vào combinedEntities để ResponseFormatter có thể sử dụng
    const entitiesWithIds = {
      ...combinedEntities,
      movie_id: movieId,
      branch_id: targetBranch._id
    };
    
    const response = ResponseFormatter.formatScheduleResponse(schedulesWithIds, entitiesWithIds);
    await ConversationManager.clearContext(sessionId);
    return response;

  } catch (error) {
    console.error('Error in handleScheduleSearch:', error);
    await ConversationManager.clearContext(sessionId);
    return ResponseFormatter.formatErrorResponse('api_error');
  }
}

function normalizeDateString(dateString) {
  if (!dateString) return new Date().toISOString().split('T')[0];
  
  const lowerDate = dateString.toLowerCase().trim();
  const today = new Date();
  
  // Xử lý từ khóa tiếng Việt
  if (lowerDate.includes('hôm nay') || lowerDate === 'today') {
    return today.toISOString().split('T')[0];
  }
  
  if (lowerDate.includes('mai') || lowerDate === 'tomorrow') {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
  
  // Kiểm tra nếu đã là định dạng YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (dateRegex.test(dateString)) {
    return dateString;
  }
  
  // Thử parse ngày định dạng khác
  const parsedDate = new Date(dateString);
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate.toISOString().split('T')[0];
  }
  
  // Nếu không parse được, trả về hôm nay
  return today.toISOString().split('T')[0];
}

module.exports = {
  queryChatbot
};