import { useState, useEffect, useCallback } from 'react';
import { addPrescriptions, deletePrescriptions, fetchPrescriptions } from '../services/api';
import { DeletePrescriptionRequest, Prescription, PrescriptionSubmitRequest } from '../types/api';

interface PaginationInfo {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
}

interface UsePrescriptionResult {
  prescriptions: Prescription[];
  rawList: Prescription[];
  pagination: PaginationInfo | null;
  loading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  refetch: () => void;
}

interface UsePrescriptionSubmitResult {
  submit: (request: any) => Promise<any>;
  success: string | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

interface UseDeletePrescriptionResult {
  deletePrescription: (request: DeletePrescriptionRequest) => Promise<void>;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export const usePrescription = (
  token: string | null,
  page: number = 1,
  perPage: number = 10,
): UsePrescriptionResult => {
  const [rawList, setRawList] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const fetch = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    fetchPrescriptions(token)
      .then((res) => {
        const list = Array.isArray(res.prescription) ? res.prescription : [];
        setRawList(list);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch prescriptions');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    fetch();
  }, [fetch, trigger]);

  // Compute pagination and slice data client-side
  const total = rawList.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(page, lastPage);
  const endIndex = currentPage * perPage;

  const prescriptions = rawList.slice(0, endIndex);
  const pagination: PaginationInfo | null =
    total > 0
      ? { currentPage, lastPage, total, perPage }
      : null;

  const refetch = useCallback(() => setTrigger((t) => t + 1), []);

  return { prescriptions, rawList, pagination, loading, isLoadingMore: false, error, refetch };
};

export const useAddPrescription = (token: string | null): UsePrescriptionSubmitResult => {
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (request: PrescriptionSubmitRequest) => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const res = await addPrescriptions(token, request);
        if (res.success > 0 && res.message) {
          setSuccess(res.message);
        } else {
          setSuccess("Prescription added successfully");
        }
      } catch (err: any) {
        setError(err.message || "Failed to add prescription");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  const reset = useCallback(() => {
    setSuccess(null);
    setError(null);
  }, []);

  return { submit, success, loading, error, reset };
};

export const useDeletePrescription = (token: string | null): UseDeletePrescriptionResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deletePrescription = useCallback(
    async (request: DeletePrescriptionRequest) => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        await deletePrescriptions(token, request);
      } catch (err: any) {
        setError(err.message || "Failed to delete prescription");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return { deletePrescription, loading, error, reset };
};
