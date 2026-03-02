"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useDemoState } from "@/src/features/cc-component-health/context/DemoStateProvider";
import styles from "@/src/features/cc-component-health/components/feature.module.css";

const navItems = [
  { href: "/projects/cc-component-health", label: "Landing" },
  { href: "/projects/cc-component-health/setup", label: "Setup" },
  { href: "/projects/cc-component-health/dashboard", label: "Dashboard" },
  { href: "/projects/cc-component-health/alerts", label: "Alerts" }
];

export function FeatureShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { hydrated, state, alerts, componentHealth } = useDemoState();

  if (!hydrated) {
    return (
      <main className={styles.page}>
        <div className={styles.loading}>Loading ride and component state...</div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.topNav}>
            <div className={styles.navTabs}>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/projects/cc-component-health" &&
                    pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    className={`${styles.navTab} ${
                      isActive ? styles.navTabActive : ""
                    }`}
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <div className={styles.statusRow}>
              <span className={styles.statusBadge}>
                {state.stravaConnected ? "Strava connected" : "Strava not connected"}
              </span>
              <span className={`${styles.statusBadge} ${styles.statusMuted}`}>
                {componentHealth.length} components tracked
              </span>
              <span className={`${styles.statusBadge} ${styles.statusMuted}`}>
                {alerts.length} active alerts
              </span>
            </div>
          </div>

          <div className={styles.heroGrid}>
            <div className={styles.stack}>
              <p className="eyebrow">Competitive Cyclist Demo</p>
              <h1 className={styles.heroTitle}>Ride miles translated into bike maintenance timing.</h1>
              <p className={styles.heroText}>
                Mock Strava ride history powers component wear countdowns, replacement alerts,
                and recovery-state coupons for a single-bike performance workflow.
              </p>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Athlete</div>
                <div className={styles.metricValue}>{state.athleteName}</div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Sensitivity</div>
                <div className={styles.metricValue}>
                  {state.bike?.wearSensitivity ?? "normal"}
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Bike</div>
                <div className={styles.metricValue}>{state.bike?.name ?? "Not set"}</div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Alerts</div>
                <div className={styles.metricValue}>{alerts.length}</div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.content}>{children}</section>
      </div>
    </main>
  );
}
