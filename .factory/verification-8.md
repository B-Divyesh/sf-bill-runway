# Verify upcoming bills before income — independent QA 8

Verified 5 September 2026 against production
<https://bill-runway.sociobot.in>.

Implementation candidate: `afd652da0ef869f3d6abbcba0048f9529f03b8e1`.
Documentation candidate: `5ba0a94b86640b3307c397418064e3268554703a`.
The later commit changes only `.factory` documents. The deployed files match
the build from the documentation candidate, whose product files are the same
as the implementation candidate.

## Verdict: PASS

**PASS.** Finding count: **0**. Untested claim count: **0**.

The deployed PWA completes the researched job, the sample is isolated, all 13
public claims pass their exact commands, and all earlier findings remain
closed. No critical, high, medium, low, or minor defect was found.

## First screen before scrolling

Fresh Chromium profiles were used at 1440 by 900 and 390 by 844.

- **Job:** compare bills with money available now and expected income, then
  show the first amount that is not covered.
- **Audience:** people and caregivers planning bill due dates without a bank
  connection or full budgeting service.
- **First action:** choose **Add bill** for a real plan or **Try it with sample
  data** to inspect a complete plan.

The page itself says “See cash gaps before bills are due,” names people and
caregivers, and shows both actions without scrolling. The sample action ends
at y=576 on the 844 px phone screen and is also visible on desktop. The three
plain facts say the 12-month view is free, data stays on the device, and the
app works offline after the first visit.

## Sample and real-plan isolation

This was observed live in a new phone profile.

- A real plan named “Verify 8 private plan” was saved with $321.45 available.
- One activation opened `/demo` with the persistent “Demo — sample data,
  nothing is saved to your plan” banner.
- Before scrolling, the sample showed $900.00, a $446.80 uncovered amount,
  Electricity, and the upcoming list.
- The sample contained Electricity, Rent, Pharmacy, and Caregiver deposit.
- After Electricity was marked paid, **Reset demo** restored $900.00, all four
  entries, and the **Mark paid** action.
- **Start for real** removed `demo:bill-runway`, returned the named real plan,
  and restored its unchanged $321.45.

The clean claim test also records every IndexedDB open during Reset and proves
that only `demo:bill-runway` is opened. The real `bill-runway` database is not
read or written by Reset.

## Public claims

`.factory/claims.json` declares 13 claims. Each id appears in exactly one test,
there are no undeclared claim tags, and the live page, legal pages, manifest,
and README contain no additional unlisted product promise.

Every exact command was run separately after `npm ci` in the fresh clone
`/tmp/bill-runway-verify8-dr7Atu/repo`.

| Claim | Exact command result |
| --- | --- |
| `first-gap` | PASS — `npx playwright test --grep @claim:first-gap` |
| `offline-reload` | PASS — `npx playwright test --grep @claim:offline-reload` |
| `twelve-month-view` | PASS — `npx playwright test --grep @claim:twelve-month-view` |
| `demo-isolation` | PASS — `npx playwright test --grep @claim:demo-isolation` |
| `reset-demo` | PASS — `npx playwright test --grep @claim:reset-demo` |
| `csv-export` | PASS — `npx playwright test --grep @claim:csv-export` |
| `json-backup` | PASS — `npx playwright test --grep @claim:json-backup` |
| `local-only` | PASS — `npx playwright test --grep @claim:local-only` |
| `recurrence-rules` | PASS — `npx vitest run -t @claim:recurrence-rules` |
| `recurrence-modes` | PASS — `npx vitest run -t @claim:recurrence-modes` |
| `paid-status` | PASS — `npx playwright test --grep @claim:paid-status` |
| `keyboard-controls` | PASS — `npx playwright test --grep @claim:keyboard-controls` |
| `print-layout` | PASS — `npx playwright test --grep @claim:print-layout` |

## Clean checkout gates

| Check | Result |
| --- | --- |
| starting state | PASS — clean `main` at `5ba0a94b86640b3307c397418064e3268554703a` |
| documented prerequisite | PASS — Node 22 satisfies Node 20 or newer |
| `npm ci` | PASS — 65 packages, zero vulnerabilities |
| all claim commands | PASS — 13 of 13 |
| `npm test` | PASS — 7 Vitest and 24 Playwright tests |
| `npm run build` | PASS — TypeScript and Vite wrote `dist/index.html` |
| `npm audit --audit-level=high` | PASS — zero vulnerabilities |
| lint | Not declared; no lint script exists |

