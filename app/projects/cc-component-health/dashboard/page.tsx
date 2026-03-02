"use client";

import { useEffect } from "react";
import Link from "next/link";

import { trackEvent } from "@/src/features/cc-component-health/analytics/trackEvent";
import { ComponentCard } from "@/src/features/cc-component-health/components/ComponentCard";
import { EmptyState } from "@/src/features/cc-component-health/components/EmptyState";
import { useDemoState } from "@/src/features/cc-component-health/context/DemoStateProvider";
import { formatMiles } from "@/src/features/cc-component-health/lib/formatting";
import styles from "@/src/features/cc-component-health/components/feature.module.css";

const emittedDashboardEvents = new Set<string>();

export default function ComponentHealthDashboardPage() {
  const {
    state,
    componentHealth,
    totalRideMiles,
    alerts,
    isSetupComplete
  } = useDemoState();

  useEffect(() => {
    const key = "dashboard_viewed";

    if (emittedDashboardEvents.has(key)) {
      return;
    }

    emittedDashboardEvents.add(key);
    trackEvent("dashboard_viewed", {
      componentCount: componentHealth.length,
      activeAlerts: alerts.length
    });
  }, [alerts.length, componentHealth.length]);

  useEffect(() => {
    componentHealth
      .filter((item) => item.couponEligible)
      .forEach((item) => {
        const key = `coupon_shown:${item.componentId}`;

        if (emittedDashboardEvents.has(key)) {
          return;
        }

        emittedDashboardEvents.add(key);
        trackEvent("coupon_shown", {
          componentId: item.componentId,
          remainingMiles: item.remainingMiles,
          remainingPercent: item.remainingPercent
        });
      });
  }, [componentHealth]);

  if (!state.stravaConnected) {
    return (
      <EmptyState
        title="Connect the ride feed before loading health calculations."
        description="The dashboard needs imported cycling miles before it can compute wear countdowns."
        primaryHref="/projects/cc-component-health"
        primaryLabel="Open landing page"
      />
    );
  }

  if (!isSetupComplete) {
    return (
      <EmptyState
        title="Finish setup to generate dashboard health."
        description="Add a bike profile and at least one component preset to populate remaining miles, charts, and alerts."
        primaryHref="/projects/cc-component-health/setup"
        primaryLabel="Complete setup"
      />
    );
  }

  const couponCount = componentHealth.filter((item) => item.couponEligible).length;

  return (
    <section className={styles.stack}>
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.metricLabel}>Components</div>
          <div className={styles.statValue}>{componentHealth.length}</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.metricLabel}>Active alerts</div>
          <div className={styles.statValue}>{alerts.length}</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.metricLabel}>Coupon-ready</div>
          <div className={styles.statValue}>{couponCount}</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.metricLabel}>Ride miles</div>
          <div className={styles.statValue}>{formatMiles(totalRideMiles)}</div>
        </div>
      </div>

      <div className={styles.cardHeader}>
        <div>
          <p className="eyebrow">Component Health</p>
          <h2 className={styles.sectionTitle}>Remaining service life by wear item</h2>
        </div>
        <Link className={styles.buttonGhost} href="/projects/cc-component-health/alerts">
          View alerts
        </Link>
      </div>

      <div className={styles.componentGrid}>
        {componentHealth.map((item) => (
          <ComponentCard
            key={item.componentId}
            component={item.component}
            health={item}
            preset={item.preset}
            onReplacementShopClick={() =>
              trackEvent("shop_click_replacement", {
                componentId: item.componentId,
                source: "dashboard",
                remainingPercent: item.remainingPercent
              })
            }
          />
        ))}
      </div>
    </section>
  );
}
