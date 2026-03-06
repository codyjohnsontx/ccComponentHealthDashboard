import type { BikeComponent, BikeProfile, DemoState } from "@/src/features/cc-component-health/types";

export const SEEDED_BIKE_IDS = {
  road: "bike-factor-ostro",
  gravel: "bike-specialized-crux"
} as const;

export const SEEDED_COMPONENT_IDS = {
  roadChain: "component-road-chain",
  roadFrontTire: "component-road-front-tire",
  roadRearTire: "component-road-rear-tire",
  roadBrakePads: "component-road-brake-pads",
  roadCassette: "component-road-cassette",
  gravelFrontTire: "component-gravel-front-tire",
  gravelBarTape: "component-gravel-bar-tape"
} as const;

const seededBikes: BikeProfile[] = [
  {
    id: SEEDED_BIKE_IDS.road,
    name: "Factor OSTRO VAM",
    discipline: "road",
    wearSensitivity: "normal"
  },
  {
    id: SEEDED_BIKE_IDS.gravel,
    name: "Specialized Crux",
    discipline: "gravel",
    wearSensitivity: "normal"
  }
];

const seededComponents: BikeComponent[] = [
  {
    id: SEEDED_COMPONENT_IDS.roadChain,
    bikeId: SEEDED_BIKE_IDS.road,
    type: "chain",
    label: "Race Chain",
    serviceLifeMiles: 2500,
    installDate: "2025-12-29",
    baselineMiles: 1600,
    catalogKey: "road-chain",
    replacementSearchLabel: "12-speed road chain",
    notes: "Primary drivetrain chain for race-week road volume.",
    replacementCount: 0
  },
  {
    id: SEEDED_COMPONENT_IDS.roadFrontTire,
    bikeId: SEEDED_BIKE_IDS.road,
    type: "front-tire",
    label: "Front Tire",
    serviceLifeMiles: 2500,
    installDate: "2026-02-20",
    baselineMiles: 0,
    position: "front",
    catalogKey: "road-front-tire",
    replacementSearchLabel: "700x28 front road tire",
    notes: "New front tire installed for spring training block.",
    replacementCount: 0
  },
  {
    id: SEEDED_COMPONENT_IDS.roadRearTire,
    bikeId: SEEDED_BIKE_IDS.road,
    type: "rear-tire",
    label: "Rear Tire",
    serviceLifeMiles: 1600,
    installDate: "2025-11-08",
    baselineMiles: 850,
    position: "rear",
    catalogKey: "road-rear-tire",
    replacementSearchLabel: "700x28 rear road tire",
    notes: "Power-side wear item approaching replacement.",
    replacementCount: 0
  },
  {
    id: SEEDED_COMPONENT_IDS.roadBrakePads,
    bikeId: SEEDED_BIKE_IDS.road,
    type: "brake-pads",
    label: "Brake Pads",
    serviceLifeMiles: 1200,
    installDate: "2025-12-01",
    baselineMiles: 850,
    catalogKey: "road-brake-pads",
    replacementSearchLabel: "Shimano-compatible road disc brake pads",
    notes: "Overdue after repeated mountainous road rides.",
    replacementCount: 0
  },
  {
    id: SEEDED_COMPONENT_IDS.roadCassette,
    bikeId: SEEDED_BIKE_IDS.road,
    type: "cassette",
    label: "Cassette",
    serviceLifeMiles: 7000,
    installDate: "2025-09-18",
    baselineMiles: 1800,
    catalogKey: "road-cassette",
    replacementSearchLabel: "12-speed road cassette",
    notes: "High-mileage drivetrain anchor still in a healthy window.",
    replacementCount: 0
  },
  {
    id: SEEDED_COMPONENT_IDS.gravelFrontTire,
    bikeId: SEEDED_BIKE_IDS.gravel,
    type: "front-tire",
    label: "Gravel Front Tire",
    serviceLifeMiles: 2200,
    installDate: "2025-10-25",
    baselineMiles: 1400,
    position: "front",
    catalogKey: "gravel-front-tire",
    replacementSearchLabel: "700x40 gravel front tire",
    notes: "Mixed-surface front tire with wear accumulating into spring.",
    replacementCount: 0
  },
  {
    id: SEEDED_COMPONENT_IDS.gravelBarTape,
    bikeId: SEEDED_BIKE_IDS.gravel,
    type: "bar-tape-grips",
    label: "Bar Tape / Grips",
    serviceLifeMiles: 3500,
    installDate: "2025-11-16",
    baselineMiles: 1400,
    catalogKey: "bar-tape",
    replacementSearchLabel: "Performance gravel bar tape",
    notes: "Still comfortable, but visible wear from long gravel days.",
    replacementCount: 0
  }
];

export function createSeededDemoState(): DemoState {
  return {
    stravaConnected: true,
    stravaMode: "mock",
    athleteName: "Avery Rider",
    bikes: seededBikes.map((bike) => ({ ...bike })),
    selectedBikeId: SEEDED_BIKE_IDS.road,
    components: seededComponents.map((component) => ({ ...component }))
  };
}
