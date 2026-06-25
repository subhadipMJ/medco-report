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
  UserProfileResponse,
  VitalsOthersResponse,
  VitalsResponse,
} from "../types/api";
import { cacheResponse, getCachedResponse } from "./offlineCache";

const BASE_URL = "https://www.medcoclinics.com/api"; // live
// const BASE_URL = 'https://medco.code-dev.in/api';

// In-flight request deduplication maps
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
const inFlightVitals=new Map<string, Promise<VitalsResponse>>();
const inFlightVitalsOthers = new Map<string, Promise<VitalsOthersResponse>>();

export const fetchCompareReports = async (
  token: string,
  page?: number,
): Promise<CompareReportsResponse> => {
  const cacheKey = `compare-reports-${token.slice(-8)}-${page || 1}`;
  if (inFlightCompareReports.has(cacheKey)) {
    return inFlightCompareReports.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/web/compare-reports?page=${page || 1}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );

      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After") || "60";
        throw new Error(
          `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
        );
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data: CompareReportsResponse = await response.json();
      await cacheResponse(cacheKey, data);
      return data;
    } catch (err) {
      const cached = await getCachedResponse<CompareReportsResponse>(cacheKey);
      if (cached) {
        console.warn("Serving cached compare reports (offline mode)");
        return cached;
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
  if (inFlightCompareDetails.has(cacheKey)) {
    return inFlightCompareDetails.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const response = await fetch(`${BASE_URL}/web/compare-report-detail`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          parameter_ids: parameterIds.map((id) => parseInt(id)),
        }),
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After") || "60";
        throw new Error(
          `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
        );
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data: CompareReportDetailsResponse = await response.json();
      await cacheResponse(cacheKey, data);
      return data;
    } catch (err) {
      const cached =
        await getCachedResponse<CompareReportDetailsResponse>(cacheKey);
      if (cached) {
        console.warn("Serving cached compare reports (offline mode)");
        return cached;
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

  const cacheKey = `prescriptions-${token.slice(-8)}`;
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

export const fetchLabReports = async (
  token: string,
  search?: string,
  start_date?: string,
  end_date?: string,
  status?: string,
  page?: number,
): Promise<LabReportListResponse> => {
  const cacheKey = `lists-${token.slice(-8)}-${search || ""}-${start_date || ""}-${end_date || ""}-${status || ""}-${page || 1}`;
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

      const response = await fetch(
        `${BASE_URL}/web/reports?page=${page || 1}&start_date=${start_date || ""}&end_date=${end_date || ""}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: Object.keys(body).length ? JSON.stringify(body) : undefined,
        },
      );

      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After") || "60";
        throw new Error(
          `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
        );
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
        console.warn("Serving cached lab reports (offline mode)");
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
  const dateSuffix = startDate && endDate ? `-${startDate}-${endDate}` : "";
  const cacheKey = `details-${testId}-${token.slice(-8)}${dateSuffix}`;
  if (inFlightDetails.has(cacheKey)) {
    return inFlightDetails.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const response = await fetch(`${BASE_URL}/web/reports/${testId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          // test_id: testId,
          ...(startDate ? { start_date: startDate } : {}),
          ...(endDate ? { end_date: endDate } : {}),
        }),
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After") || "60";
        throw new Error(
          `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
        );
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data: LabReportDetailsResponse = await response.json();
      await cacheResponse(cacheKey, data);
      return data;
    } catch (err) {
      const cached =
        await getCachedResponse<LabReportDetailsResponse>(cacheKey);
      if (cached) {
        console.warn("Serving cached report details (offline mode)");
        return cached;
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
  if (inFlightTypeDetails.has(cacheKey)) {
    return inFlightTypeDetails.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const response = await fetch(`${BASE_URL}/lab-report-type`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After") || "60";
        throw new Error(
          `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
        );
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
        console.warn("Serving cached report details (offline mode)");
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
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After") || "60";
        throw new Error(
          `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
        );
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
        console.warn("Serving cached report details (offline mode)");
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
      const response = await fetch(
        `${BASE_URL}/lab-report/parameter/${parameterId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );

      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After") || "60";
        throw new Error(
          `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
        );
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
        console.warn("Serving cached report details (offline mode)");
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

export const fetchUserProfile = async (
  token: string,
): Promise<UserProfileResponse> => {
  const cacheKey = `user-profile-${token.slice(-8)}`;
  if (inFlightUserProfile.has(cacheKey)) {
    return inFlightUserProfile.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const response = await fetch(`${BASE_URL}/user/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After") || "60";
        throw new Error(
          `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
        );
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data: UserProfileResponse = await response.json();
      return data;
    } catch (err) {
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
  if (inFlightDoctor.has(cacheKey)) {
    return inFlightDoctor.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const response = await fetch(`${BASE_URL}/userDoctor`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After") || "60";
        throw new Error(
          `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
        );
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data: DoctorResponse = await response.json();
      return data;
    } catch (err) {
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
      const response = await fetch(`${BASE_URL}/userDoctor`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(request),
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After") || "60";
        throw new Error(
          `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
        );
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data: AddDoctorResponse = await response.json();
      return data;
    } catch (err) {
      throw err;
    }
  })();
  return promise;
};

export const fetchLab = async (token: string): Promise<LabResponse> => {
  const cacheKey = `lab-${token.slice(-8)}`;
  if (inFlightLab.has(cacheKey)) {
    return inFlightLab.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const response = await fetch(`${BASE_URL}/userlabname`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After") || "60";
        throw new Error(
          `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
        );
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data: LabResponse = await response.json();
      return data;
    } catch (err) {
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
      const response = await fetch(`${BASE_URL}/userlabname`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(request),
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After") || "60";
        throw new Error(
          `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
        );
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data: AddLabResponse = await response.json();
      return data;
    } catch (err) {
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
    const response = await fetch(`${BASE_URL}/user-lab-report/entry`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After") || "60";
      throw new Error(
        `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API error: ${response.status} ${response.statusText}\n${errorText}`,
      );
    }

    const data: AddLabReportResponse = await response.json();
    return data;
  } catch (err) {
    throw err;
  }
};

export const fetchVitals = async (token: string): Promise<VitalsResponse> => {
  const cacheKey = `vitals-${token.slice(-8)}`;
  if (inFlightVitals.has(cacheKey)) {
    return inFlightVitals.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const response = await fetch(`${BASE_URL}/user-vitals`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After") || "60";
        throw new Error(
          `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
        );
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data: VitalsResponse = await response.json();
      return data;
    } catch (err) {
      throw err;
    } finally {
      inFlightVitals.delete(cacheKey);
    }
  })();

  inFlightVitals.set(cacheKey, promise);
  return promise;
};

export const addVitals = async (token: string, vital: AddVitalRequest): Promise<AddVitalResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/user-vitals`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(vital),
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After") || "60";
      throw new Error(
        `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
      );
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data: AddVitalResponse = await response.json();
    return data;
  } catch (err) {
    throw err;
  }
};

export const fetchVitalsOthers = async (token: string): Promise<VitalsOthersResponse> => {
  const cacheKey = `vitals-others-${token.slice(-8)}`;
  if (inFlightVitalsOthers.has(cacheKey)) {
    return inFlightVitalsOthers.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const response = await fetch(`${BASE_URL}/user-vital-tests`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After") || "60";
        throw new Error(
          `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
        );
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data: VitalsOthersResponse = await response.json();
      return data;
    } catch (err) {
      throw err;
    } finally {
      inFlightVitalsOthers.delete(cacheKey);
    }
  })();

  inFlightVitalsOthers.set(cacheKey, promise);
  return promise;
};

export const addVitalsOthers = async (token: string, vital: AddVitalOthersRequest): Promise<AddVitalOthersResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/user-vital-tests`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(vital),
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After") || "60";
      throw new Error(
        `Rate limited. Too many requests. Please wait ${retryAfter}s before retrying.`,
      );
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data: AddVitalOthersResponse = await response.json();
    return data;
  } catch (err) {
    throw err;
  }
};
