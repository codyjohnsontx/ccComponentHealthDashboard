import type {
  ComponentCompatibilityProfile,
  OfferCatalogKey,
  OfferFreshness,
  RetailerOffer
} from "@/src/features/cc-component-health/types";

function createAffiliateUrl(productUrl: string) {
  const separator = productUrl.includes("?") ? "&" : "?";
  return `${productUrl}${separator}utm_source=strava-gear-health&utm_medium=affiliate`;
}

function getOfferFreshness(lastCheckedAt: string): OfferFreshness {
  const checkedAt = new Date(lastCheckedAt).getTime();
  const now = new Date("2026-03-07T12:00:00Z").getTime();
  const ageDays = Math.floor((now - checkedAt) / (1000 * 60 * 60 * 24));

  if (ageDays <= 2) {
    return "fresh";
  }

  if (ageDays <= 6) {
    return "aging";
  }

  return "stale";
}

function getCompatibilityProfile(
  catalogKey: OfferCatalogKey
): Partial<ComponentCompatibilityProfile> {
  switch (catalogKey) {
    case "road-chain":
      return {
        componentType: "chain",
        discipline: "road",
        drivetrainSpeed: 12
      };
    case "gravel-chain":
      return {
        componentType: "chain",
        discipline: "gravel",
        drivetrainSpeed: 12
      };
    case "road-front-tire":
      return {
        componentType: "front-tire",
        discipline: "road",
        wheelSize: "700c",
        tireWidthMm: 28,
        position: "front"
      };
    case "road-rear-tire":
      return {
        componentType: "rear-tire",
        discipline: "road",
        wheelSize: "700c",
        tireWidthMm: 28,
        position: "rear"
      };
    case "gravel-front-tire":
      return {
        componentType: "front-tire",
        discipline: "gravel",
        wheelSize: "700c",
        tireWidthMm: 40,
        position: "front"
      };
    case "gravel-rear-tire":
      return {
        componentType: "rear-tire",
        discipline: "gravel",
        wheelSize: "700c",
        tireWidthMm: 40,
        position: "rear"
      };
    case "road-brake-pads":
      return {
        componentType: "brake-pads",
        discipline: "road",
        brakeSystem: "disc"
      };
    case "gravel-brake-pads":
      return {
        componentType: "brake-pads",
        discipline: "gravel",
        brakeSystem: "disc"
      };
    case "road-cassette":
      return {
        componentType: "cassette",
        discipline: "road",
        drivetrainSpeed: 12,
        cassetteRangeFamily: "road-close"
      };
    case "gravel-cassette":
      return {
        componentType: "cassette",
        discipline: "gravel",
        drivetrainSpeed: 12,
        cassetteRangeFamily: "gravel-wide"
      };
    case "bar-tape":
      return {
        componentType: "bar-tape-grips",
        discipline: "road"
      };
    case "gravel-bar-tape":
      return {
        componentType: "bar-tape-grips",
        discipline: "gravel"
      };
  }
}

function createOffer(
  id: string,
  catalogKey: OfferCatalogKey,
  retailerId: RetailerOffer["retailerId"],
  productName: string,
  brand: string,
  price: number,
  shippingPrice: number,
  inStock: boolean,
  availabilityLabel: string,
  path: string,
  lastCheckedAt: string
): RetailerOffer {
  const productUrl = `https://example.com${path}`;

  return {
    id,
    listingId: id,
    snapshotId: `${id}-snapshot`,
    catalogKey,
    retailerId,
    productName,
    brand,
    compatibilityProfile: getCompatibilityProfile(catalogKey),
    price,
    shippingPrice,
    totalPrice: price + shippingPrice,
    inStock,
    availabilityLabel,
    productUrl,
    affiliateUrl: createAffiliateUrl(productUrl),
    lastCheckedAt,
    freshness: getOfferFreshness(lastCheckedAt),
    compatibilityStatus: "review",
    matchConfidence: "medium",
    fitNotes: [],
    badge: "none"
  };
}

