import { RefreshCw, Settings } from "lucide-react";

interface HeaderProps {
  token: string;
  title: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  extra?: React.ReactNode;
}

const Header = ({ token, title, onRefresh, isRefreshing }: HeaderProps) => {
  console.log(token);

  // Derive initials from title (fallback to "U")
  const initials = title
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  // Demo vitals – wire to real API data when available
  const age = 32;
  const gender = "Male";
  const bloodGroup = "O+";
  const weight = 78;
  const height = 178;
  const bmi = 24.6;

  return (
    <div className="relative z-10">
      {/* Top gradient area */}
      <div className="bg-gradient-to-br from-violet-50 via-fuchsia-50 to-rose-50 px-6 pt-8 pb-6 rounded-b-[2.5rem]">
        {/* Profile row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-sm border-2 border-rose-300">
              {initials}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{title}</p>
              <p className="text-xs text-slate-500">
                {age} yrs <span className="mx-1">•</span> {gender}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Blood group badge */}
            <div className="flex flex-col items-center justify-center rounded-2xl bg-rose-50 border border-rose-100 px-3 py-1.5">
              <span className="text-[8px] font-bold uppercase tracking-wider text-rose-400">Blood</span>
              <span className="text-sm font-black text-rose-600 leading-none">{bloodGroup}</span>
            </div>
            {/* Settings */}
            <button className="w-9 h-9 rounded-xl bg-white/60 border border-white/70 flex items-center justify-center text-slate-500 hover:bg-white transition-colors">
              <Settings size={16} />
            </button>
            {/* Refresh */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="w-9 h-9 rounded-xl bg-white/60 border border-white/70 flex items-center justify-center text-slate-500 hover:bg-white transition-colors"
                title="Refresh"
              >
                <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
              </button>
            )}
          </div>
        </div>

        {/* Stats card */}
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-slate-100 p-3 flex items-center gap-2.5 shadow-sm">
            <div>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider">Weight</p>
              <p className="text-sm font-bold text-slate-800">{weight} kg</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-3 flex items-center gap-2.5 shadow-sm">
            <div>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider">Height</p>
              <p className="text-sm font-bold text-slate-800">{height}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-3 flex items-center gap-2.5 shadow-sm">
            <div>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider">BMI</p>
              <p className="text-sm font-bold text-slate-800">{bmi}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
