# Bill Runway polish-1 handoff

## Status

Repaired the complete adversarial review at commit
`971724960227d332bb2c5dfcacab77e858492812`. Repair commits are `c44073b`,
`e55ea01`, and `aa688f6`.

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
- Final committed clone `/tmp/bill-runway-polish-final-MaXxVK` repeated all ten
  claim commands independently after the deployment-record commit.
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

- Deployed `dist/` using `/opt/fleet/lib/deploy-static.sh bill-runway
  /work/repo/dist`. Static Web Apps deployment:
  `bb15476c-32fc-4228-b760-e98f7381e595`.
- Cold production `verify-url.sh` passed `https://bill-runway.sociobot.in/`,
  `/demo`, `/privacy/`, and `/terms/`. Each report has zero console errors and
  validates the title, language, h1, main landmark, and image alt text.
- `https://bill-runway.sociobot.in/not-a-real-page` returned HTTP 404. Its
  rendered title is `Page not found — Bill Runway` and its robots directive is
  `noindex, nofollow`.
- A cold 390×844 browser check measured the landing sample action at y=532.33.
  After clicking it, the live demo summary was at y=360.17; its gap and first
  named bill were also inside the first viewport. Evidence:
  `test-results/polish-1/live-demo-390.png`.
- Live keyboard navigation focused Privacy's h1, then the home h1 after Back.
  Live axe WCAG A/AA scans found zero serious or critical violations on `/`,
  `/demo`, `/privacy/`, and `/terms/`.

## Known gap

None. The brief's original one-time price remains deliberately absent because
the factory product is not registered. The complete planner is honestly free;
no unavailable checkout is shown.
