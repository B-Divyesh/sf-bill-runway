# Bill Runway review 2 handoff

## Status

Review completed and committed without product-code changes. The verdict is
**FAIL**; see `.factory/review-2.md`.

## What was checked

- Fresh live 390 px and desktop first-screen, demo, privacy, terms, direct
  demo query, routing/back-focus, metadata, same-origin link crawl, real 404,
  console, and request-log checks.
- Demo sandbox isolation, Reset settling behaviour, Start-for-real cleanup,
  and offline service-worker reload on the live product.
- All 12 exact commands in `.factory/claims.json` from a clean clone.
- `npm test` (7 Vitest and 22 Playwright tests) and `npm run build` from that
  clean clone.
- Every earlier review/polish/handoff finding, source, brief, design, claims,
  README, and landing sentence.

## Remaining work

1. Add an observable, tagged claim test for **Reset demo restores the sample**.
2. Put the normal header, navigation, footer, and legal links on the real HTTP
   404 page.
3. Replace the unexplained **payment run** wording with plain upcoming-list
   language across UI, README, and claims.

No product code was modified. The clean-clone evidence directory is
`/tmp/bill-runway-review2-r804B3/repo` for this disposable review session.
