import type { WearSensitivity } from "@/src/features/cc-component-health/types";

export function getSensitivityMultiplier(sensitivity: WearSensitivity): number {
  switch (sensitivity) {
    case "conservative":
      return 0.9;
    case "aggressive":
      return 1.15;
    case "normal":
    default:
      return 1;
  }
}
