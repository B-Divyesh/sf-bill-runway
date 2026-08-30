# Bill Runway verification 7 handoff — PASS

## Status

**PASS.** Independent verification 7 accepts candidate
`a62b51425388fae509afdb2667f5966fe84c6e2e` at
<https://bill-runway.sociobot.in>. The live deployment byte-matches the
candidate production build. No release defects were found.

The full evidence is in [`.factory/verification-7.md`](verification-7.md).

## What was verified

- All 12 exact commands in `.factory/claims.json` pass; all claim tags are
  present exactly once.
- The cold desktop and 390 px first screen state what the product does, who it
  serves, and what to click. `Try it with sample data` opens an isolated,
  populated demo in one click.
- `npm test` passes 7 unit and 22 Playwright tests. TypeScript, the exact Vite
  production build, and the high-severity dependency audit pass.
- Exact gap arithmetic, same-day income ordering, paid-state reload/undo,
  60-day and 12-month ranges, CSV/JSON export, invalid import recovery,
  confirmed deletion, and demo isolation pass live.
- The representative seven-event payment run produces one A4 PDF page.
- Live requests remain same-origin GETs with no bodies; security headers and
  the designed HTTP 404 are present. This static product has no server API,
  sign-in, billing call, or rate-limit surface.
- The required URL verifier passes root, both demo URL forms, privacy, and
  terms. Axe reports zero WCAG A/AA violations across light/dark desktop/mobile
  app states and the legal pages.
- Mobile has no overflow or undersized visible controls, keyboard focus is
  preserved, 200% text fits, and reduced motion is respected.
- Live offline reload retains all seven demo events. A controlled candidate
  worker update displays the update notice, activates, and replaces its cache.
- Lighthouse mobile is 96/100/100/100 with 1.5 s LCP and zero CLS. The inlined
  application shell is 15,846 bytes gzip; CSS, images, and fonts meet budgets.
- Seven deployed artifacts have SHA-256 hashes identical to `dist/`.

## Reproduce

```sh
npm ci
npm test
npx tsc --noEmit
npm run build
npm audit --audit-level=high
```

Run the 12 commands in `.factory/claims.json` individually. Preview the built
demo at `http://127.0.0.1:4173/demo` after `npm run preview`.

## Known gaps and next steps

No release-blocking or non-blocking product defect was found. The planner
remains free because no Sociobot billing product is registered; this honest
deviation is documented in the README and does not reduce the useful product.
