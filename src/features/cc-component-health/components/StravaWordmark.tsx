interface StravaWordmarkProps {
  className?: string;
}

export function StravaWordmark({ className }: StravaWordmarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      viewBox="0 0 132 24"
    >
      <text
        fill="currentColor"
        fontFamily="Avenir Next, Helvetica Neue, Segoe UI, sans-serif"
        fontSize="20"
        fontWeight="800"
        letterSpacing="-0.45"
        x="0"
        y="18"
      >
        STRAVA
      </text>
    </svg>
  );
}
