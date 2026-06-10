# Model Ledger

Record model routing for each role in the run. One row per role or per distinct task.

| Role | Intended Model | Actual Model | Source | Reason | Task | Result | Notes |
|------|---------------|-------------|--------|--------|------|--------|-------|
| specAuthor | `gpt-5.5` | `gpt-5.5` | explicit | Strong planning for broad-ticket spec | Auth refactor spec | completed | Reasoning intensity: high |
| critic | `gpt-5.4` | `gpt-5.4` | explicit | Architecture-oriented critique | Auth refactor critique | completed | No spec ambiguity found |
| implementer | `deepseek-v4-flash` | `deepseek-v4-flash` | explicit | Bounded file-scoped implementation after checklist approval | Parser regression tests | completed | No routing exception |
| implementer | `deepseek-v4-flash` | `gpt-5.3-codex-spark` | exception-approved | DeepSeek failed 2 fix cycles on state-machine subtask | Order state handler | completed | Escalated per policy |
| qaReviewer | `gpt-5.3-codex-spark` | `gpt-5.3-codex-spark` | explicit | Code correctness review | Final diff review | completed | 0 blockers, 2 low findings |
| escalationReviewer | `gpt-5.4` | `gpt-5.4` | explicit | Architecture drift diagnosis | Drift analysis | completed | Spec ambiguity identified |

## Source Values

| Source | Meaning |
|--------|---------|
| `explicit` | The run requested this model directly |
| `agent-default` | An agent profile supplied the routing |
| `runtime-default` | The harness chose it implicitly |
| `manual` | A human selected it outside the run configuration |
| `exception-approved` | A routing exception was explicitly approved |
| `unknown-legacy` | Routing cannot be determined for older/interrupted runs |

## Rules

- Never invent model usage.
- Record `Actual Model: unknown` if the harness did not expose the model.
- Record `Source: manual` if the user manually switched models.
- Record routing exceptions honestly.
- Direct mode does not require a ledger unless requested.