"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";

import { trackEvent } from "@/src/features/cc-component-health/analytics/trackEvent";
import { CountdownSparkline } from "@/src/features/cc-component-health/components/CountdownSparkline";
import { EmptyState } from "@/src/features/cc-component-health/components/EmptyState";
import { HealthMeter } from "@/src/features/cc-component-health/components/HealthMeter";
import { useDemoState } from "@/src/features/cc-component-health/context/DemoStateProvider";
import { retailerMap } from "@/src/features/cc-component-health/data/retailers";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatMiles,
  formatPercent
} from "@/src/features/cc-component-health/lib/formatting";
import styles from "@/src/features/cc-component-health/components/feature.module.css";

const viewedComponentDetails = new Set<string>();
const viewedOfferPanels = new Set<string>();

export default function ComponentHealthDetailPage() {
  const params = useParams<{ id: string }>();
  const componentId = params.id;
  const { state, getComponentById, getHealthByComponentId, markComponentReplaced } =
    useDemoState();

  const component = getComponentById(componentId);
  const health = getHealthByComponentId(componentId);
  const pricingSectionRef = useRef<HTMLElement | null>(null);

  function scrollToPricing() {
    pricingSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  useEffect(() => {
    if (!health || viewedComponentDetails.has(componentId)) {
      return;
    }

    viewedComponentDetails.add(componentId);
    trackEvent("component_detail_viewed", {
      componentId,
      bikeId: health.bikeId,
      catalogKey: health.catalogKey,
      remainingMiles: health.remainingMiles,
      remainingPercent: health.remainingPercent
    });
  }, [componentId, health]);

  useEffect(() => {
    if (!health) {
      return;
    }

    const key = `offers_viewed:${componentId}`;

    if (!viewedOfferPanels.has(key)) {
      viewedOfferPanels.add(key);
      trackEvent("offers_viewed", {
        componentId,
        bikeId: health.bikeId,
        catalogKey: health.catalogKey,
        retailerCount: health.offerSummary.retailerCount,
        remainingPercent: health.remainingPercent
      });
    }

    if (health.bestPriceOffer && !viewedOfferPanels.has(`best:${componentId}`)) {
      viewedOfferPanels.add(`best:${componentId}`);
      trackEvent("best_price_shown", {
        componentId,
        bikeId: health.bikeId,
        catalogKey: health.catalogKey,
        retailerId: health.bestPriceOffer.retailerId,
        price: health.bestPriceOffer.price,
        totalPrice: health.bestPriceOffer.totalPrice,
        remainingPercent: health.remainingPercent
      });
    }
  }, [componentId, health]);

  if (!state.stravaConnected) {
    return (
      <EmptyState
        title="Ride sync is required before opening component detail."
        description="Component detail depends on bike-tagged ride mileage to compute wear and compare partner retailer pricing."
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
    <section className={styles.desktopTwoCol}>
      <div className={styles.centerColumn}>
        <section className={`${styles.detailCard} ${styles.detailSummaryCard}`}>
          <div className={styles.cardHeader}>
            <div className={styles.pageHeader}>
              <p className="eyebrow">{health.bikeName}</p>
              <h1 className={styles.pageTitle}>{component.label}</h1>
            </div>
            <div className={styles.componentMeta}>
              <span className={styles.pill}>{formatPercent(health.remainingPercent)} left</span>
              {health.bestPriceOffer ? (
                <button
                  className={`${styles.pill} ${styles.pillSuccess} ${styles.pillButton}`}
                  type="button"
                  onClick={scrollToPricing}
                >
                  Best price {formatCurrency(health.bestPriceOffer.price)}
                </button>
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
              <div className={styles.metricLabel}>Current bike</div>
              <div className={styles.statValue}>{health.bikeName}</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.metricLabel}>Replacements logged</div>
              <div className={styles.statValue}>{component.replacementCount}</div>
            </div>
          </div>
        </section>

        <section className={styles.detailCard}>
          <div className={styles.cardHeader}>
            <div>
              <p className="eyebrow">Wear trend</p>
              <h2 className={styles.sectionTitle}>Remaining miles across ride history</h2>
            </div>
            <span className={styles.statusBadge}>
              x{health.sensitivityMultiplier.toFixed(2)} wear multiplier
            </span>
          </div>

          <div className={styles.wearTrendChartWrap}>
            <CountdownSparkline
              points={health.countdownSeries}
              width={420}
              height={160}
              showAxes
            />
          </div>
          <p className={styles.sectionText}>
            Derived from rides accumulated since the current install date.
          </p>
        </section>

        <section
          ref={pricingSectionRef}
          className={`${styles.detailCard} ${styles.pricingScrollTarget}`}
        >
          <div className={styles.cardHeader}>
            <div>
              <p className="eyebrow">Current pricing</p>
              <h2 className={styles.sectionTitle}>Retailer comparison</h2>
            </div>
            <span className={styles.statusBadge}>
              {health.offerSummary.availableOfferCount}/{health.offerSummary.retailerCount} in stock
            </span>
          </div>

          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <div className={styles.metricLabel}>Lowest listed price</div>
              <div className={styles.statValue}>
                {health.bestPriceOffer
                  ? formatCurrency(health.bestPriceOffer.price)
                  : "Unavailable"}
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.metricLabel}>Lowest delivered total</div>
              <div className={styles.statValue}>
                {health.lowestDeliveredOffer
                  ? formatCurrency(health.lowestDeliveredOffer.totalPrice)
                  : "Unavailable"}
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.metricLabel}>Stores checked</div>
              <div className={styles.statValue}>{health.offerSummary.retailerCount}</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.metricLabel}>Last checked</div>
              <div className={styles.statValue}>
                {formatDateTime(health.offerSummary.lastCheckedAt)}
              </div>
            </div>
          </div>

          <div className={styles.offerTableHeader} aria-hidden="true">
            <span>Merchant</span>
            <span>Listed price</span>
            <span>Shipping</span>
            <span>Delivered total</span>
            <span>Availability</span>
            <span />
          </div>

          <div className={styles.offerTable}>
            {health.offers.map((offer) => {
              const retailer = retailerMap.get(offer.retailerId);
              const badgeLabel =
                offer.badge === "best_price"
                  ? "Best price"
                  : offer.badge === "lowest_delivered"
                    ? "Lowest delivered"
                    : null;

              return (
                <article key={offer.id} className={styles.offerRow}>
                  <div className={styles.offerTableRow}>
                    <div className={styles.offerRowMain}>
                      <p className="eyebrow">{retailer?.partnerLabel ?? "Retailer"}</p>
                      <h3 className={styles.sectionTitle}>{retailer?.name ?? offer.retailerId}</h3>
                      <p className={styles.sectionText}>{offer.productName}</p>
                      {badgeLabel ? (
                        <div className={styles.componentMeta}>
                          <span className={`${styles.pill} ${styles.pillSuccess}`}>
                            {badgeLabel}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <div className={styles.offerCell}>
                      <span className={styles.metricLabel}>Listed price</span>
                      <strong className={styles.offerCellValue}>
                        {formatCurrency(offer.price)}
                      </strong>
                    </div>

                    <div className={styles.offerCell}>
                      <span className={styles.metricLabel}>Shipping</span>
                      <strong className={styles.offerCellValue}>
                        {formatCurrency(offer.shippingPrice)}
                      </strong>
                    </div>

                    <div className={styles.offerCell}>
                      <span className={styles.metricLabel}>Delivered total</span>
                      <strong className={styles.offerTotalValue}>
                        {formatCurrency(offer.totalPrice)}
                      </strong>
                    </div>

                    <div className={styles.offerCell}>
                      <span className={styles.metricLabel}>Availability</span>
                      <span
                        className={`${styles.pill} ${
                          offer.inStock ? styles.pillSuccess : styles.pillExpired
                        }`}
                      >
                        {offer.availabilityLabel}
                      </span>
                    </div>

                    <div className={styles.offerCtaCell}>
                      <a
                        className={styles.button}
                        href={offer.affiliateUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() =>
                          trackEvent("affiliate_click", {
                            componentId: component.id,
                            bikeId: health.bikeId,
                            catalogKey: health.catalogKey,
                            retailerId: offer.retailerId,
                            price: offer.price,
                            totalPrice: offer.totalPrice,
                            remainingPercent: health.remainingPercent
                          })
                        }
                      >
                        Buy
                      </a>
                    </div>
                  </div>

                  <div className={styles.offerRowFooter}>
                    <span className={styles.muted}>
                      {retailer?.shippingPolicySummary ?? "Shipping details unavailable."}
                    </span>
                    <span className={styles.muted}>
                      Last checked {formatDateTime(offer.lastCheckedAt)}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>

          <p className={styles.sectionText}>
            Prices and availability are based on the latest partner data and may change.
            Purchases through partner links may earn Strava a commission.
          </p>
        </section>
      </div>

      <aside className={styles.rightRail}>
        <section className={styles.detailCard}>
          <p className="eyebrow">Current status</p>
          <h2 className={styles.sectionTitle}>Replacement timing</h2>
          <HealthMeter
            remainingPercent={health.remainingPercent}
            remainingMiles={health.remainingMiles}
            alertLevel={health.alertLevel}
            label={component.label}
          />
        </section>

        <section className={styles.detailCard}>
          <p className="eyebrow">Service context</p>
          <h2 className={styles.sectionTitle}>Bike and install details</h2>
          <ul className={styles.list}>
            <li>Install date: {formatDate(component.installDate)}</li>
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

          <hr className={styles.divider} />

          <p className={styles.sectionText}>Installed the new part?</p>
          <div className={styles.inlineActions}>
            <button
              className={styles.buttonSmall}
              type="button"
              onClick={() => markComponentReplaced(component.id)}
            >
              Mark replaced
            </button>
          </div>
        </section>
      </aside>
    </section>
  );
}
