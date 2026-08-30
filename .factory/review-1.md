# Adversarial first-read review 1 — Bill Runway

Reviewed 2026-08-30 against `https://bill-runway.sociobot.in` and source
commit `1f5f12e2015544a16555e202a4f60b9bf9f16151`.

## Verdict: FAIL

There are nine findings, including one blocking demo failure. A visitor can
understand the job from the landing screen: this is a due-date cash planner for
people and caregivers, and **Add bill** is the apparent real-data first step.
They can also see **Try it with sample data**, but at 390 × 844 it begins at
`y=812` and ends below the viewport. More importantly, after activating it,
the first demo viewport contains the banner, navigation, hero art, headline,
and lede—not one bill, balance, gap, or payment-run row. That fails the stated
one-click, immediately-tryable demo requirement.

## Findings

### F-1-1 — BLOCKING — demo opens on marketing, not realistic sample use

- **Location / exact evidence:** At 390 × 844, the landing link
  **“Try it with sample data”** has bounding box `y=812.33`, `height=44`.
  On activation, `/demo` correctly shows **“Demo — sample data, nothing is
  saved to your plan”**, but its first viewport contains only the banner,
  header, hero image, **“See cash gaps before bills are due.”**, and the lede.
  The first visible sample data is below that screen.
- **Why this fails:** The required first screen after one click must already
  show the product being used with realistic data. A first-time phone visitor
  has to scroll through the same marketing hero a second time before seeing
  the promised sample.
- **Concrete fix:** Give `/demo` a demo-first layout: start at the populated
  payment run (or compact the hero above it to a small heading) so the first
  390px viewport visibly includes `$900.00`, a named bill, the first shortfall,
  and the persistent demo banner. Keep the landing action fully inside the
  initial 390px viewport.

### F-1-2 — MEDIUM — an unknown URL is a 200 page with homepage SEO metadata

- **Location / exact evidence:** `GET /not-a-real-page` returned HTTP `200`.
  Its rendered content says **“We could not find this page.”**, but its
  canonical remains `https://bill-runway.sociobot.in/` and its description is
  **“Compare upcoming bills with expected income and find the first cash gap.
  Free, local, and usable offline.”**
- **Why this fails:** Search engines and shared links receive a successful
  homepage-equivalent response for a missing page. This is not a real 404 and
  gives the error page the wrong canonical and description.
- **Concrete fix:** Configure unknown routes to return the designed
  `404.html` with HTTP 404, while preserving only known SPA routes as fallback.
  Give the SPA fallback error route `noindex`, an error-specific description,
  and no homepage canonical if it remains reachable.

### F-1-3 — MEDIUM — Privacy and Terms do not use the required common header/footer

- **Location / exact evidence:** Direct `/privacy` renders a header with only
  **Demo** and **Terms**; direct `/terms` renders only **Demo** and **Privacy**.
  Their footers are the plain text **“Plan bills against expected income on this
  device. Built by Param Factory · repair-4”** and contain neither Privacy nor
  Terms links. The landing footer has both links.
- **Why this fails:** The route skeleton changes on legal pages. Visitors lose
  the persistent legal navigation required on every route.
- **Concrete fix:** Build the standalone legal pages from the same header and
  footer component/markup as the application: wordmark home link, Demo,
  Privacy, Terms (with the current page marked), and footer links to both legal
  pages.

### F-1-4 — MINOR — focus is not moved after route navigation

- **Location / exact evidence:** After activating the header Privacy link,
  Playwright found `document.activeElement` was `BODY` on `/privacy`. After
  browser Back it was again `BODY` on `/`.
- **Why this fails:** Keyboard and screen-reader users are not placed at the
  new page headline or told that navigation completed.
- **Concrete fix:** On every route load/change, focus the new `<h1>` (or a
  `tabindex="-1"` main heading) and announce the new page in a polite live
  region. Add a Playwright regression that follows Privacy then Back and
  asserts the active element.

### F-1-5 — MINOR — legal and error routes omit required social/favicons metadata

- **Location / exact evidence:** Direct `public/privacy/index.html` and
  `public/terms/index.html` have title, description, and canonical only; they
  omit Open Graph, Twitter-card, and favicon links. `public/404.html` likewise
  has no canonical, OG/Twitter, or favicon metadata.
- **Why this fails:** These real routes do not meet the documented per-route
  metadata contract and produce inconsistent shared-link/browser identity.
- **Concrete fix:** Add the shared favicon and route-specific canonical,
  Open Graph, and Twitter title/description/image metadata to all standalone
  routes. Use an error-specific, `noindex` metadata policy for the 404 page.

### F-1-6 — MINOR — a heading does not identify its section

- **Location / exact quote:** The h2 below **“WHAT IT DOES NOT DO”** is
  **“Your accounts stay separate.”**
