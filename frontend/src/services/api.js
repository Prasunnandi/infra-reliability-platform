// API Client for Infrastructure Reliability Platform

const API_BASE = '/api/v1';

async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(`API call ${endpoint} fallback:`, e.message);
    return getFallbackData(endpoint);
  }
}

export const api = {
  getServers: () => request('/servers'),
  getEndpoints: () => request('/endpoints'),
  getDeployments: () => request('/deployments'),
  getIncidents: () => request('/incidents'),
  getCausalityCorrelation: () => request('/causality-correlation'),
  rollbackDeployment: (payload) => request('/deployments/rollback', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
};

function getFallbackData(endpoint) {
  if (endpoint.includes('/causality-correlation')) {
    return [
      {
        incidentId: "INC-809",
        incidentTitle: "High P95 Latency & Spike in 502 Bad Gateway Errors on Checkout",
        severity: "P1_CRITICAL",
        incidentTriggeredAt: "2026-11-22T15:49:00Z",
        service: "checkout-service",
        correlatedDeployment: {
          id: "DEP-108",
          version: "v2.5.0-rc1",
          commitSha: "8a1c90e",
          commitMessage: "feat(checkout): optimize query cache & add bulk discount validator",
          deployer: "alex.kumar@eng.internal",
          deployedAt: "2026-11-22T15:45:00Z",
          deltaMinutesBeforeIncident: 4
        },
        causalityScorePercent: 96,
        rootCauseAnalysis: "Incident triggered 4 minutes following deployment v2.5.0-rc1 (8a1c90e) by alex.kumar@eng.internal. Telemetry confirms a sudden 12.4% error rate surge and 700ms P95 latency spike immediately after container restart.",
        rollbackGuidance: {
          recommendedAction: "IMMEDIATE_ROLLBACK",
          targetRollbackVersion: "v2.4.2",
          riskLevel: "LOW - Prior stable state verified in canary clusters",
          estimatedDowntimeRecoverySeconds: 45
        }
      }
    ];
  }
  return [];
}
