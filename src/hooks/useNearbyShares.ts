import { useState, useEffect } from 'react';
import { subscribeToNearbyShares } from '../services/firestoreService';
import type { MusicShare, Location } from '../types';

export const useNearbyShares = (location: Location | null, radiusInKm: number = 5) => {
  const [shares, setShares] = useState<MusicShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!location) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToNearbyShares(
      location.latitude,
      location.longitude,
      radiusInKm,
      (nearbyShares) => {
        setShares(nearbyShares);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [location?.latitude, location?.longitude, radiusInKm]);

  return {
    shares,
    loading,
    error,
  };
};
