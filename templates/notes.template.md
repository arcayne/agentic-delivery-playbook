# Run notes: <feature or change name>

## Timeline

- <timestamp> — <event>

## Process weight

- Mode: direct | lightweight | full
- Rationale: <why this process weight is enough>
- Escalation signal: <none or risk that requires heavier process>

## Dynamic workflow launch note (delete if unused)

Use only for dynamic workflows or large parallel fanout. Prefer a short plain-English approval note over blank budget fields.

```text
<scope, concrete cap, recursion/depth cap if nested planners are used, stop rule, and synthesis/verification plan>
```

- Approval evidence: <quote, message, ticket link, or note>
- Launch tree: <none | coarse slice ids/dependencies/first launch>
- Active-launch ownership/conflict rules: <none | paths/ids and approval status>
- Planner subtree maps: <none | only nested maps approved for launched child slices>
- Context/guardrail artifact paths: <none | paths and one-line purpose; keep large reports out of notes by default>
- Single-worker exception: <none | reason/context-risk mitigation/compensating checks>

## Intake decisions

- <decision>

## Spec critique findings

- <finding and resolution>

## Approval

- Status: pending | approved | rejected
- Evidence: <quote, message, ticket link, or note>

## Implementation summary

- Changed files:
  - `<path>`

## Validation evidence

Evidence mode: direct-validation | notes-only | artifact-backed

```text
<command output summary or manual check>
```

## Closeout governance

- Required checks run:
  - `<command>` — passed | failed | skipped
- Warnings:
  - <warning or None>
- Approved exceptions:
  - <exception or None>

## QA findings

| Severity | Finding | Resolution |
| --- | --- | --- |
| <severity> | <finding> | <resolution> |

## Fix cycles

- Count: 0
- Notes: <none>

## Handoff economics / observability

- Observability source: <PI_OBS_DB | harness telemetry | manual estimate | unavailable>
- Whole operation: wall-clock <duration>, sum model time <duration>, approx cost <amount | unknown>
- Lane breakdown: <path to run.json/observability.md or compact table>
- Handoff overhead: <parent setup + coordination + synthesis + rework, or unknown>
- Accepted lanes: <accepted>/<launched>
- Rejected/duplicative lanes: <none | list>
- Counterfactual baseline: <all-strongest-high-xhigh | parent-only | unknown>
- Cost likely lower than baseline: <yes | no | unknown> because <evidence>
- Public report: <path | none | unavailable>

## Implementation model evaluation

- Target agent/model: <agent> / <model>
- Actual agent/model: <agent> / <model>
- Drift: none | minor | major | unknown
- Back and forth signal: none | mild | concerning
- Verdict: validated | mixed | failed | inconclusive
- Notes: <evidence backed judgment>

## Legacy / exception evidence

- Legacy run: no | yes
- Missing evidence:
  - <item or None>
- Approved exceptions:
  - <item or None>

## Model / agent ledger

| Role | Agent | Model | Reasoning | Source | Notes |
| --- | --- | --- | --- | --- | --- |
| spec author | <agent> | <model> | <low/medium/high/extra-high/runtime-default> | <source> | <notes> |
| critic | <agent> | <model> | <low/medium/high/extra-high/runtime-default> | <source> | <notes> |
| implementer | <agent> | <model> | <low/medium/high/extra-high/runtime-default> | <source> | <notes> |
| QA reviewer | <agent> | <model> | <low/medium/high/extra-high/runtime-default> | <source> | <notes> |

## Known gaps

- <gap or "None">

## Closeout recommendation

<ship, continue, split follow-up, or stop>
