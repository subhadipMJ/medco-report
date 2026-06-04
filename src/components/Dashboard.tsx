import { useMemo, useState } from 'react';
import { Activity, Droplet, RefreshCw, FlaskConical, TestTube2, Heart, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useNavigateWithToken } from '../hooks/useNavigateWithToken';
import { useLabReports } from '../hooks/useLabReports';
import type { LabReport, GroupedByTestType } from '../types/api';

const testTypeIcon = (keyword: string) => {
  switch (keyword) {
    case 'blood_test': return <Droplet size={20} />;
    case 'urine_test': return <FlaskConical size={20} />;
    case 'molecular_body_fluid': return <TestTube2 size={20} />;
    default: return <Activity size={20} />;
  }
};

type TrendDirection = 'up' | 'down' | 'flat';

const trendTone = (direction: TrendDirection) => {
  if (direction === 'up') {
    return {
      cardHover: 'hover:border-rose-200/80 hover:shadow-[0_25px_50px_rgba(244,63,94,0.12)]',
      badge: 'text-rose-500 bg-rose-50 border-rose-200',
      current: 'text-rose-500',
      currentLabel: 'text-rose-500/80',
      iconTone: 'bg-gradient-to-br from-rose-100 to-pink-50 border-rose-200/70 text-rose-500',
      surfaceGlow: 'from-rose-500/15 via-pink-400/8 to-transparent',
      valuePanel: 'bg-rose-50/70 border-rose-100',
    };
  }

  if (direction === 'down') {
    return {
      cardHover: 'hover:border-emerald-200/80 hover:shadow-[0_25px_50px_rgba(16,185,129,0.12)]',
      badge: 'text-emerald-500 bg-emerald-50 border-emerald-200',
      current: 'text-emerald-500',
      currentLabel: 'text-emerald-500/80',
      iconTone: 'bg-gradient-to-br from-emerald-100 to-teal-50 border-emerald-200/70 text-emerald-500',
      surfaceGlow: 'from-emerald-500/15 via-teal-400/8 to-transparent',
      valuePanel: 'bg-emerald-50/70 border-emerald-100',
    };
  }

  return {
    cardHover: 'hover:border-slate-300/80 hover:shadow-[0_25px_50px_rgba(15,23,42,0.08)]',
    badge: 'text-slate-500 bg-slate-50 border-slate-200',
    current: 'text-slate-700',
    currentLabel: 'text-slate-500',
    iconTone: 'bg-gradient-to-br from-slate-100 to-slate-50 border-slate-200/80 text-slate-600',
    surfaceGlow: 'from-slate-400/12 via-slate-300/6 to-transparent',
    valuePanel: 'bg-slate-50/80 border-slate-200/80',
  };
};

