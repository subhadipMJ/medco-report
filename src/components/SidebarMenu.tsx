import { useContext, createContext, useState, useCallback } from 'react';
import { FileText, Activity, Pill, User, X } from 'lucide-react';
import { useNavigateWithToken } from '../hooks/useNavigateWithToken';

interface SidebarContextType {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const SidebarContext = createContext<SidebarContextType>({
  open: () => {},
  close: () => {},
  isOpen: false,
});

export const useSidebar = () => useContext(SidebarContext);

const navItems = [
  { key: 'reports' as const, label: 'Insights', icon: FileText },
  { key: 'compare' as const, label: 'Analytics', icon: Activity },
  { key: 'rx' as const, label: 'Therapy', icon: Pill },
  { key: 'profile' as const, label: 'Profile', icon: User },
];

interface SidebarProviderProps {
  children: React.ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <SidebarContext.Provider value={{ open, close, isOpen }}>
      {children}
      <SidebarDrawer />
    </SidebarContext.Provider>
  );
}

function SidebarDrawer() {
  const { isOpen, close } = useSidebar();
  const navigate = useNavigateWithToken();

  const handleNavigate = (key: string) => {
    close();
    if (key === 'profile') {
      navigate('/');
    } else {
      navigate(`/?tab=${key}`);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={close}
      />
      {/* Drawer Panel */}
      <div
        className={`absolute top-0 right-0 h-full w-[280px] bg-white shadow-[0_0_60px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 pt-10 pb-6 border-b border-slate-100">
          <p className="text-sm font-black text-slate-900 uppercase tracking-widest">
            Menu
          </p>
          <button
            onClick={close}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100 transition-all shadow-sm"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => handleNavigate(item.key)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-transparent"
            >
              <item.icon size={18} strokeWidth={2} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default SidebarProvider;
