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
- Planner subtree maps: <none | paths/ids and approval status>
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
