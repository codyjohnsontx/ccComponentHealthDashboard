"use client";

import Link from "next/link";

import { ConnectCard } from "@/src/features/cc-component-health/components/ConnectCard";
import { HealthMeter } from "@/src/features/cc-component-health/components/HealthMeter";
import styles from "@/src/features/cc-component-health/components/feature.module.css";
import {
  canConnectStrava,
  getStravaModeLabel
} from "@/src/features/cc-component-health/config/strava";
import { useDemoState } from "@/src/features/cc-component-health/context/DemoStateProvider";
import { retailers } from "@/src/features/cc-component-health/data/retailers";
import {
  formatCurrency,
  formatMiles
} from "@/src/features/cc-component-health/lib/formatting";

export default function ComponentHealthLandingPage() {
  const {
    state,
    bikes,
    activities,
    totalRideMiles,
    componentHealth,
    alerts,
    connectMockStrava,
    resetDemoState
  } = useDemoState();

  const previewComponents = [...componentHealth]
    .sort((left, right) => left.remainingPercent - right.remainingPercent)
    .slice(0, 3);
  const urgentComponent = previewComponents[0];

  return (
    <div className={styles.desktopThreeCol}>
      <aside className={styles.leftRail}>
        <ConnectCard
          athleteName={state.athleteName}
          activityCount={activities.length}
          connected={state.stravaConnected}
          connectDisabled={!canConnectStrava(state.stravaMode)}
          modeLabel={getStravaModeLabel(state.stravaMode)}
          onConnect={connectMockStrava}
          primaryHref="/projects/cc-component-health/dashboard"
        />

        <section className={styles.panel}>
          <p className="eyebrow">Account summary</p>
          <h2 className={styles.sectionTitle}>Current state</h2>
          <div className={styles.compactStatList}>
            <div className={styles.compactStatItem}>
              <span className={styles.muted}>Bikes tracked</span>
              <strong>{bikes.length}</strong>
            </div>
            <div className={styles.compactStatItem}>
              <span className={styles.muted}>Rides attributed</span>
              <strong>{activities.length}</strong>
            </div>
            <div className={styles.compactStatItem}>
              <span className={styles.muted}>Miles tracked</span>
              <strong>{formatMiles(totalRideMiles)}</strong>
            </div>
            <div className={styles.compactStatItem}>
              <span className={styles.muted}>Alerts</span>
              <strong>{alerts.length}</strong>
            </div>
          </div>

          <div className={styles.inlineActions}>
            <Link className={styles.button} href="/projects/cc-component-health/dashboard">
              Open dashboard
            </Link>
            <button className={styles.buttonGhost} type="button" onClick={resetDemoState}>
              Reset account
            </button>
          </div>
        </section>
      </aside>

      <div className={styles.centerColumn}>
        <section className={styles.panel}>
          <div className={styles.pageHeader}>
            <p className="eyebrow">Gear Health</p>
            <h1 className={styles.pageTitle}>Bike-aware replacement timing</h1>
            <p className={styles.sectionText}>
              Ride attribution keeps each bike&apos;s wear model current and surfaces
              current replacement pricing when a part moves toward service.
            </p>
          </div>

          <div className={styles.statRow}>
            <div className={styles.stat}>
              <div className={styles.metricLabel}>Partner retailers</div>
              <div className={styles.statValue}>{retailers.length}</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.metricLabel}>Replacement opportunities</div>
              <div className={styles.statValue}>
                {componentHealth.filter((item) => item.alertLevel !== "none").length}
              </div>
            </div>
          </div>
        </section>

        {urgentComponent ? (
          <section className={styles.panel}>
            <div className={styles.cardHeader}>
              <div>
                <p className="eyebrow">Replacement timing</p>
                <h2 className={styles.sectionTitle}>{urgentComponent.component.label}</h2>
              </div>
              <span className={styles.statusBadge}>{urgentComponent.bikeName}</span>
            </div>

            <HealthMeter
              remainingPercent={urgentComponent.remainingPercent}
              remainingMiles={urgentComponent.remainingMiles}
              alertLevel={urgentComponent.alertLevel}
              label={urgentComponent.component.label}
            />

            <div className={styles.cardFooter}>
              <div>
                <p className={styles.metricLabel}>Best current price</p>
                <div className={styles.calloutValue}>
                  {urgentComponent.bestPriceOffer
                    ? formatCurrency(urgentComponent.bestPriceOffer.price)
                    : "Unavailable"}
                </div>
              </div>
              <Link
                className={styles.buttonGhost}
                href={`/projects/cc-component-health/component/${urgentComponent.componentId}`}
              >
                Review pricing
              </Link>
            </div>
          </section>
        ) : null}

        <section className={styles.panel}>
          <div className={styles.cardHeader}>
            <div>
              <p className="eyebrow">Current pricing</p>
              <h2 className={styles.sectionTitle}>Parts closest to replacement</h2>
            </div>
            <Link className={styles.buttonGhost} href="/projects/cc-component-health/dashboard">
              Full dashboard
            </Link>
          </div>

          <div className={styles.previewGrid}>
            {previewComponents.map((item) => (
              <article key={item.componentId} className={styles.previewCard}>
                <div className={styles.cardHeader}>
                  <div>
                    <p className="eyebrow">{item.bikeName}</p>
                    <h3 className={styles.sectionTitle}>{item.component.label}</h3>
                  </div>
                  <span className={styles.pill}>
                    {item.offerSummary.retailerCount} stores
                  </span>
                </div>

                <HealthMeter
                  compact
                  remainingPercent={item.remainingPercent}
                  remainingMiles={item.remainingMiles}
                  alertLevel={item.alertLevel}
                  label={item.component.label}
                />

                <div className={styles.previewCardFooter}>
                  <div>
                    <p className={styles.metricLabel}>Best current price</p>
                    <strong>
                      {item.bestPriceOffer
                        ? formatCurrency(item.bestPriceOffer.price)
                        : "Unavailable"}
                    </strong>
                  </div>
                  <Link
                    className={styles.buttonGhost}
                    href={`/projects/cc-component-health/component/${item.componentId}`}
                  >
                    Compare retailers
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <aside className={styles.rightRail}>
        <section className={styles.panel}>
          <p className="eyebrow">Alerts</p>
          <h2 className={styles.sectionTitle}>Active queue</h2>
          <div className={styles.railList}>
            {alerts.slice(0, 3).map((alert) => (
              <Link
                key={alert.id}
                className={styles.railListItem}
                href={`/projects/cc-component-health/component/${alert.componentId}`}
              >
                <strong>{alert.componentLabel}</strong>
                <span className={styles.muted}>{alert.bikeName}</span>
                <span className={styles.pill}>{Math.round(alert.remainingPercent * 100)}% left</span>
              </Link>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
