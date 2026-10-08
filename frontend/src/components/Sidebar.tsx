import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Factory,
  ShieldAlert,
  Sliders,
  Boxes,
  Bot,
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

export const Sidebar: React.FC = () => {
  const navItems: NavItem[] = [
    { name: 'Overview', path: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Demand Forecast', path: '/forecast', icon: <TrendingUp className="w-5 h-5" /> },
    { name: 'Production Plan', path: '/production', icon: <Factory className="w-5 h-5" /> },
    { name: 'Risk Analysis', path: '/risk', icon: <ShieldAlert className="w-5 h-5" /> },
    { name: 'What-If Simulator', path: '/what-if', icon: <Sliders className="w-5 h-5" /> },
    { name: 'AI Assistant', path: '/assistant', icon: <Bot className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
          <Boxes className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-slate-100 text-sm tracking-tight leading-none">
            Demand-to-Production
          </h1>
          <span className="text-[11px] font-semibold tracking-wider text-blue-400 uppercase leading-tight block mt-1">
            Enterprise Planner
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Planning Modules
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600/90 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* System Status Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-400">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-medium text-slate-300">Monte Carlo Engine Active</span>
        </div>
        <div className="text-slate-500 font-mono text-[10px]">v2.4-enterprise</div>
      </div>
    </aside>
  );
};
