import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Server, Cpu, HardDrive, ShieldCheck, AlertCircle } from 'lucide-react';

export default function ServerHealthView() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await api.getServers();
      setServers(data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Server className="h-5 w-5 text-blue-400" /> ServerHealth: Production Cluster Infrastructure
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Node-level resource utilization across compute, memory, disk I/O, and thermal sensors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {servers.map((srv) => {
          const isDegraded = srv.status === 'DEGRADED';
          return (
            <div key={srv.id} className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{srv.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{srv.role} • {srv.region}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  isDegraded
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {srv.status}
                </span>
              </div>

              {/* Resource Bars */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5 text-slate-400" /> CPU Usage</span>
                    <span className="font-mono font-bold text-white">{srv.cpuUsagePercent}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        srv.cpuUsagePercent > 90 ? 'bg-rose-500' : srv.cpuUsagePercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${srv.cpuUsagePercent}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>RAM Utilization</span>
                    <span className="font-mono font-bold text-white">{srv.ramUsagePercent}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        srv.ramUsagePercent > 90 ? 'bg-rose-500' : srv.ramUsagePercent > 70 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${srv.ramUsagePercent}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>NVMe Disk Usage</span>
                    <span className="font-mono font-bold text-white">{srv.diskUsagePercent}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-600 rounded-full"
                      style={{ width: `${srv.diskUsagePercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <span>Thermal: <strong>{srv.temperatureCelsius}°C</strong></span>
                <span>Uptime: <strong>{srv.uptimeDays} days</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
