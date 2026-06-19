# Child Task: <number> — <name>

This child task is a fractal Agentic Delivery Playbook contract. Apply the same evidence, routing, non-goal, validation, and escalation rules as the parent, scaled to this slice.

## Parent Spec

Path:
Parent approval / goal id:
Parallel launch note:

## Child Mode

Direct | Lightweight | Full

## Dependencies / Conflict Rules

Can run in parallel with:
Must wait for:
File ownership / conflict rule:

## Objective

## Non-Goals

## Scope

Allowed files:

Do not touch:

## Acceptance Criteria

## Route / Model Lane

Intended agent:
Intended model:
Reasoning level:
Source: explicit | project-settings | manual | pending-user-decision | exception-approved | runtime-default
Verification evidence:
Exception, if any:

Why this lane is safe:

## Implementation Notes

## Validation Plan

## Escalation Conditions

Escalate if:

- implementation needs files outside allowed scope,
- another worker owns the same file or coupled area,
- acceptance criteria are ambiguous,
- route/model verification fails or is only a default without approved exception,
- validation fails twice,
- the task contradicts parent spec,
- hidden architecture/risk appears,
- product decisions are needed beyond this slice.

## Closeout

Files changed:

Validation:

Result:

Known gaps:

Parent acceptance criteria affected:
Route evidence:
Drift check:
Ready for parent barrier: yes | no
