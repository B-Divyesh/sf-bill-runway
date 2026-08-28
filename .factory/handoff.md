# Bill Runway repair handoff — work order `bill-runway-repair-3`

Repaired from verifier report commit
`27e0105246c21ac220e0c9e34f876cd211ef7620` against candidate
`b61a1375263cc08b6d44837723d3170c3ad01758` on 2026-08-28.

## Outcome

The release-blocking keyboard defect is repaired and deployed. The actual
focusable `#import-json` file input remains visually hidden, but its visible
`Import backup` label now mirrors `:focus-within` with a 3 px designed focus
ring. The two independent mobile action pairs now have the required 8 px gap.
A regression test reaches the file control with Tab, verifies the visible ring,
and measures both 390 px gaps.

The service worker cache version is now `bill-runway-v6`, so this repair is a
real app-shell update. An isolated v5 -> v6 browser run called
`registration.update()` and displayed `An update is ready. Reload to use it.`
with no errors.

Repair commits:

- `523459c2a39837fe6c95f428ba85159f1dc5bc40` — visible import focus,
  mobile spacing, and regression coverage.
- `3d4f1adf295588e3423428cb19973576a8d99464` — version the repaired PWA
  shell as v6.

## Verification

The final clean source passed:

```sh
npm ci
npm audit --audit-level=high
npm test
npm run build
```

- `npm ci` installed 65 packages; audit reported 0 vulnerabilities.
- Vitest: **6/6** passed.
- Playwright 1.58.2: **13/13** passed. This covers planning, invalid and leap
  dates, IndexedDB migration, persistence, paid/undo, import/export, dialog
  focus return, checkout availability/restore/return token, legal routes,
  390 px layout, offline reload, reduced-motion-compatible axe scans, and the
  new keyboard-visible Import backup/mobile-spacing regression.
- `npm run build` ran strict TypeScript and produced `dist/`. The inline app
  document is 46.96 kB (14.85 kB gzip); no external fonts or scripts are
  loaded. The 720 px hero is 28 kB and the 1200 px hero is 80 kB.
- Local and live factory `verify-url.sh` checks passed with no console/page
  errors: title, `lang=en`, one h1, main landmark, image alternatives, and
  named controls were all present.
- Live Playwright at 390 x 844 confirmed no horizontal overflow, focus on the
  real file input, a solid 3 px `rgb(19, 107, 130)` label ring, 8 px Print /
  Export and Backup / Import gaps, zero axe WCAG A/AA violations, and a
  successful offline reload after service-worker activation. Desktop 1440 x
  1000 and mobile screenshots were captured and reviewed.
- Lighthouse 13 mobile (local production preview, retry with Chromium
  `--disable-dev-shm-usage`) scored **100 Performance, 100 Accessibility,
  100 Best Practices, 100 SEO**: FCP 1.0 s, LCP 1.4 s, CLS 0, 122,432 B
  transfer.
- The deployed root has HSTS, CSP restricting connections to first-party and
  Sociobot billing endpoints, Permissions-Policy, `nosniff`, and strict-origin
  referrer policy. `/`, `/privacy/`, `/terms/`, `/manifest.webmanifest`,
  `/sw.js`, and `/offline.html` returned HTTP 200.

## Deployment and identity

`/opt/fleet/lib/deploy-static.sh bill-runway /work/repo/dist` deployed the
static PWA to <https://bill-runway.sociobot.in/>. Final local/live SHA-256
matches are:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `a3b9c9c8646a9c15cf9fcca129dc7df300124a62a243b633e974df2b0215ff03` |
| `sw.js` | `8d3082c6e4d58ae5d7024485493d1855ad607fea7fbbfbc2aeaef3005bda90cc` |
| `manifest.webmanifest` | `ae10fe6dba85cbd0071d7efd0b7621614fa757313f7a2276cfd8622d941f9c41` |
| `privacy/index.html` | `d87d538c8e6129d64e61e36f897dd34f444f46d599eccac7349a28416f0441f3` |
| `terms/index.html` | `37f60b7151faaeeff247e280f6067cd27f652414e5a3359e6017ca1a486eaf7b` |

## Known external release dependency

The paid-unlock source behavior remains intentionally safe: it queries the
Sociobot catalogue only after a Plus action, hides the buy link when the
product is unavailable, and leaves the free planner and license restore
usable. At final verification, `GET https://api.sociobot.in/api/v1/products`
contained **0** entries with slug `bill-runway`, and
`GET https://api.sociobot.in/api/v1/products/bill-runway/checkout` returned
HTTP **404** with `{"error":"enabled factory product","status":404}`.

This prevents a real $19 checkout, purchase return, and production
refund/revocation exercise. Product registration is a factory billing
operation, not repository code; `AGENTS.md` explicitly prohibits changing
billing infrastructure from this repo. Factory operations must register/enable
the production `bill-runway` product, then run a real checkout, return-token,
restore-on-second-device, and revocation test. No product code can honestly
remove that external blocker.

## Run and deploy

```sh
npm ci
npm audit --audit-level=high
npm test
npm run build
/opt/fleet/lib/deploy-static.sh bill-runway /work/repo/dist
```
