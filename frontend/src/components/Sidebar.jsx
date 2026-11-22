import React from 'react';
import { 
  Activity, 
  Server, 
  Rocket, 
  AlertOctagon, 
  ShieldAlert, 
  Zap, 
  GitBranch, 
  Radio 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'causality', label: 'Deployment-Incident Radar', icon: Zap, badge: 'Standout' },
    { id: 'api', label: 'API Guardian & Metrics', icon: Activity },
    { id: 'servers', label: 'ServerHealth Infrastructure', icon: Server },
    { id: 'deployments', label: 'DeployMate Releases', icon: Rocket }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 h-screen sticky top-0">
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Activity className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
            RELIABILITY<span className="text-xs font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">OPS</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">Guardian • ServerHealth • DeployMate</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          Observability & Releases
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3.5 m-3 rounded-xl bg-slate-950 border border-slate-800/80">
        <div className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
          <ShieldAlert className="h-4 w-4 text-cyan-400" />
          <span>Causality Engine</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed">
          Correlates CI/CD deployment hooks with telemetry anomalies to pinpoint root causes.
        </p>
      </div>
    </aside>
  );
}
