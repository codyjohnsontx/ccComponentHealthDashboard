"use client";

import { formatMiles, formatPercent } from "@/src/features/cc-component-health/lib/formatting";
import {
  getHealthStatusLabel,
  getHealthTone,
  getMeterFillPercent
} from "@/src/features/cc-component-health/lib/healthPresentation";
import type { AlertLevel } from "@/src/features/cc-component-health/types";
import styles from "@/src/features/cc-component-health/components/feature.module.css";

interface HealthMeterProps {
  remainingPercent: number;
  remainingMiles: number;
  alertLevel: AlertLevel;
  compact?: boolean;
  label?: string;
}

export function HealthMeter({
  remainingPercent,
  remainingMiles,
  alertLevel,
  compact = false,
  label
}: HealthMeterProps) {
  const tone = getHealthTone(alertLevel);
  const statusLabel = getHealthStatusLabel(alertLevel);
  const fillPercent = getMeterFillPercent(remainingPercent);

  return (
    <div className={`${styles.healthMeter} ${compact ? styles.healthMeterCompact : ""}`}>
      <div
        className={styles.healthMeterRail}
        aria-label={
          label
            ? `${label}: ${formatMiles(remainingMiles)} left, ${formatPercent(remainingPercent)} remaining, ${statusLabel}`
            : `${formatMiles(remainingMiles)} left, ${formatPercent(remainingPercent)} remaining, ${statusLabel}`
        }
        role="img"
      >
        <span
          className={`${styles.healthMeterFill} ${styles[`healthMeterFill${tone[0].toUpperCase()}${tone.slice(1)}` as keyof typeof styles]}`}
          style={{ width: `${fillPercent}%` }}
        />
      </div>

      <div className={styles.healthMeterMeta}>
        <div>
          <p className={styles.healthMeterValue}>{formatMiles(remainingMiles)} left</p>
          <p className={styles.healthMeterSubtext}>
            {formatPercent(remainingPercent)} remaining
          </p>
        </div>
        <p
          className={`${styles.healthMeterStatus} ${
            alertLevel === "warning"
              ? styles.healthMeterStatusWarning
              : alertLevel === "critical"
                ? styles.healthMeterStatusCritical
                : alertLevel === "expired"
                  ? styles.healthMeterStatusExpired
                  : ""
          }`}
        >
          {statusLabel}
        </p>
      </div>
    </div>
  );
}
