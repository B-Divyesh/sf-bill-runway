# Independent product verification 2 — FAIL

Verified on 2026-08-28 against candidate commit
`b61a1375263cc08b6d44837723d3170c3ad01758` and production
<https://bill-runway.sociobot.in/>.

## Verdict

**FAIL.** The free 60-day local planner is useful and works end to end, the
candidate is deployed byte-for-byte, and its build, tests, accessibility
automation, offline path, security headers, and performance budgets pass.
However, the advertised $19 one-time Plus purchase still cannot be completed:
the production catalogue has no `bill-runway` product and its checkout returns
404. A separate keyboard accessibility defect makes focus disappear on the
Import backup control. Both were reproduced fresh against the live deployment.

## Defects

### High — the advertised one-time Plus purchase is unavailable

The homepage advertises “Extend your view to 12 months with a $19 one-time
purchase” and exposes “See the Plus unlock.” Opening it makes
`GET https://api.sociobot.in/api/v1/products` return 200 with 23 products, none
with slug `bill-runway`. The application consequently reports:

> Plus purchases are temporarily unavailable. You can still restore an
> existing license below.

The source now handles the missing registration honestly: the dead buy link is
hidden, restore remains enabled, and an invalid license receives a 200 verifier
response and a clear recovery error. This does not complete the paid-unlock
acceptance path. A fresh direct request still returns:

```text
GET https://api.sociobot.in/api/v1/products/bill-runway/checkout
HTTP/2 404
{"error":"enabled factory product","status":404}
```

No real hosted checkout, successful purchase return, or production license can
be exercised until the factory registers/enables this product. This is an
external deployment/catalogue defect, not a source/deployment mismatch.

### Medium — keyboard focus is invisible on Import backup

On the live page, 16 keyboard Tabs from the initial position reached
`#import-json`. It was the active `:focus-visible` element, but its computed
opacity was `0`. Its visible parent label had `outline-style: none` and no box
shadow. Pixel captures of the visible “Import backup” label before and after
focus were byte-identical:

```text
before  827fb692d3cd5b987fabbc2f9ef28b296a81c88248e80ec9512285040460e385
focused 827fb692d3cd5b987fabbc2f9ef28b296a81c88248e80ec9512285040460e385
```

Keyboard users therefore lose their position on a real, operable control. Axe
does not detect this CSS pattern. Give `.file-button` a designed
`:focus-within` treatment or expose a visible focusable control.

### Low — two mobile control pairs have only 4 px separation

At 390 px, all visible control targets measured at least 44×44 CSS px (the
transparent file input is represented by its 156×44 label). The adjacent
“Print one-page run” / “Export CSV” and “Back up data” / “Import backup” pairs
had 4 px horizontal gaps, below the attached 8 px interaction-spacing
baseline. The zero-gap 60-day/12-month pair is an intentional segmented
control and was not treated as a defect.

## Clean checkout and repository gates

The worktree was clean and exactly at the candidate before installation. The
verification environment used Node `v22.23.2`, npm `10.9.8`, and Playwright
`1.58.2`.

```text
npm ci                         PASS — 65 packages, 0 vulnerabilities
npm audit --audit-level=high  PASS — 0 vulnerabilities
npm test                       PASS — Vitest 6/6; Playwright 12/12
npm run build                  PASS — tsc --noEmit + Vite production build
```

No lint script is defined; strict TypeScript checking runs in the exact build.
The build produced `dist/`. `dist/index.html` is 46,880 bytes (14.84 kB gzip),
with 28,296 bytes inline JavaScript and 17,520 bytes inline CSS. There are no
font downloads. The mobile/desktop hero WebPs are 26,964/78,070 bytes. These
are below the 200 kB JS, 50 kB CSS, 120 kB font, and 300 kB mobile-hero budgets.

## End-to-end evidence

Independent fresh-profile journeys were run against both the production build
preview and live origin.

- Started with $100.10 available, rejected `12.345`, recovered, added a
  one-time $125.50 bill and later $100.00 income, and correctly found the first
  uncovered amount of $25.40. The result survived reload and tab close/reopen.
- Rejected an empty bill name and a three-decimal amount, then recovered in the
  same dialog. Repository coverage also passed impossible-date rejection,
  leap-date import, month-end recurrence, integer-cent arithmetic, same-day
  income ordering, and IndexedDB v1→v2 invalid-date cleanup.
- Mark paid produced “All covered”; Undo restored the $25.40 gap. A named delete
  confirmation preserved the entry on Cancel and removed it on confirmation
  with “Delete recovery deleted.”
