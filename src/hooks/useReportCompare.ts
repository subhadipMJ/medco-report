import { useState, useEffect, useCallback } from 'react';
import { fetchCompareReports, fetchCompareReportsDetails } from '../services/api';
import type { CompareReportDetails, CompareReportParameter } from '../types/api';

interface UseReportCompareResult {
  params: CompareReportParameter[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface UseReportCompareDetailsResult {
  details: CompareReportDetails[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useReportCompare = (token: string | null, page: number = 1): UseReportCompareResult => {
  const [params, setParams] = useState<CompareReportParameter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);
    
  const fetch = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    fetchCompareReports(token, page)
      .then((res) => {
        const newData = Array.isArray(res.data) ? res.data : [];
        setParams((prev) => (page === 1 ? newData : [...prev, ...newData]));
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch compare reports');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, page]);

  useEffect(() => {
    fetch();
  }, [fetch, trigger]);

  const refetch = useCallback(() => setTrigger((t) => t + 1), []);

  return { params, loading, error, refetch };
};

export const useReportCompareDetails = (token: string | null, parameter_ids: string[]): UseReportCompareDetailsResult => {
  const [details, setDetails] = useState<CompareReportDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    if (!token || parameter_ids.length === 0) return;
    setLoading(true);
    setError(null);
    fetchCompareReportsDetails(token, parameter_ids)
      .then((res) => {
        setDetails(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch compare reports');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, parameter_ids]);

  const refetch = useCallback(() => {
    fetch();
  }, [fetch]);

  return { details, loading, error, refetch };
};
