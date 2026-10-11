# Claude 5 routing profile

Status: maintained
Profile version: 2
Verified: 2026-10-11 against Claude Code docs and local transcripts; desktop plugin install and the custom `agentType` recording in workflow metadata are to be confirmed by the dogfood run recorded under `specs/` (this line is updated from that run)
Surfaces: Claude Code desktop app (Code tab) and terminal CLI, plugin `agentic-delivery-playbook`
Recheck trigger: any Claude 5 model, alias, effort, Workflow tool, or Claude Code subagent/plugin change

This profile maps delivery capabilities to Claude 5 models in Claude Code. It replaces the playbook's profile reference here; Ultra and Codex topology do not apply. The kernel in `playbook.md` stays capability-based; model and reasoning effort are separate choices. Sources: spike notes (Claude Code 2.1.285), Claude Code docs checked 2026-10-11, and local transcripts.

## Route table

| Role | Model ID | Effort | Agent | Topology |
| --- | --- | --- | --- | --- |
| Orchestrator | `claude-fable-5-1` (economy: `claude-opus-5-5`) | high (economy: medium) | main session | one plane |
| Lead | `claude-opus-5-5` | xhigh | `adp-lead`, read-only | workflow Plan phase |
| Worker, attempt 1 | `claude-sonnet-5-5` | medium | `adp-worker` | workflow Implement phase, serialized |
| Worker, retry 1 | `claude-sonnet-5-5` | high | `adp-worker-high` | same |
| Worker, retry 2 | `claude-opus-5-5` | high | `adp-worker` with explicit workflow `model` and `effort` | same |
| Validator | `claude-sonnet-5-5` | low | `adp-validator`, Bash and Read | around every task and review |
| Defect reviewer | `claude-opus-5-5` | medium (high via `adp-reviewer-high` when risk is high) | `adp-reviewer` | workflow Review phase, fresh context |
| Goal-fit reviewer | `claude-fable-5-1` (configurable in workflow `args`) | high | `adp-goal-reviewer` | workflow Goal-fit phase, fresh context |
| Explorer | `claude-sonnet-5-5` | low | `adp-explorer`, read-only tools | ad hoc lookups |

Direct mode: the orchestrator edits directly. Controlled mode: the shipped Workflow script `adapters/claude-code/workflows/deliver-controlled.js` runs Plan, Implement, Review, and Goal-fit; the orchestrator writes only the brief, the contract, and the run record, and re-runs the contract's verification plan itself at closeout.

## Escalation

- Worker ladder inside the workflow: Sonnet medium, then Sonnet high, then Opus high. Three attempts per task, counting review fixes. A task that fails its check at attempt three stops the run as escalated.
- Review: `adp-reviewer` at medium; `adp-reviewer-high` when the contract's risk line is `high`. At most two accept-with-fixes cycles before the run escalates.
- Goal-fit: no automatic fix loop. `partially-fit` closes as partially accepted with the reasons as known gaps; `not-fit` escalates to the user.
- Escalate only from evidence: a failed check, a reviewer finding, a fingerprint mismatch, or a stop condition. Higher effort is not an unlimited retry loop.

## Review independence

A different model tier is not independent review. Lead, validator, both reviewers, and the explorer are read-only by instruction; Bash is available for diff and checks; enforcement is a before/after worktree fingerprint (temp-index tree including untracked files, plus `HEAD`) taken by the validator around every read-only phase. Workers never commit; `HEAD` must equal the base commit at every fingerprint. Fresh context, the fingerprint, deterministic checks, and the orchestrator's own closeout re-run provide the separation, not tool restrictions.

## Requested, configured, observed

- Requested: the route the workflow passed on each call, recorded in the workflow result's `requestedRoutes`; in manual mode, the agent definition or the per-invocation override the orchestrator used.
- Configured: project or user settings intent (`model`, `effortLevel`). The optional `templates/claude-settings.template.json` sets the orchestrator; it is a reviewed manual merge, never auto-applied.
- Observed: transcript fields `message.model` and `perTurnEffort`, read by the probe for the main session, top-level subagents, and workflow agents under `subagents/workflows/<runId>/`. Workflow metadata carries the label as `description` and the phase as `workflowPhase`; it carries `model` only when passed per invocation and never carries `effort`.
- Closeout applies the match rule: the multiset of (agent type, model, effort) over all workflow runs' requested routes equals the multiset observed for plugin agents other than `adp-explorer`. Observed effort `unknown` with matching type and model, and orphans from a crash resume, are recorded gaps; any other difference closes the run as escalated.
- A session can verify only its own model ID, not its effort. Check effort as configured, confirm it as observed at closeout, otherwise record `unknown`.
- `entrypoint` comes from an environment variable. Record it, but it is not attestation of surface.

## Alias drift

Aliases such as `sonnet`, `opus`, and `fable` resolve to the current model and can change. Agents and the workflow use full model IDs. Re-verify routes after any model release.

## Delegation limits

- One orchestration plane: the main session. The Workflow tool is its scheduler, not a second plane. Depth: one. Workflow agents do not spawn subagents.
- Agent teams are excluded: they are CLI-only and teammates cannot spawn teammates.
- One writer at a time; the workflow's Implement phase is a sequential loop. Parallel worktree workers are out of scope until the kernel defines a merge step.
- One named synthesis owner: the orchestrator.
- During a Controlled run the orchestrator does not invoke plugin lead, worker, validator, reviewer, or goal-reviewer agents outside the workflow. If a required route is unavailable, stop that lane and ask; do not silently substitute.
- Headless runs (`claude -p`, Agent SDK) have no Workflow tool: the orchestrator runs the same phases by hand with the same agents and records `workflow.mode: manual`.

## Known gaps

- A review fix to one task is validated only by that task's check inside the workflow; dependent tasks are covered by the next review cycle and the orchestrator's closeout re-run.
- The fingerprint does not cover gitignored files.
- Plugin subagents ignore frontmatter hooks and permission modes; read-only roles rely on tool allowlists plus the fingerprint.
- The plugin root is the repository root, so `bin/`, `legacy/`, `specs/`, and `.pi/` ship in the plugin cache.
- A bare, unnamespaced `adp-worker` (for example a project-local agent with the same name) is matched to the plugin definition; the probe cannot tell them apart.
