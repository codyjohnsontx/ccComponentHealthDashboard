import type { StravaMode } from "@/src/features/cc-component-health/types";

const DEFAULT_MODE: StravaMode = "mock";

export function getStravaMode(): StravaMode {
  const rawMode = process.env.NEXT_PUBLIC_CCCH_STRAVA_MODE;

  if (rawMode === "mock" || rawMode === "real" || rawMode === "disabled") {
    return rawMode;
  }

  return DEFAULT_MODE;
}

export function canConnectStrava(mode: StravaMode): boolean {
  return mode === "mock";
}

export function getStravaModeLabel(mode: StravaMode): string {
  switch (mode) {
    case "disabled":
      return "Disabled";
    case "real":
      return "Reserved for real OAuth";
    case "mock":
    default:
      return "Mock connect";
  }
}
