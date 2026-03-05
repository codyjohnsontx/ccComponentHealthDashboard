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
  name: "New Bike",
  discipline: "road",
  wearSensitivity: "normal"
};

export function SetupForm() {
  const {
    state,
    bikes,
    activities,
    totalRideMiles,
    rideStatsByBike,
    saveBike,
    addComponent,
    addStarterKit,
    updateComponent
  } = useDemoState();
  const [bikeDrafts, setBikeDrafts] = useState<BikeProfile[]>(bikes);
  const [componentDrafts, setComponentDrafts] = useState<BikeComponent[]>(state.components);
  const [presetBikeId, setPresetBikeId] = useState<string>(bikes[0]?.id ?? "");

  useEffect(() => {
    setBikeDrafts(bikes);
    setComponentDrafts(state.components);
    setPresetBikeId((current) => current || bikes[0]?.id || "");
  }, [bikes, state.components]);

  const activityRange = useMemo(() => {
    if (activities.length === 0) {
      return "No rides loaded";
    }

    return `${activities[0].date} to ${activities[activities.length - 1].date}`;
  }, [activities]);

  function handleSaveBike(bikeId: string) {
    const bike = bikeDrafts.find((draft) => draft.id === bikeId);

    if (!bike) {
      return;
    }

    saveBike({
      ...bike,
      id: bike.id || crypto.randomUUID()
    });
  }

  function handleAddBikeDraft() {
    const id = crypto.randomUUID();

    setBikeDrafts((currentDrafts) => [
      ...currentDrafts,
      { ...bikeTemplate, id, name: `Bike ${currentDrafts.length + 1}` }
    ]);
  }

  function handleAddPreset(presetType: string) {
    const preset = componentPresets.find((item) => item.type === presetType);

    if (!preset || !presetBikeId) {
      return;
    }

    addComponent(createComponentFromPreset(preset, presetBikeId));
  }

  function updateBikeDraftValue<T extends keyof BikeProfile>(
    bikeId: string,
    field: T,
    value: BikeProfile[T]
  ) {
    setBikeDrafts((currentDrafts) =>
      currentDrafts.map((draft) =>
        draft.id === bikeId ? { ...draft, [field]: value } : draft
      )
    );
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
        <p className="eyebrow">Ride sync required</p>
        <h2 className={styles.sectionTitle}>Reconnect Strava before editing bike installs.</h2>
        <p className={styles.sectionText}>
          Gear Health depends on ride attribution to keep bike-specific maintenance
          timing accurate.
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
            <p className="eyebrow">Bikes</p>
            <h2 className={styles.sectionTitle}>Manage the bikes on the Strava account</h2>
          </div>
          <button className={styles.buttonSmall} type="button" onClick={handleAddBikeDraft}>
            Add bike
          </button>
        </div>

        <div className={styles.fieldList}>
          {bikeDrafts.map((bike) => (
            <article key={bike.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <p className="eyebrow">{bike.discipline}</p>
                  <h3 className={styles.sectionTitle}>{bike.name}</h3>
                </div>
                <div className={styles.inlineActions}>
                  <button
                    className={styles.buttonSmall}
                    type="button"
                    onClick={() => handleSaveBike(bike.id)}
                  >
                    Save bike
                  </button>
                  <button
                    className={styles.buttonGhost}
                    type="button"
                    onClick={() => addStarterKit(bike.id)}
                  >
                    Add starter kit
                  </button>
                </div>
              </div>

              <div className={styles.formGrid}>
                <label className={styles.fieldRow}>
                  <span className={styles.fieldLabel}>Bike name</span>
                  <input
                    value={bike.name}
                    onChange={(event) =>
                      updateBikeDraftValue(bike.id, "name", event.target.value)
                    }
                  />
                </label>

                <label className={styles.fieldRow}>
                  <span className={styles.fieldLabel}>Discipline</span>
                  <select
                    value={bike.discipline}
                    onChange={(event) =>
                      updateBikeDraftValue(
                        bike.id,
                        "discipline",
                        event.target.value as BikeProfile["discipline"]
                      )
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
                    value={bike.wearSensitivity}
                    onChange={(event) =>
                      updateBikeDraftValue(
                        bike.id,
                        "wearSensitivity",
                        event.target.value as BikeProfile["wearSensitivity"]
                      )
                    }
                  >
                    <option value="conservative">Conservative</option>
                    <option value="normal">Normal</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                </label>

                <div className={styles.stat}>
                  <div className={styles.metricLabel}>Ride attribution</div>
                  <div className={styles.statValue}>
                    {rideStatsByBike[bike.id]?.count ?? 0} rides
                  </div>
                  <p className={styles.sectionText}>
                    {formatMiles(rideStatsByBike[bike.id]?.miles ?? 0)}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <hr className={styles.divider} />

        <p className={styles.sectionText}>
          Imported rides: {activities.length} activities, {formatMiles(totalRideMiles)}, {activityRange}.
        </p>
      </section>

      <section className={styles.setupCard}>
        <div className={styles.cardHeader}>
          <div>
            <p className="eyebrow">Component Library</p>
            <h2 className={styles.sectionTitle}>Add installs to a specific bike</h2>
          </div>
          <Link className={styles.buttonGhost} href="/projects/cc-component-health/dashboard">
            Review dashboard
          </Link>
        </div>

        <label className={styles.fieldRow}>
          <span className={styles.fieldLabel}>Target bike</span>
          <select
            value={presetBikeId}
            onChange={(event) => setPresetBikeId(event.target.value)}
          >
            {bikes.map((bike) => (
              <option key={bike.id} value={bike.id}>
                {bike.name}
              </option>
            ))}
          </select>
        </label>

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

              <p className={styles.sectionText}>{preset.replacementSearchLabel}</p>
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
            <p className="eyebrow">Installed Components</p>
            <h2 className={styles.sectionTitle}>Edit wear inputs and bike assignment</h2>
          </div>
          <Link className={styles.buttonGhost} href="/projects/cc-component-health/alerts">
            Review alerts
          </Link>
        </div>

        {componentDrafts.length === 0 ? (
          <p className={styles.sectionText}>
            Add at least one component preset to restore full service tracking.
          </p>
        ) : (
          <div className={styles.fieldList}>
            {componentDrafts.map((component) => (
              <article key={component.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <p className="eyebrow">
                      {bikes.find((bike) => bike.id === component.bikeId)?.name ?? "Bike"}
                    </p>
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
                    <span className={styles.fieldLabel}>Bike</span>
                    <select
                      value={component.bikeId}
                      onChange={(event) =>
                        updateDraftValue(component.id, "bikeId", event.target.value)
                      }
                    >
                      {bikes.map((bike) => (
                        <option key={bike.id} value={bike.id}>
                          {bike.name}
                        </option>
                      ))}
                    </select>
                  </label>

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
