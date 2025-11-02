import { useState, useEffect, useCallback } from 'react';
import { getCurrentLocation, watchLocation, stopWatchingLocation } from '../services/geolocationService';
import { Location } from '../types';

export const useLocation = (watch: boolean = false) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!watch) {
      fetchLocation();
      return;
    }

    // Watch mode
    const watchId = watchLocation(
      (loc) => {
        setLocation(loc);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      stopWatchingLocation(watchId);
    };
  }, [watch, fetchLocation]);

  return {
    location,
    error,
    loading,
    refetch: fetchLocation,
  };
};
