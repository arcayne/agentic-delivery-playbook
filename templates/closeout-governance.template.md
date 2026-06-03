# Closeout governance

Use this as a final gate before closing a playbook run.

## Required checks

Project specific commands:

```text
<typecheck command>
<lint command>
<test command>
<workflow audit command, if any>
<observability or ROI command, if available>
```

## Evidence integrity

- [ ] Pass/fail status is recorded for each required check.
- [ ] Warnings are recorded, not hidden.
- [ ] Missing checks are listed as known gaps or approved exceptions.
- [ ] Observability/ROI data is recorded when available; if unavailable, the reason is noted.
- [ ] Telemetry scripts use portable configuration such as `PI_OBS_DB`; no personal absolute paths are committed.
- [ ] The run does not claim model or agent routing that was not actually used.
- [ ] Legacy or pre governance runs are marked clearly instead of backfilled with invented evidence.

## Process weight

```text
Observability source: <PI_OBS_DB | harness telemetry | manual estimate | unavailable>
Sessions:
Turns:
Output tokens:
Approx cost:
Model mix:
Classification: <lightweight | justified-broad | overused | unknown>
Budget note:
```

## Closeout decision

- [ ] Ship
- [ ] Continue fixes
- [ ] Split follow up ticket
- [ ] Stop and ask human

Decision notes:

```text
<notes>
```
