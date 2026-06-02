# Gates

Gates are the control points that keep the workflow from becoming an uncontrolled agent loop.

## Intake gate

Before writing a spec, confirm the task is not a small direct edit.

Ask:

- Is the objective clear?
- What is explicitly out of scope?
- What would make the change unacceptable?
- What evidence proves completion?
- What risks require extra care?

## Spec quality gate

Before approval, the spec should define:

- objective
- non-goals
- current-state context
- implementation approach
- acceptance criteria
- edge cases
- validation plan
- open questions

Reject or revise the spec if acceptance criteria are vague or validation is missing.

## Approval gate

Implementation starts only after approval, unless the human explicitly asked for an uninterrupted end-to-end run.

Record approval in `run.json` or `notes.md`.

## Implementation gate

Before editing code, the implementer should have:

- the approved spec path or content
- a focused task
- scope boundaries
- validation commands
- permission to edit the target files

If the implementer cannot be routed/configured as intended, record the actual routing and ask for approval when risk is high.

## QA gate

QA compares implementation to the approved spec.

The reviewer should not accept an implementation merely because tests pass. Tests are evidence, not the whole contract.

## Escalation gate

Stop blind fix loops when repeated correction appears.

Escalate if:

- more than two fix cycles are required
- implementation keeps drifting from the spec
- the same bug class reappears
- safety/security/privacy constraints are violated
- validation failure reveals a spec gap

## Closeout gate

A run is complete only when the closeout records:

- files changed
- validation performed
- acceptance criteria status
- review findings
- known gaps
- next action
