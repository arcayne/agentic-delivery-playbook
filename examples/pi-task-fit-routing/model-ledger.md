# Model & Reasoning Ledger

| Role | Intended Model | Actual Model | Reasoning | Source | Reason | Task | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| specAuthor | `gpt-5.4` | `gpt-5.4` | high | explicit | Strong planning for the parent spec | Classification-first routing spec | completed | Full parent task |
| childImplementer | `deepseek-v4-flash` | `deepseek-v4-flash` | low | explicit | Narrow, file-scoped child implementation | 01 parser case | completed | No architecture decisions delegated |
| childImplementer | `deepseek-v4-flash` | `deepseek-v4-flash` | low | explicit | Narrow, test-only child implementation | 02 regression tests | completed | Scoped implementation worker only |
| childReviewer | `gpt-5.3-codex-spark` | `gpt-5.3-codex-spark` | medium | explicit | Code correctness review for child work | Child diff review | completed | No blockers |
| finalCodeReview | `gpt-5.3-codex-spark` | `gpt-5.3-codex-spark` | medium | explicit | Final code correctness review | Full diff review | completed | approve-with-notes |
| finalRiskReview | `gpt-5.4` | `gpt-5.4` | high | explicit | Architecture/risk review | Final risk review | completed | approve-with-notes |

## Source Values

- explicit
- agent-default
- runtime-default
- manual
- exception-approved
- unknown-legacy

## Reasoning Values

- off
- minimal
- low
- medium
- high
- runtime-default
- unknown

## Rules

- Do not invent model usage.
- Use `actualModel: unknown` if the runtime does not expose it.
- Use `source: manual` if the user manually switched model.
- Record routing exceptions honestly.
