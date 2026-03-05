import type { AlertLevel, HealthTone } from "@/src/features/cc-component-health/types";

export function getHealthTone(alertLevel: AlertLevel): HealthTone {
  switch (alertLevel) {
    case "warning":
      return "warning";
    case "critical":
      return "critical";
    case "expired":
      return "expired";
    case "none":
    default:
      return "healthy";
  }
}

export function getHealthStatusLabel(
  alertLevel: AlertLevel
): string {
  switch (alertLevel) {
    case "warning":
      return "Service soon";
    case "critical":
      return "Critical wear";
    case "expired":
      return "Replace now";
    case "none":
    default:
      return "Healthy";
  }
}

export function getMeterFillPercent(remainingPercent: number): number {
  const normalizedPercent = Math.max(0, Math.min(remainingPercent, 1)) * 100;

  if (normalizedPercent === 0) {
    return 6;
  }

  return normalizedPercent;
}
