export type WearSensitivity = "conservative" | "normal" | "aggressive";

export type StravaMode = "mock" | "real" | "disabled";
export type BikeFilterId = string | "all";

export type ComponentType =
  | "chain"
  | "front-tire"
  | "rear-tire"
  | "brake-pads"
  | "cassette"
  | "bar-tape-grips";

export type AlertLevel = "none" | "warning" | "critical" | "expired";
export type HealthTone = "healthy" | "warning" | "critical" | "expired";
export type RetailerId =
  | "jenson-usa"
  | "competitive-cyclist"
  | "worldwide-cyclery"
  | "trek-bikes"
  | "rei";
export type OfferCatalogKey =
  | "road-chain"
  | "road-front-tire"
  | "road-rear-tire"
  | "gravel-front-tire"
  | "road-brake-pads"
  | "road-cassette"
  | "bar-tape";
export type OfferBadge =
  | "best_price"
  | "lowest_delivered"
  | "fastest_ship"
  | "popular_retailer"
  | "none";

export interface Activity {
  id: string;
  bikeId: string;
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
  catalogKey: OfferCatalogKey;
  replacementSearchLabel: string;
  replacementCategoryLabel: string;
  toolsNeeded: string[];
}

export interface BikeComponent {
  id: string;
  bikeId: string;
  type: ComponentType;
  label: string;
  serviceLifeMiles: number;
  installDate: string;
  baselineMiles: number;
  position?: "front" | "rear";
  catalogKey?: OfferCatalogKey;
  replacementSearchLabel?: string;
  notes?: string;
  replacementCount: number;
}

export interface CountdownPoint {
  date: string;
  remainingMiles: number;
}

export interface ComponentHealth {
  componentId: string;
  bikeId: string;
  milesSinceInstall: number;
  rawMilesSinceInstall: number;
  remainingMiles: number;
  remainingPercent: number;
  alertLevel: AlertLevel;
  countdownSeries: CountdownPoint[];
  sensitivityMultiplier: number;
}

export interface HealthAlert {
  id: string;
  componentId: string;
  bikeId: string;
  bikeName: string;
  componentLabel: string;
  severity: Exclude<AlertLevel, "none">;
  remainingMiles: number;
  remainingPercent: number;
  catalogKey?: OfferCatalogKey;
  bestPriceStartingAt?: number;
  retailerCount?: number;
  thresholdTriggered: 0.25 | 0.1 | 0;
}

export interface Retailer {
  id: RetailerId;
  name: string;
  baseUrl: string;
  partnerLabel: string;
  shippingPolicySummary: string;
  logoText: string;
  disclosureLabel: string;
}

export interface RetailerOffer {
  id: string;
  catalogKey: OfferCatalogKey;
  retailerId: RetailerId;
  productName: string;
  brand: string;
  price: number;
  shippingPrice: number;
  totalPrice: number;
  inStock: boolean;
  availabilityLabel: string;
  productUrl: string;
  affiliateUrl: string;
  lastCheckedAt: string;
  badge: OfferBadge;
}

export interface OfferSummary {
  catalogKey: OfferCatalogKey;
  bestPriceOfferId: string | null;
  lowestDeliveredOfferId: string | null;
  availableOfferCount: number;
  retailerCount: number;
  lastCheckedAt: string | null;
}

export interface DemoState {
  stravaConnected: boolean;
  stravaMode: StravaMode;
  athleteName: string;
  bikes: BikeProfile[];
  selectedBikeId: BikeFilterId;
  components: BikeComponent[];
}
