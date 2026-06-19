import { useState } from "react";
import {
  Activity,
  Droplet,
  FlaskConical,
  TestTube2,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useLabReports } from "../hooks/useLabReports";
import type { GroupedByTestType } from "../types/api";
import Header from "./Header";

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

interface GroupWiseProps {
  token: string;
}

export default function GroupWise({ token }: GroupWiseProps) {
  const { data: groupedReports, loading, error, refetch } = useLabReports(
    token || null,
    {},
  );

  if (loading && groupedReports.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto bg-white min-h-screen pb-24">
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={32} className="animate-spin text-blue-500" />
            <p className="text-sm font-semibold text-slate-500">Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto bg-white min-h-screen pb-24">
          <div className="flex flex-col items-center justify-center py-20 gap-3 px-6">
            <p className="text-sm font-semibold text-red-600">{error}</p>
            <button
              onClick={refetch}
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
          title="Group Wise"
          onRefresh={refetch}
          isRefreshing={loading}
        />

        <div className="px-6 pb-24 relative z-10">
          <div className="animate-fade-in space-y-6">
            <GroupWiseView groupedReports={groupedReports} />
          </div>
        </div>
      </div>
    </div>
  );
}
