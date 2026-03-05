"use client";

import { trackEvent } from "@/src/features/cc-component-health/analytics/trackEvent";
import { AlertList } from "@/src/features/cc-component-health/components/AlertList";
import { EmptyState } from "@/src/features/cc-component-health/components/EmptyState";
import { useDemoState } from "@/src/features/cc-component-health/context/DemoStateProvider";
import styles from "@/src/features/cc-component-health/components/feature.module.css";

export default function ComponentHealthAlertsPage() {
  const {
    state,
    bikes,
    selectedBikeId,
    selectBike,
    filteredAlerts,
    isSetupComplete
  } = useDemoState();

  if (!state.stravaConnected) {
    return (
      <EmptyState
        title="Alerts are unavailable until ride sync is active."
        description="Gear Health derives alerts from bike-tagged ride mileage and current service thresholds."
        primaryHref="/projects/cc-component-health"
        primaryLabel="Open landing page"
      />
    );
  }

  if (!isSetupComplete) {
    return (
      <EmptyState
        title="No tracked components yet."
        description="Add bikes and component installs before expecting warning, critical, or expired alerts."
        primaryHref="/projects/cc-component-health/setup"
        primaryLabel="Open setup"
      />
    );
  }

  if (filteredAlerts.length === 0) {
    return (
      <EmptyState
        title="No alerts in the current bike view."
        description="No warning, critical, or expired thresholds are active for the selected bike filter."
        primaryHref="/projects/cc-component-health/dashboard"
        primaryLabel="Open dashboard"
      />
    );
  }

  return (
    <section className={styles.desktopTwoCol}>
      <div className={styles.centerColumn}>
        <section className={styles.panel}>
          <div className={styles.pageHeader}>
            <p className="eyebrow">Alerts</p>
            <h1 className={styles.pageTitle}>Active service queue</h1>
            <p className={styles.sectionText}>
              Alerts are ordered by severity and remaining life, with pricing attached
              to each part.
            </p>
          </div>

          <div className={styles.navTabs}>
            <button
              className={`${styles.navTab} ${selectedBikeId === "all" ? styles.navTabActive : ""}`}
              type="button"
              onClick={() => selectBike("all")}
            >
              All bikes
            </button>
            {bikes.map((bike) => (
              <button
                key={bike.id}
                className={`${styles.navTab} ${
                  selectedBikeId === bike.id ? styles.navTabActive : ""
                }`}
                type="button"
                onClick={() => selectBike(bike.id)}
              >
                {bike.name}
              </button>
            ))}
          </div>
        </section>

        <AlertList
          alerts={filteredAlerts}
          onAlertClick={(alert) =>
            trackEvent("alert_clicked", {
              componentId: alert.componentId,
              bikeId: alert.bikeId,
              catalogKey: alert.catalogKey,
              price: alert.bestPriceStartingAt,
              remainingMiles: alert.remainingMiles,
              remainingPercent: alert.remainingPercent
            })
          }
        />
      </div>

      <aside className={styles.rightRail}>
        <section className={styles.panel}>
          <p className="eyebrow">Current view</p>
          <h2 className={styles.sectionTitle}>
            {selectedBikeId === "all"
              ? "All bikes"
              : bikes.find((bike) => bike.id === selectedBikeId)?.name ?? "Bike"}
          </h2>
          <div className={styles.compactStatList}>
            <div className={styles.compactStatItem}>
              <span className={styles.muted}>Alerts shown</span>
              <strong>{filteredAlerts.length}</strong>
            </div>
            <div className={styles.compactStatItem}>
              <span className={styles.muted}>Bikes in account</span>
              <strong>{bikes.length}</strong>
            </div>
          </div>
        </section>
      </aside>
    </section>
  );
}
