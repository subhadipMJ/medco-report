import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ReportDetail from './components/ReportDetail';

function AppRoutes() {
  const location = useLocation();
  // const searchParams = new URLSearchParams(location.search);
  const TEST_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiYTVlZDkzODAwODEwNmE2ZDUyNTU2NjMxNjMzNGVlM2U1ODg3Nzg4ODVkZmE3MDM2YWY3MmE3MzIzYzdmZTE2ZGRlYTdkMzgyYTQ0YzgyNjAiLCJpYXQiOjE3ODAyOTg5NTEuNDQ0MjcxLCJuYmYiOjE3ODAyOTg5NTEuNDQ0MjcyLCJleHAiOjE4MTE4MzQ5NTEuNDM4OTI0LCJzdWIiOiI0NjA0Iiwic2NvcGVzIjpbXX0.lEIW0IjEeHRuCoM1W943aRPzDS1OUBEx2SWatXFwoqjTI7C1YJTF-7iduVQ9YudJ-q1Gd-KujuQHS9NiWBIBZvT6-fw9bQomoENFmIN1H6LizQt535sFwLHBmrDvYKyzEe-amXPqo3zulQ6l8ff0j-3M6U7Fx0wcHjnu8WJl5PDThZ0OyaOOd8jrmubVVs7ibj5Gx39JusWkcpiBniI7GOkXV-_EfEwsAki3lrHGXkLpqqWTfCldh44xJh76TULsjuHOQAP1nIdNLo0b4hH-IYLp1cTdUFEq-Jnp_SPsNTUbqOQP74a5LZDm-_dZlJIruHvKY3PT_Th5iVdkFfJx6cdt-_vOAr1vZ03p_hnVHYcbWUx-RkCko_3RtSGvuPfFRMPCqUzNuwRnH1qY9x--CaEGPEIDRFAfaaQGbs7tSVIHVI2WQnS6rRlaN2A2OCHuiISLaj_d6Nfnc8k6-aL_tdYixRuqg9zxQ1szkFdObKK2pz3UEOso2vn4q-vjakkMUAtl_CqZFWMJBI4tGADsrOledYwqy4GIKpbW8OSKFK24GV4MmcYawzvt774VW-whEwP4C3NbIy4T4IjWNXSA9Y7DfP3CTKcUCPctekrU1dCSI6Sn90qlC0X4PJ0YBrhL5vylDhPyu-0soAncJAJK8BURe8eu7veiYDDGZNxpLtM';
  const token = TEST_TOKEN;
  // const token = searchParams.get('token') || localStorage.getItem('medco_token') || TEST_TOKEN;

  if (token) {
    localStorage.setItem('medco_token', token);
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard token={token} />} />
      <Route path="/report/:id" element={<ReportDetail />} />
      <Route path="*" element={<Navigate to={`/${location.search}`} replace />} />
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
      <div className="md:hidden min-h-screen bg-slate-50 text-slate-900">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;
