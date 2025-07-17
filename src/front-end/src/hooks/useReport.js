import { useState } from 'react';
import axios from 'axios';
import { getApiUrl } from '@config/api.config';
import { useUser } from '@contexts/UserContext';

/**
 * Report logic hooks for handling revenue and performance reports
 */

export const useGetRevenueReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const { token } = useUser();

  const getRevenueReport = async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(getApiUrl('revenueSummary'), {
        headers: { Authorization: `Bearer ${token}` },
        params: filters
      });
      setReportData(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch revenue report';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { getRevenueReport, reportData, loading, error };
};

export const useExportReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const exportReport = async (reportData, format = 'pdf') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/reports/export', {
        data: reportData,
        format
      }, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to export report';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { exportReport, loading, error };
};

export const useGetAvailableBranches = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [branches, setBranches] = useState([]);
  const { token } = useUser();

  const getAvailableBranches = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(getApiUrl('branches'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBranches(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch branches';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { getAvailableBranches, branches, loading, error };
};

export const useGetAvailableMovies = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [movies, setMovies] = useState([]);
  const { token } = useUser();

  const getAvailableMovies = async (branchId = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = branchId ? { branchId } : {};
      const response = await axios.get('/api/reports/movies', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setMovies(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch movies';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { getAvailableMovies, movies, loading, error };
};

export const useSetBranch = () => {
  const [selectedBranch, setSelectedBranch] = useState(null);

  const setBranch = (branchId) => {
    setSelectedBranch(branchId);
    localStorage.setItem('reportBranch', branchId);
  };

  const getBranch = () => {
    if (!selectedBranch) {
      const savedBranch = localStorage.getItem('reportBranch');
      if (savedBranch) {
        setSelectedBranch(savedBranch);
        return savedBranch;
      }
    }
    return selectedBranch;
  };

  const clearBranch = () => {
    setSelectedBranch(null);
    localStorage.removeItem('reportBranch');
  };

  return { setBranch, getBranch, selectedBranch, clearBranch };
};

export const useSetDateRange = () => {
  const [dateRange, setDateRangeState] = useState({
    startDate: null,
    endDate: null
  });

  const setDateRange = (startDate, endDate) => {
    const range = { startDate, endDate };
    setDateRangeState(range);
    localStorage.setItem('reportDateRange', JSON.stringify(range));
  };

  const getDateRange = () => {
    if (!dateRange.startDate && !dateRange.endDate) {
      const savedRange = localStorage.getItem('reportDateRange');
      if (savedRange) {
        try {
          const parsed = JSON.parse(savedRange);
          setDateRangeState(parsed);
          return parsed;
        } catch (error) {
          console.error('Error parsing saved date range:', error);
        }
      }
    }
    return dateRange;
  };

  const clearDateRange = () => {
    setDateRangeState({ startDate: null, endDate: null });
    localStorage.removeItem('reportDateRange');
  };

  return { setDateRange, getDateRange, dateRange, clearDateRange };
};

export const useSetMovie = () => {
  const [selectedMovie, setSelectedMovie] = useState(null);

  const setMovie = (movieId) => {
    setSelectedMovie(movieId);
    localStorage.setItem('reportMovie', movieId);
  };

  const getMovie = () => {
    if (!selectedMovie) {
      const savedMovie = localStorage.getItem('reportMovie');
      if (savedMovie) {
        setSelectedMovie(savedMovie);
        return savedMovie;
      }
    }
    return selectedMovie;
  };

  const clearMovie = () => {
    setSelectedMovie(null);
    localStorage.removeItem('reportMovie');
  };

  return { setMovie, getMovie, selectedMovie, clearMovie };
};
