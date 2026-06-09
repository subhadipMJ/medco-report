import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Droplet,
  RefreshCw,
  FlaskConical,
  TestTube2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Download,
  Search,
  CalendarDays,
  User,
  Building2,
  Info,
} from "lucide-react";
import { useDebounce } from "../hooks/useDebounce";
import { useSearchParams } from "react-router-dom";
import { useNavigateWithToken } from "../hooks/useNavigateWithToken";
import { useLabReports } from "../hooks/useLabReports";
import type { LabReport, GroupedByTestType } from "../types/api";

const testTypeIcon = (keyword: string) => {
  switch (keyword) {
    case "blood_test":
      return <Droplet size={20} />;
    case "urine_test":
      return <FlaskConical size={20} />;
    case "molecular_body_fluid":
      return <TestTube2 size={20} />;
    default:
      return <Activity size={20} />;
  }
};

type TrendDirection = "up" | "down" | "flat";

function formatDateDMY(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function GroupWiseView({
  groupedReports,
}: {
  groupedReports: GroupedByTestType[];
}) {
  const [expanded, setExpanded] = useState<number | null>(null);
  if (groupedReports.length === 0) {
    return (
      <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 text-center">
        <p className="text-sm font-bold text-slate-600">
          No grouped reports found.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {groupedReports.map((gt) => (
        <div
          key={gt.testType.id}
          className="rounded-[24px] border border-slate-200/80 bg-white/90 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
              {testTypeIcon(gt.testType.key_word)}
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-900">
                {gt.testType.name}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {gt.groups.length} group{gt.groups.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {gt.groups.map((g) => (
              <div key={g.groupId}>
                <button
                  onClick={() =>
                    setExpanded(expanded === g.groupId ? null : g.groupId)
                  }
                  className="w-full flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/60 px-3 py-2.5 text-left"
                >
                  <span className="text-sm font-semibold text-slate-800">
                    {g.groupName}
                  </span>
                  {expanded === g.groupId ? (
                    <ChevronUp size={16} className="text-slate-500" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-500" />
                  )}
                </button>
                {expanded === g.groupId && (
                  <div className="mt-2 space-y-2 px-1">
                    {g.parameters.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {p.parameter.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {formatDateDMY(p.date_of_test)}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-slate-900">
                          {p.test_value}{" "}
                          <span className="text-xs text-slate-500 font-normal">
                            {p.parameter.unit}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalysisView({ rawList }: { rawList: LabReport[] }) {
  const totalTests = rawList.length;
  const uniqueGroups = new Set(rawList.map((r) => r.group_id)).size;
  const uniqueTypes = new Set(rawList.map((r) => r.test_type.id)).size;
  const uniqueParams = new Set(rawList.map((r) => r.parameter_id)).size;
  const latestDate =
    rawList.length > 0
      ? [...rawList].sort(
          (a, b) =>
            new Date(b.date_of_test).getTime() -
            new Date(a.date_of_test).getTime(),
        )[0].date_of_test
      : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 text-center shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Total Tests
          </p>
          <p className="text-2xl font-black text-slate-900">{totalTests}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 text-center shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Groups
          </p>
          <p className="text-2xl font-black text-slate-900">{uniqueGroups}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 text-center shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Test Types
          </p>
          <p className="text-2xl font-black text-slate-900">{uniqueTypes}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 text-center shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Parameters
          </p>
          <p className="text-2xl font-black text-slate-900">{uniqueParams}</p>
        </div>
      </div>
      {latestDate && (
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Latest Test Date
          </p>
          <p className="text-lg font-bold text-slate-900">{formatDateDMY(latestDate)}</p>
        </div>
      )}
    </div>
  );
}

function CompareView({ rawList }: { rawList: LabReport[] }) {
  if (rawList.length === 0) {
    return (
      <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 text-center">
        <p className="text-sm font-bold text-slate-600">No data to compare.</p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <p className="text-sm font-semibold text-slate-500 mb-3">
        Select parameters to compare across dates.
      </p>
      <div className="space-y-2">
        {Array.from(new Set(rawList.map((r) => r.parameter.name)))
          .slice(0, 8)
          .map((name) => (
            <div
              key={name}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2"
            >
              <span className="text-sm font-medium text-slate-800">{name}</span>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                Compare
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

interface DashboardProps {
  token: string;
}

const Dashboard = ({ token }: DashboardProps) => {
  const navigate = useNavigateWithToken();
  const [searchParams] = useSearchParams();
  const activeTab =
    (searchParams.get("tab") as
      | "reports"
      | "groupWise"
      | "analysis"
      | "compare") || "reports";

  const [datePreset, setDatePreset] = useState<
    "all" | "today" | "yesterday" | "thisMonth" | "thisYear" | "6months" | "custom"
  >("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [page, setPage] = useState(1);

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
    data: groupedReports,
    rawList,
    pagination,
    loading,
    isLoadingMore,
    error,
    refetch,
  } = useLabReports(token || null, {
    search: debouncedSearchQuery.trim() || undefined,
    ...dateFilters,
    page,
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, dateFilters]);

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
          report.status === 'high'
            ? '#E11D48'
            : report.status === 'low'
              ? '#2563EB'
              : '#228B22';

        return {
          key: `${report.id}`,
          testId: report.test_id,
          parameterId: report.parameter_id,
          keyword: report.test_type.key_word,
          name: report.parameter.name,
          unit: report.parameter.unit || "-",
          previousValue: "—",
          currentValue: report.test_value,
          delta: null,
          direction: "flat" as TrendDirection,
          latestDate: report.date_of_test,
          minRange,
          maxRange,
          valueColor,
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

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-4xl mx-auto bg-white min-h-screen pb-24">
        {/* Patient Header - Light Premium Mode */}
        <div className="px-6 pt-8 pb-6 relative z-10 bg-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* <div className="relative group cursor-pointer">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-[2px] shadow-lg shadow-blue-500/30">
                  <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
                    <Heart size={22} className="text-blue-600" />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-[3px] border-white shadow-sm"></div>
              </div> */}
              <div>
                <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase mb-1">
                  Health Dashboard
                </p>
                <p className="text-2xl font-black text-slate-900 m-0 tracking-tight leading-none">
                  My Reports
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={refetch}
                className="w-11 h-11 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center relative hover:bg-slate-100 transition-colors shadow-sm"
                title="Refresh"
              >
                <RefreshCw
                  size={18}
                  className={`text-slate-600 ${loading ? "animate-spin" : ""}`}
                />
              </button>
              {/* <button onClick={openSidebar} className="w-11 h-11 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center relative hover:bg-slate-100 transition-colors shadow-sm" title="Menu">
                <Menu size={18} className="text-slate-600" />
              </button> */}
            </div>
          </div>

          {/* Search & Date Filter */}
          <div className="space-y-3 mb-6">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search test, lab name or doctor name..."
                className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:bg-white transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex w-full gap-0.5 rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm overflow-x-auto">
                {(
                  ["all", "today", "yesterday", "thisMonth", "thisYear", "6months", "custom"] as const
                ).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setDatePreset(preset)}
                    className={`flex-auto whitespace-nowrap rounded-lg px-0.5 py-1.5 text-[9px] font-semibold transition-all ${
                      datePreset === preset
                        ? "bg-slate-900 text-white"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {preset === "all" && "All"}
                    {preset === "today" && "Today"}
                    {preset === "yesterday" && "Yesterday"}
                    {preset === "thisMonth" && "This Month"}
                    {preset === "thisYear" && "This Year"}
                    {preset === "6months" && "6 Months"}
                    {preset === "custom" && "Custom"}
                  </button>
                ))}
              </div>
            </div>
            {datePreset === "custom" && (
              <div className="flex items-center gap-2">
                <CalendarDays size={14} className="text-slate-400" />
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="h-9 flex-1 rounded-xl border border-slate-300 bg-white px-2 text-xs font-medium text-slate-800 outline-none focus:border-slate-500"
                />
                <span className="text-xs text-slate-400">to</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="h-9 flex-1 rounded-xl border border-slate-300 bg-white px-2 text-xs font-medium text-slate-800 outline-none focus:border-slate-500"
                />
              </div>
            )}
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
        </div>

        <div className="px-6 pb-24 relative z-10">
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
                <p>{token}</p>
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
                <p>{token}</p>
              </div>
            )}

            {!loading &&
              !error &&
              activeTab === "reports" &&
              trendCards.length > 0 && (
                <div className="space-y-3">
                  {trendCards.map((card) => (
                    <div
                      key={card.key}
                      className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(15,23,42,0.1)]"
                      onClick={() => navigate(`/report/${card.parameterId}`)}
                    >
                      <div className="mb-2 flex items-start justify-between gap-4">
                        <div>
                          <p className="max-w-[180px] truncate text-lg font-semibold leading-none text-slate-900">
                            {card.name}
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                            {card.minRange !== null && card.maxRange !== null
                              ? `Normal: ${card.minRange}-${card.maxRange} ${card.unit}`
                              : `Normal range unavailable`}
                            <Info size={12} className="text-blue-800" />
                          </p>
                          {card.doctorName && (
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                              <User size={12} className="text-emerald-500" />
                              <span>{card.doctorName}</span>
                            </p>
                          )}
                          {card.labName && (
                            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                              <Building2 size={12} className="text-blue-500" />
                              <span>{card.labName}</span>
                            </p>
                          )}
                        </div>
                        <div className="flex items-end gap-1.5 pt-1">
                          <span
                            className="text-3xl font-semibold leading-none"
                            style={{ color: card.valueColor }}
                          >
                            {card.currentValue}
                          </span>
                          <span className="pb-1 text-sm text-slate-500">
                            {card.unit}
                          </span>
                        </div>
                      </div>
                      {card.testReport && (
                        <div className="flex justify-end">
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
                            className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                          >
                            <Download size={14} /> Download
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
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

            {!loading &&
              !error &&
              activeTab === "reports" &&
              trendCards.length === 0 && (
                <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 text-center">
                  <p className="text-sm font-bold text-slate-600">
                    No report items found.
                  </p>
                </div>
              )}

            {!loading && !error && activeTab === "groupWise" && (
              <GroupWiseView groupedReports={groupedReports} />
            )}
            {!loading && !error && activeTab === "analysis" && (
              <AnalysisView rawList={rawList} />
            )}
            {!loading && !error && activeTab === "compare" && (
              <CompareView rawList={rawList} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
