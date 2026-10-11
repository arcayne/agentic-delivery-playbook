# Claude Code Three-Tier Controlled Delivery

Status: direction approved in session; written design under review
Date: 2026-10-11
Supersedes: the route table and delegation limits in `profiles/claude-5.md` version 1.1

## Objective

Make Claude Code desktop the maintained surface of the Agentic Delivery Playbook, and replace the single-hop Controlled route (orchestrator delegates to one worker) with a three-tier route: a Fable 5.1 orchestrator that owns the goal, an Opus 5.5 lead that plans the technical work into bounded tasks, and Sonnet 5.5 workers that implement one task each. The Controlled implementation and review steps run as one shipped Workflow script so that serialization, fix-cycle limits, the review gate, and evidence capture are deterministic instead of followed by hand across hundreds of orchestrator turns.

The kernel in `playbook.md` does not change in substance. Direct and Controlled, contract before delegation, one writer per file cluster, fresh-context review of the actual diff, depth one, one orchestration plane, and requested versus observed route evidence all stay. Only the Claude 5 profile and the Claude Code adapter change, plus a repositioning of the repository's front matter.

## Evidence that motivates the change

Collected from the local Claude Code transcripts on 2026-10-11, covering August to October 2026:

- Codex sessions fell from 538 in July to 2 in October. Pi sessions fell from 374 in September to 26 in October. Claude Code desktop sessions rose from 0 to 33 in the same period. The repository still presents itself as a Codex, ChatGPT Work, and Pi product.
- Main-session turns: 4373 on Opus 5.5, 1760 on Fable 5.1, 5 on Sonnet 5.5. Subagent turns: 3281 on Opus 5.5, 513 on Sonnet 5.5. The cheapest capable tier is almost unused, because the most-used subagent type (`general-purpose`) inherits the parent model.
- Fable main sessions run 100 to 650 turns at high or max effort with zero or near-zero delegation. When they delegate, it is to Explore and Plan agents, not to implementation workers.
- The five Controlled runs made with the current `deliver` skill are 580 to 750 assistant turns and 6 to 8 MB each. Three sessions begin with pasted context from a previous session, which is manual context carry-over.
- The current profile forbids the Workflow tool and the skill's mandatory preflight stops Controlled work when the main session is not Opus 5.5, which is the opposite of the user's preferred Fable orchestrator. Current Claude Code documentation (checked 2026-10-11) gives the Workflow tool a per-agent `model`, `effort`, `isolation`, and `agentType`, and makes a skill instruction a valid opt-in.

## Decision summary

1. Claude Code desktop is the maintained surface. Pi, Codex, and ChatGPT Work stay maintained adapters on the GPT-6 profile but stop leading the README.
2. The Claude 5 profile moves to version 2 with a three-tier route table and permits the Workflow tool as the scheduler of the single orchestration plane. Agent teams remain excluded because they are CLI-only.
3. Controlled mode in Claude Code runs as: inception grill, classify, contract and approval, then one shipped Workflow script with Plan, Implement, Review, and Goal-fit phases, then closeout by the orchestrator, who re-runs the contract's verification plan itself.
4. Two review gates: an Opus defect review against the contract, the actual diff, and validation evidence, followed by a fresh-context Fable goal-fit review that uses the deliverable within stated bounds and judges it against the intent brief.
5. The goal-fit reviewer model is configurable through the workflow `args`. The maintained default is Fable 5.1.
6. Headless runs (`claude -p`, Agent SDK), where the Workflow tool is unavailable, execute the same phases by hand with the same agents. There is no second lead agent.
7. Delivery is two pull requests: PR 1 ships the mechanism, bumps the version to 0.4.0, and records dogfood evidence; PR 2 repositions the repository.

## Non-goals

- Agent teams. They are CLI-only and teammates cannot spawn teammates. Revisit if the desktop app gains them.
- Parallel writers in worktrees. The workflow API supports `isolation: 'worktree'`, but the kernel defines no merge step. Writers stay serialized in this design.
- Changing the GPT-6 profile, the Pi adapter, or the Codex adapter beyond doc positioning.
- Changing the user's global Claude settings, or auto-applying any settings template.
- Moving the plugin root out of the repository root. The known gap about `bin/` and `legacy/` shipping in the plugin cache stays recorded.
- A general orchestrator, queue, dashboard, or hooks-based enforcement. Read-only roles stay enforced by tool allowlists plus the worktree fingerprint.
- An automatic fix loop on goal-fit verdicts. Fitness is a product judgment, so a non-fit verdict goes back to the user.
- Cost claims. The run records will show cost per completed task; the design does not promise savings.

## Route table (profile version 2)

