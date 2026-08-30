# Independent verification 6 — FAIL

Verified 30 August 2026 against candidate commit
`e0440307ee268a463816d863bedc7618d25a9c0d` and production
<https://bill-runway.sociobot.in>.

## Verdict

**FAIL.** The mandatory claims and cold first-read gates pass, the deployed
artifacts exactly match the candidate, and the core local-first planner works.
The candidate is not releasable because the brief requires a one-page payment
run, but Chromium prints the sample 60-day run on two A4 pages. A supported
trailing-slash demo URL also logs a 404, and state-changing planner controls
lose keyboard focus when they rerender the page.

## Release-blocking findings

### High — the sample payment run prints on two pages

The researched smallest-useful-product explicitly requires “export a one-page
payment run.” In a fresh live `/demo` context, the default 60-day sample showed
seven payment-run events. Playwright's Chromium generated an A4 PDF with
`printBackground: true`; the resulting PDF contained two `/Type /Page` objects.

The `@claim:print-layout` test passes because it checks that the timeline is
visible and controls are hidden under print media. It never renders a PDF or
asserts one-page output, so it does not protect this acceptance requirement.
The print layout must be condensed to one page for the useful payment-run
scope, and a browser PDF regression must assert a single page.

### Medium — `/demo/` produces a console error and failed request

The application explicitly accepts both `/demo` and `/demo/`. A fresh visit to
`/demo/` returns HTTP 200 and renders the sample, but requests
`/demo/art/runway-hero-1200.webp`, which returns 404 and logs:

```text
Failed to load resource: the server responded with a status of 404 ()
```

The built `index.html` contains a relative preload (`./art/...` and relative
`imagesrcset`) even though the source uses root-relative URLs. The canonical
`/demo` is clean. The required `verify-url.sh` therefore passes `/demo` but
fails `/demo/`. Use root-relative built preload URLs or redirect the trailing
slash, then cover both accepted URLs.

### Medium — state-changing controls lose keyboard focus

At 1440 px, focusing `12 months` and pressing Enter correctly changes the
heading to “The next 365 days,” but `document.activeElement` becomes `<body>`.
The next Tab starts again at the skip link instead of continuing from the range
control. The same full-DOM render pattern affects other planner mutations.

The declared `keyboard-controls` claim test only tabs to the import input and
checks its focus ring and adjacent spacing. It does not exercise a
state-changing planner control, so the broad claim is incompletely proved.
Preserve or restore focus after rerenders and extend the tagged claim test.

## Mandatory first-read and demo gate

**PASS** at 1440 by 900 and 390 by 844 in storage-free browser contexts.

- What it does: “See cash gaps before bills are due.”
- For whom: “For people and caregivers who need to compare upcoming bills
  with expected income.”
- What to click: `Add bill`, `Add income`, and the visible
  `Try it with sample data`, followed by a sentence explaining the sample.
- One click opens `/demo`, immediately showing $900.00, four named entries,
  and a $446.80 gap.
- The persistent banner says “Demo — sample data, nothing is saved to your
  plan” and provides `Reset demo` and `Start for real`.

## Required claims

`.factory/claims.json` exists. Every listed command ran separately after
`npm ci`; every command passed. A source audit found each declared tag exactly
once and no undeclared claim tags.

| Claim | Result | Evidence |
| --- | --- | --- |
| `first-gap` | PASS | one Playwright test passed; exact $25.50 gap |
| `offline-reload` | PASS | one isolated-context Playwright test passed |
| `twelve-month-view` | PASS | one Playwright test passed with no billing request |
| `demo-isolation` | PASS | one Playwright test passed with four entries and real-plan restoration |
| `csv-export` | PASS | one Playwright test passed with header and event-row count |
| `json-backup` | PASS | one Playwright test passed with leap-date import and download |
| `local-only` | PASS | one Playwright test passed with zero off-origin requests |
| `recurrence-rules` | PASS | one tagged Vitest test passed |
| `recurrence-modes` | PASS | one tagged Vitest test passed |
| `paid-status` | PASS | one Playwright test passed across reload and undo |
| `keyboard-controls` | PASS as written | one Playwright test passed; coverage gap reported above |
| `print-layout` | PASS as written | one Playwright test passed; one-page coverage gap reported above |

## Clean-checkout gates

| Check | Result |
| --- | --- |
| candidate identity | PASS — clean starting tree at exact candidate SHA |
| `npm ci` | PASS — 65 packages, zero vulnerabilities |
| `npm test` | PASS — 7 Vitest and 21 Playwright tests |
| `npx tsc --noEmit` | PASS |
| lint | N/A — no lint script exists |
| `npm run build` | PASS — TypeScript plus Vite 7.3.6 produced `dist/` |
| `npm audit --audit-level=high` | PASS — zero vulnerabilities |

## Independent product exercise

A fresh live real-plan context passed representative, boundary, invalid, and
recovery cases:

- saved $100.00 and reported the exact $25.50 gap for a $125.50 bill;
- applied $25.50 same-day income before the bill and reported all covered;
- persisted the plan, bill, income, and paid state across reload, then undid
  the paid state;
- rejected a blank plan name, blank entry name, `1.234`, an amount one cent
  beyond the safe-integer boundary, and a missing date with announced errors;