- CSV export produced a 193-byte payment run with correct quote/comma escaping.
  JSON backup contained both entries and the 10,010-cent starting balance.
  Malformed JSON was rejected without replacing the plan; valid import/export
  is covered by the passing repository journey.
- A forced IndexedDB-open failure produced the dedicated local-storage error
  screen and visible “Try again” recovery control without a page error.
- Local and live runs had zero console errors, page errors, or failed requests.
  First load, normal planning, privacy, and terms made no cross-origin request.
  Billing API traffic occurred only after a Plus/license action.

## Accessibility, responsive design, and motion

- Factory `verify-url.sh` passed locally in 579 ms and live in 550 ms: correct
  title and `lang`, exactly one h1 and main, no missing image alternatives, no
  unnamed buttons, and no console errors.
- Fresh axe WCAG A/AA scans on live light and dark themes found **0 violations**
  (therefore 0 serious/critical). The manual file-input defect above remains.
- The skip link was first in keyboard order, visibly focused with a
  `rgb(19, 107, 130) solid 3px` outline, and moved subsequent focus to Add bill.
  Entry dialogs focused Name and returned focus to their opener on Escape.
- Desktop 1440×1000 and mobile 390×844 were visually reviewed in both theme
  treatments. There was no horizontal overflow or lost content. A 720 CSS-px
  viewport (desktop 200%-zoom equivalent) also had no horizontal overflow.
- `prefers-reduced-motion: reduce` reduced animation and transition durations
  to 0.01 ms. Print media hid interactive chrome and retained the payment run.

## PWA, privacy, delivery, and deployment identity

- The manifest is served as `application/manifest+json`, uses standalone mode,
  a versioned start URL, matching theme/background colors, valid 192/512 icons,
  and a 512 maskable icon.
- After an online visit, both preview and live reloaded at 390 px with the
  network disabled, retained the planner, and displayed “Offline · your plan
  still works on this device.”
- An isolated exact production build was activated with worker cache v5, its
  worker was changed to v6, and `registration.update()` produced “An update is
  ready. Reload to use it.” with no console errors.
- Plan data uses IndexedDB; localStorage is limited to theme/license state. A
  source and network scan found no analytics, ad trackers, CDN fonts, third-party
  scripts, bank integrations, or direct payment-provider integration.
- Root, privacy, terms, manifest, worker, and offline fallback return 200. Live
  responses include HSTS, CSP (`frame-ancestors 'none'`, restricted connect
  sources), Permissions-Policy, `nosniff`, and strict-origin referrer policy.
  Root/SW cache for 30 seconds with revalidation; the manifest caches for one
  hour; an ETag conditional root request returned 304. App images also use the
  conservative 30-second revalidation policy and are cache-first in the worker.
- An invalid license-return query was stripped before the final URL, verified
  with HTTP 200, removed from the active-license key, and left the free planner
  usable. The verifier authorizes the live origin through CORS.

Local and live SHA-256 values matched exactly:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `414a4c26d4e2383119c3aedaf87f1cb3301a0bcce8ddd58a3539acb6f80c5252` |
| `sw.js` | `afad9ecb81227be6c5208c751eecdae1355ec4e14326576c46b897af2bd3084e` |
| `manifest.webmanifest` | `ae10fe6dba85cbd0071d7efd0b7621614fa757313f7a2276cfd8622d941f9c41` |
| `privacy/index.html` | `d87d538c8e6129d64e61e36f897dd34f444f46d599eccac7349a28416f0441f3` |
| `terms/index.html` | `37f60b7151faaeeff247e280f6067cd27f652414e5a3359e6017ca1a486eaf7b` |

Lighthouse 13 mobile against the live URL scored **Performance 95,
Accessibility 100, Best Practices 100, SEO 100**. FCP was 0.9 s, LCP 1.5 s,
TBT 250 ms, CLS 0, and total transfer 120 KiB. Lighthouse does not provide a
single-run lab INP value. The mobile trace fetched both hero variants (about 78
kB avoidable transfer) but remained within all stated budgets.

## Required release actions

1. Register/enable the production `bill-runway` one-time product, then exercise
   a real hosted checkout, return token, 12-month unlock, refund/revocation, and
   restore on a second device.
2. Add a visible `:focus-within` state to the Import backup label and add a
   keyboard regression test that inspects visible focus, not only focusability.
3. Increase the two independent mobile action-pair gaps from 4 px to at least
   8 px. Optionally correct the responsive preload so mobile does not fetch both
   hero variants.
4. Re-run independent verification after the billing and focus fixes.
