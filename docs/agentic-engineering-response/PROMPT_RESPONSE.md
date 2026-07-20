# Codex Response Package

## Prompt

> help me apply for the agentic engineering grant by Superteam

## Response

Build a narrow, verifiable Solana engineering product whose scope fits a $200 agentic-engineering grant and whose current state can be inspected before funding.

### Proposed product

AnchorFixture compiles an Anchor IDL into deterministic transaction fixtures for frontends, autonomous agents, and continuous integration. SDK generators create client calls; AnchorFixture creates the success, signer, mutability, PDA, and argument-boundary states used to test those calls.

### Current alpha

- TypeScript core and CLI.
- Local-only React workbench with IDL import, instruction scope, seed control, scenario inspection, JSON export, and generated Vitest output.
- Anchor 0.30 plus legacy account-field support.
- Nested accounts, fixed addresses, PDAs, scalar values, options, vectors, arrays, defined structs, and enums.
- Versioned public JSON Schema.
- 11 passing tests, successful production build, and zero known npm audit vulnerabilities.

### Grant-funded scope

1. Publish the repository, workbench, CLI, schema, sample IDL, and reproducible CI.
2. Add an executable validator-adapter contract and local-validator reference adapter.
3. Add account and PDA mutation provenance.
4. Validate three public Anchor IDLs and publish incompatibilities rather than hiding them.
5. Collect structured feedback from five Solana developers and tag a beta release within 24 days of approval.

### Use of funds

Use the entire 200 USDG budget for one eligible highest-tier AI coding subscription. Submit provider receipt(s) totalling exactly $200 with the second-tranche evidence. Do not claim hosting, contributor payments, or unrelated expenses.

### Verifiable links after publication

- Repository: https://github.com/YoungblutSchilling/anchorfixture
- Workbench: https://youngblutschilling.github.io/anchorfixture/
- Detailed application: `docs/GRANT_APPLICATION.md`
- Submission field map: `docs/SUBMISSION_DRAFT.md`

### Honest limitations

The alpha provides structural expected outcomes. Validator-confirmed outcomes are part of the funded adapter milestone. No adoption, validator execution, subscription purchase, or receipt is claimed before it exists.
