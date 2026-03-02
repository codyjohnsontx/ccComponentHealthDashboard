import Link from "next/link";

export default function HomePage() {
  return (
    <main className="app-home">
      <div className="app-home__card">
        <p className="eyebrow">Portfolio Demo</p>
        <h1>Ride-Based Component Health</h1>
        <p>
          A cycling maintenance dashboard that turns ride miles into service-life
          countdowns, alerts, and replacement calls to action.
        </p>
        <Link className="app-home__link" href="/projects/cc-component-health">
          Open the demo
        </Link>
      </div>
    </main>
  );
}
