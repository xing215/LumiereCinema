// controllers/chatbot.controller.js

const ResponseFormatter = require('../utils/responseFormatter.js');
const ConversationManager = require('../utils/conversationManager.js');
const { analyzeQueryWithRAG } = require('../utils/LLMService.js');
const MovieRetrieverService = require('../utils/movieRetrieverService.js');

// Create instance of MovieRetrieverService
const movieRetrieverService = new MovieRetrieverService();

/**
 * @desc    Query chatbot - Stateful RAG Pipeline Implementation
 * @route   POST /api/chatbot/query
 * @access  Public
 */
const queryChatbot = async (req, res) => {
  try {
    const { question, sessionId } = req.body;

    // ================= VALIDATION =================
    if (!question || typeof question !== 'string' || question.trim() === '') {
      return res.status(400).json({ error: 'Câu hỏi không được để trống' });
    }
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId là bắt buộc để duy trì hội thoại' });
    }

    // ================= GET CONTEXT (INCLUDING INTERACTION CONTEXT) =================
    const context = await ConversationManager.getContext(sessionId);
    const interactionContext = context.interactionContext || {};

    console.log('📱 Current Interaction Context:', interactionContext);

    // ================= ANALYZE: Phân tích intent và entities với RAG =================
    const analysis = await analyzeQueryWithRAG(question.trim(), sessionId, context, interactionContext);

    console.log('🔍 Analysis Result:', analysis);

    // ================= RETRIEVE: Lấy dữ liệu dựa vào analysis =================
    const retrievedData = await gatherContextBasedOnAnalysis(analysis, interactionContext);

    console.log('📊 Retrieved Data:', retrievedData ? 'Data found' : 'No data');

    // ================= GENERATE & FORMAT: Tạo ra phản hồi cuối cùng =================
    const finalResponse = await ResponseFormatter.formatFinalResponse(analysis, retrievedData, interactionContext);

    console.log('✅ Final Response Generated');

    // ================= SAVE & RETURN: Lưu lịch sử và trả về =================
    await ConversationManager.addToHistory(sessionId, question, finalResponse, analysis);

    return res.status(200).json(finalResponse);
  } catch (error) {
    console.error('Chatbot Controller Error:', error);
    const errorResponse = ResponseFormatter.formatErrorResponse('api_error');
    return res.status(500).json(errorResponse);
  }
};

/**
 * Gather context-based data using analysis and interaction context
 * This replaces the old switch-case logic with a clean, RAG-focused approach
 */
async function gatherContextBasedOnAnalysis(analysis, interactionContext) {
  try {
    console.log('🔍 Gathering data for intent:', analysis.intent);
      switch (analysis.intent) {
      case 'get_now_showing': {
        return await movieRetrieverService.getNowShowingWithContext(interactionContext);
      }

      case 'get_upcoming': {
        return await movieRetrieverService.getUpcomingWithContext(interactionContext);
      }      case 'search_movies': {
        // Pass full analysis object to intelligent retriever
        return await movieRetrieverService.searchMoviesWithContext(analysis, interactionContext);
      }

      case 'movie_details': {
        let movieId = analysis.entities.movie_id;
        
        // If no movieId but have title, search for it
        if (!movieId && analysis.entities.movie_title) {
          const searchResult = await movieRetrieverService.searchMoviesWithContext(
            analysis, 
            interactionContext
          );
          if (searchResult && searchResult.length > 0) {
            movieId = searchResult[0]._id;
          }
        }

        // If still no movieId, try to use context
        if (!movieId && interactionContext.lastInteractedMovieId) {
          movieId = interactionContext.lastInteractedMovieId;
        }

        if (!movieId) return null;

        return await movieRetrieverService.getMovieDetailsWithContext(movieId, interactionContext);
      }

      case 'find_schedules': {
        // Enhanced schedule search with context awareness
        const combinedEntities = {
          ...(analysis.entities || {}),
          // Use interaction context to fill missing parameters
          movie_title: analysis.entities.movie_title || interactionContext.lastInteractedMovieTitle,
          movie_id: analysis.entities.movie_id || interactionContext.lastInteractedMovieId
        };

        return await movieRetrieverService.getSchedulesWithContext(combinedEntities, interactionContext);
      }

      case 'search_for_schedule': {
        const movieTitle = analysis.entities.movie_title;
        if (!movieTitle) return null;
        
        return await movieRetrieverService.searchMoviesForScheduleWithContext(movieTitle, interactionContext);
      }

      case 'search_conversation':
      case 'schedule_conversation':
      case 'non_movie_related': {
        // These intents don't need data retrieval
        return null;
      }

      default: {
        console.log('🤖 Default greeting intent, no data retrieval needed');
        return null;
      }
    }

  } catch (error) {
    console.error('Error in gatherContextBasedOnAnalysis:', error);
    return null;
  }
}

/**
 * @desc    Update interaction context - Track user interactions for Stateful RAG
 * @route   POST /api/chatbot/update-context  
 * @access  Public
 */
const updateInteractionContext = async (req, res) => {
  try {
    const { sessionId, interactionType, data } = req.body;

    // Validation
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId là bắt buộc' });
    }
    if (!interactionType) {
      return res.status(400).json({ error: 'interactionType là bắt buộc' });
    }

    console.log('📝 Updating interaction context:', { sessionId, interactionType, data });

    // Enhanced context update with full data integration
    const contextUpdate = {
      lastInteractionType: interactionType,
      lastInteractionTime: new Date(),
      // Spread all data fields for comprehensive context tracking
      ...data
    };

    // Use the powerful updateInteractionContext from ConversationManager
    await ConversationManager.updateInteractionContext(sessionId, contextUpdate);

    console.log('✅ Interaction context updated successfully');

    return res.status(200).json({ 
      success: true, 
      message: 'Context updated successfully',
      sessionId,
      contextUpdate 
    });

  } catch (error) {
    console.error('Update Context Error:', error);
    return res.status(500).json({ error: 'Lỗi hệ thống khi cập nhật context' });
  }
};

module.exports = {
  queryChatbot,
  updateInteractionContext
};