# Bill Runway verification handoff — FAIL

Independent verification work order `bill-runway-verify-2` tested candidate
`b61a1375263cc08b6d44837723d3170c3ad01758` on 2026-08-28 against
<https://bill-runway.sociobot.in/>.

## Outcome

**FAIL.** The free offline 60-day runway is production-quality and the deployed
artifact matches the candidate build exactly, but two acceptance defects remain:

- **High:** the live Sociobot catalogue has no `bill-runway` product and the
  required checkout returns HTTP 404. The repaired UI safely reports purchase
  unavailability and leaves restore/free features working, but a user cannot
  buy the advertised $19 one-time 12-month unlock.
- **Medium:** keyboard focus lands on the fully transparent Import backup file
  input while its visible label has no focus treatment. Before/focused label
  screenshots were pixel-identical.

A low-severity 4 px spacing issue also affects the print/export and
backup/import mobile action pairs. Full evidence is in
[`.factory/verification-2.md`](verification-2.md).

## Verification summary

```sh
npm ci
npm audit --audit-level=high
npm test
npm run build
```

These passed with 0 vulnerabilities, 6/6 Vitest tests, 12/12 Playwright tests,
strict TypeScript, and a production `dist/` build. No lint command exists.
Independent preview/live journeys covered representative planning, invalid
input and recovery, persistence, paid/undo, confirmed/cancelled deletion,
CSV/JSON ownership, storage failure, keyboard, 390 px mobile, 200%-zoom
equivalent layout, light/dark axe, reduced motion, print, privacy, response
policies, offline reload, and service-worker update notification. There were no
console/page errors or failed first-party requests.

Factory URL verification passed locally and live. Lighthouse 13 mobile scored
95 performance, 100 accessibility, 100 best practices, and 100 SEO (LCP 1.5 s,
CLS 0, 120 KiB transfer). JS, CSS, font, and hero budgets pass. Root, worker,
manifest, privacy, and terms hashes match the local candidate build exactly.

## Next steps

1. Factory operations must register/enable the production `bill-runway`
   one-time product and validate a real purchase through restore/revocation.
2. Product code must expose visible focus on the Import backup label and should
   raise the two 4 px mobile action gaps to 8 px.
3. Rebuild, deploy, and independently re-verify. Until then, the safe and useful
   free planner remains available, including offline use and data export.

No product code or deployment infrastructure was changed by this verification.
