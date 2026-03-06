"use client";

import { useEffect } from "react";
import Link from "next/link";

import { trackEvent } from "@/src/features/cc-component-health/analytics/trackEvent";
import { ComponentCard } from "@/src/features/cc-component-health/components/ComponentCard";
import { EmptyState } from "@/src/features/cc-component-health/components/EmptyState";
import { useDemoState } from "@/src/features/cc-component-health/context/DemoStateProvider";
import { formatCurrency, formatMiles } from "@/src/features/cc-component-health/lib/formatting";
import styles from "@/src/features/cc-component-health/components/feature.module.css";

const emittedDashboardEvents = new Set<string>();

export default function ComponentHealthDashboardPage() {
  const {
    state,
    activities,
    bikes,
    selectedBikeId,
    selectBike,
    totalRideMiles,
    filteredComponentHealth,
    filteredAlerts,
    isSetupComplete
  } = useDemoState();

  useEffect(() => {
    const key = "dashboard_viewed";

    if (emittedDashboardEvents.has(key)) {
      return;
    }

    emittedDashboardEvents.add(key);
    trackEvent("dashboard_viewed", {
      componentCount: filteredComponentHealth.length,
      activeAlerts: filteredAlerts.length,
      bikeId: selectedBikeId
    });
  }, [filteredAlerts.length, filteredComponentHealth.length, selectedBikeId]);

  useEffect(() => {
    filteredComponentHealth
      .filter((item) => item.bestPriceOffer)
      .forEach((item) => {
        const key = `best_price_shown:${item.componentId}:${selectedBikeId}`;

        if (emittedDashboardEvents.has(key)) {
          return;
        }

        emittedDashboardEvents.add(key);
        trackEvent("best_price_shown", {
          componentId: item.componentId,
          bikeId: item.bikeId,
          catalogKey: item.catalogKey,
          price: item.bestPriceOffer?.price,
          totalPrice: item.bestPriceOffer?.totalPrice,
          remainingPercent: item.remainingPercent
        });
      });
  }, [filteredComponentHealth, selectedBikeId]);

  if (!state.stravaConnected) {
    return (
      <EmptyState
        title="Ride sync must be active before loading Gear Health."
        description="The dashboard uses bike-tagged ride miles to calculate wear and compare part pricing."
        primaryHref="/projects/cc-component-health"
        primaryLabel="Open landing page"
      />
    );
  }

  if (!isSetupComplete) {
    return (
      <EmptyState
        title="Add at least one bike and tracked component."
        description="Gear Health needs bike setup and service installs before it can surface wear timing and retailer pricing."
        primaryHref="/projects/cc-component-health/setup"
        primaryLabel="Open bike setup"
      />
    );
  }

  const dueSoonCount = filteredComponentHealth.filter(
    (item) => item.alertLevel !== "none"
  ).length;
  const spendAtRisk = filteredComponentHealth
    .filter((item) => item.alertLevel !== "none" && item.bestPriceOffer)
    .reduce((sum, item) => sum + (item.bestPriceOffer?.price ?? 0), 0);
  const priorityItems = [...filteredComponentHealth]
    .sort((left, right) => left.remainingPercent - right.remainingPercent)
    .slice(0, 5);

  return (
    <section className={styles.desktopThreeCol}>
      <aside className={styles.leftRail}>
        <section className={styles.panel}>
          <p className="eyebrow">Bike filters</p>
          <div className={styles.filterGroup}>
            <button
              className={`${styles.filterPill} ${selectedBikeId === "all" ? styles.filterPillActive : ""}`}
              type="button"
              onClick={() => selectBike("all")}
            >
              All bikes
            </button>
            {bikes.map((bike) => (
              <button
                key={bike.id}
                className={`${styles.filterPill} ${
                  selectedBikeId === bike.id ? styles.filterPillActive : ""
                }`}
                type="button"
                onClick={() => selectBike(bike.id)}
              >
                {bike.name}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <p className="eyebrow">Account</p>
          <h2 className={styles.sectionTitle}>{state.athleteName}</h2>
          <div className={styles.compactStatList}>
            <div className={styles.compactStatItem}>
              <span className={styles.muted}>Rides</span>
              <strong>{activities.length}</strong>
            </div>
            <div className={styles.compactStatItem}>
              <span className={styles.muted}>Miles</span>
              <strong>{formatMiles(totalRideMiles)}</strong>
            </div>
            <div className={styles.compactStatItem}>
              <span className={styles.muted}>Alerts</span>
              <strong>{filteredAlerts.length}</strong>
            </div>
          </div>
          <Link className={styles.buttonGhost} href="/projects/cc-component-health/setup">
            Manage bikes
          </Link>
        </section>
      </aside>

      <div className={styles.centerColumn}>
        <section className={styles.panel}>
          <div className={styles.pageHeader}>
            <p className="eyebrow">Gear Health</p>
            <h1 className={styles.pageTitle}>Current replacement timing</h1>
            <p className={styles.sectionText}>
              Bike-tagged rides keep wear current and attach retailer pricing to each part.
            </p>
          </div>

          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <div className={styles.metricLabel}>Bikes tracked</div>
              <div className={styles.statValue}>{bikes.length}</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.metricLabel}>Components due soon</div>
              <div className={styles.statValue}>{dueSoonCount}</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.metricLabel}>Active alerts</div>
              <div className={styles.statValue}>{filteredAlerts.length}</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.metricLabel}>Spend at risk</div>
              <div className={styles.statValue}>
                {spendAtRisk > 0 ? formatCurrency(spendAtRisk) : "—"}
              </div>
            </div>
          </div>
        </section>

        <div className={styles.componentGrid}>
          {filteredComponentHealth.map((item) => (
            <ComponentCard
              key={item.componentId}
              component={item.component}
              health={item}
              preset={item.preset}
            />
          ))}
        </div>
      </div>

      <aside className={styles.rightRail}>
        <section className={styles.panel}>
          <div className={styles.cardHeader}>
            <div>
              <p className="eyebrow">Replacement timing</p>
              <h2 className={styles.sectionTitle}>Priority parts</h2>
            </div>
            {filteredAlerts.length > 0 && (
              <Link className={styles.buttonGhost} href="/projects/cc-component-health/alerts">
                Alerts
              </Link>
            )}
          </div>
          <div className={styles.railList}>
            {priorityItems.map((item) => (
              <Link
                key={item.componentId}
                className={styles.railListItem}
                href={`/projects/cc-component-health/component/${item.componentId}`}
              >
                <div className={styles.railListItemHeader}>
                  <strong>{item.component.label}</strong>
                  {item.alertLevel !== "none" && (
                    <span
                      className={`${styles.pill} ${
                        item.alertLevel === "expired"
                          ? styles.pillExpired
                          : item.alertLevel === "critical"
                            ? styles.pillCritical
                            : styles.pillWarning
                      }`}
                    >
                      {item.alertLevel}
                    </span>
                  )}
                </div>
                <span className={styles.muted}>
                  {item.bestPriceOffer
                    ? `${item.bestPriceOffer.price.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD"
                      })} best price · ${Math.round(item.remainingPercent * 100)}% left`
                    : `${Math.round(item.remainingPercent * 100)}% remaining`}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </aside>
    </section>
  );
}
