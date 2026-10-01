---
name: deliver
description: Apply the Agentic Delivery Playbook in Claude Code. Classify work as Direct or Controlled, route Controlled work through a Sonnet worker and a fresh-context Opus reviewer, and close from evidence.
disable-model-invocation: true
---

# Agentic Delivery Playbook for Claude Code

Invoked explicitly as `/agentic-delivery-playbook:deliver <task>`.

## Canonical policy

- `${CLAUDE_PLUGIN_ROOT}/playbook.md` stays authoritative for process, stop, and failure rules.
- `${CLAUDE_PLUGIN_ROOT}/profiles/claude-5.md` replaces the playbook's profile reference here; Ultra and Codex topology do not apply.
- Contract: `${CLAUDE_PLUGIN_ROOT}/templates/contract.md`. Settings template: `${CLAUDE_PLUGIN_ROOT}/templates/claude-settings.template.json`.
- Keep two process modes only: Direct and Controlled.

## Classify

Inspect `git status`, repository instructions, and the relevant code. Choose Direct or Controlled from consequence, ambiguity, reversibility, authority, coupling, and verification quality. Switch to Controlled if a material risk appears.

## Direct

The orchestrator (this session) may edit directly. State the change, make the smallest correct edit, run relevant deterministic validation, and report changed files, results, assumptions, and gaps.

## Controlled

1. Preflight (mandatory). Verify your own model ID (system prompt) against the orchestrator row in the profile. You cannot verify effort: check it as configured in `.claude/settings.json`, confirm it as observed at closeout, otherwise record `unknown` or ask. On mismatch, stop and offer the settings template as a reviewed manual merge, never auto-applied.
2. Contract: write it from the contract template with exclusive file ownership and a verification plan. Get approval for unresolved product choices, authority, or material boundaries. Delegated runs keep a durable contract and run record under `specs/` (`contract.md` plus notes or `run.json`).
3. Implement: delegate every code and owned-file edit to `adp-worker`, the sole writer; the orchestrator writes only the contract and the run record. One worker at a time (serialized writers). Pass the contract and owned files.
4. Validate: the orchestrator runs the contract's checks itself and records command, exit status, and result per acceptance criterion. Worker narration is not evidence.
5. Review: fingerprint the worktree before and after review: `T=$(mktemp) && cp "$(git rev-parse --git-path index)" "$T" && GIT_INDEX_FILE="$T" git add -A && GIT_INDEX_FILE="$T" git write-tree; rm -f "$T"`, plus `git rev-parse HEAD`. Gitignored files are not covered. Run `adp-reviewer` in fresh context with the contract, the actual diff (including untracked files), and the validation evidence. A fingerprint mismatch fails the review gate. The reviewer is read-only by instruction; Bash is available for diff and checks.
6. Fix: send findings to the worker, then revalidate and re-review.
7. Closeout: accepted, partially accepted, escalated, or blocked. Run `node "${CLAUDE_PLUGIN_ROOT}/bin/agentic-delivery-playbook.js" probe claude <session.jsonl>` where the transcript is `~/.claude/projects/<cwd with / replaced by ->/<session-id>.jsonl`. Record observed worker and reviewer routes; say `unknown` when not exposed.

## Stop and failure rules

- With an approved end-to-end outcome, do not stop for repeated slice approvals. Stop only for new scope, an unresolved product decision, new authority, an unmet safe route, or contradictory evidence after two focused fix cycles.
- A timed-out or unusable lane is failed and its edits are untrusted: retry once narrower, replace the route, or record an explicit orchestrator takeover.

## Routing and delegation

- One orchestration plane. Do not use the Workflow tool or agent teams. Depth one: subagents cannot spawn subagents, so orchestrate from this main session.
- Use `adp-explorer` for independent read-only lookups. Prefer one agent for tightly coupled work.
- Escalate only from evidence: `adp-worker`, then `adp-worker-high`, then `adp-worker` with a per-invocation `model: opus` override (an alias route; the probe must confirm it). Use `adp-reviewer-high` for risky or security-sensitive work or repeated failures.
- A different model tier is not independent review. If a required route is unavailable, stop that lane and ask.

## Closeout rules

Report changed files, acceptance results, validation evidence, assumptions, known gaps, and escalation state. Never claim a check ran, a route was observed, or a reviewer was independent without evidence.
