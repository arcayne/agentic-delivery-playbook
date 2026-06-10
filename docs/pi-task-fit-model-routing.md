# Pi Task-Fit Model Routing

Why routing is task-fit first, when DeepSeek is safe, when strong models are required, how to escalate, and worked examples for Direct, Lightweight, and Full modes.

This is the supporting guide for the Pi adapter's task-fit model routing policy. The operational summary lives in `adapters/pi/SKILL.md`; this document explains the reasoning.

## Core principle

```text
Do not route by price first.
Route by task shape first.
Then choose the cheapest safe model for that shape.
```

The invariant:

```text
The harder the task, the more strong-model judgment happens before and after implementation.
The narrower the task, the safer it is to delegate implementation to a cheaper worker.
```

## When DeepSeek is safe

DeepSeek V4 Flash is a capable implementation worker, but it should not make architecture decisions. It is safe to use when:

| Safe | Not safe |
|------|---------|
| Purely mechanical edits | Architecture decisions |
| File-scoped implementations | Spec writing or critique |
| Boilerplate and test templates | Auth/session design |
| Narrow transformations | Provider wiring design |
| Refactors with no public contract change | State-machine design |
| Parser case additions | Money/trading logic design |
| Regression test additions | Cross-package contract decisions |

Before delegating to DeepSeek, the parent agent must reduce the task to a narrow, bounded unit with:

- an approved spec or checklist excerpt,
- allowed files,
- non-goals,
- validation commands.

## When strong models are required

Strong Codex/OpenAI models (`gpt-5.4`, `gpt-5.5`, `gpt-5.3-codex-spark`) are required for:

| Role | Required model tier | Why |
|------|-------------------|-----|
| Spec author | `gpt-5.4` or `gpt-5.5` | Ambiguity resolution, architecture, edge cases |
| Spec critic | `gpt-5.4`, `gpt-5.5`, or `gpt-5.3-codex-spark` | Skeptical review, security/privacy awareness |
| Escalation reviewer | `gpt-5.3-codex-spark` or `gpt-5.4` | Drift diagnosis, spec ambiguity detection |
| Final code reviewer | `gpt-5.3-codex-spark` | Code correctness, test quality, typing |
| Final architecture reviewer | `gpt-5.4` or `gpt-5.5` | Cross-system tradeoffs, risk assessment |

## DeepSeek implementation contract

When using DeepSeek V4 Flash, the task must already be narrow. Use this prompt shape:

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

## Escalation review contract

Stop cheap implementation loops and escalate when:

- DeepSeek fails more than two fix cycles,
- the same failure category reappears,
- implementation drifts from the approved spec,
- tests fail due to hidden coupling or architecture,
- security/privacy/provider/auth/money/trading/state-machine risk appears,
- implementation touches unrelated files,
- the parent has to revert the implementer,
- the user explicitly asks for stronger review.

### Escalation target

| Problem type | Escalation model |
|-------------|-----------------|
| Code correctness, tests, typing, refactor quality | `gpt-5.3-codex-spark` |
| Architecture, requirements ambiguity, product behavior, provider design, state-machine design, cross-system tradeoff | `gpt-5.4` |
| Highest risk or complexity | `gpt-5.5` |

### Escalation prompt shape

```text
You are the escalation reviewer.

Review:
- approved spec/checklist,
- implementation diff,
- validation evidence,
- failure history,
- model ledger if present.

Your job:
- identify why the implementation is failing or drifting,
- distinguish implementation error from spec ambiguity,
- recommend whether to:
  1. continue with DeepSeek using narrower instructions,
  2. switch implementation to a stronger Codex/OpenAI model,
  3. revise the spec,
  4. stop and ask the human,
- list blocker findings first,
- provide a minimal recovery plan.

Do not rewrite the whole feature unless necessary.
Do not broaden scope.
Do not approve final merge unless acceptance criteria and validation evidence
are satisfied.
```

## Final review contract

For Full mode, risky Lightweight mode, or user-requested review, perform final review before merge or closeout.

### Reviewer choice

| Review scope | Model |
|-------------|-------|
| Final code correctness review | `gpt-5.3-codex-spark` |
| Architecture/product-risk review | `gpt-5.4` |
| Highest-risk final judgment | `gpt-5.5` |

### Review checklist

```text
- Does the diff satisfy every acceptance criterion?
- Did implementation respect non-goals?
- Were there unapproved architecture changes?
- Were public contracts, schemas, APIs, commands, or config changed?
- Are tests meaningful?
- Are skipped tests or missing validation recorded?
- Are security/privacy/provider/state risks addressed?
- Are there brittle assumptions?
- Is the diff smaller than expected, appropriate, or suspiciously broad?
- Should this merge, require fixes, or reopen the spec?
```

### Verdict format

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

## Examples

### Direct mode example: typo fix

**Task:** Fix a typo in a README section heading.

**Routing:**

```text
Active model: current Pi model (default)
DeepSeek: not needed
Spec: not created
Run directory: not created
```

**Closeout:**

```text
Mode: Direct
Active model/lane: gpt-5.4 (Pi default)
Files changed: README.md
Validation: Visual inspection
Result: Typo corrected
Known gaps: None
```

### Lightweight mode example: parser case addition

**Task:** Add a parser case for a new error format in an existing log parser.

**Routing:**

```text
1. Spec/checklist: gpt-5.4 (current Pi model)
2. Implementation: DeepSeek V4 Flash
3. Review: parent self-review
```

**Closeout:**

```text
Mode: Lightweight
Spec/checklist: gpt-5.4
Implementation model: DeepSeek V4 Flash
Review model: parent self-review
Fix cycles: 0
Files changed: src/parser.js, test/parser.test.js
Validation: npm test (all passing)
Result: New parser case handles 'TIMEOUT_ERROR' format
Known gaps: None
```

### Full mode example: auth provider integration

**Task:** Integrate a new OAuth provider into the authentication system.

**Routing:**

```text
1. Spec author: gpt-5.5
2. Spec critic: gpt-5.4
3. Human approves spec
4. Broad-ticket decomposition: gpt-5.4
   - Ticket 1: Provider config schema
   - Ticket 2: Token exchange handler
   - Ticket 3: Session integration
5. Implementer per ticket:
   - Ticket 1: DeepSeek V4 Flash (narrow config change)
   - Ticket 2: DeepSeek V4 Pro (token exchange needed reasoning)
   - Ticket 3: gpt-5.3-codex-spark (session state is sensitive)
6. Final code review: gpt-5.3-codex-spark
7. Risk review: gpt-5.4
```

**Closeout:**

```text
Mode: Full
Spec: gpt-5.5
Spec critic: gpt-5.4
Implementation subtasks: 3
Implementation models: DeepSeek V4 Flash, DeepSeek V4 Pro, gpt-5.3-codex-spark
Escalations: 1 (Ticket 2 required stronger model after failed DeepSeek attempt)
Final reviewer: gpt-5.4
Files changed: 12
Validation: npm test, npm run lint, provider integration test suite
Known gaps: Rate-limit retry not implemented (explicitly out of scope)
Final verdict: approve
Next action: Merge when CI passes
```