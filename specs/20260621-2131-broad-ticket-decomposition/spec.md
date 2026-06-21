# Spec: Broad-ticket decomposition hardening

## Objective

Tighten the Agentic Delivery Playbook so broad Full-mode implementation work with multiple packages, explicit rollout slices, or multiple independent feature lanes is decomposed before implementation instead of being handed to one giant worker prompt.

## Non-goals

- Do not change CLI installer behavior.
- Do not mandate dynamic workflows for small/direct work.
- Do not require parallel writers when slices are unsafe or sequential.
- Do not add provider/model-specific requirements beyond existing truthful-routing policy.

## Current state

The Pi skill and docs already mention broad-ticket planning, parallel slicing, file ownership, and barriers. In practice, the language still permits a pattern where scouts run in parallel and then one worker receives the whole approved PRD/spec. That can exceed context limits and weakens the intended planner/tree shape.

## Proposed approach

Add a stronger broad implementation decomposition gate across the Pi skill, Codex adapter, core docs, README, and templates:

- Trigger decomposition when Full-mode work spans multiple packages/services, has explicit rollout slices, touches multiple independent surfaces, or would require one broad worker prompt.
- Require a child-task map and file ownership/conflict plan before any implementation worker writes.
- Add recursive/fractal planner guidance: every planner that decomposes a still-broad slice proposes its own subtree map, while the parent/orchestrator controls launch approval, recursion caps, and synthesis.
- Clarify that "one writer thread" means one writer per file/coupled cluster, not one worker for the whole repo.
- Require shared foundation/schema/config/lockfile lanes to be single-owner or serialized before parallel app/service slices.
- Treat a single giant worker prompt as an exception that needs an explicit recorded rationale.

## Contracts and interfaces

Changed public docs/skill policy only. No runtime CLI contract changes.

## Safety constraints

- Keep the value-gate stance: no extra ceremony for direct/small work.
- Preserve parent ownership of scope, synthesis, global validation, and final evidence.
- Do not encourage unsafe parallel edits to shared files.

## Acceptance criteria

- [ ] Pi skill has an explicit decomposition gate before implementation for broad Full-mode work.
- [ ] Codex adapter mirrors the stricter broad-ticket planning rule.
- [ ] Dynamic workflow/model-routing/Pi-native docs explain the no-giant-worker rule and safe slice shape.
- [ ] README and core playbook summarize the new rule.
- [ ] Run/template guidance can record decomposition triggers, planner subtree maps, recursion caps, and single-worker exceptions.
- [ ] Changelog records the policy hardening.

## Verification plan

```text
git diff --check
node bin/agentic-delivery-playbook.js --help
rg "giant worker|decomposition gate|single-owner|explicit rollout" adapters docs templates README.md playbook.md CHANGELOG.md
```

## Implementation checklist

- [ ] Update `adapters/pi/SKILL.md`.
- [ ] Update `adapters/codex/AGENTS.md`.
- [ ] Update workflow/routing docs.
- [ ] Update README/playbook summary.
- [ ] Update run template and changelog.
- [ ] Sync installed Pi skill after repo update.
- [ ] Run validation and independent review.

## QA checklist

- [ ] Compare diff against every acceptance criterion.
- [ ] Confirm small/direct work is not over-escalated.
- [ ] Confirm one-writer guidance is file/cluster-scoped.
- [ ] Confirm shared-file serialization is explicit.
- [ ] Confirm no model-specific claim was added.

## Open questions

None. User approved the change with "lets do it".
