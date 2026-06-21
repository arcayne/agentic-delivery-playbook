# Run notes: broad-ticket decomposition hardening

## Timeline

- 2026-06-21 21:31 — User approved hardening the playbook after investigating the Nuglet PostHog run.
- 2026-06-21 21:33 — User refined the policy: each planner should make the subagent tree map for its slice to preserve recursive/fractal delivery.
- 2026-06-21 21:45 — Implemented policy/docs/template updates and synced the installed Pi skill.

## Process weight

- Mode: full
- Rationale: This changes public workflow policy for the playbook/adapters.
- Escalation signal: public contract/workflow behavior.

## Approval

- Status: approved
- Evidence: User said "lets do it" after the proposed patch direction and approved the recursive planner-tree refinement in chat.

## Implementation summary

Changed policy/docs/templates to make broad Full-mode decomposition a hard gate before implementation workers write when work spans multiple packages/services, explicit rollout slices, or independent acceptance clusters.

Key changes:

- Broad Full-mode work requires a child-task map, file ownership matrix, recursion cap, concurrency cap, conflict rule, and barrier plan.
- Whole-PRD/giant-worker implementation prompts are now recorded exceptions with context-risk mitigation and compensating validation/review.
- Recursive/fractal rule added: each planner that decomposes a still-broad slice proposes a local subtree map; the parent/orchestrator approves nested launch, recursion depth, and synthesis.
- One-writer guidance now means one writer per file or tightly coupled cluster, not one worker for the entire broad ticket.
- Installed Pi skill synced from `adapters/pi/SKILL.md`.

## Validation evidence

Passed:

```text
node -e "JSON.parse(require('fs').readFileSync('templates/run.template.json','utf8')); JSON.parse(require('fs').readFileSync('specs/20260621-2131-broad-ticket-decomposition/run.json','utf8')); console.log('json ok')"
git diff --check
node bin/agentic-delivery-playbook.js --help
rg "giant worker|whole-PRD|subtree map|recursion cap|file ownership matrix|explicit rollout" adapters docs templates README.md playbook.md CHANGELOG.md specs/20260621-2131-broad-ticket-decomposition
diff -q adapters/pi/SKILL.md /Users/dearkane/.pi/agent/skills/agentic-delivery-playbook/SKILL.md
```

## QA findings

Initial independent reviewer:

| Severity | Finding | Resolution |
| --- | --- | --- |
| medium | `adapters/pi/SKILL.md` still said normal code edits should use one writer thread. | Reworded to one writer per file/coupled cluster, with explicit ownership/worktree rules for parallel writers. |
| low | `docs/pi-native-workflow.md` still described worker as single writer. | Reworded worker lane to assigned file/cluster slice and tightened same-file writer warning. |

Follow-up reviewer: `no required fixes`.

## Fix cycles

- Count: 1
- Notes: Addressed reviewer wording findings, then reran validation and follow-up review.

## Known gaps

None.

## Closeout recommendation

Ready for user review/commit.
