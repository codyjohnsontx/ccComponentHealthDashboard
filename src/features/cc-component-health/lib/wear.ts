import { getAlertLevel } from "@/src/features/cc-component-health/lib/alerts";
import { buildCountdownSeries } from "@/src/features/cc-component-health/lib/chartSeries";
import { isCouponEligible } from "@/src/features/cc-component-health/lib/coupons";
import { getSensitivityMultiplier } from "@/src/features/cc-component-health/lib/sensitivity";
import type {
  Activity,
  BikeComponent,
  ComponentHealth,
  WearSensitivity
} from "@/src/features/cc-component-health/types";

export function calculateMilesSinceInstall(
  component: BikeComponent,
  activities: Activity[]
): number {
  const installDateMs = new Date(component.installDate).getTime();
  const trackedMiles = activities.reduce((total, activity) => {
    if (new Date(activity.date).getTime() < installDateMs) {
      return total;
    }

    return total + activity.distanceMiles;
  }, 0);

  return component.baselineMiles + trackedMiles;
}

export function calculateComponentHealth(
  component: BikeComponent,
  activities: Activity[],
  sensitivity: WearSensitivity
): ComponentHealth {
  const rawMilesSinceInstall = calculateMilesSinceInstall(component, activities);
  const sensitivityMultiplier = getSensitivityMultiplier(sensitivity);
  const milesSinceInstall = rawMilesSinceInstall * sensitivityMultiplier;
  const remainingMiles = Math.max(0, component.serviceLifeMiles - milesSinceInstall);
  const remainingPercent =
    component.serviceLifeMiles <= 0 ? 0 : remainingMiles / component.serviceLifeMiles;

  return {
    componentId: component.id,
    rawMilesSinceInstall,
    milesSinceInstall,
    remainingMiles,
    remainingPercent,
    alertLevel: getAlertLevel(remainingPercent),
    couponEligible: isCouponEligible(remainingPercent),
    countdownSeries: buildCountdownSeries(component, activities, sensitivity),
    sensitivityMultiplier
  };
}

export function calculateAllComponentHealth(
  components: BikeComponent[],
  activities: Activity[],
  sensitivity: WearSensitivity
): ComponentHealth[] {
  return components.map((component) =>
    calculateComponentHealth(component, activities, sensitivity)
  );
}

export { getSensitivityMultiplier } from "@/src/features/cc-component-health/lib/sensitivity";
