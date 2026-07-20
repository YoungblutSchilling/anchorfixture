# Agentic Engineering Grant Application

## Project

**Title:** AnchorFixture

**One line:** Compile Anchor IDLs into deterministic success and failure fixtures for Solana frontends, AI agents, and CI.

## Problem

AI-assisted engineering accelerates client generation but does not make transaction boundaries trustworthy. An Anchor IDL identifies accounts and arguments, yet it does not ship reproducible cases for missing signatures, lost mutability, invalid PDA derivation, or boundary arguments. Teams recreate those fixtures in each frontend and agent codebase, and reviews cannot easily prove that a generated transaction still respects the program contract.

## Solution

AnchorFixture is an open-source scenario compiler. It accepts an Anchor IDL and emits:

1. A versioned JSON fixture contract with a stable IDL fingerprint.
2. Deterministic account keys and arguments for repeatable local, frontend, and agent tests.
3. Explicit success, missing-signer, read-only, invalid-PDA, and boundary scenarios.
4. A generated Vitest specification suitable for CI.
5. A local-only browser workbench and a Node CLI.

This is complementary to SDK generators. Codama and Solita generate clients; AnchorFixture generates portable behavioural test inputs and expected outcomes.

## Current evidence

- Working TypeScript core and CLI.
- Six automated generator tests.
- Anchor 0.30 and legacy account-field compatibility.
- Nested account, fixed-address, PDA, scalar, option, vector, array, struct, and enum support.
- Browser workbench with JSON and Vitest export.
- Deterministic output suitable for code review and CI diffs.

## Scope for the grant

The fixed $200 grant will fund a compact public beta rather than an open-ended research project.

### Milestone 1: public alpha and adapter contract

- Publish repository, hosted workbench, CLI, schema, and sample IDL.
- Add an executable validator-adapter interface and local-validator reference adapter.
- Add fixture provenance for account and PDA mutations.
- Target date: 10 days after approval.
- KPI: 100% tests passing, three example programs, complete schema documentation.
- Payment: $100 first tranche after approval and KYC, applied toward the eligible AI coding subscription.

### Milestone 2: CI beta and developer validation

- Ship a GitHub Actions example with a changed-fixture review gate.
- Test against three public Anchor IDLs and document incompatibilities.
- Collect structured feedback from at least five Solana developers.
- Publish a release and short implementation report.
- Target date: 24 days after approval.
- KPI: five developer feedback records, three real-IDL fixtures, one tagged beta release.
- Payment: $100 after the public beta is live and eligible AI coding subscription receipt(s) totalling $200 are submitted.

## Budget

| Item | Amount | Evidence |
| --- | ---: | --- |
| One month of an eligible highest-tier AI coding subscription used for adapter implementation, tests, documentation, and release hardening | $200 | Provider receipt(s) totalling exactly $200, public commits, and tagged release |

Total: **$200**. No infrastructure, contributor, or unrelated expense will be claimed against this grant. The subscription will only be purchased after approval and with the account holder's confirmation.

## Public-good commitment

The compiler, schema, adapters, examples, and CI workflow will remain MIT licensed. No token, trading feature, wallet custody, or paid dependency is required. The project is deliberately small enough to deliver within the programme's funding and large enough to become shared infrastructure for agent-generated Solana clients.

## Risks and controls

| Risk | Control |
| --- | --- |
| IDL versions diverge | Fixture parser records unsupported shapes with actionable errors; compatibility samples stay in CI. |
| Generated fixtures imply execution guarantees | Outputs distinguish structural expected outcomes from validator-confirmed outcomes. |
| Scope exceeds a $200 grant | Beta scope is limited to one adapter interface, one reference adapter, three IDLs, and one CI workflow. |
| Artificial adoption claims | Feedback and usage are reported only with links to public issues or opt-in records. |