| Role | Model ID | Effort | Agent | Topology |
| --- | --- | --- | --- | --- |
| Orchestrator | `claude-fable-5-1` (economy: `claude-opus-5-5`) | high (economy: medium) | main session | one plane, depth one |
| Lead | `claude-opus-5-5` | xhigh | `adp-lead`, read-only tools | workflow Plan phase |
| Worker, attempt 1 | `claude-sonnet-5-5` | medium | `adp-worker` | workflow Implement phase, serialized |
| Worker, retry 1 | `claude-sonnet-5-5` | high | `adp-worker-high` | same |
| Worker, retry 2 | `claude-opus-5-5` | high | `adp-worker` with workflow `model` and `effort` overrides | same |
| Validator | `claude-sonnet-5-5` | low | `adp-validator`, Bash and Read only | before and after each task, around each review |
| Defect reviewer | `claude-opus-5-5` | medium (`adp-reviewer-high` at high for `risk: high`) | `adp-reviewer` / `adp-reviewer-high` | workflow Review phase, fresh context |
| Goal-fit reviewer | `claude-fable-5-1` (configurable) | high | `adp-goal-reviewer` | workflow Goal-fit phase, fresh context |
| Explorer | `claude-sonnet-5-5` | low | `adp-explorer` | ad hoc read-only lookups |

Rules:

- Direct mode is unchanged. The orchestrator edits directly.
- Preflight accepts `claude-fable-5-1` or `claude-opus-5-5` as the main session and stops on any other model. Effort is verified as configured and confirmed as observed at closeout, as today.
- Worker retry 2 uses an explicit full model ID in the workflow call. The alias escalation route is removed. The alias-drift section stays, because per-invocation aliases and user settings still exist.
- Depth is one. The main session is the only spawner; the Workflow tool schedules its agents. Workflow agents do not spawn subagents. The orchestrator is the only synthesis owner.
- One writer at a time. The Implement phase is a sequential loop.
- Workers never commit. `HEAD` stays at the base commit for the whole run; the validator checks this at every fingerprint.
- Fix cycles are fixed at two, the kernel limit, for both validation retries and review fix cycles. This is not configurable.
- The orchestrator settings template changes to `{"model": "claude-fable-5-1", "effortLevel": "high"}`. `effortLevel` cannot express `max`, and the template stays a reviewed manual merge.

## Deliver skill (Claude Code adapter)

Invoked explicitly as `/agentic-delivery-playbook:deliver <task>`. Stays at most 80 lines. The `args` example, the run-record mapping table, and the fingerprint command move to `adapters/claude-code/README.md` under a "Reference" heading; the skill cites them. Steps:

1. **Inception grill.** Ask one question at a time until the orchestrator can state: the outcome, who it serves, how success is observed, what must not change, and what was already tried. Write the answers as an intent brief of at most 20 lines in `specs/<run>/brief.md` under those five headings. The user may skip by saying so; then the brief records `inception: skipped, risk accepted by user`. Direct work may skip the grill without recording anything.
2. **Classify.** Direct or Controlled, by the kernel's conditions. Inspect `git status`, repository instructions, and relevant code.
3. **Direct.** Edit, validate, report. No further steps.
4. **Controlled: preflight and contract.** Verify the main-session model against the profile. Write `contract.md` from the template, with the objective and acceptance criteria derived from the brief, exclusive file ownership per lane (concrete paths or `*`/`**` globs), non-goal files, a verification plan, and a `risk` line of `normal` or `high`. Obtain approval for unresolved product choices, authority, or material boundaries. Record the base commit. Workers do not commit, so the contract's authority line says so.
5. **Controlled: plan.** Call the Workflow tool with `scriptPath` set to `${CLAUDE_PLUGIN_ROOT}/adapters/claude-code/workflows/deliver-controlled.js` and `args` as defined below, setting `pauseAfterPlan` to `true` when the grill was skipped or `risk` is `high`, otherwise `false`. The skill instruction is the opt-in; no keyword is needed. On `plan-ready`, show the task list to the user, obtain approval, then start a second run with `resumePlan` set to the approved plan and `pauseAfterPlan` `false`. On `blocked` with `openQuestions`, ask the user, append the answers to the brief under a heading "Answers", and start a new run from Plan.
6. **Controlled: closeout.** From the workflow's returned record, write `run.json` and `notes.md` using the mapping table. Re-run every command in the contract's verification plan yourself and record command, exit status, and result; the workflow's validator records are gate evidence inside the run, the orchestrator's own run is the closeout evidence. Run the probe on the session transcript to fill observed routes. Close by the closeout table below.
7. **Headless fallback.** If the Workflow tool is unavailable, run the same phases by hand: `adp-validator`, `adp-lead`, `adp-validator` for the plan, apply the plan rules yourself, then for each task `adp-validator`, `adp-worker`, `adp-validator`, then the review and goal-fit phases with their fingerprints, applying the same gates and limits, and build `requestedRoutes` by hand. The run record notes `workflow.mode: manual`.

