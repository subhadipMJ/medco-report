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
  ArrowLeft,
} from "lucide-react";
import { useNavigateWithToken } from "../hooks/useNavigateWithToken";
import { useLabReports } from "../hooks/useLabReports";
import type { GroupedByTestType } from "../types/api";
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
    <div>
      {groupedReports.map((gt) => (
        <div
          key={gt.testType.id}
          className="border-b border-slate-200 bg-white p-4"
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
                  className="w-full flex items-center justify-between border-b border-slate-100 px-3 py-2.5 text-left hover:bg-slate-50 transition-colors"
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
                  <div className="mt-2 space-y-2">
                    {g.parameters.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between px-3 py-2"
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
  const navigate = useNavigateWithToken();
  const { data: groupedReports, loading, error, refetch } = useLabReports(
    token || null,
    {},
  );

  if (loading && groupedReports.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        <div className="max-w-[1440px] mx-auto bg-white min-h-screen pb-24">
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
      <div className="min-h-screen bg-slate-50 font-sans">
        <div className="max-w-[1440px] mx-auto bg-white min-h-screen pb-24">
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
      <div className="max-w-[1440px] mx-auto bg-slate-50 min-h-screen pb-24">
        <div className="px-6 pb-24 relative">
          <div className="flex items-center justify-between pt-6 pb-4">
            <button
              onClick={() => navigate("/")}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft size={16} className="text-slate-600" />
            </button>
            <p className="text-lg font-black text-slate-900">Group Wise</p>
            <button
              onClick={refetch}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
          <div className="animate-fade-in space-y-6">
            <GroupWiseView groupedReports={groupedReports} />
          </div>
        </div>
      </div>
    </div>
  );
}
