import type {
  BikeComponent,
  ComponentPreset,
  ComponentType
} from "@/src/features/cc-component-health/types";

import { mockActivities } from "@/src/features/cc-component-health/data/mockActivities";

export const componentPresets: ComponentPreset[] = [
  {
    type: "chain",
    label: "Race Chain",
    defaultServiceLifeMiles: 2500,
    catalogKey: "road-chain",
    replacementSearchLabel: "12-speed road chain",
    replacementCategoryLabel: "Chains",
    toolsNeeded: ["Chain checker", "Quick-link pliers", "Chain tool"]
  },
  {
    type: "front-tire",
    label: "Front Tire",
    defaultServiceLifeMiles: 2200,
    catalogKey: "road-front-tire",
    replacementSearchLabel: "700x28 front tire",
    replacementCategoryLabel: "Front tires",
    toolsNeeded: ["Tire levers", "Floor pump", "Tube or sealant"]
  },
  {
    type: "rear-tire",
    label: "Rear Tire",
    defaultServiceLifeMiles: 1600,
    catalogKey: "road-rear-tire",
    replacementSearchLabel: "700x28 rear tire",
    replacementCategoryLabel: "Rear tires",
    toolsNeeded: ["Tire levers", "Floor pump", "Tube or sealant"]
  },
  {
    type: "brake-pads",
    label: "Brake Pads",
    defaultServiceLifeMiles: 1200,
    catalogKey: "road-brake-pads",
    replacementSearchLabel: "Shimano-compatible road disc brake pads",
    replacementCategoryLabel: "Brake pads",
    toolsNeeded: ["Hex keys", "Pad spreader", "Rotor cleaner"]
  },
  {
    type: "cassette",
    label: "Cassette",
    defaultServiceLifeMiles: 7000,
    catalogKey: "road-cassette",
    replacementSearchLabel: "12-speed road cassette",
    replacementCategoryLabel: "Cassettes",
    toolsNeeded: ["Lockring tool", "Chain whip", "Torque wrench"]
  },
  {
    type: "bar-tape-grips",
    label: "Bar Tape / Grips",
    defaultServiceLifeMiles: 3500,
    catalogKey: "bar-tape",
    replacementSearchLabel: "Performance road bar tape",
    replacementCategoryLabel: "Bar tape",
    toolsNeeded: ["Scissors", "Finishing tape", "Hex key"]
  }
];

export const componentPresetMap = new Map<ComponentType, ComponentPreset>(
  componentPresets.map((preset) => [preset.type, preset])
);

export function createComponentFromPreset(
  preset: ComponentPreset,
  bikeId: string,
  overrides?: Partial<BikeComponent>
): BikeComponent {
  const installDate = mockActivities[0]?.date ?? new Date().toISOString().slice(0, 10);
  const position =
    preset.type === "front-tire"
      ? "front"
      : preset.type === "rear-tire"
        ? "rear"
        : undefined;

  return {
    id: crypto.randomUUID(),
    bikeId,
    type: preset.type,
    label: preset.label,
    serviceLifeMiles: preset.defaultServiceLifeMiles,
    installDate,
    baselineMiles: 0,
    position,
    catalogKey: preset.catalogKey,
    replacementSearchLabel: preset.replacementSearchLabel,
    notes: "",
    replacementCount: 0,
    ...overrides
  };
}
