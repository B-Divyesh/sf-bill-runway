# Bill Runway

Bill Runway is a private, offline-first due-date cash planner. It is for people and caregivers who need to answer one focused question: **which upcoming bills are covered by the money available before expected income arrives?**

It is not a bank-connected budget, ledger, payment service, or financial-advice product. Users enter a current available amount, one-time or recurring bills, and expected income dates. The timeline uses integer-cents arithmetic, identifies the first uncovered due-date window, records paid instances, and exports a printable payment run.

Live product: [bill-runway.sociobot.in](https://bill-runway.sociobot.in)

## What ships

- 60-day runway with recurring weekly, monthly, and yearly entries
- clear covered/uncovered running balances and paid status
- one-page print layout and CSV payment-run export
- IndexedDB persistence plus JSON backup/import
- installable PWA with a tested offline path
- light/dark themes, keyboard support, and reduced-motion support
- optional $19 one-time Plus license for the 12-month view
- no account, bank credentials, analytics, external fonts, or runtime CDN

## Develop and verify

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
npm test
npm run build
```

`npm test` runs unit tests and Playwright journeys (including malformed-backup, axe, offline, 390px, and keyboard coverage). The exact production command is `npm run build`; it runs strict TypeScript checking and writes the static app to `./dist`, with `dist/index.html` at its root.

To inspect the production build:

```sh
npm run preview
```

Playwright is pinned to 1.58.2. In a fresh environment without the factory's shared browser cache, run `npx playwright install chromium` once.

## Configuration and deployment

Deploy `dist/` as a static site with SPA fallback to `index.html`. The `/privacy` and `/terms` directories also contain standalone pages for hosts without fallback routing.

`VITE_BILLING_BASE` optionally changes the Sociobot API base at build time. It defaults to `https://api.sociobot.in/api/v1`; use `https://pilot-api.sociobot.in/api/v1` for a registered staging product. No product ID or secret is embedded—the public slug is `bill-runway`.

## Privacy and data ownership

Plan data stays in the browser's IndexedDB. License tokens and their daily verification cache use localStorage. Only license verification contacts the Sociobot billing API; payment is handled on the hosted Sociobot/Dodo checkout. See the in-product privacy and terms pages for details.

## Project notes

- Product brief: [`.factory/brief.json`](.factory/brief.json)
- Visual system and image provenance: [`.factory/design.md`](.factory/design.md)
- Build handoff and verification: [`.factory/handoff.md`](.factory/handoff.md)

Licensed under the [MIT License](LICENSE).
