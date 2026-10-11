# Claude Code adapter

A Claude Code plugin that applies the Direct and Controlled kernel in the desktop app (Code tab) and the terminal CLI. Routes are defined in [`profiles/claude-5.md`](../../profiles/claude-5.md). Controlled work runs as a shipped Workflow script: an Opus lead plans bounded tasks, Sonnet workers implement them one at a time, a low-effort validator gates each task, an Opus reviewer checks defects in fresh context, and a Fable goal-fit reviewer judges the result against the intent brief.

## What it provides

- Skill `/agentic-delivery-playbook:deliver` (explicit invoke only): inception grill, classification, contract, the workflow call, and closeout.
- Workflow script `adapters/claude-code/workflows/deliver-controlled.js` with phases Plan, Implement, Review, Goal-fit.
- Agents `adp-lead` (Opus 5.5 xhigh, read-only), `adp-worker` and `adp-worker-high` (Sonnet 5.5 medium and high, sole writers), `adp-validator` (Sonnet 5.5 low, Bash and Read), `adp-reviewer` and `adp-reviewer-high` (Opus 5.5 medium and high, fresh context), `adp-goal-reviewer` (Fable 5.1 high, fresh context), and `adp-explorer` (Sonnet 5.5 low, read-only tools).
- Every read-only agent is read-only by instruction; Bash is available for diff and checks; the validator's before/after worktree fingerprint enforces it.
- `agentic-delivery-playbook probe claude` for requested versus observed route evidence, with `--requested` to apply the match rule.

## Install

Desktop app (Code tab) and terminal use the same commands:

```text
/plugin marketplace add arcayne/agentic-delivery-playbook
/plugin install agentic-delivery-playbook@agentic-delivery-playbook
```

To try it without installing, run `claude --plugin-dir <path-to-this-repo>`.

## Orchestrator route

Plugins cannot set the main session model. Optionally merge [`templates/claude-settings.template.json`](../../templates/claude-settings.template.json) (`claude-fable-5-1`, effort `high`) into your project's `.claude/settings.json`. Review and merge it by hand; it is never auto-applied and this plugin never edits your settings. The skill's Controlled preflight accepts Fable 5.1 or Opus 5.5 as the main session and stops on anything else. The Workflow tool is unavailable in `claude -p`; there the skill runs the same phases by hand.

## Reference

### Workflow `args`

The skill passes these to the Workflow tool with `scriptPath` set to the plugin's `adapters/claude-code/workflows/deliver-controlled.js` (resolve it from the plugin root given by the `CLAUDE_PLUGIN_ROOT` variable):

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

Set `pauseAfterPlan` to `true` when the grill was skipped or `risk` is `high`; the run returns `plan-ready`, you approve the plan, then start a second run with `resumePlan` set to the approved plan and `pauseAfterPlan` `false`. A `blocked` run with `openQuestions` means: answer them, append the answers to the brief under "Answers", and start a new run. Other plan failures may be retried once the same way; a second failure goes to the user. Lane `ownedFiles` and `nonGoalFiles` are patterns where `*` matches within one path segment and `**` matches any depth; task paths in the plan are concrete. `goalReviewer` is optional and defaults to the values shown. Missing or malformed `args` surface as a Workflow tool error, not as an `escalated` record.

### Fingerprint and diff hash

Worktree fingerprint (temp-index tree including untracked files; Gitignored files are not covered):

```bash
T=$(mktemp) && cp "$(git rev-parse --git-path index)" "$T" && GIT_INDEX_FILE="$T" git add -A && GIT_INDEX_FILE="$T" git write-tree; rm -f "$T"
```

Diff hash, computed by the reviewer and again by the orchestrator at closeout before re-running the verification plan (replace `BASE`; use `sha256sum` where `shasum` is absent):

```bash
{ git diff --no-color --no-ext-diff BASE; git ls-files --others --exclude-standard -z | while IFS= read -r -d '' f; do printf '%s\0' "$f"; cat "$f"; done; } | shasum -a 256
```

### Closeout

