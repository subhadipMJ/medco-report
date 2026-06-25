import {
  Eye,
  RefreshCw,
  Loader2,
  CalendarDays,
  Stethoscope,
} from "lucide-react";
import { usePrescription } from "../hooks/usePrescription";
import { useNavigateWithToken } from "../hooks/useNavigateWithToken";
import type { Prescription } from "../types/api";
import Header from "./Header";

function formatDateDMY(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function PrescriptionCard({ item }: { item: Prescription }) {
  const navigate = useNavigateWithToken();

  const handleView = () => {
    const url = item.prescription_url;
    if (!url) return;
    navigate(`/prescription-view?url=${encodeURIComponent(url)}`);
  };

  return (
    <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Stethoscope size={16} className="text-blue-500 shrink-0" />
            <p className="text-sm font-extrabold text-slate-900 truncate">
              Dr. {item.doctor_name}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CalendarDays size={12} className="shrink-0" />
            <span>{formatDateDMY(item.created_at)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleView}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Eye size={16} />
          View
        </button>
      </div>
    </div>
  );
}

interface PrescriptionProps {
  token: string;
}

export default function Prescription({ token: _token }: PrescriptionProps) {
  const {
    prescriptions,
    loading: prescriptionsLoading,
    error: prescriptionsError,
    refetch: refetchPrescriptions,
  } = usePrescription(_token || null);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-4xl mx-auto bg-white min-h-screen pb-24">
        <Header
          token={_token}
          title="My Prescriptions"
          onRefresh={refetchPrescriptions}
          isRefreshing={prescriptionsLoading}
        />

        <div className="px-6 pb-24 relative">
          <div className="animate-fade-in space-y-5">
            {prescriptionsError ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <p className="text-sm font-semibold text-red-600">
                  {prescriptionsError}
                </p>
                <button
                  onClick={refetchPrescriptions}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
                >
                  <RefreshCw size={16} /> Retry
                </button>
              </div>
            ) : prescriptionsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 size={32} className="animate-spin text-blue-500" />
                <p className="text-sm font-semibold text-slate-500">
                  Loading prescriptions...
                </p>
              </div>
            ) : prescriptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Stethoscope size={36} className="text-slate-300" />
                <p className="text-sm font-bold text-slate-500">
                  No prescriptions found.
                </p>
              </div>
            ) : (
              prescriptions.map((item) => (
                <PrescriptionCard key={item.id} item={item} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
