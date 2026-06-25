import { RefreshCw, Settings } from "lucide-react";
import {
  useAddVital,
  useAddVitalOthers,
  useVitals,
  useVitalsOthers,
} from "../hooks/useVitals";
import { useState } from "react";
import VitalsModal from "./VitalsModal";
import { AddVitalOthersRequest, AddVitalRequest } from "../types/api";

interface HeaderProps {
  token: string;
  title: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  extra?: React.ReactNode;
}

const Header = ({ token, title, onRefresh, isRefreshing }: HeaderProps) => {
  const { vitals, refetch } = useVitals(token);
  const { vitalsOthers, refetch: refetchOthers } = useVitalsOthers(token);
  const { submit, loading, error, reset } = useAddVital(token);
  const {
    submit: submitVitalOthers,
    loading: vitalOthersLoading,
    error: vitalOthersError,
    reset: vitalOthersReset,
  } = useAddVitalOthers(token);

  const [modal, setModal] = useState(false);
  const [editModalKey, setEditModalKey] = useState<string | null>(null);
  const [editModalValue, setEditModalValue] = useState<string | null>(null);
  const [isEditModalKey, setIsEditModalKey] = useState<boolean>(false);

  // Derive initials from title (fallback to "U")
  const initials =
    title
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  // Demo vitals – wire to real API data when available
  const age = 32;
  const gender = "Male";
  const bloodGroup = "O+";

  const handleUpdateVital = async (key: string, value: string) => {
    if (key === "bp") {
      const request: Partial<AddVitalOthersRequest> = value
        ? { key, value }
        : {};
      try {
        await submitVitalOthers(request);
        await refetchOthers();
        setModal(false);
        setIsEditModalKey(false);
        setEditModalKey(null);
        vitalOthersReset();
      } catch (err: any) {
        console.error("Failed to update vital others", vitalOthersError);
      }
      return;
    }

    const request: Partial<AddVitalRequest> = value
      ? { [key]: Number(value) || 0 }
      : {};

    try {
      await submit(request);
      await refetch();
      setModal(false);
      setIsEditModalKey(false);
      setEditModalKey(null);
      reset();
    } catch (err: any) {
      alert(error || "Failed to update vitals");
    }
  };

  return (
    <div className="relative z-10">
      {/* Top gradient area */}
      <div className="bg-gradient-to-br from-violet-50 via-fuchsia-50 to-rose-50 px-6 pt-8 pb-6 rounded-b-[2.5rem]">
        {/* Profile row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-sm border-2 border-rose-300">
              {initials}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{title}</p>
              <p className="text-xs text-slate-500">
                {age} yrs <span className="mx-1">•</span> {gender}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Blood group badge */}
            <div className="flex flex-col items-center justify-center rounded-2xl bg-rose-50 border border-rose-100 px-3 py-1.5">
              <span className="text-[8px] font-bold uppercase tracking-wider text-rose-400">
                Blood
              </span>
              <span className="text-sm font-black text-rose-600 leading-none">
                {bloodGroup}
              </span>
            </div>
            {/* Settings */}
            <button className="w-9 h-9 rounded-xl bg-white/60 border border-white/70 flex items-center justify-center text-slate-500 hover:bg-white transition-colors">
              <Settings size={16} />
            </button>
            {/* Refresh */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="w-9 h-9 rounded-xl bg-white/60 border border-white/70 flex items-center justify-center text-slate-500 hover:bg-white transition-colors"
                title="Refresh"
              >
                <RefreshCw
                  size={16}
                  className={isRefreshing ? "animate-spin" : ""}
                />
              </button>
            )}
          </div>
        </div>

        {/* Stats card */}
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-slate-100 p-3 flex items-center gap-2.5 shadow-sm">
            <div
              onClick={() => {
                setModal(true);
                setEditModalKey("weight");
                setEditModalValue(vitals?.weight ? String(vitals.weight) : "");
              }}
            >
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider">
                Weight
              </p>
              <p className="text-sm font-bold text-slate-800">
                {vitals?.weight || "N/A"} kg
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-3 flex items-center gap-2.5 shadow-sm">
            <div
              onClick={() => {
                setModal(true);
                setEditModalKey("height");
                setEditModalValue(vitals?.height ? String(vitals.height) : "");
              }}
            >
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider">
                Height
              </p>
              <p className="text-sm font-bold text-slate-800">
                {vitals?.height || "N/A"} cm
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-3 flex items-center gap-2.5 shadow-sm">
            <div
              onClick={() => {
                setModal(true);
                setEditModalKey("bmi");
                setEditModalValue(vitals?.bmi ? String(vitals.bmi) : "");
              }}
            >
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider">
                BMI
              </p>
              <p className="text-sm font-bold text-slate-800">
                {vitals?.bmi || "N/A"}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-3 flex items-center gap-2.5 shadow-sm">
            <div
              onClick={() => {
                setModal(true);
                setEditModalKey("pulse");
                setEditModalValue(vitals?.pulse ? String(vitals.pulse) : "");
              }}
            >
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider">
                Pulse
              </p>
              <p className="text-sm font-bold text-slate-800">
                {vitals?.pulse || "N/A"} bpm
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-3 flex items-center gap-2.5 shadow-sm">
            <div
              onClick={() => {
                setModal(true);
                setEditModalKey("waist");
                setEditModalValue(vitals?.waist ? String(vitals.waist) : "");
              }}
            >
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider">
                Waist
              </p>
              <p className="text-sm font-bold text-slate-800">
                {vitals?.waist || "N/A"} cm
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-3 flex items-center gap-2.5 shadow-sm">
            <div
              onClick={() => {
                setModal(true);
                setEditModalKey("bp");
                setEditModalValue(
                  vitalsOthers?.find((others) => others.key === "bp")?.value ||
                    "",
                );
              }}
            >
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider">
                BP
              </p>
              <p className="text-sm font-bold text-slate-800">
                {
                  vitalsOthers?.find((others) => others.key === "bp")?.value ||
                    "N/A"
                } bpm
              </p>
            </div>
          </div>
          {/* <button
            onClick={() => {
              setModal(true);
              setEditModalKey("");
              setIsEditModalKey(true);
            }}
            className="bg-white rounded-2xl border border-dashed border-slate-200 p-3 flex items-center justify-center gap-1 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <span className="text-lg text-slate-400 font-light">+</span>
            <span className="text-xs font-semibold text-slate-500">Add</span>
          </button> */}
        </div>
      </div>

      <VitalsModal
        isOpen={modal}
        onClose={() => setModal(false)}
        fieldKey={editModalKey || ""}
        fieldValue={editModalValue || ""}
        isLoading={loading || vitalOthersLoading}
        keyEditable={isEditModalKey}
        onSave={handleUpdateVital}
      />
    </div>
  );
};

export default Header;