- **Why this fails:** “Accounts” is undefined and “stay separate” does not say
  what the section actually excludes. In a screen-reader heading list it does
  not communicate bank connections or payments.
- **Concrete fix:** Replace it with **“No bank connections or payments.”**

### F-1-7 — MINOR — README opening uses unexplained product jargon

- **Location / exact quote:** **“Bill Runway is a local, offline-first
  due-date cash planner.”** (9 words) and **“The timeline identifies the first
  uncovered due date, records paid items, and exports the payment run.”**
  (16 words).
- **Why this fails:** “Offline-first” and “payment run” are internal/product
  terms before the reader knows what they mean.
- **Concrete fix:** Replace with: **“Bill Runway helps you compare upcoming
  bills with expected income on this device.”** Then: **“It shows the first
  bill you cannot cover, records paid bills, and exports the upcoming list.”**

### F-1-8 — MINOR — README contains a sentence over the 22-word limit

- **Location / exact quote:** **“The exact production command is `npm run
  build`; it runs strict TypeScript checking and writes the static app to
  `./dist`, with `dist/index.html` at its root.”** (25 words).
- **Why this fails:** It combines command, checking, output directory, and
  entry-file information in one sentence.
- **Concrete fix:** Replace with: **“Run `npm run build` for the production
  build. It checks TypeScript and writes `dist/index.html`.”**

### F-1-9 — MINOR — an unlisted, untestable landing claim remains

- **Location / exact quote:** Footer: **“Original AI-assisted cut-paper
  artwork, made for Bill Runway.”**
- **Why this fails:** It is a claim about provenance/originality, but no entry
  in `.factory/claims.json` lists or tests it. The provenance is already
  documented in `.factory/design.md`; a visitor cannot verify this assertion
  in the sandbox.
- **Concrete fix:** Remove this claim from the user-facing footer and retain
  the provenance record in `.factory/design.md`, or add a reproducible asset
  provenance check and claims entry if it must remain public.

## Copy audit

Word-count convention: hyphenated compounds and code tokens count as one word.
Headings, labels, and buttons that are not sentences are listed separately;
the tables below include every reader-facing sentence/prose bullet on the
landing page and README. `F-1-6` through `F-1-9` are the copy flags found.

### Landing sentences

| Words | Copy |
| ---: | --- |
| 7 | See cash gaps before bills are due. |
| 13 | For people and caregivers who need to compare upcoming bills with expected income. |
| 10 | The sample opens a separate workspace with four realistic entries. |
| 6 | Free, with a full 12-month view. |
| 6 | Plan data stays on this device. |
| 6 | Works offline after the first visit. |
| 7 | Forecast from your entries—not financial advice. |
| 7 | No bills or income in this range. |
| 11 | Add a bill or expected income to start the payment run. |
| 14 | That is the first point where entered bills exceed available money and expected income. |
| 4 | All bills are covered. |
| 11 | Your entered money and income cover every bill in this range. |
| 4 | No bills added yet. |
| 4 | No income added yet. |
| 5 | Stored only in this browser. |
| 7 | Turn due dates into a payment run. |
| 4 | Add what is available. |
| 7 | Set the money you can use today. |
| 4 | Add bills and income. |
| 5 | Choose dates and repeat rules. |
| 4 | Check the first gap. |
| 6 | Print or export the payment run. |
| 4 | Your accounts stay separate. |
| 10 | Bill Runway does not connect to banks or move money. |
| 8 | It uses only the planning details you enter. |
| 8 | Plan bills against expected income on this device. |
| 8 | Original AI-assisted cut-paper artwork, made for Bill Runway. |

Non-sentence landing copy was also checked: **Skip to planner**, **A due-date
cash planner**, **Add bill**, **Add income**, **Try it with sample data**,
**My plan**, **The next 60 days**, **Available now**, **Bills in range**,
**Lowest point**, **Coverage**, **Payment run**, **Print payment run**,
**Export CSV**, **Bills**, **Expected income**, **Your data**, **Back up
data**, **Import backup**, **How it works**, **What it does not do**, **Read
the privacy notice**, **Privacy**, and **Terms**. All result-changing controls
use verbs except the valid navigation/section labels.

### README sentences and prose bullets

