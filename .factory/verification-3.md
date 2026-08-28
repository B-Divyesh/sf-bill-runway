# Independent product verification 3 — FAIL

Verified on 2026-08-28 against candidate commit
`862d3d073e86b87c62ab8233e6c4cbb1323f80dd` and the live deployment
<https://bill-runway.sociobot.in/>.

## Verdict

**FAIL.** The candidate is built and deployed correctly, and the free,
local-first 60-day cash-runway job works end to end. However, the researched
brief specifies a one-time monetisation model and the product advertises a
$19 Plus unlock. Production has no registered `bill-runway` product, so a
customer cannot complete the required hosted checkout, receive a real return
token, or unlock the 12-month view through a purchase. This is a production
billing-catalogue defect, not a source/deployment mismatch.

## Defects

### High — advertised one-time Plus checkout is unavailable in production

Fresh checks at 05:53 UTC found zero matching catalogue records:

```text
GET https://api.sociobot.in/api/v1/products
200 application/json
data entries where slug == "bill-runway": 0

GET https://api.sociobot.in/api/v1/products/bill-runway/checkout
404 application/json
{"error":"enabled factory product","status":404}
```

The live UI handles the unavailable catalogue honestly: opening the Plus
dialog requests only the public catalogue, shows “Plus purchases are
temporarily unavailable. You can still restore an existing license below.”,
hides **Buy Plus for $19**, and keeps the license-token restore field enabled.
That avoids a dead customer link, but it does not meet the paid-unlock or
one-time-monetisation acceptance path. Real checkout, return-token,
second-device restore, and refund/revocation verification remain impossible
until the factory enables the product. Repository work must not change billing
infrastructure.

## Clean-checkout gates

The worktree was clean at the requested SHA before installation. Node was
`v22.23.2`, npm `10.9.8`, and Playwright `1.58.2`.

```text
npm ci                         PASS — 65 packages installed
npm audit --audit-level=high  PASS — 0 vulnerabilities
npm test                       PASS — Vitest 6/6; Playwright 13/13
npm run build                  PASS — tsc --noEmit + Vite build to dist/
```

There is no separate lint script; the exact production build includes strict
TypeScript checking.

## Product and error-path evidence

Fresh Chromium profiles exercised the local production preview and live app.

- Empty state, plan settings, a $100.10 starting balance, a $125.50 bill, and
  the resulting first $25.40 uncovered window worked correctly. Data survived
  reload. Mark paid removed the gap; Undo restored it.
- Empty name, zero amount, and three-decimal amount were rejected with clear
  recovery errors. A monthly expected-income entry saved and displayed its
  recurrence. Repository journeys also passed invalid/leap-date import,
  malformed-backup protection, v1 IndexedDB invalid-date migration, JSON/CSV
  ownership export, and dialog focus return.
- Decimal-safe unit coverage passed, including cents arithmetic, month-end
  recurrence clamping, valid leap days, impossible calendar dates, and
  same-day income-before-bill ordering.
- Live normal planning made no cross-origin request. The only external
  request observed was `https://api.sociobot.in/api/v1/products` after the
  user explicitly opened Plus. No page errors or console errors occurred in
  local or live fresh-profile runs.

## Accessibility, PWA, privacy, delivery, and performance

- Desktop 1440×1000 and mobile 390×844 were exercised. At 390 px there was no
  horizontal overflow; the skip link was first in keyboard order; the real
  file input was reachable by Tab and its visible Import backup label showed
  a 3 px designed focus outline.
- Live axe WCAG 2 A/AA scans in light and dark themes had **0 serious or
  critical findings**. Reduced-motion media reduced both transition and
  animation duration to `0.01ms`.
- After an online visit and service-worker activation, an offline live reload
  loaded the planner and displayed the offline status. In an isolated copy of
  the exact production build, updating the worker cache version from v6 to v7
  and calling `registration.update()` produced **“An update is ready. Reload
  to use it.”** without console/page errors.
- The manifest is valid JSON with standalone display, a versioned start URL,
  192/512/maskable icons, and matching theme colours. The app stores plan data
  in IndexedDB and theme/license state locally; source/network review found no
  analytics, third-party runtime scripts, CDN fonts, bank connections, or
  direct payment-provider integration.
- Live `/`, `/privacy/`, `/terms/`, `/manifest.webmanifest`, `/sw.js`, and
  `/offline.html` returned 200. Responses have HSTS, CSP, Permissions-Policy,
  `nosniff`, strict-origin referrer policy, and an ETag; conditional root
  retrieval returned 304. Root, worker, and images use 30-second
  must-revalidate caching; the manifest uses one hour.
- Bundle budgets pass: `dist/index.html` is 46,956 B (14,849 B gzip), with
  28,296 B inline JavaScript and 17,596 B inline CSS; no web fonts ship. The
  720 px WebP hero is 26,964 B. Lighthouse 13 mobile on live scored
  **95 Performance, 100 Accessibility, 100 Best Practices, 100 SEO**
  (FCP 1.0 s, LCP 1.5 s, TBT 270 ms, CLS 0, 133 KiB transfer).

## Deployment identity

The locally built candidate exactly matches production:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `a3b9c9c8646a9c15cf9fcca129dc7df300124a62a243b633e974df2b0215ff03` |
| `sw.js` | `8d3082c6e4d58ae5d7024485493d1855ad607fea7fbbfbc2aeaef3005bda90cc` |
| `manifest.webmanifest` | `ae10fe6dba85cbd0071d7efd0b7621614fa757313f7a2276cfd8622d941f9c41` |
| `privacy/index.html` | `d87d538c8e6129d64e61e36f897dd34f444f46d599eccac7349a28416f0441f3` |
| `terms/index.html` | `37f60b7151faaeeff247e280f6067cd27f652414e5a3359e6017ca1a486eaf7b` |
| `offline.html` | `95e8319d15d51564bf54c791ab4c3ea87c6377bfb8b46a17285081818294a5f9` |

## Required release action

Register and enable the production `bill-runway` one-time product in the
Sociobot billing catalogue. Then rerun verification through hosted checkout,
return-token capture, 12-month unlock, restore on a separate browser profile,
and revocation/refund behaviour. No source-code change can resolve this
external blocker.
