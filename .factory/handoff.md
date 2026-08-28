# Bill Runway v1 handoff

> ## Independent verification status: **FAIL** (2026-08-28)
>
> Candidate `9f3e3ec313e26782d0e70f3762bb5edb7716e454` is deployed byte-for-byte
> at <https://bill-runway.sociobot.in>, but must not be accepted yet. The
> advertised `$19` Plus checkout returns production HTTP 404
> (`{"error":"enabled factory product","status":404}`), and import accepts an
> impossible date such as `2026-09-31` then silently forecasts it as Oct 1.
> See [`.factory/verification.md`](verification.md) for exact commands,
> complete evidence, and required release actions. Clean-install tests and
> build pass; core local-first planning, offline reload, update toast,
> accessibility, responsive layout, privacy, and live build identity passed.

Completed 2026-08-28 for work order `bill-runway-build-1`.

## What was built

- A responsive, installable Vite + TypeScript PWA that answers whether user-entered bills are covered before expected income arrives.
- Decimal-safe integer-cents calculations, with one-time, weekly, monthly, and yearly recurrence. Month-end recurrence keeps its original target day and clamps only when needed.
- A 60-day free forecast with running balances, first-gap warning, paid occurrence toggles, and editable/deletable bills and income.
- A printable one-page payment run and CSV export.
- IndexedDB storage, JSON backup/import with validation, persistent settings, offline operation, update messaging, and standalone install metadata/icons.
- A $19 one-time Plus path for a 12-month forecast using the Sociobot hosted checkout, URL-token capture, daily license verification cache, optimistic offline unlock, invalid-license reconciliation, and paste-to-restore. Core planning, recurring entries, print/CSV, backup/import, safety, and accessibility remain free.
- Dedicated privacy and terms routes, plus standalone static copies at `dist/privacy/index.html` and `dist/terms/index.html`.
- An original surreal editorial causeway illustration generated with the factory image model. Source, exact prompt sidecar, optimisation, disclosure, and provenance are in `.factory/design.md`.

## Verification

Run from a clean checkout:

```sh
npm install
npm test
npm run build
```

- `npm test`: **4/4 Vitest unit tests and 3/3 Playwright tests pass**. Browser coverage includes the add → uncovered gap → persistence → paid workflow, an actual offline reload via `context.setOffline(true)`, and axe WCAG A/AA scans in both light and dark themes with no serious/critical violations.
- `npm run build`: passes and outputs `dist/index.html`. The 26.44 KB JS and 17.13 KB CSS app shell is inlined into a **44.63 KB / 14.13 KB gzip** entry document so a cached offline navigation cannot race separate hashed assets.
- `npm audit --audit-level=high`: **0 vulnerabilities**.
- Lighthouse 13.0.1 mobile run against the final production preview: **Performance 98, Accessibility 100, Best Practices 100, SEO 100**. FCP 0.7 s, LCP 1.7 s, TBT 160 ms, CLS 0, total transfer 132 KiB.
- Hero WebP variants are 27 KB (720 px) and 77 KB (1200 px), both below the 300 KB budget. There are no downloaded fonts or runtime third-party scripts.
- Visual checks were performed at 1440×1000 and 390×844. The generated image was manually reviewed for text/brand artifacts and composition.
- The offline reload was additionally repeated four times across parallel browser workers after hardening the service-worker install path; all four passed.

## Deployment/configuration

- Exact build command: `npm run build`
- Static output: `./dist`
- Production billing API default: `https://api.sociobot.in/api/v1`
- For a registered staging product, build with `VITE_BILLING_BASE=https://pilot-api.sociobot.in/api/v1`.
- Configure the static host to fall back to `/index.html` for unknown routes. Privacy and terms do not depend on fallback.

## Known gaps and next steps

- Checkout and live license verification cannot be exercised until the factory registers the `bill-runway` product. No product ID or secret is hardcoded.
- Forecasts intentionally do not sync across devices. Moving a plan requires the included JSON backup/import, consistent with the local-first brief.
- Browser/device install prompts vary by platform; the manifest and service worker are complete, while iOS users install through the browser share menu.
