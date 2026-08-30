# Polish 2 — cumulative review repair map

Repaired candidate: `a62b51425388fae509afdb2667f5966fe84c6e2e`.
Review sources: `.factory/review-1.md` and `.factory/review-2.md`.
Product commits: `1f44d1c9c7afa4e83b5f9249538a3d1715903541` and
`afd652da0ef869f3d6abbcba0048f9529f03b8e1`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the sample action in the first 390 px screen. `/demo` and `?demo=1` open the isolated populated plan with its banner, `$900.00`, Electricity, and gap visible. | Tests `keeps the sample action and populated demo plan in the first phone screen` and `opens the isolated sample directly with the demo query path`; live screenshots `/tmp/bill-runway-polish2-live-browser-final-HTo6ly/landing-390.png` and `demo-query-390.png`; cold `https://bill-runway.sociobot.in/?demo=1` check passed. |
| F-1-2 | Preserved the true HTTP 404, `noindex`, route-specific metadata, canonical, and recovery link. | `ships the common navigation and legal footer on the static 404 page`; live `curl` returned 404 for `https://bill-runway.sociobot.in/not-a-real-page`; screenshot `/tmp/bill-runway-polish2-live-browser-final-HTo6ly/not-found.png`. |
| F-1-3 | Legal routes retain the standard wordmark, primary navigation, legal footer, and both legal links. | `uses the common legal skeleton and moves focus to the new route heading`; live screenshots `/tmp/bill-runway-polish2-live-verify-5yN7vn/privacy/screenshot-mobile.png` and `terms/screenshot-mobile.png`; both live URLs returned 200. |
| F-1-4 | Route changes and history navigation focus the destination h1; standalone routes focus their h1 on load. | `uses the common legal skeleton and moves focus to the new route heading`; cold live `/privacy/` and `/terms/` checks recorded focused h1. |
| F-1-5 | Legal and error pages retain route-specific canonical, OG/Twitter, favicon, Apple-touch, description, and noindex metadata for 404. | Metadata assertion in `uses the common legal skeleton and moves focus to the new route heading`; live route checks on `/privacy/`, `/terms/`, and `/not-a-real-page`. |
| F-1-6 | The exclusion heading reads “No bank connections or payments.” | `.factory/copy-audit.md`; landing screenshot `/tmp/bill-runway-polish2-live-browser-final-HTo6ly/landing-390.png`; live root check passed. |
| F-1-7 | README opening uses plain “upcoming list” language. | `README.md` and `.factory/copy-audit.md`; clean-clone `npm test` passed. |
| F-1-8 | README build instruction remains split into short, plain sentences. | `README.md` and `.factory/copy-audit.md`; clean-clone `npm run build` passed. |
| F-1-9 | The public artwork-provenance assertion remains removed; provenance stays in `design.md`. | Landing/footer source and live root check; `.factory/claims.json` contains only observable visitor claims. |
| F-2-1 | Added the `reset-demo` claim and a browser test that marks Electricity paid, resets, restores all four original entries and `$900.00`, and records only `demo:bill-runway` IndexedDB opens. | `npx playwright test --grep @claim:reset-demo` passed in final clean clone `/tmp/bill-runway-polish2-final-OpMu8p`; live `?demo=1` screenshot above. |
| F-2-2 | Rebuilt `404.html` with skip link, wordmark, Demo/Privacy/Terms navigation, legal footer, focus, and both light/dark AA contrast. | Static 404 skeleton test; static 404 is now in the Playwright axe sweep; live HTTP 404 and screenshot above; live light/dark axe: 0 serious/critical. |
| F-2-3 | Replaced customer-facing “payment run” with “upcoming list” in the timeline, actions, empty state, CSV name/feedback, manifest shortcut, README, claims, and copy audit. Mobile actions now use a two-column 8 px grid. | `@claim:csv-export`, `@claim:keyboard-controls`, and `@claim:print-layout` passed; live root/demo screenshots above; repository product-copy search has no remaining phrase. |

## Final verification

- Final clean clone: `/tmp/bill-runway-polish2-final-OpMu8p`.
- `npm ci`, `npm run build`, and `npm test` passed there: 7 Vitest tests and
  24 Playwright tests.
- Every one of the 13 commands in `.factory/claims.json` passed from that
  clean clone, including the new `@claim:reset-demo` command.
- `/opt/fleet/lib/verify-url.sh` passed cold live `/`, `/demo`, `/privacy/`,
  and `/terms/` with title, `lang=en`, one h1, main landmark, image-alt, and
  console checks clean. Evidence: `/tmp/bill-runway-polish2-live-verify-5yN7vn`.
- Playwright Axe WCAG A/AA scans on live root and demo in light/dark, live
  privacy and terms, and the live HTTP 404 in light/dark found zero serious
  or critical violations. The standalone `@axe-core/cli` could not launch its
  Selenium Chrome driver in this worker; the product's pinned Playwright Axe
  integration is the successful accessibility evidence.
- Deployed through `/opt/fleet/lib/deploy-static.sh bill-runway /work/repo/dist`.
  Final Static Web Apps deployment id: `a26624c8-741b-45ef-910d-26a893282568`.
  The cold live root SHA-256 matches `dist/index.html`:
  `21eb5886dbdaded5309d62d63935265b0805085133dfabe2e184bff989218bc2`.
