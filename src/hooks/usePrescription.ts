import { useState, useEffect, useCallback } from 'react';
import { fetchPrescriptions } from '../services/api';
import { Prescription } from '../types/api';

interface UsePrescriptionResult {
  prescriptions: Prescription[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const usePrescription = (token: string | null): UsePrescriptionResult => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);
    
  const fetch = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    fetchPrescriptions(token)
      .then((res) => {
        setPrescriptions(Array.isArray(res.prescription) ? res.prescription : []);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch prescriptions');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    fetch();
  }, [fetch, trigger]);

  const refetch = useCallback(() => setTrigger((t) => t + 1), []);

  return { prescriptions, loading, error, refetch };
};
