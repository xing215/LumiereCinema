const { redisClient } = require('../config/redis.config');

class ConversationManager {  constructor() {
    this.defaultContext = {
      sessionId: null,
      lastIntent: null,
      entities: {},
      missingParams: [],
      step: 'initial',
      conversationHistory: [],
      lastActivity: new Date().toISOString(),
      consecutiveFailures: 0,
      // === STATEFUL RAG CONTEXT ===
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

  // Get conversation context from Redis với enhanced error handling
  async getContext(sessionId) {
    try {
      const contextKey = `conversation:${sessionId}`;
      const contextData = await redisClient.get(contextKey);
      
      if (contextData) {
        const context = JSON.parse(contextData);
        // Update last activity
        context.lastActivity = new Date().toISOString();
        await this.saveContext(sessionId, context);
        return context;
      }
      
      // Return default context for new sessions
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

  // Save context to Redis with 30 minute expiration
  async saveContext(sessionId, context) {
    try {
      const contextKey = `conversation:${sessionId}`;
      context.lastActivity = new Date().toISOString();
      await redisClient.setEx(contextKey, 1800, JSON.stringify(context)); // 30 minutes
    } catch (error) {
      console.error('Error saving conversation context:', error);
    }
  }

  // Update specific fields in context
  async updateContext(sessionId, updates) {
    const currentContext = await this.getContext(sessionId);
    const updatedContext = { ...currentContext, ...updates };
    await this.saveContext(sessionId, updatedContext);
    return updatedContext;
  }

  // Add message to conversation history
  async addToHistory(sessionId, userQuery, botResponse, analysis) {
    const context = await this.getContext(sessionId);
    
    const historyEntry = {
      timestamp: new Date().toISOString(),
      userQuery,
      intent: analysis.intent,
      sub_intent: analysis.sub_intent,
      entities: analysis.entities,
      botResponse: {
        type: botResponse.type,
        message: botResponse.message
      },
      confidence: analysis.confidence
    };

    // Keep last 10 messages to avoid memory bloat
    context.conversationHistory = context.conversationHistory || [];
    context.conversationHistory.push(historyEntry);
    if (context.conversationHistory.length > 10) {
      context.conversationHistory = context.conversationHistory.slice(-10);
    }

    // Update last intent
    context.lastIntent = analysis.intent;
    
    await this.saveContext(sessionId, context);
    return context;
  }

  // Get required fields for current booking step
  getRequiredFields(context) {
    const { bookingStep, selectedMovie, selectedBranch, selectedDate, selectedSchedule } = context;
    
    switch (bookingStep) {
      case 'movie_selection':
        return selectedMovie ? [] : ['movie'];
        
      case 'schedule_selection':
        const required = [];
        if (!selectedMovie) required.push('movie');
        if (!selectedBranch && !selectedDate) required.push('branch_or_date');
        return required;
        
      case 'seat_selection':
        const seatRequired = [];
        if (!selectedMovie) seatRequired.push('movie');
        if (!selectedSchedule) seatRequired.push('schedule');
        return seatRequired;
        
      default:
        return [];
    }
  }

  // Clear context (for new conversation or booking cancellation)
  async clearContext(sessionId, keepPreferences = true) {
    const context = keepPreferences ? 
      await this.getContext(sessionId) : 
      { ...this.defaultContext, sessionId };
      
    const clearedContext = {
      ...this.defaultContext,
      sessionId,
      userPreferences: keepPreferences ? context.userPreferences : {},
      lastActivity: new Date().toISOString()
    };
    
    await this.saveContext(sessionId, clearedContext);
    return clearedContext;
  }

  // Check if context is expired (inactive for > 30 minutes)
  isContextExpired(context) {
    if (!context.lastActivity) return true;
    
    const lastActivity = new Date(context.lastActivity);
    const now = new Date();
    const diffMinutes = (now - lastActivity) / (1000 * 60);
    
    return diffMinutes > 30;
  }

  // [NEW] Smart context update với validation
  async smartUpdateContext(sessionId, newData) {
    try {
      const currentContext = await this.getContext(sessionId);
      
      // Merge entities intelligently
      const mergedEntities = { 
        ...(currentContext.entities || {}), 
        ...(newData.entities || {}) 
      };

      // Update missing params based on current entities
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

  // [NEW] Check if conversation should be reset (context switching detection)
  shouldResetContext(currentContext, newIntent, newEntities) {
    // Reset nếu có intent hoàn toàn khác biệt
    if (currentContext.lastIntent === 'find_schedules' && 
        newIntent && 
        !['find_schedules'].includes(newIntent)) {
      return true;
    }

    // Reset nếu quá nhiều lần thất bại liên tiếp
    if (currentContext.consecutiveFailures >= 3) {
      return true;
    }

    // Reset nếu không hoạt động quá 10 phút
    const lastActivity = new Date(currentContext.lastActivity);
    const timeDiff = Date.now() - lastActivity.getTime();
    if (timeDiff > 10 * 60 * 1000) { // 10 minutes
      return true;
    }

    return false;
  }
  // [ENHANCED] Clear context with optional soft reset
  async clearContext(sessionId, softReset = false) {
    try {
      if (softReset) {
        // Soft reset: chỉ clear booking data, giữ lại preferences và interaction context
        const currentContext = await this.getContext(sessionId);
        const cleanContext = {
          ...this.defaultContext,
          sessionId,
          userPreferences: currentContext.userPreferences || {},
          interactionContext: currentContext.interactionContext || this.defaultContext.interactionContext,
          lastActivity: new Date().toISOString()
        };
        await this.saveContext(sessionId, cleanContext);
      } else {
        // Hard reset: xóa toàn bộ
        const contextKey = `conversation:${sessionId}`;
        await redisClient.del(contextKey);
      }
      
      console.log(`🧹 Context cleared for session: ${sessionId}`);
    } catch (error) {
      console.error('Error clearing context:', error);
    }
  }

  // === STATEFUL RAG METHODS ===
  
  /**
   * Update interaction context for Stateful RAG
   * @param {string} sessionId 
   * @param {object} interactionData - { lastInteractedMovieId, lastInteractionType, etc. }
   */
  async updateInteractionContext(sessionId, interactionData) {
    try {
      const context = await this.getContext(sessionId);
      
      const currentInteractionContext = context.interactionContext || this.defaultContext.interactionContext;
      
      // Update main interaction data
      const updatedInteractionContext = {
        ...currentInteractionContext,
        ...interactionData,
        lastInteractionTime: new Date().toISOString()
      };

      // Add to conversational flow for context tracking
      if (interactionData.lastInteractionType) {
        const flowEntry = {
          type: interactionData.lastInteractionType,
          data: interactionData,
          timestamp: new Date().toISOString()
        };
        
        updatedInteractionContext.conversationalFlow.push(flowEntry);
        // Keep last 20 interactions
        if (updatedInteractionContext.conversationalFlow.length > 20) {
          updatedInteractionContext.conversationalFlow = updatedInteractionContext.conversationalFlow.slice(-20);
        }
      }

      // Track viewed movies
      if (interactionData.lastInteractedMovieId) {
        const movieId = interactionData.lastInteractedMovieId;
        if (!updatedInteractionContext.viewedMovies.includes(movieId)) {
          updatedInteractionContext.viewedMovies.push(movieId);
        }
        // Keep last 10 viewed movies
        if (updatedInteractionContext.viewedMovies.length > 10) {
          updatedInteractionContext.viewedMovies = updatedInteractionContext.viewedMovies.slice(-10);
        }
      }

      // Track preferred branches
      if (interactionData.branchId) {
        const branchId = interactionData.branchId;
        if (!updatedInteractionContext.frequentBranches.includes(branchId)) {
          updatedInteractionContext.frequentBranches.push(branchId);
        }
        // Keep last 5 frequent branches
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

  /**
   * Get contextual information for RAG enhancement
   * @param {string} sessionId 
   */
  async getContextualInformation(sessionId) {
    try {
      const context = await this.getContext(sessionId);
      const interactionContext = context.interactionContext || this.defaultContext.interactionContext;
      
      return {
        // Recent interactions
        lastInteractedMovieId: interactionContext.lastInteractedMovieId,
        lastInteractedScheduleId: interactionContext.lastInteractedScheduleId,
        lastInteractionType: interactionContext.lastInteractionType,
        lastInteractionTime: interactionContext.lastInteractionTime,
        
        // User preferences
        viewedMovies: interactionContext.viewedMovies || [],
        preferredGenres: interactionContext.preferredGenres || [],
        frequentBranches: interactionContext.frequentBranches || [],
        
        // Conversational flow (last 5 interactions)
        recentFlow: (interactionContext.conversationalFlow || []).slice(-5),
        
        // General context
        conversationHistory: (context.conversationHistory || []).slice(-3), // Last 3 messages
        lastIntent: context.lastIntent,
        entities: context.entities
      };
    } catch (error) {
      console.error('Error getting contextual information:', error);
      return {};
    }
  }

  /**
   * Generate context-aware suggestions based on interaction history
   * @param {string} sessionId 
   */
  async generateContextualSuggestions(sessionId) {
    try {
      const contextInfo = await this.getContextualInformation(sessionId);
      const suggestions = [];

      // Suggest based on last interacted movie
      if (contextInfo.lastInteractedMovieId) {
        switch (contextInfo.lastInteractionType) {
          case 'movie_view':
            suggestions.push({
              text: 'Xem lịch chiếu phim này',
              action: 'find_schedules',
              context: { movieId: contextInfo.lastInteractedMovieId }
            });
            break;
          case 'schedule_view':
            suggestions.push({
              text: 'Đặt vé cho suất chiếu này',
              action: 'book_tickets',
              context: { scheduleId: contextInfo.lastInteractedScheduleId }
            });
            break;
        }
      }

      // Suggest based on viewed movies (similar genres/styles)
      if (contextInfo.viewedMovies.length > 0) {
        suggestions.push({
          text: 'Tìm phim tương tự',
          action: 'search_similar',
          context: { baseMovieIds: contextInfo.viewedMovies.slice(-2) }
        });
      }

      // Suggest based on frequent branches
      if (contextInfo.frequentBranches.length > 0) {
        suggestions.push({
          text: 'Xem lịch chiếu tại rạp thường xuyên',
          action: 'find_schedules',
          context: { branchId: contextInfo.frequentBranches[0] }
        });
      }

      return suggestions;
    } catch (error) {
      console.error('Error generating contextual suggestions:', error);
      return [];
    }
  }
}

module.exports = new ConversationManager();