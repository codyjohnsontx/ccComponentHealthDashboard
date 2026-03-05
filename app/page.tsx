import Link from "next/link";

export default function HomePage() {
  return (
    <main className="app-home">
      <div className="app-home__card">
        <p className="eyebrow">Strava Feature Concept</p>
        <h1>Strava Gear Health</h1>
        <p>
          Bike-tagged ride history translated into service timing, maintenance alerts,
          and retailer price comparison across the market.
        </p>
        <Link className="app-home__link" href="/projects/cc-component-health">
          Open Gear Health
        </Link>
      </div>
    </main>
  );
}
