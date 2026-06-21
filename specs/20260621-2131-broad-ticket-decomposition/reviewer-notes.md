## Review

- Correct: Broad Full-mode decomposition-before-write rule is present in the main adapter/doc surfaces: `adapters/pi/SKILL.md:216-235`, `adapters/codex/AGENTS.md:142-162`, `adapters/claude/workflow.md:105-127`, `docs/dynamic-workflows.md:87-141`, and `docs/model-routing.md:131-153`.
- Correct: Planner subtree/fractal guidance preserves parent/orchestrator control (`adapters/pi/SKILL.md:232-233`, `adapters/codex/AGENTS.md:162`, `docs/dynamic-workflows.md:131-135`, `docs/pi-native-workflow.md:36`).
- Correct: Small/direct work is not over-escalated (`docs/gates.md:7-15`, `docs/dynamic-workflows.md:49-59`, `adapters/claude/workflow.md:127`).
- Correct: `templates/run.template.json` parses as valid JSON; `git diff --check -- adapters docs templates` passed.
- Medium: `adapters/pi/SKILL.md:60` still says “Keep normal code edits to one writer thread,” which conflicts with the new file/cluster-scoped guidance at `adapters/pi/SKILL.md:211` and the spec requirement that one-writer guidance not imply one worker for the whole repo. Suggested fix: reword line 60 to “Keep one writer per file or tightly coupled cluster; parallel writers require explicit ownership/conflict rules or isolated worktrees.”
- Low: `docs/pi-native-workflow.md:63` still describes the worker lane as “single writer.” In context, line 29 allows several non-overlapping slice workers, so this is not blocking, but it may preserve the old whole-run phrasing. Suggested fix: reword to “writer for its assigned file/cluster slice.”
