import { z } from "zod";

const bikeDisciplineSchema = z.enum(["road", "gravel", "track", "triathlon"]);
const wearSensitivitySchema = z.enum(["conservative", "normal", "aggressive"]);
const componentTypeSchema = z.enum([
  "chain",
  "front-tire",
  "rear-tire",
  "brake-pads",
  "cassette",
  "bar-tape-grips"
]);
const offerCatalogKeySchema = z.enum([
  "road-chain",
  "road-front-tire",
  "road-rear-tire",
  "gravel-chain",
  "gravel-front-tire",
  "gravel-rear-tire",
  "road-brake-pads",
  "gravel-brake-pads",
  "road-cassette",
  "gravel-cassette",
  "bar-tape",
  "gravel-bar-tape"
]);
const retailerIdSchema = z.enum([
  "jenson-usa",
  "competitive-cyclist",
  "worldwide-cyclery",
  "trek-bikes",
  "rei"
]);

export const componentCompatibilityProfileSchema = z.object({
  componentType: componentTypeSchema,
  discipline: bikeDisciplineSchema,
  drivetrainSpeed: z.union([z.literal(11), z.literal(12), z.literal(13)]).optional(),
  brakeSystem: z.enum(["disc", "rim"]).optional(),
  wheelSize: z.enum(["700c", "650b"]).optional(),
  tireWidthMm: z.number().int().positive().optional(),
  cassetteRangeFamily: z
    .enum(["road-close", "road-wide", "gravel-wide", "universal"])
    .optional(),
  position: z.enum(["front", "rear"]).optional(),
  fitNotes: z.array(z.string()).optional()
});

export const bikeProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  discipline: bikeDisciplineSchema,
  wearSensitivity: wearSensitivitySchema
});

export const bikeComponentSchema = z.object({
  id: z.string().min(1),
  bikeId: z.string().min(1),
  type: componentTypeSchema,
  label: z.string().min(1),
  serviceLifeMiles: z.number().nonnegative(),
  installDate: z.string().min(1),
  baselineMiles: z.number().nonnegative(),
  position: z.enum(["front", "rear"]).optional(),
  catalogKey: offerCatalogKeySchema.optional(),
  replacementSearchLabel: z.string().optional(),
  compatibilityProfile: componentCompatibilityProfileSchema.partial().optional(),
  notes: z.string().optional(),
  replacementCount: z.number().int().nonnegative()
});

export const serviceEventSchema = z.object({
  id: z.string().min(1),
  componentId: z.string().min(1),
  bikeId: z.string().min(1),
  type: z.enum(["installed", "replaced", "inspection"]),
  date: z.string().min(1),
  mileageAtService: z.number().nonnegative(),
  notes: z.string().optional(),
  source: z.enum(["seeded", "user", "api"])
});

export const affiliateClickEventSchema = z.object({
  id: z.string().min(1),
  componentId: z.string().min(1),
  retailerId: retailerIdSchema,
  offerId: z.string().min(1),
  surface: z.enum(["landing", "dashboard", "detail", "alerts"]),
  clickedAt: z.string().min(1),
  catalogKey: offerCatalogKeySchema.optional(),
  price: z.number().nonnegative().optional(),
  totalPrice: z.number().nonnegative().optional()
});

export const demoStateSchema = z.object({
  stravaConnected: z.boolean(),
  stravaMode: z.enum(["mock", "real", "disabled"]),
  athleteName: z.string().min(1),
  bikes: z.array(bikeProfileSchema),
  selectedBikeId: z.union([z.string().min(1), z.literal("all")]),
  components: z.array(bikeComponentSchema),
  serviceEvents: z.array(serviceEventSchema),
  affiliateClicks: z.array(affiliateClickEventSchema)
});

export const persistedDemoStateSchema = demoStateSchema.extend({
  _schemaVersion: z.number().int().optional()
});

export const retailerOfferSchema = z.object({
  id: z.string().min(1),
  listingId: z.string().min(1),
  snapshotId: z.string().min(1),
  catalogKey: offerCatalogKeySchema,
  retailerId: retailerIdSchema,
  productName: z.string().min(1),
  brand: z.string().min(1),
  productUrl: z.string().url(),
  affiliateUrl: z.string().url(),
  compatibilityProfile: componentCompatibilityProfileSchema.partial(),
  price: z.number().nonnegative(),
  shippingPrice: z.number().nonnegative(),
  totalPrice: z.number().nonnegative(),
  inStock: z.boolean(),
  availabilityLabel: z.string().min(1),
  lastCheckedAt: z.string().min(1),
  freshness: z.enum(["fresh", "aging", "stale"]),
  compatibilityStatus: z.enum(["confirmed", "likely", "review", "incompatible"]),
  matchConfidence: z.enum(["exact", "high", "medium", "low"]),
  fitNotes: z.array(z.string()),
  badge: z.enum([
    "best_price",
    "lowest_delivered",
    "fastest_ship",
    "popular_retailer",
    "none"
  ])
});

export const markComponentReplacedRequestSchema = z.object({
  componentId: z.string().min(1),
  date: z.string().min(1).optional(),
  mileageAtService: z.number().nonnegative(),
  notes: z.string().trim().min(1).optional()
});

export const affiliateClickRequestSchema = z.object({
  componentId: z.string().min(1),
  retailerId: retailerIdSchema,
  offerId: z.string().min(1),
  surface: z.enum(["landing", "dashboard", "detail", "alerts"]),
  catalogKey: offerCatalogKeySchema.optional(),
  price: z.number().nonnegative().optional(),
  totalPrice: z.number().nonnegative().optional()
});

export const setupMutationSchema = z.object({
  state: demoStateSchema
});

export const offersQuerySchema = z
  .object({
    componentId: z.string().min(1).optional(),
    catalogKey: offerCatalogKeySchema.optional()
  })
  .refine((value) => value.componentId || value.catalogKey, {
    message: "componentId or catalogKey is required",
    path: ["componentId"]
  });
