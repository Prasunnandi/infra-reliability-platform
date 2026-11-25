/**
 * Multi-Window Multi-Burn-Rate (MWMBR) Alert Evaluation Engine
 * Implements Google Site Reliability Engineering (SRE) Workbook alerting standards for Service Level Objectives (SLOs).
 */

export const DEFAULT_MWMBR_WINDOWS = [
  {
    tier: 'PAGE_CRITICAL',
    severity: 'CRITICAL',
    targetBudgetConsumptionPct: 2.0, // 2% budget consumed in 1 hour
    longWindowHours: 1,
    shortWindowMinutes: 5,
    burnRateThreshold: 14.4,
    notificationChannel: 'pagerduty'
  },
  {
    tier: 'PAGE_URGENT',
    severity: 'HIGH',
    targetBudgetConsumptionPct: 5.0, // 5% budget consumed in 6 hours
    longWindowHours: 6,
    shortWindowMinutes: 30,
    burnRateThreshold: 6.0,
    notificationChannel: 'pagerduty'
  },
  {
    tier: 'TICKET_ELEVATED',
    severity: 'MEDIUM',
    targetBudgetConsumptionPct: 10.0, // 10% budget consumed in 24 hours
    longWindowHours: 24,
    shortWindowMinutes: 120, // 2 hours
    burnRateThreshold: 3.0,
    notificationChannel: 'jira_ticket'
  },
  {
    tier: 'TICKET_LOW',
    severity: 'LOW',
    targetBudgetConsumptionPct: 10.0, // 10% budget consumed in 3 days
    longWindowHours: 72,
    shortWindowMinutes: 360, // 6 hours
    burnRateThreshold: 1.0,
    notificationChannel: 'email_digest'
  }
];

export class SloBurnRateEngine {
  /**
   * @param {Object} [options]
   * @param {number} [options.targetSloPct=99.9] - Target SLO uptime percentage (e.g. 99.9%)
   * @param {number} [options.compliancePeriodDays=30] - Rolling window duration in days (default 30 days)
   * @param {Array<Object>} [options.alertWindows] - Custom alert windows
   */
  constructor(options = {}) {
    this.targetSloPct = options.targetSloPct || 99.9;
    this.compliancePeriodDays = options.compliancePeriodDays || 30;
    this.errorBudgetFraction = (100 - this.targetSloPct) / 100; // e.g. 0.001 for 99.9%
    this.alertWindows = options.alertWindows || DEFAULT_MWMBR_WINDOWS;
  }

  /**
   * Calculate burn rate for a specific observation window
   * @param {number} errorEvents - Count of failed requests/probes in window
   * @param {number} totalEvents - Total requests/probes in window
   * @returns {number} Normalized burn rate multiplier (1.0 = budget exhausted in 30 days)
   */
  calculateBurnRate(errorEvents, totalEvents) {
    if (totalEvents === 0) return 0;
    const errorRate = errorEvents / totalEvents;
    const burnRate = errorRate / this.errorBudgetFraction;
    return Number(burnRate.toFixed(3));
  }

  /**
   * Evaluate multi-window alerts against telemetry metrics
   * @param {Object} telemetry - Current window metrics
   * @param {Object} telemetry.windows - Map of window rates { '1h': { errors, total }, '5m': { errors, total }, ... }
   * @param {number} [telemetry.totalBudgetRemainingPct=88.5] - Current monthly remaining budget %
   * @returns {Object} Comprehensive SLO health and active alert evaluations
   */
  evaluateAlerts(telemetry) {
    const activeAlerts = [];
    const windowEvaluations = [];

    for (const win of this.alertWindows) {
      const longKey = `${win.longWindowHours}h`;
      const shortKey = win.shortWindowMinutes >= 60 ? `${win.shortWindowMinutes / 60}h` : `${win.shortWindowMinutes}m`;

      const longData = telemetry.windows[longKey] || { errors: 0, total: 1000 };
      const shortData = telemetry.windows[shortKey] || { errors: 0, total: 200 };

      const longBurnRate = this.calculateBurnRate(longData.errors, longData.total);
      const shortBurnRate = this.calculateBurnRate(shortData.errors, shortData.total);

      // SRE Dual-Window Rule: Alert fires ONLY if BOTH long AND short windows exceed burn rate threshold
      const isFiring = (longBurnRate >= win.burnRateThreshold) && (shortBurnRate >= win.burnRateThreshold);

      const evalRecord = {
        tier: win.tier,
        severity: win.severity,
        isFiring,
        threshold: win.burnRateThreshold,
        longWindow: { key: longKey, burnRate: longBurnRate },
        shortWindow: { key: shortKey, burnRate: shortBurnRate },
        notificationChannel: win.notificationChannel
      };

      windowEvaluations.push(evalRecord);
      if (isFiring) {
        activeAlerts.push(evalRecord);
      }
    }

    // Estimate Time to Exhaustion (TTE) in hours based on current 1-hour burn rate
    const current1hBurn = telemetry.windows['1h'] ? this.calculateBurnRate(telemetry.windows['1h'].errors, telemetry.windows['1h'].total) : 1.0;
    const remainingPct = telemetry.totalBudgetRemainingPct !== undefined ? telemetry.totalBudgetRemainingPct : 100.0;
    const hoursInPeriod = this.compliancePeriodDays * 24;
    const hoursToExhaustion = current1hBurn > 0 ? (remainingPct / 100) * (hoursInPeriod / current1hBurn) : Infinity;

    return {
      sloTarget: `${this.targetSloPct}%`,
      compliancePeriodDays: this.compliancePeriodDays,
      errorBudgetRemainingPct: remainingPct,
      currentBurnRate1h: current1hBurn,
      estimatedHoursToExhaustion: isFinite(hoursToExhaustion) ? Math.round(hoursToExhaustion) : null,
      activeAlertsCount: activeAlerts.length,
      overallStatus: activeAlerts.length > 0 ? (activeAlerts.some(a => a.severity === 'CRITICAL') ? 'CRITICAL_OUTAGE' : 'WARNING') : 'HEALTHY',
      activeAlerts,
      windowEvaluations
    };
  }
}

export default SloBurnRateEngine;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SloBurnRateEngine;
  module.exports.SloBurnRateEngine = SloBurnRateEngine;
  module.exports.DEFAULT_MWMBR_WINDOWS = DEFAULT_MWMBR_WINDOWS;
}
