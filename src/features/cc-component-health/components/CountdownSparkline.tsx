"use client";

import { buildSvgPath } from "@/src/features/cc-component-health/lib/chartSeries";
import { formatDate, formatMiles } from "@/src/features/cc-component-health/lib/formatting";
import type { CountdownPoint } from "@/src/features/cc-component-health/types";
import styles from "@/src/features/cc-component-health/components/feature.module.css";

interface CountdownSparklineProps {
  points: CountdownPoint[];
  width?: number;
  height?: number;
  showAxes?: boolean;
}

export function CountdownSparkline({
  points,
  width = 240,
  height = 76,
  showAxes = false
}: CountdownSparklineProps) {
  const path = buildSvgPath(points, width, height);
  const lastPoint = points[points.length - 1];
  const maxY = Math.max(...points.map((point) => point.remainingMiles), 1);
  const lastPointY = lastPoint
    ? height - (lastPoint.remainingMiles / maxY) * height
    : height - 1;

  return (
    <div>
      <svg
        className={styles.sparkline}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Remaining component life over time"
      >
        <line
          x1="0"
          y1={height - 1}
          x2={width}
          y2={height - 1}
          stroke="rgba(95,108,95,0.18)"
          strokeWidth="1"
        />
        <path
          d={path}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {lastPoint ? (
          <circle
            cx={width}
            cy={Math.max(4, lastPointY)}
            r="4"
            fill="var(--accent)"
          />
        ) : null}
      </svg>

      {showAxes && points.length > 0 ? (
        <div className={styles.sparklineLabels}>
          <span>{formatDate(points[0].date)}</span>
          <span>{formatMiles(points[points.length - 1].remainingMiles)}</span>
        </div>
      ) : null}
    </div>
  );
}
