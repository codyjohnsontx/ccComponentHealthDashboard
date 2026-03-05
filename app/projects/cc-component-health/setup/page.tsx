"use client";

import { SetupForm } from "@/src/features/cc-component-health/components/SetupForm";
import styles from "@/src/features/cc-component-health/components/feature.module.css";

export default function ComponentHealthSetupPage() {
  return (
    <section className={styles.stack}>
      <div className={styles.panel}>
        <p className="eyebrow">Settings</p>
        <h2 className={styles.sectionTitle}>Bikes, installs, and ride attribution</h2>
        <p className={styles.sectionText}>
          Update the bikes on the account, component installs, and service inputs.
        </p>
      </div>

      <SetupForm />
    </section>
  );
}
