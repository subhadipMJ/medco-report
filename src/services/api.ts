import { LabReportDetailsResponse, LabReportGroupData, LabReportGroupDetailsResponse, LabReportListResponse, LabReportParameterData, LabReportParameterDetailsResponse, LabReportTypeData, LabReportTypeDetailsResponse } from '../types/api';
import { cacheResponse, getCachedResponse } from './offlineCache';

// const BASE_URL = 'https://www.medcoclinics.com/api';  // live
const BASE_URL = 'https://medco.code-dev.in/api';

// In-flight request deduplication maps
const inFlightLists = new Map<string, Promise<LabReportListResponse>>();
const inFlightDetails = new Map<string, Promise<LabReportDetailsResponse>>();
const inFlightTypeDetails = new Map<string, Promise<LabReportTypeData>>();
const inFlightGroupDetails = new Map<string, Promise<LabReportGroupData>>();
const inFlightParameterDetails = new Map<string, Promise<LabReportParameterData>>();

export const fetchLabReports = async (
  token: string,
  search?: string,
  start_date?: string,
  end_date?: string,
): Promise<LabReportListResponse> => {
  const cacheKey = `lists-${token.slice(-8)}-${search || ''}-${start_date || ''}-${end_date || ''}`;
  if (inFlightLists.has(cacheKey)) {
    return inFlightLists.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const body: Record<string, string> = {};
      if (search) body.search_query = search;
      if (start_date) body.start_date = start_date;
      if (end_date) body.end_date = end_date;

      const response = await fetch(`${BASE_URL}/web/reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: Object.keys(body).length ? JSON.stringify(body) : undefined,
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || '60';
        throw new Error(`Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`);
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data: LabReportListResponse = await response.json();
      await cacheResponse(cacheKey, data);
      return data;
    } catch (err) {
      const cached = await getCachedResponse<LabReportListResponse>(cacheKey);
      if (cached) {
        console.warn('Serving cached lab reports (offline mode)');
        return cached;
      }
      throw err;
    } finally {
      inFlightLists.delete(cacheKey);
    }
  })();

  inFlightLists.set(cacheKey, promise);
  return promise;
};

export const fetchLabReportDetails = async (
  token: string,
  testId: string,
  startDate?: string,
  endDate?: string,
): Promise<LabReportDetailsResponse> => {
  const dateSuffix = startDate && endDate ? `-${startDate}-${endDate}` : '';
  const cacheKey = `details-${testId}-${token.slice(-8)}${dateSuffix}`;
  if (inFlightDetails.has(cacheKey)) {
    return inFlightDetails.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const response = await fetch(`${BASE_URL}/web/reports/${testId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          // test_id: testId,
          ...(startDate ? { start_date: startDate } : {}),
          ...(endDate ? { end_date: endDate } : {}),
        }),
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || '60';
        throw new Error(`Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`);
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data: LabReportDetailsResponse = await response.json();
      await cacheResponse(cacheKey, data);
      return data;
    } catch (err) {
      const cached = await getCachedResponse<LabReportDetailsResponse>(cacheKey);
      if (cached) {
        console.warn('Serving cached report details (offline mode)');
        return cached;
      }
      throw err;
    } finally {
      inFlightDetails.delete(cacheKey);
    }
  })();

  inFlightDetails.set(cacheKey, promise);
  return promise;
}

export const fetchLabReportType = async (
  token: string,
): Promise<LabReportTypeData> => {
  const cacheKey = `type-details-${token.slice(-8)}`;
  if (inFlightTypeDetails.has(cacheKey)) {
    return inFlightTypeDetails.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const response = await fetch(`${BASE_URL}/lab-report-type`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || '60';
        throw new Error(`Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`);
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data: LabReportTypeDetailsResponse = await response.json();
      await cacheResponse(cacheKey, data.data);
      return data.data;
    } catch (err) {
      const cached = await getCachedResponse<LabReportTypeData>(cacheKey);
      if (cached) {
        console.warn('Serving cached report details (offline mode)');
        return cached;
      }
      throw err;
    } finally {
      inFlightTypeDetails.delete(cacheKey);
    }
  })();

  inFlightTypeDetails.set(cacheKey, promise);
  return promise;
};

export const fetchLabReportGroupDetails = async (
  token: string,
  groupId: string,
): Promise<LabReportGroupData> => {
  const cacheKey = `group-details-${groupId}-${token.slice(-8)}`;
  if (inFlightGroupDetails.has(cacheKey)) {
    return inFlightGroupDetails.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const response = await fetch(`${BASE_URL}/lab-report/group/${groupId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || '60';
        throw new Error(`Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`);
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data: LabReportGroupDetailsResponse = await response.json();
      await cacheResponse(cacheKey, data.data);
      return data.data;
    } catch (err) {
      const cached = await getCachedResponse<LabReportGroupData>(cacheKey);
      if (cached) {
        console.warn('Serving cached report details (offline mode)');
        return cached;
      }
      throw err;
    } finally {
      inFlightGroupDetails.delete(cacheKey);
    }
  })();

  inFlightGroupDetails.set(cacheKey, promise);
  return promise;
};

export const fetchLabReportParameterDetails = async (
  token: string,
  parameterId: string,
): Promise<LabReportParameterData> => {
  const cacheKey = `parameter-details-${parameterId}-${token.slice(-8)}`;
  if (inFlightParameterDetails.has(cacheKey)) {
    return inFlightParameterDetails.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const response = await fetch(`${BASE_URL}/lab-report/parameter/${parameterId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || '60';
        throw new Error(`Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`);
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data: LabReportParameterDetailsResponse = await response.json();
      await cacheResponse(cacheKey, data.data);
      return data.data;
    } catch (err) {
      const cached = await getCachedResponse<LabReportParameterData>(cacheKey);
      if (cached) {
        console.warn('Serving cached report details (offline mode)');
        return cached;
      }
      throw err;
    } finally {
      inFlightParameterDetails.delete(cacheKey);
    }
  })();

  inFlightParameterDetails.set(cacheKey, promise);
  return promise;
};

