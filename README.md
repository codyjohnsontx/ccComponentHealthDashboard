# Strava Gear Health

A feature concept for Strava that turns bike-tagged ride history into component wear tracking, maintenance alerts, and retailer price comparison for replacement parts.

## What It Is

Strava already lets riders attach multiple bikes to an account and choose which bike was used for each ride. Gear Health extends that behavior into a maintenance and commerce product:

- track service life per bike and per component
- surface warning, critical, and expired wear states automatically
- compare current part pricing across partner retailers
- send users to retailer pages through affiliate-style outbound links

The portfolio build is pre-seeded on first load, so the feature opens with two bikes, active wear states, and current cached offer snapshots already visible.

## Why It Matters

For riders, the feature reduces guesswork around when to replace wear items and where to buy them.

For Strava, it creates a monetizable replacement-intent surface without needing to own inventory. The pricing layer is modeled after comparison products like PCPartPicker: show multiple retailers, current listed price, delivered total, and stock status in one place.

## Product Walkthrough

Routes:

- `/projects/cc-component-health`
- `/projects/cc-component-health/setup`
- `/projects/cc-component-health/dashboard`
- `/projects/cc-component-health/component/[id]`
- `/projects/cc-component-health/alerts`

Suggested review flow:

1. Open `/projects/cc-component-health`
2. Review the seeded Strava account snapshot and pricing preview
3. Open `/projects/cc-component-health/dashboard`
4. Filter between bikes and inspect active wear states
5. Open a component detail page to compare retailer offers
6. Visit `/projects/cc-component-health/alerts` to review prioritized replacements
7. Use `/projects/cc-component-health/setup` to edit bikes, installs, and attribution inputs

## Feature Highlights

- Multi-bike Strava account model with ride attribution by `bikeId`
- Seeded road and gravel bikes with varied wear states
- Ride-based service-life calculations and alert thresholds
- Dashboard health meters for quick scanning
- Retailer comparison on each component detail page
- Best-price and lowest-delivered offer ranking
- Subtle affiliate disclosure for partner outbound links
- localStorage persistence with reset-to-defaults behavior
- Mocked analytics hooks via `console.log`
- Unit coverage for wear logic, storage fallback, offer ranking, and seeded state integrity

## Technical Approach

The app is built in Next.js App Router with the feature isolated under `src/features/cc-component-health`.

Key implementation choices:

- no external state library
- no chart dependency
- client-driven state persisted in `localStorage`
- seeded first-run state instead of a blank onboarding funnel
- cached offer snapshots instead of live scrapers
- lightweight API route contract for future server-backed pricing

## Data Model

Core entities:

- `BikeProfile`
- `BikeComponent`
- `Activity`
- `ComponentHealth`
- `HealthAlert`
- `Retailer`
- `RetailerOffer`
- `OfferSummary`

Important shifts in this version:

- rides are attributed to a specific bike
- components belong to a specific bike
- retailer comparison is driven by normalized catalog keys instead of one placeholder shop link

## Wear Logic

Wear is derived from rides on the matching bike only:

```ts
rawMilesSinceInstall =
  baselineMiles +
  sum(activity.distanceMiles where
    activity.bikeId === component.bikeId &&
    activity.date >= installDate)

effectiveMilesSinceInstall =
  rawMilesSinceInstall * sensitivityMultiplier

remainingMiles =
  max(0, serviceLifeMiles - effectiveMilesSinceInstall)

remainingPercent =
  remainingMiles / serviceLifeMiles
```

Alert thresholds:

- warning at `<= 25%`
- critical at `<= 10%`
- expired at `<= 0%`

## Retailer Pricing Model

The portfolio implementation ships seeded offer snapshots for US retailers:

- Jenson USA
- Competitive Cyclist
- Worldwide Cyclery
- Trek Bikes
- REI

Each offer includes:

- listed price
- shipping price
- delivered total
- stock state
- timestamp for when pricing was checked
- outbound affiliate-style URL

The component detail page ranks offers using:

- lowest listed price
- lowest delivered total
- in-stock offers before out-of-stock offers

The included API route is:

- `GET /api/projects/cc-component-health/offers?catalogKey=<key>`

That route returns cached offer data now, but it is shaped to support future ingestion jobs and partner adapters.

## Analytics

Analytics are mocked with `console.log`. Current events include:

- `strava_connect_success`
- `bike_created`
- `component_added`
- `dashboard_viewed`
- `component_detail_viewed`
- `bike_filter_changed`
- `offers_viewed`
- `best_price_shown`
- `affiliate_click`
- `alert_clicked`
- `component_marked_replaced`
- `demo_reset`

## Local Development

```bash
pnpm install
pnpm dev
```

Run tests:

```bash
pnpm test
```

Run a production build:

```bash
pnpm build
```

## Project Structure

```text
app/
  projects/cc-component-health/
  api/projects/cc-component-health/offers/
src/
  features/cc-component-health/
```

Key files:

- `src/features/cc-component-health/context/DemoStateProvider.tsx`
- `src/features/cc-component-health/data/demoSeed.ts`
- `src/features/cc-component-health/data/mockActivities.ts`
- `src/features/cc-component-health/data/mockOffers.ts`
- `src/features/cc-component-health/lib/wear.ts`
- `src/features/cc-component-health/lib/offers.ts`
- `app/projects/cc-component-health/dashboard/page.tsx`
- `app/projects/cc-component-health/component/[id]/page.tsx`

## What I’d Build Next

- Real Strava OAuth and bike sync
- Scheduled server-side ingestion jobs for retailer pricing
- Better part matching and SKU normalization across retailers
- Notification delivery for upcoming replacement windows
- Service history timeline and bike-specific maintenance logs
- International retailer coverage and shipping normalization
