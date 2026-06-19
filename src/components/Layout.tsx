import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { FileText, LayoutGrid, GitCompare, Pill } from "lucide-react";

function GlobalBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const token = localStorage.getItem("token") || searchParams.get("token") || "";

  const activeTab =
    location.pathname === "/" || location.pathname.startsWith("/report")
      ? "reports"
      : location.pathname === "/groupWise"
        ? "groupWise"
        : location.pathname === "/compare"
          ? "compare"
          : location.pathname === "/prescription"
            ? "prescription"
            : location.pathname === "/analaytics"
              ? "analysis"
              : location.pathname === "/profile"
                ? "profile"
                : "reports";

  const goTo = (path: string) => {
    const next = new URLSearchParams();
    next.set("token", token);
    navigate(`${path}?${next.toString()}`);
  };

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-48px)] max-w-md -translate-x-1/2">
      <div className="flex justify-between rounded-[24px] border border-slate-200 bg-white/90 p-2 shadow-[0_20px_40px_rgba(0,0,0,0.1)] backdrop-blur-xl">
        <button
          onClick={() => goTo("/")}
          className={`flex flex-1 flex-col items-center gap-1 rounded-2xl p-2 transition-all ${
            activeTab === "reports"
              ? "bg-blue-50 text-blue-600"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <FileText size={20} strokeWidth={activeTab === "reports" ? 2.5 : 2} />
          <span className="text-[10px] font-bold tracking-wide">Reports</span>
        </button>
        <button
          onClick={() => goTo("/groupWise")}
          className={`flex flex-1 flex-col items-center gap-1 rounded-2xl p-2 transition-all ${
            activeTab === "groupWise"
              ? "bg-blue-50 text-blue-600"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <LayoutGrid size={20} strokeWidth={activeTab === "groupWise" ? 2.5 : 2} />
          <span className="text-[10px] font-bold tracking-wide">Group Wise</span>
        </button>
        <button
          onClick={() => goTo("/compare")}
          className={`flex flex-1 flex-col items-center gap-1 rounded-2xl p-2 transition-all ${
            activeTab === "compare"
              ? "bg-blue-50 text-blue-600"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <GitCompare size={20} strokeWidth={activeTab === "compare" ? 2.5 : 2} />
          <span className="text-[10px] font-bold tracking-wide">Compare</span>
        </button>
        <button
          onClick={() => goTo("/prescription")}
          className={`flex flex-1 flex-col items-center gap-1 rounded-2xl p-2 transition-all ${
            activeTab === "prescription"
              ? "bg-blue-50 text-blue-600"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Pill size={20} strokeWidth={activeTab === "prescription" ? 2.5 : 2} />
          <span className="text-[10px] font-bold tracking-wide">My Prescription</span>
        </button>
        {/* <button
          onClick={() => goTo("/profile")}
          className={`flex flex-1 flex-col items-center gap-1 rounded-2xl p-2 transition-all ${
            activeTab === "profile"
              ? "bg-blue-50 text-blue-600"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <User size={20} strokeWidth={activeTab === "profile" ? 2.5 : 2} />
          <span className="text-[10px] font-bold tracking-wide">Profile</span>
        </button> */}
      </div>
    </div>
  );
}

export default function Layout() {
  const isNavbarShow = useLocation().pathname === "/select-test" || useLocation().pathname === "/add-report";
  return (
    <>
      <Outlet />
      {!isNavbarShow && <GlobalBottomNav />}
    </>
  );
}
