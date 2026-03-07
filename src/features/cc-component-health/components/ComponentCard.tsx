"use client";

import Link from "next/link";

import { HealthMeter } from "@/src/features/cc-component-health/components/HealthMeter";
import { formatCurrency, formatMiles } from "@/src/features/cc-component-health/lib/formatting";
import type {
  BikeComponent,
  ComponentPreset,
  ResolvedComponentHealth
} from "@/src/features/cc-component-health/types";
import styles from "@/src/features/cc-component-health/components/feature.module.css";

interface ComponentCardProps {
  component: BikeComponent;
  health: ResolvedComponentHealth;
  preset?: ComponentPreset;
}

export function ComponentCard({
  component,
  health,
  preset
}: ComponentCardProps) {
  const metadata = [
    `Service life ${formatMiles(component.serviceLifeMiles)}`,
    component.position
      ? `${component.position[0].toUpperCase()}${component.position.slice(1)}`
      : null,
    preset ? `${preset.toolsNeeded.length} tools` : null
  ].filter(Boolean) as string[];

  return (
    <article className={styles.card}>
      <div className={`${styles.cardHeader} ${styles.componentCardHeader}`}>
        <div>
          <p className="eyebrow">{health.bikeName}</p>
          <h3 className={styles.sectionTitle}>{component.label}</h3>
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

      <p className={styles.componentMetaText}>{metadata.join(" · ")}</p>
      <p className={styles.sectionText}>{health.replacementReason}</p>

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
