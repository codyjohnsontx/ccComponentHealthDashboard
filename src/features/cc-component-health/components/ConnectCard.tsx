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
    <section className={styles.panel}>
      <div className={styles.cardHeader}>
        <div>
          <p className="eyebrow">Strava Status</p>
          <h2 className={styles.sectionTitle}>Connect ride history</h2>
        </div>
        <span className={styles.statusBadge}>{modeLabel}</span>
      </div>

      <p className={styles.sectionText}>
        {connected
          ? `${athleteName} is linked to ${activityCount} mock cycling activities.`
          : "Link a mock Strava account to unlock ride ingestion and component wear modeling."}
      </p>

      <div className={styles.statRow}>
        <div className={styles.stat}>
          <div className={styles.metricLabel}>Connection</div>
          <div className={styles.statValue}>{connected ? "Connected" : "Not linked"}</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.metricLabel}>Activities ready</div>
          <div className={styles.statValue}>{activityCount}</div>
        </div>
      </div>

      <div className={styles.inlineActions}>
        {!connected ? (
          <button
            className={`${styles.button} ${connectDisabled ? styles.buttonDisabled : ""}`}
            disabled={connectDisabled}
            type="button"
            onClick={onConnect}
          >
            Connect mock Strava
          </button>
        ) : (
          <Link className={styles.button} href={primaryHref}>
            Continue
          </Link>
        )}

        <Link className={styles.buttonGhost} href="/projects/cc-component-health/setup">
          Review setup
        </Link>
      </div>
    </section>
  );
}
