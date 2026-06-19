import { useCallback, useEffect, useState } from "react";
import { Doctor } from "../types/api";
import { addDoctor, fetchDoctor } from "../services/api";

interface UseDoctorResult {
  doctors: Doctor[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface UseAddDoctorResult {
  submit: (doctorName: string) => Promise<void>;
  success: string | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export const useDoctor = (token: string | null): UseDoctorResult => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const fetch = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    fetchDoctor(token)
      .then((res) => {
        setDoctors(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch doctor");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    fetch();
  }, [fetch, trigger]);

  const refetch = useCallback(() => setTrigger((t) => t + 1), []);

  return { doctors, loading, error, refetch };
};

export const useAddDoctor = (token: string | null): UseAddDoctorResult => {
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (doctorName: string) => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const res = await addDoctor(token, { doctor_name: doctorName });
        if (res.success > 0 && res.message) {
          setSuccess(res.message);
        } else {
          setSuccess("Doctor added successfully");
        }
      } catch (err: any) {
        setError(err.message || "Failed to add doctor");
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
