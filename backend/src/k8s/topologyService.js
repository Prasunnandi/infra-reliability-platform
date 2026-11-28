/**
 * Kubernetes Cluster Topology & Failure-Domain Inspection Service
 * Maps hierarchical relationships across Availability Zones, Worker Nodes, Deployments,
 * ReplicaSets, and Pods. Evaluates pod anti-affinity distribution, calculates fault tolerance scores,
 * and simulates blast radius across availability zone failures.
 */

export const POD_PHASES = {
  RUNNING: 'Running',
  PENDING: 'Pending',
  FAILED: 'Failed',
  CRASH_LOOP: 'CrashLoopBackOff'
};

export class K8sTopologyService {
  /**
   * @param {Object} [options]
   * @param {string} [options.clusterName='k8s-prod-us-east-1']
   */
  constructor(options = {}) {
    this.clusterName = options.clusterName || 'k8s-prod-us-east-1';
  }

  /**
   * Ingests raw Kubernetes manifests or mock cluster telemetry and builds topology graph
   * @param {Object} clusterData - { nodes, deployments, replicaSets, pods }
   * @returns {Object} Complete topology hierarchy, zone distribution, and reliability analysis
   */
  buildTopology(clusterData = {}) {
    const rawNodes = clusterData.nodes || [];
    const rawDeployments = clusterData.deployments || [];
    const rawReplicaSets = clusterData.replicaSets || [];
    const rawPods = clusterData.pods || [];

    // 1. Build Nodes & Availability Zones Map
    const zonesMap = new Map(); // zoneId -> { zone, nodes: [] }
    const nodesMap = new Map(); // nodeName -> nodeObj

    rawNodes.forEach(node => {
      const zone = node.zone || node.labels?.['topology.kubernetes.io/zone'] || 'us-east-1a';
      if (!zonesMap.has(zone)) {
        zonesMap.set(zone, {
          zone,
          nodesCount: 0,
          totalCpuCores: 0,
          totalMemoryGb: 0,
          podsCount: 0,
          nodes: []
        });
      }

      const nodeSummary = {
        name: node.name,
        zone,
        status: node.status || 'Ready',
        ip: node.ip || '10.0.1.10',
        cpuCores: node.cpuCores || 16,
        memoryGb: node.memoryGb || 64,
        allocatedCpu: 0,
        allocatedMemory: 0,
        pods: []
      };

      nodesMap.set(node.name, nodeSummary);
      const z = zonesMap.get(zone);
      z.nodes.push(nodeSummary);
      z.nodesCount++;
      z.totalCpuCores += nodeSummary.cpuCores;
      z.totalMemoryGb += nodeSummary.memoryGb;
    });

    // 2. Associate Pods with Nodes and Workloads
    const podMap = new Map();
    rawPods.forEach(pod => {
      const nodeName = pod.nodeName;
      const node = nodesMap.get(nodeName);
      const zone = node ? node.zone : (pod.zone || 'unknown');

      const podObj = {
        name: pod.name,
        namespace: pod.namespace || 'default',
        phase: pod.phase || POD_PHASES.RUNNING,
        nodeName: nodeName || 'UNASSIGNED',
        zone,
        restarts: pod.restarts || 0,
        deployment: pod.deployment || pod.labels?.app || 'unmanaged',
        cpuRequest: pod.cpuRequest || 0.5,
        memoryRequestGb: pod.memoryRequestGb || 1.0
      };

      podMap.set(pod.name, podObj);

      if (node) {
        node.pods.push(podObj);
        node.allocatedCpu += podObj.cpuRequest;
        node.allocatedMemory += podObj.memoryRequestGb;
        const z = zonesMap.get(node.zone);
        if (z) z.podsCount++;
      }
    });

    // 3. Build Workload Spread & Reliability Analysis
    const workloads = rawDeployments.map(dep => {
      const depPods = Array.from(podMap.values()).filter(p => p.deployment === dep.name);
      const zonesCovered = new Set(depPods.map(p => p.zone));
      const nodesCovered = new Set(depPods.map(p => p.nodeName));

      const desiredReplicas = dep.replicas || depPods.length || 1;
      const availableReplicas = depPods.filter(p => p.phase === POD_PHASES.RUNNING).length;

      // Reliability rules:
      // Anti-affinity violation: desired > 1 but all pods on same node
      const hasNodeAntiAffinityViolation = desiredReplicas > 1 && nodesCovered.size === 1;
      // Single AZ risk: desired > 1 but all pods in 1 AZ
      const hasSingleAzRisk = desiredReplicas > 1 && zonesCovered.size === 1;

      let resiliencyRating = 'OPTIMAL';
      if (hasNodeAntiAffinityViolation || availableReplicas === 0) {
        resiliencyRating = 'CRITICAL_RISK';
      } else if (hasSingleAzRisk) {
        resiliencyRating = 'SUBOPTIMAL_AZ_SPREAD';
      }

      return {
        deployment: dep.name,
        namespace: dep.namespace || 'default',
        desiredReplicas,
        availableReplicas,
        nodesSpreadCount: nodesCovered.size,
        zonesSpreadCount: zonesCovered.size,
        zonesCovered: Array.from(zonesCovered),
        nodesCovered: Array.from(nodesCovered),
        hasNodeAntiAffinityViolation,
        hasSingleAzRisk,
        resiliencyRating
      };
    });

    // 4. Calculate Overall Cluster Fault Tolerance Score (0-100)
    let faultToleranceDeductions = 0;
    workloads.forEach(w => {
      if (w.resiliencyRating === 'CRITICAL_RISK') faultToleranceDeductions += 25;
      if (w.resiliencyRating === 'SUBOPTIMAL_AZ_SPREAD') faultToleranceDeductions += 10;
    });
    const faultToleranceScore = Math.max(0, 100 - faultToleranceDeductions);

    return {
      clusterName: this.clusterName,
      timestamp: new Date().toISOString(),
      summary: {
        totalZones: zonesMap.size,
        totalNodes: nodesMap.size,
        totalPods: podMap.size,
        totalDeployments: workloads.length,
        faultToleranceScore,
        isMultiAzBalanced: zonesMap.size >= 3 && workloads.every(w => !w.hasSingleAzRisk)
      },
      zones: Array.from(zonesMap.values()),
      workloads
    };
  }

