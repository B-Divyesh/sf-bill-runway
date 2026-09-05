# Review upcoming bills before income — strict review 3

Reviewed 5 September 2026 against production
<https://bill-runway.sociobot.in>.

Implementation candidate: `afd652da0ef869f3d6abbcba0048f9529f03b8e1`.
Documentation baseline: `c3b944326e1c07ba09fca5724af7f0f488630323`.
The commits after the implementation candidate change only `.factory`
documents. Seven production artifacts are byte-for-byte equal to the clean
candidate build.

## Verdict: PASS

**PASS — zero findings and zero untested claims.**

- Critical findings: 0
- High findings: 0
- Medium findings: 0
- Low findings: 0
- Minor findings: 0
- Untested claims: 0

The live PWA completes the researched job, preserves real data while the sample
is open, passes every exact claim command, and keeps every earlier finding
closed.

## First screen before scrolling

Fresh Chromium contexts were used at 1440 by 900 and 390 by 844. Screenshots
are in `/work/.evidence/review-3/first-screen-desktop.png` and
`first-screen-phone.png`.

- **Job:** compare upcoming bills with money available now and expected income,
  then identify the first amount that is not covered.
- **Audience:** people and caregivers planning due dates without connecting a
  bank or adopting a full budgeting service.
- **First action:** choose **Add bill** for a real plan or **Try it with sample
  data** to review a complete plan.

The first screen says “See cash gaps before bills are due,” names people and
caregivers, and shows both actions before scrolling. The sample action ends at
576.3 CSS px on the 844 px phone screen and 627.5 CSS px on desktop. The three
facts state that the 12-month view is free, plan data stays on the device, and
the app works offline after the first visit. Both contexts had no horizontal
overflow or console error.

## One-click sample and data isolation

A new 390 by 844 browser context completed this live sequence.

1. A real plan named “Review 3 private plan” was saved with $321.45 available.
2. One activation opened `/demo` and showed the persistent “Demo — sample data,
   nothing is saved to your plan” label.
3. The populated view showed $900.00, a $446.80 uncovered amount, four named
   entries, and seven visible occurrences.
4. The entries were Electricity, Rent, Pharmacy, and Caregiver deposit.
5. Electricity was marked paid. **Reset demo** restored its **Mark paid** action,
   all four entries, seven occurrences, and $900.00.
6. **Start for real** removed the demo database and returned the unchanged
   “Review 3 private plan” with $321.45.

The action log contained no cross-origin request, non-GET request, or request
body. The clean `reset-demo` claim additionally records all IndexedDB opens and
proves that Reset opens only `demo:bill-runway`, never `bill-runway`.

## Public claims

`.factory/claims.json` declares 13 claims. Every id appears in exactly one
tagged test. There are no missing, duplicate, or undeclared claim tags. The live
page, legal pages, manifest, README, and catalog description were checked for
additional public promises; none is unlisted.

Every command below ran separately after `npm ci` in the clean checkout
`/tmp/bill-runway-review3-zTyGud/repo`.

| Claim | Exact command | Result |
| --- | --- | --- |
| `first-gap` | `npx playwright test --grep @claim:first-gap` | PASS — one browser test |
| `offline-reload` | `npx playwright test --grep @claim:offline-reload` | PASS — one isolated-context browser test |
| `twelve-month-view` | `npx playwright test --grep @claim:twelve-month-view` | PASS — one browser test, 365 days and no billing request |
| `demo-isolation` | `npx playwright test --grep @claim:demo-isolation` | PASS — one browser test |
| `reset-demo` | `npx playwright test --grep @claim:reset-demo` | PASS — one browser test with storage-open recording |
| `csv-export` | `npx playwright test --grep @claim:csv-export` | PASS — one browser test |
| `json-backup` | `npx playwright test --grep @claim:json-backup` | PASS — one browser test |
| `local-only` | `npx playwright test --grep @claim:local-only` | PASS — one browser test |
| `recurrence-rules` | `npx vitest run -t @claim:recurrence-rules` | PASS — one unit test |
| `recurrence-modes` | `npx vitest run -t @claim:recurrence-modes` | PASS — one unit test |
| `paid-status` | `npx playwright test --grep @claim:paid-status` | PASS — one browser test |
| `keyboard-controls` | `npx playwright test --grep @claim:keyboard-controls` | PASS — one browser test |
| `print-layout` | `npx playwright test --grep @claim:print-layout` | PASS — one browser PDF test |

## Clean-checkout quality gates

| Check | Result |
| --- | --- |
| starting state | PASS — detached clean checkout at documentation SHA `c3b9443` |
| prerequisite | PASS — Node 22.23.2 satisfies Node 20 or newer |
| `npm ci` | PASS — 65 packages, zero vulnerabilities |
| all exact claim commands | PASS — 13 of 13 |
| `npm test` | PASS — 7 Vitest and 24 Playwright tests |
| `npm run build` | PASS — TypeScript and Vite wrote `dist/index.html` |
| `npm audit --audit-level=high` | PASS — zero vulnerabilities |
| lint | Not declared — no lint script exists |

