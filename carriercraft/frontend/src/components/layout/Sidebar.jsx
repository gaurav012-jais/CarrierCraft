import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/markets', label: 'Markets', icon: 'public' },
  { path: '/campaigns', label: 'Campaigns', icon: 'campaign' },
  { path: '/canvas', label: 'Flow Canvas', icon: 'account_tree' },
  { path: '/logs', label: 'Traffic Logs', icon: 'receipt_long' },
  { path: '/postbacks', label: 'Postbacks & S2S', icon: 'sync_alt' },
  { path: '/vendors', label: 'Vendors', icon: 'cell_tower' },
  { path: '/simulator', label: 'Live Funnel Lab', icon: 'play_circle', highlight: true },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-50 flex flex-col justify-between shadow-sm">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-slate-200 flex items-center gap-3 bg-white">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-sm shadow-blue-200">
            <span className="material-symbols-outlined text-white text-[20px]">hub</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-slate-900 tracking-tight text-base truncate">CarrierCraft</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 font-semibold border border-blue-200">CORE</span>
            </div>
            <span className="text-xs text-slate-500 truncate">Telecom WAP Manager</span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="px-4 pt-4 pb-2">
          <span className="text-[11px] font-mono text-slate-600 uppercase tracking-wider font-semibold">Node Operations</span>
        </div>

        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-white' : 'text-slate-600'}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.highlight && !isActive && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-sky-100 text-sky-800 font-bold border border-sky-300">
                      TEST
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Gateway Telemetry Footer (No Green, Royal Blue Pulse) */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
            </span>
            <span className="text-xs font-mono font-semibold text-slate-800">DCB GATEWAY 01</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono text-[11px] font-semibold border border-blue-200">
            HEALTHY
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500 font-mono flex justify-between">
          <span>Throughput: 8,420 TPS</span>
          <span className="font-semibold text-blue-800">99.98%</span>
        </div>
      </div>
    </aside>
  );
}
