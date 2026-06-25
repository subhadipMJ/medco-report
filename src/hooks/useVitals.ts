import { useState, useEffect, useCallback } from "react";
import { addVitals, addVitalsOthers, fetchVitals, fetchVitalsOthers } from "../services/api";
import { AddVitalOthersRequest, AddVitalRequest, Vitals, VitalsOthers } from "../types/api";

interface UseVitalsResult {
  vitals: Vitals | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface UseVitalsOthersResult {
  vitalsOthers: VitalsOthers[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface UseAddVitalResult {
  submit: (vital: Partial<AddVitalRequest>) => Promise<void>;
  success: string | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

interface UseAddVitalOthersResult {
  submit: (vital: Partial<AddVitalOthersRequest>) => Promise<void>;
  success: string | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export const useVitals = (token: string | null): UseVitalsResult => {
  const [vitals, setVitals] = useState<
    Vitals | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const fetch = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    fetchVitals(token)
      .then((vitalsRes) => {
        setVitals(vitalsRes.data);
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch vitals");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    fetch();
  }, [fetch, trigger]);

  const refetch = useCallback(() => setTrigger((t) => t + 1), []);

  return { vitals, loading, error, refetch };
};

export const useAddVital = (token: string | null): UseAddVitalResult => {
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (vital: Partial<AddVitalRequest>) => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const res = await addVitals(token, vital);
        if (res.success && res.message) {
          setSuccess(res.message);
        } else {
          setSuccess("Vital added successfully");
        }
      } catch (err: any) {
        setError(err.message || "Failed to add vital");
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

export const useVitalsOthers = (token: string | null): UseVitalsOthersResult => {
  const [vitalsOthers, setVitalsOthers] = useState<
    VitalsOthers[] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const fetch = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    fetchVitalsOthers(token)
      .then((vitalsOthersRes) => {
        setVitalsOthers(vitalsOthersRes.data);
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch vitals others");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    fetch();
  }, [fetch, trigger]);

  const refetch = useCallback(() => setTrigger((t) => t + 1), []);

  return { vitalsOthers, loading, error, refetch };
};

export const useAddVitalOthers = (token: string | null): UseAddVitalOthersResult => {
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (vital: Partial<AddVitalOthersRequest>) => {
      if (!token) return;
      if (!vital.key || !vital.value) {
        setError("Key and value are required");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await addVitalsOthers(token, { key: vital.key, value: vital.value });
        if (res.success && res.message) {
          setSuccess(res.message);
        } else {
          setSuccess("Vital added successfully");
        }
      } catch (err: any) {
        setError(err.message || "Failed to add vital");
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
