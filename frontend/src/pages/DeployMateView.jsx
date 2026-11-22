import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Rocket, GitCommit, CheckCircle2, User, Clock } from 'lucide-react';

export default function DeployMateView() {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await api.getDeployments();
      setDeployments(data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Rocket className="h-5 w-5 text-blue-400" /> DeployMate: Release Deployment History
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Automated CI/CD build rollouts, git commit traceability, and container deployments.
        </p>
      </div>

      <div className="space-y-3">
        {deployments.map((dep) => (
          <div key={dep.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {dep.version}
                </span>
                <span className="text-xs font-bold text-white">{dep.service}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                  {dep.commitSha}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1"><User className="h-3 w-3" /> {dep.deployer}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {dep.timeAgo}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {dep.status}
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-300 font-mono bg-slate-950 p-2.5 rounded border border-slate-800/80">
              {dep.commitMessage}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
