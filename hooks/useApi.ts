import { useCallback, useState } from 'react';
import api from '../services/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (apiCall: Function, ...args: any[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall(...args);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    request,
    ...api, // Spread all API methods
  };
};