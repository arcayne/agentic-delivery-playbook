---
name: agentic-delivery-playbook
description: Spec-gated delivery workflow for non-trivial coding-agent work, with task-fit model routing and recursive decomposition. Use when a feature, refactor, integration, workflow, or bug fix needs an approved spec before implementation, especially when ambiguity, safety, privacy, security, cross-package changes, or agent drift risk is meaningful.
---

# Agentic Delivery Playbook

Use this skill to turn ambiguous implementation work into an approved, AI-ready contract before coding.

Core stance: classify the task first, route by task mode second, then pick the lowest safe model lane and the lowest safe reasoning level. The goal is not "cheapest model first"; it is "task shape → delivery mode → model lane → reasoning level".

Use this skill when the user asks to use the Agentic Delivery Playbook, route by task fit, decompose a Full task recursively, use DeepSeek only for scoped implementation, or use Codex/Spark for review.

## Delivery loop

```text
0. triage
1. intake
2. spec authoring
3. spec critique
4. approval gate
5. implementation
6. implementation QA
7. fix or escalate
8. closeout
```

## Scope triage: choose process weight first

Before choosing models, delegating reviewers, or creating artifacts, classify the request by process weight. Use the least intrusive mode that can safely produce evidence.

### Direct mode

Use Direct mode when all are true:

- the change is clear and low ambiguity
- it likely touches one or two files
- it is a typo fix, small docs edit, obvious one-file bug fix, simple test, trivial config edit, or other low-risk mechanical change
- there is no security, privacy, auth, payment, financial, destructive, external-provider, or irreversible-action risk
- there is no cross-package or public contract change
- validation is obvious and narrow
- the user did not explicitly ask for a spec-first run

Direct mode rules:

- do not create a run directory
- do not require specs, model ledgers, or run artifacts unless requested
- do not over-plan
- edit, validate, and report changed files plus evidence
- if hidden complexity appears, upgrade to Lightweight or Full

### Lightweight mode

Use Lightweight mode for bounded work that benefits from a compact spec or checklist.

Signals:

- roughly two to five files or one package
- acceptance criteria are mostly clear after at most one or two questions
- risk is low or medium
- a compact spec/checklist is enough

Lightweight mode rules:

- create only the minimal run artifacts when the run is explicit
- keep the spec/checklist compact
- parent self-review is acceptable when no serious risk signal appears
- do not add an independent critic, broad-ticket planning gate, or high-risk QA checklist unless risk appears
- if the task broadens, upgrade to Full mode

### Full mode

Use Full mode when any are true:

- product or architecture ambiguity is meaningful
- safety, security, privacy, auth, external-provider, or destructive behavior is involved
- the change affects routing, state machines, provider wiring, config, public contracts, or command semantics
- it likely touches more than five files
- failure would be costly or hard to detect
- the user asks for end-to-end spec-gated delivery

Full mode rules:

- create explicit artifacts when the run is active
- use a strong planner/reviewer before implementation when the spec is too large for one implementer pass
- use a critic/QA gate, preferably independent when available
- apply high-risk QA checks for sensitive or cross-system work
- use dynamic workflow/fanout only after a plain-English launch note is approved
- accept workflow findings only after synthesis plus independent verification, or mark them speculative
- complete required closeout fields with evidence, model ledger, known gaps, fix cycles, and next action

When unsure, tell the user the classification and ask whether they want Direct, Lightweight, or Full mode.

## Harness ladder and dynamic workflow guardrail

Use the smallest harness that safely fits the work:

```text
direct prompt -> skill -> subagent -> chain / agent team -> goal loop -> dynamic workflow
```

A goal loop is depth: one objective, repeated passes, stop when completion is true. A dynamic workflow is width: many agents run in parallel, then a synthesizer folds the results into one answer.

Before launching a dynamic workflow or large parallel fanout, stop and present a short launch note for approval. The note should include scope, a concrete cap, a stop rule, and the synthesis/verification plan. Do not create blank budget fields.

## Task-Fit Model Routing

Model choice is determined by task mode, not by price preference.

```text
Task shape → Delivery mode → Model lane → Reasoning level
```

The hard invariant:

```text
Route by task mode first.
Use the lowest safe process.
Use the lowest safe reasoning level.
Escalate when failure or risk appears.
```

This policy assumes the following example lanes may be available in Pi/OpenAI workflows:

```text
gpt-5.3-codex-spark
gpt-5.4
gpt-5.4-mini
gpt-5.5
deepseek-v4-flash
deepseek-v4-pro
```

