# Child Task 02 — Regression Tests

## Parent Spec

examples/pi-task-fit-routing/spec.md

## Child Mode

Lightweight

## Objective

Add regression tests that cover ambiguous trading-command classification cases.

## Non-Goals

- Do not change live execution.
- Do not broaden routing behavior.
- Do not add new trading features.

## Scope

Allowed files:
- example/path/router.spec.ts
- example/path/test-fixtures/*

Do not touch:
- provider code
- production order execution
- unrelated docs

## Acceptance Criteria

- Ambiguous actionable commands are tested.
- Non-actionable replies still follow pending prompt behavior.
- The test file documents the expected precedence.

## Model Lane

Intended model: `deepseek-v4-flash`

Reasoning level: low

Why this lane is safe:
- narrow test-only change
- deterministic validation
- no architecture decisions remain

## Implementation Notes

Keep the tests focused on routing precedence and edge cases.

## Validation Plan

- Run the targeted regression test file.
- Re-run once after any fix.

## Escalation Conditions

Escalate if:

- implementation needs files outside allowed scope,
- acceptance criteria are ambiguous,
- validation fails twice,
- the task contradicts parent spec,
- hidden architecture/risk appears.

## Closeout

Files changed:
- example/path/router.spec.ts

Validation:
- targeted regression tests passed

Result:
- complete

Known gaps:
- illustrative example only

Parent acceptance criteria affected:
- regression coverage
