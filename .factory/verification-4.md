# Independent verification 4 — PASS

Verified 2026-08-30 against candidate commit
`ce8a2cd02d06d070d982dc6327a8757ff73f8cae` and production
<https://bill-runway.sociobot.in>.

## Verdict

**PASS.** The deployed application is byte-for-byte the production build of
the candidate for the checked shell artifacts. No release-blocking product
defects were found.

## Cold first read

A new, storage-free desktop visit plainly says: “See cash gaps before bills
are due.” It names “people and caregivers” who need to compare bills with
expected income, and shows **Try it with sample data** on the first screen.
That link opens `/demo` in one click. The next screen immediately has four
realistic sample entries, seven payment-run events, a visible first gap, and a
persistent “Demo — sample data, nothing is saved to your plan” banner.

## Clean-checkout gates

Ran `npm ci` at the stated commit: 65 packages installed, `npm audit` reported
0 vulnerabilities. There is no separate lint script; the exact production
build includes `tsc --noEmit`.

| Check | Result |
| --- | --- |
| `npx vitest run` | PASS — 6/6 |
| all 16 Playwright journeys | PASS — run as the 10 individual claim commands plus 6 remaining regression checks |
| `npm run build` | PASS — strict TypeScript plus Vite; wrote `dist/` |
| accessibility regression scan | PASS — light and dark axe WCAG A/AA scans, zero serious/critical issues |

`npm test` was also invoked. The execution harness cut its combined process at
its 30-second command-output boundary after all 16 Playwright progress dots,
before the summary line. Each underlying test was then run to completion in
the commands above; none failed. One first attempt of the keyboard claim got
`ERR_CONNECTION_REFUSED` before its Playwright web server printed a startup
line, immediately after an earlier server teardown. Its immediate clean rerun
passed with the expected 3px focus outline and 8px spacing; this was an
observed local runner startup race, not an application assertion failure.

## Required claims

`.factory/claims.json` exists and every declared command passed from the demo
entry point:

| Claim | Result |
| --- | --- |
| first uncovered amount | PASS — $100.00 available and $125.50 bill reports $25.50 |
| offline reload | PASS — dedicated fresh context reloads after network is disabled |
| free 12-month view | PASS — renders 365 days and makes zero billing calls |
| demo isolation | PASS — real plan survives and `demo:bill-runway` is removed on exit |
| visible CSV export | PASS — header and one row per event |
| JSON import/export | PASS — leap-date import and downloadable backup |
| local-only plan data | PASS — demo flow makes no off-origin request |
| calendar-safe monthly recurrence | PASS — January 31 fixture clamps through April |
| keyboard controls | PASS — tested at 390px |
| print layout | PASS — payment run remains while interactive/marketing regions hide |

## Independent live evidence

- Live normal flow: $100.00 plus a $125.50 bill reports a $25.50 gap; marking
  it paid reports all covered. Invalid `1.234` money gets the announced
  “Enter a positive amount with no more than two decimal places” error; valid
  `1.23` then saves successfully.
- At 390×844, there is no horizontal overflow. The skip link is first in the
  tab order. Keyboard focus reaches the real import control; its visible label
  is `rgb(19, 107, 130) solid 3px`. Print/export and backup/import controls
  have 8px gaps.
- Browser request logging on cold `/`, `/demo`, demo edits/resets, privacy and
  terms found only same-origin requests. No console errors or page errors were
  emitted. There is no app server-side endpoint or product-unlock call, so a
  429 allowance check is not applicable.
- Fresh live PWA context activated `bill-runway-v7`; after disabling network,
  `/demo` reloaded to the planner and displayed the offline indicator. In an
  isolated server hosting the exact build, serving a v8 copy of the same worker
  produced cache `bill-runway-v8-qa` and the in-app “An update is ready. Reload
  to use it.” toast.
- Live axe (WCAG A/AA) reports zero serious or critical violations in both
  light and dark themes.

## Deployment identity, headers, and budget

The following local/live SHA-256 values are identical:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `c5ac9c596dd1bbfa076a0f5b0a05cbc0a7e90ca2746736789f184672ea44f4db` |
| `sw.js` | `7f464711dadfedea66c3fff27f99dacbcff36a2fb4d1631ea31dac5224cc7cf0` |
| `manifest.webmanifest` | `a15500ad0be1ebbb6532d934905b822755e3e31d0a07bcc05b5325e625d4645f` |
| `offline.html` | `8cc4cfcc7ff29b8a856618b9570576ce2820aa2b7940aeb30edc4af5fed80c0a` |

`dist/index.html` is 48,853 bytes / 14,888 bytes gzip; the 1,200px hero is
78,070 bytes. This is below the 200KB initial-JS, 50KB CSS, and 300KB mobile
hero budgets. `/`, `/demo`, `/privacy/`, `/terms/`, manifest, worker, offline,
404, robots and sitemap all returned 200. Root/worker use 30-second
must-revalidate caching; manifest uses one hour. Live responses provide HSTS,
CSP (`connect-src 'self'`, `frame-ancestors 'none'`), Permissions-Policy,
`nosniff`, strict-origin referrer policy, and the correct manifest MIME type.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

The brief’s one-time monetisation remains intentionally absent because the
Sociobot billing product is not registered. The candidate honestly makes the
complete local planner free rather than showing a broken checkout; this is the
documented, non-blocking deviation.
