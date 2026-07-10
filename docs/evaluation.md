# Evaluation protocol

## Question

Does the simplified kernel improve delivery outcomes, and does routing among GPT-5.6 Luna, Terra, and Sol add value beyond using Sol medium for every task?

## Arms

1. Sol medium without the playbook.
2. Sol medium with the simplified kernel.
3. Routed GPT-5.6 family with the simplified kernel.
4. Sol Ultra high-compute comparison.

## Corpus

Use frozen tasks across mechanical, bounded implementation, ambiguous architecture, high-risk review, and broad decomposable work. Each task includes a hidden reference outcome, deterministic checks where possible, and a fixed authority boundary. Run arms in fresh contexts, randomize order, and use at least three repetitions per task and arm when cost permits.

## Measures

- acceptance-criterion completion
- critical and non-critical defects in the actual diff
- focused fix cycles before acceptance
- unsupported claims about tests, routes, or review
- elapsed time and token usage when the runtime exposes them
- total model cost or credits when the runtime exposes them
- human intervention and unresolved decisions
- accepted, rejected, and duplicative delegated lanes

Do not substitute narrative quality for code/evidence quality. Report unavailable telemetry as unavailable.

## Review

Use task-specific deterministic checks first. Use blinded human review for consequential qualitative judgments. A fresh Sol context may provide an additional review signal, but same-family review is not labeled independent.

## Decision rules

- If arm 2 does not materially outperform arm 1 on drift, defects, or human burden, simplify the kernel further.
- If arm 3 does not reduce total cost or time without degrading quality versus arm 2, remove most explicit tier routing.
- If arm 4 dominates quality and total economics on representative work, prefer Sol Ultra and retain only the intent and evidence controls.
- If confidence intervals overlap materially or the corpus is too small, record the result as inconclusive rather than claiming a win.

## Reporting

Publish task-level results, aggregate medians and rates, route observations, failures, exclusions, and the frozen protocol version. Do not publish cost or quality claims that the collected evidence cannot reproduce.

## Protocol version

Protocol version: 1.0.

Before the first run, record the materiality threshold for each decision metric and freeze it with the task corpus. Do not change the four arms or decision rules without recording a new protocol version.

## Run sheet

Record one row for every arm, task, and repetition with these exact fields:

    protocolVersion, taskId, taskStratum, arm, repetition, randomizedOrder,
    promptSha256, baseCommit, requestedModel, requestedEffort, requestedTopology,
    observedModel, observedEffort, observedRuntimePreset, routeSource,
    startedAt, endedAt, elapsedSeconds, inputTokens, cachedTokens, outputTokens,
    modelCostOrCredits, acceptancePassed, acceptanceTotal, criticalDefects,
    nonCriticalDefects, fixCycles, unsupportedClaims, humanInterventions,
    acceptedLanes, rejectedLanes, duplicativeLanes, outcome, exclusions, notes

Use unavailable for telemetry that the runtime does not expose. Record route observations rather than inferring them from the requested route.

## Aggregate result table

Publish one row per arm and task stratum:

| arm | task stratum | repetitions | completion rate | median acceptance rate | critical-defect rate | median fix cycles | median human interventions | median elapsed time | median tokens | median cost/credits | completion confidence interval | defect confidence interval | cost/time confidence interval |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| example only | example only | 0 | unavailable | unavailable | unavailable | unavailable | unavailable | unavailable | unavailable | unavailable | unavailable | unavailable | unavailable |

Freeze the materiality threshold for every decision metric with the corpus before collecting results.
