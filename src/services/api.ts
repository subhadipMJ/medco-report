import { LabReportListResponse } from '../types/api';
import { cacheResponse, getCachedResponse } from './offlineCache';

const BASE_URL = 'https://www.medcoclinics.com/api';
const CACHE_KEY = 'lab-reports';

export const fetchLabReports = async (token: string): Promise<LabReportListResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/user-lab-report/list`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data: LabReportListResponse = await response.json();
    await cacheResponse(CACHE_KEY, data);
    return data;
  } catch (err) {
    const cached = await getCachedResponse<LabReportListResponse>(CACHE_KEY);
    if (cached) {
      console.warn('Serving cached lab reports (offline mode)');
      return cached;
    }
    throw err;
  }
};
