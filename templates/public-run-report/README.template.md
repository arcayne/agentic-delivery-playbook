# Public run report: <run title>

Schema version: 0.1  
Privacy tier: <public-summary | public-artifacts | private-raw-available | private-only>  
Report date: <YYYY-MM-DD>  
Reporter: <name/handle optional>

## Summary

<One paragraph: what the run attempted, what workflow/harness was used, and the final outcome.>

## Task shape

| Field | Value |
| --- | --- |
| Repo / project | <repo URL or private/redacted> |
| Commit before | `<sha | unknown>` |
| Commit after | `<sha | none | unknown>` |
| Task type | <bugfix | broad-prd | feature | refactor | review | migration | research | other> |
| Risk categories | <privacy, auth, data, provider, public contract, money, etc.> |
| Scope summary | <packages/surfaces touched or inspected> |

## Harness and workflow

| Field | Value |
| --- | --- |
| Harness | <Pi | Claude Code | Codex | other> |
| Harness version | <version | unknown> |
| Workflow | <parent-only | scout+worker+reviewer | recursive slices | dynamic workflow | other> |
| Goal used | <yes/no/id> |
| Route policy | <project-settings | explicit | runtime-default | exception-approved | unknown> |

## Whole-operation metrics

| Metric | Value |
| --- | --- |
| Wall-clock duration | <duration | unknown> |
| Sum model duration | <duration | unknown> |
| Critical path | <lane ids | unknown> |
| Total input tokens | <number | unknown> |
| Total output tokens | <number | unknown> |
| Cache read/write tokens | <number | unknown> |
| Tool calls | <number | unknown> |
| Approx cost | <amount | unknown> |
| Accepted lanes / launched lanes | <n>/<n> |
| Fix cycles | <number> |
| Failed gates / timeouts | <number> |

## Lane breakdown

See [`lanes.csv`](lanes.csv).

| Lane | Role | Model | Reasoning | Status | Accepted use | Duration | Tokens | Cost |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| <lane id> | <role> | <model> | <level> | <status> | <use> | <duration> | <tokens> | <cost> |

## Handoff economics

| Question | Answer |
| --- | --- |
| What was the handoff overhead? | <parent setup + child startup + coordination + synthesis + conflicts/rework, or unknown> |
| Did parallelism reduce wall-clock time? | <yes/no/unknown + evidence> |
| Did cheaper/weaker lanes cause rework? | <yes/no/unknown + evidence> |
| Was model mix likely cheaper than baseline? | <yes/no/unknown + evidence> |
| Counterfactual baseline | <parent-only | all-strongest-high-xhigh | single-worker | unknown> |

## Accepted outputs

- <lane/artifact/path> - <how it was used>

## Rejected, failed, duplicated, or superseded outputs

- <lane/artifact/path> - <why it was not accepted>

## Validation evidence

```text
<command> - <passed/failed/skipped>
```

Manual checks:

- <check> - <result>

## Privacy and redaction notes

- Raw logs published: no
- Raw prompts published: no
- Secrets/customer data present: no
- Sanitization notes: <notes>

## Lessons learned

- <What should be routed the same next time?>
- <What should be routed differently next time?>
- <What telemetry was missing?>

## Linked artifacts

- [`run-report.json`](run-report.json)
- [`lanes.csv`](lanes.csv)
- <optional sanitized artifact links>
