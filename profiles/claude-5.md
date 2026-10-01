# Claude 5 routing profile

Status: maintained
Profile version: 1.1
Verified: 2026-10-01
Surfaces: Claude Code terminal CLI and desktop app (plugin `agentic-delivery-playbook`); desktop-app plugin install and loading are unverified (spike F10/F11)
Recheck trigger: any Claude 5 model, alias, effort, or Claude Code subagent/plugin change

This profile maps delivery capabilities to Claude 5.5 in Claude Code. In Claude Code it replaces the playbook's profile reference; Ultra and Codex topology do not apply. The kernel in `playbook.md` remains capability-based; model and reasoning effort are separate choices. Sources: spike notes F1-F12 (Claude Code 2.1.285) and the Claude Code plugin documentation.

## Route table

| Role | Model ID | Effort | Topology |
| --- | --- | --- | --- |
| Orchestrator (main session) | `claude-opus-5-5` | medium | main session |
| Worker (sole Controlled writer) | `claude-sonnet-5-5` | medium | `adp-worker`, one at a time |
| Reviewer | `claude-opus-5-5` | medium | `adp-reviewer`, fresh context |
| Explorer | `claude-sonnet-5-5` | low | `adp-explorer`, read-only tools |

Direct mode: the orchestrator may edit directly. Controlled mode: `adp-worker` is the sole writer for code and owned-file edits.

## Escalation

- Worker: Sonnet medium (`adp-worker`), then Sonnet high (`adp-worker-high`), then an Opus worker.
- Opus worker: invoke `adp-worker` with a per-invocation `model: opus` override. This is an alias route; the probe must confirm the observed model before closeout.
- Reviewer: Opus medium (`adp-reviewer`), then `adp-reviewer-high` (Opus high) for risky or security-sensitive work, or after repeated failures.
- Escalate only from evidence: a focused retry failed, interpretation became material, or hidden coupling appeared.

## Review independence

A different model tier is not independent review. The reviewer is read-only by instruction; Bash is available for diff and checks; this is enforced by an orchestrator before/after worktree fingerprint (index tree including untracked files, plus HEAD). Fresh context, the fingerprint, and deterministic checks provide the separation, not tool restrictions.

## Requested, configured, observed

- Requested: the route in the agent definition currently on disk, or a per-invocation `model` override.
- Configured: project or user settings intent (`model`, `effortLevel`). The optional `templates/claude-settings.template.json` sets the orchestrator; it is a reviewed manual merge, never auto-applied.
- Observed: transcript fields `message.model` and `perTurnEffort`. Run the probe command given in the `deliver` skill at closeout. Subagent metadata records `model` only when passed per invocation.
- A session can verify only its own model ID, not its effort. Check effort as configured, then confirm it as observed at closeout; otherwise record `unknown`.
- A bare, unnamespaced `adp-worker` (for example a project-local agent with the same name) is matched to the plugin definition; the probe cannot tell them apart.
- `entrypoint` comes from an environment variable. Record it, but it is not attestation of surface.

## Alias drift

Aliases such as `sonnet` and `opus` resolve to the current model and can change. Agents use full model IDs. Re-verify routes after any model release.

## Delegation limits

- One orchestration plane: no Workflow tool or agent teams.
- Subagents cannot spawn subagents, so the orchestrator is the main session. Depth: one.
- One writer at a time; writers are serialized.
- One named synthesis owner (the orchestrator).
- If a required route is unavailable, stop that lane and ask; do not silently substitute.
