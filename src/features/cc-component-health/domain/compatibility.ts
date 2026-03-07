import { componentPresetMap } from "@/src/features/cc-component-health/data/componentPresets";
import type {
  BikeComponent,
  BikeProfile,
  CassetteRangeFamily,
  CompatibilityStatus,
  ComponentCompatibilityProfile,
  MatchConfidence,
  OfferCatalogKey,
  OfferFreshness,
  OfferMatch,
  RetailerListing
} from "@/src/features/cc-component-health/types";

const catalogCompatibilityMap: Record<
  OfferCatalogKey,
  Partial<ComponentCompatibilityProfile>
> = {
  "road-chain": {
    componentType: "chain",
    discipline: "road",
    drivetrainSpeed: 12
  },
  "road-front-tire": {
    componentType: "front-tire",
    discipline: "road",
    wheelSize: "700c",
    tireWidthMm: 28,
    position: "front"
  },
  "road-rear-tire": {
    componentType: "rear-tire",
    discipline: "road",
    wheelSize: "700c",
    tireWidthMm: 28,
    position: "rear"
  },
  "gravel-chain": {
    componentType: "chain",
    discipline: "gravel",
    drivetrainSpeed: 12
  },
  "gravel-front-tire": {
    componentType: "front-tire",
    discipline: "gravel",
    wheelSize: "700c",
    tireWidthMm: 40,
    position: "front"
  },
  "gravel-rear-tire": {
    componentType: "rear-tire",
    discipline: "gravel",
    wheelSize: "700c",
    tireWidthMm: 40,
    position: "rear"
  },
  "road-brake-pads": {
    componentType: "brake-pads",
    discipline: "road",
    brakeSystem: "disc"
  },
  "gravel-brake-pads": {
    componentType: "brake-pads",
    discipline: "gravel",
    brakeSystem: "disc"
  },
  "road-cassette": {
    componentType: "cassette",
    discipline: "road",
    drivetrainSpeed: 12,
    cassetteRangeFamily: "road-close"
  },
  "gravel-cassette": {
    componentType: "cassette",
    discipline: "gravel",
    drivetrainSpeed: 12,
    cassetteRangeFamily: "gravel-wide"
  },
  "bar-tape": {
    componentType: "bar-tape-grips",
    discipline: "road"
  },
  "gravel-bar-tape": {
    componentType: "bar-tape-grips",
    discipline: "gravel"
  }
};

function getCassetteRangeForBike(
  bike: BikeProfile | undefined
): CassetteRangeFamily | undefined {
  if (!bike) {
    return undefined;
  }

  switch (bike.discipline) {
    case "gravel":
      return "gravel-wide";
    case "track":
      return "universal";
    case "road":
    case "triathlon":
    default:
      return "road-close";
  }
}

export function resolveCatalogCompatibility(
  catalogKey?: OfferCatalogKey
): Partial<ComponentCompatibilityProfile> {
  if (!catalogKey) {
    return {};
  }

  return catalogCompatibilityMap[catalogKey] ?? {};
}

export function resolveComponentCompatibilityProfile(
  component: BikeComponent,
  bike?: BikeProfile
): ComponentCompatibilityProfile {
  const preset = componentPresetMap.get(component.type);
  const catalogCompatibility = resolveCatalogCompatibility(component.catalogKey);

  return {
    componentType: component.type,
    discipline:
      component.compatibilityProfile?.discipline ??
      catalogCompatibility.discipline ??
      bike?.discipline ??
      "road",
    drivetrainSpeed:
      component.type === "chain" || component.type === "cassette"
        ? (component.compatibilityProfile?.drivetrainSpeed ??
            catalogCompatibility.drivetrainSpeed ??
            preset?.defaultCompatibility.drivetrainSpeed ??
            12)
        : undefined,
    brakeSystem:
      component.type === "brake-pads"
        ? (component.compatibilityProfile?.brakeSystem ??
            catalogCompatibility.brakeSystem ??
            preset?.defaultCompatibility.brakeSystem)
        : undefined,
    wheelSize:
      component.type === "front-tire" || component.type === "rear-tire"
        ? (component.compatibilityProfile?.wheelSize ??
            catalogCompatibility.wheelSize ??
            preset?.defaultCompatibility.wheelSize)
        : undefined,
    tireWidthMm:
      component.type === "front-tire" || component.type === "rear-tire"
        ? (component.compatibilityProfile?.tireWidthMm ??
            catalogCompatibility.tireWidthMm ??
            preset?.defaultCompatibility.tireWidthMm)
        : undefined,
    cassetteRangeFamily:
      component.type === "cassette"
        ? (component.compatibilityProfile?.cassetteRangeFamily ??
            catalogCompatibility.cassetteRangeFamily ??
            preset?.defaultCompatibility.cassetteRangeFamily ??
            getCassetteRangeForBike(bike))
        : undefined,
    position:
      component.position ??
      component.compatibilityProfile?.position ??
      catalogCompatibility.position ??
      preset?.defaultCompatibility.position,
    fitNotes:
      component.compatibilityProfile?.fitNotes ??
      catalogCompatibility.fitNotes ??
      preset?.defaultCompatibility.fitNotes
  };
}

