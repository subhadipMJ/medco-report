import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchCompareReports, fetchCompareReportsDetails } from '../services/api';
import type { CompareReportDetails, CompareReportParameter } from '../types/api';

interface UseReportCompareFilters {
  search?: string;
  page?: number;
}

interface UseReportCompareResult {
  params: CompareReportParameter[];
  loading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  refetch: () => void;
  hasMore: boolean;
}

interface UseReportCompareDetailsResult {
  details: CompareReportDetails[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useReportCompare = (token: string | null, filters: UseReportCompareFilters = {}): UseReportCompareResult => {
  const [params, setParams] = useState<CompareReportParameter[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [trigger, setTrigger] = useState(0);

  const prevFiltersRef = useRef({ search: '', page: 1 });
  const accumulatedRef = useRef<CompareReportParameter[]>([]);

  useEffect(() => {
    if (!token) return;

    const currentFilters = {
      search: filters.search || '',
      page: filters.page || 1,
    };

    const filtersChanged = currentFilters.search !== prevFiltersRef.current.search;
    const isFirstPage = filtersChanged || currentFilters.page === 1;

    if (isFirstPage) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    fetchCompareReports(token, currentFilters.page, currentFilters.search)
      .then((res) => {
        const newData = Array.isArray(res.data) ? res.data : [];

        if (isFirstPage) {
          accumulatedRef.current = newData;
        } else {
          accumulatedRef.current = [...accumulatedRef.current, ...newData];
        }

        setParams(accumulatedRef.current);
        
        if(res.pagination){
          setHasMore(res.pagination.current_page < res.pagination.last_page);
        }
        prevFiltersRef.current = currentFilters;
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch compare reports');
      })
      .finally(() => {
        if (isFirstPage) {
          setLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      });
  }, [token, trigger, filters.search, filters.page]);

  const refetch = () => setTrigger((t) => t + 1);

  return { params, loading, isLoadingMore, error, refetch, hasMore };
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
