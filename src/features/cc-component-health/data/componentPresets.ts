import type {
  BikeComponent,
  ComponentPreset,
  ComponentType
} from "@/src/features/cc-component-health/types";

import { mockActivities } from "@/src/features/cc-component-health/data/mockActivities";

export const TOOLS_SHOP_URL = "https://example.com/shop/tools";

export const componentPresets: ComponentPreset[] = [
  {
    type: "chain",
    label: "Race Chain",
    defaultServiceLifeMiles: 2500,
    shopCategoryUrl: "https://example.com/shop/chains",
    toolsNeeded: ["Chain checker", "Quick-link pliers", "Chain tool"]
  },
  {
    type: "front-tire",
    label: "Front Tire",
    defaultServiceLifeMiles: 2200,
    shopCategoryUrl: "https://example.com/shop/tires",
    toolsNeeded: ["Tire levers", "Floor pump", "Tube or sealant"]
  },
  {
    type: "rear-tire",
    label: "Rear Tire",
    defaultServiceLifeMiles: 1600,
    shopCategoryUrl: "https://example.com/shop/tires",
    toolsNeeded: ["Tire levers", "Floor pump", "Tube or sealant"]
  },
  {
    type: "brake-pads",
    label: "Brake Pads",
    defaultServiceLifeMiles: 1200,
    shopCategoryUrl: "https://example.com/shop/brake-pads",
    toolsNeeded: ["Hex keys", "Pad spreader", "Rotor cleaner"]
  },
  {
    type: "cassette",
    label: "Cassette",
    defaultServiceLifeMiles: 7000,
    shopCategoryUrl: "https://example.com/shop/cassettes",
    toolsNeeded: ["Lockring tool", "Chain whip", "Torque wrench"]
  },
  {
    type: "bar-tape-grips",
    label: "Bar Tape / Grips",
    defaultServiceLifeMiles: 3500,
    shopCategoryUrl: "https://example.com/shop/bar-tape",
    toolsNeeded: ["Scissors", "Finishing tape", "Hex key"]
  }
];

export const componentPresetMap = new Map<ComponentType, ComponentPreset>(
  componentPresets.map((preset) => [preset.type, preset])
);

export function createComponentFromPreset(
  preset: ComponentPreset,
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
    type: preset.type,
    label: preset.label,
    serviceLifeMiles: preset.defaultServiceLifeMiles,
    installDate,
    baselineMiles: 0,
    position,
    notes: "",
    replacementCount: 0,
    ...overrides
  };
}