The built single-file shell is 53,375 bytes raw and 16,046 bytes gzip. Source
CSS is 23,817 bytes. The phone and desktop hero files are 26,964 and 78,070
bytes. No font is downloaded. These values meet the static-product budgets.

## Normal, invalid, boundary, and recovery paths

Fresh live contexts independently covered these paths.

- $100.00 available and a $125.50 bill produced the exact $25.50 uncovered
  amount.
- $25.50 income on the same date sorted before the bill and changed the result
  to “All bills are covered.”
- Both entries and paid status survived reload. **Undo paid** restored the
  unpaid state.
- A downloaded JSON backup had version 1 and both current entries.
- Blank plan and entry names, `1.234`, an amount beyond the safe-integer
  boundary, and a missing date were rejected with recovery instructions.
- An impossible-date backup was rejected without replacing the valid plan.
- Cancelling deletion kept the entry; confirming deletion removed it.
- A deliberately blocked IndexedDB open produced the local-storage error,
  instructed the visitor to allow site data and reload, and exposed **Try
  again**.
- Unit and browser tests additionally cover leap-day import, calendar-safe
  month ends, weekly/monthly/yearly/one-time recurrence, and malformed stored
  dates.

Currency calculations use integer cents. The product does not connect to a
bank, move money, or describe forecasts as advice.

## Accessibility, keyboard, phone, and motion

- `/opt/fleet/lib/verify-url.sh` passed `/`, `/demo`, `/demo/`, `/privacy/`,
  and `/terms/`: HTTP 200, title, `lang=en`, one h1, one main landmark, image
  alternatives, labelled buttons, and zero console errors.
- Playwright Axe WCAG A/AA scans covered root, demo, privacy, terms, and the
  real HTTP 404 in both light and dark treatments. All ten scans found zero
  violations.
- The standalone `@axe-core/cli` could not locate its own Chrome binary in the
  worker. The permitted Playwright Axe integration used the preinstalled
  Chromium against production instead, so accessibility was tested rather
  than omitted.
- Tab reaches the skip link first. Its focus treatment is a solid 3 px teal
  outline. Entry-dialog focus starts in Name, Escape closes the dialog, and
  focus returns to **Add bill**.
- Legal navigation and browser Back focus the destination h1. The 12-month and
  Reset actions retain focus after rendering.
- A complete visible-target scan on the 390 px demo found no target below 44
  by 44 px. The hidden native file input is represented by its 48 px visible
  label target.
- At 200% root text size, root, demo, privacy, terms, and 404 have no horizontal
  overflow.
- Reduced motion changes transitions and animations to 0.01 ms and scroll
  behavior to `auto`. There is no flashing or looping motion.

## Privacy, offline use, updates, and server scope

A fresh route request log covered root, both demo URL forms, privacy, and terms.
It recorded eight same-origin GETs, zero cross-origin requests, zero non-GET
requests, and zero request bodies. The sample edit, Reset, exit, and real-plan
workflow separately recorded zero cross-origin requests or network writes.
There are no analytics, trackers, third-party scripts, bank, account, AI,
billing, or license calls.

A fresh live `/demo` context installed cache `bill-runway-v10`. After network
access was disabled, reload retained the demo label, offline notice, and all
seven occurrences. A controlled copy of the candidate changed the worker cache
to `bill-runway-v11`; the app announced “An update is ready. Reload to use it,”
reloaded successfully, and retained only the new cache.

This is a static PWA with no backend. Tenant isolation, server restart
persistence, health endpoints, live request allowances, and 429 with
`Retry-After` are not applicable. Product state is local IndexedDB, not SQLite
or a remote database.

The root response supplies HSTS, CSP, Permissions-Policy, nosniff, and a strict
origin referrer policy. CSP limits connections to self and sends
`frame-ancestors 'none'` as a response header. The manifest is served with the
correct type and includes standalone display plus 192, 512, and maskable icons.

## Routes, links, legal pages, and the expected 404

| URL | HTTP | Title | Result |
| --- | ---: | --- | --- |
| `/` | 200 | `Bill Runway — see cash gaps before bills are due` | PASS |
| `/demo` | 200 | `Demo — Bill Runway` | PASS |
| `/demo/` | 200 | `Demo — Bill Runway` | PASS — no bad relative preload or console error |
| `/privacy/` | 200 | `Privacy — Bill Runway` | PASS |
| `/terms/` | 200 | `Terms — Bill Runway` | PASS |
| `/not-a-real-page` | 404 | `Page not found — Bill Runway` | PASS — deliberate designed 404 |

Every route has `lang=en`, one h1, and one main. Privacy, Terms, and 404 use the
shared header and footer. The 404 has `noindex`, primary and legal navigation,
and **Open Bill Runway**. All crawled destination links returned 200. The 404
skip link returns the same deliberate 404 document with `#main`; this is
expected, not a broken page.

