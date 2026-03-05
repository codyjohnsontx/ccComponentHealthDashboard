"use client";

import Link from "next/link";

import { HealthMeter } from "@/src/features/cc-component-health/components/HealthMeter";
import { formatCurrency, formatMiles } from "@/src/features/cc-component-health/lib/formatting";
import type {
  BikeComponent,
  ComponentHealth,
  ComponentPreset,
  OfferSummary,
  RetailerOffer
} from "@/src/features/cc-component-health/types";
import styles from "@/src/features/cc-component-health/components/feature.module.css";

interface ComponentCardProps {
  component: BikeComponent;
  health: ComponentHealth & {
    bikeName: string;
    bestPriceOffer: RetailerOffer | null;
    offerSummary: OfferSummary;
  };
  preset?: ComponentPreset;
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
  preset
}: ComponentCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <p className="eyebrow">{health.bikeName}</p>
          <h3 className={styles.sectionTitle}>{component.label}</h3>
        </div>
        <div className={styles.componentMeta}>
          {health.alertLevel !== "none" ? (
            <span className={`${styles.pill} ${alertClass(health.alertLevel)}`}>
              {health.alertLevel}
            </span>
          ) : null}
          {health.bestPriceOffer ? (
            <span className={`${styles.pill} ${styles.pillSuccess}`}>Best price</span>
          ) : null}
        </div>
      </div>

      <HealthMeter
        remainingPercent={health.remainingPercent}
        remainingMiles={health.remainingMiles}
        alertLevel={health.alertLevel}
        label={component.label}
      />

      <div className={styles.statRow}>
        <div className={styles.stat}>
          <div className={styles.metricLabel}>Best current price</div>
          <div className={styles.statValue}>
            {health.bestPriceOffer ? formatCurrency(health.bestPriceOffer.price) : "N/A"}
          </div>
        </div>
        <div className={styles.stat}>
          <div className={styles.metricLabel}>Retailers tracked</div>
          <div className={styles.statValue}>{health.offerSummary.retailerCount}</div>
        </div>
      </div>

      <div className={styles.componentMeta}>
        <span className={styles.pill}>
          Service life {formatMiles(component.serviceLifeMiles)}
        </span>
        {component.position ? <span className={styles.pill}>{component.position}</span> : null}
        {preset ? <span className={styles.pill}>{preset.toolsNeeded.length} tools</span> : null}
      </div>

      <div className={styles.cardFooter}>
        <Link
          href={`/projects/cc-component-health/component/${component.id}`}
          className={styles.buttonGhost}
        >
          Compare retailers
        </Link>
        <span className={styles.muted}>
          {preset?.replacementCategoryLabel ?? "Replacement part"} pricing
        </span>
      </div>
    </article>
  );
}
