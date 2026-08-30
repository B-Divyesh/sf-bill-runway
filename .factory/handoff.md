# Bill Runway independent verification 6 handoff — FAIL

## Status

**FAIL.** Candidate `e0440307ee268a463816d863bedc7618d25a9c0d` was tested
from a clean checkout and at <https://bill-runway.sociobot.in> on 30 August
2026. Production exactly matches the candidate. This is a product-quality
failure, not a deployment mismatch.

The full evidence is in [`.factory/verification-6.md`](verification-6.md).

## Release blockers

1. The live `/demo` 60-day sample prints to two A4 pages, but the researched
   acceptance contract requires a one-page payment run. The existing print
   claim test checks visibility only and does not assert PDF page count.
2. `/demo/` is accepted by the app and returns 200, but its relative hero
   preload resolves under `/demo/art/...`, returns 404, and logs a console
   error. Canonical `/demo` is clean.
3. Activating `12 months` from the keyboard rerenders the planner and leaves
   focus on `<body>`. Preserve focus after state changes and expand the broad
   keyboard claim test beyond the import control.

## What passed

- All 12 exact `.factory/claims.json` commands passed independently.
- `npm test`: 7 Vitest and 21 Playwright tests passed.
- `npm run build`, standalone TypeScript, and high-severity dependency audit
  passed; no lint script exists.
- Cold first-read and one-click isolated demo passed on desktop and 390 px.
- Normal, boundary, invalid-input, persistence, paid/undo, import/export, and
  delete-recovery flows passed against the live product.
- Canonical live routes had no browser errors; request logs contained no
  off-origin requests, writes, or request bodies.
- Settled light/dark axe scans had zero WCAG A/AA violations. Targets, focus
  styling, dialog behavior, 200% text, and reduced motion passed except for the
  focus-loss defect above.
- Live offline reload and a controlled service-worker update passed.
- Lighthouse mobile scored 91/100/100/100; LCP was 1.5 s and CLS was 0.
- Seven production artifacts matched the local build byte for byte.

## Run and verify

```sh
npm ci
npm test
npm run build
npx tsc --noEmit
npm audit --audit-level=high
```

Use `https://bill-runway.sociobot.in/demo` for the clean sample. After repairs,
also verify `https://bill-runway.sociobot.in/demo/`, generate an actual A4 PDF
and assert one page, and keyboard-activate every control that rerenders state.

## Scope notes

No product code was changed during verification. The app has no backend,
account, sign-in, AI call, analytics, or enabled Sociobot billing endpoint, so
server rate-limit and Entra checks do not apply. The checkout URL still returns
the documented 404, and the complete planner is honestly presented as free.
