import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ReportDetail from './components/ReportDetail';
import Compare from './components/Compare';
import GroupWise from './components/GroupWise';
import Analaytics from './components/Analaytics';
import Prescription from './components/Prescription';
import Profile from './components/Profile';
import AddReport from './components/AddReport';
import SelectTest from './components/SelectTest';

function AppRoutes() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const urlToken = searchParams.get('token');

  if (urlToken) {
    localStorage.setItem('token', urlToken);
  }

  const token = urlToken || localStorage.getItem('token') || '';

  if (!searchParams.has('token')) {
    const newParams = new URLSearchParams(location.search);
    newParams.set('token', token);
    return <Navigate to={`${location.pathname}?${newParams.toString()}`} replace />;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard token={token} />} />
        <Route path="/groupWise" element={<GroupWise token={token} />} />
        <Route path="/report/:id" element={<ReportDetail token={token} />} />
        <Route path="/analaytics" element={<Analaytics token={token} />} />
        <Route path="/compare" element={<Compare token={token} />} />
        <Route path="/prescription" element={<Prescription token={token} />} />
        <Route path="/profile" element={<Profile token={token} />} />
        <Route path="/add-report" element={<AddReport token={token} />} />
        <Route path="/select-test" element={<SelectTest token={token} />} />
      </Route>
      <Route
        path="*"
        element={<Navigate to={`${location.pathname}${location.search}`} replace />}
      />
    </Routes>
  );
}

function App() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '');
  return (
    <BrowserRouter basename={basename}>
      {/* Desktop fallback */}
      <div className="hidden xl:flex min-h-screen bg-slate-100 items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold text-slate-700">Please open on a mobile device.</p>
          <p className="text-sm text-slate-500 mt-2">This app is designed for mobile screens.</p>
        </div>
      </div>

      {/* Mobile App View */}
      <div className="xl:hidden min-h-screen bg-slate-50 pb-28 text-slate-900">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;
