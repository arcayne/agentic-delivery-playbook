# Closeout governance

Use this as a final gate before closing a playbook run.

## Required checks

Project-specific commands:

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

## Process weight and handoff economics

```text
Observability source: <PI_OBS_DB | harness telemetry | manual estimate | unavailable>
Wall-clock duration:
Sum model duration:
Critical path:
Turns:
Input tokens:
Output tokens:
Cache read/write tokens:
Approx cost:
Tool calls:
Model mix:
Accepted lanes / launched lanes:
Rejected or superseded lanes:
Timeouts / failed gates:
Fix cycles:
Handoff overhead note:
Counterfactual baseline: <all-strongest-high-xhigh | parent-only | unknown>
Cost likely lower than baseline: <yes | no | unknown>
Quota risk: <low | medium | high | unknown>
Public observability artifact: <path | none | unavailable>
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
