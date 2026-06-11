# Child Task 01 — Parser Case

## Parent Spec

examples/pi-task-fit-routing/spec.md

## Child Mode

Lightweight

## Objective

Update the routing order so actionable trading commands are classified before pending prompt handlers consume them.

## Non-Goals

- Do not place live orders.
- Do not change broker/provider execution behavior.
- Do not redesign all routing.
- Do not introduce autonomous trading.

## Scope

Allowed files:
- example/path/router.ts
- example/path/router.spec.ts

Do not touch:
- live execution paths
- provider integrations
- unrelated docs

## Acceptance Criteria

- Actionable trading commands are classified before pending prompts consume them.
- Existing pending prompt behavior still works for non-actionable replies.
- No live execution path is introduced.

## Model Lane

Intended model: `deepseek-v4-flash`

Reasoning level: low

Why this lane is safe:
- bounded file scope
- clear acceptance criteria
- no architecture decisions remain

## Implementation Notes

Implement only the routing-order change and keep the diff minimal.

## Validation Plan

- Run the routing-order regression tests.
- Confirm no live order path changed.

## Escalation Conditions

Escalate if:

- implementation needs files outside allowed scope,
- acceptance criteria are ambiguous,
- validation fails twice,
- the task contradicts parent spec,
- hidden architecture/risk appears.

## Closeout

Files changed:
- example/path/router.ts

Validation:
- routing-order tests passed

Result:
- complete

Known gaps:
- illustrative example only

Parent acceptance criteria affected:
- routing order
