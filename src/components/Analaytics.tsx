import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Activity, Droplet, Search, FileText, ChevronDown, CheckCircle2, TrendingUp, ArrowUpRight, ArrowDownRight, ArrowRight, History, RefreshCw, FlaskConical, TestTube2, Loader2 } from 'lucide-react';
import { useNavigateWithToken } from '../hooks/useNavigateWithToken';
import { useLabReports } from '../hooks/useLabReports';
import Header from './Header';

const testTypeIcon = (keyword: string) => {
  switch (keyword) {
    case 'blood_test': return <Droplet size={20} />;
    case 'urine_test': return <FlaskConical size={20} />;
    case 'molecular_body_fluid': return <TestTube2 size={20} />;
    default: return <Activity size={20} />;
  }
};

const testTypeColor = (keyword: string) => {
  switch (keyword) {
    case 'blood_test': return { bg: 'bg-rose-50', text: 'text-rose-500', border: 'border-rose-200', hover: 'hover:border-rose-300' };
    case 'urine_test': return { bg: 'bg-amber-50', text: 'text-amber-500', border: 'border-amber-200', hover: 'hover:border-amber-300' };
    case 'molecular_body_fluid': return { bg: 'bg-purple-50', text: 'text-purple-500', border: 'border-purple-200', hover: 'hover:border-purple-300' };
    default: return { bg: 'bg-blue-50', text: 'text-blue-500', border: 'border-blue-200', hover: 'hover:border-blue-300' };
  }
};

interface DashboardProps {
  token: string;
}