| Words | Copy |
| ---: | --- |
| 9 | Bill Runway is a local, offline-first due-date cash planner. |
| 21 | It is for people and caregivers who need to answer one question: which upcoming bills are covered before expected income arrives? |
| 12 | It is not a bank-connected budget, ledger, payment service, or financial-advice product. |
| 9 | Users enter available money, bills, and expected income dates. |
| 16 | The timeline identifies the first uncovered due date, records paid items, and exports the payment run. |
| 8 | free 60-day and 12-month views with recurring entries |
| 7 | clear covered/uncovered running balances and paid status |
| 6 | print layout and CSV payment-run export |
| 5 | IndexedDB persistence plus JSON backup/import |
| 7 | installable PWA with a tested offline path |
| 7 | light/dark themes, keyboard support, and reduced-motion support |
| 5 | isolated sample-data demo at /demo |
| 10 | no account, bank credentials, analytics, external fonts, or runtime CDN |
| 22 | Choose Try it with sample data on the first screen to open four realistic entries in a separate demo:bill-runway IndexedDB database. |
| 5 | Reset demo restores the sample. |
| 14 | Start for real deletes the demo database and returns to the untouched bill-runway database. |
| 5 | Requires Node.js 20 or newer. |
| 16 | npm test runs unit tests and Playwright journeys (including malformed-backup, axe, offline, 390px, and keyboard coverage). |
| 25 | The exact production command is npm run build; it runs strict TypeScript checking and writes the static app to ./dist, with dist/index.html at its root. |
| 5 | Playwright is pinned to 1.58.2. |
| 17 | In a fresh environment without the factory’s shared browser cache, run npx playwright install chromium once. |
| 11 | Tested product claims and their exact commands are listed in .factory/claims.json. |
| 11 | Deploy dist/ as a static site with SPA fallback to index.html. |
| 14 | The /privacy and /terms directories also contain standalone pages for hosts without fallback routing. |
| 7 | The production artifact is a static PWA. |
| 11 | It needs no runtime configuration, account service, payment service, or secret. |
| 8 | Plan data stays in the browser’s IndexedDB. |
| 6 | Demo data uses a separate database. |
| 6 | Theme and demo-state preferences use localStorage. |
| 7 | The app makes no cross-origin runtime requests. |
| 7 | See the in-product privacy and terms pages. |
| 7 | The brief calls for a one-time purchase. |
| 14 | The required Sociobot product is not registered, and repository rules prohibit changing billing infrastructure. |
| 16 | This release makes the complete 12-month planner free instead of advertising a checkout that returns 404. |
| 18 | Monetisation can return only after the factory registers the product and its full purchase lifecycle is independently tested. |
| 5 | Licensed under the MIT License. |

README headings, code fences, link destinations, and project-note labels are
not sentences. Its technical feature bullets contain additional developer
jargon (for example **IndexedDB**, **PWA**, and **runtime CDN**); define these
in user-facing documentation or keep them in a clearly marked developer
reference.

## Demo, privacy, and claims checks

- `/demo` opened in one activation and immediately created the separate
  `demo:bill-runway` namespace. It showed four named sample entries, a
  `$446.80` first gap, the persistent demo banner, and no off-origin request.
- **Reset demo** announced **“Demo reset to the original sample.”** and
  restored the sample. The clean-clone `demo-isolation` test also passed,
  confirming real data is preserved and demo data is deleted on exit.
- Fresh live request logging for landing, demo entry, and reset observed no
  off-origin request and no console/page errors. The offline and local-only
  sandbox claims passed in a clean clone.
- No AI feature is required by the brief; the available import/export and
  local-first workflow cover the obvious value paths. No runtime provider key
  or decorative AI control was found.

## Claim commands from a clean clone

Clean clone used: `/tmp/bill-runway-review-HXPoon/repo`. `npm ci` completed
with 0 vulnerabilities. Every listed command passed:

| Claim | Command result |
| --- | --- |
| `first-gap` | PASS — 1 Playwright test |
| `offline-reload` | PASS — 1 Playwright test |
| `twelve-month-view` | PASS — 1 Playwright test |
| `demo-isolation` | PASS — 1 Playwright test |
| `csv-export` | PASS — 1 Playwright test |
| `json-backup` | PASS — 1 Playwright test |
| `local-only` | PASS — 1 Playwright test |
| `recurrence-rules` | PASS — 1 Vitest test |
| `keyboard-controls` | PASS — 1 Playwright test |
| `print-layout` | PASS — 1 Playwright test |

`npm test` also passed (6 Vitest and 16 Playwright tests), and `npm run build`
passed and produced `dist/`.

## History and structural checks

There were no earlier `.factory/review-*.md` or `.factory/polish-*.md` files.
The existing handoff’s historic checkout, invalid-date, import-focus, and
mobile-spacing defects were checked through source, the passing claim suite,
and live inspection: the free 12-month view makes no billing call, invalid
dates are covered by tests, the import focus claim passes, and no current
mobile control-gap regression was observed.

The landing visual system is product-specific rather than a generic SaaS
template: the original causeway art, serif editorial type, paper palette, and
asymmetric crop are consistently applied. The main and demo routes have one
h1, suitable titles, descriptions, canonical URLs, working live links, and no
console error. The legal/error route defects are recorded above.

## What would make this perfect

Make the demo open directly on visible sample planning data at phone size,
then complete the routing contract: true 404 response, correct per-route
metadata, a common legal header/footer, and reliable focus after navigation.
Finish the four copy/claim cleanups in F-1-6 through F-1-9 and rerun this full
review with no findings.
