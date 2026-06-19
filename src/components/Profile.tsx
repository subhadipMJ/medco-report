import { useState } from "react";
import {
  ChevronRight,
  Lock,
  Smartphone,
  Users,
  ShieldCheck,
  CheckCircle2,
  Crown,
} from "lucide-react";

interface ProfileProps {
  token: string;
}

const Profile = ({ token: _token }: ProfileProps) => {
  const [syncEnabled, setSyncEnabled] = useState(true);

  const user = {
    name: "Utpal Mondal",
    phone: "+919674784589",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Utpal",
    age: 41,
    height: "5' 5\"",
    gender: "Male",
    weight: "49 kg",
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-4xl mx-auto min-h-screen pb-24">
        {/* Header / Avatar */}
        <div className="px-5 pt-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden border-2 border-white shadow-md">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 leading-tight">
                {user.name.toLowerCase()}
              </p>
              <p className="text-sm text-slate-500 font-medium">
                {user.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Pro Banner */}
        <div className="px-5 mb-5">
          <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-4 py-3.5 shadow-lg">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center">
              <Crown size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white leading-tight">
                Join Dr Trust 360 Pro
              </p>
            </div>
            <ChevronRight size={18} className="text-slate-300" />
          </div>
        </div>

        {/* Stats Row */}
        <div className="px-5 mb-6">
          <div className="flex justify-between items-center border border-slate-100 rounded-2xl p-4 bg-white shadow-sm">
            <div className="text-center flex-1">
              <p className="text-lg font-black text-slate-900">{user.age}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Age</p>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="text-center flex-1">
              <p className="text-lg font-black text-slate-900">{user.height}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Height(Ft/In)</p>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="text-center flex-1">
              <p className="text-lg font-black text-slate-900">{user.gender}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Gender</p>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="text-center flex-1">
              <p className="text-lg font-black text-slate-900">{user.weight}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Weight</p>
            </div>
          </div>
        </div>

        {/* Health App Sync */}
        <div className="px-5 mb-6">
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Sync With Health App</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  <p className="text-xs text-slate-400 font-medium">Connected</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSyncEnabled(!syncEnabled)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                syncEnabled ? "bg-emerald-500" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  syncEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Health Plans */}
        <div className="px-5 mb-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Health Plans
          </p>
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm text-left">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <ShieldCheck size={18} className="text-blue-600" />
              </div>
              <span className="flex-1 text-sm font-semibold text-slate-800">
                Activate my plan
              </span>
              <ChevronRight size={18} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* Health Management */}
        <div className="px-5 mb-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Health Management
          </p>
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm text-left opacity-70">
              <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center">
                <ShieldCheck size={18} className="text-slate-400" />
              </div>
              <span className="flex-1 text-sm font-semibold text-slate-600">
                My health goals
              </span>
              <Lock size={16} className="text-slate-400" />
              <ChevronRight size={18} className="text-slate-400" />
            </button>
            <button className="w-full flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm text-left opacity-70">
              <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center">
                <ShieldCheck size={18} className="text-slate-400" />
              </div>
              <span className="flex-1 text-sm font-semibold text-slate-600">
                Health guardians
              </span>
              <Lock size={16} className="text-slate-400" />
              <ChevronRight size={18} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* Device and Other Accounts */}
        <div className="px-5 mb-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Device and Other Accounts
          </p>
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm text-left">
              <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center">
                <Smartphone size={18} className="text-slate-500" />
              </div>
              <span className="flex-1 text-sm font-semibold text-slate-800">
                Manage devices
              </span>
              <ChevronRight size={18} className="text-slate-400" />
            </button>
            <button className="w-full flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm text-left">
              <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center">
                <Users size={18} className="text-slate-500" />
              </div>
              <span className="flex-1 text-sm font-semibold text-slate-800">
                Manage other accounts
              </span>
              <ChevronRight size={18} className="text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
