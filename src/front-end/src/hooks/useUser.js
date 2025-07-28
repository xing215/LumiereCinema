import { useState } from 'react';
import axios from 'axios';
import { useUser } from '@contexts/UserContext';
import { getApiUrl } from '@/config/api.config';

/**
 * User logic hooks for managing user profile data and user-specific interactions
 */

export const useFetchProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const { token } = useUser();

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(getApiUrl('userProfile'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { fetchProfile, profile, loading, error };
};

export const useUpdateProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();


  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.patch(getApiUrl('userProfile'), profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { updateProfile, loading, error };
};

export const useGetWatchHistory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [watchHistory, setWatchHistory] = useState([]);
  const { token } = useUser();

  const getWatchHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/user/watch-history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWatchHistory(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch watch history';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { getWatchHistory, watchHistory, loading, error };
};

export const useGetWishlist = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const { token } = useUser();

  const getWishlist = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/user/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch wishlist';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { getWishlist, wishlist, loading, error };
};

export const useAddToWishlist = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const addToWishlist = async (movieId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/user/wishlist', { movieId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add to wishlist';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { addToWishlist, loading, error };
};

export const useRemoveFromWishlist = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const removeFromWishlist = async (movieId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.delete(`/api/user/wishlist/${movieId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to remove from wishlist';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { removeFromWishlist, loading, error };
};

export const useRateMovie = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const rateMovie = async (movieId, rating) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/user/ratings', { movieId, rating }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to rate movie';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { rateMovie, loading, error };
};

export const useGetMyRatings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ratings, setRatings] = useState({});
  const { token } = useUser();

  const getMyRatings = async (movieId = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const url = movieId ? `/api/user/ratings/${movieId}` : '/api/user/ratings';
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (movieId) {
        setRatings(prev => ({ ...prev, [movieId]: response.data }));
      } else {
        setRatings(response.data);
      }
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch ratings';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { getMyRatings, ratings, loading, error };
};

export const useMessageChatBot = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const messageChatBot = async (message) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/chatbot/message', { message }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send message to chatbot';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { messageChatBot, loading, error };
};
