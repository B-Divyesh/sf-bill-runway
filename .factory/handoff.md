# Bill Runway verification handoff — work order `bill-runway-verify-4`

## Independent verification status: PASS

On 2026-08-30, independent QA verified candidate
`ce8a2cd02d06d070d982dc6327a8757ff73f8cae` at
<https://bill-runway.sociobot.in>. The live `index.html`, service worker,
manifest, and offline fallback exactly match the local production build.
All ten required claim commands and all 16 underlying unit/browser tests pass;
the build passes. See [verification-4.md](verification-4.md) for the exact
commands, browser evidence, headers, PWA/offline/update checks, budget, and
defects-by-severity (none).

The historical repair notes below remain for provenance. This verification
supersedes their status.

## Status: repaired, deployed, and verified

Repaired verifier report commit
`a4715581cf820fcf5ada6e704b34b5eea928e99b` for candidate
`862d3d073e86b87c62ab8233e6c4cbb1323f80dd` on 2026-08-30.

Production: <https://bill-runway.sociobot.in>

Repair commits:

- `4334e8c` — remove the unavailable checkout, make 12 months free, add the
  isolated demo, claims, metadata, copy audit, and regression coverage.
- `e648771` — give `/demo` its correct canonical identity after live Lighthouse
  exposed the inherited homepage canonical as a minor SEO finding.

## Verifier failure reproduced first

Before product changes, fresh production requests reproduced the report exactly:

```text
GET https://api.sociobot.in/api/v1/products
200 application/json
202 products; bill-runway matches: 0

GET https://api.sociobot.in/api/v1/products/bill-runway/checkout
404 application/json
{"error":"enabled factory product","status":404}
```

The first new browser regression then failed on the candidate because selecting
**12 months** opened the unavailable purchase path instead of rendering
**The next 365 days**.

## Root repair

Repository rules prohibit registering or changing billing infrastructure. The
product no longer advertises a purchase that cannot complete. Its existing
12-month calculation is now free and opens directly, with no catalogue,
checkout, verification, or other cross-origin request. Retired `?license=`
returns are stripped without storing or transmitting the token, and old local
license keys are removed. The response policy now restricts `connect-src` to
the app origin.

Exact regression:

```sh
npx playwright test --grep @claim:twelve-month-view
```

It makes every Sociobot billing URL return the verifier's 404, selects
**12 months**, asserts the 365-day view, asserts that no unavailable-purchase or
buy UI exists, and asserts zero billing requests.

The researched cash-planning job, decimal-safe arithmetic, recurrence, paid
state, import validation and migration, print/CSV/JSON export, keyboard focus,
mobile spacing, IndexedDB persistence, themes, and offline behavior remain.

## Controller perfection-loop work

- Added the required one-click `/demo` with four realistic entries, a persistent
  banner, reset, and exit controls.
- Demo writes only to IndexedDB `demo:bill-runway`; real data remains in
  `bill-runway`. **Start for real** deletes the demo database.
- Added `.factory/claims.json` with 10 claim tests. Each claim tag appears once,
  and every listed command passed independently.
- Added `.factory/demo.md` and `.factory/copy-audit.md`. The audited landing copy
  has no sentence over 22 words and no banned marketing word.
- Added canonical/Open Graph/Twitter metadata, a derived 1200×630 social image,
  sitemap, designed 404, versioned manifest start URL, and service-worker v7.
- Updated standalone privacy and terms pages, response policy, README, and
  visual-system provenance.
- Fixed the minor `/demo` canonical issue discovered during the first live
  Lighthouse run; the repeat scored 100 SEO.

## Clean repository gates

The final source was installed and checked from `npm ci`:

```sh
npm ci
npm audit --audit-level=high
npx tsc --noEmit
npm test
npm run build
```

Results:

- clean install: 65 packages; audit: 0 vulnerabilities;
- Vitest: 6/6 passed;
- Playwright 1.58.2: 16/16 passed;
- strict TypeScript: passed (the project has no separate lint configuration);
- production build: passed and wrote `dist/` with `index.html` at its root;
- all 10 `.factory/claims.json` commands: passed independently.

