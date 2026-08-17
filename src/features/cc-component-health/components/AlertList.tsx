"use client";

import Link from "next/link";

import {
  formatCurrency,
  formatMiles,
  formatPercent
} from "@/src/features/cc-component-health/lib/formatting";
import type { HealthAlert } from "@/src/features/cc-component-health/types";
import styles from "@/src/features/cc-component-health/components/feature.module.css";

interface AlertListProps {
  alerts: HealthAlert[];
  onAlertClick: (alert: HealthAlert) => void;
}

function severityClass(severity: HealthAlert["severity"]) {
  switch (severity) {
    case "warning":
      return styles.pillWarning;
    case "critical":
      return styles.pillCritical;
    case "expired":
      return styles.pillExpired;
  }
}

export function AlertList({ alerts, onAlertClick }: AlertListProps) {
  return (
    <div className={styles.alertGrid}>
      {alerts.map((alert) => (
        <article key={alert.id} className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <p className="eyebrow">{alert.bikeName}</p>
              <h3 className={styles.sectionTitle}>{alert.componentLabel}</h3>
            </div>
            <span className={`${styles.pill} ${severityClass(alert.severity)}`}>
              {alert.severity}
            </span>
          </div>

          <p className={styles.sectionText}>
            Threshold hit at {formatPercent(alert.thresholdTriggered)} remaining life.
          </p>

          {alert.replacementReason ? (
            <p className={styles.sectionText}>{alert.replacementReason}</p>
          ) : null}

          <div className={styles.statRow}>
            <div className={styles.stat}>
              <div className={styles.metricLabel}>Remaining miles</div>
              <div className={styles.statValue}>{formatMiles(alert.remainingMiles)}</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.metricLabel}>Best current price</div>
              <div className={styles.statValue}>
                {alert.bestPriceStartingAt !== undefined
                  ? formatCurrency(alert.bestPriceStartingAt)
                  : "N/A"}
              </div>
            </div>
          </div>

          <p className={styles.sectionText}>
            {formatPercent(alert.remainingPercent)} remaining across{" "}
            {alert.retailerCount ?? 0} partner retailers.
          </p>

          <Link
            className={styles.buttonGhost}
            href={`/projects/cc-component-health/component/${alert.componentId}`}
            onClick={() => onAlertClick(alert)}
          >
            Review pricing
          </Link>
        </article>
      ))}
    </div>
  );
}
