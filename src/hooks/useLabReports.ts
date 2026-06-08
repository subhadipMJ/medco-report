import { useState, useEffect, useRef } from 'react';
import { fetchLabReports } from '../services/api';
import { LabReport, GroupedByTestType } from '../types/api';

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
}

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

  const prevFiltersRef = useRef({ search: '', start_date: '', end_date: '', page: 1 });
  const accumulatedRef = useRef<LabReport[]>([]);

  useEffect(() => {
    if (!token) return;

    const currentFilters = {
      search: filters.search || '',
      start_date: filters.start_date || '',
      end_date: filters.end_date || '',
      page: filters.page || 1,
    };

    const filtersChanged =
      currentFilters.search !== prevFiltersRef.current.search ||
      currentFilters.start_date !== prevFiltersRef.current.start_date ||
      currentFilters.end_date !== prevFiltersRef.current.end_date;

    const isFirstPage = filtersChanged || currentFilters.page === 1;

    if (isFirstPage) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    fetchLabReports(token, filters.search, filters.start_date, filters.end_date, filters.page)
      .then(res => {
        const list = Array.isArray(res.data.data) ? res.data.data : [];

        if (isFirstPage) {
          accumulatedRef.current = list;
        } else {
          accumulatedRef.current = [...accumulatedRef.current, ...list];
        }

        setRawList(accumulatedRef.current);
        setData(groupReports(accumulatedRef.current));
        setPagination({
          currentPage: res.data.current_page,
          lastPage: res.data.last_page,
          total: res.data.total,
          perPage: res.data.per_page,
        });

        prevFiltersRef.current = currentFilters;
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch lab reports');
      })
      .finally(() => {
        if (isFirstPage) {
          setLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      });
  }, [token, trigger, filters.search, filters.start_date, filters.end_date, filters.page]);

  const refetch = () => setTrigger(t => t + 1);

  return { data, rawList, pagination, loading, isLoadingMore, error, refetch };
};
