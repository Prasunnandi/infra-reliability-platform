import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Activity, CheckCircle2, AlertTriangle, ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function ApiGuardianView() {
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await api.getEndpoints();
      setEndpoints(data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-400" /> API Guardian: Endpoint Telemetry & Latencies
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Synthetic probes and live traffic APM measuring error rates and P95 latency thresholds.
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Service & Endpoint</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">P95 Latency</th>
                <th className="py-2.5 px-3">Error Rate</th>
                <th className="py-2.5 px-3">30-Day Uptime</th>
                <th className="py-2.5 px-3 text-right">Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {endpoints.map((ep) => {
                const isCritical = ep.status === 'CRITICAL_LATENCY';
                const isWarning = ep.status === 'WARNING';

                return (
                  <tr key={ep.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{ep.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{ep.path}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {ep.method}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold">
                      <span className={isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-slate-200'}>
                        {ep.p95LatencyMs} ms
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span className={isCritical ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                        {ep.errorRatePercent}%
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-400">
                      {ep.uptimePercent}%
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isCritical
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                          : isWarning
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {ep.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
