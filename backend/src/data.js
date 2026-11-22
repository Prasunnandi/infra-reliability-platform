// Seed data for Infrastructure Reliability Platform (API Guardian + ServerHealth + DeployMate)

export const initialServers = [
  {
    id: "srv-us-east-01",
    name: "us-east-prod-api-01",
    region: "us-east-1",
    role: "Core API Gateway",
    cpuUsagePercent: 78.4,
    ramUsagePercent: 82.1,
    diskUsagePercent: 54.0,
    status: "HEALTHY",
    uptimeDays: 44.2,
    temperatureCelsius: 41
  },
  {
    id: "srv-us-east-02",
    name: "us-east-prod-worker-02",
    region: "us-east-1",
    role: "Async Background Worker",
    cpuUsagePercent: 94.8,
    ramUsagePercent: 91.5,
    diskUsagePercent: 68.3,
    status: "DEGRADED",
    uptimeDays: 12.8,
    temperatureCelsius: 58
  },
  {
    id: "srv-eu-west-01",
    name: "eu-west-prod-db-01",
    region: "eu-west-1",
    role: "Read Replica Cluster",
    cpuUsagePercent: 42.1,
    ramUsagePercent: 64.7,
    diskUsagePercent: 49.2,
    status: "HEALTHY",
    uptimeDays: 98.6,
    temperatureCelsius: 38
  }
];

export const initialEndpoints = [
  {
    id: "ep-1",
    name: "Order Checkout API",
    path: "/api/v1/orders/checkout",
    method: "POST",
    p95LatencyMs: 840,
    errorRatePercent: 12.4,
    uptimePercent: 97.2,
    status: "CRITICAL_LATENCY",
    service: "checkout-service"
  },
  {
    id: "ep-2",
    name: "User Authentication",
    path: "/api/v1/auth/token",
    method: "POST",
    p95LatencyMs: 45,
    errorRatePercent: 0.05,
    uptimePercent: 99.98,
    status: "HEALTHY",
    service: "auth-service"
  },
  {
    id: "ep-3",
    name: "Catalog Search",
    path: "/api/v1/products/search",
    method: "GET",
    p95LatencyMs: 110,
    errorRatePercent: 0.12,
    uptimePercent: 99.92,
    status: "HEALTHY",
    service: "catalog-service"
  },
  {
    id: "ep-4",
    name: "Payment Webhook Dispatcher",
    path: "/api/v1/webhooks/stripe",
    method: "POST",
    p95LatencyMs: 320,
    errorRatePercent: 3.8,
    uptimePercent: 98.4,
    status: "WARNING",
    service: "checkout-service"
  }
];

export const initialDeployments = [
  {
    id: "DEP-108",
    service: "checkout-service",
    version: "v2.5.0-rc1",
    commitSha: "8a1c90e",
    commitMessage: "feat(checkout): optimize query cache & add bulk discount validator",
    deployer: "alex.kumar@eng.internal",
    environment: "production",
    status: "SUCCESSFUL",
    deployedAt: "2026-11-22T15:45:00Z",
    timeAgo: "35 mins ago",
    previousVersion: "v2.4.2"
  },
  {
    id: "DEP-107",
    service: "catalog-service",
    version: "v1.14.0",
    commitSha: "7b4f21a",
    commitMessage: "perf: add redis read-through caching for category taxonomy",
    deployer: "maya.lin@eng.internal",
    environment: "production",
    status: "SUCCESSFUL",
    deployedAt: "2026-11-22T12:10:00Z",
    timeAgo: "4 hours ago",
    previousVersion: "v1.13.9"
  },
  {
    id: "DEP-106",
    service: "auth-service",
    version: "v3.1.2",
    commitSha: "4c9d18e",
    commitMessage: "fix(jwt): bump cryptographic key rotation grace period",
    deployer: "david.ross@eng.internal",
    environment: "production",
    status: "SUCCESSFUL",
    deployedAt: "2026-11-21T18:30:00Z",
    timeAgo: "22 hours ago",
    previousVersion: "v3.1.1"
  }
];

export const initialIncidents = [
  {
    id: "INC-809",
    title: "High P95 Latency & Spike in 502 Bad Gateway Errors on Checkout",
    service: "checkout-service",
    severity: "P1_CRITICAL",
    triggeredAt: "2026-11-22T15:49:00Z",
    timeAgo: "31 mins ago",
    status: "ACTIVE_OUTAGE",
    impactedUsersEstimate: 4200,
    impactedEndpoints: ["/api/v1/orders/checkout", "/api/v1/webhooks/stripe"],
    correlatedDeploymentId: "DEP-108"
  },
  {
    id: "INC-808",
    title: "Worker Node 02 CPU Saturation & Memory Thrashing",
    service: "async-workers",
    severity: "P2_MAJOR",
    triggeredAt: "2026-11-22T15:52:00Z",
    timeAgo: "28 mins ago",
    status: "INVESTIGATING",
    impactedUsersEstimate: 1100,
    impactedEndpoints: ["/api/v1/webhooks/stripe"],
    correlatedDeploymentId: "DEP-108"
  }
];
