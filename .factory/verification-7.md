# Independent verification 7 — PASS

Verified 30 August 2026 against candidate commit
`a62b51425388fae509afdb2667f5966fe84c6e2e` and production
<https://bill-runway.sociobot.in>.

## Verdict

**PASS.** The deployed PWA exactly matches the candidate build, every declared
claim passes its exact test, the cold first screen passes the plain-words and
one-click-demo gates, and the smallest useful cash-runway workflow works end to
end. The three blockers from independent verification 6 are repaired: the
sample payment run is one A4 page, both demo URL forms load without errors, and
state-changing keyboard controls retain focus.

No critical, high, medium, or low release defects were found.

## Mandatory claims gate

`.factory/claims.json` exists and declares 12 claims. After the required clean
install, every listed command was run separately from the candidate checkout;
all 12 passed. A source audit found every declared `@claim` tag exactly once,
with no missing, duplicate, or undeclared tags.

| Claim | Result | Independent evidence |
| --- | --- | --- |
| `first-gap` | PASS | Playwright passed; $100.00 against $125.50 produced the exact $25.50 gap. |
| `offline-reload` | PASS | Isolated-context Playwright passed; fresh live `/demo` also reloaded offline with seven events. |
| `twelve-month-view` | PASS | Playwright passed with a free 365-day view and no billing request. |
| `demo-isolation` | PASS | Playwright passed; live real-plan name survived demo entry/exit and the demo database was deleted. |
| `csv-export` | PASS | Playwright passed; live demo CSV had the six-column header and seven event rows. |
| `json-backup` | PASS | Playwright passed; live backup contained version 1 and all four sample entries. |
| `local-only` | PASS | Playwright passed; live demo/paid/reset/legal flow made only same-origin GET requests. |
| `recurrence-rules` | PASS | Vitest passed for January 31 calendar-safe month ends. |
| `recurrence-modes` | PASS | Vitest passed for monthly, weekly, yearly, and one-time dates. |
| `paid-status` | PASS | Playwright passed; live paid state survived reload and undo restored it. |
| `keyboard-controls` | PASS | Playwright passed; live range and paid controls retained focus after rerender. |
| `print-layout` | PASS | Playwright passed; live seven-event Chromium PDF contained exactly one page object. |

The live first screen and README were cross-checked against the claim list. All
visitor-facing product promises map to the declared claims; no unlisted product
claim was found.

## Cold first-read and demo gate

**PASS** in storage-free browser contexts at 1440 by 900 and 390 by 844.

- What it does: “See cash gaps before bills are due.”
- For whom: “For people and caregivers who need to compare upcoming bills with
  expected income.”
- What to click first: “Try it with sample data,” followed by “The sample opens
  a separate workspace with four realistic entries.”
- Three first-screen facts state that the complete 12-month view is free, plan
  data stays on the device, and the app works offline after the first visit.
- At 390 px, the sample action occupied y=532–576 inside the 844 px first
  viewport. One keyboard-operable click opened `/demo`; the banner, summary,
  first $446.80 gap, and first payment-run event were all in that first viewport.
- The sample immediately contained $900.00, four named entries, and seven
  visible 60-day occurrences. Its persistent banner identifies the demo and
  provides `Reset demo` and `Start for real`.

## Clean-checkout quality gates

| Check | Result |
| --- | --- |
| starting identity | PASS — clean `main` at the exact candidate SHA |
| `npm ci` | PASS — 65 packages installed; zero vulnerabilities |
| every `.factory/claims.json` command | PASS — 12 of 12 |
| `npm test` | PASS — 7 Vitest tests and 22 Playwright tests |
| `npx tsc --noEmit` | PASS |
| lint | N/A — the repository has no lint script |
| `npm run build` | PASS — TypeScript and Vite 7.3.6 produced `dist/` |
| `npm audit --audit-level=high` | PASS — zero vulnerabilities |
| library/CLI consumer install | N/A — this artifact is a static PWA |

## Independent product exercise

A fresh live real-plan context covered normal, boundary, invalid, and recovery
paths derived from the researched brief:

- Saved $100.00 and a $125.50 same-day bill; the first uncovered amount was
  exactly $25.50.
- Added $25.50 same-day income. Income sorted before the bill and the planner
  changed to “All bills are covered.”
- Rejected a blank plan name, `1.234` money, a blank entry name, `1.234` entry
  amount, an amount beyond the safe-integer boundary, and a missing date. Each
  dialog remained usable and showed a specific recovery instruction.
- Marked a bill paid by keyboard, retained focus on `Undo paid`, reloaded with
  the paid state intact, then undid it.
- Downloaded a seven-row sample CSV with Date, Type, Name, Amount, Status, and
  Balance-after columns. Downloaded a version-1 JSON backup with all four named
  entries.
- Rejected an impossible-date JSON backup without replacing the existing plan.
- A cancelled deletion kept the entry; confirmed deletion removed it.
- Switched to the free 365-day range by keyboard. The 12-month control kept
  focus and the sample showed 37 occurrences.
