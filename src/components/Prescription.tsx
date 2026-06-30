import {
  RefreshCw,
  Loader2,
  CalendarDays,
  Stethoscope,
  ArrowLeft,
  Plus,
  // Trash2,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import { usePrescription, useDeletePrescription } from "../hooks/usePrescription";
import { useNavigateWithToken } from "../hooks/useNavigateWithToken";
import type { Prescription } from "../types/api";
function formatDateDMY(dateStr: string): string {
  const d = new Date(dateStr);
  const formattedDate = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return formattedDate;
}

function PrescriptionCard({ item, onDelete }: { item: Prescription; onDelete: (item: Prescription) => void }) {
  const navigate = useNavigateWithToken();

  const handleView = () => {
    const url = item.prescription_url;
    if (!url) return;
    navigate('/prescription-view', { state: { url } });
  };

  return (
    <div className="border-b border-slate-200 bg-white py-3 px-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Stethoscope size={16} className="text-blue-500 shrink-0" />
            <p className="text-sm font-extrabold text-slate-900 truncate">
              Dr. {item.doctor_name.charAt(0).toUpperCase() + item.doctor_name.slice(1).toLowerCase()}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CalendarDays size={12} className="shrink-0" />
            <span>{formatDateDMY(item.created_at)}</span>
          </div>
          <button
            onClick={() => onDelete(item)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
            title="Delete"
          >
            {/* <Trash2 size={14} /> */}
            delete
          </button>
        </div>
        <div className="grid gap-3">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleView();
            }}
            className="inline-flex items-center gap-2 text-xs font-semibold text-green-600 hover:text-green-700"
          >
            View
          </a>
        </div>
      </div>
    </div>
  );
}

interface PrescriptionProps {
  token: string;
}

export default function Prescription({ token }: PrescriptionProps) {
  const navigate = useNavigateWithToken();
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Prescription | null>(null);
  const {
    prescriptions,
    rawList,
    pagination,
    loading: prescriptionsLoading,
    error: prescriptionsError,
    refetch: refetchPrescriptions,
  } = usePrescription(token || null, page);
  const {
    deletePrescription,
    loading: deleteLoading,
    error: deleteError,
    reset: resetDelete,
  } = useDeletePrescription(token || null);

  const handleDeleteClick = (item: Prescription) => {
    resetDelete();
    setDeleteTarget(item);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePrescription({ id: deleteTarget.id });
      setDeleteTarget(null);
      refetchPrescriptions();
    } catch {
      // error shown by deleteError
    }
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
    resetDelete();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-[1440px] mx-auto bg-slate-50 min-h-screen pb-24">
        <div className="px-6 pb-24 relative">
          <div className="flex items-center justify-between pt-6 pb-4">
            <button
              onClick={() => navigate("/")}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft size={16} className="text-slate-600" />
            </button>
            <p className="text-lg font-black text-slate-900">Prescriptions</p>
            <button
              onClick={refetchPrescriptions}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw
                size={16}
                className={prescriptionsLoading ? "animate-spin" : ""}
              />
            </button>
          </div>
          <div className="animate-fade-in">
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
              <>
                {prescriptions.map((item) => (
                  <PrescriptionCard key={item.id} item={item} onDelete={handleDeleteClick} />
                ))}
                {pagination && pagination.currentPage < pagination.lastPage && (
                  <div className="mt-4 flex flex-col items-center gap-2">
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      Load More
                    </button>
                    <p className="text-[11px] font-medium text-slate-400">
                      Showing {rawList.length > 0 ? prescriptions.length : 0} of {pagination.total}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Floating Add Prescription Button */}
          <button
            onClick={() => navigate("/add-prescription")}
            className="fixed bottom-40 right-6 w-14 h-14 rounded-full bg-slate-900 text-white shadow-lg flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all z-50"
            title="Add Prescription"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-6">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Delete Prescription</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete the prescription from <span className="font-semibold text-slate-900">Dr. {deleteTarget.doctor_name}</span>? This action cannot be undone.
            </p>
            {deleteError && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 mb-4">
                <p className="text-xs font-semibold text-red-600">{deleteError}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={deleteLoading}
                className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="flex-1 h-11 rounded-xl bg-red-600 text-sm font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleteLoading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
