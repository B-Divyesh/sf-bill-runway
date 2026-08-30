# Bill Runway polish-1 handoff

## Status

Repaired the complete adversarial review at commit
`971724960227d332bb2c5dfcacab77e858492812`. The code repair is
`c44073b`; final documentation and release evidence follow in this work order.

## What changed

- Made demo entry data-first on phones, with a visible $900 sample, named bill,
  first shortfall, persistent banner, reset, and real-data exit.
- Kept demo data isolated in `demo:bill-runway` for both `/demo` and `?demo=1`.
- Replaced blanket SPA fallback with a known `/demo` rewrite and a real static
  404 response policy.
- Completed legal and error route metadata, common navigation/footer, and
  route-heading focus behavior.
- Rewrote flagged first-read copy, removed the untestable artwork claim, and
  added the required catalog description.

## Exact verification evidence

- Fresh clone: `/tmp/bill-runway-polish-clean-4OvuOR`.
- Fresh clone commands passed: `npm ci`, `npm run build`, `npm test`, then all
  ten commands in `.factory/claims.json` individually.
- Full suite: 6 Vitest tests and 19 Playwright tests passed.
- Build: `dist/index.html` 52.55 KB, 15.85 KB gzip.
- Local `verify-url.sh` reports are in `test-results/polish-1/verify-*`.
  They passed `/`, `/demo`, `/privacy/`, and `/terms/` with no console errors,
  one h1, a main landmark, and no image missing alt text.
- The Playwright axe test scans WCAG A/AA serious/critical violations on root
  and demo in both themes, plus privacy and terms. It passed.
- Phone screenshots: `test-results/polish-1/landing-390.png` and
  `test-results/polish-1/demo-390.png`.

## Deploy and live re-check

Deployment and cold live checks are completed after the final commit. Their
exact URL/status evidence is appended before handoff.

## Known gap

None. The brief's original one-time price remains deliberately absent because
the factory product is not registered. The complete planner is honestly free;
no unavailable checkout is shown.
