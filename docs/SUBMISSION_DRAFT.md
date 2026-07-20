# Superteam Submission Draft

Target listing: `Agentic Engineering Grants`

This document maps the current Superteam form fields to truthful, submission-ready answers. Values marked `VERIFY IN FORM` must be taken from the authenticated `feng` account at submission time.

## Basics

**Project Title**

AnchorFixture

**One-Liner Description**

Compile Anchor IDLs into deterministic success and failure fixtures for Solana frontends, AI agents, and CI.

**Your Telegram username**

QA52800

**Your Solana Wallet Address**

Use the embedded wallet owned by `feng` and verify the complete address in the preview before submission. Do not reuse an address owned by another Superteam account.

## Details

**Project Details**

AnchorFixture is an open-source scenario compiler for the transaction boundary between an Anchor programme and its generated frontend or AI agent. Anchor IDLs describe accounts and arguments, but teams still recreate success and failure fixtures for every client. That gap makes signer loss, account mutability errors, stale PDA inputs, and argument boundaries difficult to review consistently.

The current alpha accepts Anchor 0.30 and legacy IDLs and emits a versioned JSON fixture contract plus a Vitest specification. It generates deterministic account keys and arguments, a stable IDL fingerprint, success cases, missing-signer cases, forced read-only accounts, alternate PDA keys, and boundary arguments. A browser workbench performs all compilation locally; a CLI produces the same artifacts for CI.

The grant will fund one eligible $200 AI coding subscription used to harden the alpha into a public beta: an executable validator-adapter interface, a local-validator reference adapter, account/PDA mutation provenance, three public Anchor IDL examples, and a GitHub Actions changed-fixture gate. The deliverable is deliberately scoped to ship within 24 days of approval.

**Deadline**

14 August 2026. Reconfirm the date remains at least 24 days after the actual submission/approval timeline before entering it.

**Proof of Work**

- Repository: https://github.com/YoungblutSchilling/anchorfixture
- Live workbench: https://youngblutschilling.github.io/anchorfixture/
- Current evidence: 11 automated tests across generator behaviour, generated Vitest contracts, and public JSON Schema validation; TypeScript checks; production build; npm security audit with zero known vulnerabilities.
- Product screenshot and grant plan are stored in the repository under `docs/`.
- Local commit prepared before publication: `c8f2ed4`.

Only describe the GitHub and live links as public after both return HTTP 200 and the GitHub Actions workflow is green.

**Personal X Profile**

Waqas722297. Superteam may require ownership verification in an X login popup.

**Personal Github Profile**

YoungblutSchilling

**Optional custom link question**

Upload the contents of `docs/agentic-engineering-response/` to Google Drive using the authenticated account and paste the public read-only folder link. Confirm link access in a logged-out window before submission.

## Milestones Step

The Agentic Engineering form currently omits separate milestone and KPI fields. The scope, dates, outputs, and evidence are therefore included in Project Details and Proof of Work. The full milestone plan remains in `docs/GRANT_APPLICATION.md`.

## Final Checks

- Verify the form is open under `feng`, not another profile.
- Verify Telegram, X, GitHub, and wallet ownership.
- Verify repository, Pages deployment, Actions checks, and Drive link.
- Read and confirm the Agentic acknowledgement only if still true: `I understand that to receive the final tranche, I must submit the Colosseum project link, GitHub repo, and my AI subscription receipt.`
- Read and confirm the general feedback acknowledgement only if still true: `I understand that sponsors will not be able to send individual feedback to applicants. I have factored this in before applying to avoid disappointment.`
- Do not purchase the $200 subscription or create new external project records before approval without account-holder confirmation.
- Stop before the final submit button and request account-holder confirmation.
