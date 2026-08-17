import { describe, expect, it } from "vitest";

import {
  getHealthStatusLabel,
  getHealthTone,
  getMeterFillPercent
} from "@/src/features/cc-component-health/lib/healthPresentation";

describe("health presentation helpers", () => {
  it("returns healthy above 25 percent", () => {
    expect(getHealthTone("none")).toBe("healthy");
  });

  it("returns warning at 25 percent", () => {
    expect(getHealthTone("warning")).toBe("warning");
  });

  it("returns critical at 10 percent", () => {
    expect(getHealthTone("critical")).toBe("critical");
  });

  it("returns expired at 0 percent", () => {
    expect(getHealthTone("expired")).toBe("expired");
  });

  it("maps status labels correctly", () => {
    expect(getHealthStatusLabel("none")).toBe("Healthy");
    expect(getHealthStatusLabel("warning")).toBe("Service soon");
    expect(getHealthStatusLabel("critical")).toBe("Critical wear");
    expect(getHealthStatusLabel("expired")).toBe("Replace now");
  });

  it("fills the meter based on used service life", () => {
    expect(getMeterFillPercent(1)).toBe(0);
    expect(getMeterFillPercent(0.22)).toBe(78);
    expect(getMeterFillPercent(0)).toBe(100);
  });
});
