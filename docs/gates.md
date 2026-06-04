# Gates

Gates are the control points that keep the workflow from becoming an uncontrolled agent loop.

## Process-weight gate

Before writing a spec, creating a run directory, choosing models, or delegating reviewers, choose the least intrusive safe mode.

- **Direct mode:** clear one- or two-file change, obvious validation, no material risk. Do not create a run directory; edit and validate directly.
- **Lightweight mode:** bounded low/medium-risk change that benefits from a compact spec/checklist. Notes-only evidence and parent self-review are acceptable.
- **Full mode:** broad, ambiguous, sensitive, cross-system, provider/config/state-machine, security/privacy, or drift-prone work. Require explicit artifacts, routing ledger, QA gate, high-risk checks when applicable, and full closeout.

Escalate the process weight only when risk appears. Do not add full-mode gates to direct or ordinary lightweight work by default.

## Intake gate

Before writing a spec, confirm the task is not a direct-mode edit.

Ask:

- Is the objective clear?
- What is explicitly out of scope?
- What would make the change unacceptable?
- What evidence proves completion?
- What risks require extra care?

## Spec quality gate

Lightweight specs may be compact checklists. Full-mode specs should be implementation-ready contracts.

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

For lightweight mode, QA may be a parent self-review recorded in `notes.md` when no serious risk appears. For full mode, use an explicit critic/QA gate, preferably independent when available.

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

Lightweight mode may close with notes-only evidence if the notes clearly record changed files, validation performed, outcomes, known gaps, and next action.

Full mode is complete only when the closeout records:

- files changed
- validation performed
- acceptance criteria status
- review findings
- model/agent ledger, including reasoning intensity when available
- fix cycles and escalations
- known gaps
- next action
