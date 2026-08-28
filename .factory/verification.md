# Independent verification — FAIL

Verified 2026-08-28 against candidate commit
`9f3e3ec313e26782d0e70f3762bb5edb7716e454` on `main`.

Production URL: <https://bill-runway.sociobot.in>

## Result

**FAIL.** The free, local-first planner works end to end, but the deployed
product exposes a paid Plus purchase that cannot be bought: the required
checkout endpoint returns 404. A second defect accepts an impossible calendar
date in an import and silently moves the bill to another day, which can change
the cash-runway answer.

## Blocking defects

### High — production Plus checkout is not registered

The visible “Buy Plus for $19” control points to the required production
endpoint:

```text
GET https://api.sociobot.in/api/v1/products/bill-runway/checkout
HTTP/2 404
{"error":"enabled factory product","status":404}
```

The corresponding invalid-license verification endpoint is reachable and
CORS-authorized for the live origin (`200`, `{"valid":false,"reason":"invalid"}`),
so this is specifically the missing/broken checkout registration. The app
advertises a one-time paid upgrade but cannot complete that purchase. This is
a deployment configuration defect, not a source-build mismatch.

### Medium — import accepts impossible dates and silently changes due dates

The JSON importer claims to validate before replacement but validates dates
only with `^\d{4}-\d{2}-\d{2}$`. In a clean browser profile I imported a
syntactically valid backup containing a one-time `$1.00` bill dated
`2026-09-31`. It announced `Backup imported.` rather than rejecting it, then
rendered the saved entry and payment run as **Thu, Oct 1**, including an
uncovered $1.00 gap on that different date. A corrupt/manual backup can
therefore alter the planning result without warning.

## Successful evidence

### Clean checkout and build

- Checkout was clean and at the requested SHA before verification.
- `npm ci` succeeded; `npm audit --audit-level=high` reported **0
  vulnerabilities**.
- `npm test` passed: **4/4 Vitest** decimal/recurrence/runway tests and **3/3
  Playwright** journeys.
- `npm run build` passed (`tsc --noEmit && vite build`) and created `dist/`.
  No separate lint command is defined in `package.json`; TypeScript checking
  is part of the production build.
- Production shell: `dist/index.html` is 44,626 bytes / **14.13 kB gzip**;
  the inlined JS/CSS are 26.44 kB/17.13 kB uncompressed. This is below the
  200 kB initial-JS and 50 kB CSS budgets. The mobile hero is 26,964 bytes
  WebP (1200px desktop variant 78,070 bytes); no web fonts ship.

### Independent end-to-end browser pass

Fresh Chromium runs against both the production build preview and the live
URL passed the same 21 checks with **no console errors, page errors, or
runtime outbound requests** on first load:

- empty state; settings validation/recovery; add a monthly $125.50 bill
  against $100.10; first-gap calculation; refresh persistence; mark paid and
  undo;
- CSV download (header and bill content) and JSON backup; malformed JSON
  import rejection; dialog focus and Escape close;
- desktop and 390×844 mobile (no horizontal overflow); light/dark axe WCAG
  A/AA scans with **0 serious/critical** findings; a visible
  `rgb(19, 107, 130) solid 3px` keyboard focus outline; reduced-motion rules
  reduced transition/animation duration to 0.01 ms;
- a first online visit followed by `context.setOffline(true)` and reload:
  the planner loaded and showed the offline status;
- service-worker update: against an isolated copy of the production build,
  changing only the cached worker version after activation and calling
  `registration.update()` produced the in-app message **“An update is ready.
  Reload to use it.”**

The native skip link navigates to `#main`; after activation, the next Tab
lands on the first planner action, so keyboard bypass remains usable.

### Deployment identity, privacy, and delivery policy

- Live `https://bill-runway.sociobot.in/` SHA-256 exactly matched the locally
  built `dist/index.html`:
  `12237254e259e67646c6e4406d02fbfba7e4faaed5baafcf69e6ad8ed3261742`.
- Live `/sw.js` exactly matched `dist/sw.js`:
  `37a17aa1d106b8cebd4c76cdf121d338f1657fa3a9678e025e09f4a8ae3a40cd`.
- Live root, privacy, terms, service-worker, and manifest routes returned
  200. The app uses IndexedDB for plan data and localStorage only for theme/
  license state; no analytics, CDN fonts, or third-party runtime scripts were
  found. The loaded live application made no external request until a license
  action is initiated.
- Live response headers include HSTS, `X-Content-Type-Options: nosniff`, and
  `Referrer-Policy: strict-origin-when-cross-origin`. Root/SW cache policy is
  `public, must-revalidate, max-age=30`. The manifest is served as
  `application/octet-stream`; it is nevertheless consumed by Chromium. No
  Content-Security-Policy or Permissions-Policy header is currently present
  (hardening recommendation, non-blocking relative to the defects above).
- A local Lighthouse 13 invocation could not be completed because its
  launcher could not connect to the environment-provided Chromium; bundle,
  transfer-size, semantic, axe, console, mobile, and motion checks above were
  completed independently.

## Required release actions

1. Register/enable the production `bill-runway` product checkout in the
   Sociobot billing service, then re-test the returned checkout redirect and
   a successful license return path.
2. Reject non-existent ISO dates in both import validation and any stored-data
   migration path; add regression coverage for `2026-09-31` and leap dates.
3. Re-run this verification after the two fixes. Consider adding CSP and
   Permissions-Policy headers and serving the manifest with an appropriate
   manifest/JSON MIME type.
