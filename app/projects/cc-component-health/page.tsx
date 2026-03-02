"use client";

import Link from "next/link";

import { ConnectCard } from "@/src/features/cc-component-health/components/ConnectCard";
import styles from "@/src/features/cc-component-health/components/feature.module.css";
import { getStravaModeLabel, canConnectStrava } from "@/src/features/cc-component-health/config/strava";
import { useDemoState } from "@/src/features/cc-component-health/context/DemoStateProvider";
import { formatMiles } from "@/src/features/cc-component-health/lib/formatting";

export default function ComponentHealthLandingPage() {
  const {
    state,
    activities,
    totalRideMiles,
    componentHealth,
    alerts,
    isSetupComplete,
    connectMockStrava
  } = useDemoState();

  const primaryHref = isSetupComplete
    ? "/projects/cc-component-health/dashboard"
    : "/projects/cc-component-health/setup";

  return (
    <div className={styles.grid2}>
      <ConnectCard
        athleteName={state.athleteName}
        activityCount={activities.length}
        connected={state.stravaConnected}
        connectDisabled={!canConnectStrava(state.stravaMode)}
        modeLabel={getStravaModeLabel(state.stravaMode)}
        onConnect={connectMockStrava}
        primaryHref={primaryHref}
      />

      <section className={styles.panel}>
        <p className="eyebrow">How It Works</p>
        <h2 className={styles.sectionTitle}>Miles in, maintenance urgency out.</h2>
        <p className={styles.sectionText}>
          This MVP maps ride mileage against service-life presets for critical wear items.
          The countdown updates when install dates or baseline miles change, and coupon
          state appears when a replacement moment is close.
        </p>

        <div className={styles.statRow}>
          <div className={styles.stat}>
            <div className={styles.metricLabel}>Mock ride miles</div>
            <div className={styles.statValue}>{formatMiles(totalRideMiles)}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.metricLabel}>Tracked components</div>
            <div className={styles.statValue}>{componentHealth.length}</div>
          </div>
        </div>

        <div className={styles.inlineActions}>
          <Link className={styles.button} href="/projects/cc-component-health/setup">
            Configure bike
          </Link>
          <Link className={styles.buttonGhost} href="/projects/cc-component-health/dashboard">
            Preview dashboard
          </Link>
        </div>
      </section>

      <section className={styles.panel}>
        <p className="eyebrow">Current Demo State</p>
        <h2 className={styles.sectionTitle}>Operational status</h2>

        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.metricLabel}>Strava</div>
            <div className={styles.statValue}>
              {state.stravaConnected ? "Connected" : "Pending"}
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.metricLabel}>Bike setup</div>
            <div className={styles.statValue}>{state.bike ? "Saved" : "Missing"}</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.metricLabel}>Alerts</div>
            <div className={styles.statValue}>{alerts.length}</div>
          </div>
        </div>
      </section>

      <section className={styles.panel}>
        <p className="eyebrow">Suggested Flow</p>
        <h2 className={styles.sectionTitle}>Recommended clicks for a PM walkthrough</h2>
        <ul className={styles.list}>
          <li>Connect the mock Strava account.</li>
          <li>Save the bike profile and add common wear components.</li>
          <li>Open the dashboard to compare remaining miles, alerts, and coupon readiness.</li>
          <li>Drill into one component to review tools, replacement links, and reset state.</li>
        </ul>
      </section>
    </div>
  );
}
