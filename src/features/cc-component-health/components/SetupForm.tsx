"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  componentPresets,
  createComponentFromPreset
} from "@/src/features/cc-component-health/data/componentPresets";
import { formatMiles } from "@/src/features/cc-component-health/lib/formatting";
import { useDemoState } from "@/src/features/cc-component-health/context/DemoStateProvider";
import type { BikeComponent, BikeProfile } from "@/src/features/cc-component-health/types";
import styles from "@/src/features/cc-component-health/components/feature.module.css";

const bikeTemplate: BikeProfile = {
  id: "",
  name: "Factor OSTRO VAM",
  discipline: "road",
  wearSensitivity: "normal"
};

export function SetupForm() {
  const {
    state,
    activities,
    totalRideMiles,
    saveBike,
    addComponent,
    addStarterKit,
    updateComponent
  } = useDemoState();
  const [bikeDraft, setBikeDraft] = useState<BikeProfile>(state.bike ?? bikeTemplate);
  const [componentDrafts, setComponentDrafts] = useState<BikeComponent[]>(state.components);

  useEffect(() => {
    setBikeDraft(state.bike ?? bikeTemplate);
    setComponentDrafts(state.components);
  }, [state.bike, state.components]);

  const activityRange = useMemo(() => {
    if (activities.length === 0) {
      return "No rides loaded";
    }

    return `${activities[0].date} to ${activities[activities.length - 1].date}`;
  }, [activities]);

  function handleSaveBike() {
    saveBike({
      ...bikeDraft,
      id: bikeDraft.id || crypto.randomUUID()
    });
  }

  function handleAddPreset(presetType: string) {
    const preset = componentPresets.find((item) => item.type === presetType);

    if (!preset) {
      return;
    }

    addComponent(createComponentFromPreset(preset));
  }

  function updateDraftValue<T extends keyof BikeComponent>(
    componentId: string,
    field: T,
    value: BikeComponent[T]
  ) {
    setComponentDrafts((currentDrafts) =>
      currentDrafts.map((draft) =>
        draft.id === componentId ? { ...draft, [field]: value } : draft
      )
    );
  }

  function handleSaveComponent(componentId: string) {
    const component = componentDrafts.find((draft) => draft.id === componentId);

    if (!component) {
      return;
    }

    updateComponent(component);
  }

  if (!state.stravaConnected) {
    return (
      <section className={styles.panel}>
        <p className="eyebrow">Setup locked</p>
        <h2 className={styles.sectionTitle}>Connect Strava before configuring the bike.</h2>
        <p className={styles.sectionText}>
          The setup flow uses imported ride miles to compute service wear. Link the mock
          account first, then return here to save your bike and add components.
        </p>
        <Link className={styles.button} href="/projects/cc-component-health">
          Go to landing page
        </Link>
      </section>
    );
  }

  return (
    <div className={styles.grid2}>
      <section className={styles.setupCard}>
        <div className={styles.cardHeader}>
          <div>
            <p className="eyebrow">Bike Setup</p>
            <h2 className={styles.sectionTitle}>Bike profile and wear sensitivity</h2>
          </div>
          <button className={styles.buttonSmall} type="button" onClick={handleSaveBike}>
            Save bike
          </button>
        </div>

        <div className={styles.fieldList}>
          <label className={styles.fieldRow}>
            <span className={styles.fieldLabel}>Bike name</span>
            <input
              value={bikeDraft.name}
              onChange={(event) =>
                setBikeDraft((current) => ({ ...current, name: event.target.value }))
              }
            />
          </label>

          <label className={styles.fieldRow}>
            <span className={styles.fieldLabel}>Discipline</span>
            <select
              value={bikeDraft.discipline}
              onChange={(event) =>
                setBikeDraft((current) => ({
                  ...current,
                  discipline: event.target.value as BikeProfile["discipline"]
                }))
              }
            >
              <option value="road">Road</option>
              <option value="gravel">Gravel</option>
              <option value="track">Track</option>
              <option value="triathlon">Triathlon</option>
            </select>
          </label>

          <label className={styles.fieldRow}>
            <span className={styles.fieldLabel}>Wear sensitivity</span>
            <select
              value={bikeDraft.wearSensitivity}
              onChange={(event) =>
                setBikeDraft((current) => ({
                  ...current,
                  wearSensitivity: event.target.value as BikeProfile["wearSensitivity"]
                }))
              }
            >
              <option value="conservative">Conservative</option>
              <option value="normal">Normal</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </label>
        </div>

        <hr className={styles.divider} />

        <p className={styles.sectionText}>
          Imported rides: {activities.length} activities, {formatMiles(totalRideMiles)}, {activityRange}.
        </p>
      </section>

      <section className={styles.setupCard}>
        <div className={styles.cardHeader}>
          <div>
            <p className="eyebrow">Quick Add</p>
            <h2 className={styles.sectionTitle}>Common performance-bike components</h2>
          </div>
          <button className={styles.buttonSmall} type="button" onClick={addStarterKit}>
            Add starter kit
          </button>
        </div>

        <div className={styles.fieldList}>
          {componentPresets.map((preset) => (
            <div key={preset.type} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>{preset.label}</h3>
                  <p className={styles.sectionText}>
                    Default life: {formatMiles(preset.defaultServiceLifeMiles)}
                  </p>
                </div>
                <button
                  className={styles.buttonSmall}
                  type="button"
                  onClick={() => handleAddPreset(preset.type)}
                >
                  Add preset
                </button>
              </div>
              <ul className={styles.list}>
                {preset.toolsNeeded.map((tool) => (
                  <li key={tool}>{tool}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.setupCard} style={{ gridColumn: "1 / -1" }}>
        <div className={styles.cardHeader}>
          <div>
            <p className="eyebrow">Components</p>
            <h2 className={styles.sectionTitle}>Editable installed parts</h2>
          </div>
          <Link className={styles.buttonGhost} href="/projects/cc-component-health/dashboard">
            Review dashboard
          </Link>
        </div>

        {componentDrafts.length === 0 ? (
          <p className={styles.sectionText}>
            Add at least one component preset to generate wear health and alerts.
          </p>
        ) : (
          <div className={styles.fieldList}>
            {componentDrafts.map((component) => (
              <article key={component.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <p className="eyebrow">{component.type}</p>
                    <h3 className={styles.sectionTitle}>{component.label}</h3>
                  </div>
                  <button
                    className={styles.buttonSmall}
                    type="button"
                    onClick={() => handleSaveComponent(component.id)}
                  >
                    Apply changes
                  </button>
                </div>

                <div className={styles.formGrid}>
                  <label className={styles.fieldRow}>
                    <span className={styles.fieldLabel}>Label</span>
                    <input
                      value={component.label}
                      onChange={(event) =>
                        updateDraftValue(component.id, "label", event.target.value)
                      }
                    />
                  </label>

                  <label className={styles.fieldRow}>
                    <span className={styles.fieldLabel}>Service life miles</span>
                    <input
                      min="0"
                      step="50"
                      type="number"
                      value={component.serviceLifeMiles}
                      onChange={(event) =>
                        updateDraftValue(
                          component.id,
                          "serviceLifeMiles",
                          Number(event.target.value)
                        )
                      }
                    />
                  </label>

                  <label className={styles.fieldRow}>
                    <span className={styles.fieldLabel}>Install date</span>
                    <input
                      type="date"
                      value={component.installDate}
                      onChange={(event) =>
                        updateDraftValue(component.id, "installDate", event.target.value)
                      }
                    />
                  </label>

                  <label className={styles.fieldRow}>
                    <span className={styles.fieldLabel}>Baseline miles</span>
                    <input
                      min="0"
                      step="10"
                      type="number"
                      value={component.baselineMiles}
                      onChange={(event) =>
                        updateDraftValue(
                          component.id,
                          "baselineMiles",
                          Number(event.target.value)
                        )
                      }
                    />
                  </label>
                </div>

                <label className={styles.fieldRow}>
                  <span className={styles.fieldLabel}>Notes</span>
                  <textarea
                    value={component.notes ?? ""}
                    onChange={(event) =>
                      updateDraftValue(component.id, "notes", event.target.value)
                    }
                  />
                </label>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
