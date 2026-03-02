import { describe, expect, it } from "vitest";

import { buildAlerts, getAlertLevel } from "@/src/features/cc-component-health/lib/alerts";
import { isCouponEligible } from "@/src/features/cc-component-health/lib/coupons";
import type { ComponentHealth } from "@/src/features/cc-component-health/types";

function createHealth(
  componentId: string,
  remainingPercent: number
): ComponentHealth & { componentLabel: string } {
  return {
    componentId,
    componentLabel: `Component ${componentId}`,
    rawMilesSinceInstall: 0,
    milesSinceInstall: 0,
    remainingMiles: Math.max(0, remainingPercent * 1000),
    remainingPercent: Math.max(0, remainingPercent),
    alertLevel: getAlertLevel(remainingPercent),
    couponEligible: isCouponEligible(remainingPercent),
    countdownSeries: [],
    sensitivityMultiplier: 1
  };
}

describe("threshold logic", () => {
  it("returns no alert above 25 percent", () => {
    expect(getAlertLevel(0.26)).toBe("none");
  });

  it("returns warning at exactly 25 percent", () => {
    expect(getAlertLevel(0.25)).toBe("warning");
  });

  it("returns critical at exactly 10 percent", () => {
    expect(getAlertLevel(0.1)).toBe("critical");
  });

  it("returns expired at exactly zero percent", () => {
    expect(getAlertLevel(0)).toBe("expired");
  });

  it("treats below-zero as expired after clamp-aware logic", () => {
    const alerts = buildAlerts([createHealth("expired", -0.2)]);

    expect(alerts[0]?.severity).toBe("expired");
  });

  it("flags coupon eligibility at exactly 5 percent", () => {
    expect(isCouponEligible(0.05)).toBe(true);
  });

  it("does not flag coupon eligibility above 5 percent", () => {
    expect(isCouponEligible(0.051)).toBe(false);
  });
});
