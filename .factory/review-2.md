# Adversarial first-read review 2 — Bill Runway

Reviewed 2026-08-30 against <https://bill-runway.sociobot.in> and the clean
checkout at `d3662311a196901f651e52fe24a035963e86561f`.

## Verdict: FAIL

Three findings remain. The core job is clear and the live sample is genuinely
useful on a 390 px phone, but a stated demo behaviour is not covered by a
claim test, the real 404 omits the common site skeleton, and the landing still
uses an unexplained accounting term. Per the review contract, the untested
demo claim alone prevents PASS.

## Cold first screen

Fresh Chromium contexts were used at 390 × 844 and 1440 × 900. Before
scrolling, both showed the same headline, lede, real-data actions, and sample
action. In my words:

- **What it does:** compares bills due with money available now and expected
  income, then identifies the first cash gap.
- **For whom:** people and caregivers who need to plan bills without bank
  connections.
- **What to click first:** **Add bill** to start a real plan, or **Try it with
  sample data** to inspect the product immediately.

This passes the first-screen clarity check. At 390 px, **Try it with sample
data** is fully visible. The cold sample screen starts at scroll position 0
with the persistent demo banner, `$900.00` available, the `$446.80` gap, and
the named Electricity bill. No external requests or console errors occurred
on either landing or demo load.

## Findings

### F-2-1 — BLOCKING — the promised demo reset has no listed, observable claim test

- **Location / exact quote:** README: **“Reset demo restores the sample.”**
  The same promised operation is exposed by the live **Reset demo** button.
- **Evidence:** `.factory/claims.json` has no `reset-demo` claim. Its closest
  entry, `demo-isolation`, claims that the sample is separate and real data is
  unchanged. Its tagged Playwright test marks neither a sample item nor
  asserts the post-reset payment state, amounts, or entry set; it only checks
  **Start for real**. A live check confirmed that Reset eventually restores
  the sample, but that result is not protected by the claims suite.
- **Why this fails:** A visitor is asked to rely on Reset to discard demo
  changes. The claims contract requires that promised result to be asserted
  from a fresh demo sandbox. A future regression could leave a paid, edited,
  or deleted sample entry while every current claim test still passes.
- **Concrete fix:** Add a `reset-demo` claims entry (or explicitly extend
  `demo-isolation` to name Reset) and a tagged browser assertion: in fresh
  `/demo`, mark Electricity paid or edit it, choose **Reset demo**, then
  assert Electricity is again **Mark paid**, the four original named entries
  and `$900.00` are restored, and the real `bill-runway` database was not
  read or written. Run that exact command from a clean clone.

### F-2-2 — MEDIUM — the HTTP 404 has no shared navigation or footer

- **Location / exact evidence:** Cold `GET /not-a-real-page` returned HTTP
  404 with title **“Page not found — Bill Runway”** and one h1, but rendered
  no `<header>`, primary navigation, `<footer>`, or Privacy/Terms links. The
  only route out is **“Open Bill Runway.”**
- **Why this fails:** The standard skeleton requires the same header and
  footer on every route. A visitor following a stale link cannot directly
  reach the sample, privacy notice, or terms, and the error page does not
  carry the product's normal navigation identity.
- **Concrete fix:** Keep the HTTP 404 and `noindex` metadata, but add the
  Bill Runway wordmark home link, Demo/Privacy/Terms primary navigation, skip
  link, and the normal footer with both legal links. Preserve the existing
  **Open Bill Runway** recovery action and focus the h1 on load.

### F-2-3 — MINOR — “payment run” remains unexplained jargon for the stated audience

- **Location / exact quotes:** landing h2 **“Turn due dates into a payment
  run.”**; planner h3 **“Payment run”**; buttons **“Print payment run”** and
  **“Export CSV.”**
- **Why this fails:** “Payment run” is an accounting term, not a clear result
  name for a person or caregiver who is simply checking upcoming bills. The
  earlier README repair removed this term from its opening explanation, but
  the product UI still uses it before defining it.
- **Concrete fix:** Use **“Upcoming bills and income”** for the section,
  **“Check upcoming bills”** for the explanatory h2, and **“Print upcoming
  list”** / **“Export upcoming list as CSV”** for the actions. Update the
  matching claims and README terminology together.

## Copy audit

Word-count convention: hyphenated compounds, amounts, URLs, and code tokens
count as one word. The landing inventory includes dynamic empty, covered, and
gap states because a visitor can encounter them without leaving the landing
route. No sentence exceeds 22 words and no sentence contains a banned
marketing adjective. F-2-3 is the terminology flag.

