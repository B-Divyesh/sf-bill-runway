# Independent verification 5 — FAIL

Verified 2026-08-30 against candidate commit
`aa3b8b5bdd77b5100ada6a9024c2a74753446517` and production
<https://bill-runway.sociobot.in>.

## Verdict

**FAIL.** The deployed product is the requested candidate and the core planner
works end to end. However, the candidate violates explicit release gates:
some public product claims are absent from `.factory/claims.json`, and three
mobile controls do not meet the required 44 by 44 CSS pixel target. The
required copy audit is also incomplete.

## Release-blocking findings

### High — public claims are missing from the claims manifest

The claims contract says every public claim must be listed with exactly one
tagged test. Two README claims have no matching manifest entry:

- “records paid bills” in the opening description;
- “Handles monthly, weekly, yearly, and one-time entries.”

The `first-gap` test happens to mark one bill paid, but its declared claim is
only that the timeline identifies the first uncovered amount. The
`recurrence-rules` claim and tagged test prove monthly month-end clamping only;
they do not claim or test weekly, yearly, and one-time modes. These sentences
must be removed or represented by dedicated claim entries and observable
tagged tests.

### Medium — mobile targets are smaller than 44 by 44 CSS pixels

At a 390 by 844 viewport, bounding-box measurements found:

| Route | Control | Measured size |
| --- | --- | ---: |
| `/demo` | `60 days` | 131 by 36 px |
| `/demo` | `12 months` | 131 by 36 px |
| `/privacy/`, `/terms/` | `Terms` link | 41.2 by 44 px |

These controls remain operable and axe does not flag target size, but the
attached accessibility and design contracts explicitly require every touch
target to be at least 44 by 44 px.

### Medium — `.factory/copy-audit.md` is not a complete sentence audit

The file says it includes landing, demo, planner states, legal routes, and
README prose, but its table has only 18 rows. It omits, among other text, the
privacy notice sentences, the terms price and warranty sentences, planner
empty/error state sentences, and most README prose. The required proof of
simplicity therefore has not been completed even though the sampled copy is
plain and concise.

## Mandatory first-read and demo gate

**PASS.** A cold, storage-free desktop visit shows all required information
without scrolling:

- job: “See cash gaps before bills are due.”
- audience: “For people and caregivers who need to compare upcoming bills
  with expected income.”
- first actions: `Add bill`, `Add income`, and `Try it with sample data`, with
  a sentence explaining that the sample opens four realistic entries.

`Try it with sample data` is visible on the first desktop and 390 px screens.
One click opens `/demo`, which immediately shows $900 available, named bills,
expected income, and a $446.80 first gap. The persistent banner says “Demo —
sample data, nothing is saved to your plan” and provides `Reset demo` and
`Start for real`.

## Required claim commands

`.factory/claims.json` exists and all ten declared commands passed after the
lockfile install. A direct pre-install invocation could not load
`@playwright/test`; `npm ci` installed the declared dependencies, after which
the entire manifest was rerun from the clean checkout.

| Claim ID | Result | Evidence |
| --- | --- | --- |
| `first-gap` | PASS | one Playwright test passed |
| `offline-reload` | PASS | one Playwright test passed in its own context |
| `twelve-month-view` | PASS | one Playwright test passed with zero billing calls |
| `demo-isolation` | PASS | one Playwright test passed |
| `csv-export` | PASS | one Playwright test passed |
| `json-backup` | PASS | one Playwright test passed |
| `local-only` | PASS | one Playwright test passed |
| `recurrence-rules` | PASS | one tagged Vitest test passed |
| `keyboard-controls` | PASS | one Playwright test passed at 390 px |
| `print-layout` | PASS | one Playwright test passed under print media |

## Clean-checkout quality gates

| Check | Result |
| --- | --- |
| candidate identity | PASS — `HEAD` was exactly `aa3b8b5bdd77b5100ada6a9024c2a74753446517`; worktree was clean |
| `npm ci` | PASS — 65 packages, zero audit vulnerabilities |
| `npm test` | PASS — 6 Vitest tests and 19 Playwright tests |
| type check | PASS — `tsc --noEmit` runs inside the build |
| lint | N/A — no lint script exists |
| `npm run build` | PASS — Vite 7.3.6 wrote `dist/` |

## Independent product exercise

The live app passed a fresh normal, invalid, boundary, and recovery journey:

- saved a $100.00 starting amount and a $125.50 bill;
- reported the exact $25.50 first gap;
- marked the bill paid, showed all covered, and restored the gap with
  `Undo paid`;
- added same-day $25.50 income and applied income before the bill;
- persisted the plan, bill, and income across reload;
- downloaded `payment-run-2026-08-30.csv` and
  `bill-runway-2026-08-30.json`;
- rejected blank names, `1.234`, and one cent above the safe-integer boundary
  with announced errors, then accepted and calculated a $0.01 bill;
- preserved an entry when deletion confirmation was cancelled and removed it
  when confirmation was accepted.

