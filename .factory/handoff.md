# Bill Runway polish 2 handoff

## Delivered

- Closed every finding in review 1 and review 2. The new `reset-demo` claim
  proves the reset restores the original isolated sample without opening the
  real plan database.
- Rebuilt the real HTTP 404 with the common Bill Runway header, skip link,
  navigation, legal footer, metadata, h1 focus, and AA contrast in light and
  dark modes.
- Replaced customer-facing “payment run” language with “upcoming list” across
  the product, manifest, claims, README, CSV feedback, and copy audit. The
  longer mobile export label remains a 44 px target in an 8 px two-column grid.
- Updated the verb-first catalog description and the cumulative repair map in
  `.factory/polish-2.md`.

## Verification

- Final clean clone: `/tmp/bill-runway-polish2-final-OpMu8p`.
- `npm ci`, `npm run build`, and `npm test` passed: 7 Vitest and 24 Playwright
  tests.
- All 13 exact claim commands in `.factory/claims.json` passed from that clean
  clone.
- Cold live verification passed for `/`, `/demo`, `/privacy/`, and `/terms/`:
  title, language, one h1, main, alt coverage, and console checks are clean.
- Cold live `https://bill-runway.sociobot.in/not-a-real-page` returns HTTP 404
  with `noindex, nofollow`, the full site skeleton, and h1 focus.
- Live Playwright Axe WCAG A/AA checks found zero serious or critical issues on
  the root and demo in light/dark modes, privacy, terms, and the HTTP 404 in
  light/dark modes. The standalone Axe CLI could not start Selenium Chrome in
  this worker; the pinned Playwright Axe integration passed.
- Built `dist/` is 53.38 kB raw / 16.05 kB gzip for the single-file app shell.

## Deployment

- Product commits: `1f44d1c9c7afa4e83b5f9249538a3d1715903541` and
  `afd652da0ef869f3d6abbcba0048f9529f03b8e1`.
- Deployed with `/opt/fleet/lib/deploy-static.sh bill-runway /work/repo/dist`.
  Static Web Apps deployment: `a26624c8-741b-45ef-910d-26a893282568`.
- Live root SHA-256 matches the final `dist/index.html`:
  `21eb5886dbdaded5309d62d63935265b0805085133dfabe2e184bff989218bc2`.

## Known gaps

None. The app remains a local-first static PWA with no runtime configuration,
accounts, analytics, bank connections, or payment flow.
