# Claude Code Three-Tier Controlled Delivery

Status: direction approved in session; written design awaiting review
Date: 2026-10-11
Supersedes: the route table and delegation limits in `profiles/claude-5.md` version 1.1

## Objective

Make Claude Code desktop the maintained surface of the Agentic Delivery Playbook, and replace the single-hop Controlled route (orchestrator delegates to one worker) with a three-tier route: a Fable 5.1 orchestrator that owns the goal, an Opus 5.5 lead that plans the technical work into bounded tasks, and Sonnet 5.5 workers that implement one task each. The Controlled implementation and review steps run as one shipped Workflow script so that serialization, fix-cycle limits, the review gate, and evidence capture are deterministic instead of followed by hand across hundreds of orchestrator turns.

The kernel in `playbook.md` does not change in substance. Direct and Controlled, contract before delegation, one writer per file cluster, fresh-context review of the actual diff, and requested versus observed route evidence all stay. Only the Claude 5 profile and the Claude Code adapter change, plus a repositioning of the repository's front matter.

## Evidence that motivates the change

Collected from the local Claude Code transcripts on 2026-10-11, covering August to October 2026:

- Codex sessions fell from 538 in July to 2 in October. Pi sessions fell from 374 in September to 26 in October. Claude Code desktop sessions rose from 0 to 33 in the same period. The repository still presents itself as a Codex, ChatGPT Work, and Pi product.
- Main-session turns: 4373 on Opus 5.5, 1760 on Fable 5.1, 5 on Sonnet 5.5. Subagent turns: 3281 on Opus 5.5, 513 on Sonnet 5.5. The cheapest capable tier is almost unused, because the most-used subagent type (`general-purpose`) inherits the parent model.
- Fable main sessions run 100 to 650 turns at high or max effort with zero or near-zero delegation. When they delegate, it is to Explore and Plan agents, not to implementation workers.
- The five Controlled runs made with the current `deliver` skill are 580 to 750 assistant turns and 6 to 8 MB each. Three sessions begin with pasted context from a previous session, which is manual context carry-over.
- The current profile's delegation limits state that subagents cannot spawn subagents and forbid the Workflow tool. Current Claude Code documentation (checked 2026-10-11) allows nested subagents three levels deep by default, and the Workflow tool accepts a per-agent `model`, `effort`, `isolation`, and `agentType`. The skill's mandatory preflight stops Controlled work when the main session is not Opus 5.5, which is the opposite of the user's preferred Fable orchestrator.

## Decision summary

1. Claude Code desktop is the maintained surface. Pi, Codex, and ChatGPT Work stay maintained adapters on the GPT-6 profile but stop leading the README.
2. The Claude 5 profile moves to version 2 with a three-tier route table and permits the Workflow tool. Agent teams remain excluded because they are CLI-only.
3. Controlled mode in Claude Code runs as: inception grill, classify, contract and approval, then one shipped Workflow script with Plan, Implement, Review, and Goal-fit phases, then closeout by the orchestrator.
4. Two review gates: an Opus defect review against the contract, the actual diff, and validation evidence, followed by a fresh-context Fable goal-fit review that uses the deliverable and judges it against the intent brief.
5. The goal-fit reviewer model is configurable through the agent definition and the workflow `args`. The maintained default is Fable 5.1.
6. Headless runs (`claude -p`, Agent SDK), where the Workflow tool is unavailable, execute the same phases by hand with the same agents. There is no second lead agent.
7. Delivery is two pull requests: PR 1 ships the mechanism and its dogfood evidence; PR 2 repositions the repository.

## Non-goals

- Agent teams. They are CLI-only and teammates cannot spawn teammates. Revisit if the desktop app gains them.
- Parallel writers in worktrees. The workflow API supports `isolation: 'worktree'`, but the kernel defines no merge step. Writers stay serialized in this design.
- Changing the GPT-6 profile, the Pi adapter, or the Codex adapter beyond doc positioning.
- Changing the user's global Claude settings, or auto-applying any settings template.
- Moving the plugin root out of the repository root. The known gap about `bin/` and `legacy/` shipping in the plugin cache stays recorded.
- A general orchestrator, queue, dashboard, or hooks-based enforcement. Read-only roles stay enforced by tool allowlists plus the worktree fingerprint.
- Cost claims. The run records will show cost per completed task; the design does not promise savings.

## Route table (profile version 2)

