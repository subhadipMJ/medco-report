import { useState, useEffect } from 'react';
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

interface UseLabReportsResult {
  data: GroupedByTestType[];
  rawList: LabReport[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useLabReports = (token: string | null): UseLabReportsResult => {
  const [data, setData] = useState<GroupedByTestType[]>([]);
  const [rawList, setRawList] = useState<LabReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setError(null);

    fetchLabReports(token)
      .then(res => {
        setRawList(res.data || []);
        setData(groupReports(res.data || []));
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch lab reports');
      })
      .finally(() => setLoading(false));
  }, [token, trigger]);

  const refetch = () => setTrigger(t => t + 1);

  return { data, rawList, loading, error, refetch };
};