The repository suite also passed invalid-calendar import rejection, leap-day
import/export, v1 storage migration, focus restoration, demo isolation, print
layout, and free 12-month behavior.

## Privacy, requests, and server scope

Playwright recorded the live demo, mark-paid, reset, privacy, and terms flow.
The complete log contained four same-origin GETs (`/demo`, the 720 px hero,
`/privacy/`, and `/terms/`), zero off-origin requests, zero non-GET requests,
and zero request bodies. A separate real-plan workflow also made no off-origin
requests. No console errors, page errors, or failed requests occurred.

The product has no backend, account, sign-in, AI call, billing call, or other
server-side API endpoint. The 429/`Retry-After` allowance test and Entra tenant
check are therefore not applicable. The documented monetisation deviation is
honest: all planner features are free because no Sociobot billing product is
registered.

Live responses include HSTS, CSP with `connect-src 'self'` and
`frame-ancestors 'none'`, Permissions-Policy, `nosniff`, and
`strict-origin-when-cross-origin`. Root and service-worker responses use
30-second must-revalidate caching; the manifest uses one hour and has the
correct MIME type. Unknown routes return HTTP 404 with a designed, noindex
page.

## Accessibility, responsive behavior, and motion

- Required `verify-url.sh` passed `/`, `/demo`, `/privacy/`, and `/terms/`:
  correct title/language, one h1, a main landmark, alt text, and no console
  errors.
- Live axe WCAG A/AA scans at desktop and 390 px found zero violations (and
  zero serious/critical violations) on all four routes; planner light and dark
  themes were both scanned.
- Keyboard focus is a visible 3 px `rgb(19, 107, 130)` outline. The skip link,
  native dialog focus trap, Escape close, opener focus restoration, and route
  focus all worked.
- 200% text sizing caused no horizontal overflow on root or demo. Normal 390
  px layout also had no horizontal overflow.
- Reduced motion matched the media query, changed scrolling to `auto`, and
  reduced transitions to 0.01 ms.
- The sub-44 px controls listed above remain release blockers.

## PWA and offline behavior

A fresh live context installed and activated cache `bill-runway-v8`. After
network disable, `/demo` reloaded with its populated plan and the visible
“Offline · your plan still works on this device” indicator. There were no PWA
console errors.

An isolated server hosting the exact `dist/` build then served a versioned
worker update. The new worker populated `bill-runway-v8-qa-update`, and the app
announced “An update is ready. Reload to use it.” The manifest has valid 192,
512, and 512 maskable icons and standalone display metadata.

## Deployment identity, routes, and performance

The local production build and live deployment were byte-for-byte equal:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `e9227230c81c530bf12299f20b3f8221ab6e8f7a3cebe9db8b99b261625ef537` |
| `sw.js` | `d9cc8af1188521982716250725bbbb52af57801fc6fd1b029c875d32123d5ccc` |
| `manifest.webmanifest` | `a15500ad0be1ebbb6532d934905b822755e3e31d0a07bcc05b5325e625d4645f` |
| `offline.html` | `8cc4cfcc7ff29b8a856618b9570576ce2820aa2b7940aeb30edc4af5fed80c0a` |
| `404.html` | `cf11b6802fa05f8ace566ee551bc4cf322ea92b7de4e06c2d218784bc7cd21aa` |
| `privacy/index.html` | `c8d8bb2758220558986bfa42bd1ce79b4caec54add8814ab96e9a8dc407fc5a9` |
| `terms/index.html` | `df66ad8c233612b6edcb05a020546d887a3f95b7b20a4fbaf94e569701031c71` |

All rendered links returned 200. Titles are under 60 characters,
descriptions under 155, and the social card is a real 1200 by 630 image.

- Lighthouse 12.8.2 mobile: performance 99, accessibility 100, best practices
  100, SEO 100.
- FCP 0.9 s, LCP 1.5 s, TBT 110 ms, CLS 0.
- A 4x CPU-throttled interaction sample peaked at 112 ms.
- `dist/index.html`: 52,546 bytes raw / 15,675 bytes gzip, including all app
  JS and CSS; no external font or script bundles.
- Mobile first transfer: 43,664 bytes, including the 26,964-byte mobile hero.
  Desktop first transfer: 94,770 bytes.
- The 78,070-byte desktop hero and 26,964-byte mobile hero are both below the
  300 KB image budget.

## Defects by severity

- Critical: none.
- High: one — unlisted public claims.
- Medium: two — undersized mobile targets; incomplete copy audit.
- Low: none.

## Required next steps

1. Add exact claims and tagged observable tests for paid-state recording and
   all advertised recurrence modes, or remove the unsupported README claims.
2. Restore at least 44 px height to the demo range controls and at least 44 px
   width to the legal `Terms` links.
3. Regenerate `.factory/copy-audit.md` from every product and README sentence,
   with word counts and banned-word flags, then rerun this verification.
