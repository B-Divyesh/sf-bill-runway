# Bill Runway

Bill Runway helps you compare upcoming bills with expected income on this device.
It shows the first bill you cannot cover, records paid bills with an undo, and exports the upcoming list.

It is for people and caregivers planning due dates without a bank connection.
It is not a budgeting service, payment service, or financial advice.

Live product: [bill-runway.sociobot.in](https://bill-runway.sociobot.in)

## What it does

- Shows 60 days or 12 months of bills and expected income.
- Finds the first uncovered bill amount.
- Handles monthly, weekly, yearly, and one-time entries.
- Exports the visible upcoming list as CSV.
- Imports and exports your plan as JSON.
- Stores plan data in this browser.
- Works offline after the first visit.
- Offers an isolated sample at [`/demo`](https://bill-runway.sociobot.in/demo).

Choose **Try it with sample data** on the first screen.
It opens four realistic entries in a separate `demo:bill-runway` browser database.
**Reset demo** restores the sample.
**Start for real** deletes the sample database and returns to your real plan.
See [`.factory/demo.md`](.factory/demo.md) for the sample details.

## Develop and verify

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
npm test
npm run build
```

`npm test` runs unit tests and Playwright journeys.
They cover import errors, accessibility, offline use, mobile layout, and keyboard controls.
Run `npm run build` for the production build.
It checks TypeScript and writes `dist/index.html`.

To inspect the production build:

```sh
npm run preview
```

Playwright is pinned to 1.58.2.
Run `npx playwright install chromium` if your environment has no browser cache.
Tested product claims and exact commands are in [`.factory/claims.json`](.factory/claims.json).

## Deploy

Deploy `dist/` as a static site.
The static configuration sends `/demo` to the app and unknown paths to the designed 404 page.
The `/privacy` and `/terms` directories provide standalone legal pages.

The product is a static PWA.
It needs no account service, payment service, runtime configuration, or secret.

## Privacy and data ownership

Plan data stays in the browser’s IndexedDB.
Demo data uses a separate database.
Theme and demo preferences use localStorage.
The app makes no cross-origin runtime requests.
Read the in-product [privacy notice](https://bill-runway.sociobot.in/privacy) and [terms](https://bill-runway.sociobot.in/terms).

## Monetisation deviation

The brief calls for a one-time purchase.
The required Sociobot product is not registered.
Repository rules prohibit changing billing infrastructure.
The complete planner is free instead of advertising a checkout that returns 404.
Monetisation can return after the factory registers and tests the full purchase lifecycle.

## Project notes

- Product brief: [`.factory/brief.json`](.factory/brief.json)
- Visual system and image provenance: [`.factory/design.md`](.factory/design.md)
- Build handoff and verification: [`.factory/handoff.md`](.factory/handoff.md)

Licensed under the [MIT License](LICENSE).
