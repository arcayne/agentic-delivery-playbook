# Public run reports

Public run reports are sanitized summaries of agentic delivery runs. They let people compare workflow choices - parent-only, scouts, planners, workers, reviewers, recursive slices, and model mixes - without exposing raw prompts, secrets, customer data, or private local telemetry.

The goal is not a universal model leaderboard. The goal is a public dataset of workflow evidence by task shape:

```text
For this kind of task, did the handoff/model mix/review lane actually help?
```

See also [`handoff-economics.md`](handoff-economics.md) for the measurement model.

## What to publish

A useful public report has this shape:

```text
public-runs/<date>-<safe-run-slug>/
  README.md              human-readable summary
  run-report.json        machine-readable sanitized report
  lanes.csv              flat lane table for quick analysis
  sanitize-checklist.md  completed privacy review checklist
  artifacts/             optional sanitized context/review/synthesis artifacts
```

Recommended minimum: `README.md`, `run-report.json`, and `lanes.csv`.

Optional artifacts are useful when they help readers audit the report, but do not publish raw session logs by default.

## What not to publish

Do not publish:

- raw session JSONL
- raw prompts containing private context
- secrets, API keys, tokens, credentials, cookies, or env values
- private customer/user data
- raw provider responses
- internal absolute paths when a repo-relative path is enough
- proprietary code snippets beyond what is already public in the repo
- screenshots that reveal private dashboards, accounts, billing, chat IDs, or unrelated projects

If a field cannot be safely reported, write `redacted` or `unknown`.

## Privacy tiers

Use an explicit privacy tier in every report.

| Tier | Meaning | Suitable for public aggregation |
| --- | --- | --- |
| `public-summary` | Only metrics, sanitized summary, commit SHAs, validation commands | Yes |
| `public-artifacts` | Summary plus sanitized context/review artifacts | Yes, if reviewed |
| `private-raw-available` | Public summary exists, raw local logs retained privately | Yes |
| `private-only` | Not safe to publish | No |

Default to `public-summary` unless the artifacts have been reviewed for privacy.

## Required public fields

Human report should answer:

1. What was the task shape?
2. What harness and workflow were used?
3. Which model/agent did which lane?
4. What did the whole operation take: wall time, sum model time, tokens, tool calls, and cost if available?
5. Which lanes were accepted, rejected, failed, duplicated, or superseded?
6. What validation commands were run?
7. What was the final outcome?
8. What was the handoff overhead?
9. What would you route differently next time?
10. What data is missing or unknown?

Machine report should follow [`../templates/public-run-report/run-report.schema.json`](../templates/public-run-report/run-report.schema.json).

## Lane status vocabulary

Use consistent lane statuses:

| Status | Meaning |
| --- | --- |
| `accepted` | Parent used the output substantially |
| `accepted-with-edits` | Parent used it after material synthesis/fixes |
| `rejected` | Output was not used |
| `failed-gate` | Harness/acceptance/timeout failure |
| `superseded` | Later lane or parent work replaced it |
| `duplicative` | Correct but added little new value |
| `unknown` | Not evaluated |

A failed harness gate may still produce a useful artifact. In that case record both:

```text
lane.status = failed-gate
lane.acceptedUse = used-as-context | none | unknown
```

## Handoff overhead fields

At minimum, report:

```text
parent setup: known | unknown
child context loading: known | unknown
coordination/status checks: known | unknown
synthesis time: known | unknown
merge/conflict overhead: known | unknown
rework caused: yes | no | unknown
```

For early reports, approximations are fine if labeled as estimates. Missing data should be `unknown`.

## Counterfactual baseline

Every serious report should name a baseline:

| Baseline | Use when |
| --- | --- |
| `parent-only` | Comparing delegation against doing it in one session |
| `all-strongest-high-xhigh` | Comparing model mix against strongest model everywhere |
| `single-worker` | Comparing recursive slices against one implementation worker |
| `unknown` | No credible baseline |

Do not claim savings unless cost/quality evidence supports it.

Good:

```text
Cost likely lower than all-xhigh: unknown. Medium context lanes were cheaper per lane, but the acceptance format failed and parent synthesis overhead is not measured.
```

Bad:

```text
This saved 80% because the context lanes used a cheaper model.
```

## Public artifact review checklist

Before publishing:

- [ ] Report uses repo-relative paths or sanitized paths.
- [ ] No secrets, tokens, credentials, cookies, env values, or private IDs.
- [ ] No private customer/user data.
- [ ] No raw provider responses.
- [ ] No raw session JSONL.
- [ ] Model/agent labels are from actual telemetry, not guesses.
- [ ] Missing cost/pricing fields are `unknown`.
- [ ] Failed/rejected lanes are included, not hidden.
- [ ] Validation commands and outcomes are included.
- [ ] Public artifacts were manually reviewed for privacy.

## Contribution workflow

1. Copy [`../templates/public-run-report/`](../templates/public-run-report/) into a safe report folder, e.g. `public-runs/2026-06-22-hermes-audience-signal-desk/`.
2. Rename `README.template.md` to `README.md` and `run-report.template.json` to `run-report.json`.
3. Fill `README.md` and `run-report.json`.
4. Fill `lanes.csv` from the same lane data.
5. Add sanitized artifacts only when needed.
6. Validate JSON locally:

```bash
node -e "JSON.parse(require('fs').readFileSync('public-runs/<run>/run-report.json','utf8')); console.log('json ok')"
```

7. Review the privacy checklist.
8. Open a PR or publish the report in a gist/repo and link it.

## Aggregation questions

Once multiple people contribute reports, useful analysis becomes possible:

- When does a planner pay for itself?
- When do parallel context builders save wall-clock time vs waste tokens?
- Which model/agent works as a narrow implementer without high rework?
- Does xhigh review catch enough material issues to justify cost?
- How often do acceptance-format failures waste otherwise useful work?
- Which task shapes should stay parent-only?
- Which harnesses make telemetry easiest to verify publicly?

The point is not to crown a universal winner. The point is to build public evidence for choosing the right process and model mix for a given task shape.