Stop and failure rules carry over from the current skill unchanged: no repeated slice approvals after an approved end-to-end outcome; stop for new scope, an unresolved product decision, new authority, an unmet safe route, or contradictory evidence after two focused fix cycles; a timed-out or unusable lane is failed and its edits untrusted.

## Workflow script `deliver-controlled.js`

Location: `adapters/claude-code/workflows/deliver-controlled.js`, shipped in the plugin and the npm package. Plain JavaScript with a literal `meta` block naming four phases: Plan, Implement, Review, Goal-fit. The script cannot read files; it passes paths and the base commit to agents, and agents read the contract, the brief, and the diff themselves. Every `agent()` call passes the namespaced `agentType` (`agentic-delivery-playbook:adp-…`) and a `label` from the label scheme below.

### Inputs (`args`)

```json
{
  "contractPath": "specs/<run>/contract.md",
  "briefPath": "specs/<run>/brief.md",
  "baseCommit": "<sha>",
  "risk": "normal",
  "pauseAfterPlan": false,
  "nonGoalFiles": ["README.md", "legacy/**"],
  "lanes": [{ "id": "worker", "ownedFiles": ["src/**", "test/x.test.js"] }],
  "goalReviewer": { "agentType": "agentic-delivery-playbook:adp-goal-reviewer", "model": "claude-fable-5-1", "effort": "high" },
  "resumePlan": null
}
```

`goalReviewer` defaults to the values shown when omitted. `resumePlan` carries an approved plan object; when present, the Plan phase is skipped and the plan is re-validated by the same rules, because the user may have edited it. `resumeFromRunId` is reserved for crash recovery of an identical invocation and is not used for the pause.

### Path matching

Task `ownedFiles` are concrete repository-relative paths, no globs. Lane `ownedFiles` and `nonGoalFiles` are patterns where `*` matches within one path segment and `**` matches zero or more segments; anything else is literal. A path matches a pattern list when it matches any entry. The matcher is implemented in the script's helper block, since the script cannot import.

### Phase Plan

One `adp-lead` agent (effort xhigh, label `plan`) receives the contract path, the brief path, the base commit, the lanes, and the non-goal files, and returns a plan validated against this schema:

