# Spec: Classification-First Routing for Ambiguous Trading Command

## Mode

Full

## Objective

Ensure ambiguous or actionable trading commands are classified before pending prompt handlers consume them, so safety-critical trading intent is routed deterministically and not mistaken for a reply to an unrelated pending flow.

## Non-Goals

- Do not place live orders.
- Do not change broker/provider execution behavior.
- Do not redesign all routing.
- Do not introduce autonomous trading.
- Do not bypass human confirmation.
- Do not change unrelated Telegram command behavior.

## Risk

High, because incorrect routing can cause unsafe, confusing, or money-impacting trading behavior.

## Model Plan

Spec/planning: gpt-5.4, high reasoning  
Implementation subtasks: DeepSeek V4 Flash or gpt-5.4-mini, low reasoning  
Code review: gpt-5.3-codex-spark, medium/high reasoning  
Architecture/risk review: gpt-5.4, high reasoning

## Child Tasks

1. Add parser/classifier coverage for ambiguous trading phrases.
2. Add regression tests for pending-flow interruption and routing precedence.
3. Add a short docs note explaining the routing invariant.

## Acceptance Criteria

- Actionable trading commands are classified before pending prompt handlers consume them.
- Existing pending prompt behavior still works for non-actionable replies.
- Ambiguous trading phrases are covered by parser/classifier examples.
- Regression tests cover pending-flow interruption cases.
- No live execution path is introduced.
- No autonomous trading behavior is introduced.
- Human confirmation remains required before any execution action.
- Final review compares the complete example against this parent spec.

## Recursive Decomposition

Parent task: Full

Child tasks:

- 01 parser case — Lightweight
- 02 regression tests — Lightweight
- 03 docs note — Direct

Each child task is independently classified and uses its own model/reasoning lane.

## Validation Plan

- Manual example consistency check.
- Confirm child tasks match this parent spec.
- Confirm evidence and final-review files reference this routing narrative.
- Confirm DeepSeek is scoped only to bounded implementation child tasks.
- Confirm Direct child task remains low-friction.

## Closeout Requirements

The example closeout should show:

- parent Full task,
- child task completion,
- model/reasoning usage,
- validation evidence,
- final review verdict,
- known gaps.
