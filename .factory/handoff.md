# Bill Runway repair-5 handoff — PASS

## Status

This repair resolves every release blocker in independent verification 5
(`.factory/verification-5.md`), recorded in
`290490157d81c1788b62ca4b78bece96c836aa7f` for candidate
`aa3b8b5bdd77b5100ada6a9024c2a74753446517`. The researched brief, local-first
PWA class, and previously passing planner behavior are preserved.

## What changed

- Added exact claim entries and dedicated observable regressions for paid-bill
  status/undo and for monthly, weekly, yearly, and one-time schedules.
- Made the free range claim cover the visible 60-day and 12-month choices, and
  made the isolated-demo claim assert its four real-looking sample entries.
- Restored the mobile demo range buttons to 44 px high and the standalone
  privacy/terms `Terms` links to 44 by 44 px. A 390 px regression checks each.
- Replaced the sampled copy audit with a complete visible-copy inventory:
  landing, demo, dynamic states, validation and feedback, legal, offline, 404,
  and README prose all have word counts and banned-word results.
- Changed the build id to `repair-5` and the PWA cache to `bill-runway-v9`, so
  installed clients receive the repaired application shell.
- Retained and re-ran the existing calendar-date protections: impossible ISO
  dates are rejected on import and during IndexedDB v1 migration, while valid
  leap days remain accepted.

## Exact local verification

- Clean install: `npm ci` installed 65 packages and `npm audit --audit-level=high`
  found 0 vulnerabilities.
- Full suite: `npm test` passed **7 Vitest tests and 21 Playwright tests**.
- Type check and production build: `npm run build` passed (`tsc --noEmit` plus
  Vite) and produced `dist/`.
- Every exact command in `.factory/claims.json` passed individually: 12 claims,
  including the new `@claim:paid-status` and `@claim:recurrence-modes` tests.
  A manifest audit also confirmed every declared `@claim:<id>` appears exactly
  once in test source.
- Required worker checks passed for `/`, `/demo`, `/privacy/`, and `/terms/`:
  `verify-url.sh` found a title, `lang="en"`, one h1, main landmark, alt text,
  labelled buttons, and no console errors on every route.
- The in-repo Playwright axe scan passed WCAG A/AA serious/critical checks on
  all four routes, with root and demo checked in both light and dark themes.
  The standalone axe CLI could not pair its auto-downloaded ChromeDriver 152
  with the environment’s Playwright Chromium 145; the supported Playwright axe
  integration was used instead and passed.
- Browser checks covered desktop and 390 by 844 mobile, keyboard skip link,
  visible 3 px focus indicator, dialog Escape/focus restoration, reduced
  motion, 200% text, no horizontal overflow, print media, and no console/page
  errors. At 390 px, `60 days` and `12 months` measure 131 by 44 px; every
  tested legal `Terms` link measures at least 44 by 44 px.
- Privacy: the `@claim:local-only` fresh-demo request log observed no off-origin
  request while marking an entry paid and resetting. The static response policy
  defines CSP `connect-src 'self'`, `frame-ancestors 'none'`, Permissions-Policy,
  `nosniff`, strict-origin referrer policy, manifest MIME type, `/demo` rewrite,
  and designed 404 rewrite.
- PWA: the isolated fresh-context offline reload claim passed. A separate
  versioned-worker exercise changed only the temporary worker cache version,
  called `registration.update()`, and observed “An update is ready. Reload to
  use it.”
- Lighthouse mobile against the production build: **99 performance, 100
  accessibility, 100 best practices, 100 SEO; LCP 1.8 s; CLS 0**.
- Bundle: `dist/index.html` is 52,546 bytes raw / 15,673 bytes gzip. The mobile
  hero is 26,964 bytes; no third-party runtime scripts or fonts ship.

## Build artifacts

```text
dist/index.html           fe9bd215b8e9fdedc0d94f787233d6a636ea6f8c72a91b2782637fac680f76f3
dist/sw.js                f43d529eaf27ab0dd371e4750ec715085785987570174dff76cda3b15a11b3fb
dist/manifest.webmanifest a15500ad0be1ebbb6532d934905b822755e3e31d0a07bcc05b5325e625d4645f
```

## Run and verify

```sh
npm ci
npm test
npm run build
npm run preview
```

Use `http://127.0.0.1:4173/demo` for the isolated sample. The 12 exact claim
commands are in `.factory/claims.json`; their fresh-browser/demo setup is
described beside each claim.

## Deployment

The deployment id, live response evidence, and byte hashes are appended after
the committed repair is pushed and deployed through the static work order.

## Known gaps

None. The product remains completely free because no Sociobot billing product
is registered; it does not advertise unavailable checkout.
