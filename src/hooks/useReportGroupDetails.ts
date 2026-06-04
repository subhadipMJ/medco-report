import { useState, useEffect, useRef } from 'react';
import { fetchLabReportGroupDetails } from '../services/api';
import { LabReportGroupData } from '../types/api';

interface UseReportDetailsResult {
  data: LabReportGroupData[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useReportGroupDetails = (
  token: string | null,
  groupId: string,
): UseReportDetailsResult => {
  const [data, setData] = useState<LabReportGroupData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!token || !groupId) return;

    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    fetchLabReportGroupDetails(token, groupId)
      .then(res => {
        if (!controller.signal.aborted) {
          setData(res ? [res] : []);
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
  }, [token, groupId, trigger]);

  const refetch = () => setTrigger(t => t + 1);

  return { data, loading, error, refetch };
};
