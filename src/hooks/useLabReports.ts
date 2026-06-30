import { useState, useEffect } from 'react';
import { addLabReport, deleteLabReport, fetchLabReports } from '../services/api';
import { LabReport, GroupedByTestType, AddLabReportRequest, DeleteLabReportRequest } from '../types/api';

const groupReports = (lists: LabReport[]): GroupedByTestType[] => {
  if (!lists || lists.length === 0) return [];

  const testTypeMap = new Map<number, GroupedByTestType>();

  lists.forEach(report => {
    const ttId = report.test_type.id;
    if (!testTypeMap.has(ttId)) {
      testTypeMap.set(ttId, { testType: report.test_type, groups: [] });
    }
    const testTypeEntry = testTypeMap.get(ttId)!;

    const groupIdx = testTypeEntry.groups.findIndex(g => g.groupId === Number(report.group_id));
    if (groupIdx === -1) {
      testTypeEntry.groups.push({
        groupId: Number(report.group_id),
        groupName: report.group.name,
        groupKeyword: report.group.key_word,
        testType: report.test_type,
        latestDate: report.date_of_test,
        labName: report.lab_name,
        doctorName: report.doctor_name,
        parameters: [report],
      });
    } else {
      testTypeEntry.groups[groupIdx].parameters.push(report);
      if (report.date_of_test > testTypeEntry.groups[groupIdx].latestDate) {
        testTypeEntry.groups[groupIdx].latestDate = report.date_of_test;
        testTypeEntry.groups[groupIdx].labName = report.lab_name;
        testTypeEntry.groups[groupIdx].doctorName = report.doctor_name;
      }
    }
  });

  return Array.from(testTypeMap.values());
};

interface UseLabReportsFilters {
  search?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  page?: number;
}

interface PaginationInfo {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
}

interface UseLabReportsResult {
  data: GroupedByTestType[];
  rawList: LabReport[];
  pagination: PaginationInfo | null;
  loading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  refetch: () => void;
  highestCachedPage: number;
}

interface UseAddLabReportResult {
  submit: (request: AddLabReportRequest) => Promise<void>;
  success: string | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

interface UseDeleteLabReportResult {
  submit: (request: DeleteLabReportRequest) => Promise<void>;
  success: string | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

interface AccumulatedCache {
  list: LabReport[];
  filters: { search: string; start_date: string; end_date: string; status: string };
  lastPage: number;
  pagination: PaginationInfo | null;
}

const accCache: AccumulatedCache = {
  list: [],
  filters: { search: '', start_date: '', end_date: '', status: '' },
  lastPage: 0,
  pagination: null,
};

export const useLabReports = (
  token: string | null,
  filters: UseLabReportsFilters = {},
): UseLabReportsResult => {
  const [data, setData] = useState<GroupedByTestType[]>([]);
  const [rawList, setRawList] = useState<LabReport[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!token) return;

    const currentFilters = {
      search: filters.search || '',
      start_date: filters.start_date || '',
      end_date: filters.end_date || '',
      status: filters.status || '',
      page: filters.page || 1,
    };

    const cacheFiltersChanged =
      currentFilters.search !== accCache.filters.search ||
      currentFilters.start_date !== accCache.filters.start_date ||
      currentFilters.end_date !== accCache.filters.end_date ||
      currentFilters.status !== accCache.filters.status;

    if (cacheFiltersChanged) {
      accCache.list = [];
      accCache.lastPage = 0;
      accCache.pagination = null;
      accCache.filters = { search: currentFilters.search, start_date: currentFilters.start_date, end_date: currentFilters.end_date, status: currentFilters.status };
    }

    const isFirstPage = currentFilters.page === 1;

    const handleResult = (res: any) => {
      const list = Array.isArray(res.data.data) ? res.data.data : [];
      const pageInfo = {
        currentPage: res.data.current_page,
        lastPage: res.data.last_page,
        total: res.data.total,
        perPage: res.data.per_page,
      };
      setPagination(pageInfo);
      return { list, pageInfo };
    };

    // If we already have cached data covering this page, restore it without fetching
    if (accCache.list.length > 0 && accCache.pagination && currentFilters.page <= accCache.lastPage) {
      setPagination(accCache.pagination);
      setRawList(accCache.list);
      setData(groupReports(accCache.list));
      return;
    }

    const dedupe = (items: LabReport[]) => {
      const seen = new Set<number>();
      return items.filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });
    };

    // If cache is empty but page > 1, re-fetch all previous pages to rebuild the list
    if (accCache.list.length === 0 && currentFilters.page > 1) {
      const pages = Array.from({ length: currentFilters.page }, (_, i) => i + 1);
      Promise.all(
        pages.map((p) =>
          fetchLabReports(token, filters.search, filters.start_date, filters.end_date, filters.status, p)
        )
      )
        .then((results) => {
          const allLists: LabReport[] = [];
          let lastPageInfo: PaginationInfo | null = null;
          results.forEach((r) => {
            const { list, pageInfo } = handleResult(r);
            allLists.push(...list);
            lastPageInfo = pageInfo;
          });
          accCache.list = dedupe(allLists);
          accCache.lastPage = currentFilters.page;
          accCache.pagination = lastPageInfo;
          setPagination(lastPageInfo);
          setRawList(accCache.list);
          setData(groupReports(accCache.list));
        })
        .catch((err) => {
          setError(err.message || 'Failed to fetch lab reports');
        })
        .finally(() => {
          setLoading(false);
          setIsLoadingMore(false);
        });
      return;
    }

    if (isFirstPage) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    fetchLabReports(token, filters.search, filters.start_date, filters.end_date, filters.status, filters.page)
      .then((res) => {
        const { list, pageInfo } = handleResult(res);

        if (isFirstPage) {
          accCache.list = list;
        } else {
          const seen = new Set(accCache.list.map((item: LabReport) => item.id));
          const newItems = list.filter((item: LabReport) => !seen.has(item.id));
          accCache.list = [...accCache.list, ...newItems];
        }

        accCache.lastPage = currentFilters.page;
        accCache.pagination = pageInfo;
        setRawList(accCache.list);
        setData(groupReports(accCache.list));
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch lab reports');
      })
      .finally(() => {
        if (isFirstPage) {
          setLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      });
  }, [token, trigger, filters.search, filters.start_date, filters.end_date, filters.status, filters.page]);

  const refetch = () => setTrigger(t => t + 1);

  return { data, rawList, pagination, loading, isLoadingMore, error, refetch, highestCachedPage: accCache.lastPage };
};

export const useAddLabReport = (token: string | null): UseAddLabReportResult => {
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (request: AddLabReportRequest): Promise<void> => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const response = await addLabReport(token, request);
      if (response.success > 0 && response.message) {
        setSuccess(response.message);
      } else {
        setSuccess('Lab report added successfully');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add lab report';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSuccess(null);
    setError(null);
  };

  return { loading, error, success, submit, reset };
};

export const useDeleteLabReport = (token: string | null): UseDeleteLabReportResult => {
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (request: DeleteLabReportRequest): Promise<void> => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const response = await deleteLabReport(token, request);
      if (response.success > 0 && response.message) {
        setSuccess(response.message);
      } else {
        setSuccess('Lab report deleted successfully');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete lab report';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSuccess(null);
    setError(null);
  };

  return { loading, error, success, submit, reset };
};