| Role | Model ID | Effort | Agent | Topology |
| --- | --- | --- | --- | --- |
| Orchestrator | `claude-fable-5-1` (economy: `claude-opus-5-5`) | high (economy: medium) | main session | one plane |
| Lead | `claude-opus-5-5` | xhigh | `adp-lead`, read-only tools | workflow Plan phase |
| Worker | `claude-sonnet-5-5` | medium | `adp-worker` | workflow Implement phase, serialized |
| Worker escalation 1 | `claude-sonnet-5-5` | high | `adp-worker-high` | same |
| Worker escalation 2 | `claude-opus-5-5` | high | `adp-worker` with workflow `model` override | same |
| Validator | `claude-sonnet-5-5` | low | `adp-validator`, Bash and Read only | after each task and around review |
| Defect reviewer | `claude-opus-5-5` | medium (high for `risk: high`) | `adp-reviewer` / `adp-reviewer-high` | workflow Review phase, fresh context |
| Goal-fit reviewer | `claude-fable-5-1` (configurable) | high | `adp-goal-reviewer` | workflow Goal-fit phase, fresh context |
| Explorer | `claude-sonnet-5-5` | low | `adp-explorer` | ad hoc read-only lookups |

Rules:

- Direct mode is unchanged. The orchestrator edits directly.
- Preflight accepts `claude-fable-5-1` or `claude-opus-5-5` as the main session and stops on any other model. Effort is verified as configured and confirmed as observed at closeout, as today.
- Worker escalation 2 uses an explicit full model ID in the workflow call, so the alias route and its probe caveat are removed from the profile.
- Depth is two: main session, workflow agents. Workflow agents do not spawn subagents. The orchestrator is the only synthesis owner.
- One writer at a time. The Implement phase is a sequential loop.
- The orchestrator settings template changes to `{"model": "claude-fable-5-1", "effortLevel": "high"}`. `effortLevel` cannot express `max`, and the template stays a reviewed manual merge.

## Deliver skill (Claude Code adapter)

Invoked explicitly as `/agentic-delivery-playbook:deliver <task>`. Stays at most 80 lines. Steps:

1. **Inception grill.** Ask one question at a time until the orchestrator can state: the outcome, who it serves, how success is observed, what must not change, and what was already tried. Write the answers as an intent brief of at most 20 lines in the run's `specs/<run>/brief.md`. The user may skip by saying so; then the brief records `inception: skipped, risk accepted by user` and the plan pause in step 5 becomes mandatory. Direct work may skip the grill without recording anything.
2. **Classify.** Direct or Controlled, by the kernel's conditions. Inspect `git status`, repository instructions, and relevant code.
3. **Direct.** Edit, validate, report. No further steps.
4. **Controlled: preflight and contract.** Verify the main-session model against the profile. Write `contract.md` from the template, with the objective and acceptance criteria derived from the brief, exclusive file ownership per lane, non-goal files, a verification plan, and a `risk` level of `normal` or `high`. Obtain approval for unresolved product choices, authority, or material boundaries. Record the base commit.
5. **Controlled: run the workflow.** Call the Workflow tool with `scriptPath` set to `${CLAUDE_PLUGIN_ROOT}/adapters/claude-code/workflows/deliver-controlled.js` and `args` as defined below. The skill instruction is the opt-in; no keyword is needed. The script pauses after Plan by returning the plan when `args.pauseAfterPlan` is true; the orchestrator shows the task list, asks for approval if the grill was skipped or `risk` is `high`, and resumes with the run id. Otherwise the script continues without a pause.
6. **Controlled: closeout.** From the workflow's returned record, write `run.json` and `notes.md`, run the probe on the session transcript to fill observed routes, and close as accepted, partially accepted, escalated, or blocked. Accepted requires the defect review decision `accept` and the goal-fit verdict `fit`. One of the two alone is partially accepted.
7. **Headless fallback.** If the Workflow tool is unavailable, the orchestrator runs the same phases by hand: `adp-lead` for the plan, then for each task `adp-worker` followed by `adp-validator`, then `adp-reviewer`, then `adp-goal-reviewer`, applying the same limits. The run record notes `workflow: manual`.

Stop and failure rules carry over from the current skill unchanged: no repeated slice approvals after an approved end-to-end outcome; stop for new scope, an unresolved product decision, new authority, an unmet safe route, or contradictory evidence after two focused fix cycles; a timed-out or unusable lane is failed and its edits untrusted.

## Workflow script `deliver-controlled.js`

