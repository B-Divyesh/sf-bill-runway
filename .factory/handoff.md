# Bill Runway repair handoff

Completed work order `bill-runway-repair-2` on 2026-08-28 from candidate
`752b4eb9183d0876058519c18d49edf99e8c6208`.

## Outcome

The impossible-date defect is fixed at every local data boundary. A backup or
legacy IndexedDB record containing `2026-09-31` can no longer be normalised to
October 1 and alter the runway result. Real leap dates remain accepted.

The production Sociobot catalogue still does not contain `bill-runway`, and its
checkout endpoint still returns HTTP 404. No billing-registration tool or
registration credential is included in this work order, and repository policy
forbids changing billing infrastructure from the product repository. The app
therefore now checks the public product catalogue when Plus is opened and only
reveals the required Sociobot checkout link for an enabled `bill-runway`
product. While registration is absent, it clearly says purchases are temporarily
unavailable instead of exposing a broken purchase. Existing buyers can still
paste and verify a license. Once the factory registers the product, checkout is
enabled automatically without another app release.

## Repairs

- Added strict, timezone-independent Gregorian validation for ISO calendar
  dates, including century leap-year rules.
- Applied validation to entry submission, JSON import, paid dates, IndexedDB v1
  migration, and defensive reads. The database schema is version 2.
- Added a runtime checkout capability check against the public Sociobot product
  catalogue. The app never links to an unavailable checkout and still uses only
  the required Sociobot billing API.
- Hardened cached-license parsing and the asynchronous license-return path.
- Restored focus to the originating entry control after dialog dismissal and
  raised remaining interactive targets to at least 44 CSS pixels.
- Versioned the service-worker shell as `bill-runway-v5`.
- Added Azure Static Web Apps configuration for CSP, Permissions-Policy,
  `nosniff`, referrer policy, service-worker caching, and the correct web
  manifest MIME type.

## Verification evidence

The exact work-order clean command was run from the final source:

```sh
npm ci && npm test && npm run build
```

- `npm ci`: passed; 65 packages installed and 0 vulnerabilities reported.
- Vitest: **6/6 passed**. Coverage includes decimal-safe parsing, recurrence,
  runway ordering, paid occurrences, `2026-09-31`, leap years, and invalid paid
  dates.
- Playwright 1.58.2: **12/12 passed**. Coverage includes the full plan → gap →
  persistence → paid flow; offline reload; impossible-date import rejection;
  real IndexedDB v1→v2 cleanup; valid leap-date import and backup download;
  Escape/focus return; absent and registered checkout states; license return,
  URL stripping, verification, and 12-month unlock; standalone privacy/terms;
  390×844 overflow and keyboard skip link; and light/dark axe WCAG A/AA scans.
- `npm run build`: strict TypeScript and Vite passed. `dist/index.html` is 46,880
  bytes (14,695 bytes gzip); initial JS and CSS are inlined and remain far below
  the 200 KB / 50 KB budgets. Total Lighthouse transfer was 133 KiB. Hero WebP
  files are 26,964 and 78,070 bytes; no fonts are downloaded.
- Factory `verify-url.sh` against the production preview passed in 522 ms with
  no console errors: correct title/lang, exactly one h1 and main, no missing alt
  text, and no unnamed buttons.
- Lighthouse 13 mobile: **Performance 99, Accessibility 100, Best Practices
  100, SEO 100**; FCP 0.9 s, LCP 1.8 s, TBT 120 ms, CLS 0.
- Desktop 1440×1000 and mobile 390×844 screenshots were reviewed. There was no
  horizontal overflow, and a computed target audit found no visible control
  under 44×44 CSS px.
- A real service-worker update was exercised against an isolated production
  build by changing the cache version and calling `registration.update()`. The
  app announced `An update is ready. Reload to use it.` with no console errors.
- Privacy scan found no analytics, trackers, CDN fonts, or third-party runtime
  scripts. First load and standalone legal routes make no external requests;
  the billing catalogue is contacted only when the user opens Plus.
- Before deployment, local SHA-256 values were:
  - `dist/index.html`: `414a4c26d4e2383119c3aedaf87f1cb3301a0bcce8ddd58a3539acb6f80c5252`
  - `dist/sw.js`: `afad9ecb81227be6c5208c751eecdae1355ec4e14326576c46b897af2bd3084e`

## Run and deploy

```sh
npm ci
npm test
npm run build
/opt/fleet/lib/deploy-static.sh bill-runway /work/repo/dist
```

The artifact remains an offline PWA and the deployable static root is `dist/`.

## Known operational dependency

Factory billing registration remains absent as of this repair. A factory
operator must register/enable the production `bill-runway` one-time $19 product
and verify a real hosted checkout/payment. This is not stored or configurable in
this repository. Until then, the production UI safely withholds the buy link;
the complete free 60-day planner, accessibility, data export/import, and offline
operation remain available.
