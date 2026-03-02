export type WearSensitivity = "conservative" | "normal" | "aggressive";

export type StravaMode = "mock" | "real" | "disabled";

export type ComponentType =
  | "chain"
  | "front-tire"
  | "rear-tire"
  | "brake-pads"
  | "cassette"
  | "bar-tape-grips";

export type AlertLevel = "none" | "warning" | "critical" | "expired";

export interface Activity {
  id: string;
  date: string;
  distanceMiles: number;
  title: string;
  type: "ride";
}

export interface BikeProfile {
  id: string;
  name: string;
  discipline: "road" | "gravel" | "track" | "triathlon";
  wearSensitivity: WearSensitivity;
}

export interface ComponentPreset {
  type: ComponentType;
  label: string;
  defaultServiceLifeMiles: number;
  shopCategoryUrl: string;
  toolsNeeded: string[];
}

export interface BikeComponent {
  id: string;
  type: ComponentType;
  label: string;
  serviceLifeMiles: number;
  installDate: string;
  baselineMiles: number;
  position?: "front" | "rear";
  notes?: string;
  replacementCount: number;
}

export interface CountdownPoint {
  date: string;
  remainingMiles: number;
}

export interface ComponentHealth {
  componentId: string;
  milesSinceInstall: number;
  rawMilesSinceInstall: number;
  remainingMiles: number;
  remainingPercent: number;
  alertLevel: AlertLevel;
  couponEligible: boolean;
  countdownSeries: CountdownPoint[];
  sensitivityMultiplier: number;
}

export interface HealthAlert {
  id: string;
  componentId: string;
  componentLabel: string;
  severity: Exclude<AlertLevel, "none">;
  remainingMiles: number;
  remainingPercent: number;
  thresholdTriggered: 0.25 | 0.1 | 0;
}

export interface DemoState {
  stravaConnected: boolean;
  stravaMode: StravaMode;
  athleteName: string;
  bike: BikeProfile | null;
  components: BikeComponent[];
}