These are examples, not hard requirements.

### Direct Mode Model Policy

Default: current active Pi model.

Examples when already active:

- gpt-5.4-mini
- gpt-5.3-codex-spark

Rules:

- do not switch models just to optimize cost
- do not require DeepSeek
- do not require Codex review
- do not create run artifacts unless requested
- do not require a model ledger unless requested
- validate and close with evidence

DeepSeek V4 Flash may be used only as optional overflow when:

- the current active model is unavailable
- OpenAI credits are exhausted or intentionally being preserved
- the task is purely mechanical
- there is no architecture, product, state, provider, auth, trading, money, or irreversible-action risk

Reasoning policy:

```text
minimal / low / runtime-default
```

Closeout format:

```text
Mode: Direct
Active model/lane:
Reasoning level:
Files changed:
Validation:
Result:
Known gaps:
```

### Lightweight Mode Model Policy

Use for bounded changes that need a compact spec or checklist before implementation.

Model policy:

- Spec/checklist: current strong Pi model, gpt-5.4, or similar
- Implementation: DeepSeek V4 Flash or gpt-5.4-mini once the task is narrow and file-scoped
- Review: parent self-review unless risk or failure appears
- Escalation: gpt-5.3-codex-spark or gpt-5.4 after two failed DeepSeek fix cycles or any meaningful drift

Rules:

- create a compact checklist/spec first
- the parent agent must first reduce the work into a narrow implementation task
- DeepSeek should receive only the approved task, relevant spec/checklist excerpt, allowed files, non-goals, and validation commands
- DeepSeek should not make architecture decisions
- DeepSeek should not broaden scope
- if implementation fails twice, stop blind retries and escalate
- if the task becomes broader than expected, upgrade to Full mode

Reasoning policy:

```text
Spec/checklist: medium if ambiguity exists
Implementation: low / non-thinking
Review: low or medium
Escalation: medium/high
```

Closeout format:

```text
Mode: Lightweight
Spec/checklist:
Implementation model:
Reasoning level:
Review model:
Fix cycles:
Files changed:
Validation:
Result:
Known gaps:
```

### Full Mode Model Policy

Use for broad, ambiguous, cross-package, stateful, provider-level, auth, privacy, security, API, trading, money, irreversible-action, or drift-prone work.

Model policy:

- Spec/planning: gpt-5.4, gpt-5.5, Codex Pro, or the strongest available planner
- Spec critique: gpt-5.4, gpt-5.5, or gpt-5.3-codex-spark depending on critique type
- Narrow implementation: DeepSeek V4 Flash or gpt-5.4-mini after decomposition
- Hard implementation fallback: DeepSeek V4 Pro, gpt-5.3-codex-spark, or gpt-5.4
- Final code review: gpt-5.3-codex-spark
- Final architecture/risk review: gpt-5.4 or gpt-5.5

Rules:

- do not let DeepSeek implement the whole broad task directly
- create a Full spec first
- critique the spec before implementation
- decompose into child tasks
- reclassify each child task as Direct, Lightweight, or Full
- use DeepSeek only for narrow child tasks
- child routing follows child mode, not parent mode
- parent Full mode does not force high reasoning on all child tasks
- final review must compare the diff against the approved spec

Reasoning policy:

```text
Spec author: high
Spec critic: high
Implementation subtasks: low once scoped
Hard implementation fallback: medium/high
Final code review: medium/high
Final architecture/risk review: high
```

Closeout format:

```text
Mode: Full
Spec:
Spec critic:
Implementation subtasks:
Implementation models:
Reasoning levels:
Escalations:
Final reviewer:
Files changed:
Validation:
Known gaps:
Final verdict:
Next action:
```

## OpenAI / Codex Model Examples

These are examples when available in Pi, not hard requirements.

### gpt-5.4-mini

Role: small/default OpenAI implementation model.

Use for:

- Direct tasks
- small implementation
- simple tests
- low-risk docs/code changes
- quick validation fixes

Reasoning:

```text
minimal / low
```

Avoid for:

- major architecture
- ambiguous product behavior
- trading/money/security-sensitive decisions
- high-risk final review

### gpt-5.3-codex-spark

Role: code-specialist lane.

Use for:

- code review
- test failure diagnosis
- implementation escalation
- patch refinement
- final code correctness review
- fast coding iteration

Reasoning:

```text
low for direct coding
medium/high for review or repeated failure
```

Avoid as the primary lane for broad product/system architecture.

### gpt-5.4

