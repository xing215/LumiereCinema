/**
 * Context Reporting Service
 * Handles reporting user interactions to backend for Stateful RAG
 */
import axios from 'axios';
import { getApiUrl } from '@config/api.config';

export const contextReportingService = {
  /**
   * Report user interaction to backend for context tracking
   * @param {Object} interactionData - Interaction data to report
   * @param {string} sessionId - Chat session ID
   * @param {string} authToken - Optional authentication token
   * @returns {Promise} API response
   */
  reportInteraction: async (interactionData, sessionId, authToken = null) => {
    try {
      const config = authToken ? {
        headers: { Authorization: `Bearer ${authToken}` }
      } : {};
      
      const payload = {
        sessionId,
        interactionType: interactionData.type,
        data: interactionData
      };

      const response = await axios.post(
        getApiUrl('chatbotUpdateContext'), 
        payload, 
        config
      );
      
      return response.data;
    } catch (error) {
      console.error('Context reporting error:', error);
      // Don't throw error to avoid disrupting user experience
      return { success: false, error: error.message };
    }
  },

  /**
   * Report movie interaction (click, view, details)
   * @param {Object} movie - Movie object
   * @param {string} interactionType - Type of interaction (click, view, details)
   * @param {string} sessionId - Chat session ID
   * @param {string} authToken - Optional authentication token
   */
  reportMovieInteraction: async (movie, interactionType, sessionId, authToken = null) => {
    const interactionData = {
      type: 'movie_interaction',
      movieId: movie._id || movie.id,
      movieTitle: movie.title,
      genre: movie.genre,
      interactionType, // click, view, details
      timestamp: new Date().toISOString()
    };

    return contextReportingService.reportInteraction(interactionData, sessionId, authToken);
  },

  /**
   * Report schedule interaction (click, view, booking attempt)
   * @param {Object} schedule - Schedule object
   * @param {string} interactionType - Type of interaction
   * @param {string} sessionId - Chat session ID
   * @param {string} authToken - Optional authentication token
   */
  reportScheduleInteraction: async (schedule, interactionType, sessionId, authToken = null) => {
    const interactionData = {
      type: 'schedule_interaction',
      scheduleId: schedule.schedule_id || schedule._id,
      movieId: schedule.movie_id,
      movieTitle: schedule.movie_title,
      branchId: schedule.branch_id,
      date: schedule.date,
      time: schedule.time,
      interactionType, // click, view, booking_attempt
      timestamp: new Date().toISOString()
    };

    return contextReportingService.reportInteraction(interactionData, sessionId, authToken);
  },

  /**
   * Report generic chat interaction
   * @param {Object} actionData - Action data from quick actions
   * @param {string} sessionId - Chat session ID
   * @param {string} authToken - Optional authentication token
   */
  reportChatInteraction: async (actionData, sessionId, authToken = null) => {
    const interactionData = {
      type: 'chat_interaction',
      action: actionData.action,
      data: actionData.data,
      timestamp: new Date().toISOString()
    };

    return contextReportingService.reportInteraction(interactionData, sessionId, authToken);
  }
};
