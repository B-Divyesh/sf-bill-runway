# Bill Runway verification 5 handoff — FAIL

## Status

**FAIL.** Independent QA on 2026-08-30 tested candidate
`aa3b8b5bdd77b5100ada6a9024c2a74753446517` at
<https://bill-runway.sociobot.in>. The live deployment matches the candidate,
and the core product works, but the acceptance contract has three
release-blocking findings.

## Blocking defects

1. **High — unlisted claims.** README says the app records paid bills and
   handles monthly, weekly, yearly, and one-time entries. Those exact claims
   are not represented by `.factory/claims.json`; the recurrence tagged test
   proves only monthly month-end clamping.
2. **Medium — small mobile targets.** At 390 px, `/demo` range buttons are
   131 by 36 px. The `Terms` link on `/privacy/` and `/terms/` is 41.2 by 44
   px. The contract requires at least 44 by 44 px.
3. **Medium — incomplete copy audit.** `.factory/copy-audit.md` has 18 rows
   and omits substantial legal, state, and README copy despite claiming full
   coverage.

## What passed

- All ten exact commands in `.factory/claims.json` passed after `npm ci`.
- `npm test`: 6 Vitest and 19 Playwright tests passed.
- `npm run build`: TypeScript and Vite passed; `dist/` was produced.
- Cold first read and one-click isolated sample-data demo passed on desktop
  and 390 px.
- Normal planning, exact decimal gaps, invalid-input recovery, one-cent and
  safe-integer boundaries, paid/undo, persistence, downloads, and confirmed
  deletion passed live.
- Request logging found only same-origin GETs with no bodies. Security headers
  are present. The product has no server API, account, or billing call, so
  rate-limit and Entra checks are not applicable.
- Live axe found zero WCAG A/AA violations at desktop and mobile on all four
  routes; root and demo were also scanned in both light and dark themes.
  Keyboard, focus, 200% text, reduced motion, and horizontal overflow checks
  passed apart from target size.
- Live offline reload used `bill-runway-v8`; an isolated worker update showed
  the in-app update notice.
- Lighthouse mobile: 99 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.5 s, TBT 110 ms, CLS 0. A 4x CPU interaction sample peaked
  at 112 ms.
- The local/live app shell, worker, manifest, offline, legal, and 404 files
  match byte-for-byte.

## How to reproduce

```sh
npm ci
npm test
npm run build
```

Then run each command in `.factory/claims.json`. Measure visible interactive
elements at a 390 by 844 viewport to reproduce target sizes. Full commands,
hashes, request evidence, performance numbers, and repair guidance are in
`.factory/verification-5.md`.

## Product-code changes

None. This verification changed only `.factory/verification-5.md` and this
handoff.
