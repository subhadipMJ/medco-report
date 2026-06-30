import axios from "axios";
import {
  AddDoctorRequest,
  AddDoctorResponse,
  AddLabReportRequest,
  AddLabReportResponse,
  AddLabRequest,
  AddLabResponse,
  AddVitalOthersRequest,
  AddVitalOthersResponse,
  AddVitalRequest,
  AddVitalResponse,
  CompareReportDetailsResponse,
  CompareReportsResponse,
  DeleteLabReportRequest,
  DeleteLabReportResponse,
  DoctorResponse,
  LabReportDetailsResponse,
  LabReportGroupData,
  LabReportGroupDetailsResponse,
  LabReportListResponse,
  LabReportParameterData,
  LabReportParameterDetailsResponse,
  LabReportTypeData,
  LabReportTypeDetailsResponse,
  LabResponse,
  PrescriptionResponse,
  PrescriptionSubmitRequest,
  PrescriptionSubmitResponse,
  DeletePrescriptionRequest,
  DeletePrescriptionResponse,
  UserProfileResponse,
  VitalsOthersResponse,
  VitalsResponse,
} from "../types/api";
import { cacheResponse, getCachedResponse } from "./offlineCache";

const BASE_URL = "https://www.medcoclinics.com/api"; // live
// const BASE_URL = 'https://medco.code-dev.in/api';

// remove csrf token and origin headers
delete axios.defaults.headers.common["X-XSRF-TOKEN"];
delete axios.defaults.headers.common["X-CSRF-TOKEN"];
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  delete config.headers["Origin"];
  return config;
});

// In-flight request deduplication
const inFlightLists = new Map<string, Promise<LabReportListResponse>>();
const inFlightDetails = new Map<string, Promise<LabReportDetailsResponse>>();
const inFlightTypeDetails = new Map<string, Promise<LabReportTypeData>>();
const inFlightGroupDetails = new Map<string, Promise<LabReportGroupData>>();
const inFlightParameterDetails = new Map<
  string,
  Promise<LabReportParameterData>
>();
const inFlightCompareReports = new Map<
  string,
  Promise<CompareReportsResponse>
>();
const inFlightCompareDetails = new Map<
  string,
  Promise<CompareReportDetailsResponse>
>();
const inFlightPrescriptions = new Map<string, Promise<PrescriptionResponse>>();
const inFlightUserProfile = new Map<string, Promise<UserProfileResponse>>();
const inFlightDoctor = new Map<string, Promise<DoctorResponse>>();
const inFlightLab = new Map<string, Promise<LabResponse>>();
const inFlightVitals = new Map<string, Promise<VitalsResponse>>();
const inFlightVitalsOthers = new Map<string, Promise<VitalsOthersResponse>>();

// In-memory TTL cache (ms)
const CACHE_TTL = 60_000;
const cache = new Map<string, { data: unknown; ts: number }>();

function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, ts: Date.now() });
}

export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) cache.delete(key);
  }
}

export const fetchCompareReports = async (
  token: string,
  page?: number,
  search?: string,
): Promise<CompareReportsResponse> => {
  const cacheKey = `compare-reports-${token.slice(-8)}-${page || 1}-${search || ""}`;
  const cached = getCache<CompareReportsResponse>(cacheKey);
  if (cached) return cached;
  if (inFlightCompareReports.has(cacheKey)) {
    return inFlightCompareReports.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const response = await api.get("/web/compare-reports", {
        params: { page: page || 1, search: search || undefined },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: CompareReportsResponse = response.data;
      setCache(cacheKey, data);
      await cacheResponse(cacheKey, data);
      return data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          const retryAfter = err.response.headers["retry-after"] || "60";
          throw new Error(
            `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
          );
        }
      }
      const cached = await getCachedResponse<CompareReportsResponse>(cacheKey);
      if (cached) {
        console.warn("Serving cached compare reports (offline mode)");
        return cached;
      }
      if (axios.isAxiosError(err)) {
        throw new Error(
          `API error: ${err.response?.status} ${err.response?.statusText}`,
        );
      }
      throw err;
    } finally {
      inFlightCompareReports.delete(cacheKey);
    }
  })();

  inFlightCompareReports.set(cacheKey, promise);
  return promise;
};

export const fetchCompareReportsDetails = async (
  token: string,
  parameterIds: string[],
): Promise<CompareReportDetailsResponse> => {
  const cacheKey = `compare-reports-details-${token.slice(-8)}-${parameterIds.join("-")}`;
  const cached = getCache<CompareReportDetailsResponse>(cacheKey);
  if (cached) return cached;
  if (inFlightCompareDetails.has(cacheKey)) {
    return inFlightCompareDetails.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const response = await api.post(
        "/web/compare-report-detail",
        {
          parameter_ids: parameterIds.map((id) => parseInt(id)),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data: CompareReportDetailsResponse = response.data;
      setCache(cacheKey, data);
      await cacheResponse(cacheKey, data);
      return data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          const retryAfter = err.response.headers["retry-after"] || "60";
          throw new Error(
            `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
          );
        }
      }
      const cached =
        await getCachedResponse<CompareReportDetailsResponse>(cacheKey);
      if (cached) {
        console.warn("Serving cached compare reports (offline mode)");
        return cached;
      }
      if (axios.isAxiosError(err)) {
        throw new Error(
          `API error: ${err.response?.status} ${err.response?.statusText}`,
        );
      }
      throw err;
    } finally {
      inFlightCompareDetails.delete(cacheKey);
    }
  })();

  inFlightCompareDetails.set(cacheKey, promise);
  return promise;
};

