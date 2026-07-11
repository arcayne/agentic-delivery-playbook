# Model & Reasoning Ledger

Use this ledger for Lightweight and Full mode runs.

Direct mode does not require a ledger unless requested.

| Role | Intended Model | Actual Model | Reasoning | Source | Reason | Task | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| specAuthor | `gpt-5.4` | `gpt-5.4` | high | explicit | Strong planning for full spec | Routing example spec | completed | Reasoning intensity: high |
| childImplementer | `deepseek-v4-flash` | `deepseek-v4-flash` | low | explicit | Bounded implementation task | Parser-case child task | completed | No architecture decisions delegated |
| childReviewer | `gpt-5.3-codex-spark` | `gpt-5.3-codex-spark` | medium | explicit | Code correctness review for child diff | Regression test review | completed | Clean review |
| finalCodeReview | `gpt-5.3-codex-spark` | `gpt-5.3-codex-spark` | medium | explicit | Final code correctness review | Full diff review | completed | 0 blockers |
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
