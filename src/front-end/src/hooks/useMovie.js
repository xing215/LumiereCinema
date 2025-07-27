import { useState } from 'react';
import axios from 'axios';
import { getApiUrl, buildApiUrl } from '@config/api.config';

/**
 * Movie logic hooks for handling movie-related operations
 */

export const useGetMovieById = () => {
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getMovieById = async (movieId) => {
    setLoading(true);
    setError(null);
    if (!movieId) {
      setError('Movie ID is required');
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(getMovieApiUrl(movieId));
      setMovie(response.data);
    } catch (error) {
      console.error('Error fetching movie:', error);
      setError('Failed to fetch movie');
    } finally {
      setLoading(false);  
    }
  };

  return { movie, getMovieById , error, loading };
};

export const useSetBranch = () => {
  const [currentBranch, setCurrentBranch] = useState(null);

  const setBranch = (branchId) => {
    setCurrentBranch(branchId);
    localStorage.setItem('selectedBranch', branchId);
  };

  const getCurrentBranch = () => {
    if (!currentBranch) {
      const savedBranch = localStorage.getItem('selectedBranch');
      if (savedBranch) {
        setCurrentBranch(savedBranch);
        return savedBranch;
      }
    }
    return currentBranch;
  };

  return { setBranch, getCurrentBranch, currentBranch };
};

export const useFetchNowShowing = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [movies, setMovies] = useState([]);

  const fetchNowShowing = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(getApiUrl('nowShowingMovies'));
      setMovies(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch now showing movies';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { fetchNowShowing, movies, loading, error };
};

export const useFetchComingSoon = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [movies, setMovies] = useState([]);

  const fetchComingSoon = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(getApiUrl('upcomingMovies'));
      setMovies(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch coming soon movies';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { fetchComingSoon, movies, loading, error };
};

export const useGetMovieDetail = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [movieDetail, setMovieDetail] = useState(null);

  const getMovieDetail = async (movieId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(getMovieApiUrl(movieId));
      setMovieDetail(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch movie details';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { getMovieDetail, movieDetail, loading, error };
};

export const useGetShowtimes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const { getCurrentBranch } = useSetBranch();

  const getShowtimes = async (movieId, date = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const branchId = getCurrentBranch();
      const params = {};
      if (branchId) params.branchId = branchId;
      if (date) params.date = date;

      const response = await axios.get(getMovieApiUrl(movieId, 'showscreen'), { params });
      setShowtimes(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch showtimes';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { getShowtimes, showtimes, loading, error };
};

export const useSearchMovies = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  const searchMovies = async (keyword) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(getApiUrl('searchMovies'), {
        params: { q: keyword }
      });
      setSearchResults(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Search failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { searchMovies, searchResults, loading, error };
};

export const useFilterByBranch = () => {
  const [filteredMovies, setFilteredMovies] = useState([]);

  const filterByBranch = async (movies, branchId) => {
    try {
      // Filter movies available at the specified branch
      const filtered = movies.filter(movie => {
        return movie.branches?.includes(branchId) || 
               movie.availableBranches?.includes(branchId);
      });
      
      setFilteredMovies(filtered);
      return { success: true, data: filtered };
    } catch (err) {
      return { success: false, error: 'Failed to filter movies by branch' };
    }
  };

  return { filterByBranch, filteredMovies };
};