export const fetchPrescriptions = async (
  token: string,
): Promise<PrescriptionResponse> => {
  const cacheKey = `prescriptions-${token.slice(-8)}`;
  const cached = getCache<PrescriptionResponse>(cacheKey);
  if (cached) return cached;
  if (inFlightPrescriptions.has(cacheKey)) {
    return inFlightPrescriptions.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const response = await api.post("/prescription/display", undefined, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: PrescriptionResponse = response.data;
      setCache(cacheKey, data);
      await cacheResponse(cacheKey, data);
      return data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          const retryAfter = err.response.headers["retry-after"] || "60";
          throw new Error(
            `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
          );
        }
        throw new Error(
          `API error: ${err.response?.status} ${err.response?.statusText}`,
        );
      }
      const cached = await getCachedResponse<PrescriptionResponse>(cacheKey);
      if (cached) {
        console.warn("Serving cached prescriptions (offline mode)");
        return cached;
      }
      throw err;
    } finally {
      inFlightPrescriptions.delete(cacheKey);
    }
  })();

  inFlightPrescriptions.set(cacheKey, promise);
  return promise;
};

export const addPrescriptions = async (
  token: string,
  request: PrescriptionSubmitRequest,
): Promise<PrescriptionSubmitResponse> => {
  const formData = new FormData();
  formData.append("doctor_name", request.doctor_name);
  formData.append("prescription", request.prescription);

  const promise = (async () => {
    try {
      const response = await api.post("/prescription/submit", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const data: PrescriptionSubmitResponse = response.data;
      invalidateCache("prescriptions-");
      return data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          const retryAfter = err.response.headers["retry-after"] || "60";
          throw new Error(
            `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
          );
        }
        throw new Error(
          `API error: ${err.response?.status} ${err.response?.statusText}`,
        );
      }
      throw err;
    }
  })();

  return promise;
};

