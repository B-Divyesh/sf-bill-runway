# Bill Runway

Bill Runway is a local, offline-first due-date cash planner. It is for people and caregivers who need to answer one question: **which upcoming bills are covered before expected income arrives?**

It is not a bank-connected budget, ledger, payment service, or financial-advice product. Users enter available money, bills, and expected income dates. The timeline identifies the first uncovered due date, records paid items, and exports the payment run.

Live product: [bill-runway.sociobot.in](https://bill-runway.sociobot.in)

## What ships

- free 60-day and 12-month views with recurring entries
- clear covered/uncovered running balances and paid status
- print layout and CSV payment-run export
- IndexedDB persistence plus JSON backup/import
- installable PWA with a tested offline path
- light/dark themes, keyboard support, and reduced-motion support
- isolated sample-data demo at [`/demo`](https://bill-runway.sociobot.in/demo)
- no account, bank credentials, analytics, external fonts, or runtime CDN

Choose **Try it with sample data** on the first screen to open four realistic
entries in a separate `demo:bill-runway` IndexedDB database. **Reset demo**
restores the sample. **Start for real** deletes the demo database and returns to
the untouched `bill-runway` database. See [`.factory/demo.md`](.factory/demo.md).

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

Playwright is pinned to 1.58.2. In a fresh environment without the factory's shared browser cache, run `npx playwright install chromium` once. Tested product claims and their exact commands are listed in [`.factory/claims.json`](.factory/claims.json).

## Configuration and deployment

Deploy `dist/` as a static site with SPA fallback to `index.html`. The `/privacy` and `/terms` directories also contain standalone pages for hosts without fallback routing.

The production artifact is a static PWA. It needs no runtime configuration,
account service, payment service, or secret.

## Privacy and data ownership

Plan data stays in the browser's IndexedDB. Demo data uses a separate database.
Theme and demo-state preferences use localStorage. The app makes no
cross-origin runtime requests. See the in-product privacy and terms pages.

## Monetisation deviation

The brief calls for a one-time purchase. The required Sociobot product is not
registered, and repository rules prohibit changing billing infrastructure.
This release makes the complete 12-month planner free instead of advertising a
checkout that returns 404. Monetisation can return only after the factory
registers the product and its full purchase lifecycle is independently tested.

## Project notes

- Product brief: [`.factory/brief.json`](.factory/brief.json)
- Visual system and image provenance: [`.factory/design.md`](.factory/design.md)
- Build handoff and verification: [`.factory/handoff.md`](.factory/handoff.md)

Licensed under the [MIT License](LICENSE).
