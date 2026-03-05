"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { StravaWordmark } from "@/src/features/cc-component-health/components/StravaWordmark";
import { useDemoState } from "@/src/features/cc-component-health/context/DemoStateProvider";
import styles from "@/src/features/cc-component-health/components/feature.module.css";

const featureNavItems = [
  { href: "/projects/cc-component-health", label: "Landing" },
  { href: "/projects/cc-component-health/setup", label: "Setup" },
  { href: "/projects/cc-component-health/dashboard", label: "Dashboard" },
  { href: "/projects/cc-component-health/alerts", label: "Alerts" }
];

const primaryNavItems = [
  { label: "Dashboard", active: true },
  { label: "Training", active: false },
  { label: "Maps", active: false },
  { label: "Challenges", active: false }
];

function BellIcon() {
  return (
    <svg aria-hidden="true" height="18" viewBox="0 0 24 24" width="18">
      <path
        d="M12 22a2.5 2.5 0 0 0 2.3-1.5h-4.6A2.5 2.5 0 0 0 12 22Zm7-5.2-1.7-1.8V11a5.3 5.3 0 0 0-4.1-5.2V5a1.2 1.2 0 0 0-2.4 0v.8A5.3 5.3 0 0 0 6.7 11v4l-1.7 1.8a.7.7 0 0 0 .5 1.2h13a.7.7 0 0 0 .5-1.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" height="18" viewBox="0 0 24 24" width="18">
      <path
        d="M11 5a1 1 0 1 1 2 0v6h6a1 1 0 1 1 0 2h-6v6a1 1 0 1 1-2 0v-6H5a1 1 0 1 1 0-2h6V5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function FeatureShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { hydrated, state, alerts, bikes, resetDemoState } = useDemoState();

  if (!hydrated) {
    return (
      <main className={styles.page}>
        <div className={styles.loading}>Loading ride and component state...</div>
      </main>
    );
  }

  const initials = state.athleteName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className={styles.page}>
      <header className={styles.appHeader}>
        <div className={styles.appHeaderInner}>
          <div className={styles.appHeaderLeft}>
            <Link
              aria-label="Strava Gear Health home"
              className={styles.brandLink}
              href="/projects/cc-component-health"
            >
              <StravaWordmark className={styles.brandWordmark} />
              <span className={styles.srOnly}>Strava Gear Health home</span>
            </Link>
            <nav aria-label="Primary" className={styles.primaryNav}>
              {primaryNavItems.map((item) => (
                <button
                  key={item.label}
                  className={`${styles.primaryNavItem} ${
                    item.active ? styles.primaryNavItemActive : ""
                  }`}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className={styles.utilityActions}>
            <button className={styles.utilityCta} type="button">
              Subscribe
            </button>
            <button
              aria-label="Notifications"
              className={styles.utilityIconButton}
              type="button"
            >
              <BellIcon />
              <span className={styles.utilityBadge}>{alerts.length}</span>
            </button>
            <button
              aria-label={`Signed in as ${state.athleteName}`}
              className={styles.utilityAvatar}
              type="button"
            >
              {initials}
            </button>
            <button aria-label="Create" className={styles.utilityIconButton} type="button">
              <PlusIcon />
            </button>
          </div>
        </div>
      </header>

      <div className={styles.subnavBar}>
        <div className={styles.subnavInner}>
          <nav aria-label="Gear Health sections" className={styles.navTabs}>
            {featureNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/projects/cc-component-health" &&
                  pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`${styles.navTab} ${isActive ? styles.navTabActive : ""}`}
                  href={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className={styles.subnavMeta}>
            <div className={styles.statusRow}>
              <span className={styles.statusBadge}>{state.athleteName}</span>
              <span className={`${styles.statusBadge} ${styles.statusMuted}`}>
                {bikes.length} bikes
              </span>
              <span className={`${styles.statusBadge} ${styles.statusMuted}`}>
                {alerts.length} alerts
              </span>
            </div>
            <button className={styles.buttonGhost} type="button" onClick={resetDemoState}>
              Restore defaults
            </button>
          </div>
        </div>
      </div>

      <div className={styles.shell}>
        <section className={styles.content}>{children}</section>
      </div>
    </main>
  );
}