`robots.txt` points to the sitemap. Every sitemap URL returned 200. Titles,
descriptions, canonical links, social-card metadata, favicon, Apple-touch icon,
and route focus behavior are present.

## Earlier findings and current disposition

Every earlier review, verification, and polish report was read. Passing reports
4, 7, and 8 contain no unresolved finding. All earlier findings, including
minor ones, have fresh evidence below.

| Earlier finding | Current disposition |
| --- | --- |
| Initial and verification 2/3 Plus checkout unavailable | Closed — the whole planner is free; no checkout, billing copy, license storage, or billing request remains. |
| Initial impossible-date import | Closed — live invalid import preserved the real plan; regression tests cover imports and stored v1 data. |
| Verification 2 import focus invisible | Closed — the real file input is keyboard reachable and its visible label receives the 3 px ring. |
| Verification 2 four-pixel mobile action gaps | Closed — the keyboard claim measures both action pairs at least 8 px. |
| Verification 5 paid and recurrence promises missing from claims | Closed — `paid-status` and `recurrence-modes` each appear once and pass. |
| Verification 5 small range and legal targets | Closed — fresh live visible-target scan found no target below 44 by 44 px. |
| Verification 5 incomplete copy audit | Closed — the current audit includes product, state, legal, offline, 404, and README text with no flagged sentence. |
| Verification 6 sample print used two pages | Closed — fresh live seven-event A4 PDF contains one page object; the exact claim also passes. |
| Verification 6 `/demo/` failed a relative preload | Closed — live URL verifier passes `/demo/` with no failed request or console error. |
| Verification 6 state-changing controls lost focus | Closed — live keyboard checks and the claim prove focus restoration. |
| F-1-1 sample action and output below the phone fold | Closed — the action ends at y=576.3; populated sample balance, gap, and first event appear in its first screen. |
| F-1-2 unknown path returned 200 with home metadata | Closed — the unknown path returns the designed HTTP 404 with error title and `noindex`. |
| F-1-3 legal pages lacked the common skeleton | Closed — both legal pages use the wordmark, primary navigation, footer, and legal links. |
| F-1-4 route focus missing | Closed — live Privacy navigation and browser Back focus the new h1. |
| F-1-5 legal and 404 metadata missing | Closed — live pages contain route metadata, social image, favicon, and Apple-touch icon. |
| F-1-6 unclear exclusion heading | Closed — the heading is “No bank connections or payments.” |
| F-1-7 README jargon | Closed — the opening uses “upcoming list.” |
| F-1-8 README sentence above 22 words | Closed — the build instructions are separate short sentences. |
| F-1-9 unlisted artwork claim | Closed — no public provenance promise remains; provenance stays in the design record. |
| F-2-1 Reset demo was an untested promise | Closed — `reset-demo` passes and proves restoration plus database isolation. |
| F-2-2 404 omitted shared navigation and footer | Closed — the live 404 has the complete skeleton and recovery action. |
| F-2-3 “payment run” jargon | Closed — public product copy consistently says “upcoming list.” |

The free-product deviation is honest. The Sociobot billing product is not
registered, so the product does not advertise a broken purchase path. No
billing infrastructure was read or changed. The brief does not need an AI
step: dates, recurrence, integer-cent arithmetic, import, export, print, and
offline use solve the stated job directly.

## Performance and deployment identity

Fresh Lighthouse 12.8.2 mobile results:

- Performance: 99
- Accessibility: 100
- Best practices: 100
- SEO: 100
- First contentful paint: 0.9 s
- Largest contentful paint: 1.5 s
- Total blocking time: 150 ms
- Cumulative layout shift: 0
- Total transfer: 135 KiB

The fresh clean build and live files have identical SHA-256 values.

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `21eb5886dbdaded5309d62d63935265b0805085133dfabe2e184bff989218bc2` |
| `404.html` | `1b9141f278b3cdaf9701d5cc533b130b1d3bf62f2183e05cb367e57c6d5ef2b5` |
| `privacy/index.html` | `b24d6f5c0ceaaf7cc6bbb26a17984c2511e8d51a7ef05519ef0e949d768fa1a6` |
| `terms/index.html` | `e14c4e5519829536bf6c4d5bcd0961b0449c6e880787f4bbd7601c30e8f02425` |
| `sw.js` | `b03556c54ba3e9267eaaa01658d131d62b90a2581b903aa1fdb20b2e4ff18896` |
| `manifest.webmanifest` | `bbf44176d720b3992b038b5a47e68a43c90e54aaa39307cb2dc3b92d151914bc` |
| `offline.html` | `8cc4cfcc7ff29b8a856618b9570576ce2820aa2b7940aeb30edc4af5fed80c0a` |

## Final decision

**PASS — accept implementation `afd652da0ef869f3d6abbcba0048f9529f03b8e1`.**

Finding count: **0**. Untested claim count: **0**.
