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
      return "Sync unavailable";
    case "real":
      return "Ride sync active";
    case "mock":
    default:
      return "Ride sync active";
  }
}