The built app shell is 53,375 bytes raw and 15,871 bytes gzip. Source CSS is
below 50 KB, the phone hero is 26,964 bytes, the desktop hero is 78,070 bytes,
and there are no downloaded fonts. The static bundle meets the stated budgets.

## Normal, invalid, boundary, and recovery paths

Independent live checks and the clean suite cover these cases.

- $100.00 available and a $125.50 bill produced the exact $25.50 gap.
- $25.50 income on the same date sorted before the bill and changed the plan
  to “All bills are covered.”
- Both entries survived reload. A JSON backup contained version 1 and both
  entries.
- `1.234` and an amount beyond the safe-integer boundary were rejected with a
  specific two-decimal-place instruction.
- Blank names, missing dates, impossible dates, cancelled deletion, confirmed
  deletion, paid-state persistence, undo, leap dates, and all recurrence modes
  pass the browser or unit suite.
- A blocked IndexedDB open produced a clear storage error, told the visitor to
  allow site data and reload, and provided **Try again**.
- A malformed backup does not replace the existing plan.

The product uses integer cents and calendar validation. It does not connect to
banks, move money, or present the forecast as advice.

## Accessibility, keyboard, phone, and motion

- The factory URL verifier passed `/`, `/demo`, `/demo/`, `/privacy/`, and
  `/terms/` with HTTP 200, a title, `lang=en`, one h1, one main landmark,
  image alternatives, labelled buttons, and zero console errors.
- Ten live Playwright Axe WCAG A/AA scans covered root, demo, privacy, terms,
  and the HTTP 404 in light and dark treatments. They found zero violations.
- The skip link is first in keyboard order and has a 3 px visible focus ring.
  Range, paid, demo-reset, and settings actions retain focus after rendering.
  Dialog focus starts in Name, Escape closes the dialog, and focus returns to
  the opener. Privacy navigation and browser Back focus the destination h1.
- Phone routes have no horizontal overflow. Range and legal targets are at
  least 44 by 44 px. The import control uses a 48 px label target and mirrors
  keyboard focus on that label. Action pairs keep at least 8 px spacing.
- At 200% root text size, root, demo, legal, and 404 pages do not overflow.
- Reduced motion is detected. Transitions and animations become 0.01 ms and
  scroll behavior becomes instant.

## Privacy, offline use, updates, and network scope

A live request log covered the root, sample entry, paid change, Reset, exit,
legal routes, normal plan changes, and backup. It recorded zero off-origin
requests and zero request bodies sent to a server. Canonical routes produced
no console error or failed request. There are no analytics, trackers, account,
bank, AI, billing, or third-party script requests.

A fresh live `/demo` profile installed cache `bill-runway-v10`. After network
access was disabled, reload kept the banner, offline notice, and all seven
visible events. A controlled copy of the candidate was changed to worker cache
`bill-runway-v11`; the app announced “An update is ready. Reload to use it,”
reloaded, and removed the old cache.

This is a static PWA with no backend. Tenant isolation, server restart
persistence, health endpoints, request allowances, and 429/`Retry-After` are
not applicable. Product state is browser-local IndexedDB, not server storage.

## Routes, legal pages, links, and expected 404

| URL | HTTP | Title and result |
| --- | ---: | --- |
| `/` | 200 | `Bill Runway — see cash gaps before bills are due` |
| `/demo` | 200 | `Demo — Bill Runway` |
| `/demo/` | 200 | Same demo, no relative preload or console failure |
| `/privacy/` | 200 | `Privacy — Bill Runway`; shared header and footer |
| `/terms/` | 200 | `Terms — Bill Runway`; free-product terms |
| `/not-a-real-page` | 404 | `Page not found — Bill Runway`; focused h1, `noindex`, full skeleton, recovery link |

All destination links from these pages return 200. The 404 page's own skip
link remains on the same deliberate HTTP 404 document, which is expected.
The browser's resource message for that deliberate navigation is not a broken
page or product defect.

