import axios from 'axios';
import { getApiUrl } from '@config/api.config';

/**
 * Enhanced Movie Search Service
 * Provides advanced search functionality with caching, autocomplete, and pagination
 */
class MovieSearchService {
  constructor() {
    // No need to store baseUrl, use getApiUrl for each request
  }

  /**
   * Enhanced search with pagination, field weighting, and highlighting
   * @param {Object} params - Search parameters
   * @param {string} params.keyword - Search keyword (required)
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Results per page (default: 10, max: 50)
   * @param {string} params.token - Auth token (optional)
   * @returns {Promise<Object>} Search results with pagination info
   */  async searchMovies({ keyword, page = 1, limit = 10, token = null }) {
    try {
      const params = {
        q: keyword.trim(),
        page: page.toString(),
        limit: Math.min(50, Math.max(1, limit)).toString()
      };

      const config = {
        params,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      };

      const response = await axios.get(getApiUrl('searchMovies'), config);
      const data = response.data;
      
      // Process highlights for better frontend display
      if (data.results) {
        data.results = data.results.map(movie => ({
          ...movie,
          processedHighlights: this.processHighlights(movie.highlights, keyword)
        }));
      }

      return {
        success: true,
        data: data,
        keyword: data.keyword,
        results: data.results || [],
        pagination: data.pagination || {
          currentPage: 1,
          totalPages: 0,
          totalResults: 0,
          limit: limit,
          hasNextPage: false,
          hasPrevPage: false
        }
      };
    } catch (error) {
      console.error('Movie search error:', error);
      return {
        success: false,
        error: error.message,
        data: null,
        results: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalResults: 0,
          limit: limit,
          hasNextPage: false,
          hasPrevPage: false
        }
      };
    }
  }

  /**
   * Get autocomplete suggestions
   * @param {Object} params - Suggestion parameters
   * @param {string} params.keyword - Search keyword (min 2 chars)
   * @param {number} params.limit - Max suggestions (default: 5, max: 10)
   * @param {string} params.token - Auth token (optional)
   * @returns {Promise<Object>} Autocomplete suggestions
   */
  async getSearchSuggestions({ keyword, limit = 5, token = null }) {
    try {
      const trimmedKeyword = keyword.trim();
      
      if (trimmedKeyword.length < 2) {
        return {
          success: true,
          data: { keyword: trimmedKeyword, suggestions: [] },
          suggestions: []
        };
      }      const params = {
        q: trimmedKeyword,
        limit: Math.min(10, Math.max(1, limit)).toString()
      };

      const config = {
        params,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      };

      const response = await axios.get(getApiUrl('searchSuggestions'), config);
      const data = response.data;
      
      return {
        success: true,
        data: data,
        keyword: data.keyword,
        suggestions: data.suggestions || []
      };
    } catch (error) {
      console.error('Movie suggestions error:', error);
      return {
        success: false,
        error: error.message,
        data: null,
        suggestions: []
      };
    }
  }

  /**
   * Clear search cache (Admin only)
   * @param {string} token - Admin auth token (required)
   * @returns {Promise<Object>} Cache clear result
   */  async clearSearchCache(token) {
    try {
      const response = await axios.delete(getApiUrl('clearSearchCache'), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = response.data;
      
      return {
        success: true,
        data: data,
        message: data.message,
        clearedKeys: data.clearedKeys
      };
    } catch (error) {
      console.error('Clear search cache error:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Process Atlas Search highlights for frontend display
   * @param {Array} highlights - Raw highlights from Atlas Search
   * @param {string} keyword - Original search keyword
   * @returns {Object} Processed highlights
   */
  processHighlights(highlights, keyword) {
    if (!highlights || !Array.isArray(highlights)) {
      return {};
    }

    const processed = {};
    
    highlights.forEach(highlight => {
      const { path, texts } = highlight;
      if (path && texts && Array.isArray(texts)) {
        processed[path] = texts.map(text => ({
          value: text.value || '',
          type: text.type || 'text',
          isHighlighted: text.type === 'hit'
        }));
      }
    });

    return processed;
  }

  /**
   * Format movie result for display
   * @param {Object} movie - Raw movie result
   * @returns {Object} Formatted movie
   */
  formatMovieResult(movie) {
    return {
      id: movie._id,
      title: movie.title,
      description: movie.description,
      posterURL: movie.posterURL,
      duration: movie.duration,
      genre: Array.isArray(movie.genre) ? movie.genre : [],
      ageRating: movie.ageRating,
      director: movie.director,
      cast: Array.isArray(movie.cast) ? movie.cast : [],
      releaseDate: movie.releaseDate,
      rating: movie.ratingsAverage || 0,
      status: movie.status,
      score: movie.score,
      highlights: movie.processedHighlights || {},
      // Helper methods
      isUpcoming: movie.status === 'Upcoming',
      isNowShowing: movie.status === 'Now Showing',
      genreString: Array.isArray(movie.genre) ? movie.genre.join(', ') : '',
      castString: Array.isArray(movie.cast) ? movie.cast.slice(0, 3).join(', ') : '',
      durationFormatted: this.formatDuration(movie.duration)
    };
  }

  /**
   * Format duration in minutes to hours and minutes
   * @param {number} minutes - Duration in minutes
   * @returns {string} Formatted duration
   */
  formatDuration(minutes) {
    if (!minutes || minutes <= 0) return '';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins}m`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}m`;
    }
  }

  /**
   * Build search URL for deep linking
   * @param {Object} params - Search parameters
   * @returns {string} Search URL
   */
  buildSearchUrl({ keyword, page = 1, limit = 10 }) {
    const params = new URLSearchParams({
      q: keyword,
      page: page.toString(),
      limit: limit.toString()
    });
    
    return `/search?${params.toString()}`;
  }

  /**
   * Extract search parameters from URL
   * @param {string} url - URL or search string
   * @returns {Object} Extracted parameters
   */
  extractSearchParams(url) {
    try {
      const urlParams = new URLSearchParams(url.includes('?') ? url.split('?')[1] : url);
      
      return {
        keyword: urlParams.get('q') || '',
        page: parseInt(urlParams.get('page')) || 1,
        limit: parseInt(urlParams.get('limit')) || 10
      };
    } catch (error) {
      return { keyword: '', page: 1, limit: 10 };
    }
  }
}

// Export singleton instance
export const movieSearchService = new MovieSearchService();

// Also export the class for custom instances
export default MovieSearchService;
