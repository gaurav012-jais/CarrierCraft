import { useAuth } from '../../context/AuthContext';

export function Header({ title = 'Dashboard' }) {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 z-40 px-6 flex items-center justify-between gap-4 shadow-xs">
      {/* Breadcrumb / Section Name */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs font-mono text-slate-600">CarrierCraft</span>
        <span className="material-symbols-outlined text-[14px] text-slate-600">chevron_right</span>
        <span className="text-sm font-semibold text-slate-800">{title}</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Live Status Pill (Blue, No Green) */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          <span className="text-xs font-mono font-semibold text-slate-700 uppercase">Production / Live</span>
        </div>

        {/* Carrier Interconnect Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">
          <span className="material-symbols-outlined text-blue-600 text-[16px]">swap_calls</span>
          <span className="text-xs font-mono text-slate-500">Carrier:</span>
          <span className="text-xs font-mono font-semibold text-blue-800">CONNECTED</span>
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-3 pl-1">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-800 leading-tight">{user?.name || 'Administrator'}</span>
            <span className="text-[11px] font-mono text-slate-600 leading-tight capitalize">{user?.role || 'superadmin'}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
            {user?.name?.[0] || 'A'}
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
