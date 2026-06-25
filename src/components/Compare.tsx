import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, GitCompare, Loader2, RefreshCw } from "lucide-react";
import {
  useReportCompare,
  useReportCompareDetails,
} from "../hooks/useReportCompare";
import type {
  CompareReportDetails,
  CompareReportParameter,
} from "../types/api";
import Header from "./Header";

function parseDateDMY(dateStr: string): Date {
  const [day, month, yearShort] = dateStr.split("/");
  const fullYear = Number.parseInt(yearShort, 10) < 50
    ? 2000 + Number.parseInt(yearShort, 10)
    : 1900 + Number.parseInt(yearShort, 10);
  return new Date(fullYear, Number.parseInt(month, 10) - 1, Number.parseInt(day, 10));
}

function formatDateDMY(dateStr: string): string {
  return dateStr;
}

function CompareContent({
  token,
  params,
  selectedParams,
  onToggleParam,
  showTable,
  onCompare,
  onBack,
  loadingMore,
}: {
  token: string | null;
  params: CompareReportParameter[];
  selectedParams: string[];
  onToggleParam: (name: string) => void;
  showTable: boolean;
  onCompare: () => void;
  onBack: () => void;
  loadingMore?: boolean;
}) {
  const allParameterNames = useMemo(
    () => params.map((p) => p.parameter_name),
    [params],
  );

  const selectedParamIds = useMemo(() => {
    return selectedParams
      .map(
        (name) => params.find((p) => p.parameter_name === name)?.parameter_id,
      )
      .filter((id): id is string => !!id);
  }, [selectedParams, params]);

  const {
    details,
    loading: detailsLoading,
    error: detailsError,
    refetch: refetchDetails,
  } = useReportCompareDetails(token, selectedParamIds);

  useEffect(() => {
    if (showTable && selectedParamIds.length > 0) {
      refetchDetails();
    }
  }, [showTable, selectedParamIds, refetchDetails]);

  const detailsByName = useMemo(() => {
    const map = new Map<string, CompareReportDetails>();
    details.forEach((r) => {
      map.set(r.parameter_name, r);
    });
    return map;
  }, [details]);

  const tableData = useMemo(() => {
    if (selectedParams.length === 0) return null;

    const datesSet = new Set<string>();
    selectedParams.forEach((name) => {
      const detail = detailsByName.get(name);
      if (detail) {
        detail.records.forEach((rec) => datesSet.add(rec.date_of_test));
      }
    });
    const dates = Array.from(datesSet).sort(
      (a, b) => parseDateDMY(b).getTime() - parseDateDMY(a).getTime(),
    );

    const rows = selectedParams.map((name) => {
      const detail = detailsByName.get(name);
      const unit = detail?.unit || "";
      const minRange = detail?.start_range
        ? Number.parseFloat(detail.start_range)
        : null;
      const maxRange = detail?.end_range
        ? Number.parseFloat(detail.end_range)
        : null;
      const values = dates.map((date) => {
        const rec = detail?.records.find((r) => r.date_of_test === date);
        if (!rec) return null;
        const color =
          rec.status === "high"
            ? "#E11D48"
            : rec.status === "low"
              ? "#2563EB"
              : "#228B22";
        return { value: rec.test_value, color, status: rec.status };
      });
      return { name, unit, minRange, maxRange, values };
    });

    return { dates, rows };
  }, [selectedParams, detailsByName]);

  if (!showTable) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <p className="text-sm font-semibold text-slate-500 mb-3">
            Select parameters to compare across dates.
          </p>
          <div className="flex flex-wrap gap-2">
            {allParameterNames.map((name) => {
              const isSelected = selectedParams.includes(name);
              return (
                <button
                  key={name}
                  onClick={() => onToggleParam(name)}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all w-full ${
                    isSelected
                      ? "border-blue-300 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`inline-block h-3.5 w-3.5 rounded border ${
                        isSelected
                          ? "border-blue-500 bg-blue-500"
                          : "border-slate-300"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          viewBox="0 0 14 14"
                          className="h-3.5 w-3.5 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path d="M2 7l4 4 6-6" />
                        </svg>
                      )}
                    </span>
                    {name}
                  </span>
                </button>
              );
            })}
          </div>

          {loadingMore && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <Loader2 size={16} className="animate-spin text-blue-500" />
              <span className="text-xs font-semibold text-slate-500">
                Loading more...
              </span>
            </div>
          )}
        </div>

        {selectedParams.length > 0 && (
          <div className="flex justify-center">
            <button
              onClick={onCompare}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
            >
              <GitCompare size={16} />
              Compare ({selectedParams.length})
            </button>
          </div>
        )}
      </div>
    );
  }

  if (detailsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 size={32} className="animate-spin text-blue-500" />
        <p className="text-sm font-semibold text-slate-500">
          Loading details...
        </p>
      </div>
    );
  }

  // console.log(details)

  if (detailsError) {
    return (
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft size={14} /> Back to selection
        </button>
        <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 text-center">
          <p className="text-sm font-bold text-red-600">{detailsError}</p>
          <button
            onClick={refetchDetails}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
          >
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (!tableData || tableData.dates.length === 0) {
    return (
      <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 text-center">
        <p className="text-sm font-bold text-slate-600">
          No dates available for selected parameters.
        </p>
      </div>
    );
  }

  console.log(tableData);

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft size={14} /> Back to selection
      </button>

      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/90 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="sticky left-0 min-w-[140px] border-r border-slate-200 bg-slate-50/80 px-3 py-2.5 font-bold text-slate-700">
                Parameter
              </th>
              {tableData.dates.map((date) => (
                <th
                  key={date}
                  className="min-w-[90px] whitespace-nowrap px-3 py-2.5 font-bold text-slate-700 text-center"
                >
                  {formatDateDMY(date)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map((row, idx) => (
              <tr
                key={row.name}
                className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"}
              >
                <td className="sticky left-0 min-w-[140px] border-r border-slate-200 bg-white/95 px-3 py-2.5 font-semibold text-slate-800">
                  <div>{row.name}</div>
                  <div className="mt-0.5 text-[10px] text-slate-400">
                    {row.unit}
                    {row.minRange !== null && row.maxRange !== null
                      ? ` (${row.minRange}-${row.maxRange})`
                      : ""}
                  </div>
                </td>
                {row.values.map((cell, i) => (
                  <td
                    key={i}
                    className="min-w-[90px] whitespace-nowrap px-3 py-2.5 text-center font-bold"
                    style={{
                      background:
                        cell && (cell.status === "low"||cell.status === "high")
                          ? cell.color
                          : "#fff",
                    }}
                  >
                    {cell ? (
                      <span
                        style={{
                          color:
                            cell && (cell.status === "low" || cell.status === "high")
                              ? "#fff"
                              : cell.color,
                        }}
                      >
                        {cell.value}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface CompareProps {
  token: string;
}

export default function Compare({ token }: CompareProps) {
  const [selectedParams, setSelectedParams] = useState<string[]>([]);
  const [showTable, setShowTable] = useState(false);
  const [page, setPage] = useState(1);

  const {
    params,
    loading: paramsLoading,
    error: paramsError,
    refetch: refetchParams,
  } = useReportCompare(token || null, page);

  const handleToggleParam = (name: string) => {
    setSelectedParams((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
    setShowTable(false);
  };

  const handleCompare = () => {
    setShowTable(true);
  };

  const handleBack = () => {
    setShowTable(false);
  };

  const handleLoadMore = () => {
    setPage((p) => p + 1);
  };

  const handleRefresh = () => {
    setPage(1);
    refetchParams();
  };

  if (paramsLoading && page === 1) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto bg-white min-h-screen pb-24">
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={32} className="animate-spin text-blue-500" />
            <p className="text-sm font-semibold text-slate-500">
              Loading reports...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (paramsError) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto bg-white min-h-screen pb-24">
          <div className="flex flex-col items-center justify-center py-20 gap-3 px-6">
            <p className="text-sm font-semibold text-red-600">{paramsError}</p>
            <button
              onClick={refetchParams}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
            >
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-4xl mx-auto bg-white min-h-screen pb-24">
        <Header
          token={token}
          title="Compare"
          onRefresh={handleRefresh}
          isRefreshing={paramsLoading}
        />

        <div className="px-6 pb-24 relative">
          <div className="animate-fade-in space-y-6">
            {params.length === 0 && !paramsLoading ? (
              <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 text-center">
                <p className="text-sm font-bold text-slate-600">
                  No data to compare.
                </p>
              </div>
            ) : (
              <>
                <CompareContent
                  token={token || null}
                  params={params}
                  selectedParams={selectedParams}
                  onToggleParam={handleToggleParam}
                  showTable={showTable}
                  onCompare={handleCompare}
                  onBack={handleBack}
                  loadingMore={paramsLoading && page > 1}
                />
                {!showTable && (
                  <div className="flex justify-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={paramsLoading}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {paramsLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>Load More</>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
