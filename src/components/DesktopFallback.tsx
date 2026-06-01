const DesktopFallback = () => {
  return (
    <div className="text-center p-8 max-w-md mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Mobile Only Experience</h1>
        <p className="text-slate-600 mb-6">
          This health dashboard is designed exclusively for mobile devices. Please open this link on your smartphone to view your health reports.
        </p>
        <div className="flex justify-center text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
            <line x1="12" y1="18" x2="12.01" y2="18"></line>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default DesktopFallback;