  /**
   * Simulates the complete blast radius of an Availability Zone outage
   * @param {Object} topologyReport - Built topology output
   * @param {string} targetZone - Target AZ to simulate failure (e.g., 'us-east-1a')
   */
  simulateAzFailure(topologyReport, targetZone) {
    const affectedNodes = [];
    let affectedPodsCount = 0;
    const affectedWorkloads = [];

    topologyReport.zones.forEach(z => {
      if (z.zone === targetZone) {
        z.nodes.forEach(n => {
          affectedNodes.push(n.name);
          affectedPodsCount += n.pods.length;
        });
      }
    });

    topologyReport.workloads.forEach(w => {
      if (w.zonesCovered.includes(targetZone)) {
        const remainingZones = w.zonesCovered.filter(z => z !== targetZone);
        const survivingRatio = remainingZones.length / (w.zonesCovered.length || 1);
        affectedWorkloads.push({
          deployment: w.deployment,
          priorReplicas: w.availableReplicas,
          survivingZones: remainingZones,
          serviceOutage: remainingZones.length === 0,
          expectedSurvivingCapacityPct: Math.round(survivingRatio * 100)
        });
      }
    });

    return {
      simulatedZoneOutage: targetZone,
      affectedNodesCount: affectedNodes.length,
      affectedPodsCount,
      outageSeverity: affectedWorkloads.some(w => w.serviceOutage) ? 'P0_TOTAL_OUTAGE' : 'DEGRADED_PERFORMANCE',
      affectedWorkloads
    };
  }
}

// Dual ESM & CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    POD_PHASES,
    K8sTopologyService
  };
}

export default K8sTopologyService;