export const deletePrescriptions = async (
  token: string,
  request: DeletePrescriptionRequest,
): Promise<DeletePrescriptionResponse> => {
  const payload = { ...request };

  try {
    const response = await api.post("/prescription/delete", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data: DeletePrescriptionResponse = response.data;
    invalidateCache("prescriptions-");
    return data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 429) {
        const retryAfter = err.response.headers["retry-after"] || "60";
        throw new Error(
          `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
        );
      }
      throw new Error(
        `API error: ${err.response?.status} ${err.response?.statusText}`,
      );
    }
    throw err;
  }
};

export const fetchLabReports = async (
  token: string,
  search?: string,
  start_date?: string,
  end_date?: string,
  status?: string,
  page?: number,
): Promise<LabReportListResponse> => {
  const cacheKey = `lists-${token.slice(-8)}-${search || ""}-${start_date || ""}-${end_date || ""}-${status || ""}-${page || 1}`;
  const cached = getCache<LabReportListResponse>(cacheKey);
  if (cached) return cached;
  if (inFlightLists.has(cacheKey)) {
    return inFlightLists.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const body: Record<string, string | number> = {};
      if (search) body.search_query = search;
      if (start_date) body.start_date = start_date;
      if (end_date) body.end_date = end_date;
      if (status) body.status = status;
      // if (page) body.page = page;

      const response = await api.post(
        "/web/reports",
        Object.keys(body).length ? body : undefined,
        {
          params: {
            page: page || 1,
            start_date: start_date || "",
            end_date: end_date || "",
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data: LabReportListResponse = response.data;
      setCache(cacheKey, data);
      await cacheResponse(cacheKey, data);
      return data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          const retryAfter = err.response.headers["retry-after"] || "60";
          throw new Error(
            `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
          );
        }
      }
      const cached = await getCachedResponse<LabReportListResponse>(cacheKey);
      if (cached) {
        console.warn("Serving cached lab reports (offline mode)");
        return cached;
      }
      if (axios.isAxiosError(err)) {
        throw new Error(
          `API error: ${err.response?.status} ${err.response?.statusText}`,
        );
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
  const dateSuffix = startDate && endDate ? `-${startDate}-${endDate}` : "";
  const cacheKey = `details-${testId}-${token.slice(-8)}${dateSuffix}`;
  const cached = getCache<LabReportDetailsResponse>(cacheKey);
  if (cached) return cached;
  if (inFlightDetails.has(cacheKey)) {
    return inFlightDetails.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const response = await api.post(
        `/web/reports/${testId}`,
        {
          ...(startDate ? { start_date: startDate } : {}),
          ...(endDate ? { end_date: endDate } : {}),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data: LabReportDetailsResponse = response.data;
      setCache(cacheKey, data);
      await cacheResponse(cacheKey, data);
      return data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          const retryAfter = err.response.headers["retry-after"] || "60";
          throw new Error(
            `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
          );
        }
      }
      const cached =
        await getCachedResponse<LabReportDetailsResponse>(cacheKey);
      if (cached) {
        console.warn("Serving cached report details (offline mode)");
        return cached;
      }
      if (axios.isAxiosError(err)) {
        throw new Error(
          `API error: ${err.response?.status} ${err.response?.statusText}`,
        );
      }
      throw err;
    } finally {
      inFlightDetails.delete(cacheKey);
    }
  })();

  inFlightDetails.set(cacheKey, promise);
  return promise;
};

export const fetchLabReportType = async (
  token: string,
): Promise<LabReportTypeData> => {
  const cacheKey = `type-details-${token.slice(-8)}`;
  const cached = getCache<LabReportTypeData>(cacheKey);
  if (cached) return cached;
  if (inFlightTypeDetails.has(cacheKey)) {
    return inFlightTypeDetails.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const response = await api.get("/lab-report-type", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: LabReportTypeDetailsResponse = response.data;
      setCache(cacheKey, data.data);
      await cacheResponse(cacheKey, data.data);
      return data.data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          const retryAfter = err.response.headers["retry-after"] || "60";
          throw new Error(
            `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
          );
        }
      }
      const cached = await getCachedResponse<LabReportTypeData>(cacheKey);
      if (cached) {
        console.warn("Serving cached report details (offline mode)");
        return cached;
      }
      if (axios.isAxiosError(err)) {
        throw new Error(
          `API error: ${err.response?.status} ${err.response?.statusText}`,
        );
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
  const cached = getCache<LabReportGroupData>(cacheKey);
  if (cached) return cached;
  if (inFlightGroupDetails.has(cacheKey)) {
    return inFlightGroupDetails.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const response = await api.get(`/lab-report/group/${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: LabReportGroupDetailsResponse = response.data;
      setCache(cacheKey, data.data);
      await cacheResponse(cacheKey, data.data);
      return data.data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          const retryAfter = err.response.headers["retry-after"] || "60";
          throw new Error(
            `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
          );
        }
      }
      const cached = await getCachedResponse<LabReportGroupData>(cacheKey);
      if (cached) {
        console.warn("Serving cached report details (offline mode)");
        return cached;
      }
      if (axios.isAxiosError(err)) {
        throw new Error(
          `API error: ${err.response?.status} ${err.response?.statusText}`,
        );
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
  const cached = getCache<LabReportParameterData>(cacheKey);
  if (cached) return cached;
  if (inFlightParameterDetails.has(cacheKey)) {
    return inFlightParameterDetails.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const response = await api.get(`/lab-report/parameter/${parameterId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: LabReportParameterDetailsResponse = response.data;
      setCache(cacheKey, data.data);
      await cacheResponse(cacheKey, data.data);
      return data.data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          const retryAfter = err.response.headers["retry-after"] || "60";
          throw new Error(
            `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
          );
        }
      }
      const cached = await getCachedResponse<LabReportParameterData>(cacheKey);
      if (cached) {
        console.warn("Serving cached report details (offline mode)");
        return cached;
      }
      if (axios.isAxiosError(err)) {
        throw new Error(
          `API error: ${err.response?.status} ${err.response?.statusText}`,
        );
      }
      throw err;
    } finally {
      inFlightParameterDetails.delete(cacheKey);
    }
  })();

  inFlightParameterDetails.set(cacheKey, promise);
  return promise;
};