- rejected an impossible-date backup without replacing existing data;
- downloaded CSV with the expected header and two event rows, and JSON with
  both entries, plan name, and version;
- kept an entry after cancelled deletion and removed it after confirmation.

The full suite additionally passed leap-day import/export, impossible-date v1
storage migration, month-end recurrence, all four recurrence modes, dialog
focus restoration, mobile layout, demo isolation, and print-media visibility.

## Privacy, requests, and server scope

A fresh live demo flow covered initial load, mark paid, reset, `/privacy/`, and
`/terms/`. The complete request log contained four same-origin GETs, zero
off-origin requests, zero non-GET requests, and zero request bodies. A separate
real-plan edit/export/import/delete flow likewise made only same-origin GETs.
Neither flow produced console errors, page errors, or failed requests on its
canonical URL.

The product is static and has no backend, sign-in, AI call, analytics, billing
call, or product-unlock call. API allowance/429/`Retry-After`, persistence
boundaries on a server, concurrency, health/build endpoints, and Entra tenant
checks are therefore not applicable. A fresh GET to the documented Sociobot
checkout URL returned 404 `{"error":"enabled factory product","status":404}`;
the free-product deviation remains accurate and no unavailable checkout is
advertised.

Responses include HSTS, CSP with `connect-src 'self'` and
`frame-ancestors 'none'`, Permissions-Policy, `nosniff`, and a strict-origin
referrer policy. The service worker is revalidated after 30 seconds, the
manifest has the correct MIME type and a one-hour cache, and unknown paths
return the designed HTTP 404 page.

## Accessibility, responsive behavior, and motion

- The required `verify-url.sh` passes `/`, `/demo`, `/privacy/`, and `/terms/`
  for title, `lang`, one h1, main landmark, alt text, labelled buttons, and no
  console errors. `/demo/` fails separately as reported above.
- Playwright axe WCAG A/AA scans found zero violations after theme transitions
  settled on root and demo in light/dark modes, desktop and mobile, and on both
  legal pages. There were zero serious or critical findings.
- At 390 px, all visible interactive targets on the four canonical routes were
  at least 44 by 44 CSS px. Root and demo had no horizontal overflow after
  text was enlarged to 200%.
- The skip link is first, focus uses a visible 3 px outline, entry-dialog focus
  enters the name field, Escape closes dialogs, and focus returns to the
  opener. The range-control focus defect remains.
- `prefers-reduced-motion: reduce` is detected, sets scrolling to `auto`, and
  reduces transition/animation duration to 0.01 ms.

## PWA, performance, and deployment identity

- A fresh live `/demo` context installed `bill-runway-v9`; offline reload kept
  all four entries, the $446.80 gap, the demo banner, and the offline notice,
  with no console or request errors.
- A controlled copy of the exact `dist/` worker was version-bumped. It announced
  “An update is ready. Reload to use it,” activated the new worker, removed the
  old cache after reload, and loaded the app without errors.
- Manifest metadata, standalone display, and 192, 512, and maskable 512 icons
  are valid. The social image is 1200 by 630.
- Lighthouse 12.8.2 mobile: **91 performance, 100 accessibility, 100 best
  practices, 100 SEO**; FCP 1.1 s, LCP 1.5 s, TBT 370 ms, CLS 0.
- A 4× CPU-throttled in-page range-switch sample measured p95 127.8 ms and
  maximum 134.9 ms across 30 interactions.
- `dist/index.html` is 52,546 bytes raw / 15,673 bytes gzip and contains the
  app JS/CSS. Source CSS is 23,617 bytes; no font downloads ship. Mobile and
  desktop hero images are 26,964 and 78,070 bytes, below the 300 KB budget.

The live deployment exactly matches the production build:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `fe9bd215b8e9fdedc0d94f787233d6a636ea6f8c72a91b2782637fac680f76f3` |
| `sw.js` | `f43d529eaf27ab0dd371e4750ec715085785987570174dff76cda3b15a11b3fb` |
| `manifest.webmanifest` | `a15500ad0be1ebbb6532d934905b822755e3e31d0a07bcc05b5325e625d4645f` |
| `offline.html` | `8cc4cfcc7ff29b8a856618b9570576ce2820aa2b7940aeb30edc4af5fed80c0a` |
| `404.html` | `cf11b6802fa05f8ace566ee551bc4cf322ea92b7de4e06c2d218784bc7cd21aa` |
| `privacy/index.html` | `19535ab23348504ed377c10a62965f08c1bacd83e94fd965dc3befd21188ce7a` |
| `terms/index.html` | `35625f3c0245d28c76de313fa5f8167d941a5c3ff7c4984dc120eeb3fbc7c361` |

## Defects by severity

- Critical: none.
- High: one — the required one-page payment run prints on two pages.
- Medium: two — `/demo/` logs a failed preload; state-changing controls lose
  keyboard focus.
- Low: none.

## Required next steps

1. Make the representative 60-day payment run fit one A4 page and assert the
   page count from a generated browser PDF.
2. Make preload URLs safe on `/demo/` or redirect that variant; rerun the URL
   verifier on both forms.
3. Restore focus to the activated control after planner rerenders and extend
   `@claim:keyboard-controls` to prove this behavior.
4. Rerun all 12 claim commands, `npm test`, the exact build, live axe/console
   checks, and offline/update verification before release.
