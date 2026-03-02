"use client";

import { SetupForm } from "@/src/features/cc-component-health/components/SetupForm";
import styles from "@/src/features/cc-component-health/components/feature.module.css";

export default function ComponentHealthSetupPage() {
  return (
    <section className={styles.stack}>
      <div className={styles.panel}>
        <p className="eyebrow">Setup Flow</p>
        <h2 className={styles.sectionTitle}>Bike + components onboarding</h2>
        <p className={styles.sectionText}>
          Save a bike profile, choose a wear sensitivity model, and add component presets
          that can be edited with install dates and baseline miles.
        </p>
      </div>

      <SetupForm />
    </section>
  );
}
