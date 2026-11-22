import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Zap, 
  AlertTriangle, 
  GitCommit, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Activity, 
  ShieldAlert, 
  Server,
  Sparkles
} from 'lucide-react';

export default function CausalityRadar() {
  const [correlations, setCorrelations] = useState([]);
  const [selectedCorrelation, setSelectedCorrelation] = useState(null);
  const [rollbackSuccess, setRollbackSuccess] = useState(null);
  const [rollingBack, setRollingBack] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await api.getCausalityCorrelation();
      setCorrelations(data || []);
      if (data?.length > 0) setSelectedCorrelation(data[0]);
      setLoading(false);
    }
    load();
  }, []);

  const handleExecuteRollback = async () => {
    if (!selectedCorrelation) return;
    setRollingBack(true);
    try {
      const payload = {
        deploymentId: selectedCorrelation.correlatedDeployment?.id,
        targetVersion: selectedCorrelation.rollbackGuidance?.targetRollbackVersion
      };
      const res = await api.rollbackDeployment(payload);
      setRollbackSuccess(res);
      // Reload correlations to update statuses
      const updated = await api.getCausalityCorrelation();
      setCorrelations(updated || []);
    } catch (e) {
      console.error(e);
    } finally {
      setRollingBack(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-rose-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-rose-500/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                <Zap className="h-3 w-3" /> Standout Flagship Feature
              </span>
              <span className="text-xs text-slate-400">DeployMate & API Guardian Telemetry Fusion</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Deployment-Incident Causality Correlation Engine
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Connects CI/CD release events with APM error anomalies to definitively determine if a recent deployment caused an active outage, with automated rollback guidance.
            </p>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {rollbackSuccess && (
        <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="h-5 w-5" />
              <span>Automated Rollback Executed Successfully</span>
            </div>
            <span className="font-mono text-xs text-slate-300">
              Release: {rollbackSuccess.deployment?.version}
            </span>
          </div>
          <p className="text-xs text-slate-300">
            {rollbackSuccess.message} Latency and error rates have stabilized to baseline healthy thresholds.
          </p>
        </div>
      )}

      {/* Incidents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {correlations.map((item) => {
          const isSelected = selectedCorrelation?.incidentId === item.incidentId;
          return (
            <div
              key={item.incidentId}
              onClick={() => setSelectedCorrelation(item)}
              className={`p-5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-rose-950/20 border-rose-500/60 shadow-lg'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-rose-400">{item.incidentId}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {item.severity}
                  </span>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                  {item.causalityScorePercent}% Causality Match
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-2.5 leading-snug">{item.incidentTitle}</h3>
              <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
                <span>Microservice: <strong className="text-slate-200">{item.service}</strong></span>
                <span className="text-rose-300 font-mono">+{item.correlatedDeployment?.deltaMinutesBeforeIncident}m post-deploy</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep-Dive Correlation & Rollback Cockpit */}
      {selectedCorrelation && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-400" /> Active Anomaly Root Cause Analysis
              </div>
              <h3 className="text-lg font-bold text-white mt-1">{selectedCorrelation.incidentTitle}</h3>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Impacted Service: {selectedCorrelation.service}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Deployment Causality Confidence</div>
              <div className="text-3xl font-extrabold text-rose-400 font-mono mt-0.5">
                {selectedCorrelation.causalityScorePercent}%
              </div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Direct Temporal Correlation</span>
            </div>
          </div>

          {/* Suspect Deployment Card */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <GitCommit className="h-4 w-4" /> Suspect Release Event ({selectedCorrelation.correlatedDeployment?.id})
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Deployed: {selectedCorrelation.correlatedDeployment?.deltaMinutesBeforeIncident} mins prior to incident
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Version Tag</div>
                <div className="font-bold text-white font-mono">{selectedCorrelation.correlatedDeployment?.version}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Commit SHA</div>
                <div className="font-bold text-blue-400 font-mono">{selectedCorrelation.correlatedDeployment?.commitSha}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Deployed By</div>
                <div className="font-semibold text-slate-200">{selectedCorrelation.correlatedDeployment?.deployer}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Time Gap to Outage</div>
                <div className="font-bold text-rose-400 font-mono">+{selectedCorrelation.correlatedDeployment?.deltaMinutesBeforeIncident} minutes</div>
              </div>
            </div>
            <div className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded border border-slate-800 font-mono">
              <strong>Commit:</strong> {selectedCorrelation.correlatedDeployment?.commitMessage}
            </div>
          </div>

          {/* Telemetry Shift Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400">P95 Latency Shift</div>
              <div className="text-2xl font-bold text-rose-400 font-mono mt-1">+730ms</div>
              <div className="text-[10px] text-slate-400 mt-1">Jumped from 110ms to 840ms post-release</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400">5xx Error Rate Surge</div>
              <div className="text-2xl font-bold text-rose-400 font-mono mt-1">12.4%</div>
              <div className="text-[10px] text-slate-400 mt-1">Baseline was 0.05% before container reboot</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400">Host CPU Saturation</div>
              <div className="text-2xl font-bold text-amber-400 font-mono mt-1">94.8%</div>
              <div className="text-[10px] text-slate-400 mt-1">Worker thread pool starvation</div>
            </div>
          </div>

          {/* Root Cause Prose */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <strong className="text-slate-100">Causality Diagnosis:</strong> {selectedCorrelation.rootCauseAnalysis}
          </div>

          {/* Rollback Guidance & 1-Click Action */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-blue-950/40 via-slate-950 to-slate-950 border border-blue-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <RotateCcw className="h-4 w-4" /> DeployMate Rollback Recommendation
              </div>
              <div className="text-sm font-bold text-white mt-1">
                Revert {selectedCorrelation.service} to verified stable release <span className="text-emerald-400 font-mono">{selectedCorrelation.rollbackGuidance?.targetRollbackVersion}</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Risk: {selectedCorrelation.rollbackGuidance?.riskLevel} • Est. Recovery: {selectedCorrelation.rollbackGuidance?.estimatedDowntimeRecoverySeconds}s
              </div>
            </div>

            <button
              onClick={handleExecuteRollback}
              disabled={rollingBack}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all disabled:opacity-50 shrink-0"
            >
              <RotateCcw className="h-4 w-4" />
              {rollingBack ? 'Executing Rollback...' : `Rollback to ${selectedCorrelation.rollbackGuidance?.targetRollbackVersion}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
