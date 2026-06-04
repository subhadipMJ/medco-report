import { useState, useEffect, useRef } from 'react';
import { fetchLabReportDetails } from '../services/api';
import { LabReport } from '../types/api';

interface UseReportDetailsResult {
  data: LabReport[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useReportDetails = (
  token: string | null,
  testId: string,
  startDate?: string,
  endDate?: string,
): UseReportDetailsResult => {
  const [data, setData] = useState<LabReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!token || !testId) return;

    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    fetchLabReportDetails(token, testId, startDate, endDate)
      .then(res => {
        if (!controller.signal.aborted) {
          setData(res.data?.data || []);
        }
      })
      .catch(err => {
        if (!controller.signal.aborted) {
          setError(err.message || 'Failed to fetch report details');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [token, testId, startDate, endDate, trigger]);

  const refetch = () => setTrigger(t => t + 1);

  return { data, loading, error, refetch };
};
