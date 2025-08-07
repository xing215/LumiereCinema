const { redisClient } = require('../config/redis.config');

class ConversationManager {
  constructor() {
    this.defaultContext = {
      sessionId: null,
      lastIntent: null,
      entities: {},
      missingParams: [],
      step: 'initial',
      conversationHistory: [],
      lastActivity: new Date().toISOString(),
      consecutiveFailures: 0,
      interactionContext: {
        lastInteractedMovieId: null,
        lastInteractedScheduleId: null,
        lastInteractionType: null,
        lastInteractionTime: null,
        viewedMovies: [],
        preferredGenres: [],
        frequentBranches: [],
        conversationalFlow: []
      }
    };
  }

  async getContext(sessionId) {
    try {
      const contextKey = `conversation:${sessionId}`;
      const contextData = await redisClient.get(contextKey);
      
      if (contextData) {
        const context = JSON.parse(contextData);
        context.lastActivity = new Date().toISOString();
        return context;
      }
      
      const newContext = { 
        ...this.defaultContext, 
        sessionId,
        lastActivity: new Date().toISOString()
      };
      await this.saveContext(sessionId, newContext);
      return newContext;
      
    } catch (error) {
      console.error('Error getting conversation context:', error);
      return { ...this.defaultContext, sessionId };
    }
  }

  async saveContext(sessionId, context) {
    try {
      const contextKey = `conversation:${sessionId}`;
      context.lastActivity = new Date().toISOString();
      await redisClient.setEx(contextKey, 1800, JSON.stringify(context));
    } catch (error) {
      console.error('Error saving conversation context:', error);
    }
  }

  // ======================= HÀM ĐÃ ĐƯỢC NÂNG CẤP =======================
  // Cập nhật hàm addToHistory để chatbot có thể "ghi nhớ" ngữ cảnh
  async addToHistory(sessionId, userQuery, botResponse, analysis) {
    const context = await this.getContext(sessionId);
    
    const historyEntry = {
      timestamp: new Date().toISOString(),
      userQuery,
      intent: analysis.intent,
      entities: analysis.entities,
      botResponse: {
        type: botResponse.type,
        message: botResponse.message
      },
      confidence: analysis.confidence
    };

    context.conversationHistory = context.conversationHistory || [];
    context.conversationHistory.push(historyEntry);
    if (context.conversationHistory.length > 10) {
      context.conversationHistory = context.conversationHistory.slice(-10);
    }

    // CẬP NHẬT "BỘ NHỚ" CHÍNH CỦA CHATBOT
    const oldEntities = context.entities || {};
    const newEntities = analysis.entities || {};
    
    // Kết hợp thông tin cũ và mới.
    // Ưu tiên giữ lại thông tin mới, nhưng không ghi đè giá trị cũ bằng null.
    const mergedEntities = { ...oldEntities };
    for (const key in newEntities) {
      if (newEntities[key] !== null && newEntities[key] !== undefined) {
        mergedEntities[key] = newEntities[key];
      }
    }
    
    context.entities = mergedEntities; // Cập nhật entities đã kết hợp
    context.lastIntent = analysis.intent; // Cập nhật intent cuối cùng
    // Cập nhật lại danh sách tham số còn thiếu
    context.missingParams = analysis.context?.missing_params || [];

    await this.saveContext(sessionId, context);
    return context;
  }
  // =====================================================================

  async smartUpdateContext(sessionId, newData) {
    try {
      const currentContext = await this.getContext(sessionId);
      
      const mergedEntities = { 
        ...(currentContext.entities || {}), 
        ...(newData.entities || {}) 
      };

      const requiredParams = ['movie_title', 'location', 'date'];
      const missingParams = requiredParams.filter(param => !mergedEntities[param]);

      const updatedContext = {
        ...currentContext,
        ...newData,
        entities: mergedEntities,
        missingParams: missingParams,
        lastActivity: new Date().toISOString(),
        consecutiveFailures: newData.failed ? (currentContext.consecutiveFailures || 0) + 1 : 0
      };

      await this.saveContext(sessionId, updatedContext);
      return updatedContext;
    } catch (error) {
      console.error('Error in smart context update:', error);
      return await this.getContext(sessionId);
    }
  }

  shouldResetContext(currentContext, newIntent) {
    if (currentContext.lastIntent === 'find_schedules' && 
        newIntent && 
        !['find_schedules'].includes(newIntent)) {
      return true;
    }

    if (currentContext.consecutiveFailures >= 3) {
      return true;
    }

    const lastActivity = new Date(currentContext.lastActivity);
    const timeDiff = Date.now() - lastActivity.getTime();
    if (timeDiff > 10 * 60 * 1000) {
      return true;
    }

    return false;
  }
  
  async clearContext(sessionId, softReset = false) {
    try {
      if (softReset) {
        const currentContext = await this.getContext(sessionId);
        const cleanContext = {
          ...this.defaultContext,
          sessionId,
          interactionContext: currentContext.interactionContext || this.defaultContext.interactionContext,
          lastActivity: new Date().toISOString()
        };
        await this.saveContext(sessionId, cleanContext);
      } else {
        const contextKey = `conversation:${sessionId}`;
        await redisClient.del(contextKey);
      }
      
      console.log(`🧹 Context cleared for session: ${sessionId}`);
    } catch (error) {
      console.error('Error clearing context:', error);
    }
  }

  async updateInteractionContext(sessionId, interactionData) {
    try {
      const context = await this.getContext(sessionId);
      
      const currentInteractionContext = context.interactionContext || this.defaultContext.interactionContext;
      
      const updatedInteractionContext = {
        ...currentInteractionContext,
        ...interactionData,
        lastInteractionTime: new Date().toISOString()
      };

      if (interactionData.lastInteractionType) {
        const flowEntry = {
          type: interactionData.lastInteractionType,
          data: interactionData,
          timestamp: new Date().toISOString()
        };
        
        updatedInteractionContext.conversationalFlow.push(flowEntry);
        if (updatedInteractionContext.conversationalFlow.length > 20) {
          updatedInteractionContext.conversationalFlow = updatedInteractionContext.conversationalFlow.slice(-20);
        }
      }

      if (interactionData.lastInteractedMovieId) {
        const movieId = interactionData.lastInteractedMovieId;
        if (!updatedInteractionContext.viewedMovies.includes(movieId)) {
          updatedInteractionContext.viewedMovies.push(movieId);
        }
        if (updatedInteractionContext.viewedMovies.length > 10) {
          updatedInteractionContext.viewedMovies = updatedInteractionContext.viewedMovies.slice(-10);
        }
      }

      if (interactionData.branchId) {
        const branchId = interactionData.branchId;
        if (!updatedInteractionContext.frequentBranches.includes(branchId)) {
          updatedInteractionContext.frequentBranches.push(branchId);
        }
        if (updatedInteractionContext.frequentBranches.length > 5) {
          updatedInteractionContext.frequentBranches = updatedInteractionContext.frequentBranches.slice(-5);
        }
      }

      const updatedContext = {
        ...context,
        interactionContext: updatedInteractionContext,
        lastActivity: new Date().toISOString()
      };

      await this.saveContext(sessionId, updatedContext);
      
      console.log(`🔄 Interaction context updated for session: ${sessionId}`, {
        interactionType: interactionData.lastInteractionType,
        movieId: interactionData.lastInteractedMovieId
      });
      
      return updatedContext;
    } catch (error) {
      console.error('Error updating interaction context:', error);
      return await this.getContext(sessionId);
    }
  }
}

module.exports = new ConversationManager();