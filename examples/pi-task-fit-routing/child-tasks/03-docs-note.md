# Child Task 03 — Docs Note

## Parent Spec

examples/pi-task-fit-routing/spec.md

## Child Mode

Direct

## Objective

Add a short docs note explaining the new classification-first routing precedence.

## Non-Goals

- Do not change code.
- Do not add a run directory.
- Do not add a model ledger.

## Scope

Allowed files:
- docs/example-routing.md

Do not touch:
- routing implementation
- tests
- provider code

## Acceptance Criteria

- The note explains the precedence in one short paragraph.
- The note stays low-friction and local.

## Model Lane

Intended model: current active Pi model

Reasoning level: minimal / low / runtime-default

Why this lane is safe:
- trivial docs update
- no architecture decisions
- no ledger required in Direct mode

## Implementation Notes

Keep the note short and operational.

## Validation Plan

- Manual docs check

## Escalation Conditions

Escalate if:

- the note requires code changes,
- the scope expands beyond the single docs file,
- a hidden risk appears.

## Closeout

Files changed:
- docs/example-routing.md

Validation:
- manual docs check passed

Result:
- complete

Known gaps:
- illustrative example only

Parent acceptance criteria affected:
- Direct child remains low-friction