Role: default strong planning and architecture model.

Use for:

- Lightweight checklist/spec when ambiguity exists
- Full spec authoring
- architecture decisions
- API/provider design
- state-machine reasoning
- requirements ambiguity
- architecture/risk review

Reasoning:

```text
medium for lightweight spec
high for full spec and architecture review
```

### gpt-5.5

Role: highest-judgment lane.

Use for:

- high-risk architecture
- trading/money/security-sensitive decisions
- irreversible-action safety
- complex multi-system refactors
- final judgment when stakes are high

Reasoning:

```text
high
```

Avoid for routine implementation and Direct mode tasks.

## DeepSeek Usage Policy

DeepSeek is not the Direct-mode default.

Use DeepSeek when:

- the task is already scoped
- the implementation unit is narrow
- allowed files are known
- acceptance criteria are explicit
- validation commands are known
- no architecture decision remains

### DeepSeek V4 Flash

Role: cheap bounded implementation worker.

Use for:

- Lightweight implementation after checklist approval
- Full-mode child subtasks after decomposition
- test additions
- mechanical implementation
- overflow when OpenAI credits are constrained

Reasoning:

```text
low / non-thinking
```

Avoid for:

- architecture
- ambiguous requirements
- final review
- trading/money/auth/security decisions

### DeepSeek V4 Pro

Role: heavier bounded implementation fallback.

Use only when:

- Flash is insufficient
- the task is still bounded
- the issue does not require architecture judgment

Escalate to OpenAI/Codex instead if the failure is architectural, ambiguous, or risk-related.

## Reasoning / Thinking Budget Policy

Default rule:

```text
Use the lowest reasoning level that is safe for the task mode.
Increase reasoning only when ambiguity, risk, failed validation, or architectural judgment requires it.
```

Allowed values:

```text
off
minimal
low
medium
high
runtime-default
unknown
```

Core invariant:

```text
Reasoning is for judgment.
Execution is for implementing approved judgment.
```

Rules:

- do not keep high thinking enabled by default
- strong specs should reduce implementation reasoning
- implementation from a clear spec should usually use low or non-thinking mode
- escalate reasoning when repeated failures or ambiguity appear
- recalculate reasoning level per child task
- record reasoning intensity whenever the harness exposes it

## Recursive Task Decomposition

Core rule:

```text
Full mode plans and decomposes.
Lightweight mode scopes and implements bounded behavior.
Direct mode performs obvious small edits.
```

Pattern:

```text
Full problem
  → child Lightweight tasks
    → child Direct tasks where appropriate
  → child evidence
  → parent final review
```

Rules:

- Full tasks may decompose into child tasks
- each child task is independently classified
- child model routing follows child mode, not parent mode
- a parent Full task does not force high reasoning on all child tasks
- the parent aggregates child evidence
- final review compares the total diff against the parent spec
- escalate back upward when a child contradicts the parent spec, reveals missing requirements, needs files outside the allowed scope, or fails for the same root cause across multiple child tasks

Escalation result must be one of:

```text
continue-child
revise-child
revise-parent-spec
split-new-full-task
stop-and-ask-human
```

## Model & Reasoning Ledger

Required for:

- Lightweight mode
- Full mode

Not required for Direct mode unless requested.

Possible locations:

```text
specs/YYYYMMDD-HHMM-task-slug/run.json
specs/YYYYMMDD-HHMM-task-slug/model-ledger.md
```

Example JSON entry:

```json
{
  "role": "implementer",
  "intendedModel": "deepseek-v4-flash",
  "actualModel": "unknown",
  "reasoningIntensity": "low",
  "source": "explicit",
  "reason": "Task was bounded by an approved checklist and allowed files",
  "task": "Implemented parser regression tests",
  "result": "completed",
  "notes": "No architecture decisions delegated to implementer."
}
```

Allowed `source` values:

```text
explicit
agent-default
runtime-default
manual
exception-approved
unknown-legacy
```

Rules:

- never invent model usage
- use `actualModel: unknown` if Pi does not expose it
- use `source: manual` if the user manually switched models
- record reasoning level when known
- record routing exceptions honestly
- Direct mode does not require a ledger unless requested

## DeepSeek Implementation Contract