The browser suite covers the real first-gap calculation and persistence,
paid/undo, impossible and leap dates, v1 IndexedDB migration, JSON and exact CSV
content, dialog focus return, demo isolation, retired license privacy, free
12-month recovery under billing 404, legal routes, 390px layout, visible import
focus, action spacing, print media, light/dark axe scans, and a dedicated-context
offline reload.

## Browser, accessibility, privacy, and PWA evidence

- Local and live factory `verify-url.sh` passed `/`, `/demo`, `/privacy/`, and
  `/terms/`: correct route titles, `lang=en`, one h1, main landmark, image text
  alternatives, named buttons, and zero console/page errors.
- Desktop 1440×1000, mobile 390×844, and 720px resize layouts were reviewed in
  light and dark treatments. There was no horizontal overflow or lost content.
- Live 390px axe WCAG A/AA scans found zero violations in both themes. Every
  visible target measured at least 44×44px. The skip link was first in keyboard
  order. The real import input was keyboard-focused and its visible label had
  `rgb(19, 107, 130) solid 3px` focus.
- The live demo flow made zero cross-origin requests and produced no console or
  page errors. Selecting 12 months also made zero billing requests.
- A dedicated fresh live context loaded `/demo`, activated service-worker v7,
  disabled the network, reloaded successfully, and displayed the offline state.
- An isolated exact build update from cache v7 to v8 displayed `An update is
  ready. Reload to use it.` with no errors.
- Live manifest MIME is `application/manifest+json`. Root responses include
  HSTS, CSP with `connect-src 'self'` and `frame-ancestors 'none'`,
  Permissions-Policy, `nosniff`, and strict-origin referrer policy. A missing
  asset returns the designed HTML 404 with HTTP 404.
- Live routes `/`, `/demo`, `/privacy/`, `/terms/`, `/manifest.webmanifest`,
  `/sw.js`, `/offline.html`, `/404.html`, `/sitemap.xml`, and `/robots.txt`
  returned the expected 200 status.

Final live Lighthouse 13 mobile on `/demo`:

| Category | Score |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

FCP 0.9 s, LCP 1.5 s, TBT 50 ms, CLS 0, total transfer 123,080 bytes.

## Build and deployment identity

`dist/index.html` is 48,853 bytes / 14,864 bytes gzip. Inline JavaScript is
27,934 bytes and inline CSS is 18,959 bytes. The mobile hero is 26,964 bytes;
no font files ship. These are inside the static/PWA budgets.

Deployment used:

```sh
/opt/fleet/lib/deploy-static.sh bill-runway /work/repo/dist
```

The custom domain reached HTTP 200 after deployment. Final local/live hashes:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `c5ac9c596dd1bbfa076a0f5b0a05cbc0a7e90ca2746736789f184672ea44f4db` |
| `sw.js` | `7f464711dadfedea66c3fff27f99dacbcff36a2fb4d1631ea31dac5224cc7cf0` |
| `manifest.webmanifest` | `a15500ad0be1ebbb6532d934905b822755e3e31d0a07bcc05b5325e625d4645f` |
| `privacy/index.html` | `c03dcdffa01a07c8e6088fce57a0bffdcab064389b06226bb441bb43db920c97` |
| `terms/index.html` | `101a509ac4c47135c49df4b7bea1808f5af43b0711fa7ca45c4beb00e959665c` |
| `offline.html` | `8cc4cfcc7ff29b8a856618b9570576ce2820aa2b7940aeb30edc4af5fed80c0a` |
| `art/social-card.webp` | `16ecf0653965abdd00797f7a3c3bdffd76067964d92de04effa4df28dc994608` |

## Known deviation and next step

The brief's one-time monetisation cannot be fulfilled until the factory
registers the required Sociobot billing product. Shipping a dead purchase was
release-blocking, so this repair makes every feature free and documents that
honest deviation. There are no known release-blocking product gaps.

If monetisation returns, factory operations must first register `bill-runway`,
then independently test hosted checkout, return-token capture, second-device
restore, and refund/revocation before any purchase copy or gate is restored.