The one-time paid plan in the researched brief remains an honest documented
deviation: the Sociobot product is not registered, so no broken checkout is
advertised and the complete planner is free. No billing infrastructure was
read or changed.

## Earlier findings

All earlier review and verification reports, including minor findings, were
read and checked against current live behavior and the clean candidate.

| Earlier finding | Current evidence |
| --- | --- |
| Initial Plus checkout unavailable | Closed — all features are free; there is no checkout, license storage, or billing request. |
| Initial impossible-date import | Closed — invalid import and stored dates are rejected without replacing valid data. |
| Verification 2 import focus | Closed — the real file input is keyboard reachable and its visible label shows a 3 px ring. |
| Verification 2 four-pixel mobile gaps | Closed — the keyboard claim asserts at least 8 px for both action pairs. |
| Verification 5 missing paid and recurrence claims | Closed — `paid-status` and `recurrence-modes` each have one passing tagged test. |
| Verification 5 small range/legal targets | Closed — live and test measurements meet 44 px. |
| Verification 5 incomplete copy audit | Closed — the audit includes product, state, legal, offline, 404, and README sentences. |
| Verification 6 two-page print | Closed — the seven-event sample PDF has exactly one A4 page. |
| Verification 6 `/demo/` preload error | Closed — the route passes the live URL verifier with no bad request or console error. |
| Verification 6 lost focus after changes | Closed — live and tagged tests prove focus retention for state-changing controls. |
| F-1-1 sample below phone fold | Closed — sample action and populated sample output are visible before scrolling. |
| F-1-2 false 200 for unknown URL | Closed — unknown paths return the designed HTTP 404. |
| F-1-3 inconsistent legal skeleton | Closed — both legal routes use the shared navigation and legal footer. |
| F-1-4 route focus missing | Closed — legal navigation and Back focus the new h1. |
| F-1-5 route metadata missing | Closed — legal and 404 pages have route metadata, social image, and icons. |
| F-1-6 unclear exclusion heading | Closed — it reads “No bank connections or payments.” |
| F-1-7 README jargon | Closed — the opening uses “upcoming list.” |
| F-1-8 long README sentence | Closed — build instructions are split and the copy audit has no sentence over 22 words. |
| F-1-9 public artwork claim | Closed — the public claim is removed; provenance remains in the design record. |
| F-2-1 Reset was untested | Closed — `reset-demo` passes and proves restoration plus database isolation. |
| F-2-2 incomplete 404 skeleton | Closed — the live 404 has skip link, header, primary navigation, footer, legal links, and recovery. |
| F-2-3 “payment run” jargon | Closed — public product copy uses “upcoming list”; repository search finds no old phrase. |

The visual system remains specific to this product: paper and ink colors,
editorial type, original causeway art, and a compact date-and-balance layout.
The brief does not need an AI step; deterministic dates, amounts, import,
export, and offline use are the useful workflow.

## Performance and deployment identity

Live Lighthouse 12.8.2 mobile scored **98 performance, 100 accessibility, 100
best practices, and 100 SEO**. FCP was 1.02 s, LCP 1.50 s, total blocking time
161 ms, CLS 0, and total transfer 124,188 bytes.

The following live files are byte-for-byte equal to the clean candidate build:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `21eb5886dbdaded5309d62d63935265b0805085133dfabe2e184bff989218bc2` |
| `404.html` | `1b9141f278b3cdaf9701d5cc533b130b1d3bf62f2183e05cb367e57c6d5ef2b5` |
| `privacy/index.html` | `b24d6f5c0ceaaf7cc6bbb26a17984c2511e8d51a7ef05519ef0e949d768fa1a6` |
| `terms/index.html` | `e14c4e5519829536bf6c4d5bcd0961b0449c6e880787f4bbd7601c30e8f02425` |
| `sw.js` | `b03556c54ba3e9267eaaa01658d131d62b90a2581b903aa1fdb20b2e4ff18896` |
| `manifest.webmanifest` | `bbf44176d720b3992b038b5a47e68a43c90e54aaa39307cb2dc3b92d151914bc` |

## Final decision

**PASS — accept implementation `afd652da0ef869f3d6abbcba0048f9529f03b8e1`.**

Findings: **0**. Untested claims: **0**.
