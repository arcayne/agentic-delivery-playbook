# Run notes — GPT-6 routing profile update

## Status dashboard
- Current phase/slice: final review fix
- Accepted slices: GPT-6 profile migration; adapter/business-assumption fixes; model-effort route-fit fixes; parent `npm run check` passes (23 tests and policy validator)
- Blocked slices: none
- In-flight lanes: none; final GPT-6 Sol High rereview accepted (Merge verdict: OK)
- Known validation exceptions: reviewer toolset cannot run Git/tests or fetch URLs; parent supplies complete diff, test output, and official-source evidence. Pi did not expose requested xhigh; Codex docs confirm GPT-6 Luna supports up to Max.
- Next gate: parent closeout, commit/push, and PR creation

## Scope decision
Full-mode provider/model-routing update. Single serialized slice: active profile + references/configuration + focused tests/validator. One writer owns all files; no sibling implementation fanout. Historical GPT-5.6 design material is excluded from editing.

## Routing ledger
| Role | Intended agent/model/effort | Source | Verification |
| --- | --- | --- | --- |
| Spec critic | reviewer / openai-codex/gpt-6-sol / high observed | explicit | requested xhigh, runtime reported thinking high; revised critique approved |
| Implementer | worker / openai-codex/gpt-6-luna / high | explicit | user approved; observed |
| QA reviewer | reviewer / openai-codex/gpt-6-sol / high | explicit | first final review found P2; targeted fix applied; focused rereview accepted with no issues |

## Worktree safety
Feature branch `codex/gpt-6-luna-xhigh` was created from fetched `origin/main` at `35bca0ab04bd9057ff0c2df07525b65456392e71`. The caller's `main` worktree has unrelated pre-existing edits and will remain untouched.

## Spec-critic findings and disposition
- P1: The accepted controlled example is a fictional GPT-5.6 run while the contract asked to preserve historical run records but also migrate examples. Revised scope: this one fictional active demo may have only synthetic route fields and profile pointer updated; preserve genuine observations.
- P1: `docs/evaluation.md` and associated assertions freeze a GPT-5.6 evaluation arm. Revised scope excludes that frozen protocol and its tests from migration/stale-reference checks.
- P1: Official docs' generic effort list alone did not prove Luna+xhigh support. Follow-up Codex model catalog confirms Luna supports up to Max; profile now documents xhigh for Codex while preserving per-client verification and the observed Pi limitation.
- P2: Added legacy pointer and active operational references to the migration list.
- Final reviewer P1 fixed: Codex adapter README now matches configured Luna High default and a focused test prevents drift.
- Final reviewer P2 on evaluation links was fixed in BUSINESS-CONTEXT.md and docs/getting-started.md; both now label protocol 1.0 as frozen GPT-5.6 evidence and require a separate GPT-6 protocol. `test/active-surface.test.js` asserts the distinction in both pages. GPT-6 Sol High rereview confirmed the fix and returned `Merge verdict: OK`.
- Parent diff audit corrected mechanical-worker to Luna low, explorer to Luna low, and escalation reviewer to Sol max; focused assertions updated.

## Decisions
- Keep kernel model-neutral; update only the active provider/model profile and operational references.
- Preserve evaluation/history; update only the explicitly identified fictional active example.
- Use official GPT-6 family guidance for task-fit mapping; keep model ID and reasoning effort distinct.
- User approved GPT-6 Luna High implementation and GPT-6 Sol High review; both explicit routes were observed. Codex GPT-6 Luna xhigh is supported according to the official model catalog (Luna supports up to Max); client-specific observation still applies, and this Pi run only observed High.
