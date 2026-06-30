import {
  RefreshCw,
  // Settings
} from "lucide-react";
import {
  useAddVital,
  // useAddVitalOthers,
  useVitals,
  // useVitalsOthers,
} from "../hooks/useVitals";
import { useEffect, useState } from "react";
import VitalsModal from "./VitalsModal";
import {
  // AddVitalOthersRequest,
  AddVitalRequest,
} from "../types/api";
import { useUserProfile } from "../hooks/useUserProfile";

interface HeaderProps {
  token: string;
  title?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  extra?: React.ReactNode;
  onVitalsModalChange?: (open: boolean) => void;
}

const Header = ({ token, title, onRefresh, isRefreshing, onVitalsModalChange }: HeaderProps) => {
  console.log("title", title);
  const {
    user,
    loading: loadingUser,
    error: errorUser,
    refetch: refetchUser,
  } = useUserProfile(token);
  const { vitals, refetch } = useVitals(token);
  // const { vitalsOthers, refetch: refetchOthers } = useVitalsOthers(token);
  const { submit, loading, error, reset } = useAddVital(token);
  // const {
  //   submit: submitVitalOthers,
  //   loading: vitalOthersLoading,
  //   error: vitalOthersError,
  //   reset: vitalOthersReset,
  // } = useAddVitalOthers(token);

  const [modal, setModal] = useState(false);

  useEffect(() => {
    onVitalsModalChange?.(modal);
  }, [modal, onVitalsModalChange]);
  const [editModalKey, setEditModalKey] = useState<string | null>(null);
  const [editModalValue, setEditModalValue] = useState<string | null>(null);
  const [isEditModalKey, setIsEditModalKey] = useState<boolean>(false);
  const [editModalUnit, setEditModalUnit] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  // Derive initials from name (fallback to "U")
  const initials =
    user?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  // Demo vitals – wire to real API data when available
  // const age = 32;
  // const gender = "Male";
  // const bloodGroup = "O+";

  const handleUpdateVital = async (key: string, value: string) => {
    // if (key === "bp") {
    //   const request: Partial<AddVitalOthersRequest> = value
    //     ? { key, value }
    //     : {};
    //   try {
    //     await submitVitalOthers(request);
    //     await refetchOthers();
    //     setModal(false);
    //     setIsEditModalKey(false);
    //     setEditModalKey(null);
    //     vitalOthersReset();
    //   } catch (err: any) {
    //     console.error("Failed to update vital others", vitalOthersError);
    //   }
    //   return;
    // }

    const request: Partial<AddVitalRequest> = {};
    if (value) {
      if (key === "height") {
        const match = value.match(/([\d.]+)\s*ft\s*([\d.]+)\s*in/);
        if (match) {
          request.height_ft = Number(match[1]) || 0;
          request.height_inch = Number(match[2]) || 0;
        }
      } else {
        request[key as keyof AddVitalRequest] = Number(value) || 0;
      }
    }

    try {
      await submit(request);
      await refetch();
      setModal(false);
      setIsEditModalKey(false);
      setEditModalKey(null);
      setEditModalUnit(null);
      reset();
    } catch (err: any) {
      alert(error || "Failed to update vitals");
    }
  };

  return (
    <div className="relative z-10 mb-4">
      {/* Top header area with green glass effect */}
      <div className="bg-gradient-to-br from-emerald-200/80 via-green-100/70 to-teal-200/80 backdrop-blur-md px-6 pt-8 pb-4 rounded-b-[2.5rem]">
        {/* Profile row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            {(() => {
              const raw = user?.avatar || user?.image;
              const avatarUrl =
                raw && !raw.startsWith("http")
                  ? `https://www.medcoclinics.com${raw.startsWith("/") ? "" : "/"}${raw}`
                  : raw;
              return (
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-700 font-bold text-sm border border-slate-200 shadow-sm overflow-hidden">
                  {avatarUrl && !avatarError ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    initials
                  )}
                </div>
              );
            })()}
            <div>
              <p className="text-xl font-bold text-slate-800">
                {loadingUser ? "Loading..." : user?.name || "User"}
              </p>
              {errorUser && <p className="text-xs text-red-500">{errorUser}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh */}
            <button
              onClick={() => {
                onRefresh?.();
                refetchUser();
              }}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw
                size={16}
                className={isRefreshing || loadingUser ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {/* Stats cards on white background below header */}
        <div className="px-6 mt-2 pt-2 rounded-t-2xl">
          <div className="grid grid-cols-3 gap-3 pb-4">
            <div
              onClick={() => {
                setModal(true);
                setEditModalKey("weight");
                setEditModalValue(vitals?.weight ? String(vitals.weight) : "");
                setEditModalUnit("kg");
              }}
              className="bg-white/50 backdrop-blur-lg rounded-2xl border border-white/60 shadow-lg p-3 cursor-pointer hover:bg-white/60 transition-colors text-center"
            >
              <p className="text-[10px] text-emerald-700 font-semibold tracking-wider">
                Weight
              </p>
              <p className="text-xs font-bold text-emerald-900">
                {Math.trunc(Number(vitals?.weight)) || "N/A"}{" "}
                <span className="text-xs font-medium text-emerald-600">kg</span>
              </p>
            </div>
            <div
              onClick={() => {
                setModal(true);
                setEditModalKey("height");
                setEditModalValue(vitals?.height_ft && vitals.height_inch ? String(vitals.height_ft) + " ft " + String(vitals.height_inch) + " in" : "");
                setEditModalUnit("cm");
              }}
              className="bg-white/50 backdrop-blur-lg rounded-2xl border border-white/60 shadow-lg p-3 cursor-pointer hover:bg-white/60 transition-colors text-center"
            >
              <p className="text-[10px] text-emerald-700 font-semibold tracking-wider">
                Height
              </p>
              <p className="text-xs font-bold text-emerald-900">
                {(() => {
                  const ft = vitals?.height_ft || 0;
                  const inc = vitals?.height_inch || 0;
                  return `${ft}'${inc}"`;
                })()}
              </p>
            </div>
            <div
              // onClick={() => {
              //   setModal(true);
              //   setEditModalKey("bmi");
              //   setEditModalValue(vitals?.bmi ? String(vitals.bmi) : "");
              //   setEditModalUnit("");
              // }}
              className="bg-white/50 backdrop-blur-lg rounded-2xl border border-white/60 shadow-lg p-3 text-center"
            >
              <p className="text-[10px] text-emerald-700 font-semibold tracking-wider">
                BMI
              </p>
              <p className="text-xs font-bold text-emerald-900">
                {Math.trunc(Number(vitals?.bmi)) || "N/A"}
              </p>
            </div>
            <div
              onClick={() => {
                setModal(true);
                setEditModalKey("pulse");
                setEditModalValue(vitals?.pulse ? String(vitals.pulse) : "");
                setEditModalUnit("bpm");
              }}
              className="bg-white/50 backdrop-blur-lg rounded-2xl border border-white/60 shadow-lg p-3 cursor-pointer hover:bg-white/60 transition-colors text-center"
            >
              <p className="text-[10px] text-emerald-700 font-semibold tracking-wider">
                Pulse
              </p>
              <p className="text-xs font-bold text-emerald-900">
                {Math.trunc(Number(vitals?.pulse)) || "N/A"}{" "}
                <span className="text-xs font-medium text-emerald-600">bpm</span>
              </p>
            </div>
            {/* <div
            onClick={() => {
              setModal(true);
              setEditModalKey("waist");
              setEditModalValue(vitals?.waist ? String(vitals.waist) : "");
              setEditModalUnit("cm");
            }}
            className="bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 p-3 shadow-sm cursor-pointer hover:bg-white/30 transition-colors"
          >
            <p className="text-[10px] text-white/60 font-semibold tracking-wider">
              Waist
            </p>
            <p className="text-lg font-bold text-white">
              {vitals?.waist || "N/A"} <span className="text-sm font-medium text-white/70">cm</span>
            </p>
          </div> */}
            {/* <div
            // onClick={() => {
            //   setModal(true);
            //   setEditModalKey("bp");
            //   setEditModalValue(
            //     vitalsOthers?.find((others) => others.key === "bp")?.value ||
            //       "",
            //   );
            // }}
            className="bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 p-3 shadow-sm"
          >
            <p className="text-slate-800 font-semibold tracking-wider text-center">
              BP
            </p>
          </div> */}
            {/* <button
            onClick={() => {
              setModal(true);
              setEditModalKey("");
              setIsEditModalKey(true);
            }}
            className="bg-white/15 backdrop-blur-md rounded-2xl border border-dashed border-white/30 p-3 flex items-center justify-center gap-1 shadow-lg hover:bg-white/25 transition-colors"
          >
            <span className="text-lg text-white/60 font-light">+</span>
            <span className="text-xs font-semibold text-white/70">Add</span>
          </button> */}
          </div>
        </div>
      </div>

      <VitalsModal
        isOpen={modal}
        onClose={() => setModal(false)}
        fieldKey={editModalKey || ""}
        unit={editModalUnit || ""}
        fieldValue={editModalValue || ""}
        valueInputType="number"
        // isLoading={loading || vitalOthersLoading}
        isLoading={loading}
        keyEditable={isEditModalKey}
        onSave={handleUpdateVital}
      />
    </div>
  );
};

export default Header;