```text
You are the implementation worker.

Implement only this approved task:
<task>

Approved spec/checklist:
<spec path or relevant excerpt>

Scope:
- Allowed files:
<files>
- Do not touch:
<non-goals>

Rules:
- Make the smallest correct change.
- Do not refactor unrelated code.
- Do not change public behavior outside the spec.
- Do not make architecture decisions.
- Do not update run artifacts unless asked.
- Use low / non-thinking reasoning unless instructed otherwise.
- Run the specified validation.
- If the task is ambiguous, stop and report the ambiguity.
- If tests fail, attempt one focused fix cycle and report evidence.

Return:
- files changed
- summary of changes
- validation commands run
- exact test/typecheck/lint outcome
- assumptions
- unresolved issues
```

## Escalation Rules

Escalate when:

- DeepSeek fails more than two fix cycles
- the same failure category reappears
- implementation drifts from the approved spec
- tests fail due to hidden coupling or architecture
- security, privacy, provider, auth, money, trading, or state-machine risk appears
- implementation touches unrelated files
- the parent has to revert implementer edits
- the user explicitly asks for stronger review

Escalation target:

- Use gpt-5.3-codex-spark for code correctness, tests, typing, refactor quality, or implementation detail.
- Use gpt-5.4 for architecture, requirements ambiguity, product behavior, provider design, state-machine design, or cross-system tradeoff.
- Use gpt-5.5 when risk or complexity justifies the highest-judgment lane.

## Escalation Review Contract

```text
You are the escalation reviewer.

Review:
- approved spec/checklist,
- implementation diff,
- validation evidence,
- failure history,
- model/reasoning ledger if present.

Your job:
- identify why the implementation is failing or drifting,
- distinguish implementation error from spec ambiguity,
- recommend whether to:
  1. continue with DeepSeek using narrower instructions,
  2. switch implementation to a stronger Codex/OpenAI model,
  3. revise the child task,
  4. revise the parent spec,
  5. stop and ask the human,
- list blocker findings first,
- provide a minimal recovery plan.

Do not rewrite the whole feature unless necessary.
Do not broaden scope.
Do not approve final merge unless acceptance criteria and validation evidence are satisfied.
```

## Final Review Contract

Use for:

- Full mode
- risky Lightweight mode
- user-requested review
- before merge or closeout when risk is meaningful

Reviewer choice:

```text
gpt-5.3-codex-spark = final code correctness review
gpt-5.4 = architecture/product-risk review
gpt-5.5 = highest-risk final judgment
```

Review checklist:

- Does the diff satisfy every acceptance criterion?
- Did implementation respect non-goals?
- Were there unapproved architecture changes?
- Were public contracts, schemas, APIs, commands, or config changed?
- Are tests meaningful?
- Are skipped tests or missing validation recorded?
- Are security, privacy, provider, and state risks addressed?
- Are there brittle assumptions?
- Is the diff smaller than expected, appropriate, or suspiciously broad?
- Should this merge, require fixes, or reopen the spec?

Verdict format:

```text
Verdict: approve | approve-with-notes | request-changes | reopen-spec

Blockers:
High:
Medium:
Low:
Validation evidence:
Known gaps:
Recommended next action:
```

## Operational Banner

At phase changes, print a compact banner:

```text
Workflow: agentic-delivery-playbook
Mode: Direct | Lightweight | Full
Role: spec | implementation | review | escalation | closeout
Model lane: <intended model/lane>
Reasoning: <off|minimal|low|medium|high|runtime-default|unknown>
Next gate: <approval|implementation|validation|escalation|final-review|closeout>
```

## Closeout Requirements

Direct closeout:

```text
Mode: Direct
Active model/lane:
Reasoning level:
Files changed:
Validation:
Result:
Known gaps:
```

Lightweight closeout:

```text
Mode: Lightweight
Spec/checklist:
Implementation model:
Reasoning level:
Review model:
Fix cycles:
Files changed:
Validation:
Result:
Known gaps:
```

Full closeout:

```text
Mode: Full
Spec:
Spec critic:
Implementation subtasks:
Implementation models:
Reasoning levels:
Escalations:
Final reviewer:
Files changed:
Validation:
Known gaps:
Final verdict:
Next action:
```

For Lightweight and Full runs, keep the run artifacts explicit when the run is active.

Minimum files:

```text
spec.md or spec.html
run.json
notes.md
```

If using `spec.html`, prefer a local preview when the harness supports it so the human approves the rendered spec instead of raw source.

## Existing playbook behavior to preserve

- classify the task before implementation
- avoid over-planning small tasks
- require specs or checklists for non-trivial work
- validate against acceptance criteria
- close with evidence
- escalate when work drifts
- keep honest records of model and reasoning usage
- never claim a model-specific result unless that model was actually routed and recorded
