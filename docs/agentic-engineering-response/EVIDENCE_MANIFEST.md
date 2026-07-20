# Evidence Manifest

Prepared on 20 July 2026 for the Superteam Agentic Engineering Grant application.

| Evidence | Location | Verification |
| --- | --- | --- |
| Product source | Repository root | Public after GitHub publication |
| Core behaviour tests | `src/core.test.ts` | `npm test` |
| Public schema test | `src/schema.test.ts` | `npm test` |
| Generated fixture contract | `demo-output/anchorfixture.pack.json` | Recreate with `npm run fixture -- fixtures/counter-idl.json --out demo-output` |
| Generated CI specification | `demo-output/anchorfixture.pack.spec.ts` | Included in the 11-test run |
| Product screenshot | `docs/anchorfixture-workbench.png` | Captured from the verified local build |
| Build and deploy workflow | `.github/workflows/ci-pages.yml` | Confirm green after publication |
| Detailed scope and budget | `docs/GRANT_APPLICATION.md` | Budget totals 200 USDG and matches receipt rules |

Local verification completed before publication:

- TypeScript application and CLI checks: passed.
- Vitest: 3 files, 11 tests passed.
- Production web and CLI build: passed.
- npm audit: 0 known vulnerabilities.
- Desktop: no horizontal overflow; long source/output data scrolls inside panels.
- 390px viewport: no horizontal overflow or button-label overflow.
