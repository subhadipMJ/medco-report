import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useNavigateWithToken } from "../hooks/useNavigateWithToken";
import { useReportDetails } from "../hooks/useReportDetails";
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Download,
  CalendarDays,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { LabReport } from "../types/api";

function formatDateInput(d: Date): string {
  return d.toISOString().split("T")[0];
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatChartDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function parseNumericValue(value: string): number | null {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseRangeValue(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatAxisValue(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

type ValueStatus = "low" | "normal" | "high" | "unknown";

function getValueStatus(
  value: number | null,
  min: number | null,
  max: number | null,
): ValueStatus {
  if (value === null || min === null || max === null) return "unknown";
  if (value < min) return "low";
  if (value > max) return "high";
  return "normal";
}

function getStatusColor(status: ValueStatus): string {
  if (status === "normal") return "#148E69";
  if (status === "high") return "#1F7AE0";
  if (status === "low") return "#D94848";
  return "#7A7A7A";
}

function getStatusLabel(status: ValueStatus): string {
  if (status === "normal") return "Normal";
  if (status === "high") return "High";
  if (status === "low") return "Low";
  return "N/A";
}

interface ParameterCardData {
  name: string;
  unit: string;
  latestValue: string;
  latestNumericValue: number | null;
  latestDate: string;
  records: LabReport[];
  groupName: string;
  testTypeName: string;
  minRange: number | null;
  maxRange: number | null;
  valueStatus: ValueStatus;
  trend: "up" | "down" | "flat";
}

interface ChartPoint {
  label: string;
  fullDate: string;
  value: number;
  status: ValueStatus;
}

interface ReportDetailsProps {
  token: string;
}

const ReportDetail = ({ token }: ReportDetailsProps) => {
  const { id } = useParams();
  const navigate = useNavigateWithToken();

  const [startDate, setStartDate] = useState<string | undefined>(() => {
    const start = new Date();
    start.setMonth(start.getMonth() - 3);
    return formatDateInput(start);
  });
  const [endDate, setEndDate] = useState<string | undefined>(() =>
    formatDateInput(new Date()),
  );
  const [preset, setPreset] = useState<"today" | "yesterday" | "3m" | "custom">("3m");
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [allValuesOpen, setAllValuesOpen] = useState(true);

  const { data, loading, error } = useReportDetails(
    token || null,
    id || "",
    startDate,
    endDate,
  );

  const apply3M = () => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 3);
    setStartDate(formatDateInput(start));
    setEndDate(formatDateInput(end));
    setPreset("3m");
  };

  const applyToday = () => {
    const today = new Date();
    setStartDate(formatDateInput(today));
    setEndDate(formatDateInput(today));
    setPreset("today");
  };

  const applyYesterday = () => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    setStartDate(formatDateInput(yesterday));
    setEndDate(formatDateInput(today));
    setPreset("yesterday");
  };

  const groupedByParameter = useMemo(() => {
    if (!data) return [];
    const map = new Map<string, LabReport[]>();
    data.forEach((r) => {
      if (!r.parameter?.name) return;
      const key = r.parameter.name;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });
    return Array.from(map.entries())
      .map(([name, records]): ParameterCardData => {
        const sortedRecords = [...records].sort(
          (a, b) =>
            new Date(a.date_of_test).getTime() -
            new Date(b.date_of_test).getTime(),
        );
        const latestRecord = sortedRecords[sortedRecords.length - 1];
        const previousRecord = sortedRecords[sortedRecords.length - 2];

        const latestNumericValue = parseNumericValue(latestRecord.test_value);
        const previousNumericValue = previousRecord
          ? parseNumericValue(previousRecord.test_value)
          : null;

        const minRange = parseRangeValue(latestRecord.parameter?.start_range);
        const maxRange = parseRangeValue(latestRecord.parameter?.end_range);
        const valueStatus = getValueStatus(
          latestNumericValue,
          minRange,
          maxRange,
        );

        let trend: "up" | "down" | "flat" = "flat";
        if (latestNumericValue !== null && previousNumericValue !== null) {
          if (latestNumericValue > previousNumericValue) trend = "up";
          if (latestNumericValue < previousNumericValue) trend = "down";
        }

        return {
          name,
          unit: latestRecord.parameter?.unit || "",
          latestValue: latestRecord.test_value,
          latestNumericValue,
          latestDate: latestRecord.date_of_test,
          records: sortedRecords,
          groupName: latestRecord.group?.name || "",
          testTypeName: latestRecord.test_type?.name || "",
          minRange,
          maxRange,
          valueStatus,
          trend,
        };
      })
      .sort((a, b) => {
        if (a.groupName === b.groupName) {
          return a.name.localeCompare(b.name);
        }
        return a.groupName.localeCompare(b.groupName);
      });
  }, [data]);

  const chartPointsByParameter = useMemo(() => {
    return new Map(
      groupedByParameter.map((parameter) => {
        const points: ChartPoint[] = parameter.records
          .map((record) => {
            const numericValue = parseNumericValue(record.test_value);
            if (numericValue === null) return null;
            const status = getValueStatus(
              numericValue,
              parameter.minRange,
              parameter.maxRange,
            );
            return {
              label: formatChartDate(record.date_of_test),
              fullDate: record.date_of_test,
              value: numericValue,
              status,
            };
          })
          .filter((point): point is ChartPoint => point !== null);

        return [parameter.name, points] as const;
      }),
    );
  }, [groupedByParameter]);

  const groups = useMemo(() => {
    const set = new Set<string>();
    data?.forEach((r) => {
      if (r.group?.name) set.add(r.group.name);
    });
    return Array.from(set);
  }, [data]);

  useEffect(() => {
    if (groups.length === 0) {
      setActiveGroup(null);
      return;
    }

    if (!activeGroup || !groups.includes(activeGroup)) {
      setActiveGroup(groups[0]);
    }
  }, [groups, activeGroup]);

  const filteredParameters = useMemo(() => {
    if (!activeGroup) return groupedByParameter;
    return groupedByParameter.filter((p) => p.groupName === activeGroup);
  }, [groupedByParameter, activeGroup]);

  const testTypeName =
    filteredParameters[0]?.testTypeName ||
    data?.[0]?.test_type?.name ||
    "Test Details";
  const testDate = data?.[0]?.date_of_test || "";
  const labName = data?.[0]?.lab_name || "";
  const doctorName = data?.[0]?.doctor_name || "";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F5] font-sans gap-4">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F5] font-sans">
        <p className="text-sm font-bold text-rose-600 mb-3">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl font-bold transition-all border border-blue-200"
        >
          Return Home
        </button>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F5] font-sans">
        <p className="text-slate-500 font-bold mb-4">
          No records found for this test.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl font-bold transition-all border border-blue-200"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#e6edf5_0%,#eef1e6_45%,#f2e9df_100%)] px-2 py-3 sm:px-4 sm:py-6">
      <div className="mx-auto min-h-[calc(100vh-1.5rem)] w-full max-w-[430px] overflow-hidden rounded-[30px] border border-white/60 bg-white/55 shadow-[0_20px_60px_rgba(17,24,39,0.16)] backdrop-blur-xl">
        <div className="sticky top-0 z-20 border-b border-slate-200/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(248,250,252,0.72)_100%)] px-4 pb-3 pt-4 backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-700 shadow-sm"
              aria-label="Back"
            >
              <ArrowLeft size={17} />
            </button>
            <h1 className="max-w-[245px] truncate px-2 text-center text-xl font-semibold leading-tight text-slate-900 sm:max-w-[280px] sm:text-2xl">
              {testTypeName}
            </h1>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-700 shadow-sm"
              aria-label="Actions"
              title="Actions"
            >
              <Download size={16} />
            </button>
          </div>

          {groups.length > 0 && (
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {groups.map((g) => (
                <button
                  key={g}
                  onClick={() => setActiveGroup(g)}
                  className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                    activeGroup === g
                      ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                      : "border-slate-300 bg-white/70 text-slate-700"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <CalendarDays size={14} />
              <span className="font-medium">Date range</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={applyToday}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide ${
                  preset === "today"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 bg-white/70 text-slate-700"
                }`}
              >
                Today
              </button>
              <button
                onClick={applyYesterday}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide ${
                  preset === "yesterday"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 bg-white/70 text-slate-700"
                }`}
              >
                Yesterday
              </button>
              <button
                onClick={apply3M}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide ${
                  preset === "3m"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 bg-white/70 text-slate-700"
                }`}
              >
                3M
              </button>
              <button
                onClick={() => setPreset("custom")}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide ${
                  preset === "custom"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 bg-white/70 text-slate-700"
                }`}
              >
                Custom
              </button>
            </div>
            {preset === "custom" && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate || ""}
                  onChange={(e) => setStartDate(e.target.value || undefined)}
                  className="h-9 flex-1 rounded-xl border border-slate-300 bg-white/70 px-3 text-xs font-medium text-slate-800 outline-none focus:border-slate-500"
                />
                <span className="text-xs text-slate-400">to</span>
                <input
                  type="date"
                  value={endDate || ""}
                  onChange={(e) => setEndDate(e.target.value || undefined)}
                  className="h-9 flex-1 rounded-xl border border-slate-300 bg-white/70 px-3 text-xs font-medium text-slate-800 outline-none focus:border-slate-500"
                />
              </div>
            )}
          </div>
        </div>

        <div className="px-4 pb-6 pt-5">
          <button
            onClick={() => setAllValuesOpen((prev) => !prev)}
            className="mb-2 flex w-full items-center justify-between text-left"
          >
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              All Values
            </h2>
            {allValuesOpen ? (
              <ChevronUp size={18} className="text-slate-400" />
            ) : (
              <ChevronDown size={18} className="text-slate-400" />
            )}
          </button>
          {allValuesOpen && (
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
            {filteredParameters.map((param, idx) => {
              const statusLabel = getStatusLabel(param.valueStatus);
              const statusColor = getStatusColor(param.valueStatus);
              return (
                <div
                  key={param.name}
                  className={`flex items-center justify-between px-4 py-3.5 ${
                    idx < filteredParameters.length - 1
                      ? "border-b border-slate-100"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-2 inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: statusColor }}
                    />
                    <div>
                      <p className="text-base font-semibold leading-tight text-slate-900">
                        {param.name}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {param.minRange !== null && param.maxRange !== null
                          ? `Ref: ${param.minRange}-${param.maxRange} ${param.unit}`
                          : `Ref: unavailable`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-2xl font-semibold leading-none text-slate-900">
                      <span>{param.latestValue}</span>
                      {param.trend === "up" && (
                        <ArrowUp size={16} className="text-emerald-600" />
                      )}
                      {param.trend === "down" && (
                        <ArrowDown size={16} className="text-rose-600" />
                      )}
                    </div>
                    <div className="mt-1">
                      <span
                        className="rounded-md px-2 py-0.5 text-xs font-semibold"
                        style={{
                          backgroundColor:
                            param.valueStatus === "normal"
                              ? "#DDE9D2"
                              : param.valueStatus === "unknown"
                                ? "#E8E8E8"
                                : "#F4DDD8",
                          color:
                            param.valueStatus === "normal"
                              ? "#4D7B2E"
                              : param.valueStatus === "unknown"
                                ? "#5D5D5D"
                                : "#A0452B",
                        }}
                      >
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>

        {/* {filteredParameters.length > 0 && (
          <div className="px-4 pt-3">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {filteredParameters.map((param) => (
                <div
                  key={param.name}
                  className="min-w-[92px] shrink-0 rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2.5 shadow-[0_6px_16px_rgba(15,23,42,0.06)]"
                >
                  <p className="text-[11px] text-slate-500">{param.name}</p>
                  <p className="text-2xl font-semibold leading-none text-slate-900">
                    {param.latestValue}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">{param.unit}</p>
                </div>
              ))}
            </div>
          </div>
        )} */}

        <div className="space-y-3 px-4 pt-4">
          {filteredParameters.map((param) => {
            const chartData = chartPointsByParameter.get(param.name) ?? [];
            const valueColor = getStatusColor(param.valueStatus);
            const values = chartData.map((p) => p.value);
            const minValue = values.length > 0 ? Math.min(...values) : 0;
            const maxValue = values.length > 0 ? Math.max(...values) : 1;
            const yPadding =
              chartData.length > 0
                ? minValue === maxValue
                  ? Math.max(Math.abs(minValue) * 0.08, 1)
                  : Math.max((maxValue - minValue) * 0.18, 0.5)
                : 1;

            return (
              <div
                key={param.name}
                className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.08)]"
              >
                <div className="mb-2 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold leading-none text-slate-900">
                      {param.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {param.minRange !== null && param.maxRange !== null
                        ? `Normal: ${param.minRange}-${param.maxRange} ${param.unit}`
                        : `Normal range unavailable`}
                    </p>
                  </div>
                  <div className="flex items-end gap-1.5 pt-1">
                    <span
                      className="text-3xl font-semibold leading-none"
                      style={{ color: valueColor }}
                    >
                      {param.latestValue}
                    </span>
                    <span className="pb-1 text-sm text-slate-500">
                      {param.unit}
                    </span>
                  </div>
                </div>

                {chartData.length > 0 ? (
                  <div className="h-[150px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 14, right: 10, left: 2, bottom: 0 }}
                      >
                        <CartesianGrid
                          vertical={false}
                          stroke="#E2E8F0"
                          strokeDasharray="4 4"
                        />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 11, fill: "#64748B" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#64748B" }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) => formatAxisValue(Number(value))}
                          tickCount={4}
                          domain={[minValue - yPadding, maxValue + yPadding]}
                          width={42}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #CBD5E1",
                            backgroundColor: "#F8FAFC",
                          }}
                          labelStyle={{ color: "#334155", fontWeight: 600 }}
                          formatter={(value: number | string) => [
                            `${value} ${param.unit}`,
                            param.name,
                          ]}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={valueColor}
                          strokeWidth={2.5}
                          dot={(props: {
                            cx?: number;
                            cy?: number;
                            payload?: ChartPoint;
                          }) => {
                            const cx = props.cx ?? 0;
                            const cy = props.cy ?? 0;
                            const status = props.payload?.status ?? "unknown";
                            return (
                              <circle
                                cx={cx}
                                cy={cy}
                                r={4.5}
                                stroke="none"
                                fill={getStatusColor(status)}
                              />
                            );
                          }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 px-3 py-5 text-center text-sm text-slate-500">
                    No numeric values available for chart.
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-4 pb-6 pt-5">
          <p className="mt-4 text-center text-xs text-slate-500">
            {formatShortDate(testDate)} · {labName}
            {doctorName && ` · Dr. ${doctorName}`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
