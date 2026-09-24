# GPT-6 routing profile update

## Objective
Update the playbook's active GPT-5.6 routing profile to reflect the currently available GPT-6 models, distinguish model from reasoning effort, and document Luna xhigh only where the exact model/client supports it, while preserving task-fit routing and the capability-based delivery kernel.

## Non-goals
- Do not redesign Direct/Controlled policy or change the provider-neutral kernel.
- Do not mass-edit historical plans, frozen evaluation material, or real run records.
- `examples/controlled-run/run.json` is a fictional active demo, not a real observed run; update only its fictional route fields and policy pointer so the maintained example matches current policy.
- Do not claim model performance, cost, or review independence without evidence.
- Do not silently remove model fallback/runtime-default recording guidance.

## Baseline state and evidence (before implementation)
- The maintained profile is `profiles/gpt-5.6.md`; Codex configs, root instructions, package metadata, examples, tests, and policy validation refer to GPT-5.6.
- GPT-6 routes available in the session registry include `openai-codex/gpt-6-luna`, `openai-codex/gpt-6-sol`, and `openai-codex/gpt-6-astra`.
- Official Codex model guidance recommends Luna for focused/repeatable tasks, Sol for complex coding/agentic workflows, and Astra for broad code/research/computer-use; start Luna at High, Sol at Medium, and Astra at Light/low effort. The model catalog says GPT-6 Luna supports reasoning up to Max; the Codex configuration reference includes `xhigh`, so Luna xhigh is supported in Codex. Effort availability still varies by selected model and client.
- A Pi reviewer launch requested GPT-6 Sol xhigh but resolved as GPT-6 Sol thinking high. This shows Pi does not expose that requested effort in this run; it does not override Codex's documented support. The user approved GPT-6 Luna High for implementation and GPT-6 Sol High for review.
- Source: https://developers.openai.com/codex/models and https://developers.openai.com/codex/config-reference (fetched 2026-09-24).

## Acceptance criteria
1. The active profile is GPT-6-specific and maps model choice separately from reasoning effort. It documents Luna+xhigh only as an optional route when that exact model/client advertises or verifies the effort; High remains the documented Luna starting route.
2. The capability-based kernel remains model-neutral; maintained README, root/adapter instructions and README, contributor guidance, package metadata, templates, active demo, and legacy active-policy pointer point to the GPT-6 profile. Codex setup documentation reflects Luna High as the default; business assumptions distinguish the frozen GPT-5.6 evaluation protocol from any future GPT-6 evaluation. No current public-doc link may imply that the frozen GPT-5.6 evaluation protocol validates GPT-6 routing; any future GPT-6 evaluation must be separately versioned. The frozen GPT-5.6 evaluation protocol and its assertions remain unchanged.
3. Codex default and agent configuration use exact GPT-6 model IDs/effort values aligned with the profile and official guidance; unrelated topology and safety constraints stay unchanged.
4. Focused tests and the active-policy validator enforce the new profile path/model family. Stale-reference checks are scoped to maintained policy/configuration, while the frozen evaluation protocol/tests and historical design artifacts remain untouched.
5. `npm run check` passes; the final diff is reviewed against this contract; a PR is created from a clean branch based on current `origin/main`.

## Risks and constraints
- This changes routing recommendations and executable Codex presets. Preserve task-fit and use xhigh selectively rather than imposing maximum effort on every task.
- The requested Luna+xhigh route has not been verified in this Pi runtime; do not make it a required implementation/reviewer route without a user decision or direct evidence.
- Keep a GPT-5.6 fallback only when useful and clearly identified as a fallback; do not imply GPT-5.6 is the active default.
- Pre-existing edits exist on the caller's `main` worktree. Work only in the isolated feature worktree based on `origin/main`; do not stage or alter those edits.
- Use one implementation writer for the coupled profile/config/test cluster; run a separate read-only reviewer after parent validation.

## Implementation checklist
- [ ] Rename/replace the maintained profile as `profiles/gpt-6.md` and document model/effort/topology, conditional Luna xhigh, fallback and route verification.
- [ ] Update active references, Codex config/agent TOMLs, package metadata, run template, the fictional controlled demo, legacy active-policy pointer, and PR checklist.
- [ ] Update focused assertions and policy validation for the new active profile without changing frozen evaluation assertions.
- [ ] Run `npm run check`, inspect active GPT-5.6 references and the full diff; preserve frozen evaluation and historical design material.
- [ ] Obtain independent review, resolve findings, commit/push and open a PR.

## Validation plan
- `npm run check`
- Parse `package.json`, `templates/run.json`, and JSON fixtures with Node; validate TOML files with an available TOML parser if installed, otherwise manually inspect their restricted syntax.
- Search active files for stale GPT-5.6 paths/IDs while excluding historical `docs/superpowers/**` material.
- Review full diff and PR metadata.

## Planned Pi primitives and routing
- Parent: scope, integration, validation, review synthesis, commit, PR.
- Implementer: `worker`, `openai-codex/gpt-6-luna`, high, explicit user-approved route; owns all implementation files.
- QA: fresh-context `reviewer`, `openai-codex/gpt-6-sol`, high, explicit user-approved route; read-only.
- Artifacts: this spec, `run.json`, and `notes.md`; no durable goal (bounded PR task).
- Approval: user explicitly asked to analyze changes and create a PR, authorizing end-to-end work within the scope above.

## Route decision
The user approved GPT-6 Luna **High** for implementation and GPT-6 Sol **High** for review. The run used those explicit routes. The Codex model catalog confirms Luna supports up to Max, including xhigh; effort remains client-specific. The prior Pi request was for Sol xhigh and resolved to High, so this run used High for both implementation and review while documenting verified Codex support for Luna xhigh.