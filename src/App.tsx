import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ReportDetail from './components/ReportDetail';

function AppRoutes() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const TEST_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiOGQ4OWE3ODZmMmRiNmViZjYyYWRmZjc5Njg5ZjIyMmZkMGQwNjg3ZDA4MmE2MWQ4MWM5ZGU3MWE4NWFlMGNlNzQ0MDk0MTBkNGRhZmM1NDMiLCJpYXQiOjE3Nzg1ODU0MTAuMjU0NjIsIm5iZiI6MTc3ODU4NTQxMC4yNTQ2MjMsImV4cCI6MTgxMDEyMTQxMC4yNDcxOSwic3ViIjoiNDYwNCIsInNjb3BlcyI6W119.b8SlGR7OrmAh4-ySpcFCWudns7jUtf68BroStaiL5JgZdke3OTKwotG9Adizb6WJxxxAWdC6dPGPMYCv9H2uKwY9zkk6ELtEWVrI2vAXICYGZEQQIsBaaN6xPDdiC-Z2OTDOlDhjStK6KLYJbg9MYTaWLSQQekSygmr6Qe2kBEsQWwiLUOxuOAoHgBtU4gaIVa0e1Zv7jR2hNNafbp045r_cC4UTKYphpCGcGmPX0B1yl-c5WS3vtwk5O1ImLuQwMN3uLBISsjLjqkg5jbjt9bN-3XQIKdeZRystqoCGnzOISQpXNkh41Y3opZkcRwbzhdA9tAy4vO984Kn9843LPY1elyDznRIqoPuDy87kV1wRpNxTp4BTG8rFNgLfiOe7BrGN3RqxM7qfRwjrQswRLTtjJvSikfZwzNgJeTqVIAgZdHFt2Eg4VJqSl6AynSkpkXkfNWGKKPIPnQLKcLarjTK51r0FRiB_KlvkpIADfQ89YC27tAseGnVs0V4EcmiKu3hgvQ2yzIOL0nN422KgRFHM4gXfjz2wFgoaqmM8pPPlFX1X_09hiCRWQPXA8oyHRJj_qfklIWGChC3RAA-pNlabBGnVw0AqjI4NvvzC5yH5j5pW8W2hyZtW3VRdOgJOIGuNA8JjQ2Z6Ef7KDv-pfKr-XTB2s6I-2G9ZFO_WCLc';
  const token = searchParams.get('token') || localStorage.getItem('medco_token') || TEST_TOKEN;

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
