import type {
  AlertLevel,
  ComponentHealth,
  HealthAlert
} from "@/src/features/cc-component-health/types";

export function getAlertLevel(remainingPercent: number): AlertLevel {
  if (remainingPercent <= 0) {
    return "expired";
  }

  if (remainingPercent <= 0.1) {
    return "critical";
  }

  if (remainingPercent <= 0.25) {
    return "warning";
  }

  return "none";
}

function getThreshold(alertLevel: AlertLevel): 0.25 | 0.1 | 0 | null {
  switch (alertLevel) {
    case "warning":
      return 0.25;
    case "critical":
      return 0.1;
    case "expired":
      return 0;
    default:
      return null;
  }
}

const severityOrder: Record<Exclude<AlertLevel, "none">, number> = {
  expired: 0,
  critical: 1,
  warning: 2
};

export function buildAlerts(
  healthItems: Array<ComponentHealth & { componentLabel: string; bikeId: string; bikeName: string }>
): HealthAlert[] {
  return healthItems
    .filter(
      (
        item
      ): item is ComponentHealth & {
        componentLabel: string;
        bikeId: string;
        bikeName: string;
        alertLevel: Exclude<AlertLevel, "none">;
      } => item.alertLevel !== "none"
    )
    .map((item) => ({
      id: `alert-${item.componentId}`,
      componentId: item.componentId,
      bikeId: item.bikeId,
      bikeName: item.bikeName,
      componentLabel: item.componentLabel,
      severity: item.alertLevel,
      remainingMiles: item.remainingMiles,
      remainingPercent: item.remainingPercent,
      thresholdTriggered: getThreshold(item.alertLevel) ?? 0
    }))
    .sort((left, right) => {
      const severityDelta = severityOrder[left.severity] - severityOrder[right.severity];

      if (severityDelta !== 0) {
        return severityDelta;
      }

      return left.remainingPercent - right.remainingPercent;
    });
}
