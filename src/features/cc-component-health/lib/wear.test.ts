import { describe, expect, it } from "vitest";

import { calculateComponentHealth, calculateMilesSinceInstall } from "@/src/features/cc-component-health/lib/wear";
import type { Activity, BikeComponent } from "@/src/features/cc-component-health/types";

const activities: Activity[] = [
  {
    id: "a-1",
    bikeId: "bike-1",
    date: "2026-01-01",
    distanceMiles: 25,
    title: "Before install",
    type: "ride"
  },
  {
    id: "a-2",
    bikeId: "bike-1",
    date: "2026-01-10",
    distanceMiles: 40,
    title: "After install 1",
    type: "ride"
  },
  {
    id: "a-3",
    bikeId: "bike-1",
    date: "2026-01-12",
    distanceMiles: 35,
    title: "After install 2",
    type: "ride"
  },
  {
    id: "a-4",
    bikeId: "bike-2",
    date: "2026-01-11",
    distanceMiles: 100,
    title: "Other bike ride",
    type: "ride"
  }
];

const component: BikeComponent = {
  id: "chain-1",
  bikeId: "bike-1",
  type: "chain",
  label: "Chain",
  serviceLifeMiles: 250,
  installDate: "2026-01-05",
  baselineMiles: 20,
  replacementCount: 0
};

describe("wear calculations", () => {
  it("adds baseline miles plus rides after install date", () => {
    expect(calculateMilesSinceInstall(component, activities)).toBe(95);
  });

  it("excludes rides before install date", () => {
    expect(calculateMilesSinceInstall(component, activities)).not.toBe(120);
  });

  it("ignores rides from other bikes", () => {
    expect(calculateMilesSinceInstall(component, activities)).toBe(95);
  });

  it("reduces consumed life under conservative sensitivity", () => {
    const conservative = calculateComponentHealth(component, activities, "conservative");
    const normal = calculateComponentHealth(component, activities, "normal");

    expect(conservative.milesSinceInstall).toBeLessThan(normal.milesSinceInstall);
  });

  it("increases consumed life under aggressive sensitivity", () => {
    const aggressive = calculateComponentHealth(component, activities, "aggressive");
    const normal = calculateComponentHealth(component, activities, "normal");

    expect(aggressive.milesSinceInstall).toBeGreaterThan(normal.milesSinceInstall);
  });

  it("clamps remaining miles at zero once service life is exceeded", () => {
    const wornOut = calculateComponentHealth(
      { ...component, serviceLifeMiles: 60 },
      activities,
      "aggressive"
    );

    expect(wornOut.remainingMiles).toBe(0);
  });

  it("computes remaining percent for non-edge cases", () => {
    const health = calculateComponentHealth(component, activities, "normal");

    expect(health.remainingPercent).toBeCloseTo(0.62, 2);
  });
});