const Analaytics = ({ token }: DashboardProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryTab = searchParams.get('tab');
  const defaultTab =
    queryTab === 'reports' || queryTab === 'compare' || queryTab === 'rx'
      ? queryTab
      : 'compare';
  const [activeTab, setActiveTab] = useState<'reports' | 'compare' | 'rx'>('compare');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const navigate = useNavigateWithToken();

  const { data: groupedReports, rawList, loading, error, refetch } = useLabReports(token || null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const onTabChange = (tab: 'reports' | 'compare' | 'rx') => {
    setActiveTab(tab);
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    if (!next.has('token') && token) {
      next.set('token', token);
    }
    setSearchParams(next, { replace: true });
  };

  const totalReports = rawList.length;
  const uniqueGroups = groupedReports.reduce((acc, tt) => acc + tt.groups.length, 0);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-4xl mx-auto bg-white min-h-screen pb-24">
        
        <Header
          token={token}
          title="Analytics"
          onRefresh={refetch}
          isRefreshing={loading}
        />

          {/* Health Score Card - Neumorphic Light */}
          <div className="group bg-white border border-slate-100 hover:border-blue-100 rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(59,130,246,0.08)] hover:-translate-y-1 transition-all duration-500 mb-6 relative overflow-hidden">
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
                <p className="text-sm font-black text-slate-800">{loading ? '—' : groupedReports.length}</p>
              </div>
            </div>

          {/* Segmented Control */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 relative z-10">
            <button 
              onClick={() => onTabChange('reports')}
              className={`flex-1 py-3 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === 'reports' ? 'bg-white text-blue-600 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <FileText size={16} /> Insights
            </button>
            <button 
              onClick={() => onTabChange('compare')}
              className={`flex-1 py-3 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === 'compare' ? 'bg-white text-blue-600 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <Activity size={16} /> Analytics
            </button>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="px-6 pb-24 relative z-10">
          {activeTab === 'reports' && (
            <div className="animate-fade-in space-y-6">

              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 size={36} className="text-blue-500 animate-spin" />
                  <p className="text-sm font-semibold text-slate-500">Fetching your lab reports...</p>
                </div>
              )}

              {/* Error State */}
              {!loading && error && (
                <div className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-6 text-center">
                  <p className="text-sm font-bold text-rose-600 mb-3">{error}</p>
                  <button onClick={refetch} className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 mx-auto">
                    <RefreshCw size={14} /> Retry
                  </button>
                </div>
              )}

              {/* No Token State */}
              {!loading && !error && !token && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 text-center">
                  <p className="text-sm font-bold text-amber-700">No access token found.</p>
                  <p className="text-xs text-amber-600 mt-1">Open this app with a valid <code className="bg-amber-100 px-1 rounded">?token=</code> URL parameter.</p>
                </div>
              )}

              {/* Real Data */}
              {!loading && !error && groupedReports.map((testTypeGroup, ttIdx) => {
                const colors = testTypeColor(testTypeGroup.testType.key_word);
                return (
                  <div key={testTypeGroup.testType.id} className="animate-slide-up" style={{ animationDelay: `${ttIdx * 80}ms` }}>
                    {/* Test Type Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-8 h-8 rounded-xl ${colors.bg} ${colors.text} border-2 ${colors.border} flex items-center justify-center`}>
                        {testTypeIcon(testTypeGroup.testType.key_word)}
                      </div>
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest m-0">{testTypeGroup.testType.name}</h3>
                      <div className={`h-[2px] flex-1 bg-gradient-to-r from-slate-200 to-transparent`}></div>
                      <span className={`text-[10px] font-black px-2 py-1 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>{testTypeGroup.groups.length} groups</span>
                    </div>

                    {/* Groups within Test Type */}
                    <div className={`bg-white border-2 border-slate-200 ${colors.hover} rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all duration-500`}>
                      {testTypeGroup.groups.map((group, gIdx) => {
                        const expandKey = `${testTypeGroup.testType.id}-${group.groupId}`;
                        return (
                          <div key={group.groupId} className={gIdx !== 0 ? 'border-t-2 border-slate-100' : ''}>
                            <button
                              onClick={() => toggleExpand(expandKey)}
                              className="w-full px-6 py-5 bg-transparent border-none flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                            >
                              <div className="flex items-center gap-4 text-left">
                                <div className={`w-11 h-11 rounded-xl ${colors.bg} border-2 ${colors.border} flex items-center justify-center ${colors.text}`}>
                                  <CheckCircle2 size={20} />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-900 m-0">{group.groupName}</p>
                                  <p className="text-[11px] font-semibold text-slate-400 m-0 mt-0.5 uppercase tracking-wide">{group.parameters.length} params · {group.latestDate}</p>
                                </div>
                              </div>
                              <div className={`w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center transition-transform duration-300 ${expandedId === expandKey ? 'rotate-180' : ''}`}>
                                <ChevronDown size={16} className="text-slate-400" />
                              </div>
                            </button>

                            {/* Expanded Parameters */}
                            <div className={`transition-all duration-300 ease-in-out bg-slate-50 ${expandedId === expandKey ? 'max-h-[800px] opacity-100 py-5' : 'max-h-0 opacity-0 py-0 overflow-hidden'}`}>
                              <div className="px-5">
                                <div className="mb-3 flex items-center gap-2">
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest m-0">Lab: {group.labName}</p>
                                  <span className="text-slate-300">·</span>
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest m-0">Dr. {group.doctorName}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                  {group.parameters.map(param => (
                                    <div key={param.id} className={`bg-white rounded-2xl p-4 border-2 border-slate-200 hover:${colors.border} shadow-sm cursor-pointer transition-all`} onClick={() => navigate(`/report/${param.test_id}`)}>
                                      <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-2 leading-tight">{param.parameter.name}</p>
                                      <p className="text-[18px] font-black text-slate-900 font-mono m-0 leading-none">
                                        {param.test_value}
                                        <span className="text-[10px] text-slate-400 font-sans ml-1">{param.parameter.unit}</span>
                                      </p>
                                      <p className="text-[9px] text-slate-400 mt-1 m-0">{param.date_of_test}</p>
                                    </div>
                                  ))}
                                </div>
                                {group.parameters[0]?.test_report && (
                                  <a
                                    href={group.parameters[0].test_report}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-full py-3 bg-white hover:${colors.bg} border-2 ${colors.border} ${colors.text} rounded-2xl text-[12px] font-bold flex items-center justify-center gap-2 transition-all shadow-sm`}
                                  >
                                    <Search size={14} /> View Report Document
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'compare' && (
            <div className="animate-fade-in space-y-6">
              
              {/* Comparison Header Card */}
              <div className="group relative bg-white border-2 border-blue-200 hover:border-blue-300 rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(59,130,246,0.08)] transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 blur-2xl rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className="flex items-center justify-between relative z-10 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border-2 border-blue-200 text-blue-500 flex items-center justify-center">
                      <History size={24} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 m-0">Historical Trend</h3>
                      <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">Oct 2023 vs Nov 2023</p>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black tracking-widest uppercase border-2 border-emerald-200 flex items-center gap-1.5">
                    <TrendingUp size={12} />
                    Improving
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 leading-relaxed m-0 relative z-10">
                  Your overall health metrics show a <strong className="text-emerald-600">positive trend</strong>. Vitamin D levels have improved by 50%, though Thyroid (TSH) still requires monitoring.
                </p>
              </div>

              {/* Key Changes List */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest m-0">Key Changes</h3>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-blue-200 to-transparent"></div>
                </div>

                {/* Item 1: TSH (Worse) */}
                <div className="group relative bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:border-rose-300 hover:shadow-[0_8px_30px_rgba(244,63,94,0.06)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 border-2 border-rose-200 text-rose-500 flex items-center justify-center">
                        <Activity size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 m-0">Thyroid (TSH)</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider m-0 mt-0.5">mIU/L</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-rose-500 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
                      <ArrowUpRight size={14} />
                      <span className="text-xs font-bold">+0.3</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between relative">
                    <div className="flex-1 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Previous</p>
                      <p className="text-xl font-mono font-black text-slate-400">4.8</p>
                    </div>
                    <div className="w-12 flex justify-center text-slate-300">
                      <ArrowRight size={20} className="group-hover:text-slate-400 transition-colors" />
                    </div>
                    <div className="flex-1 text-center">
                      <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1">Current</p>
                      <p className="text-xl font-mono font-black text-rose-500">5.1</p>
                    </div>
                  </div>
                </div>

                {/* Item 2: Vitamin D (Better) */}
                <div className="group relative bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:border-emerald-300 hover:shadow-[0_8px_30px_rgba(16,185,129,0.06)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 border-2 border-amber-200 text-amber-500 flex items-center justify-center">
                        <Droplet size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 m-0">Vitamin D</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider m-0 mt-0.5">ng/mL</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                      <ArrowUpRight size={14} />
                      <span className="text-xs font-bold">+6.0</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between relative">
                    <div className="flex-1 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Previous</p>
                      <p className="text-xl font-mono font-black text-slate-400">12.0</p>
                    </div>
                    <div className="w-12 flex justify-center text-slate-300">
                      <ArrowRight size={20} className="group-hover:text-slate-400 transition-colors" />
                    </div>
                    <div className="flex-1 text-center">
                      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Current</p>
                      <p className="text-xl font-mono font-black text-emerald-500">18.0</p>
                    </div>
                  </div>
                </div>

                {/* Item 3: Total Cholesterol (Better) */}
                <div className="group relative bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:border-emerald-300 hover:shadow-[0_8px_30px_rgba(16,185,129,0.06)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border-2 border-blue-200 text-blue-500 flex items-center justify-center">
                        <Activity size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 m-0">Total Cholesterol</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider m-0 mt-0.5">mg/dL</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                      <ArrowDownRight size={14} />
                      <span className="text-xs font-bold">-15.0</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between relative">
                    <div className="flex-1 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Previous</p>
                      <p className="text-xl font-mono font-black text-slate-400">210</p>
                    </div>
                    <div className="w-12 flex justify-center text-slate-300">
                      <ArrowRight size={20} className="group-hover:text-slate-400 transition-colors" />
                    </div>
                    <div className="flex-1 text-center">
                      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Current</p>
                      <p className="text-xl font-mono font-black text-emerald-500">195</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analaytics;