### Landing page sentences

| Words | Copy |
| ---: | --- |
| 7 | See cash gaps before bills are due. |
| 12 | For people and caregivers who need to compare upcoming bills with expected income. |
| 9 | The sample opens a separate workspace with four realistic entries. |
| 6 | Free, with a full 12-month view. |
| 6 | Plan data stays on this device. |
| 6 | Works offline after the first visit. |
| 6 | Forecast from your entries—not financial advice. |
| 8 | No bills or income in this range. |
| 12 | Add a bill or expected income to start the payment run. |
| 5 | [Amount] is uncovered by [date]. |
| 14 | That is the first point where entered bills exceed available money and expected income. |
| 4 | All bills are covered. |
| 11 | Your entered money and income cover every bill in this range. |
| 4 | No bills added yet. |
| 5 | No income added yet. |
| 5 | Stored only in this browser. |
| 7 | Turn due dates into a payment run. |
| 4 | Add what is available. |
| 8 | Set the money you can use today. |
| 4 | Add bills and income. |
| 6 | Choose dates and repeat rules. |
| 4 | Check the first gap. |
| 6 | Print or export the payment run. |
| 5 | No bank connections or payments. |
| 10 | Bill Runway does not connect to banks or move money. |
| 8 | It uses only the planning details you enter. |
| 8 | Plan bills against expected income on this device. |

Non-sentence controls and labels were also checked. The real actions use
result-naming verbs: **Add bill**, **Add income**, **Try it with sample data**,
**Print payment run**, **Export CSV**, **Back up data**, and **Import backup**.
The jargon in F-2-3 is the exception to the plain-result standard.

### README sentences and prose bullets

| Words | Copy |
| ---: | --- |
| 13 | Bill Runway helps you compare upcoming bills with expected income on this device. |
| 19 | It shows the first bill you cannot cover, records paid bills with an undo, and exports the upcoming list. |
| 13 | It is for people and caregivers planning due dates without a bank connection. |
| 12 | It is not a budgeting service, payment service, or financial advice. |
| 12 | Shows 60 days or 12 months of bills and expected income. |
| 6 | Finds the first uncovered bill amount. |
| 7 | Handles monthly, weekly, yearly, and one-time entries. |
| 7 | Exports the visible upcoming list as CSV. |
| 9 | Prints the 60-day payment run on one A4 page. |
| 7 | Imports and exports your plan as JSON. |
| 7 | Stores plan data in this browser. |
| 6 | Works offline after the first visit. |
| 7 | Offers an isolated sample at /demo. |
| 10 | Choose Try it with sample data on the first screen. |
| 10 | It opens four realistic entries in a separate demo:bill-runway browser database. |
| 5 | Reset demo restores the sample. |
| 13 | Start for real deletes the sample database and returns to your real plan. |
| 5 | See .factory/demo.md for the sample details. |
| 6 | Requires Node.js 20 or newer. |
| 8 | npm test runs unit tests and Playwright journeys. |
| 11 | They cover import errors, accessibility, offline use, mobile layout, and keyboard controls. |
| 8 | Run npm run build for the production build. |
| 6 | It checks TypeScript and writes dist/index.html. |
| 9 | To inspect the production build, run npm run preview. |
| 5 | Playwright is pinned to 1.58.2. |
| 12 | Run npx playwright install chromium if your environment has no browser cache. |
| 9 | Tested product claims and exact commands are in .factory/claims.json. |
| 6 | Deploy dist/ as a static site. |
| 15 | The static configuration sends /demo to the app and unknown paths to the designed 404 page. |
| 8 | The /privacy and /terms directories provide standalone legal pages. |
| 6 | The product is a static PWA. |
| 11 | It needs no account service, payment service, runtime configuration, or secret. |
| 8 | Plan data stays in the browser’s IndexedDB. |
| 6 | Demo data uses a separate database. |
| 7 | Theme and demo preferences use localStorage. |
| 8 | The app makes no cross-origin runtime requests. |
| 7 | Read the in-product privacy notice and terms. |
| 8 | The brief calls for a one-time purchase. |
| 7 | The required Sociobot product is not registered. |
| 6 | Repository rules prohibit changing billing infrastructure. |
| 13 | The complete planner is free instead of advertising a checkout that returns 404. |
| 13 | Monetisation can return after the factory registers and tests the full purchase lifecycle. |
| 6 | Licensed under the MIT License. |