export const fetchUserProfile = async (
  token: string,
): Promise<UserProfileResponse> => {
  const cacheKey = `user-profile-${token.slice(-8)}`;
  const cached = getCache<UserProfileResponse>(cacheKey);
  if (cached) return cached;
  if (inFlightUserProfile.has(cacheKey)) {
    return inFlightUserProfile.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const response = await api.get("/user/getDetails", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: UserProfileResponse = response.data;
      setCache(cacheKey, data);
      return data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          const retryAfter = err.response.headers["retry-after"] || "60";
          throw new Error(
            `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
          );
        }
        throw new Error(
          `API error: ${err.response?.status} ${err.response?.statusText}`,
        );
      }
      throw err;
    } finally {
      inFlightUserProfile.delete(cacheKey);
    }
  })();

  inFlightUserProfile.set(cacheKey, promise);
  return promise;
};

export const fetchDoctor = async (token: string): Promise<DoctorResponse> => {
  const cacheKey = `doctor-${token.slice(-8)}`;
  const cached = getCache<DoctorResponse>(cacheKey);
  if (cached) return cached;
  if (inFlightDoctor.has(cacheKey)) {
    return inFlightDoctor.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const response = await api.get("/userDoctor", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: DoctorResponse = response.data;
      setCache(cacheKey, data);
      return data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          const retryAfter = err.response.headers["retry-after"] || "60";
          throw new Error(
            `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
          );
        }
        throw new Error(
          `API error: ${err.response?.status} ${err.response?.statusText}`,
        );
      }
      throw err;
    } finally {
      inFlightDoctor.delete(cacheKey);
    }
  })();

  inFlightDoctor.set(cacheKey, promise);
  return promise;
};

export const addDoctor = async (
  token: string,
  request: AddDoctorRequest,
): Promise<AddDoctorResponse> => {
  const promise = (async () => {
    try {
      const response = await api.post("/userDoctor", request, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: AddDoctorResponse = response.data;
      invalidateCache("doctor-");
      return data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          const retryAfter = err.response.headers["retry-after"] || "60";
          throw new Error(
            `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
          );
        }
        throw new Error(
          `API error: ${err.response?.status} ${err.response?.statusText}`,
        );
      }
      throw err;
    }
  })();
  return promise;
};

export const fetchLab = async (token: string): Promise<LabResponse> => {
  const cacheKey = `lab-${token.slice(-8)}`;
  const cached = getCache<LabResponse>(cacheKey);
  if (cached) return cached;
  if (inFlightLab.has(cacheKey)) {
    return inFlightLab.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const response = await api.get("/userlabname", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: LabResponse = response.data;
      setCache(cacheKey, data);
      return data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          const retryAfter = err.response.headers["retry-after"] || "60";
          throw new Error(
            `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
          );
        }
        throw new Error(
          `API error: ${err.response?.status} ${err.response?.statusText}`,
        );
      }
      throw err;
    } finally {
      inFlightLab.delete(cacheKey);
    }
  })();

  inFlightLab.set(cacheKey, promise);
  return promise;
};

