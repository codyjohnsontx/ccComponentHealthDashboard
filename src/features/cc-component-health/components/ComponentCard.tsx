"use client";

import Link from "next/link";

import { formatMiles, formatPercent } from "@/src/features/cc-component-health/lib/formatting";
import type { ComponentHealth, ComponentPreset, BikeComponent } from "@/src/features/cc-component-health/types";
import { CountdownSparkline } from "@/src/features/cc-component-health/components/CountdownSparkline";
import styles from "@/src/features/cc-component-health/components/feature.module.css";

interface ComponentCardProps {
  component: BikeComponent;
  health: ComponentHealth;
  preset?: ComponentPreset;
  onReplacementShopClick: () => void;
}

function alertClass(alertLevel: ComponentHealth["alertLevel"]) {
  switch (alertLevel) {
    case "warning":
      return styles.pillWarning;
    case "critical":
      return styles.pillCritical;
    case "expired":
      return styles.pillExpired;
    default:
      return "";
  }
}

export function ComponentCard({
  component,
  health,
  preset,
  onReplacementShopClick
}: ComponentCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <p className="eyebrow">{component.type}</p>
          <h3 className={styles.sectionTitle}>{component.label}</h3>
        </div>
        <div className={styles.componentMeta}>
          {health.alertLevel !== "none" ? (
            <span className={`${styles.pill} ${alertClass(health.alertLevel)}`}>
              {health.alertLevel}
            </span>
          ) : null}
          {health.couponEligible ? (
            <span className={`${styles.pill} ${styles.pillSuccess}`}>Coupon ready</span>
          ) : null}
        </div>
      </div>

      <div className={styles.statRow}>
        <div className={styles.stat}>
          <div className={styles.metricLabel}>Remaining miles</div>
          <div className={styles.statValue}>{formatMiles(health.remainingMiles)}</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.metricLabel}>Remaining life</div>
          <div className={styles.statValue}>{formatPercent(health.remainingPercent)}</div>
        </div>
      </div>

      <CountdownSparkline points={health.countdownSeries} />

      <div className={styles.componentMeta}>
        <span className={styles.pill}>
          Service life {formatMiles(component.serviceLifeMiles)}
        </span>
        {component.position ? <span className={styles.pill}>{component.position}</span> : null}
        {preset ? <span className={styles.pill}>{preset.toolsNeeded.length} tools</span> : null}
      </div>

      <div className={styles.cardFooter}>
        <Link href={`/projects/cc-component-health/component/${component.id}`} className={styles.buttonGhost}>
          View details
        </Link>
        {preset ? (
          <a
            className={styles.linkButton}
            href={preset.shopCategoryUrl}
            target="_blank"
            rel="noreferrer"
            onClick={onReplacementShopClick}
          >
            Shop replacements
          </a>
        ) : null}
      </div>
    </article>
  );
}