```text
plan = {
  tasks: [{
    id: string,
    lane: string,
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

Plan rules. The script returns `{ status: "blocked", reason: "plan-rule-<n>", plan }` without any edit when any rule fails:

- R1: `tasks` is non-empty and task ids are unique.
- R2: every task has non-empty `ownedFiles`, a non-empty `check.command`, and an integer `check.expectedExit`.
- R3: every `lane` names an `args.lanes[].id`.
- R4: every task path matches its lane's `ownedFiles` patterns.
- R5: no task path matches `nonGoalFiles`.
- R6: no path appears in two tasks.
- R7: every `dependsOn` entry names an existing task id, and the dependency graph has no cycle.
- R8: `openQuestions` is empty. Open questions are the lead's channel back to the user, because workflow agents cannot ask the user directly.

The Plan phase is fingerprinted like every other read-only phase: `adp-validator` (label `plan-pre`) runs before the lead and `adp-validator` (label `plan-post`) after it. A mismatch returns `{ status: "blocked", reason: "plan-gate-fingerprint" }`. Both calls appear in `requestedRoutes`. When `resumePlan` is supplied the lead does not run and these two calls are skipped.

If `args.pauseAfterPlan` is true, the script returns `{ status: "plan-ready", plan }` after validation.

### Validator file states

Every `adp-validator` call returns `fileStates`: a map from path to content hash for every path listed by `git status --porcelain=v1 -uall -z --no-renames` against the index and working tree, with the hash from `git hash-object <path>` and the literal `deleted` for a deleted path. `-uall` lists files inside new directories individually and `--no-renames` keeps every entry a single path. Two validator results differ at a path when the path is present in only one map or the hashes differ. "Changed paths between pre and post" below always means this comparison.

The validator has two modes. In fingerprint-only mode (no command given) it returns `{ fileStates, fingerprint, head }`. In check mode it captures `fileStates`, `fingerprint`, and `head` first, then runs the one command it is given, and returns them with `{ command, exitCode, outputExcerpt }`. Capturing before the check means files a check writes (coverage, snapshots, caches) do not trip the ownership gate. Check commands and goal-fit commands must not modify tracked files or create untracked files that `git status` reports; if they do, the following fingerprint catches it and the run escalates.

The reviewer's and the orchestrator's `diffSha256` is the SHA-256 of: the output of `git diff <baseCommit>`, followed by, for each path from `git ls-files --others --exclude-standard -z` in that order, the path, a NUL byte, and the file content. The orchestrator computes its copy before re-running the verification plan at closeout.

### Phase Implement

Tasks run one at a time in a topological order of `dependsOn`. For task `t` and attempt `a` (1 to 3):

1. `adp-validator` (label `t<id>-pre-<a>`) returns `{ fileStates, fingerprint, head }`, where `head` is `git rev-parse HEAD`.
2. The worker for attempt `a` (label `t<id>-implement-<a>`; attempt 1 `adp-worker`, attempt 2 `adp-worker-high`, attempt 3 `adp-worker` with `model: 'claude-opus-5-5'` and `effort: 'high'`) receives the contract path, the brief path, the task, and on retries the previous validator output and, for review fixes, the findings. It returns `{ changedFiles, commandsRun, assumptions, gaps, stopped, stopReason }`. `stopped: true` marks the task `blocked` with `reason: "worker-stopped"` and stops the run.
3. `adp-validator` (label `t<id>-validate-<a>`) runs `task.check.command` and returns `{ command, exitCode, outputExcerpt, fileStates, fingerprint, head }`.
4. Gates, in order: `head` must equal `baseCommit` in both validator results, else the task is `blocked` with `reason: "head-moved"` and the run stops; every path changed between the pre and post `fileStates` must be in `task.ownedFiles`, else `blocked` with `reason: "ownership"` and the run stops; `exitCode` must equal `task.check.expectedExit`, else the attempt failed.
5. A failed attempt 1 or 2 proceeds to the next attempt. A failed attempt 3 marks the task `blocked` with `reason: "fix-cycles-exhausted"` and stops the run.

"Stops the run" means no further task runs and the script returns `status: "escalated"` with the task's `reason`. The run status `blocked` is produced only by the Plan phase.

A null return from any agent in any phase (skipped by the user or terminated) stops the run with `status: "escalated"` and `reason: "agent-null:<label>"`. In Implement the task is also marked `failed` and its edits untrusted.

### Phase Review

Skipped when any task is blocked or failed; the run returns `escalated` with the records so far.

For review cycle `c` (1 to 3):

1. `adp-validator` (label `review-pre-<c>`) returns the fingerprint, `head`, and `fileStates`.
2. The defect reviewer (label `review-<c>`; `adp-reviewer`, or `adp-reviewer-high` when `risk` is `high`) receives the contract path, the brief path, the base commit, and all validation records so far, computes the diff against the base commit including untracked files itself, and returns `{ decision, findings: [{ severity, acceptanceCriterion, file, line, summary }], unprovenCriteria, diffSha256 }` with `decision` one of `accept`, `accept-with-fixes`, `reject`, and `diffSha256` computed as defined under "Validator file states". The orchestrator recomputes the same hash at closeout before re-running the verification plan; `review.diffReviewed` is `true` only when they match.
3. `adp-validator` (label `review-post-<c>`) returns the fingerprint and `head`. A mismatch with `review-pre-<c>` returns `escalated` with `reason: "review-gate-fingerprint"`.
4. `reject` returns `escalated` with the findings.
5. `accept-with-fixes` on cycle 3 returns `escalated` with `reason: "review-cycles-exhausted"`. Otherwise each finding is grouped by the task owning its file; a finding on a file no task owns returns `escalated` with `reason: "finding-outside-ownership"`. Each affected task is re-run through steps 1 to 5 of Implement with the findings included, starting at the rung after that task's last attempt and never going down, with the same gates and the same attempt-3 ceiling; a task already at attempt 3 returns `escalated` with `reason: "fix-cycles-exhausted"`. Then the next review cycle starts.
6. `accept` proceeds to Goal-fit.

Known gap: a review fix to one task is validated only by that task's check. A dependent task's check is not re-run inside the workflow; the next review cycle and the orchestrator's closeout re-run of the verification plan cover it. This is recorded in the profile as a known gap.

### Phase Goal-fit

Runs only after `decision === "accept"`.

1. `adp-validator` (label `goal-fit-pre`) returns the fingerprint and `head`.
2. `adp-goal-reviewer` (label `goal-fit`; `agentType`, `model`, and `effort` from `args.goalReviewer`) receives the brief path, the contract path, the base commit, the validation records, and the defect review result. It judges fitness against the brief, not against the acceptance criteria. It may run only: commands listed in the contract's verification plan, commands named in the brief's "how success is observed" section, and read-only inspection. Anything that would reach the network, a database, or an external service is reported as "would need to run X", not run. It returns `{ verdict, reasons, usedDeliverable, howUsed }` with `verdict` one of `fit`, `partially-fit`, `not-fit`.
3. `adp-validator` (label `goal-fit-post`) returns the fingerprint and `head`. A mismatch sets `verdict` to `invalid` and the run returns `escalated` with `reason: "goal-fit-gate-fingerprint"`.

### Return value

```text
{
  status: "completed" | "plan-ready" | "blocked" | "escalated",
  reason: string | null,
  plan,
  tasks: [{
    id, status: "passed" | "blocked" | "failed",
    attempts: [{ label, agentType, model, effort, worker, preValidation, postValidation, passed }]
  }],
  review: { cycles: [{ label, agentType, model, effort, decision, findings, unprovenCriteria, fingerprintBefore, fingerprintAfter }], finalDecision },
  goalFit: { label, agentType, model, effort, verdict: "fit" | "partially-fit" | "not-fit" | "invalid", reasons, usedDeliverable, howUsed, fingerprintBefore, fingerprintAfter } | null,
  requestedRoutes: [{ label, agentType, model, effort }]
}
```

`requestedRoutes` lists every `agent()` call in order with the model and effort the script requested. For agents whose `model` or `effort` the script did not override, the script records the values from a constant table of agent definitions inside the script; a test keeps that table equal to the agent frontmatter. In manual mode the orchestrator builds the same list by hand from the agents it invoked.

### Closeout table

| Workflow `status` | Goal-fit `verdict` | Closeout outcome |
| --- | --- | --- |
| `completed` | `fit` | accepted |
| `completed` | `partially-fit` | partially accepted; `knownGaps` gets the reasons |
| `completed` | `not-fit` | escalated to the user with the reasons |
| `escalated` | any or `invalid` | escalated with `reason` |
| `blocked` | none | blocked with `reason` |
| `plan-ready` | none | not a closeout; the run continues |

Accepted additionally requires the orchestrator's own re-run of the verification plan to pass. A failure there is contradictory evidence and closes as escalated.

### Mapping to `run.json`

| `run.json` field | Source |
| --- | --- |
| `schemaVersion` | `"1.1"` |
| `mode`, `status` | `"controlled"`; from the closeout table |
| `contract.*` | as today |
| `brief` | `{ path: args.briefPath, inception: "completed" | "skipped" }` from the brief file |
| `workflow` | `{ mode: "workflow" | "manual", scriptPath, runs: [{ runId, resultFile, status }] }`, one entry per Workflow invocation in the run (a paused run and its resumed run are two entries; an openQuestions re-run adds another) |
| `source.baseCommit` | `args.baseCommit`; `finalCommit` is `null` because workers do not commit; `diffSha256` computed by the orchestrator at closeout |
| `route.policy` | `"profiles/claude-5.md"`; `route.exception` `null` |
| `lanes[]` | one lane per entry in the concatenation of every run's `requestedRoutes`: `id` = `<run index>-<label>`, `role` from the agent type (`lead`, `worker`, `validator`, `reviewer`, `goal-reviewer`), `ownership` = the task's `ownedFiles` for worker lanes, else `[]`, `requested` = `{ model, effort, topology: "workflow-agent" | "single", agentType }`, `observed` from the probe (below), `status` from the task or phase result |
| `validation[]` | one entry per `postValidation` and per orchestrator closeout check: `id` = label or `closeout-<n>`, `command`, `exitCode`, `startedAt`/`endedAt` `null` for workflow entries (not captured) and real for closeout entries, `outputReference` = `specs/<run>/workflow-result.json#<label>` or the closeout log path, `outputSha256` `null` for workflow entries, `status` passed/failed |
| `acceptance[]` | one entry per contract criterion: `passed` when at least one task lists it or a closeout check covers it, every task listing it has status `passed`, it is absent from the final review's `unprovenCriteria`, and every closeout check covering it passed; `unproven` when no task and no closeout check covers it; else `failed`. Closeout checks map to criteria through the contract's verification plan rows. `evidence` entries keep the `validation:<id>` format |
| `review` | `reviewerLaneId` = final cycle lane id; `diffReviewed` `true` only when the reviewer's `diffSha256` equals the orchestrator's; `evidenceReviewed` `true` (the validation records were part of the reviewer's input); `decision` = `finalDecision`; `findings` = final cycle findings; plus `cycles`, `unprovenCriteria`, `fingerprintBefore`, `fingerprintAfter` |
| `closeout.outcome` | from the closeout table |
| `closeout.goalFit` | `{ verdict, reviewerModel, reviewerEffort, usedDeliverable, howUsed, reasons }` from `goalFit` |
| `closeout.knownGaps`, `closeout.escalation` | as today, plus the `reason` |

The workflow return value is saved verbatim as `specs/<run>/workflow-result.json`.

### Requested versus observed

The workflow return is authoritative for requested routes. The probe is authoritative for observed routes. The match rule for closeout and for AC-9: take the multiset of `(agentType, model, effort)` over the concatenated `requestedRoutes` of every workflow run in the session, and the multiset of `(agentType, observed model, observed effort)` over the probe's subagents whose `agentType` is one of the plugin's agents other than `adp-explorer`; the two multisets must be equal. Probe subagents of other types (`Explore`, `general-purpose`, `adp-explorer`, foreign plugins) are reported but excluded. During a Controlled run the orchestrator must not invoke the plugin's worker, validator, reviewer, lead, or goal-reviewer agents outside the workflow; if it does, in manual mode or by exception, it adds them to the requested list by hand. If the dogfood run shows that subagent metadata carries the workflow `label`, the probe joins on label instead and the rule becomes per-label equality.

Two recorded exceptions do not fail the rule but must appear in `closeout.knownGaps`: an observed subagent with effort `unknown` (no `perTurnEffort` in its transcript) whose agent type and model match, and an orphaned observed subagent re-spawned by a crash resume. A killed Workflow invocation gets a `workflow.runs[]` entry with `status: "killed"` and `resultFile` `null`. Any other difference between the multisets is contradictory evidence and closes the run as escalated.

Plan-phase failures other than open questions (R1 to R7, `plan-gate-fingerprint`) close the run as `blocked`. The orchestrator may start one new run from Plan after adding the failure to the brief under "Answers"; a second plan failure stays `blocked` and goes to the user.

### Constraints of the script runtime

No filesystem, Node, `Date.now()`, or `Math.random()` in the script. The script uses a sequential loop, not `pipeline()`, so writers never overlap and at most one agent runs at a time. Resume after a kill is `Workflow({ scriptPath, resumeFromRunId })` with identical `args`; completed agents return cached results.

## New and changed agents

| Agent | Model | Effort | Tools | Purpose |
| --- | --- | --- | --- | --- |
| `adp-lead` (new) | `claude-opus-5-5` | xhigh | Read, Grep, Glob, Bash | Reads contract, brief, and code; returns the plan object with concrete file paths. Never edits. Bash for read-only inspection such as `git log` and test discovery. |
| `adp-validator` (new) | `claude-sonnet-5-5` | low | Bash, Read | Runs exactly the one command it is given, reports exit code and excerpt, returns `fileStates` as defined above, computes the fingerprint with the exact command below, and reports `HEAD`. Never edits. |
| `adp-goal-reviewer` (new) | `claude-fable-5-1` | high | Read, Grep, Glob, Bash | Fresh-context fitness review against the brief, within the run bounds above. Never edits. `disallowedTools: Edit, Write, NotebookEdit`. |
| `adp-worker`, `adp-worker-high` | unchanged route | | | Body gains: return the structured result fields; never commit. |
| `adp-reviewer`, `adp-reviewer-high` | unchanged route | | | Body gains: compute the diff against the given base commit yourself; return the structured decision fields. |
| `adp-explorer` | unchanged | | | |

Fingerprint command, carried verbatim in `adp-validator` and the adapter README; the skill's manual fallback cites the README:

```bash
T=$(mktemp) && cp "$(git rev-parse --git-path index)" "$T" && GIT_INDEX_FILE="$T" git add -A && GIT_INDEX_FILE="$T" git write-tree; rm -f "$T"
```

Gitignored files are not covered. All read-only agents carry the existing disclosure sentence: read-only by instruction, Bash available for diff and checks, enforced by the fingerprint.

## Plan rules as a testable unit

The path matcher, the topological sort, and rules R1 to R8 live in `lib/deliver-plan-rules.js` and are copied verbatim into the script between the marker comments `// BEGIN plan-rules` and `// END plan-rules`. The lib file ends with `module.exports` after its `// END plan-rules` marker. A test extracts both marked blocks and asserts they are byte-identical, and unit tests exercise each rule and the matcher through the lib file.

## Run record changes

`templates/run.json` and `examples/controlled-run/run.json` keep their GPT-6 lanes and gain the optional fields `brief`, `workflow`, `closeout.goalFit`, and lane `requested.agentType`, all `null`, with `schemaVersion` `"1.1"`. The filled Claude-route example is the dogfood run record under `specs/`, which PR 2's getting-started links to. The GPT-6 adapters leave the new fields `null`.

## Probe changes

`lib/claude-route-probe.js` learns:

- Requested effort follows the same precedence as model: a per-invocation value in `meta.json` when present, else the agent definition, else `unknown`. The spike showed `meta.model` is recorded only when passed per invocation; whether `effort` and `label` are recorded is confirmed by the dogfood run and documented in the profile.
- An `agentType` of `workflow-subagent` records `requested.source: "workflow"` with model and effort `unknown` unless the meta carries them. The script always passes a custom `agentType`, so this is a fallback only.
- No nested directory walk. Depth is one.

Fixtures: one synthetic workflow transcript with Plan, Implement, Review, and Goal-fit agents, including one retry-2 worker with a per-invocation model and one `workflow-subagent`. AC-9 replaces the synthetic fixture with a sanitized copy of the dogfood transcript's metadata and transcripts, or records the differences and corrects the fixture.

## Test changes

In `test/claude-code-adapter.test.js` (PR 1): the skill assertions `/depth one/i`, `/one orchestration plane/i`, `/preflight/i`, `/sole writer/i`, `/serialized/i`, the read-only disclosure, the probe command path `${CLAUDE_PLUGIN_ROOT}/bin/agentic-delivery-playbook.js`, `~/.claude/projects/`, and the minimum of three `${CLAUDE_PLUGIN_ROOT}` references stay, because the skill keeps the one-line probe command and the transcript path. The assertions for `GIT_INDEX_FILE`, `git rev-parse --git-path index`, `git rev-parse HEAD`, and `Gitignored files are not covered` move from the skill to `adp-validator` and the adapter README; the README keeps the fingerprint in a fenced block, which is allowed because the existing README rule forbids only `${CLAUDE_PLUGIN_ROOT}` inside fenced blocks. The settings template assertion becomes `{ model: 'claude-fable-5-1', effortLevel: 'high' }`. The profile assertions `/Depth: one/`, `/alias drift/i`, `/Escalation/` (the section stays and now holds the worker ladder), `/requested.*configured.*observed/is`, `/not attestation/i`, and the term list (`claude-opus-5-5`, `claude-sonnet-5-5`, `adp-worker`, `adp-reviewer`, `adp-explorer`) stay; new assertions require `/Workflow/`, `/agent teams/i`, `claude-fable-5-1`, `adp-lead`, `adp-validator`, and `adp-goal-reviewer`. In the README, `${CLAUDE_PLUGIN_ROOT}` appears only in inline code or prose, never inside a fenced block, because of the existing fence rule. The plugin version assertion becomes `0.4.0`. New assertions cover the three new agents, the workflow script's `node --check`, its `meta` phases, the forbidden tokens, the marker-block equality, and the script's agent-definition table matching the frontmatter.

In `test/active-surface.test.js` (PR 1): the `package.json` version assertion becomes `0.4.0` and the test title drops "0.3". `SECURITY.md` lists `0.4.x` as supported. The `examples/controlled-run/run.json` lane assertions (`implementation` on `gpt-6-luna`, `fresh-context-review` on `gpt-6-sol`) stay, since the example keeps its GPT-6 lanes.

In `test/run-record.test.js` (PR 1): `schemaVersion` `"1.1"`; the template lane stays `gpt-6-luna`; the new fields are asserted present and `null`.

In `test/active-surface.test.js` (PR 2): the README assertion changes from "Codex, ChatGPT Work, and Pi" to the Claude Code first wording, and the getting-started assertions on "Route the bounded implementation to Luna high." and "Sol high in a fresh context" change to the Claude route wording, with the Pi section's GPT-6 wording asserted instead.

## Repository repositioning (PR 2)

- `README.md`: lead with Claude Code desktop install and the three-tier route; move Codex, ChatGPT Work, and Pi to an "Other adapters" section; keep the GPT-6 route table there.
- `playbook.md`: "Use `profiles/gpt-6.md` for the maintained mapping" becomes "Use the active profile for the surface: `profiles/claude-5.md` for Claude Code, `profiles/gpt-6.md` for Codex, ChatGPT Work, and Pi." No other kernel change.
- `docs/getting-started.md`: the Controlled walkthrough uses the Claude Code route; the Pi section stays.
- `docs/adapters.md`: Claude Code row first.
- `AGENTS.md` at the root stays the Codex pointer. Add `CLAUDE.md` at the root pointing to the Claude Code adapter and the Claude 5 profile.
- `package.json`: description and keywords updated. `CHANGELOG.md`: the `0.4.0` entry is completed with the repositioning items.
- `scripts/validate-active-policy.js`: add `CLAUDE.md` to the active file list.

PR 1 already bumps `package.json` and `plugin.json` to `0.4.0`, adds `adapters/claude-code` and `.claude-plugin` to `files`, starts the `0.4.0` changelog entry, and adds the new agents and the workflow script to the validator with `node --check`. The 120-line profile budget and the 80-line skill budget stay; the script has no line budget.

## Acceptance criteria

PR 1 (mechanism):

- AC-1: Agents `adp-lead`, `adp-validator`, `adp-goal-reviewer` exist with the models, efforts, and tools in the table, are listed in `plugin.json`, and pass the frontmatter test. The existing agents carry the body additions.
- AC-2: `adapters/claude-code/workflows/deliver-controlled.js` passes `node --check`; its `meta` is a pure literal with the four phase titles; it contains no `Date.now`, `Math.random`, `require`, or `import`; its plan-rules block is byte-identical to `lib/deliver-plan-rules.js`; unit tests cover R1 to R8, the matcher, and the topological sort.
- AC-3: The `deliver` skill is at most 80 lines, explicit-invoke, references the brief, the workflow script path, the pause rule, the two review gates, the orchestrator's closeout re-run, and the manual fallback, and all `${CLAUDE_PLUGIN_ROOT}` references resolve. The adapter README holds the `args` example, the mapping table, and the fingerprint command.
- AC-4: `profiles/claude-5.md` version 2 holds the route table above, permits the Workflow tool, excludes agent teams with the CLI-only reason, states depth one, and removes the alias escalation. At most 120 lines.
- AC-5: The settings template is `{"model": "claude-fable-5-1", "effortLevel": "high"}` and the README documents it as a manual merge.
- AC-6: The probe handles the effort precedence and `workflow-subagent` with the new fixture; existing fixtures still pass.
- AC-7: `templates/run.json` and the example run carry the new fields at `schemaVersion` `"1.1"` and parse.
- AC-8: `npm run check` passes; `package.json` and `plugin.json` are `0.4.0`; `npm pack --dry-run` lists the workflow script and agents.
- AC-9 (dogfood): one Controlled run on a real task in a non-playbook repository through the new skill, with `pauseAfterPlan` exercised once, recorded under `specs/<date>-three-tier-dogfood/` with `brief.md`, `contract.md`, `run.json`, `workflow-result.json`, and the probe output. The requested-versus-observed match rule holds for every `requestedRoutes` entry. The recorded artifacts contain no personal absolute paths and nothing private from the other repository. The goal-fit verdict must be `fit`; `partially-fit` or `not-fit` blocks merge until the reasons are addressed and the run repeated.
- AC-10: The plugin change itself is reviewed by `adp-goal-reviewer`, invoked once through the Agent tool in fresh context, in a separate session from the AC-9 dogfood run, with these inputs: `specs/<date>-three-tier-dogfood/design-brief.md` (created by PR 1 from the appendix below) as the brief, this spec's PR 1 acceptance criteria as the contract stand-in, the PR 1 branch head against `main` as the diff, the AC-9 artifacts as the evidence, and `npm run check` plus read-only inspection as the allowed commands. The verdict is recorded next to the brief. The same merge rule as AC-9 applies.

PR 2 (repositioning):

- AC-11: README, getting-started, adapters doc, and the kernel's profile sentence match the repositioning section. `CLAUDE.md` exists at the root.
- AC-12: `package.json` description and keywords are updated and the changelog `0.4.0` entry is complete.
- AC-13: `npm run check` passes and the active-policy validator covers `CLAUDE.md`.

## Risks and mitigations

- **Workflow agents cannot ask the user.** Mitigated by the inception grill, the lead's `openQuestions` rule that blocks before any edit, and the plan pause for skipped grills and high-risk contracts.
- **Workflow transcript layout is documented but not yet observed here.** Mitigated by AC-9: the profile claims nothing about `label` or `effort` metadata until the dogfood probe confirms it, and the fixture is corrected from the real run.
- **Validator output is an agent's report.** The validator records gate each task inside the run; the orchestrator re-runs the contract's verification plan itself at closeout and that is the closeout evidence, as the current skill already requires.
- **Sonnet medium may be too weak for some codebases.** Mitigated by the three-rung ladder inside the loop and by the run records, which show where escalation happens so task granularity can be tuned.
- **The orchestrator may still do the work itself.** The design only helps when Controlled work goes through the skill. The success measure after a month is orchestrator turns per Controlled task, visible in transcripts.
- **Plugin subagents ignore frontmatter hooks and permission modes.** Enforcement stays tool allowlists plus the fingerprint, and the disclosure stays in every read-only agent.
- **Goal-fit reviewer side effects.** Bounded to verification-plan commands, brief-named commands, and read-only inspection; everything else is reported, not run; the fingerprint covers tracked and untracked files.
- **Fable reviewer cost.** One fresh Fable read per Controlled run, only after a defect-review accept. Configurable through `args.goalReviewer`.

## Open decisions

None. The goal reviewer default (Fable 5.1, configurable), the skippable grill, fixed fix cycles at two, and the two-PR slicing were decided in session on 2026-10-11.

## Appendix: design intent brief

Written from the 2026-10-11 session; PR 1 copies it to `specs/<date>-three-tier-dogfood/design-brief.md` for AC-10.

- Outcome: Controlled work in Claude Code desktop runs as Fable goal owner, Opus planner, Sonnet implementers, with deterministic serialization, fix limits, review gates, and evidence, so the orchestrator spends tens of turns per task instead of hundreds.
- Who it serves: a single developer on a Max subscription who orchestrates from the desktop app and wants to stay at goal level while implementation happens below.
- How success is observed: a real Controlled run completes through the shipped workflow with requested routes equal to observed routes for every agent; the orchestrator session for that run is well under 100 assistant turns; the goal-fit reviewer, given this brief, returns `fit`.
- What must not change: the Direct and Controlled kernel, contract-before-delegation, one writer per file cluster, fresh-context review of the actual diff, depth one, the probe's requested-versus-observed evidence, and the Pi and Codex adapters.
- Already tried: a single-hop Opus orchestrator with a Sonnet worker and an Opus reviewer (profile 1.1), which produced 600 to 750 turn orchestrator sessions and was abandoned in practice in favour of Fable doing the work itself.
