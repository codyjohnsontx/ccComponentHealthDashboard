import { describe, expect, it } from "vitest";

import {
  getAlertsSnapshot,
  getComponentDetailSnapshot,
  getDashboardSnapshot
} from "@/src/features/cc-component-health/server/queries/getGearHealthSnapshots";

describe("gear health snapshots", () => {
  it("returns dashboard summaries with pricing signals", async () => {
    const snapshot = await getDashboardSnapshot();

    expect(snapshot.priorityItems.length).toBeGreaterThan(0);
    expect(snapshot.filteredComponentHealth[0]?.replacementReason).toBeTruthy();
  });

  it("returns detail snapshots with service history and offer freshness", async () => {
    const snapshot = await getComponentDetailSnapshot({
      componentId: "component-road-chain"
    });

    expect(snapshot.health?.offers[0]?.freshness).toBeTruthy();
    expect(snapshot.serviceHistory.length).toBeGreaterThan(0);
  });

  it("returns alerts snapshots with active bike name", async () => {
    const snapshot = await getAlertsSnapshot({ bikeId: "all" });

    expect(snapshot.activeBikeName).toBe("All bikes");
    expect(snapshot.filteredAlerts.length).toBeGreaterThan(0);
  });
});
