"use client";

import { useState } from "react";

import { MOCK_COUPON_CODE } from "@/src/features/cc-component-health/lib/coupons";
import styles from "@/src/features/cc-component-health/components/feature.module.css";

interface CouponBannerProps {
  remainingMiles: number;
  onCopy: () => void;
}

export function CouponBanner({ remainingMiles, onCopy }: CouponBannerProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(MOCK_COUPON_CODE);
    }

    setCopied(true);
    onCopy();
  }

  return (
    <section className={styles.couponCard}>
      <div className={styles.cardHeader}>
        <div>
          <p className="eyebrow">Coupon State</p>
          <h2 className={styles.sectionTitle}>Replacement incentive unlocked</h2>
        </div>
        <span className={`${styles.pill} ${styles.pillSuccess}`}>Eligible</span>
      </div>

      <p className={styles.sectionText}>
        This component is within the final service window. Use the mock code below
        to simulate conversion nudges for replacement flow testing.
      </p>

      <div className={styles.inlineActions}>
        <span className={styles.couponCode}>{MOCK_COUPON_CODE}</span>
        <button className={styles.buttonSmall} type="button" onClick={handleCopy}>
          {copied ? "Copied" : "Copy coupon"}
        </button>
        <span className={styles.muted}>{Math.round(remainingMiles)} miles remaining</span>
      </div>
    </section>
  );
}
