# Bill Runway repair handoff

Completed source repair for work order `bill-runway-repair-1` on 2026-08-28.

> ## Release status: date-import blocker repaired; billing registration remains blocked externally
>
> The verifier's impossible-date import defect is fixed and regression-tested.
> The other blocker is not source code: at verification time and again during
> this repair, `GET https://api.sociobot.in/api/v1/products/bill-runway/checkout`
> returned HTTP 404 with `{"error":"enabled factory product","status":404}`.
> The public product catalogue has no `bill-runway` product. This repository
> already uses the required Sociobot checkout URL and contains no billing
> credentials or registration tool; the repository contract prohibits changing
> billing from here. A factory operator must register/enable the production
> `bill-runway` product before Plus can be released, then verify its hosted
> checkout redirect and successful `?license=` return path.

## What was built

- A responsive, installable Vite + TypeScript PWA that answers whether user-entered bills are covered before expected income arrives.
- Decimal-safe integer-cents calculations, with one-time, weekly, monthly, and yearly recurrence. Month-end recurrence keeps its original target day and clamps only when needed.
- A 60-day free forecast with running balances, first-gap warning, paid occurrence toggles, and editable/deletable bills and income.
- A printable one-page payment run and CSV export.
- IndexedDB storage, JSON backup/import with validation, persistent settings, offline operation, update messaging, and standalone install metadata/icons.
- A $19 one-time Plus path for a 12-month forecast using the Sociobot hosted checkout, URL-token capture, daily license verification cache, optimistic offline unlock, invalid-license reconciliation, and paste-to-restore. Core planning, recurring entries, print/CSV, backup/import, safety, and accessibility remain free.
- Dedicated privacy and terms routes, plus standalone static copies at `dist/privacy/index.html` and `dist/terms/index.html`.
- An original surreal editorial causeway illustration generated with the factory image model. Source, exact prompt sidecar, optimisation, disclosure, and provenance are in `.factory/design.md`.

## Repair details

- Added a shared calendar-date guard. It rejects date-shaped but non-existent
  dates such as `2026-09-31` and non-leap-year February 29 before they enter
  recurrence or forecasting code, so JavaScript cannot normalise them into a
  different day.
- JSON import now validates every entry's first date and paid date with that
  guard before showing the replacement confirmation or writing IndexedDB.
- IndexedDB schema version 2 rejects invalid legacy records during migration;
  loading also ignores manually-corrupted records defensively. The service
  worker cache is versioned as `bill-runway-v4` so installed/offline clients
  receive the repaired app shell and its update notification.
- Added direct regressions for `2026-09-31`, valid/invalid leap days, invalid
  paid dates, the exact corrupt JSON backup, 390px overflow, and keyboard
  access to the skip link.

## Verification

Run from a clean checkout:

```sh
npm ci
npm test
npm run build
npm audit --audit-level=high
```

- `npm ci`: passes; `npm audit --audit-level=high` reports **0 vulnerabilities**.
- `npm test`: **6/6 Vitest unit tests and 5/5 Playwright tests pass**. Browser coverage includes the add → uncovered gap → persistence → paid workflow, an actual offline reload via `context.setOffline(true)`, the exact invalid-date backup rejection, a 390×844 no-overflow/keyboard-skip check, and axe WCAG A/AA scans in both light and dark themes with no serious/critical violations.
- `npm run build`: passes TypeScript (`tsc --noEmit`) and writes `dist/index.html`, **45.35 KB / 14.36 KB gzip**. There is intentionally no separate lint command; the strict TypeScript production check is the static-code quality gate.
- Lighthouse 13.0.1 mobile run against the final production preview: **Performance 98, Accessibility 100, Best Practices 100, SEO 100**. FCP 0.7 s, LCP 1.7 s, TBT 160 ms, CLS 0, total transfer 132 KiB.
- Hero WebP variants are 27 KB (720 px) and 77 KB (1200 px), both below the 300 KB budget. There are no downloaded fonts or runtime third-party scripts.
- Visual checks were performed at 1440×1000 and 390×844. The generated image was manually reviewed for text/brand artifacts and composition.
- The offline reload was additionally repeated after moving to cache `bill-runway-v4`; it passed.

## Deployment/configuration

- Exact build command: `npm run build`
- Static output: `./dist`
- Production billing API default: `https://api.sociobot.in/api/v1`
- For a registered staging product, build with `VITE_BILLING_BASE=https://pilot-api.sociobot.in/api/v1`.
- Configure the static host to fall back to `/index.html` for unknown routes. Privacy and terms do not depend on fallback.

## Known gaps and next steps

- **Release blocker:** the factory must register/enable production checkout for
  slug `bill-runway`. The checkout endpoint still returns the 404 stated above;
  no source or static-deployment setting can create a Sociobot billing product.
  After registration, verify the hosted checkout redirect, test purchase, and
  a successful license return/verification. The public invalid-license verify
  endpoint remains reachable and CORS-authorized.
- Forecasts intentionally do not sync across devices. Moving a plan requires the included JSON backup/import, consistent with the local-first brief.
- Browser/device install prompts vary by platform; the manifest and service worker are complete, while iOS users install through the browser share menu.
