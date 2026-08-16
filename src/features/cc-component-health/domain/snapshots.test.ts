import { describe, expect, it, vi } from "vitest";

import type { ComponentHealth } from "@/src/features/cc-component-health/types";

// buildGearHealthSnapshot resolves each health entry back to its component. The
// two lists come from the same source today, so force them apart to prove a
// stray entry is skipped rather than crashing the whole snapshot.
vi.mock("@/src/features/cc-component-health/lib/wear", async () => {
  const actual = await vi.importActual<
    typeof import("@/src/features/cc-component-health/lib/wear")
  >("@/src/features/cc-component-health/lib/wear");

  return {
    ...actual,
    calculateAllComponentHealth: (
      ...args: Parameters<typeof actual.calculateAllComponentHealth>
    ): ComponentHealth[] => {
      const health = actual.calculateAllComponentHealth(...args);

      return [...health, { ...health[0], componentId: "component-does-not-exist" }];
    }
  };
});

describe("buildGearHealthSnapshot", () => {
  it("skips health entries whose component is missing from state", async () => {
    const { getMockFeatureBootstrap } = await import(
      "@/src/features/cc-component-health/adapters/mock/bootstrap"
    );
    const { buildGearHealthSnapshot } = await import(
      "@/src/features/cc-component-health/domain/snapshots"
    );

    const bootstrap = getMockFeatureBootstrap();
    const snapshot = buildGearHealthSnapshot(bootstrap, "all");

    expect(snapshot.componentHealth.length).toBe(bootstrap.state.components.length);
    expect(
      snapshot.componentHealth.some(
        (item) => item.componentId === "component-does-not-exist"
      )
    ).toBe(false);
  });
});
