# Handoff economics and public observability

Agentic delivery should not assume that more agents or stronger models are automatically better. A handoff is worth it only when the accepted output, saved wall-clock time, risk reduction, or evidence quality is greater than the extra cost of delegation, synthesis, and possible rework.

This document defines the minimum telemetry needed to compare routes honestly.

## Core question

For each delegated lane, ask:

```text
Was this handoff worth more than doing the same work in the parent session or running the whole operation on the strongest model?
```

Do not answer by impression. Answer from recorded evidence.

## Cost of handoff

A handoff has several costs:

| Cost | Meaning | Typical evidence |
| --- | --- | --- |
| Parent setup | Time/tokens to write the slice prompt, constraints, acceptance, and route | parent turns, prompt artifact, launch note |
| Child startup | Tokens/time spent rereading repo context and instructions | child input tokens, first useful tool time |
| Coordination | Waiting, status checks, intercom, retries, route failures | run events, timeout/failure records |
| Synthesis | Parent time/tokens to read, accept/reject, and fold output in | notes, accepted/rejected findings |
| Merge/conflict | Extra work caused by overlapping edits or stale assumptions | conflict records, fix cycles |
| Rework | Fixes caused by weak context, wrong model fit, or unclear contract | QA findings, repeated validation failures |

Approximate lane handoff cost:

```text
handoff_cost = parent_setup + child_startup + coordination + synthesis + merge_conflict + rework
```

Use time, tokens, cost, or all three. If a value is unavailable, record `unknown` instead of inventing it.

## Value of handoff

A handoff can create value through:

| Value | Meaning | Typical evidence |
| --- | --- | --- |
| Accepted work | Output used without major rewrite | accepted findings/files/patches |
| Wall-clock compression | Parallel lanes shorten elapsed time | total model-minutes vs wall-clock minutes |
| Risk reduction | Independent lane catches issue before implementation/ship | guardrail findings, QA findings |
| Evidence quality | Output is auditable and reusable | artifact path, cited files, validation evidence |
| Better fit | A specialized/cheaper model handles a bounded task well | low drift, tests pass, no rework |
| Context isolation | Child avoids contaminating parent state or enables clean review | separate artifact/session |

Approximate lane value:

```text
handoff_value = accepted_work + wall_clock_compression + risk_reduction + evidence_quality - rejected_output
```

## Break-even rule

Delegate when the expected value exceeds the handoff cost:

```text
handoff_value > handoff_cost
```

For broad work, the decision can be made per lane:

- read-only context lane: worth it if it avoids parent scanning or creates a reusable artifact
- planner lane: worth it if it produces a launch tree that reduces drift or enables safe parallelism
- worker lane: worth it if accepted code plus local validation beats parent implementation time/rework
- reviewer lane: worth it if it finds material issues or provides trusted final QA evidence

## Operation-level metrics

Record these for the whole run:

| Metric | Definition |
| --- | --- |
| Wall-clock duration | Start to closeout elapsed time |
| Sum model duration | Sum of child/parent active durations; parallel lanes add together |
| Critical path | Longest dependency path from launch to closeout |
| Total tokens | Input, output, cache read/write if available |
| Approx cost | Provider/harness reported cost if available |
| Model mix | Models/reasoning levels used by role |
| Accepted lane ratio | Accepted lanes / launched lanes |
| Rework cycles | Fix rounds after worker output |
| Timeout/failure count | Failed gates and recoveries |
| Validation coverage | Commands/manual checks completed vs required |

Useful derived signals:

```text
parallel_efficiency = sum_model_duration / wall_clock_duration
handoff_overhead_ratio = handoff_overhead / total_run
accepted_output_ratio = accepted_lanes / launched_lanes
rework_rate = fix_cycles / accepted_worker_lanes
```

Use the same unit on both sides of a ratio: time, tokens, or cost. These are directional signals, not universal benchmark scores.

## Model-mix comparison

Mixed models can be cheaper than running everything on the strongest high/xhigh model, but only if bounded lanes are accepted and do not cause rework.

Compare against a counterfactual baseline:

```text
baseline: all lanes on strongest high/xhigh
actual: role-fit model mix
```

Record:

- actual cost/tokens/duration by lane
- estimated baseline cost when pricing is known
- quality delta: accepted/rejected lanes, drift, fix cycles, findings
- quota impact: whether parallelism increased total token burn or hit rate limits

Do not conclude "stronger models only" or "cheaper implementers always" from one run. Build a local dataset by task shape.

## Lane telemetry schema

A public-safe lane record should include:

```json
{
  "runId": "20260622-hermes-audience-signal-desk",
  "laneId": "context-backend-data",
  "role": "context-builder",
  "agent": "context-builder",
  "model": "openai-codex/gpt-5.5:medium",
  "reasoning": "medium",
  "source": "explicit",
  "taskType": "read-only-context",
  "startedAt": "2026-06-22T18:38:25Z",
  "endedAt": "2026-06-22T18:47:10Z",
  "durationMs": 525000,
  "turns": 8,
  "inputTokens": 120000,
  "outputTokens": 5000,
  "cacheReadTokens": 0,
  "cacheWriteTokens": 0,
  "costApprox": 0.42,
  "toolCalls": 42,
  "filesChanged": [],
  "artifactPath": ".pi/runs/.../context/backend-data-slice.md",
  "accepted": true,
  "acceptedUse": "launch-tree input",
  "reworkCaused": false,
  "residualRisks": ["prod DB migration safety"]
}
```

## Public data rules

This data should be public when possible because model-routing claims need evidence. Public reports must be sanitized:

- no secrets, API keys, tokens, private customer data, raw provider payloads, or raw prompts with sensitive context
- no private absolute paths if the report is meant to be reusable across machines
- use task labels and repo-relative artifact paths
- include model/agent labels only when actually recorded by the harness
- include `unknown` for missing cost or pricing fields
- separate raw local telemetry from the public summary

Recommended public artifacts:

```text
run-report.json          machine-readable public run + lane metrics
lanes.csv                flat lane table for analysis
README.md                concise synthesis and decision log
artifacts/*.md           focused context artifacts, not pasted into notes
```

## Closeout questions

At closeout, answer:

1. What did the whole operation take: wall time, model time, tokens, cost, turns, and tool calls?
2. Which model/agent did which task?
3. Which lanes were accepted, rejected, duplicated, or superseded?
4. What was the handoff overhead?
5. Did parallelism reduce wall-clock time or only increase token burn?
6. Did weaker/cheaper lanes cause rework?
7. Would a stronger single model likely have been cheaper or safer?
8. What should the next similar run route differently?

The goal is not to crown a model. The goal is to learn which model/agent/process mix works for each task shape.
