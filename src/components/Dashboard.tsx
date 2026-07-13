import { useEffect, useMemo, useRef, useState } from "react";
import {
  RefreshCw,
  Loader2,
  Download,
  Search,
  CalendarDays,
  Plus,
  Droplet,
  Heart,
  Zap,
  FlaskConical,
  Beaker,
  Thermometer,
  Bone,
  Activity,
  SlidersHorizontal,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { useDebounce } from "../hooks/useDebounce";
import { useNavigateWithToken } from "../hooks/useNavigateWithToken";
import { useLabReports } from "../hooks/useLabReports";
import Header from "./Header";
// import { useVitalsOthers } from "../hooks/useVitals";

type TrendDirection = "up" | "down" | "flat";

interface DashboardProps {
  token: string;
}

const Dashboard = ({ token }: DashboardProps) => {
  const navigate = useNavigateWithToken();

  const [datePreset, setDatePreset] = useState<
    | "all"
    | "today"
    | "yesterday"
    | "thisMonth"
    | "thisYear"
    | "6months"
    | "custom"
  >("thisYear");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "critical" | "normal"
  >("all");
  const [page, setPage] = useState(1);
  const [vitalsModalOpen, setVitalsModalOpen] = useState(false);

  // Read filters from URL on mount
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const dp = sp.get("date") as typeof datePreset | null;
    const validPresets = [
      "all",
      "today",
      "yesterday",
      "thisMonth",
      "thisYear",
      "6months",
      "custom",
    ] as const;
    if (dp && validPresets.includes(dp)) setDatePreset(dp);
    const s = sp.get("start");
    if (s) setCustomStart(s);
    const e = sp.get("end");
    if (e) setCustomEnd(e);
    const q = sp.get("search");
    if (q) setSearchQuery(q);
    const st = sp.get("status") as typeof statusFilter | null;
    const validStatuses = ["all", "critical", "normal"] as const;
    if (st && validStatuses.includes(st)) setStatusFilter(st);
    const p = sp.get("page");
    if (p) {
      const pn = parseInt(p, 10);
      if (!isNaN(pn) && pn > 0) setPage(pn);
    } else if (initialHighestCachedPage.current > 1) {
      setPage(initialHighestCachedPage.current);
    }
  }, []);

  const isFirstRender = useRef(true);

  // Write filters to URL when they change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const sp = new URLSearchParams(window.location.search);
    if (datePreset && datePreset !== "all") sp.set("date", datePreset);
    else sp.delete("date");
    if (customStart) sp.set("start", customStart);
    else sp.delete("start");
    if (customEnd) sp.set("end", customEnd);
    else sp.delete("end");
    if (debouncedSearchQuery.trim())
      sp.set("search", debouncedSearchQuery.trim());
    else sp.delete("search");
    if (statusFilter && statusFilter !== "all") sp.set("status", statusFilter);
    else sp.delete("status");
    if (page > 1) sp.set("page", String(page));
    else sp.delete("page");
    const newUrl = `${window.location.pathname}${sp.toString() ? `?${sp.toString()}` : ""}`;
    window.history.replaceState({}, "", newUrl);
  }, [
    datePreset,
    customStart,
    customEnd,
    debouncedSearchQuery,
    statusFilter,
    page,
  ]);

  const dateFilters = useMemo(() => {
    if (datePreset === "today") {
      const today = new Date().toISOString().split("T")[0];
      return { start_date: today, end_date: today };
    }
    if (datePreset === "yesterday") {
      const today = new Date().toISOString().split("T")[0];
      const d = new Date();
      d.setDate(d.getDate() - 1);
      const yesterday = d.toISOString().split("T")[0];
      return { start_date: yesterday, end_date: today };
    }
    if (datePreset === "thisMonth") {
      const today = new Date().toISOString().split("T")[0];
      const firstDay = new Date();
      firstDay.setDate(1);
      const start = firstDay.toISOString().split("T")[0];
      return { start_date: start, end_date: today };
    }
    if (datePreset === "thisYear") {
      const today = new Date().toISOString().split("T")[0];
      const firstDay = new Date();
      firstDay.setMonth(0);
      firstDay.setDate(1);
      const start = firstDay.toISOString().split("T")[0];
      return { start_date: start, end_date: today };
    }
    if (datePreset === "6months") {
      const today = new Date().toISOString().split("T")[0];
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const start = sixMonthsAgo.toISOString().split("T")[0];
      return { start_date: start, end_date: today };
    }
    if (datePreset === "custom" && customStart && customEnd) {
      return { start_date: customStart, end_date: customEnd };
    }
    return {};
  }, [datePreset, customStart, customEnd]);

  const {
    rawList,
    pagination,
    loading,
    isLoadingMore,
    error,
    refetch,
    highestCachedPage,
  } = useLabReports(token || null, {
    search: debouncedSearchQuery.trim() || undefined,
    ...dateFilters,
    status: statusFilter === "all" ? undefined : statusFilter,
    page,
  });

  // const { vitalsOthers } = useVitalsOthers(token);

  const initialHighestCachedPage = useRef(highestCachedPage);
  const hasRestoredScroll = useRef(false);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, dateFilters, statusFilter]);

  useEffect(() => {
    if (!loading && !hasRestoredScroll.current) {
      const saved =
        typeof window.history.state === "object" &&
        window.history.state !== null
          ? window.history.state.dashboardScrollY
          : undefined;
      if (typeof saved === "number") {
        const restoreScroll = () => {
          window.scrollTo(0, saved);
          window.history.replaceState(
            { ...window.history.state, dashboardScrollY: undefined },
            "",
          );
        };
        // First RAF waits for paint, second RAF waits for layout to settle
        requestAnimationFrame(() => {
          requestAnimationFrame(restoreScroll);
        });
      }
      hasRestoredScroll.current = true;
    }
  }, [loading]);

  const trendCards = useMemo(() => {
    return (Array.isArray(rawList) ? rawList : [])
      .map((report) => {
        const minRange = report.parameter.start_range
          ? Number.parseFloat(report.parameter.start_range)
          : null;
        const maxRange = report.parameter.end_range
          ? Number.parseFloat(report.parameter.end_range)
          : null;
        const valueColor =
          report.status === "high"
            ? "#E11D48"
            : report.status === "low"
              ? "#2563EB"
              : "#228B22";

        return {
          key: `${report.id}`,
          testId: report.test_id,
          parameterId: report.parameter_id,
          keyword: report.test_type?.key_word || "",
          name: report.parameter.name,
          unit: report.parameter.unit || "-",
          testDate: report.date_of_test || "dd/mm/yyyy",
          previousValue: "—",
          currentValue: report.test_value,
          delta: null,
          direction: "flat" as TrendDirection,
          latestDate: report.date_of_test,
          minRange,
          maxRange,
          valueColor,
          status: report.status,
          testReport: report.test_report,
          labName: report.lab_name,
          doctorName: report.doctor_name,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime(),
      );
  }, [rawList]);

  const getTestMeta = (name: string) => {
    const n = name.toLowerCase();
    if (
      n.includes("hemoglobin") ||
      n.includes("blood") ||
      n.includes("rbc") ||
      n.includes("wbc") ||
      n.includes("platelet") ||
      n.includes("hct") ||
      n.includes("mcv")
    )
      return {
        Icon: Droplet as LucideIcon,
        iconBg: "bg-slate-50 text-slate-500",
        borderColor: "border-l-4 border-l-slate-200",
      };
    if (
      n.includes("cholesterol") ||
      n.includes("ldl") ||
      n.includes("hdl") ||
      n.includes("triglyceride") ||
      n.includes("lipid")
    )
      return {
        Icon: Heart as LucideIcon,
        iconBg: "bg-slate-50 text-slate-500",
        borderColor: "border-l-4 border-l-slate-200",
      };
    if (
      n.includes("glucose") ||
      n.includes("sugar") ||
      n.includes("hba1c") ||
      n.includes("diabetes")
    )
      return {
        Icon: Zap as LucideIcon,
        iconBg: "bg-slate-50 text-slate-500",
        borderColor: "border-l-4 border-l-slate-200",
      };
    if (
      n.includes("liver") ||
      n.includes("ast") ||
      n.includes("alt") ||
      n.includes("bilirubin") ||
      n.includes("alkaline") ||
      n.includes("sgpt") ||
      n.includes("sgot")
    )
      return {
        Icon: FlaskConical as LucideIcon,
        iconBg: "bg-slate-50 text-slate-500",
        borderColor: "border-l-4 border-l-slate-200",
      };
    if (
      n.includes("kidney") ||
      n.includes("creatinine") ||
      n.includes("bun") ||
      n.includes("urea") ||
      n.includes("uric")
    )
      return {
        Icon: Beaker as LucideIcon,
        iconBg: "bg-slate-50 text-slate-500",
        borderColor: "border-l-4 border-l-slate-200",
      };
    if (
      n.includes("thyroid") ||
      n.includes("tsh") ||
      n.includes("t3") ||
      n.includes("t4")
    )
      return {
        Icon: Thermometer as LucideIcon,
        iconBg: "bg-slate-50 text-slate-500",
        borderColor: "border-l-4 border-l-slate-200",
      };
    if (
      n.includes("calcium") ||
      n.includes("vitamin") ||
      n.includes("vit d") ||
      n.includes("b12") ||
      n.includes("iron") ||
      n.includes("ferritin")
    )
      return {
        Icon: Bone as LucideIcon,
        iconBg: "bg-slate-50 text-slate-500",
        borderColor: "border-l-4 border-l-slate-200",
      };
    return {
      Icon: Activity as LucideIcon,
      iconBg: "bg-slate-50 text-slate-500",
      borderColor: "border-l-4 border-l-slate-200",
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-[1440px] mx-auto min-h-screen pb-24">
        <Header
          token={token}
          title="My Reports"
          onRefresh={refetch}
          isRefreshing={loading}
          onVitalsModalChange={setVitalsModalOpen}
        />

        {/* Vitals row */}
        {/* <div className="px-6 my-3 grid grid-cols-3 gap-3">
          {vitalsOthers?.map((others, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-100 p-3 flex items-center gap-2.5 shadow-sm"
            >
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  {others.key}
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {others.value}
                </p>
              </div>
            </div>
          ))}
        </div> */}

        {/* Search & Date Filter */}
        <div className="px-6 space-y-3 mb-6 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reports"
                className="w-full h-10 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:bg-white transition-colors"
              />
            </div>
            <div className="relative shrink-0">
              <SlidersHorizontal
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={datePreset}
                onChange={(e) =>
                  setDatePreset(
                    e.target.value as
                      | "all"
                      | "today"
                      | "yesterday"
                      | "thisMonth"
                      | "thisYear"
                      | "6months"
                      | "custom",
                  )
                }
                className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-xs font-semibold text-slate-700 outline-none focus:border-blue-400 focus:bg-white transition-colors cursor-pointer"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="thisMonth">This Month</option>
                <option value="thisYear">This Year</option>
                <option value="6months">6 Months</option>
                <option value="custom">Custom</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>
          {datePreset === "custom" && (
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="text-slate-400 shrink-0" />
              <div className="relative flex-1">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="h-9 w-full rounded-xl border border-slate-300 bg-white px-2 text-xs font-medium text-transparent outline-none focus:border-slate-500"
                />
                <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-800">
                  {customStart
                    ? `${customStart.slice(8, 10)}/${customStart.slice(5, 7)}/${customStart.slice(0, 4)}`
                    : "DD/MM/YYYY"}
                </span>
              </div>
              <span className="text-xs text-slate-400 shrink-0">to</span>
              <div className="relative flex-1">
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="h-9 w-full rounded-xl border border-slate-300 bg-white px-2 text-xs font-medium text-transparent outline-none focus:border-slate-500"
                />
                <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-800">
                  {customEnd
                    ? `${customEnd.slice(8, 10)}/${customEnd.slice(5, 7)}/${customEnd.slice(0, 4)}`
                    : "DD/MM/YYYY"}
                </span>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="flex w-full gap-0.5 rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm overflow-x-auto">
              {(["all", "critical", "normal"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`flex-auto whitespace-nowrap rounded-lg px-0.5 py-1.5 text-[12px] font-semibold transition-all ${
                    statusFilter === status
                      ? status === "critical"
                        ? "bg-rose-600 text-white"
                        : status === "normal"
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-900 text-white"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {status === "all" && "All Status"}
                  {status === "critical" && "Critical"}
                  {status === "normal" && "Normal"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Health Score Card - Neumorphic Light */}
        {/* <div className="group bg-white border border-slate-100 hover:border-blue-100 rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(59,130,246,0.08)] hover:-translate-y-1 transition-all duration-500 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 blur-2xl rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>
            
            <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100 relative z-10">
              <div className="text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Tests</p>
                <p className="text-sm font-black text-slate-800">{loading ? '—' : totalReports}</p>
              </div>
              <div className="text-center border-x border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Test Groups</p>
                <p className="text-sm font-black text-slate-800">{loading ? '—' : uniqueGroups}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Test Types</p>
                <p className="text-sm font-black text-slate-800">{loading ? '—' : uniqueTestTypes}</p>
              </div>
            </div>
          </div> */}

        <div className="px-6 pb-24 relative bg-slate-50">
          <div className="animate-fade-in space-y-6">
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 size={36} className="text-blue-500 animate-spin" />
                <p className="text-sm font-semibold text-slate-500">
                  Fetching your lab reports...
                </p>
              </div>
            )}

            {!loading && error && (
              <div className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-6 text-center">
                <p className="text-sm font-bold text-rose-600 mb-3">{error}</p>
                <button
                  onClick={refetch}
                  className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 mx-auto"
                >
                  <RefreshCw size={14} /> Retry
                </button>
                {/* <p>{token}</p> */}
              </div>
            )}

            {!loading && !error && !token && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 text-center">
                <p className="text-sm font-bold text-amber-700">
                  No access token found.
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Open this app with a valid{" "}
                  <code className="bg-amber-100 px-1 rounded">?token=</code> URL
                  parameter.
                </p>
                {/* <p>{token}</p> */}
              </div>
            )}

            {!loading && !error && trendCards.length > 0 && (
              <div className="space-y-3">
                {trendCards.map((card) => {
                  const statusPill =
                    card.status === "normal"
                      ? "bg-slate-100 text-slate-700"
                      : card.status === "high"
                        ? "bg-slate-100 text-slate-700"
                        : card.status === "low"
                          ? "bg-slate-100 text-slate-700"
                          : "bg-slate-50 text-slate-600";
                  const statusLabel =
                    card.status === "normal"
                      ? "Normal"
                      : card.status === "high"
                        ? "High"
                        : card.status === "low"
                          ? "Low"
                          : "Unknown";

                  let referenceText = "Unavailable";
                  if (card.minRange !== null && card.maxRange !== null) {
                    referenceText = `${card.minRange} - ${card.maxRange} ${card.unit}`;
                  } else if (card.maxRange !== null) {
                    referenceText = `< ${card.maxRange} ${card.unit}`;
                  } else if (card.minRange !== null) {
                    referenceText = `> ${card.minRange} ${card.unit}`;
                  }

                  const val = Number.parseFloat(card.currentValue);
                  const isNumeric = !Number.isNaN(val);
                  let barMin = 0;
                  let barMax = 0;
                  let dotPercent = 0;
                  if (isNumeric) {
                    if (card.minRange !== null && card.maxRange !== null) {
                      const range = card.maxRange - card.minRange;
                      barMin = Math.max(0, card.minRange - range * 0.3);
                      barMax = card.maxRange + range * 0.3;
                    } else if (card.maxRange !== null) {
                      barMin = Math.max(0, card.maxRange * 0.4);
                      barMax = card.maxRange * 2;
                    } else if (card.minRange !== null) {
                      barMin = Math.max(0, card.minRange * 0.5);
                      barMax = card.minRange * 1.5;
                    } else {
                      barMin = 0;
                      barMax = val * 1.5 || 100;
                    }
                    if (val < barMin) barMin = val - Math.abs(val) * 0.2 - 1;
                    if (val > barMax) barMax = val + Math.abs(val) * 0.2 + 1;
                    dotPercent = ((val - barMin) / (barMax - barMin)) * 100;
                    dotPercent = Math.max(0, Math.min(100, dotPercent));
                  }

                  // const fmtBar = (n: number) => {
                  //   const s = n.toFixed(1);
                  //   return s.endsWith(".0") ? s.slice(0, -2) : s;
                  // };

                  const { Icon, iconBg } = getTestMeta(card.name);
                  return (
                    <div
                      key={card.key}
                      className="group cursor-pointer border-b border-slate-200 bg-white p-4 hover:bg-slate-50 transition-colors"
                      onClick={() => {
                        window.history.replaceState(
                          {
                            ...window.history.state,
                            dashboardScrollY: window.scrollY,
                          },
                          "",
                        );
                        navigate(`/report/${card.parameterId}`);
                      }}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
                          >
                            <Icon size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {card.name}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {card.testDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusPill}`}
                          >
                            {statusLabel}
                          </span>
                          {card.testReport && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const url = card.testReport;
                                if (!url) return;
                                fetch(url, { method: "GET", mode: "cors" })
                                  .then((res) => {
                                    if (!res.ok)
                                      throw new Error(
                                        `Download failed: ${res.status}`,
                                      );
                                    return res.blob();
                                  })
                                  .then((blob) => {
                                    const blobUrl =
                                      window.URL.createObjectURL(blob);
                                    const a = document.createElement("a");
                                    a.href = blobUrl;
                                    const filename =
                                      url.split("/").pop() || "report.pdf";
                                    a.download = filename;
                                    document.body.appendChild(a);
                                    a.click();
                                    a.remove();
                                    window.URL.revokeObjectURL(blobUrl);
                                  })
                                  .catch(() => {
                                    window.open(
                                      url,
                                      "_blank",
                                      "noopener,noreferrer",
                                    );
                                  });
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                              title="Download report"
                            >
                              <Download size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Value + Reference */}
                      <div className="flex items-start justify-between mt-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-slate-900 tracking-tight">
                            {card.currentValue}
                          </span>
                          <span className="text-sm text-slate-400 font-medium">
                            {card.unit}
                          </span>
                        </div>
                        <div className="text-right mt-1">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">
                            Reference
                          </p>
                          <p className="text-xs font-medium text-slate-600 mt-0.5">
                            {referenceText}
                          </p>
                        </div>
                      </div>

                      {/* Bar */}
                      {/* {isNumeric && (
                        <div className="mt-5">
                          <div className="relative h-1.5 rounded-full bg-slate-100">
                            <div
                              className="absolute top-1/2 w-3 h-3 rounded-full border-2 border-white shadow"
                              style={{
                                left: `${dotPercent}%`,
                                backgroundColor: card.valueColor,
                                transform: "translate(-50%, -50%)",
                              }}
                            />
                          </div>
                          <div className="flex justify-between mt-2">
                            <span className="text-[10px] text-slate-400 font-medium">
                              {fmtBar(barMin)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              healthy range
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {fmtBar(barMax)}
                            </span>
                          </div>
                        </div>
                      )} */}

                      {/* lab name & doctor name */}
                      <div className="mt-4 flex justify-between gap-2 text-xs text-slate-500">
                        <span className="font-medium">{card.doctorName}</span>
                        <span>{card.labName}</span>
                      </div>
                    </div>
                  );
                })}
                {pagination && pagination.currentPage < pagination.lastPage && (
                  <div className="mt-4 flex flex-col items-center gap-2">
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={isLoadingMore}
                      className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoadingMore ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : null}
                      Load More
                    </button>
                    <p className="text-[11px] font-medium text-slate-400">
                      Showing {rawList.length} of {pagination.total}
                    </p>
                  </div>
                )}
              </div>
            )}

            {!loading && !error && trendCards.length === 0 && (
              <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 text-center">
                <p className="text-sm font-bold text-slate-600">
                  No report items found.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Floating Add Report Button */}
        {!vitalsModalOpen && (
          <button
            onClick={() => {
              window.history.replaceState(
                { ...window.history.state, dashboardScrollY: window.scrollY },
                "",
              );
              navigate(`/add-report?token=${token}`);
            }}
            className="fixed bottom-40 right-6 w-14 h-14 rounded-full bg-slate-900 text-white shadow-lg flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all z-50"
            title="Add Report"
          >
            <Plus size={24} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