Location: `adapters/claude-code/workflows/deliver-controlled.js`, shipped in the plugin and the npm package. Plain JavaScript with a literal `meta` block naming four phases: Plan, Implement, Review, Goal-fit.

### Inputs (`args`)

```json
{
  "contractPath": "specs/<run>/contract.md",
  "briefPath": "specs/<run>/brief.md",
  "baseCommit": "<sha>",
  "risk": "normal | high",
  "pauseAfterPlan": false,
  "nonGoalFiles": ["path", "glob"],
  "lanes": [{ "id": "worker", "ownedFiles": ["path", "glob"] }],
  "goalReviewer": { "agentType": "agentic-delivery-playbook:adp-goal-reviewer", "model": "claude-fable-5-1", "effort": "high" },
  "maxFixCycles": 2,
  "resumePlan": null
}
```

`goalReviewer` defaults to the values shown when omitted. `resumePlan` carries an approved plan object when the orchestrator resumes after a pause; when present, the Plan phase is skipped.

### Phase Plan

One `adp-lead` agent (`agentType`, effort xhigh) receives the contract, the brief, the lanes, and the non-goal files, and returns a plan validated against this schema:

```text
plan = {
  tasks: [{
    id: string,
    title: string,
    ownedFiles: string[],
    instructions: string,
    dependsOn: string[],
    check: { command: string, expectedExit: number },
    acceptanceCriteria: string[]
  }],
  assumptions: string[],
  openQuestions: string[]
}
```

The script rejects the plan and returns `{ status: "blocked", reason, plan }` without any edit when: two tasks share a file; a task owns a file outside its lane's `ownedFiles`; a task touches a `nonGoalFiles` entry; `dependsOn` has a cycle or names an unknown task; or `openQuestions` is non-empty. Open questions are the lead's channel back to the user, because workflow agents cannot ask the user directly.

If `args.pauseAfterPlan` is true, the script returns `{ status: "plan-ready", plan }` and the orchestrator resumes with `resumePlan` set.

### Phase Implement

Tasks run one at a time in a topological order of `dependsOn`. For each task:

1. `adp-worker` receives the contract, the brief, the task, and the owned files, and returns `{ changedFiles, commandsRun, assumptions, gaps, stopped: boolean, stopReason }`. A `stopped: true` result marks the task blocked and ends the loop.
2. `adp-validator` runs `task.check.command` and returns `{ command, exitCode, outputExcerpt, fingerprint, head }`. The fingerprint is the temp-index `write-tree` hash used today, so untracked files are covered and gitignored files are not.
3. Pass means `exitCode === task.check.expectedExit`. On failure, the task is re-sent with the validator output: the first retry uses `adp-worker-high`, the second uses `adp-worker` with `model: 'claude-opus-5-5'` and `effort: 'high'`. After `maxFixCycles` failed retries the task is marked blocked and the loop ends.
4. The validator also confirms that `changedFiles` is a subset of the task's `ownedFiles` by inspecting `git status --porcelain` against the base commit. A file outside ownership marks the task blocked.

A null return from any agent (skipped by the user or terminated) marks the task failed, its edits untrusted, and ends the loop. The record notes which task and which agent.

### Phase Review

Skipped when any task is blocked or failed; the run returns `escalated` with the records so far.

1. `adp-validator` returns the pre-review fingerprint and `HEAD`.
2. `adp-reviewer` (or `adp-reviewer-high` when `risk` is `high`) receives the contract, the brief, the diff against `baseCommit` including untracked files, and all validation records. It returns `{ decision: "accept" | "accept-with-fixes" | "reject", findings: [{ severity, acceptanceCriterion, file, line, summary }], unprovenCriteria: string[] }`.
3. `adp-validator` returns the post-review fingerprint. A mismatch fails the gate and the run returns `escalated` with `reason: "review-gate-fingerprint"`.
4. `accept-with-fixes` sends the findings to the worker owning each affected file (same escalation ladder), re-validates affected tasks, and re-reviews. At most `maxFixCycles` review cycles; then the run returns `escalated`.
5. `reject` returns `escalated` with the findings.

### Phase Goal-fit

Runs only after `decision === "accept"`.

`adp-goal-reviewer` (model and effort from `args.goalReviewer`) receives the brief, the contract, the diff, the validation records, and the defect review result. Its instruction is to use the deliverable where possible (run the command, open the page, invoke the skill) and to judge fitness against the brief, not against the acceptance criteria. It returns `{ verdict: "fit" | "partially-fit" | "not-fit", reasons: string[], usedDeliverable: boolean, howUsed: string }`.

