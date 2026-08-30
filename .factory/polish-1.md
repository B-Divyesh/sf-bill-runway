# Polish 1 — cumulative review repair map

Candidate repaired: `ce8a2cd02d06d070d982dc6327a8757ff73f8cae`.
Review source: `971724960227d332bb2c5dfcacab77e858492812`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | `/demo` now starts with a compact sample-plan heading, summary, gap, and timeline. Mobile landing now keeps the sample action above the fold. `?demo=1` enters the same isolated namespace. | `keeps the sample action and populated demo plan in the first phone screen`; `opens the isolated sample directly with the demo query path`; `test-results/polish-1/landing-390.png`; `test-results/polish-1/demo-390.png`; local `/demo` verify report. |
| F-1-2 | Removed the blanket navigation fallback. Only `/demo` is rewritten to the app; unknown paths receive `404.html` through the static host response override. The error page has error metadata and `noindex`. | `public/staticwebapp.config.json` JSON check; deployed cold check at `https://bill-runway.sociobot.in/not-a-real-page`. |
| F-1-3 | Privacy and Terms use the same wordmark, Demo/Privacy/Terms navigation, and legal footer links as the app. | `uses the common legal skeleton and moves focus to the new route heading`; local `/privacy/` and `/terms/` verify reports. |
| F-1-4 | Route headings are programmatically focused after legal/error routes and history return. | `uses the common legal skeleton and moves focus to the new route heading`. |
| F-1-5 | Privacy, Terms, and 404 now provide canonical, Open Graph, Twitter, favicon, and Apple-touch metadata. 404 is `noindex`. | browser metadata assertion; local route verify reports. |
| F-1-6 | Replaced “Your accounts stay separate.” with “No bank connections or payments.” | landing copy audit and `npm test`. |
| F-1-7 | Rewrote README opening in plain language, using the requested concrete explanation. | `README.md`; `.factory/copy-audit.md`. |
| F-1-8 | Split the build instruction into two short sentences. | `README.md`; `.factory/copy-audit.md`. |
| F-1-9 | Removed the public artwork provenance claim. Provenance remains in `design.md`. | footer source inspection; `.factory/design.md`. |

## Cumulative acceptance evidence

- `npm test`: 6 Vitest and 19 Playwright tests passed.
- `npm run build`: passed; `dist/index.html` is 52.55 KB (15.85 KB gzip).
- Fresh clone `/tmp/bill-runway-polish-clean-4OvuOR`: `npm ci`, build, full test suite, and every command in `claims.json` passed independently.
- `verify-url.sh` passed local `/`, `/demo`, `/privacy/`, and `/terms/` with zero console errors and exactly one h1/main each.
- Axe WCAG A/AA serious/critical scan passes on light and dark app routes plus both legal pages.

Live production re-check is recorded in the handoff after deployment.
