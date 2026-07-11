# Delivery contract: GPT-5.6-first playbook simplification

Status: approved
Owner: one sequential synthesis owner
Approved evidence: user's approval of massive simplification, option 3, and Direct/Controlled delivery

## Objective

Replace the current three-mode, multi-provider playbook with a small two-mode delivery kernel and one maintained GPT-5.6 Sol/Terra/Luna routing profile for Codex and ChatGPT Work.

## Non-goals

- Global configuration changes.
- Multi-provider active support.
- Unmeasured performance claims.

## Acceptance criteria

- AC-1: Only Direct and Controlled are active process modes.
- AC-2: GPT-5.6 Sol, Terra, and Luna are the only active route profile.
- AC-3: Controlled work uses normalized, compact contract and run artifacts.
- AC-4: Codex and ChatGPT Work are thin first-class adapters.
- AC-5: Legacy material is excluded from the active package.
- AC-6: All policy and package checks pass.

## Risk and authority constraints

- Risk: Documentation and package migration can break active guidance or packaging; changes are repository-local and reversible with Git.
- Authority: Repository-local edits and archival moves only; no publishing or global installation.
- Stop condition: New scope, a decision requiring different provider support, external authority, or contradictory verification evidence.

## Ownership

| Lane | Exclusive files or system boundary | Output |
| --- | --- | --- |
| synthesis | Whole migration, sequentially | Reviewable diff and evidence |

## Verification plan

| Criterion | Command or check | Required evidence |
| --- | --- | --- |
| AC-1 | `test/kernel.test.js`; Task 8 `npm run check` | Passing test output |
| AC-2 | `test/routing-profile.test.js`; Task 8 `show profile` | Passing output and profile display |
| AC-3 | `test/run-record.test.js`; Task 8 line-budget check | Passing test and line count |
| AC-4 | `test/adapters.test.js`; Task 8 `show codex` and `show chatgpt` | Passing output and displays |
| AC-5 | `test/active-surface.test.js`; Task 8 `npm pack --dry-run` | Passing output and package preview |
| AC-6 | Task 8 `npm run check` and `git diff --check` | Zero-exit command output |

## Unresolved decisions

- None.

## Approval

- Contract approved by: user
- Approved at: approved migration plan/task context, 2026-07-10