function GroupWiseView({ groupedReports }: { groupedReports: GroupedByTestType[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  if (groupedReports.length === 0) {
    return <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 text-center"><p className="text-sm font-bold text-slate-600">No grouped reports found.</p></div>;
  }
  return (
    <div className="space-y-4">
      {groupedReports.map((gt) => (
        <div key={gt.testType.id} className="rounded-[24px] border border-slate-200/80 bg-white/90 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
              {testTypeIcon(gt.testType.key_word)}
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-900">{gt.testType.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{gt.groups.length} group{gt.groups.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="space-y-2">
            {gt.groups.map((g) => (
              <div key={g.groupId}>
                <button
                  onClick={() => setExpanded(expanded === g.groupId ? null : g.groupId)}
                  className="w-full flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/60 px-3 py-2.5 text-left"
                >
                  <span className="text-sm font-semibold text-slate-800">{g.groupName}</span>
                  {expanded === g.groupId ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                </button>
                {expanded === g.groupId && (
                  <div className="mt-2 space-y-2 px-1">
                    {g.parameters.map((p) => (
                      <div key={p.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{p.parameter.name}</p>
                          <p className="text-[10px] text-slate-400">{p.date_of_test}</p>
                        </div>
                        <p className="text-sm font-bold text-slate-900">{p.test_value} <span className="text-xs text-slate-500 font-normal">{p.parameter.unit}</span></p>
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
  const uniqueGroups = new Set(rawList.map(r => r.group_id)).size;
  const uniqueTypes = new Set(rawList.map(r => r.test_type.id)).size;
  const uniqueParams = new Set(rawList.map(r => r.parameter_id)).size;
  const latestDate = rawList.length > 0 ? [...rawList].sort((a, b) => new Date(b.date_of_test).getTime() - new Date(a.date_of_test).getTime())[0].date_of_test : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 text-center shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Tests</p>
          <p className="text-2xl font-black text-slate-900">{totalTests}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 text-center shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Groups</p>
          <p className="text-2xl font-black text-slate-900">{uniqueGroups}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 text-center shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Test Types</p>
          <p className="text-2xl font-black text-slate-900">{uniqueTypes}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 text-center shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Parameters</p>
          <p className="text-2xl font-black text-slate-900">{uniqueParams}</p>
        </div>
      </div>
      {latestDate && (
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Latest Test Date</p>
          <p className="text-lg font-bold text-slate-900">{latestDate}</p>
        </div>
      )}
    </div>
  );
}

function CompareView({ rawList }: { rawList: LabReport[] }) {
  if (rawList.length === 0) {
    return <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 text-center"><p className="text-sm font-bold text-slate-600">No data to compare.</p></div>;
  }
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <p className="text-sm font-semibold text-slate-500 mb-3">Select parameters to compare across dates.</p>
      <div className="space-y-2">
        {Array.from(new Set(rawList.map(r => r.parameter.name))).slice(0, 8).map((name) => (
          <div key={name} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2">
            <span className="text-sm font-medium text-slate-800">{name}</span>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">Compare</span>
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
  const activeTab = (searchParams.get('tab') as 'reports' | 'groupWise' | 'analysis' | 'compare') || 'reports';

  const { data: groupedReports, rawList, loading, error, refetch } = useLabReports(token || null);

  const trendCards = useMemo(() => {
    const parameterMap = new Map<string, LabReport[]>();

    rawList.forEach((report) => {
      const key = report.parameter_id;
      if (!parameterMap.has(key)) {
        parameterMap.set(key, []);
      }
      parameterMap.get(key)!.push(report);
    });

    return Array.from(parameterMap.values())
      .map((records) => {
        const sortedRecords = [...records].sort(
          (a, b) => new Date(b.date_of_test).getTime() - new Date(a.date_of_test).getTime(),
        );

        const current = sortedRecords[0];
        const previous = sortedRecords[1];
        const currentNumeric = Number.parseFloat(current.test_value);
        const previousNumeric = previous ? Number.parseFloat(previous.test_value) : null;

        const hasDelta =
          Number.isFinite(currentNumeric) &&
          previousNumeric !== null &&
          Number.isFinite(previousNumeric);

        const delta = hasDelta ? currentNumeric - previousNumeric : null;

        const direction: TrendDirection =
          delta === null ? 'flat' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';

        return {
          key: `${current.parameter_id}-${current.test_id}`,
          testId: current.test_id,
          keyword: current.test_type.key_word,
          name: current.parameter.name,
          unit: current.parameter.unit || '-',
          previousValue: previous?.test_value ?? '—',
          currentValue: current.test_value,
          delta,
          direction,
          latestDate: current.date_of_test,
        };
      })
      .sort((a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime());
  }, [rawList]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-4xl mx-auto bg-white min-h-screen pb-24">
        
        {/* Patient Header - Light Premium Mode */}
        <div className="px-6 pt-8 pb-6 relative z-10 bg-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-[2px] shadow-lg shadow-blue-500/30">
                  <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
                    <Heart size={22} className="text-blue-600" />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-[3px] border-white shadow-sm"></div>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase mb-1">Health Dashboard</p>
                <p className="text-2xl font-black text-slate-900 m-0 tracking-tight leading-none">My Reports</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={refetch} className="w-11 h-11 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center relative hover:bg-slate-100 transition-colors shadow-sm" title="Refresh">
                <RefreshCw size={18} className={`text-slate-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
              {/* <button onClick={openSidebar} className="w-11 h-11 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center relative hover:bg-slate-100 transition-colors shadow-sm" title="Menu">
                <Menu size={18} className="text-slate-600" />
              </button> */}
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
        </div>

        <div className="px-6 pb-24 relative z-10">
          <div className="animate-fade-in space-y-6">
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 size={36} className="text-blue-500 animate-spin" />
                <p className="text-sm font-semibold text-slate-500">Fetching your lab reports...</p>
              </div>
            )}

            {!loading && error && (
              <div className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-6 text-center">
                <p className="text-sm font-bold text-rose-600 mb-3">{error}</p>
                <button onClick={refetch} className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 mx-auto">
                  <RefreshCw size={14} /> Retry
                </button>
              </div>
            )}

            {!loading && !error && !token && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 text-center">
                <p className="text-sm font-bold text-amber-700">No access token found.</p>
                <p className="text-xs text-amber-600 mt-1">Open this app with a valid <code className="bg-amber-100 px-1 rounded">?token=</code> URL parameter.</p>
              </div>
            )}

            {!loading && !error && activeTab === 'reports' && trendCards.length > 0 && (
              <div className="space-y-4">
                {trendCards.map((card) => {
                  const tone = trendTone(card.direction);
                  return (
                    <div
                      key={card.key}
                      className={`group relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)] backdrop-blur-sm ${tone.cardHover} hover:-translate-y-1 transition-all duration-300 cursor-pointer`}
                      onClick={() => navigate(`/report/${card.testId}`)}
                    >
                      <div className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br blur-2xl transition-transform duration-500 group-hover:scale-125 ${tone.surfaceGlow}`}></div>
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent"></div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shadow-sm ${tone.iconTone}`}>
                            {testTypeIcon(card.keyword)}
                          </div>
                          <div>
                            <p className="text-[15px] font-extrabold text-slate-900 m-0 tracking-tight leading-none">{card.name}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.16em] m-0 mt-1">{card.unit}</p>
                          </div>
                        </div>
                      </div>
                      <div className={`relative rounded-2xl border px-4 py-4 text-center ${tone.valuePanel}`}>
                        <div>
                          <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-1 ${tone.currentLabel}`}>Current Value</p>
                          <p className={`text-2xl font-mono font-black leading-none ${tone.current}`}>{card.currentValue}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && !error && activeTab === 'reports' && trendCards.length === 0 && (
              <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 text-center">
                <p className="text-sm font-bold text-slate-600">No report items found.</p>
              </div>
            )}

            {!loading && !error && activeTab === 'groupWise' && <GroupWiseView groupedReports={groupedReports} />}
            {!loading && !error && activeTab === 'analysis' && <AnalysisView rawList={rawList} />}
            {!loading && !error && activeTab === 'compare' && <CompareView rawList={rawList} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
