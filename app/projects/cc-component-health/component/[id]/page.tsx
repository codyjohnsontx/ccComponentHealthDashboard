"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { trackEvent } from "@/src/features/cc-component-health/analytics/trackEvent";
import { CouponBanner } from "@/src/features/cc-component-health/components/CouponBanner";
import { CountdownSparkline } from "@/src/features/cc-component-health/components/CountdownSparkline";
import { EmptyState } from "@/src/features/cc-component-health/components/EmptyState";
import { TOOLS_SHOP_URL } from "@/src/features/cc-component-health/data/componentPresets";
import { useDemoState } from "@/src/features/cc-component-health/context/DemoStateProvider";
import { formatDate, formatMiles, formatPercent } from "@/src/features/cc-component-health/lib/formatting";
import styles from "@/src/features/cc-component-health/components/feature.module.css";

const viewedComponentDetails = new Set<string>();

export default function ComponentHealthDetailPage() {
  const params = useParams<{ id: string }>();
  const componentId = params.id;
  const { state, getComponentById, getHealthByComponentId, markComponentReplaced } =
    useDemoState();

  const component = getComponentById(componentId);
  const health = getHealthByComponentId(componentId);

  useEffect(() => {
    if (!health || viewedComponentDetails.has(componentId)) {
      return;
    }

    viewedComponentDetails.add(componentId);
    trackEvent("component_detail_viewed", {
      componentId,
      remainingMiles: health.remainingMiles,
      remainingPercent: health.remainingPercent
    });
  }, [componentId, health]);

  if (!state.stravaConnected) {
    return (
      <EmptyState
        title="Connect Strava before opening component detail."
        description="The feature uses ride mileage to compute remaining service life and alert state."
        primaryHref="/projects/cc-component-health"
        primaryLabel="Open landing page"
      />
    );
  }

  if (!component || !health) {
    return (
      <EmptyState
        title="That component could not be found."
        description="The saved setup state does not include this component ID anymore."
        primaryHref="/projects/cc-component-health/dashboard"
        primaryLabel="Back to dashboard"
      />
    );
  }

  const toolsNeeded = health.preset?.toolsNeeded ?? [];

  return (
    <section className={styles.stack}>
      <section className={styles.detailCard}>
        <div className={styles.cardHeader}>
          <div>
            <p className="eyebrow">{component.type}</p>
            <h2 className={styles.sectionTitle}>{component.label}</h2>
          </div>
          <div className={styles.inlineActions}>
            <span className={styles.pill}>{formatPercent(health.remainingPercent)} left</span>
            {health.couponEligible ? (
              <span className={`${styles.pill} ${styles.pillSuccess}`}>Coupon ready</span>
            ) : null}
          </div>
        </div>

        <div className={styles.detailStatGrid}>
          <div className={styles.stat}>
            <div className={styles.metricLabel}>Remaining miles</div>
            <div className={styles.statValue}>{formatMiles(health.remainingMiles)}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.metricLabel}>Miles since install</div>
            <div className={styles.statValue}>{formatMiles(health.milesSinceInstall)}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.metricLabel}>Install date</div>
            <div className={styles.statValue}>{formatDate(component.installDate)}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.metricLabel}>Replacements logged</div>
            <div className={styles.statValue}>{component.replacementCount}</div>
          </div>
        </div>
      </section>

      <div className={styles.detailGrid}>
        <section className={styles.detailCard}>
          <div className={styles.cardHeader}>
            <div>
              <p className="eyebrow">Countdown Chart</p>
              <h2 className={styles.sectionTitle}>Remaining miles over ride history</h2>
            </div>
            <span className={styles.statusBadge}>
              x{health.sensitivityMultiplier.toFixed(2)} wear multiplier
            </span>
          </div>

          <CountdownSparkline points={health.countdownSeries} width={420} height={160} showAxes />
        </section>

        <section className={styles.detailCard}>
          <p className="eyebrow">Service Inputs</p>
          <h2 className={styles.sectionTitle}>Shop and maintenance context</h2>

          <ul className={styles.list}>
            <li>Service life: {formatMiles(component.serviceLifeMiles)}</li>
            <li>Baseline miles: {formatMiles(component.baselineMiles)}</li>
            <li>Raw miles since install: {formatMiles(health.rawMilesSinceInstall)}</li>
            <li>Notes: {component.notes?.trim() || "No notes added"}</li>
          </ul>

          <hr className={styles.divider} />

          <p className={styles.sectionText}>Tools needed</p>
          <ul className={styles.list}>
            {toolsNeeded.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>

          <div className={styles.inlineActions}>
            {health.preset ? (
              <a
                className={styles.button}
                href={health.preset.shopCategoryUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  trackEvent("shop_click_replacement", {
                    componentId: component.id,
                    source: "detail",
                    remainingPercent: health.remainingPercent
                  })
                }
              >
                Shop replacements
              </a>
            ) : null}

            <a
              className={styles.buttonGhost}
              href={TOOLS_SHOP_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() =>
                trackEvent("shop_click_tools", {
                  componentId: component.id,
                  componentType: component.type
                })
              }
            >
              Shop tools
            </a>
          </div>
        </section>
      </div>

      {health.couponEligible ? (
        <CouponBanner
          remainingMiles={health.remainingMiles}
          onCopy={() =>
            trackEvent("coupon_copied", {
              componentId: component.id,
              remainingMiles: health.remainingMiles,
              remainingPercent: health.remainingPercent
            })
          }
        />
      ) : null}

      <section className={styles.detailCard}>
        <div className={styles.cardHeader}>
          <div>
            <p className="eyebrow">Lifecycle Action</p>
            <h2 className={styles.sectionTitle}>Reset the component after replacement</h2>
          </div>
          <Link className={styles.buttonGhost} href="/projects/cc-component-health/dashboard">
            Back to dashboard
          </Link>
        </div>

        <p className={styles.sectionText}>
          Marking a replacement resets install date to today, clears baseline miles,
          and increments the replacement counter without changing the component type.
        </p>

        <button
          className={styles.button}
          type="button"
          onClick={() => markComponentReplaced(component.id)}
        >
          Mark replaced
        </button>
      </section>
    </section>
  );
}