The reviewer is read-only by instruction with Bash available. `adp-validator` fingerprints before and after; a mismatch sets `verdict` to `invalid` and the run returns `escalated`.

### Return value

```text
{
  status: "completed" | "plan-ready" | "blocked" | "escalated",
  plan,
  tasks: [{ id, status: "passed" | "blocked" | "failed", attempts: [{ agentType, model, effort, result }], validation }],
  review: { decision, findings, unprovenCriteria, fingerprintBefore, fingerprintAfter, cycles },
  goalFit: { verdict, reasons, usedDeliverable, howUsed, fingerprintBefore, fingerprintAfter },
  requestedRoutes: [{ lane, agentType, model, effort }],
  finalHead
}
```

The orchestrator maps this onto `templates/run.json`: `tasks` to `lanes` and `validation`, `review` to `review`, `goalFit` to a new `closeout.goalFit` object, and `requestedRoutes` to each lane's `requested`. Observed routes come from the probe.

### Constraints of the script runtime

No filesystem, Node, `Date.now()`, or `Math.random()` in the script; the orchestrator passes the base commit and paths through `args`, and timestamps are added at closeout. The script uses a sequential loop, not `pipeline()`, so writers never overlap. Concurrent agents are therefore at most one, well under any plan's size guideline. Resume after a kill is `Workflow({ scriptPath, resumeFromRunId })`; completed agents return cached results.

## New and changed agents

| Agent | Model | Effort | Tools | Purpose |
| --- | --- | --- | --- | --- |
| `adp-lead` (new) | `claude-opus-5-5` | xhigh | Read, Grep, Glob, Bash | Reads contract, brief, and code; returns the plan object. Never edits. Bash for read-only inspection such as `git log` and test discovery. |
| `adp-validator` (new) | `claude-sonnet-5-5` | low | Bash, Read | Runs one given command, reports exit code and excerpt, computes the fingerprint and `HEAD`, lists changed files. Never edits. |
| `adp-goal-reviewer` (new) | `claude-fable-5-1` | high | Read, Grep, Glob, Bash | Fresh-context fitness review against the brief. Uses the deliverable. Never edits. `disallowedTools: Edit, Write, NotebookEdit`. |
| `adp-worker`, `adp-worker-high` | unchanged | | | Gains one line: return the structured result fields listed above. |
| `adp-reviewer`, `adp-reviewer-high` | unchanged | | | Gains one line: return the structured decision fields listed above. |
| `adp-explorer` | unchanged | | | |

All read-only agents carry the existing disclosure sentence: read-only by instruction, Bash available for diff and checks, enforced by the fingerprint.

## Run record changes

`templates/run.json` and `examples/controlled-run/run.json` gain:

- `brief`: `{ path, inception: "completed" | "skipped" }`
- `workflow`: `{ mode: "workflow" | "manual", runId: string | null, scriptPath }`
- `closeout.goalFit`: `{ verdict, reviewerModel, reviewerEffort, usedDeliverable }`
- lane `requested.agentType`

`schemaVersion` becomes `1.1`. The GPT-6 adapters do not use the new fields; they stay optional for the Pi and Codex routes.

## Probe changes

`lib/claude-route-probe.js` learns:

- Workflow agents appear in `subagents/agent-*.meta.json` with `agentType` of the custom agent name when one was passed, or `workflow-subagent` otherwise. Custom names resolve through the existing definition lookup. `workflow-subagent` records `requested.source: "workflow"` and `model: unknown` unless the meta carries one.
- A per-invocation `model` in the meta (the Opus worker escalation) takes precedence over the definition, as today.
- Nested transcript directories: `subagents/` under a subagent directory are walked one level, for the headless fallback where depth may be two.

Fixtures: one workflow transcript with Plan, Implement, Review, and Goal-fit agents, including one escalated worker with a per-invocation model and one `workflow-subagent` without a custom type.

## Repository repositioning (PR 2)

