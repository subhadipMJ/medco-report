import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Search,
  Check,
  Droplet,
  Heart,
  Zap,
  FlaskConical,
  Beaker,
  Thermometer,
  Bone,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { useNavigateWithToken } from "../hooks/useNavigateWithToken";
import { useLocation } from "react-router-dom";
import { useReportCompare } from "../hooks/useReportCompare";
import { useDebounce } from "../hooks/useDebounce";
import { CompareReportParameter } from "../types/api";

interface TestEntry extends CompareReportParameter {
  value: string;
}

interface SelectTestProps {
  token: string;
}

const SelectTest = ({ token }: SelectTestProps) => {
  const navigate = useNavigateWithToken();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const {
    params,
    loading: paramsLoading,
    isLoadingMore,
    error: paramsError,
    hasMore,
  } = useReportCompare(token || null, { search: debouncedSearch, page });

  const preserved = (location.state as {
    date?: string;
    doctor?: string;
    lab?: string;
    tests?: TestEntry[];
  } | null);

  const currentTests = preserved?.tests;

  const [selected, setSelected] = useState<Set<string>>(() => {
    const ids = new Set<string>();
    currentTests?.forEach((t) => ids.add(t.parameter_id));
    return ids;
  });

  const toggle = (param: CompareReportParameter) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(param.parameter_id)) {
        next.delete(param.parameter_id);
      } else {
        next.add(param.parameter_id);
      }
      return next;
    });
  };

  const getTestMeta = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("hemoglobin") || n.includes("blood") || n.includes("rbc") || n.includes("wbc") || n.includes("platelet") || n.includes("hct") || n.includes("mcv"))
      return { Icon: Droplet as LucideIcon, iconBg: "bg-rose-50 text-rose-500" };
    if (n.includes("cholesterol") || n.includes("ldl") || n.includes("hdl") || n.includes("triglyceride") || n.includes("lipid"))
      return { Icon: Heart as LucideIcon, iconBg: "bg-amber-50 text-amber-500" };
    if (n.includes("glucose") || n.includes("sugar") || n.includes("hba1c") || n.includes("diabetes"))
      return { Icon: Zap as LucideIcon, iconBg: "bg-blue-50 text-blue-500" };
    if (n.includes("liver") || n.includes("ast") || n.includes("alt") || n.includes("bilirubin") || n.includes("alkaline") || n.includes("sgpt") || n.includes("sgot"))
      return { Icon: FlaskConical as LucideIcon, iconBg: "bg-emerald-50 text-emerald-500" };
    if (n.includes("kidney") || n.includes("creatinine") || n.includes("bun") || n.includes("urea") || n.includes("uric"))
      return { Icon: Beaker as LucideIcon, iconBg: "bg-violet-50 text-violet-500" };
    if (n.includes("thyroid") || n.includes("tsh") || n.includes("t3") || n.includes("t4"))
      return { Icon: Thermometer as LucideIcon, iconBg: "bg-cyan-50 text-cyan-500" };
    if (n.includes("calcium") || n.includes("vitamin") || n.includes("vit d") || n.includes("b12") || n.includes("iron") || n.includes("ferritin"))
      return { Icon: Bone as LucideIcon, iconBg: "bg-orange-50 text-orange-500" };
    return { Icon: Activity as LucideIcon, iconBg: "bg-white text-slate-500" };
  };

  const buildTests = (): TestEntry[] => {
    const result: TestEntry[] = [];
    const addedIds = new Set<string>();

    // First, include previously selected tests from currentTests
    currentTests?.forEach((t) => {
      if (selected.has(t.parameter_id)) {
        result.push(t);
        addedIds.add(t.parameter_id);
      }
    });

    // Then, add any new selections from params that weren't in currentTests
    params.forEach((p) => {
      if (selected.has(p.parameter_id) && !addedIds.has(p.parameter_id)) {
        result.push({
          ...p,
          value: "",
        });
      }
    });

    return result;
  };

  const goBack = () => {
    navigate("/add-report", {
      state: {
        date: preserved?.date,
        doctor: preserved?.doctor,
        lab: preserved?.lab,
        tests: buildTests(),
      },
    });
  };

  const handleDone = () => {
    goBack();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-[1440px] mx-auto bg-slate-50 min-h-screen pb-24">
        {/* Header */}
      <div className="relative px-6 pt-8 pb-5 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-violet-400 to-rose-400" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:border-slate-300 hover:shadow transition-all"
            >
              <ArrowLeft size={18} className="text-slate-700" />
            </button>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">
                New Entry
              </p>
              <p className="text-xl font-black text-slate-900 tracking-tight">
                Select Tests
              </p>
            </div>
          </div>
          {selected.size > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-emerald-700">
                {selected.size} selected
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="px-6 mb-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search test name..."
            className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-400 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Count */}
      <div className="px-6 mb-2">
        <p className="text-xs font-semibold text-slate-500">
          {selected.size} selected
        </p>
      </div>

      {/* List */}
      <div className="px-6 space-y-2">
        {paramsLoading && (
          <p className="text-sm text-slate-500">Loading tests...</p>
        )}
        {paramsError && (
          <p className="text-sm text-red-500">{paramsError}</p>
        )}
        {!paramsLoading && !paramsError && params.length === 0 && (
          <p className="text-sm text-slate-400">No tests found.</p>
        )}
        {!paramsLoading &&
          !paramsError &&
          params.map((test) => {
            const checked = selected.has(test.parameter_id);
            const { Icon, iconBg } = getTestMeta(test.parameter_name);
            const refText =
              test.start_range && test.end_range
                ? `Reference ${test.start_range} - ${test.end_range} ${test.parameter_unit || ""}`
                : test.parameter_unit
                  ? `Unit: ${test.parameter_unit}`
                  : "";
            return (
              <div
                key={test.parameter_id}
                className="flex items-center justify-between gap-3 py-3 border-b border-white-100 last:border-b-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {test.parameter_name}
                    </p>
                    {refText && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {refText}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(test)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                    checked
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {checked && <Check size={12} />}
                  {checked ? "Added" : "Add"}
                </button>
              </div>
            );
          })}
      </div>

      {/* Load More */}
      {hasMore && !paramsLoading && !isLoadingMore && !paramsError && (
        <div className="px-6 mt-4 mb-4">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="w-full h-11 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Load More
          </button>
        </div>
      )}
      {isLoadingMore && (
        <div className="px-6 mt-4 mb-4 text-center">
          <p className="text-sm text-slate-500">Loading more...</p>
        </div>
      )}

      {/* Done button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleDone}
            className="w-full h-12 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"
          >
            Done ({selected.size})
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default SelectTest;
