import type {
  Activity,
  BikeComponent,
  CountdownPoint,
  WearSensitivity
} from "@/src/features/cc-component-health/types";

import { getSensitivityMultiplier } from "@/src/features/cc-component-health/lib/sensitivity";

export function buildCountdownSeries(
  component: BikeComponent,
  activities: Activity[],
  sensitivity: WearSensitivity
): CountdownPoint[] {
  const installDateMs = new Date(component.installDate).getTime();
  const multiplier = getSensitivityMultiplier(sensitivity);
  const relevantActivities = activities.filter(
    (activity) =>
      activity.bikeId === component.bikeId &&
      new Date(activity.date).getTime() >= installDateMs
  );

  let cumulativeMiles = component.baselineMiles;
  const points: CountdownPoint[] = [
    {
      date: component.installDate,
      remainingMiles: Math.max(
        0,
        component.serviceLifeMiles - cumulativeMiles * multiplier
      )
    }
  ];

  relevantActivities.forEach((activity) => {
    cumulativeMiles += activity.distanceMiles;
    points.push({
      date: activity.date,
      remainingMiles: Math.max(
        0,
        component.serviceLifeMiles - cumulativeMiles * multiplier
      )
    });
  });

  return points;
}

export function buildSvgPath(
  points: CountdownPoint[],
  width: number,
  height: number
): string {
  if (points.length === 0) {
    return "";
  }

  if (points.length === 1) {
    return `M 0 ${height / 2} L ${width} ${height / 2}`;
  }

  const maxY = Math.max(...points.map((point) => point.remainingMiles), 1);

  return points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - (point.remainingMiles / maxY) * height;
      const command = index === 0 ? "M" : "L";
      return `${command} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}
