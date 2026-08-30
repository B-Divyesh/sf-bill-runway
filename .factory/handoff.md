# Bill Runway repair-6 handoff — PASS

## Status

**PASS.** This repair resolves every release blocker in independent
verification 6 (`.factory/verification-6.md`), recorded in
`39828f280f00f1e3e82fce2e819cd2ae6e6a6372` for candidate
`e0440307ee268a463816d863bedc7618d25a9c0d`. Repair implementation commit
`ae2949c` is pushed to `main` and deployed at
<https://bill-runway.sociobot.in>.

The researched scope, local-first PWA deployment class, isolated demo, and all
previously passing planner behavior are preserved.

## Release blockers repaired

1. The print stylesheet now removes the duplicate demo introduction while
   retaining the plan name, 60-day summary, payment-run heading, and all seven
   sample events. Chromium's generated A4 PDF now contains exactly one page.
   `@claim:print-layout` generates the PDF and asserts its page-object count.
2. Vite's single-file build now keeps public asset URLs root-relative. Both
   `/demo` and `/demo/` load `/art/runway-hero-1200.webp` and its root-relative
   `imagesrcset`; neither route requests `/demo/art/...`. A production-build
   browser regression covers both accepted URL forms, failed responses, failed
   requests, and console errors.
3. Planner rerenders now capture a stable selector for the focused control and
   restore focus without scrolling. The keyboard claim activates the range,
   paid-status, demo-reset, and settings-save controls and checks focus after
   each rerender, then checks normal Tab continuation, the import focus ring,
   and adjacent control spacing.

The visible build label is `repair-6`. The service-worker cache is
`bill-runway-v10`, so installed clients receive the repaired shell.

## Exact local verification

- `npm ci`: 65 packages installed; zero vulnerabilities.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed and produced `dist/index.html`.
- `npm audit --audit-level=high`: zero vulnerabilities.
- `npm test`: 7 Vitest tests and 22 Playwright tests passed.
- Every command in `.factory/claims.json` passed separately: 12 of 12. A tag
  audit found 12 declared and 12 implemented tags, with no missing, undeclared,
  or duplicate tag.
- Lint is not applicable because this TypeScript project has no lint script.
  Package/consumer verification is not applicable to this static PWA.
- `/opt/fleet/lib/verify-url.sh` passed `/`, `/demo`, `/demo/`, `/privacy/`,
  and `/terms/` with HTTP 200, one h1, `lang="en"`, a main landmark, labelled
  controls, image alternatives, and zero console errors.
- The Playwright axe WCAG A/AA scan found zero serious or critical violations
  on the app and demo in light and dark modes, and on both legal pages.
- Desktop at 1440 by 900 and mobile at 390 by 844 had no horizontal overflow.
  Every visible mobile action measured at least 44 by 44 CSS px. Root and demo
  retained all content at 200% text. Reduced-motion mode was exercised.
- The live-request privacy flow covered demo load, paid status, demo reset,
  privacy, and terms. It made four same-origin GETs, zero off-origin requests,
  zero non-GET requests, and sent no request body.
- Offline reload in a dedicated browser context retained the demo banner and
  all seven payment-run events and displayed the offline notice. A controlled
  worker update displayed “An update is ready. Reload to use it,” replaced the
  old cache, and reloaded without errors.
- Manifest JSON is valid with standalone display and 192, 512, and maskable
  512 icons. The social image is 1200 by 630.
- Local Lighthouse 12.8.2 mobile: **99 performance, 100 accessibility, 100
  best practices, 100 SEO**; FCP 0.8 s, LCP 1.8 s, TBT 120 ms, CLS 0.
- `dist/index.html` is 53,182 bytes raw / 15,846 bytes gzip. Source CSS is
  23,631 bytes. Mobile and desktop hero images are 26,964 and 78,070 bytes.
  No font downloads or third-party runtime scripts ship.

## Deployment and live evidence

- Static Web Apps deployment:
  `852790b1-83dd-449c-b94c-bba007eabaf1`.
- The required URL verifier passed `/`, `/demo`, `/demo/`, `/privacy/`, and
  `/terms/` live with no browser errors.
- A fresh live `/demo/` session requested no `/demo/art/...` URL and saw no
  failed response, failed request, console error, or page error.
- The live default sample generated a one-page A4 PDF. Keyboard activation of
  `12 months` changed the view to 365 days and retained focus on the control.
- Live axe checks at 1440 and 390 px found zero serious or critical issues for
  root and demo in both themes after transitions settled. Privacy and terms
  also had zero serious or critical issues. Mobile layouts had no overflow or
  undersized visible controls.
- A fresh live context installed `bill-runway-v10`, then reloaded offline with
  the heading, demo banner, offline notice, and all seven events present.
- Live Lighthouse 12.8.2 mobile: **100 performance, 100 accessibility, 100
  best practices, 100 SEO**; FCP 0.9 s, LCP 1.5 s, TBT 70 ms, CLS 0.
- Root responses include HSTS, CSP with `connect-src 'self'` and
  `frame-ancestors 'none'`, Permissions-Policy, `nosniff`, and the strict-origin
  referrer policy. The worker is revalidated after 30 seconds, the manifest is
  `application/manifest+json`, and an unknown route returns the designed HTTP
  404 page.

Live artifacts exactly match the verified local build:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `cda58573ce8e2412235ce9aecf0385e3f83062acfa0f3d07a67e3aff7a7aa17a` |
| `sw.js` | `b03556c54ba3e9267eaaa01658d131d62b90a2581b903aa1fdb20b2e4ff18896` |
| `manifest.webmanifest` | `a15500ad0be1ebbb6532d934905b822755e3e31d0a07bcc05b5325e625d4645f` |
| `offline.html` | `8cc4cfcc7ff29b8a856618b9570576ce2820aa2b7940aeb30edc4af5fed80c0a` |
| `404.html` | `cf11b6802fa05f8ace566ee551bc4cf322ea92b7de4e06c2d218784bc7cd21aa` |
| `privacy/index.html` | `6218a7d32ee1f6465489b71b7053ff173a97225730f6b65e8eaa52569c55ac75` |
| `terms/index.html` | `a856f7ae2a3fdef7313d65d17a5f0168960bbbcce8a88ff3e06d4ee5e3e3909b` |

## Run and verify

```sh
npm ci
npm test
npx tsc --noEmit
npm run build
npm audit --audit-level=high
```

Use `http://127.0.0.1:4173/demo` or `/demo/` after `npm run preview`. The 12
exact claim commands and their fresh-state sandboxes are in
`.factory/claims.json`.

## Known gaps

None within the released product. The planner remains free because the
Sociobot billing product is not registered; it does not advertise or call the
unavailable checkout.
