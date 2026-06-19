import { useState, useEffect, useCallback } from 'react';
import { fetchUserProfile } from '../services/api';
import { UserProfile } from '../types/api';

export interface UseUserProfileResult {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useUserProfile = (token: string | null): UseUserProfileResult => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const fetch = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    fetchUserProfile(token)
      .then((res) => {
        if (res.success === 1 && res.data) {
          setUser(res.data);
        } else {
          setError(res.message || 'Failed to fetch user profile');
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch user profile');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    fetch();
  }, [fetch, trigger]);

  const refetch = useCallback(() => setTrigger((t) => t + 1), []);

  return { user, loading, error, refetch };
};
