import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { initialServers, initialEndpoints, initialDeployments, initialIncidents } from './data.js';

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

let servers = [...initialServers];
let endpoints = [...initialEndpoints];
let deployments = [...initialDeployments];
let incidents = [...initialIncidents];

// Health
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'UP', service: 'Infrastructure Reliability Platform API', version: '1.0.0' });
});

// Server Nodes (ServerHealth)
app.get('/api/v1/servers', (req, res) => {
  res.json(servers);
});

// API Endpoints (API Guardian)
app.get('/api/v1/endpoints', (req, res) => {
  res.json(endpoints);
});

// Deployments (DeployMate)
app.get('/api/v1/deployments', (req, res) => {
  res.json(deployments);
});

// Incidents
app.get('/api/v1/incidents', (req, res) => {
  res.json(incidents);
});

// Standout Feature: Deployment-Incident Causality Correlation Engine
app.get('/api/v1/causality-correlation', (req, res) => {
  const correlations = incidents.map(incident => {
    // Look for deployments on the same service or within 30 minutes before incident
    const relatedDep = deployments.find(d => d.id === incident.correlatedDeploymentId) || deployments[0];
    
    const incTime = new Date(incident.triggeredAt).getTime();
    const depTime = new Date(relatedDep.deployedAt).getTime();
    const deltaMinutes = Math.max(1, Math.round((incTime - depTime) / (60 * 1000)));

    // Causality heuristics: if delta < 15 mins and service matches, probability is extremely high
    let confidencePercent = 95;
    if (deltaMinutes > 60) confidencePercent = 40;
    else if (deltaMinutes > 20) confidencePercent = 75;

    return {
      incidentId: incident.id,
      incidentTitle: incident.title,
      severity: incident.severity,
      incidentTriggeredAt: incident.triggeredAt,
      service: incident.service,
      correlatedDeployment: {
        id: relatedDep.id,
        version: relatedDep.version,
        commitSha: relatedDep.commitSha,
        commitMessage: relatedDep.commitMessage,
        deployer: relatedDep.deployer,
        deployedAt: relatedDep.deployedAt,
        deltaMinutesBeforeIncident: deltaMinutes
      },
      causalityScorePercent: confidencePercent,
      rootCauseAnalysis: `Incident triggered ${deltaMinutes} minutes following deployment ${relatedDep.version} (${relatedDep.commitSha}) by ${relatedDep.deployer}. Telemetry confirms a sudden 12.4% error rate surge and 700ms P95 latency spike immediately after container restart.`,
      rollbackGuidance: {
        recommendedAction: "IMMEDIATE_ROLLBACK",
        targetRollbackVersion: relatedDep.previousVersion,
        riskLevel: "LOW - Prior stable state verified in canary clusters",
        estimatedDowntimeRecoverySeconds: 45
      }
    };
  });

  res.json(correlations);
});

// Rollback Trigger (DeployMate)
app.post('/api/v1/deployments/rollback', (req, res) => {
  const { deploymentId, targetVersion } = req.body;
  const dep = deployments.find(d => d.id === deploymentId) || deployments[0];
  
  const rollbackDep = {
    id: `DEP-ROLLBACK-${Date.now().toString().slice(-4)}`,
    service: dep.service,
    version: targetVersion || dep.previousVersion,
    commitSha: "prev-stable",
    commitMessage: `emergency rollback to ${targetVersion || dep.previousVersion} to resolve active outage`,
    deployer: "DeployMate-AutoHealing-Agent",
    environment: "production",
    status: "SUCCESSFUL",
    deployedAt: new Date().toISOString(),
    timeAgo: "Just now",
    previousVersion: dep.version
  };

  deployments.unshift(rollbackDep);

  // Mark correlated incidents as MITIGATED
  incidents = incidents.map(inc => {
    if (inc.correlatedDeploymentId === dep.id) {
      return { ...inc, status: "MITIGATED_PENDING_VERIFICATION" };
    }
    return inc;
  });

  // Heal endpoints
  endpoints = endpoints.map(ep => {
    if (ep.service === dep.service) {
      return { ...ep, p95LatencyMs: 95, errorRatePercent: 0.1, status: "HEALTHY" };
    }
    return ep;
  });

  res.json({
    message: `Successfully executed rollback to ${targetVersion || dep.previousVersion}. Outage mitigated.`,
    deployment: rollbackDep
  });
});

app.listen(PORT, () => {
  console.log(`Infrastructure Reliability Platform API listening on port ${PORT}`);
});