- Left the demo through `Start for real`; the separately stored real plan
  returned and `demo:bill-runway` was deleted.

These checks complement the suite's leap-date import, malformed v1 storage
migration, recurrence, dialog, mobile, print, and URL regressions. The product
uses deterministic decimal-safe date and currency logic; the brief does not
benefit from an AI feature.

## Privacy, network boundary, and server scope

A fresh live request log covered `/demo`, mark paid, demo reset, `/privacy/`,
and `/terms/`. It contained four same-origin GETs, zero off-origin requests,
zero non-GET requests, zero request bodies, zero failed requests, and zero
console/page errors. No analytics, third-party script, bank, AI, sign-in,
billing, or product-unlock call occurred.

The product is static and exposes no server-side application endpoint.
Per-client request allowances, 429/`Retry-After`, backend concurrency,
server persistence, health/build identity endpoints, and Entra authority checks
are therefore not applicable. Real plan data uses IndexedDB `bill-runway`; demo
data uses the separate `demo:bill-runway` database.

Root responses include HSTS, CSP with `connect-src 'self'` and
`frame-ancestors 'none'`, Permissions-Policy, `nosniff`, and
`strict-origin-when-cross-origin`. Root and service-worker responses use
`public, must-revalidate, max-age=30`; the manifest uses a one-hour cache and
the correct `application/manifest+json` type. The worker precaches the shell and
uses cache-first asset handling. An unknown route returns the designed page
with HTTP 404.

## Accessibility, responsive layout, and content

- `/opt/fleet/lib/verify-url.sh` passed `/`, `/demo`, `/demo/`, `/privacy/`, and
  `/terms/`: HTTP 200, correct title and language, one h1, main landmark,
  image alternatives, labelled buttons, and no console errors.
- Playwright axe WCAG A/AA scans found zero violations (and therefore zero
  serious/critical findings) on root and demo in light and dark modes at 1440
  and 390 px, plus both legal pages on mobile dark mode.
- At 390 px, all visible links, buttons, selects, text inputs, and file-label
  controls on all four routes were at least 44 by 44 CSS px. There was no
  horizontal overflow, including after 200% root text enlargement.
- Tab first reaches the visible `Skip to planner` link with a 3 px teal focus
  outline. Entry-dialog focus moves to Name, Escape closes the dialog, and
  focus returns to `Add bill`.
- Reduced-motion contexts reduce visible transition and animation durations to
  0.01 ms. No flashing or looping motion exists.
- Each route has one h1, route-specific title/description/canonical metadata,
  and the 1200 by 630 product social image. All crawled product links returned
  200. Manifest icons are valid 192, 512, and maskable 512 px assets.

## PWA, performance, and deployment identity

- Fresh live `/demo` installed `bill-runway-v10`. Offline reload retained the
  demo banner, offline notice, and all seven payment-run events with no browser
  errors or failed requests.
- A controlled server using the exact candidate build served a version-bumped
  worker. The app announced “An update is ready. Reload to use it,” reloaded
  successfully, and finished with only the new cache.
- Live Lighthouse 12.8.2 mobile: **96 performance, 100 accessibility, 100 best
  practices, 100 SEO**; FCP 1.0 s, LCP 1.5 s, TBT 220 ms, CLS 0, total transfer
  135 KiB.
- A 4× CPU-throttled 30-switch interaction sample measured 114.2 ms p95 and
  117.9 ms maximum to the second animation frame.
- The single-file application shell is 53,182 bytes raw / 15,846 bytes gzip,
  including its inlined JS and CSS. Source CSS is 23,631 bytes. The mobile and
  desktop hero images are 26,964 and 78,070 bytes. No font downloads or
  third-party runtime scripts ship. All applicable bundle budgets pass.

The live deployment exactly matches the candidate production build:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `cda58573ce8e2412235ce9aecf0385e3f83062acfa0f3d07a67e3aff7a7aa17a` |
| `sw.js` | `b03556c54ba3e9267eaaa01658d131d62b90a2581b903aa1fdb20b2e4ff18896` |
| `manifest.webmanifest` | `a15500ad0be1ebbb6532d934905b822755e3e31d0a07bcc05b5325e625d4645f` |
| `offline.html` | `8cc4cfcc7ff29b8a856618b9570576ce2820aa2b7940aeb30edc4af5fed80c0a` |
| `404.html` | `cf11b6802fa05f8ace566ee551bc4cf322ea92b7de4e06c2d218784bc7cd21aa` |
| `privacy/index.html` | `6218a7d32ee1f6465489b71b7053ff173a97225730f6b65e8eaa52569c55ac75` |
| `terms/index.html` | `a856f7ae2a3fdef7313d65d17a5f0168960bbbcce8a88ff3e06d4ee5e3e3909b` |

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

## Release decision

**PASS — accept candidate `a62b51425388fae509afdb2667f5966fe84c6e2e`.**