export const addLab = async (
  token: string,
  request: AddLabRequest,
): Promise<AddLabResponse> => {
  const promise = (async () => {
    try {
      const response = await api.post("/userlabname", request, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: AddLabResponse = response.data;
      invalidateCache("lab-");
      return data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          const retryAfter = err.response.headers["retry-after"] || "60";
          throw new Error(
            `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
          );
        }
        throw new Error(
          `API error: ${err.response?.status} ${err.response?.statusText}`,
        );
      }
      throw err;
    }
  })();
  return promise;
};

export const addLabReport = async (
  token: string,
  request: AddLabReportRequest,
): Promise<AddLabReportResponse> => {
  // const formData = new FormData();
  // formData.append("date_of_test", new Date(request.date_of_test).toISOString());
  // formData.append("lab_name", request.lab_name);
  // formData.append("doctor_name", request.doctor_name);
  // formData.append("tests", JSON.stringify([]));
  // request.tests.forEach((test,index) => {
  //   formData.append(`test[${index}][test_id]`, test.test_id.toString());
  //   formData.append(`test[${index}][group_id]`, test.group_id.toString());
  //   formData.append(`test[${index}][parameter_id]`, test.parameter_id.toString());
  //   formData.append(`test[${index}][test_value]`, test.test_value.toString());
  //   if (test.test_report) {
  //     formData.append(`test[${index}][test_report]`, test.test_report);
  //   }
  // });
  //   for (const [key, value] of formData.entries()) {
  //   console.log(`${key}:`, value);
  // }

  // const fileToBase64 = (file: File): Promise<string> =>
  //   new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.onload = () => resolve(reader.result as string);
  //     reader.onerror = reject;
  //     reader.readAsDataURL(file);
  //   });

  // const testsWithBase64 = await Promise.all(
  //   request.tests.map(async (test) => ({
  //     ...test,
  //     test_report: test.test_report ? await fileToBase64(test.test_report) : undefined,
  //   })),
  // );

  // const payload = { ...request, tests: testsWithBase64 };
  const payload = { ...request };

  // console.log(payload)

  try {
    const response = await api.post("/user-lab-report/entry", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data: AddLabReportResponse = response.data;
    invalidateCache("lists-");
    invalidateCache("compare-reports-");
    invalidateCache("details-");
    return data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 429) {
        const retryAfter = err.response.headers["retry-after"] || "60";
        throw new Error(
          `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
        );
      }
      throw new Error(
        `API error: ${err.response?.status} ${err.response?.statusText}`,
      );
    }
    throw err;
  }
};

export const deleteLabReport = async (
  token: string,
  request: DeleteLabReportRequest,
): Promise<DeleteLabReportResponse> => {
  const payload = { ...request };

  try {
    const response = await api.post("/user-lab-report/delete", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data: DeleteLabReportResponse = response.data;
    invalidateCache("lists-");
    invalidateCache("compare-reports-");
    invalidateCache("details-");
    invalidateCache("prescriptions-");
    return data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 429) {
        const retryAfter = err.response.headers["retry-after"] || "60";
        throw new Error(
          `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
        );
      }
      throw new Error(
        `API error: ${err.response?.status} ${err.response?.statusText}`,
      );
    }
    throw err;
  }
};

export const fetchVitals = async (token: string): Promise<VitalsResponse> => {
  const cacheKey = `vitals-${token.slice(-8)}`;
  const cached = getCache<VitalsResponse>(cacheKey);
  if (cached) return cached;
  if (inFlightVitals.has(cacheKey)) {
    return inFlightVitals.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const response = await api.get("/user-vitals", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: VitalsResponse = response.data;
      setCache(cacheKey, data);
      return data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          const retryAfter = err.response.headers["retry-after"] || "60";
          throw new Error(
            `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
          );
        }
        throw new Error(
          `API error: ${err.response?.status} ${err.response?.statusText}`,
        );
      }
      throw err;
    } finally {
      inFlightVitals.delete(cacheKey);
    }
  })();

  inFlightVitals.set(cacheKey, promise);
  return promise;
};

export const addVitals = async (
  token: string,
  vital: AddVitalRequest,
): Promise<AddVitalResponse> => {
  try {
    const response = await api.post("/user-vitals", vital, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data: AddVitalResponse = response.data;
    invalidateCache("vitals-");
    return data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 429) {
        const retryAfter = err.response.headers["retry-after"] || "60";
        throw new Error(
          `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
        );
      }
      throw new Error(
        `API error: ${err.response?.status} ${err.response?.statusText}`,
      );
    }
    throw err;
  }
};

export const fetchVitalsOthers = async (
  token: string,
): Promise<VitalsOthersResponse> => {
  const cacheKey = `vitals-others-${token.slice(-8)}`;
  const cached = getCache<VitalsOthersResponse>(cacheKey);
  if (cached) return cached;
  if (inFlightVitalsOthers.has(cacheKey)) {
    return inFlightVitalsOthers.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const response = await api.get("/user-vital-tests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: VitalsOthersResponse = response.data;
      setCache(cacheKey, data);
      return data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          const retryAfter = err.response.headers["retry-after"] || "60";
          throw new Error(
            `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
          );
        }
        throw new Error(
          `API error: ${err.response?.status} ${err.response?.statusText}`,
        );
      }
      throw err;
    } finally {
      inFlightVitalsOthers.delete(cacheKey);
    }
  })();

  inFlightVitalsOthers.set(cacheKey, promise);
  return promise;
};

export const addVitalsOthers = async (
  token: string,
  vital: AddVitalOthersRequest,
): Promise<AddVitalOthersResponse> => {
  try {
    const response = await api.post("/user-vital-tests", vital, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data: AddVitalOthersResponse = response.data;
    invalidateCache("vitals-others-");
    return data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 429) {
        const retryAfter = err.response.headers["retry-after"] || "60";
        throw new Error(
          `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
        );
      }
      throw new Error(
        `API error: ${err.response?.status} ${err.response?.statusText}`,
      );
    }
    throw err;
  }
};