## Demo, sandbox, privacy, and claims

- `/demo` and `/?demo=1` both entered the separate sample workspace. The
  latter uses the canonical demo URL and the title **“Demo — Bill Runway.”**
- The live 390 px demo contained the persistent banner, Reset, Start for real,
  `$900.00` available, a `$446.80` first gap, and Electricity before the
  viewport bottom. The desktop demo did the same.
- In a fresh live context, changing a real plan name, entering demo, marking
  a sample bill paid, resetting after the write settled, and starting for real
  left the demo database deleted and the real database present. Three fresh
  immediate mark-then-reset repetitions settled back to **Mark paid**.
- A request log for the landing, demo, mark-paid, reset, Start-for-real, and
  offline flows recorded no cross-origin requests. A fresh live service-worker
  context reloaded `/demo` offline with the banner and sample heading intact.
- The brief does not imply a useful AI step. CSV export, JSON backup/import,
  and the offline local plan cover the obvious expected leverage. No provider
  key or decorative AI control was found.

### Exact claim commands from a clean clone

Clean clone: `/tmp/bill-runway-review2-r804B3/repo`. `npm ci` completed with
zero audit vulnerabilities. Each command below passed.

| Claim | Result |
| --- | --- |
| `first-gap` | PASS — `npx playwright test --grep @claim:first-gap` |
| `offline-reload` | PASS — `npx playwright test --grep @claim:offline-reload` |
| `twelve-month-view` | PASS — `npx playwright test --grep @claim:twelve-month-view` |
| `demo-isolation` | PASS — `npx playwright test --grep @claim:demo-isolation` |
| `csv-export` | PASS — `npx playwright test --grep @claim:csv-export` |
| `json-backup` | PASS — `npx playwright test --grep @claim:json-backup` |
| `local-only` | PASS — `npx playwright test --grep @claim:local-only` |
| `recurrence-rules` | PASS — `npx vitest run -t @claim:recurrence-rules` |
| `recurrence-modes` | PASS — `npx vitest run -t @claim:recurrence-modes` |
| `paid-status` | PASS — `npx playwright test --grep @claim:paid-status` |
| `keyboard-controls` | PASS — `npx playwright test --grep @claim:keyboard-controls` |
| `print-layout` | PASS — `npx playwright test --grep @claim:print-layout` |

`npm test` passed (7 Vitest and 22 Playwright tests). `npm run build` passed
and produced `dist/` with a 16.02 kB gzip application shell.

## Earlier-review regression check

All earlier review/polish/handoff documents were read. The earlier items are
checked against the live service and current source, rather than accepted from
their repair notes alone.

| Earlier id | Live/code result |
| --- | --- |
| F-1-1 | Fixed: landing action is within the 390 px first screen; demo immediately shows banner, sample balance, gap, and named event. |
| F-1-2 | Fixed: unknown URL is HTTP 404 with error title, `noindex`, error canonical, and a recovery link. F-2-2 records the separate missing-skeleton defect. |
| F-1-3 | Fixed: Privacy and Terms each render a wordmark, Demo/Privacy/Terms navigation, and footer legal links. |
| F-1-4 | Fixed: Privacy’s h1 receives focus after navigation; browser Back focuses the landing h1. |
| F-1-5 | Fixed: Privacy, Terms, and 404 provide canonical, Open Graph, Twitter, favicon, and Apple-touch metadata. |
| F-1-6 | Fixed: the landing h2 is now **“No bank connections or payments.”** |
| F-1-7 | Fixed at its reviewed README-opening location: it now says **“upcoming list”** rather than “payment run.” F-2-3 records remaining UI jargon separately. |
| F-1-8 | Fixed: the build instruction is split into short sentences. |
| F-1-9 | Fixed: no public artwork-provenance claim remains; provenance is retained in `.factory/design.md`. |

The causeway artwork, editorial type, paper/ink palette, and asymmetric layout
remain distinct from a generic SaaS template. Root, demo, legal, and error
routes have correct titles, descriptions, canonical/OG/Twitter/favicons, one
h1 and one main. Crawl of every same-origin page link returned HTTP 200; the
separate unknown-route check returned HTTP 404. The 404 issue is limited to
its missing standard skeleton, not broken routing.

## What would make this perfect

Make Reset demo a tested claim, complete the shared 404 skeleton, and replace
the remaining accounting jargon with the same plain **upcoming list** language
already used in the README. Then rerun the full cold, demo, claim, privacy,
history, and route checklist with zero findings.
