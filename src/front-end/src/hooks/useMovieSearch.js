import { useState, useCallback, useRef, useEffect } from 'react';
import { movieSearchService } from '@services/movieSearch.service';
import { useUser } from '@contexts/UserContext';

/**
 * Enhanced Movie Search Hook
 * Provides advanced search functionality with caching and pagination
 */
export const useEnhancedMovieSearch = () => {
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentKeyword, setCurrentKeyword] = useState('');
  const { token } = useUser();
  
  // Debounce and request management
  const searchTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);
  
  const searchMovies = useCallback(async (keyword, page = 1, limit = 10) => {
    if (!keyword || !keyword.trim()) {
      setResults([]);
      setPagination(null);
      setCurrentKeyword('');
      return;
    }

    const cleanKeyword = keyword.trim();
    
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    setLoading(true);
    setError(null);
    setCurrentKeyword(cleanKeyword);
    
    try {
      const result = await movieSearchService.searchMovies({
        keyword: cleanKeyword,
        page,
        limit,
        token
      });
      
      if (result.success) {
        // Format results for better frontend usage
        const formattedResults = result.results.map(movie => 
          movieSearchService.formatMovieResult(movie)
        );
        
        setResults(formattedResults);
        setPagination(result.pagination);
      } else {
        setError(result.error || 'Search failed');
        setResults([]);
        setPagination(null);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError('Search request failed');
        setResults([]);
        setPagination(null);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [token]);

  // Debounced search for real-time typing
  const debouncedSearch = useCallback((keyword, page = 1, limit = 10, delay = 500) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchMovies(keyword, page, limit);
    }, delay);
  }, [searchMovies]);

  // Navigate to specific page
  const goToPage = useCallback((page) => {
    if (currentKeyword && pagination) {
      searchMovies(currentKeyword, page, pagination.limit);
    }
  }, [currentKeyword, pagination, searchMovies]);

  // Clear search results
  const clearSearch = useCallback(() => {
    setResults([]);
    setPagination(null);
    setCurrentKeyword('');
    setError(null);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // Data
    results,
    pagination,
    currentKeyword,
    
    // States
    loading,
    error,
    
    // Actions
    searchMovies,
    debouncedSearch,
    goToPage,
    clearSearch,
    
    // Computed values
    hasResults: results.length > 0,
    isEmpty: !loading && results.length === 0 && currentKeyword !== '',
    totalResults: pagination?.totalResults || 0,
    hasNextPage: pagination?.hasNextPage || false,
    hasPrevPage: pagination?.hasPrevPage || false,
    currentPage: pagination?.currentPage || 1,
    totalPages: pagination?.totalPages || 0
  };
};

/**
 * Movie Autocomplete Hook
 * Provides real-time search suggestions
 */