| Workflow `status` | Goal-fit `verdict` | Outcome |
| --- | --- | --- |
| `completed` | `fit` | accepted, if the orchestrator's own verification re-run passes and the route comparison matches |
| `completed` | `partially-fit` | partially accepted; reasons become known gaps |
| `completed` | `not-fit` | escalated to the user |
| `escalated` | any, or `invalid` after a goal-fit fingerprint mismatch | escalated with `reason` |
| `blocked` | none | blocked with `reason` |
| `plan-ready` | none | not a closeout; approve the plan and start the second run |

Mapping from the workflow result to `run.json` (schema 1.1):

| `run.json` field | Source |
| --- | --- |
| `schemaVersion`, `mode`, `status` | `"1.1"`, `"controlled"`, the outcome above |
| `brief` | `{ path, inception: "completed" or "skipped" }` from the brief file |
| `workflow` | `{ mode: "workflow" or "manual", scriptPath, runs: [{ runId, resultFile, status }] }`, one entry per Workflow invocation (a paused run and its resumed run are two; a killed run has `status: "killed"` and `resultFile: null`) |
| `source` | `baseCommit` from the contract; `finalCommit` `null` because workers never commit; `diffSha256` from the command above, computed before the closeout re-run |
| `route` | `policy` `profiles/claude-5.md`; `exception` `null` |
| `lanes[]` | one per entry in the concatenated `requestedRoutes`: `id` = `<run index>-<label>`, `role` from the agent type, `ownership` = the task's `ownedFiles` for workers, `requested` = `{ model, effort, topology: "workflow-agent" or "single", agentType }`, `observed` from the probe, `status` from the task (`pending` maps to `planned`) or phase result |
| `validation[]` | one per task `postValidation` and per closeout check: `id` = label or `closeout-<n>`; `command`, `exitCode`, `status` from the record; workflow entries have `startedAt`, `endedAt`, `outputSha256` `null` and `outputReference` = `specs/<run>/workflow-result.json#<label>`; closeout entries have real timestamps and `outputReference` = the saved log path |
| `acceptance[]` | one per contract criterion: `passed` when a task or closeout check covers it, every covering task passed, it is absent from the final review's `unprovenCriteria`, and every closeout check covering it passed; `unproven` when nothing covers it; else `failed`; `evidence` uses `validation:<id>` |
| `review` | `reviewerLaneId` = final cycle lane; `diffReviewed` true only when the reviewer's `diffSha256` equals the orchestrator's; `evidenceReviewed` true; `decision` = `finalDecision`; `findings` from the final cycle; plus `cycles`, `unprovenCriteria`, fingerprints |
| `closeout` | `outcome` from the table; `knownGaps` includes `unknownEffort` entries, crash-resume orphans, and goal-fit reasons for `partially-fit`; `escalation` carries the `reason` and `detail` |
| `closeout.goalFit` | `{ verdict, reviewerModel, reviewerEffort, usedDeliverable, howUsed, reasons }` from the workflow's `goalFit`; `null` when the run ended before Goal-fit |

Save each workflow return verbatim as `specs/<run>/workflow-result.json` (suffix `-2`, `-3` for later runs).

### Route evidence

```text
npx agentic-delivery-playbook probe claude <session.jsonl> [--agents-dir <dir>] [--requested <workflow-result.json>]...
```

The transcript is `~/.claude/projects/<cwd with / replaced by ->/<session-id>.jsonl`; workflow agents are under `<session-id>/subagents/workflows/<runId>/`. Pass one `--requested` per workflow run. The report's `comparison` lists `missing`, `unexpected`, `unknownEffort` (a recorded gap), `excluded` (explorer and non-plugin agents), and `labelPairs` (informational; labels repeat across runs). Only agent types with the `agentic-delivery-playbook:` prefix are compared; if a transcript records a plugin agent under its bare name, every requested entry shows as missing, which fails closed. Until an npm release includes this version, run `node <installed plugin path>/bin/agentic-delivery-playbook.js probe claude ...` instead.

## Known gaps

See the Known gaps section of the profile. Output paths are shown cwd-relative or with `~`, never as raw home-directory paths.
