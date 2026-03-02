"use client";

import { trackEvent } from "@/src/features/cc-component-health/analytics/trackEvent";
import { AlertList } from "@/src/features/cc-component-health/components/AlertList";
import { EmptyState } from "@/src/features/cc-component-health/components/EmptyState";
import { useDemoState } from "@/src/features/cc-component-health/context/DemoStateProvider";
import styles from "@/src/features/cc-component-health/components/feature.module.css";

export default function ComponentHealthAlertsPage() {
  const { state, alerts, isSetupComplete } = useDemoState();

  if (!state.stravaConnected) {
    return (
      <EmptyState
        title="Alerts are empty until a ride feed is connected."
        description="The alerts list is derived from current remaining life thresholds and only appears after setup."
        primaryHref="/projects/cc-component-health"
        primaryLabel="Open landing page"
      />
    );
  }

  if (!isSetupComplete) {
    return (
      <EmptyState
        title="No component setup yet."
        description="Add a bike profile and wear items before expecting warning, critical, or expired alerts."
        primaryHref="/projects/cc-component-health/setup"
        primaryLabel="Go to setup"
      />
    );
  }

  if (alerts.length === 0) {
    return (
      <EmptyState
        title="All components are healthy."
        description="No warning, critical, or expired thresholds are active in the current demo state."
        primaryHref="/projects/cc-component-health/dashboard"
        primaryLabel="Open dashboard"
      />
    );
  }

  return (
    <section className={styles.stack}>
      <div className={styles.panel}>
        <p className="eyebrow">Alert Queue</p>
        <h2 className={styles.sectionTitle}>Prioritized maintenance interventions</h2>
        <p className={styles.sectionText}>
          Alerts are sorted by severity first and by the lowest remaining percentage second.
        </p>
      </div>

      <AlertList
        alerts={alerts}
        onAlertClick={(alert) =>
          trackEvent("alert_clicked", {
            componentId: alert.componentId,
            remainingMiles: alert.remainingMiles,
            remainingPercent: alert.remainingPercent
          })
        }
      />
    </section>
  );
}