export const useMovieAutocomplete = (options = {}) => {
  const {
    minLength = 2,
    debounceDelay = 300,
    maxSuggestions = 5
  } = options;
  
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();
  
  // Debounce and request management
  const debounceTimeoutRef = useRef(null);
  const lastRequestRef = useRef('');
    const getSuggestions = useCallback(async (keyword) => {
    const cleanKeyword = keyword.trim();
    
    console.log('🎯 useMovieAutocomplete.getSuggestions called with:', cleanKeyword);
    
    // Clear suggestions for short keywords
    if (cleanKeyword.length < minLength) {
      console.log('❌ Keyword too short, minLength:', minLength);
      setSuggestions([]);
      setError(null);
      return;
    }
    
    // Avoid duplicate requests
    if (cleanKeyword === lastRequestRef.current) {
      console.log('🔄 Duplicate request ignored for:', cleanKeyword);
      return;
    }
    
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      console.log('⏱ Cleared previous timeout');
    }
    
    console.log('⏱ Setting timeout for', debounceDelay, 'ms');
    debounceTimeoutRef.current = setTimeout(async () => {
      console.log('🚀 Timeout executed, making API call');
      setLoading(true);
      setError(null);
      lastRequestRef.current = cleanKeyword;
      
      try {
        console.log('📞 Calling movieSearchService.getSearchSuggestions');
        const result = await movieSearchService.getSearchSuggestions({
          keyword: cleanKeyword,
          limit: maxSuggestions,
          token
        });
        
        console.log('📨 Service result:', result);
          if (result.success) {
          console.log('✅ Raw suggestions from API:', result.suggestions);
          
          // Format suggestions for frontend - ensure we have proper data structure
          const formattedSuggestions = result.suggestions.map(movie => {
            console.log('🔄 Formatting movie:', movie);
            return {
              _id: movie._id,
              title: movie.title,
              posterURL: movie.posterURL,
              genre: movie.genre || [],
              ageRating: movie.ageRating,
              director: movie.director,
              cast: movie.cast || [],
              releaseDate: movie.releaseDate,
              ratingsAverage: movie.ratingsAverage || 0,
              status: movie.status,
              duration: movie.duration
            };
          });
          
          console.log('✅ Formatted suggestions:', formattedSuggestions);
          setSuggestions(formattedSuggestions);
        } else {
          console.error('❌ Service error:', result.error);
          setError(result.error || 'Failed to get suggestions');
          setSuggestions([]);
        }
      } catch (err) {
        console.error('💥 Catch block error:', err);
        setError('Suggestions request failed');
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, debounceDelay);
  }, [minLength, debounceDelay, maxSuggestions, token]);

  // Clear suggestions
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
    lastRequestRef.current = '';
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Data
    suggestions,
    
    // States
    loading,
    error,
    
    // Actions
    getSuggestions,
    clearSuggestions,
    
    // Computed values
    hasSuggestions: suggestions.length > 0,
    isEmpty: !loading && suggestions.length === 0
  };
};

/**
 * Search History Hook
 * Manages local search history for better UX
 */
export const useSearchHistory = (maxHistorySize = 10) => {
  const [history, setHistory] = useState(() => {
    try {
      const stored = localStorage.getItem('movieSearchHistory');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Add search to history
  const addToHistory = useCallback((keyword) => {
    if (!keyword || !keyword.trim()) return;
    
    const cleanKeyword = keyword.trim();
    
    setHistory(prevHistory => {
      // Remove existing occurrence
      const filtered = prevHistory.filter(item => 
        item.keyword.toLowerCase() !== cleanKeyword.toLowerCase()
      );
      
      // Add to beginning
      const newHistory = [
        {
          keyword: cleanKeyword,
          timestamp: Date.now(),
          id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        },
        ...filtered
      ].slice(0, maxHistorySize);
      
      // Save to localStorage
      try {
        localStorage.setItem('movieSearchHistory', JSON.stringify(newHistory));
      } catch (error) {
        console.warn('Failed to save search history:', error);
      }
      
      return newHistory;
    });
  }, [maxHistorySize]);

  // Remove from history
  const removeFromHistory = useCallback((keyword) => {
    setHistory(prevHistory => {
      const filtered = prevHistory.filter(item => 
        item.keyword.toLowerCase() !== keyword.toLowerCase()
      );
      
      try {
        localStorage.setItem('movieSearchHistory', JSON.stringify(filtered));
      } catch (error) {
        console.warn('Failed to update search history:', error);
      }
      
      return filtered;
    });
  }, []);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem('movieSearchHistory');
    } catch (error) {
      console.warn('Failed to clear search history:', error);
    }
  }, []);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    hasHistory: history.length > 0
  };
};

/**
 * Admin Search Cache Management Hook
 */
export const useSearchCacheManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastClearResult, setLastClearResult] = useState(null);
  const { token } = useUser();

  const clearSearchCache = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await movieSearchService.clearSearchCache(token);
      
      if (result.success) {
        setLastClearResult({
          message: result.message,
          clearedKeys: result.clearedKeys,
          timestamp: Date.now()
        });
      } else {
        setError(result.error || 'Failed to clear cache');
      }
    } catch (err) {
      setError('Cache clear request failed');
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    clearSearchCache,
    loading,
    error,
    lastClearResult
  };
};
