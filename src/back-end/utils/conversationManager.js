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
      consecutiveFailures: 0
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
        // Soft reset: chỉ clear booking data, giữ lại preferences
        const currentContext = await this.getContext(sessionId);
        const cleanContext = {
          ...this.defaultContext,
          sessionId,
          userPreferences: currentContext.userPreferences || {},
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
}

module.exports = new ConversationManager();