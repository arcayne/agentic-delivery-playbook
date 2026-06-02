# Closeout governance

Use this as a final gate before closing a playbook run.

## Required checks

Project specific commands:

```text
<typecheck command>
<lint command>
<test command>
<workflow audit command, if any>
```

## Evidence integrity

- [ ] Pass/fail status is recorded for each required check.
- [ ] Warnings are recorded, not hidden.
- [ ] Missing checks are listed as known gaps or approved exceptions.
- [ ] The run does not claim model or agent routing that was not actually used.
- [ ] Legacy or pre governance runs are marked clearly instead of backfilled with invented evidence.

## Closeout decision

- [ ] Ship
- [ ] Continue fixes
- [ ] Split follow up ticket
- [ ] Stop and ask human

Decision notes:

```text
<notes>
```
