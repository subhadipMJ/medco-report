import { useCallback, useEffect, useState } from "react";
import { Lab } from "../types/api";
import { addLab, fetchLab } from "../services/api";

interface UseLabResult {
  labs: Lab[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface UseAddLabResult {
  submit: (labName: string) => Promise<void>;
  success: string | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export const useLab = (token: string | null): UseLabResult=> {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const fetch = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    fetchLab(token)
      .then((res) => {
        setLabs(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch lab");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    fetch();
  }, [fetch, trigger]);

  const refetch = useCallback(() => setTrigger((t) => t + 1), []);

  return { labs, loading, error, refetch };
};

export const useAddLab = (token: string | null): UseAddLabResult => {
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (labName: string) => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const res = await addLab(token, { lab_name: labName });
        if (res.success > 0 && res.message) {
          setSuccess(res.message);
        } else {
          setSuccess("Lab added successfully");
        }
      } catch (err: any) {
        setError(err.message || "Failed to add lab");
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