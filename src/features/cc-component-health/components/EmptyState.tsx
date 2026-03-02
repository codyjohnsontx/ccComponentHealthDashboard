"use client";

import Link from "next/link";

import styles from "@/src/features/cc-component-health/components/feature.module.css";

interface EmptyStateProps {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
}

export function EmptyState({
  title,
  description,
  primaryHref,
  primaryLabel
}: EmptyStateProps) {
  return (
    <section className={styles.emptyState}>
      <p className="eyebrow">Nothing to fix right now</p>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <p className={styles.sectionText}>{description}</p>
      <Link className={styles.button} href={primaryHref}>
        {primaryLabel}
      </Link>
    </section>
  );
}
