# GPT-5.6-First Agentic Delivery Simplification

Status: direction approved; written design awaiting review  
Date: 2026-07-10

## Objective

Reduce the Agentic Delivery Playbook to a small, verifiable delivery kernel and make GPT-5.6 Sol, Terra, and Luna its only actively maintained routing profile.

The redesigned playbook should preserve the controls that materially reduce delivery risk:

- explicit objective, boundaries, and completion evidence
- narrow implementation scope
- verification against the approved contract and actual diff
- escalation when execution drifts or repeatedly fails
- bounded parallelism with one writer per file or coupled file cluster

It should remove duplicated policy, obsolete provider/model matrices, mandatory low-value artifacts, and routing ceremony that cannot be verified.

## Decision summary

The redesign will use:

1. One portable, capability-based delivery kernel.
2. One maintained model profile: GPT-5.6 Sol, Terra, and Luna.
3. Two process modes: `Direct` and `Controlled`.
4. A three-dimensional route: model tier, reasoning effort, and agent topology.
5. One normalized lane/evidence record instead of repeated role, ledger, route, and evaluation structures.
6. Codex and ChatGPT Work as the first-class execution surfaces.
7. Legacy provider-specific material retained only when historically useful and clearly marked unsupported.

The redesign is GPT-5.6-first, not GPT-5.6-hardcoded at the kernel level. The kernel describes required capabilities; the maintained profile resolves those capabilities to current GPT-5.6 routes.

## Non-goals

- Support or benchmark every model provider.
- Preserve DeepSeek, GPT-5.2 through GPT-5.5, Hermes, or Pi-specific routing matrices as active policy.
- Build a general-purpose orchestrator, queue, dashboard, or agent runtime.
- Treat model choice as a substitute for tests, deterministic checks, or human authority.
- Claim token or cost savings before comparative evaluation supports them.
- Change the user's global Codex configuration as part of this redesign.
- Preserve the existing document and template layout when it conflicts with simplification.

## Design principles

### Process weight follows risk, not file count

Classification will use:

- intent ambiguity
- consequence and blast radius
- reversibility
- public contract or state impact
- security, privacy, auth, payment, financial, or destructive behavior
- quality of available verification
- coupling between writers or systems

File count is supporting context, not a mode boundary. A one-line permission change can require Controlled mode; a mechanical twenty-file rename with strong tests can remain Direct.

### Routing is separate from process

The selected process mode does not directly name a model. Each route is recorded as:

```text
model tier + reasoning effort + agent topology
```

Examples:

```text
Luna + low + single
Terra + medium + explicit-subagent
Sol + high + single
Sol + max + ultra-proactive
```

This prevents `Ultra`, high reasoning, stronger model tiers, and multi-agent execution from being treated as the same decision. In the normalized route, the runtime's `Ultra` preset is recorded as maximum reasoning plus `ultra-proactive` topology; the raw runtime label is retained separately when available.

### Evidence beats narration

The final status must be derived from captured evidence. A statement that a command passed is not equivalent to the command, exit status, and associated output reference.

### One orchestration plane

A run may use:

- a single agent,
- explicitly launched bounded subagents, or
- native Ultra delegation.

It must not layer an additional recursive fanout policy on top of Ultra by default. Nested delegation requires a recorded reason, depth cap, concurrency cap, and synthesis barrier.

### Same-family review is not automatically independent

Changing Sol to Terra or Luna does not satisfy an independence requirement. Independent review requires a separate context or thread, adversarial review instructions, and direct access to the approved contract, actual diff, and validation evidence. Deterministic tools and human review remain stronger independent signals.

## Process model

### Direct mode

Use Direct mode when intent is clear, effects are reversible or low-consequence, and completion is objectively verifiable.

Direct mode requires:

- a concise statement of the intended change
- the smallest correct edit
- relevant validation
- a final report of changed files, results, assumptions, and known gaps

Direct mode does not require a spec directory, run ledger, approval gate, independent reviewer, or explicit model-routing ceremony.

A short inline checklist is allowed when it improves clarity; it does not create a third process mode.

### Controlled mode

Use Controlled mode when any of the following is material:

