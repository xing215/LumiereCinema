const ResponseFormatter = require('../utils/responseFormatter.js');
const ConversationManager = require('../utils/conversationManager.js');
const { analyzeQueryWithRAG } = require('../utils/LLMService.js');
const MovieRetrieverService = require('../utils/movieRetrieverService.js');

const movieRetrieverService = new MovieRetrieverService();

const queryChatbot = async (req, res) => {
  try {
    const { question, sessionId } = req.body;

    if (!question || typeof question !== 'string' || question.trim() === '') {
      return res.status(400).json({ error: 'Câu hỏi không được để trống' });
    }
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId là bắt buộc để duy trì hội thoại' });
    }

    const context = await ConversationManager.getContext(sessionId);
    const interactionContext = context.interactionContext || {};

    console.log('📱 Current Interaction Context:', interactionContext);

    const analysis = await analyzeQueryWithRAG(question.trim(), sessionId, context, interactionContext);

    console.log('🔍 Analysis Result:', analysis);

    const retrievedData = await gatherContextBasedOnAnalysis(analysis, context);

    console.log('📊 Retrieved Data:', retrievedData ? 'Data found' : 'No data');

    const finalResponse = ResponseFormatter.formatFinalResponse(analysis, retrievedData, context);

    console.log('✅ Final Response Generated');

    await ConversationManager.addToHistory(sessionId, question, finalResponse, analysis);

    return res.status(200).json(finalResponse);
  } catch (error) {
    console.error('Chatbot Controller Error:', error);
    const errorResponse = ResponseFormatter.formatErrorResponse('api_error');
    return res.status(500).json(errorResponse);
  }
};

// ======================= HÀM ĐÃ ĐƯỢC NÂNG CẤP =======================
async function gatherContextBasedOnAnalysis(analysis, context) {
  try {
    const interactionContext = context.interactionContext || {};
    console.log('🔍 Gathering data for intent:', analysis.intent);
    
    switch (analysis.intent) {
      case 'get_now_showing':
        return await movieRetrieverService.getNowShowingWithContext(interactionContext);

      case 'get_upcoming':
        return await movieRetrieverService.getUpcomingWithContext(interactionContext);
        
      case 'search_movies':
        return await movieRetrieverService.searchMoviesWithContext(analysis, interactionContext);

      case 'movie_details': {
        let movieId = analysis.entities.movie_id;
        if (!movieId && analysis.ragContext?.movies?.length > 0) {
          movieId = analysis.ragContext.movies[0]._id;
        }
        if (!movieId && analysis.entities.movie_title) {
          const searchResult = await movieRetrieverService.searchMoviesWithContext(analysis, interactionContext);
          if (searchResult && searchResult.length > 0) movieId = searchResult[0]._id;
        }
        if (!movieId) movieId = interactionContext.lastInteractedMovieId;
        if (!movieId) return null;
        return await movieRetrieverService.getMovieDetailsWithContext(movieId, interactionContext);
      }
      
      case 'find_schedules': {
        const combinedEntities = {
          ...(context.entities || {}), // Lấy entities từ context đã được merge
          ...(analysis.entities || {})
        };
        
        // Tối ưu: Nếu RAG đã tìm thấy phim, dùng luôn ID đó
        if (!combinedEntities.movie_id && analysis.ragContext?.movies?.length > 0) {
          combinedEntities.movie_id = analysis.ragContext.movies[0]._id;
          combinedEntities.movie_title = analysis.ragContext.movies[0].title;
        }
        
        if (!combinedEntities.movie_id && !combinedEntities.movie_title) {
          console.log('❌ No movie information available for schedule search');
          return null;
        }
        
        return await movieRetrieverService.getSchedulesWithContext(combinedEntities, interactionContext);
      }

      // ... (các case còn lại giữ nguyên)
      case 'search_for_schedule': {
        const movieTitle = analysis.entities.movie_title;
        if (!movieTitle) return null;
        return await movieRetrieverService.searchMoviesForScheduleWithContext(movieTitle, interactionContext);
      }
      default:
        return null;
    }
  } catch (error) {
    console.error('Error in gatherContextBasedOnAnalysis:', error);
    return null;
  }
}
// =====================================================================

const updateInteractionContext = async (req, res) => {
  // ... (Hàm này giữ nguyên không đổi)
  try {
    const { sessionId, interactionType, data } = req.body;
    if (!sessionId || !interactionType) {
      return res.status(400).json({ error: 'sessionId và interactionType là bắt buộc' });
    }
    console.log('📝 Updating interaction context:', { sessionId, interactionType, data });
    const contextUpdate = { lastInteractionType: interactionType, ...data };
    await ConversationManager.updateInteractionContext(sessionId, contextUpdate);
    console.log('✅ Interaction context updated successfully');
    return res.status(200).json({ success: true, message: 'Context updated' });
  } catch (error) {
    console.error('Update Context Error:', error);
    return res.status(500).json({ error: 'Lỗi hệ thống khi cập nhật context' });
  }
};

module.exports = {
  queryChatbot,
  updateInteractionContext
};