/**
 * useContextReporting Hook
 * Simplifies context reporting for Stateful RAG integration
 */
import { useCallback } from 'react';
import { contextReportingService } from '@services';
import { useUser } from '@contexts/UserContext';

/**
 * Custom hook for reporting user interactions to backend for Stateful RAG
 * @param {string} sessionId - Chat session ID
 * @returns {Object} Context reporting functions
 */
export const useContextReporting = (sessionId) => {
  const { token } = useUser();

  /**
   * Report movie interaction (click, view, details)
   * @param {Object} movie - Movie object
   * @param {string} interactionType - Type of interaction
   */
  const reportMovieInteraction = useCallback(async (movie, interactionType) => {
    if (!sessionId || !movie) return;
    
    try {
      await contextReportingService.reportMovieInteraction(
        movie, 
        interactionType, 
        sessionId, 
        token
      );
    } catch (error) {
      console.warn('Failed to report movie interaction:', error);
    }
  }, [sessionId, token]);

  /**
   * Report schedule interaction (click, view, booking attempt)
   * @param {Object} schedule - Schedule object with movie and branch info
   * @param {string} interactionType - Type of interaction
   */
  const reportScheduleInteraction = useCallback(async (schedule, interactionType) => {
    if (!sessionId || !schedule) return;
    
    try {
      await contextReportingService.reportScheduleInteraction(
        schedule, 
        interactionType, 
        sessionId, 
        token
      );
    } catch (error) {
      console.warn('Failed to report schedule interaction:', error);
    }
  }, [sessionId, token]);

  /**
   * Report generic chat interaction
   * @param {Object} actionData - Action data from quick actions
   */
  const reportChatInteraction = useCallback(async (actionData) => {
    if (!sessionId || !actionData) return;
    
    try {
      await contextReportingService.reportChatInteraction(
        actionData, 
        sessionId, 
        token
      );
    } catch (error) {
      console.warn('Failed to report chat interaction:', error);
    }
  }, [sessionId, token]);

  return {
    reportMovieInteraction,
    reportScheduleInteraction,
    reportChatInteraction
  };
};