- unresolved product or architecture intent
- public contract, state, provider, data-flow, or cross-system behavior
- security, privacy, authentication, payments, financial logic, destructive actions, or external authority
- costly or difficult rollback
- weak or disputed verification
- broad implementation with multiple independently executable slices
- multi-agent writing that needs ownership and synthesis controls

Controlled mode requires:

1. A compact approved contract.
2. Explicit route policy or an approved route exception when the minimum safe route cannot be verified.
3. Bounded implementation ownership.
4. Validation tied to acceptance criteria.
5. Review of the actual diff and evidence.
6. Honest closeout or escalation.

If the user explicitly requested the complete approved outcome end-to-end, implementation does not stop for repeated slice approvals. It stops only for new scope, unresolved product decisions, authority changes, route failure below the safe minimum, or repeated contradictory evidence.

## Compact delivery contract

Controlled work uses one contract containing only:

- objective
- non-goals
- acceptance criteria
- risk and authority constraints
- allowed ownership or files when needed
- verification plan
- unresolved decisions

The contract may live in the task for bounded work. A file artifact is required only when the work is long-running, broad, sensitive, handed between agents, or needs durable approval evidence.

There is no mandatory three-file artifact bundle for ordinary bounded work.

## GPT-5.6 routing profile

The profile is grounded in the current official [GPT-5.6 release](https://openai.com/index/gpt-5-6/), [Codex model guide](https://developers.openai.com/codex/models), [Codex subagent guide](https://developers.openai.com/codex/multi-agent), and [Codex configuration reference](https://developers.openai.com/codex/config-reference). It must be versioned and rechecked when model or Codex behavior changes.

### Default routes

| Task shape | Route | Notes |
| --- | --- | --- |
| Clear, repeatable, high-volume, objectively checkable | Luna low or medium, single | Extraction, classification, mechanical transformation, structured summaries, deterministic edits |
| Everyday bounded implementation, repository exploration, ordinary QA | Terra medium or high, single or focused subagent | Default workhorse route |
| Ambiguous, difficult, high-value, architecture-sensitive, or risky | Sol high, single | Default judgment route |
| Hardest tightly coupled problem where depth matters | Sol max, single | Prefer this over fanout when work cannot be divided safely |
| Broad work with genuinely independent lanes | Sol max with Ultra topology, or explicit capped Terra/Luna subagents | Requires a synthesis barrier; most tasks do not qualify |
| High-risk final review or repeated failure escalation | Sol high or max in a fresh context | Reviewer receives contract, diff, and evidence, not only the implementer summary |

### Escalation rules

Escalate route only from evidence:

```text
Luna -> Terra
```

when the task stops being mechanical, ambiguity appears, validation needs interpretation, or one focused retry fails.

```text
Terra -> Sol
```

when architecture, security, public contracts, hidden coupling, repeated failure, or difficult trade-offs appear.

```text
Sol high -> Sol max
```

when a tightly coupled problem needs deeper single-agent analysis.

```text
single -> Ultra or explicit subagents
```

only when independent lanes can materially improve time or evidence quality and ownership is clear.

Higher effort is not an unlimited retry mechanism. After two fix cycles, reopen the contract, split the task, or ask for a decision.

### Route verification

Normal runs may use a project-approved default without asking the user to approve the model again.

Route verification blocks implementation only when:

- Controlled work requires a minimum tier or effort,
- the runtime cannot confirm or satisfy it, and
- deterministic validation or task narrowing cannot adequately compensate.

Otherwise record the observed route or `runtime-default` without making model-specific claims.

### Recommended Codex agent profiles

The maintained profile should provide narrow project agents such as:

- `mechanical_worker`: Luna low/medium
- `explorer`: Terra medium, read-only
- `worker`: Terra high
- `reviewer`: Sol high, read-only
- `escalation_reviewer`: Sol max, read-only

Use Terra medium as the project default. Select Sol medium or higher explicitly when task risk or judgment requirements justify it. Do not make Ultra the project-wide default.

Set agent nesting depth to one unless a specific approved run proves deeper recursion is necessary.

## Minimal run record

A durable run record is required only for Controlled work that is broad, sensitive, long-running, delegated, or audit-relevant.

The record should normalize execution into one `lanes` collection:

```json
{
  "mode": "controlled",
  "contract": {
    "path": "specs/example/contract.md",
    "sha256": "sha256:contract-content",
    "approvalEvidence": "task-message-id"
  },
  "source": {
    "baseCommit": "git-commit-sha",
    "finalCommit": null,
    "diffSha256": "sha256:reviewed-diff"
  },
  "lanes": [
    {
      "id": "worker-1",
      "role": "worker",
      "taskShape": "bounded-implementation",
      "requested": {
        "model": "gpt-5.6-terra",
        "effort": "high",
        "agentMode": "explicit-subagent"
      },
      "observed": {
        "model": "gpt-5.6-terra",
        "effort": "high",
        "runtimePreset": null,
        "threadId": "thread-id-or-unknown",
        "source": "project-settings"
      },
      "status": "accepted",
      "evidence": ["validation:npm-test"]
    }
  ],
  "validation": [
    {
      "id": "npm-test",
      "command": "npm test",
      "exitCode": 0,
      "startedAt": "2026-07-10T10:00:00Z",
      "endedAt": "2026-07-10T10:01:00Z",
      "outputPath": "artifacts/npm-test.log",
      "outputSha256": "sha256:validation-output"
    }
  ],
  "acceptance": [
    {
      "criterion": "relevant automated tests pass",
      "status": "met",
      "evidence": ["validation:npm-test"]
    }
  ],
  "findings": [],
  "knownGaps": [],
  "status": "accepted"
}
```

Role summaries, route enforcement, model evaluation, handoff telemetry, and reviewer results must reference these lane records rather than duplicate them.

## Repository architecture

The active design should converge on a small set of sources:

```text
playbook.md                         canonical delivery kernel
profiles/gpt-5.6.md                maintained human routing policy
adapters/codex/AGENTS.md           thin Codex execution adapter
adapters/chatgpt/instructions.md   thin ChatGPT Work adapter
templates/contract.md              compact Controlled-mode contract
templates/run.json                 compact durable evidence record
docs/evaluation.md                 comparative evaluation protocol
legacy/                            unsupported historical adapters and routing guides
```

The initial implementation will not add a duplicate JSON routing profile. Codex agent TOML files are the machine-executable configuration; `profiles/gpt-5.6.md` remains the human source of routing policy.

### Support boundary

First-class support:

- GPT-5.6 Sol, Terra, and Luna
- Codex desktop, CLI, and IDE surfaces where route selection and subagents are available
- ChatGPT Work where the required tools and model controls are available

Portable but not actively model-routed:

- the abstract delivery kernel
- external runtimes that can honor the contract and evidence requirements

Legacy or unsupported:

- active DeepSeek routing policy
- GPT-5.2 through GPT-5.5 recommendation matrices
- provider-specific claims without current route verification
- adapters that require the same semantic rule to be manually maintained across the repository

## Duplication controls

- One file is the canonical source for each semantic rule.
- Active adapters may translate surface syntax but must not redefine process policy.
- A semantic policy change should normally update the kernel, profile, and at most one affected adapter/template cluster.
- Add automated checks for stale model names, JSON validity, broken links, and required routing/evidence fields.
- Installed skill/version metadata must make drift visible.

Target size budgets:

- canonical kernel: at most 150 lines
- GPT-5.6 profile: at most 120 lines
- Codex adapter: at most 180 lines
- durable run template: at most 120 lines

Exceeding a budget requires removing duplication before adding new policy.

## Failure handling

### Route unavailable

Use the next safe configured route. If the result would fall below a Controlled task's minimum safe route, narrow the task, add compensating deterministic checks, or ask the user to decide.

### Worker timeout or unusable output

Mark the lane failed. Inspect any edits as untrusted. Retry once with a narrower contract, replace the route, or use an explicit parent takeover. Do not report the failed lane as passed.

### Conflicting parallel edits

Stop at the synthesis barrier, resolve ownership, rerun affected validation, and record which output was accepted or rejected.

### Contract or product ambiguity discovered during implementation

Stop the affected lane and return the decision to the parent or user. A child agent must not silently make product or architecture decisions outside its contract.

### Evidence missing or contradictory

Do not close as accepted. Mark the relevant criterion unknown, rerun the check, or record an explicitly accepted gap.

## Evaluation strategy

The redesign must separate process value from routing value. Use the same representative tasks across four arms:

1. Sol medium, no playbook beyond the normal prompt.
2. Sol medium, simplified delivery kernel.
3. Simplified delivery kernel with routed Luna/Terra/Sol lanes.
4. Sol Ultra, used as the high-compute comparison arm.

Include clear mechanical tasks, bounded feature work, ambiguous architecture work, a broad decomposable task, and at least one high-risk review task.

Randomize arm order, evaluate outcomes without revealing the route when practical, and use at least three repetitions per task and arm when cost permits.

Measure:

- acceptance criteria satisfied
- escaped defects and review findings
- implementation drift and unapproved decisions
- fix cycles and human interventions
- wall-clock duration
- input, output, and cached tokens when available
- total model cost or credits when available
- accepted, rejected, and duplicative subagent lanes

Decision rules:

- If arm 2 does not materially outperform arm 1 on drift, defects, or human burden, simplify the kernel further.
- If arm 3 does not reduce total cost or time without degrading quality versus arm 2, remove most explicit tier routing.
- If arm 4 dominates quality and total economics on representative work, prefer Sol Ultra and retain only the intent/evidence controls.
- Do not publish savings claims from a single run or from provider benchmarks alone.

## Migration shape

Implementation should proceed in bounded stages:

1. Establish the new kernel and vocabulary without deleting legacy material.
2. Add the GPT-5.6 profile and Codex agent configuration.
3. Replace the run schema and contract template.
4. Convert Codex and ChatGPT Work adapters into thin translations.
5. Move unsupported routing guides and adapters to legacy status.
6. Add conformance checks and the evaluation harness or protocol.
7. Run comparative evaluation before changing public claims.

The implementation plan must define exact ownership and migration barriers so the existing dirty working tree is not overwritten or accidentally committed.

## Acceptance criteria

- Active policy has only two process modes: Direct and Controlled.
- Active routing policy records tier, effort, and agent topology separately.
- GPT-5.6 is the only maintained concrete model profile.
- No active recommendation matrix depends on DeepSeek or GPT-5.2 through GPT-5.5.
- Luna, Terra, Sol, Max, and Ultra have explicit non-overlapping operating guidance.
- Ultra is not the default and recursive delegation defaults to depth one.
- Same-family tier changes do not satisfy independent-review claims by themselves.
- Ordinary Direct work creates no run artifacts.
- Ordinary bounded Controlled work can use one compact contract without a three-file bundle.
- Durable runs use one normalized lane collection and captured validation metadata.
- Spec approval and final review can be tied to immutable hashes or equivalent provenance.
- Semantic rules are not manually duplicated across all adapters and docs.
- Unsupported adapters and historical routing material are clearly separated from active policy.
- Automated checks validate active model references, JSON artifacts, and documentation consistency.
- Public cost or quality claims remain qualified until comparative evaluation passes.
- Existing unrelated working-tree changes remain preserved throughout implementation.

## Design risks

- Two modes may classify some medium-risk work differently across agents. Mitigation: explicit Controlled triggers and scenario tests.
- A GPT-5.6-only profile may reduce adoption among users of other providers. Mitigation: keep the kernel capability-based and permit external profiles without maintaining them here.
- Codex model controls may change. Mitigation: version the profile, record observed routes, and keep current model strings out of the kernel.
- Archiving adapters may break existing installation expectations. Mitigation: document the support boundary and migration path before removal.
- Evidence capture can itself become ceremony. Mitigation: require durable records only for broad, sensitive, long-running, delegated, or audit-relevant work.

## Ready-for-planning condition

This design is ready for an implementation plan when the user confirms:

- the two-mode Direct/Controlled process,
- GPT-5.6 as the only maintained routing profile,
- Codex and ChatGPT Work as first-class surfaces, and
- legacy status for other provider-specific routing and adapters.