export function getOfferFreshness(lastCheckedAt: string): OfferFreshness {
  const checkedAt = new Date(lastCheckedAt).getTime();
  const ageHours = Math.max(0, (Date.now() - checkedAt) / (1000 * 60 * 60));

  if (ageHours <= 72) {
    return "fresh";
  }

  if (ageHours <= 168) {
    return "aging";
  }

  return "stale";
}

function compareWidth(
  componentWidth: number | undefined,
  listingWidth: number | undefined
): boolean {
  if (!componentWidth || !listingWidth) {
    return true;
  }

  return Math.abs(componentWidth - listingWidth) <= 3;
}

function mismatchStatus(mismatches: number): CompatibilityStatus {
  if (mismatches > 0) {
    return "incompatible";
  }

  return "confirmed";
}

function confidenceForScore(score: number, exact: boolean): MatchConfidence {
  if (exact && score >= 3) {
    return "exact";
  }

  if (score >= 4) {
    return "high";
  }

  if (score >= 2) {
    return "medium";
  }

  return "low";
}

export function evaluateOfferCompatibility(
  componentProfile: ComponentCompatibilityProfile,
  listing: RetailerListing
): OfferMatch {
  const notes = [...(listing.compatibilityProfile.fitNotes ?? [])];
  let score = 0;
  let exact = true;
  let mismatches = 0;

  const checks: Array<{
    componentValue: string | number | undefined;
    listingValue: string | number | undefined;
    label: string;
  }> = [
    {
      componentValue: componentProfile.componentType,
      listingValue: listing.compatibilityProfile.componentType,
      label: "component type"
    },
    {
      componentValue: componentProfile.discipline,
      listingValue: listing.compatibilityProfile.discipline,
      label: "discipline"
    },
    {
      componentValue: componentProfile.drivetrainSpeed,
      listingValue: listing.compatibilityProfile.drivetrainSpeed,
      label: "drivetrain"
    },
    {
      componentValue: componentProfile.brakeSystem,
      listingValue: listing.compatibilityProfile.brakeSystem,
      label: "brake system"
    },
    {
      componentValue: componentProfile.wheelSize,
      listingValue: listing.compatibilityProfile.wheelSize,
      label: "wheel size"
    },
    {
      componentValue: componentProfile.cassetteRangeFamily,
      listingValue: listing.compatibilityProfile.cassetteRangeFamily,
      label: "cassette range"
    },
    {
      componentValue: componentProfile.position,
      listingValue: listing.compatibilityProfile.position,
      label: "position"
    }
  ];

  checks.forEach(({ componentValue, listingValue, label }) => {
    if (!componentValue && !listingValue) {
      return;
    }

    if (!componentValue || !listingValue) {
      exact = false;
      return;
    }

    if (componentValue === listingValue) {
      score += 1;
      return;
    }

    mismatches += 1;
    exact = false;
    notes.push(`Verify ${label} compatibility before checkout.`);
  });

  if (!compareWidth(componentProfile.tireWidthMm, listing.compatibilityProfile.tireWidthMm)) {
    mismatches += 1;
    exact = false;
    notes.push("Tire width differs from the tracked component profile.");
  } else if (componentProfile.tireWidthMm && listing.compatibilityProfile.tireWidthMm) {
    score += 1;
  }

  const compatibilityStatus =
    mismatches > 0
      ? mismatchStatus(mismatches)
      : exact
        ? "confirmed"
        : score >= 3
          ? "likely"
          : "review";

  return {
    listingId: listing.listingId,
    compatibilityStatus,
    matchConfidence: confidenceForScore(score, exact),
    fitNotes:
      notes.length > 0
        ? notes
        : compatibilityStatus === "confirmed"
          ? ["Exact fit against the tracked component profile."]
          : ["Specs are close, but double-check the listing before purchase."]
  };
}
