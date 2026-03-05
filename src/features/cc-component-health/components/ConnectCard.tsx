"use client";

import Link from "next/link";

import styles from "@/src/features/cc-component-health/components/feature.module.css";

interface ConnectCardProps {
  athleteName: string;
  activityCount: number;
  connected: boolean;
  connectDisabled: boolean;
  modeLabel: string;
  onConnect: () => void;
  primaryHref: string;
}

export function ConnectCard({
  athleteName,
  activityCount,
  connected,
  connectDisabled,
  modeLabel,
  onConnect,
  primaryHref
}: ConnectCardProps) {
  return (
    <section className={`${styles.panel} ${styles.connectCard}`}>
      <div className={styles.cardHeader}>
        <div>
          <p className="eyebrow">{connected ? "Account" : "Ride sync"}</p>
          <h2 className={styles.sectionTitle}>
            {connected ? athleteName : "Connect ride history"}
          </h2>
        </div>
        <span className={styles.statusBadge}>{modeLabel}</span>
      </div>

      <p className={styles.sectionText}>
        {connected
          ? `${activityCount} tagged rides are flowing into Gear Health for bike-aware service tracking.`
          : "Connect ride history to start bike-aware wear tracking and retailer comparison."}
      </p>

      <div className={styles.statRow}>
        <div className={styles.stat}>
          <div className={styles.metricLabel}>Activities ready</div>
          <div className={styles.statValue}>{activityCount}</div>
        </div>
      </div>

      <div className={styles.connectActions}>
        {!connected ? (
          <button
            className={`${styles.button} ${connectDisabled ? styles.buttonDisabled : ""}`}
            disabled={connectDisabled}
            type="button"
            onClick={onConnect}
          >
            Connect rides
          </button>
        ) : (
          <Link className={styles.button} href={primaryHref}>
            Open dashboard
          </Link>
        )}

        <Link className={styles.buttonGhost} href="/projects/cc-component-health/setup">
          Manage bikes
        </Link>
      </div>
    </section>
  );
}
