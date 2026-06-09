import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ReportDetail from './components/ReportDetail';
import { FileText, LayoutGrid, BarChart3, GitCompare } from 'lucide-react';
import Analaytics from './components/Analaytics';

function GlobalBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  // ✅ FIX 1: Always read from localStorage first (it's kept in sync now)
  const token = localStorage.getItem('token') || searchParams.get('token') || '';
  const tabParam = searchParams.get('tab');
  const activeTab =
    location.pathname === '/analaytics'
      ? 'analysis'
      : tabParam === 'reports' || tabParam === 'groupWise' || tabParam === 'analysis' || tabParam === 'compare'
        ? tabParam
        : 'reports';

  const navigateToTab = (tab: 'reports' | 'groupWise' | 'compare') => {
    const next = new URLSearchParams();
    next.set('token', token);
    next.set('tab', tab);
    navigate(`/?${next.toString()}`);
  };

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-48px)] max-w-md -translate-x-1/2">
      <div className="flex justify-between rounded-[24px] border border-slate-200 bg-white/90 p-2 shadow-[0_20px_40px_rgba(0,0,0,0.1)] backdrop-blur-xl">
        <button
          onClick={() => navigateToTab('reports')}
          className={`flex flex-1 flex-col items-center gap-1 rounded-2xl p-2 transition-all ${
            activeTab === 'reports'
              ? 'bg-blue-50 text-blue-600'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileText size={20} strokeWidth={activeTab === 'reports' ? 2.5 : 2} />
          <span className="text-[10px] font-bold tracking-wide">Reports</span>
        </button>
        <button
          onClick={() => navigateToTab('groupWise')}
          className={`flex flex-1 flex-col items-center gap-1 rounded-2xl p-2 transition-all ${
            activeTab === 'groupWise'
              ? 'bg-blue-50 text-blue-600'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <LayoutGrid size={20} strokeWidth={activeTab === 'groupWise' ? 2.5 : 2} />
          <span className="text-[10px] font-bold tracking-wide">Group Wise</span>
        </button>
        <button
          onClick={() => {
            const next = new URLSearchParams();
            next.set('token', token);
            navigate(`/analaytics?${next.toString()}`);
          }}
          className={`flex flex-1 flex-col items-center gap-1 rounded-2xl p-2 transition-all ${
            activeTab === 'analysis'
              ? 'bg-blue-50 text-blue-600'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <BarChart3 size={20} strokeWidth={activeTab === 'analysis' ? 2.5 : 2} />
          <span className="text-[10px] font-bold tracking-wide">Analysis</span>
        </button>
        <button
          onClick={() => navigateToTab('compare')}
          className={`flex flex-1 flex-col items-center gap-1 rounded-2xl p-2 transition-all ${
            activeTab === 'compare'
              ? 'bg-blue-50 text-blue-600'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <GitCompare size={20} strokeWidth={activeTab === 'compare' ? 2.5 : 2} />
          <span className="text-[10px] font-bold tracking-wide">Compare</span>
        </button>
      </div>
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const urlToken = searchParams.get('token');

  // ✅ FIX 2: Uncomment and always save token to localStorage
  // when it arrives from the URL (Flutter passes it here).
  // Without this, every API call falls back to the hardcoded
  // expired token and gets a 401.
  if (urlToken) {
    localStorage.setItem('token', urlToken);
  }

  // ✅ FIX 3: Remove the hardcoded expired token fallback entirely.
  // If there's no token at all, the user needs to log in again.
  const token = urlToken || localStorage.getItem('token') || '';

  // Always keep token param visible in URL
  if (!searchParams.has('token')) {
    const newParams = new URLSearchParams(location.search);
    newParams.set('token', token);
    return <Navigate to={`${location.pathname}?${newParams.toString()}`} replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard token={token} />} />
      <Route path="/report/:id" element={<ReportDetail token={token} />} />
      <Route path="/analaytics" element={<Analaytics token={token} />} />
      <Route
        path="*"
        element={<Navigate to={`${location.pathname}${location.search}`} replace />}
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      {/* Desktop fallback */}
      <div className="hidden md:flex min-h-screen bg-slate-100 items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold text-slate-700">Please open on a mobile device.</p>
          <p className="text-sm text-slate-500 mt-2">This app is designed for mobile screens.</p>
        </div>
      </div>

      {/* Mobile App View */}
      <div className="md:hidden min-h-screen bg-slate-50 pb-28 text-slate-900">
        <AppRoutes />
        <GlobalBottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