- `README.md`: lead with Claude Code desktop install and the three-tier route; move Codex, ChatGPT Work, and Pi to a "Other adapters" section; keep the GPT-6 route table there.
- `playbook.md`: "Use `profiles/gpt-6.md` for the maintained mapping" becomes "Use the active profile for the surface: `profiles/claude-5.md` for Claude Code, `profiles/gpt-6.md` for Codex, ChatGPT Work, and Pi." No other kernel change.
- `docs/getting-started.md`: the Controlled walkthrough uses the Claude Code route; the Pi section stays.
- `docs/adapters.md`: Claude Code row first.
- `AGENTS.md` at the root stays the Codex pointer. Add `CLAUDE.md` at the root pointing to the Claude Code adapter and the Claude 5 profile.
- `package.json`: description, keywords, and `files` gain `adapters/claude-code` and `.claude-plugin`. Version `0.4.0`. `.claude-plugin/plugin.json` version `0.4.0`.
- `CHANGELOG.md`: a `0.4.0` entry.
- `scripts/validate-active-policy.js`: add the new agents, the workflow script, and `CLAUDE.md` to the active file list, and run `node --check` on the workflow script. The script has no line budget. The 120-line budget for the profile and the 80-line budget for the skill stay.

## Acceptance criteria

PR 1 (mechanism):

- AC-1: Agents `adp-lead`, `adp-validator`, `adp-goal-reviewer` exist with the models, efforts, and tools in the table, are listed in `plugin.json`, and pass the frontmatter test.
- AC-2: `adapters/claude-code/workflows/deliver-controlled.js` passes `node --check`, its `meta` is a pure literal with the four phase titles, it contains no `Date.now`, `Math.random`, `require`, or `import`, and its plan validation helpers reject the five invalid plan shapes listed above (tested by extracting the helpers into `lib/deliver-plan-rules.js`, which the script duplicates verbatim and a test asserts the two copies match).
- AC-3: The `deliver` skill is at most 80 lines, explicit-invoke, references the brief, the workflow script path, the pause rule, the two review gates, and the manual fallback, and all `${CLAUDE_PLUGIN_ROOT}` references resolve.
- AC-4: `profiles/claude-5.md` version 2 holds the route table above, permits the Workflow tool, excludes agent teams with the CLI-only reason, states depth two, and removes the alias escalation. At most 120 lines.
- AC-5: The settings template is `{"model": "claude-fable-5-1", "effortLevel": "high"}` and the README documents it as a manual merge.
- AC-6: The probe handles workflow agents and nested directories with the new fixtures; existing fixtures still pass.
- AC-7: `templates/run.json` and the example run carry the new fields and parse.
- AC-8: `npm run check` passes.
- AC-9 (dogfood): one Controlled run on a real task in a non-playbook repository through the new skill, with `pauseAfterPlan` exercised once, recorded under `specs/<date>-three-tier-dogfood/` with `brief.md`, `contract.md`, `run.json`, the workflow return record, and the probe output showing requested equals observed for lead, worker, validator, defect reviewer, and goal-fit reviewer. The goal-fit verdict on that run must be `fit` or the PR does not merge; a `partially-fit` verdict with recorded reasons blocks merge until addressed.
- AC-10: The plugin's own change is run through the goal-fit reviewer with the intent brief from the 2026-10-11 design session, and the verdict is recorded in the dogfood directory.

PR 2 (repositioning):

- AC-11: README, getting-started, adapters doc, and the kernel's profile sentence match the repositioning section. `CLAUDE.md` exists at the root.
- AC-12: `package.json` and `plugin.json` are at `0.4.0`, `files` includes the Claude Code adapter, `npm pack --dry-run` lists the workflow script and agents, and the changelog has the entry.
- AC-13: `npm run check` passes and the active-policy validator covers the new files.

## Risks and mitigations

- **Workflow agents cannot ask the user.** Mitigated by the inception grill, the lead's `openQuestions` channel that blocks before any edit, and the plan pause for skipped grills and high-risk contracts.
- **Workflow behaviour is documented but not yet exercised here.** Mitigated by AC-9: the profile claims nothing until a probe over a real workflow run confirms the routes.
- **Sonnet medium may be too weak for some codebases.** Mitigated by the escalation ladder inside the loop and by the run records, which will show where escalation happens so task granularity can be tuned.
- **The orchestrator may still do the work itself.** The design only helps when Controlled work goes through the skill. The success measure after a month is orchestrator turns per Controlled task, visible in transcripts.
- **Plugin subagents ignore frontmatter hooks and permission modes.** Enforcement stays tool allowlists plus the fingerprint, as today, and the disclosure stays in every read-only agent.
- **Fable reviewer cost.** One fresh Fable read per Controlled run, only after a defect-review accept. Configurable through `args.goalReviewer` for users who prefer Opus.

## Open decisions

None. The goal reviewer default (Fable 5.1, configurable), the skippable grill, and the two-PR slicing were decided in session on 2026-10-11.