export const mockOffers: RetailerOffer[] = [
  createOffer(
    "offer-road-chain-jenson",
    "road-chain",
    "jenson-usa",
    "Shimano 12-Speed Chain",
    "Shimano",
    58.99,
    0,
    true,
    "In stock",
    "/road-chain-jenson",
    "2026-03-03T14:10:00Z"
  ),
  createOffer(
    "offer-road-chain-competitive",
    "road-chain",
    "competitive-cyclist",
    "SRAM Force Road Chain",
    "SRAM",
    61.5,
    5.99,
    true,
    "In stock",
    "/road-chain-competitive",
    "2026-03-03T14:10:00Z"
  ),
  createOffer(
    "offer-road-chain-worldwide",
    "road-chain",
    "worldwide-cyclery",
    "KMC X12 SL Road Chain",
    "KMC",
    57.95,
    6.99,
    true,
    "Ships in 1-2 days",
    "/road-chain-worldwide",
    "2026-03-03T14:10:00Z"
  ),
  createOffer(
    "offer-road-chain-rei",
    "road-chain",
    "rei",
    "12-Speed Performance Chain",
    "Shimano",
    59.0,
    4.99,
    false,
    "Out of stock",
    "/road-chain-rei",
    "2026-03-03T14:10:00Z"
  ),
  createOffer(
    "offer-gravel-chain-jenson",
    "gravel-chain",
    "jenson-usa",
    "SRAM Rival XPLR Flattop Chain",
    "SRAM",
    59.99,
    0,
    true,
    "In stock",
    "/gravel-chain-jenson",
    "2026-03-03T14:14:00Z"
  ),
  createOffer(
    "offer-gravel-chain-competitive",
    "gravel-chain",
    "competitive-cyclist",
    "Shimano GRX 12-Speed Chain",
    "Shimano",
    63.5,
    5.99,
    true,
    "In stock",
    "/gravel-chain-competitive",
    "2026-03-03T14:14:00Z"
  ),
  createOffer(
    "offer-gravel-chain-worldwide",
    "gravel-chain",
    "worldwide-cyclery",
    "KMC X12 Gravel Chain",
    "KMC",
    56.95,
    6.99,
    true,
    "Ships in 1-2 days",
    "/gravel-chain-worldwide",
    "2026-03-03T14:14:00Z"
  ),
  createOffer(
    "offer-gravel-chain-rei",
    "gravel-chain",
    "rei",
    "12-Speed Gravel Chain",
    "SRAM",
    60.0,
    0,
    false,
    "Out of stock",
    "/gravel-chain-rei",
    "2026-03-03T14:14:00Z"
  ),
  createOffer(
    "offer-road-front-tire-jenson",
    "road-front-tire",
    "jenson-usa",
    "Continental GP5000 Front Tire",
    "Continental",
    72.99,
    0,
    true,
    "In stock",
    "/road-front-tire-jenson",
    "2026-03-03T14:18:00Z"
  ),
  createOffer(
    "offer-road-front-tire-competitive",
    "road-front-tire",
    "competitive-cyclist",
    "Pirelli P Zero Race TLR",
    "Pirelli",
    74.95,
    5.99,
    true,
    "In stock",
    "/road-front-tire-competitive",
    "2026-03-03T14:18:00Z"
  ),
  createOffer(
    "offer-road-front-tire-trek",
    "road-front-tire",
    "trek-bikes",
    "Bontrager R4 Road Tire",
    "Bontrager",
    69.99,
    8.99,
    true,
    "Brand-direct stock",
    "/road-front-tire-trek",
    "2026-03-03T14:18:00Z"
  ),
  createOffer(
    "offer-road-front-tire-rei",
    "road-front-tire",
    "rei",
    "Performance Road Tire 700x28",
    "Specialized",
    76.0,
    0,
    false,
    "Backordered",
    "/road-front-tire-rei",
    "2026-03-03T14:18:00Z"
  ),
  createOffer(
    "offer-road-rear-tire-jenson",
    "road-rear-tire",
    "jenson-usa",
    "Continental GP5000 Rear Tire",
    "Continental",
    73.99,
    0,
    true,
    "In stock",
    "/road-rear-tire-jenson",
    "2026-03-03T14:24:00Z"
  ),
  createOffer(
    "offer-road-rear-tire-competitive",
    "road-rear-tire",
    "competitive-cyclist",
    "Vittoria Corsa N.EXT Rear Tire",
    "Vittoria",
    71.5,
    6.99,
    true,
    "In stock",
    "/road-rear-tire-competitive",
    "2026-03-03T14:24:00Z"
  ),
  createOffer(
    "offer-road-rear-tire-worldwide",
    "road-rear-tire",
    "worldwide-cyclery",
    "Michelin Power Cup Rear Tire",
    "Michelin",
    69.95,
    7.99,
    true,
    "Ships today",
    "/road-rear-tire-worldwide",
    "2026-03-03T14:24:00Z"
  ),
  createOffer(
    "offer-road-rear-tire-rei",
    "road-rear-tire",
    "rei",
    "Road Tire 700x28 Replacement",
    "Pirelli",
    74.0,
    0,
    false,
    "Out of stock",
    "/road-rear-tire-rei",
    "2026-03-03T14:24:00Z"
  ),
  createOffer(
    "offer-gravel-front-tire-jenson",
    "gravel-front-tire",
    "jenson-usa",
    "Maxxis Rambler 700x40",
    "Maxxis",
    63.99,
    0,
    true,
    "In stock",
    "/gravel-front-tire-jenson",
    "2026-03-03T14:28:00Z"
  ),
  createOffer(
    "offer-gravel-front-tire-competitive",
    "gravel-front-tire",
    "competitive-cyclist",
    "Specialized Pathfinder Pro 700x42",
    "Specialized",
    65.0,
    5.99,
    true,
    "In stock",
    "/gravel-front-tire-competitive",
    "2026-03-03T14:28:00Z"
  ),
  createOffer(
    "offer-gravel-front-tire-worldwide",
    "gravel-front-tire",
    "worldwide-cyclery",
    "WTB Raddler 700x40",
    "WTB",
    61.95,
    8.99,
    true,
    "Ships in 1-2 days",
    "/gravel-front-tire-worldwide",
    "2026-03-03T14:28:00Z"
  ),
  createOffer(
    "offer-gravel-front-tire-rei",
    "gravel-front-tire",
    "rei",
    "Gravel Tire 700x40",
    "Teravail",
    66.0,
    0,
    true,
    "In stock",
    "/gravel-front-tire-rei",
    "2026-03-03T14:28:00Z"
  ),
  createOffer(
    "offer-gravel-rear-tire-jenson",
    "gravel-rear-tire",
    "jenson-usa",
    "Maxxis Rambler 700x40 Rear Tire",
    "Maxxis",
    67.99,
    0,
    true,
    "In stock",
    "/gravel-rear-tire-jenson",
    "2026-03-03T14:30:00Z"
  ),
  createOffer(
    "offer-gravel-rear-tire-competitive",
    "gravel-rear-tire",
    "competitive-cyclist",
    "Specialized Pathfinder Pro 700x42 Rear Tire",
    "Specialized",
    69.5,
    5.99,
    true,
    "In stock",
    "/gravel-rear-tire-competitive",
    "2026-03-03T14:30:00Z"
  ),
  createOffer(
    "offer-gravel-rear-tire-worldwide",
    "gravel-rear-tire",
    "worldwide-cyclery",
    "WTB Raddler 700x40 Rear Tire",
    "WTB",
    65.95,
    7.99,
    true,
    "Ships today",
    "/gravel-rear-tire-worldwide",
    "2026-03-03T14:30:00Z"
  ),
  createOffer(
    "offer-gravel-rear-tire-rei",
    "gravel-rear-tire",
    "rei",
    "Gravel Rear Tire 700x40",
    "Teravail",
    68.0,
    0,
    false,
    "Backordered",
    "/gravel-rear-tire-rei",
    "2026-03-03T14:30:00Z"
  ),
  createOffer(
    "offer-road-brake-pads-jenson",
    "road-brake-pads",
    "jenson-usa",
    "Shimano L05A Disc Brake Pads",
    "Shimano",
    31.99,
    4.99,
    true,
    "In stock",
    "/road-brake-pads-jenson",
    "2026-03-03T14:32:00Z"
  ),
  createOffer(
    "offer-road-brake-pads-competitive",
    "road-brake-pads",
    "competitive-cyclist",
    "SwissStop Disc RS Pads",
    "SwissStop",
    29.95,
    6.99,
    true,
    "In stock",
    "/road-brake-pads-competitive",
    "2026-03-03T14:32:00Z"
  ),
  createOffer(
    "offer-road-brake-pads-worldwide",
    "road-brake-pads",
    "worldwide-cyclery",
    "Galfer Road Disc Pad Set",
    "Galfer",
    27.95,
    7.99,
    true,
    "Ships today",
    "/road-brake-pads-worldwide",
    "2026-03-03T14:32:00Z"
  ),
  createOffer(
    "offer-road-brake-pads-trek",
    "road-brake-pads",
    "trek-bikes",
    "Bontrager Road Disc Pads",
    "Bontrager",
    33.99,
    0,
    false,
    "Unavailable online",
    "/road-brake-pads-trek",
    "2026-03-03T14:32:00Z"
  ),
  createOffer(
    "offer-gravel-brake-pads-jenson",
    "gravel-brake-pads",
    "jenson-usa",
    "SRAM Rival/Force Gravel Disc Pads",
    "SRAM",
    29.99,
    4.99,
    true,
    "In stock",
    "/gravel-brake-pads-jenson",
    "2026-03-03T14:34:00Z"
  ),
  createOffer(
    "offer-gravel-brake-pads-competitive",
    "gravel-brake-pads",
    "competitive-cyclist",
    "SwissStop Gravel Disc RS Pads",
    "SwissStop",
    31.5,
    5.99,
    true,
    "In stock",
    "/gravel-brake-pads-competitive",
    "2026-03-03T14:34:00Z"
  ),
  createOffer(
    "offer-gravel-brake-pads-worldwide",
    "gravel-brake-pads",
    "worldwide-cyclery",
    "Galfer Pro Gravel Disc Pad Set",
    "Galfer",
    27.95,
    7.99,
    true,
    "Ships today",
    "/gravel-brake-pads-worldwide",
    "2026-03-03T14:34:00Z"
  ),
  createOffer(
    "offer-gravel-brake-pads-rei",
    "gravel-brake-pads",
    "rei",
    "Metallic Gravel Disc Brake Pads",
    "Jagwire",
    33.0,
    0,
    false,
    "Out of stock",
    "/gravel-brake-pads-rei",
    "2026-03-03T14:34:00Z"
  ),
  createOffer(
    "offer-road-cassette-jenson",
    "road-cassette",
    "jenson-usa",
    "Shimano 12-Speed Cassette",
    "Shimano",
    114.99,
    0,
    true,
    "In stock",
    "/road-cassette-jenson",
    "2026-03-03T14:36:00Z"
  ),
  createOffer(
    "offer-road-cassette-competitive",
    "road-cassette",
    "competitive-cyclist",
    "SRAM Rival 12-Speed Cassette",
    "SRAM",
    118.5,
    5.99,
    true,
    "In stock",
    "/road-cassette-competitive",
    "2026-03-03T14:36:00Z"
  ),
  createOffer(
    "offer-road-cassette-worldwide",
    "road-cassette",
    "worldwide-cyclery",
    "KMC 12-Speed Cassette",
    "KMC",
    111.95,
    7.99,
    true,
    "Ships today",
    "/road-cassette-worldwide",
    "2026-03-03T14:36:00Z"
  ),
  createOffer(
    "offer-road-cassette-rei",
    "road-cassette",
    "rei",
    "12-Speed Road Cassette",
    "Shimano",
    116.0,
    0,
    false,
    "Out of stock",
    "/road-cassette-rei",
    "2026-03-03T14:36:00Z"
  ),
  createOffer(
    "offer-gravel-cassette-jenson",
    "gravel-cassette",
    "jenson-usa",
    "SRAM XPLR 10-44 Cassette",
    "SRAM",
    189.99,
    0,
    true,
    "In stock",
    "/gravel-cassette-jenson",
    "2026-03-03T14:38:00Z"
  ),
  createOffer(
    "offer-gravel-cassette-competitive",
    "gravel-cassette",
    "competitive-cyclist",
    "Shimano GRX 10-45 Cassette",
    "Shimano",
    194.5,
    5.99,
    true,
    "In stock",
    "/gravel-cassette-competitive",
    "2026-03-03T14:38:00Z"
  ),
  createOffer(
    "offer-gravel-cassette-worldwide",
    "gravel-cassette",
    "worldwide-cyclery",
    "SunRace 12-Speed Gravel Cassette",
    "SunRace",
    181.95,
    7.99,
    true,
    "Ships today",
    "/gravel-cassette-worldwide",
    "2026-03-03T14:38:00Z"
  ),
  createOffer(
    "offer-gravel-cassette-rei",
    "gravel-cassette",
    "rei",
    "12-Speed Gravel Cassette",
    "microSHIFT",
    186.0,
    0,
    false,
    "Backordered",
    "/gravel-cassette-rei",
    "2026-03-03T14:38:00Z"
  ),
  createOffer(
    "offer-bar-tape-jenson",
    "bar-tape",
    "jenson-usa",
    "Lizard Skins DSP Bar Tape",
    "Lizard Skins",
    39.99,
    0,
    true,
    "In stock",
    "/bar-tape-jenson",
    "2026-03-03T14:40:00Z"
  ),
  createOffer(
    "offer-bar-tape-competitive",
    "bar-tape",
    "competitive-cyclist",
    "Supacaz Super Sticky Kush",
    "Supacaz",
    42.0,
    5.99,
    true,
    "In stock",
    "/bar-tape-competitive",
    "2026-03-03T14:40:00Z"
  ),
  createOffer(
    "offer-bar-tape-worldwide",
    "bar-tape",
    "worldwide-cyclery",
    "Silca Nastro Cuscino",
    "Silca",
    37.95,
    6.99,
    true,
    "Ships in 1-2 days",
    "/bar-tape-worldwide",
    "2026-03-03T14:40:00Z"
  ),
  createOffer(
    "offer-bar-tape-rei",
    "bar-tape",
    "rei",
    "Performance Cork Tape",
    "Fizik",
    34.99,
    0,
    true,
    "In stock",
    "/bar-tape-rei",
    "2026-03-03T14:40:00Z"
  ),
  createOffer(
    "offer-gravel-bar-tape-jenson",
    "gravel-bar-tape",
    "jenson-usa",
    "Silca Nastro Cuscino Gravel Tape",
    "Silca",
    41.99,
    0,
    true,
    "In stock",
    "/gravel-bar-tape-jenson",
    "2026-03-03T14:42:00Z"
  ),
  createOffer(
    "offer-gravel-bar-tape-competitive",
    "gravel-bar-tape",
    "competitive-cyclist",
    "Supacaz Gravel Kush Tape",
    "Supacaz",
    39.5,
    5.99,
    true,
    "In stock",
    "/gravel-bar-tape-competitive",
    "2026-03-03T14:42:00Z"
  ),
  createOffer(
    "offer-gravel-bar-tape-worldwide",
    "gravel-bar-tape",
    "worldwide-cyclery",
    "Lizard Skins DSP Gravel Tape",
    "Lizard Skins",
    37.95,
    6.99,
    true,
    "Ships in 1-2 days",
    "/gravel-bar-tape-worldwide",
    "2026-03-03T14:42:00Z"
  ),
  createOffer(
    "offer-gravel-bar-tape-rei",
    "gravel-bar-tape",
    "rei",
    "Cushioned Gravel Bar Tape",
    "Fizik",
    38.0,
    0,
    true,
    "In stock",
    "/gravel-bar-tape-rei",
    "2026-03-03T14:42:00Z"
  )
];
