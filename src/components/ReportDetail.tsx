import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Activity, User, HeartPulse, ShieldAlert } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { reportsData } from '../data/advancedMockData';

const generateHistoricalData = (currentValue: number | string | undefined, isCritical: boolean) => {
  if (typeof currentValue !== 'number') return [];
  const base = currentValue;
  const variance = isCritical ? base * 0.15 : base * 0.05;
  
  return [
    { date: 'Oct', value: Number((base - variance * 1.5).toFixed(1)) },
    { date: 'Nov', value: Number((base - variance * 0.5).toFixed(1)) },
    { date: 'Dec', value: Number((base + variance * 0.8).toFixed(1)) },
    { date: 'Jan', value: Number((base - variance * 0.2).toFixed(1)) },
    { date: 'Feb', value: Number((base + variance * 1.2).toFixed(1)) },
    { date: 'Mar', value: Number((base - variance * 0.4).toFixed(1)) },
    { date: 'Apr', value: base },
  ];
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-100 p-3 rounded-xl shadow-xl text-xs font-sans">
        <p className="text-slate-500 mb-1 font-bold tracking-widest uppercase">{label} 2026</p>
        <div className="flex items-baseline gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <p className="font-mono text-xl font-black text-slate-900">{payload[0].value}</p>
        </div>
      </div>
    );
  }
  return null;
};

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const report = reportsData.find(r => r.id === id);

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 font-sans">
        <p className="text-slate-500 font-bold mb-4">Report not found</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl font-bold transition-all border border-blue-200">
          Return Home
        </button>
      </div>
    );
  }

  // If it's a normal report, use the first subReport for the graph
  const displayValue = report.type === 'critical' ? report.value : report.subReports?.[0]?.value;
  const displayUnit = report.type === 'critical' ? report.unit : report.subReports?.[0]?.unit;
  const displayRef = report.type === 'critical' ? report.referenceRange : report.subReports?.[0]?.reference;
  const displayTitle = report.type === 'critical' ? report.title : `${report.title} - ${report.subReports?.[0]?.name}`;
  
  const isCritical = report.status === 'Critical' || report.status === 'Warning';
  const historicalData = generateHistoricalData(displayValue, isCritical);
  
  const themeColor = report.status === 'Critical' ? '#f43f5e' : report.status === 'Warning' ? '#f59e0b' : '#10b981';
  const themeBg = report.status === 'Critical' ? 'bg-rose-50' : report.status === 'Warning' ? 'bg-amber-50' : 'bg-emerald-50';
  const themeText = report.status === 'Critical' ? 'text-rose-600' : report.status === 'Warning' ? 'text-amber-600' : 'text-emerald-600';
  const themeBorder = report.status === 'Critical' ? 'border-rose-200' : report.status === 'Warning' ? 'border-amber-200' : 'border-emerald-200';

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-4xl mx-auto bg-white min-h-screen">
        
        {/* Header */}
        <div className="sticky top-0 z-30 px-6 pt-10 pb-4 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-slate-100">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 hover:bg-slate-100 transition-all shadow-sm"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <h1 className="text-sm font-black text-slate-900 flex-1 text-center truncate px-4 uppercase tracking-widest">
            Analytics
          </h1>
          <button className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 hover:bg-slate-100 transition-all shadow-sm">
            <Share2 size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="px-6 mt-6 pb-12 animate-slide-up relative z-10">
          
          {/* Title Card - Clean Light Theme */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl mb-6 relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className={`absolute top-0 right-0 w-32 h-32 ${themeBg} blur-2xl rounded-full pointer-events-none`}></div>
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-2 ${themeBg} ${themeText} border ${themeBorder}`}>
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${report.status === 'Critical' ? 'bg-rose-500' : report.status === 'Warning' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                {report.status}
              </div>
              <span className="text-[10px] text-slate-500 font-bold font-mono bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg uppercase tracking-wider">{report.date}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 leading-tight mb-3 relative z-10">
              {displayTitle}
            </h2>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-500 relative z-10">
              <p className="flex items-center gap-1.5"><User size={14} className="text-slate-400" /> {report.doctor}</p>
              <p className="flex items-center gap-1.5"><ShieldAlert size={14} className="text-slate-400" /> {report.facility}</p>
            </div>
          </div>

          {/* Value Display Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-5 rounded-3xl border border-slate-100 relative overflow-hidden">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Current Read</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-4xl font-black font-mono leading-none ${themeText}`}>
                  {displayValue}
                </span>
                <span className={`text-xs font-bold ${themeText} opacity-80`}>{displayUnit}</span>
              </div>
            </div>
            
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex flex-col justify-center relative overflow-hidden">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Target Range</p>
              <p className="text-xl font-black text-slate-700 font-mono leading-none">{displayRef}</p>
              <p className="text-[10px] text-slate-500 font-bold mt-2">{displayUnit}</p>
            </div>
          </div>

          {/* Interactive Chart Area */}
          <div className="bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 rounded-3xl border border-slate-100 mb-6 relative overflow-hidden">
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Timeline</h3>
              <span className="text-[10px] font-bold tracking-widest uppercase bg-slate-50 text-slate-500 px-3 py-1.5 rounded-full border border-slate-100">6 Months</span>
            </div>
            
            <div className="h-[220px] w-full ml-[-15px] relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={themeColor} stopOpacity={0.2}/>
                      <stop offset="100%" stopColor={themeColor} stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700, fontFamily: 'monospace' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700, fontFamily: 'monospace' }}
                    domain={['dataMin - 1', 'dataMax + 1']}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={themeColor} 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    activeDot={{ r: 6, fill: '#fff', strokeWidth: 3, stroke: themeColor }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Clinical Insight Box - Clean Light Style */}
          <div className={`${themeBg} border border-l-4 ${themeBorder} p-5 rounded-2xl flex gap-4 items-start shadow-sm`} style={{ borderLeftColor: themeColor }}>
            <div className={`p-2 rounded-xl bg-white shrink-0 border ${themeBorder} shadow-sm`}>
              <HeartPulse size={20} color={themeColor} />
            </div>
            <div>
              <h4 className={`text-xs font-black tracking-wider mb-2 uppercase ${themeText}`}>Clinical Intelligence</h4>
              <p className="text-xs leading-relaxed text-slate-700 font-medium">
                {report.description || `Biomarker analysis indicates ${displayTitle} levels are tracking within the optimal physiological baseline. Maintain current lifestyle protocols.`}
              </p>
            </div>
          </div>
          
          {/* Action Button */}
          <button className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 uppercase tracking-widest hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <Activity size={18} strokeWidth={2.5} /> Execute Full Comparison
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
