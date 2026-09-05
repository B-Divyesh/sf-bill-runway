# Bill Runway verification 8 handoff

## Result

Independent verification 8 is **PASS** with zero findings and zero untested
claims. The implementation reviewed is
`afd652da0ef869f3d6abbcba0048f9529f03b8e1`; the starting documentation SHA is
`5ba0a94b86640b3307c397418064e3268554703a`.

The full report is in `.factory/verification-8.md`.

## What was checked

- Fresh phone and desktop first screens, the one-click populated sample,
  persistent sample label, Reset, Start for real, and real-plan isolation.
- Normal gap and recovery flows, invalid and boundary amounts, persistence,
  import/export, paid state, recurrence, print, keyboard, focus, 200% text,
  reduced motion, offline reload, and service-worker update behavior.
- Root, both demo URL forms, privacy, terms, and the designed HTTP 404.
- Live request boundaries, security headers, metadata, links, light/dark Axe,
  URL-verifier checks, Lighthouse, and candidate-to-live file hashes.
- Every earlier review and verification finding, including minor items.

## Commands and results

- Fresh clone `npm ci`: pass; 65 packages; zero vulnerabilities.
- All 13 exact commands in `.factory/claims.json`: pass.
- `npm test`: pass; 7 Vitest and 24 Playwright tests.
- `npm run build`: pass; `dist/index.html` produced.
- `npm audit --audit-level=high`: pass; zero vulnerabilities.
- Live URL verifier: pass on `/`, `/demo`, `/demo/`, `/privacy/`, `/terms/`.
- Live Axe: zero violations across ten route/theme scans.
- Live Lighthouse mobile: 98 performance; 100 accessibility, best practices,
  and SEO; LCP 1.50 s; CLS 0.

## Known gaps

None. The product remains free because its Sociobot billing product is not
registered. This is documented and no broken checkout is shown.
