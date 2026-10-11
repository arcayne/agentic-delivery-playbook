# Smoke test (Task 13)

Checkout: `<checkout>` (branch `feat/three-tier-pr1`, HEAD d48c2ae)

## Claude Code version

`claude --version`: `2.1.286 (Claude Code)`

## Plugin validation

- `claude plugin validate .claude-plugin/plugin.json`: exit 0, "Validation passed" (plugin manifest).
- `claude plugin validate .`: exit 0, "Validation passed" (marketplace manifest `.claude-plugin/marketplace.json`).

## Headless session (init event)

Command: `claude -p --plugin-dir "$PWD" --output-format stream-json --verbose "Reply with the single word ok."`

The init event (`"subtype":"init"`) was emitted and has an `agents` field. Plugin loaded as `agentic-delivery-playbook` version 0.4.0, source `agentic-delivery-playbook@inline`.

Plugin agents in the `agents` array (all eight present):

- `agentic-delivery-playbook:adp-explorer`
- `agentic-delivery-playbook:adp-goal-reviewer`
- `agentic-delivery-playbook:adp-lead`
- `agentic-delivery-playbook:adp-reviewer`
- `agentic-delivery-playbook:adp-reviewer-high`
- `agentic-delivery-playbook:adp-validator`
- `agentic-delivery-playbook:adp-worker`
- `agentic-delivery-playbook:adp-worker-high`

Full `agents` array as printed (other entries come from the user's other plugins and built-ins):

```
["agentic-delivery-playbook:adp-explorer","agentic-delivery-playbook:adp-goal-reviewer","agentic-delivery-playbook:adp-lead","agentic-delivery-playbook:adp-reviewer","agentic-delivery-playbook:adp-reviewer-high","agentic-delivery-playbook:adp-validator","agentic-delivery-playbook:adp-worker","agentic-delivery-playbook:adp-worker-high","claude","claude-code-guide","Explore","feature-dev:code-architect","feature-dev:code-explorer","feature-dev:code-reviewer","general-purpose","Plan","statusline-setup","superpowers:code-reviewer"]
```

## Skill

`agentic-delivery-playbook:deliver` appears in both the `skills` and the `slash_commands` fields of the init event.

## Caveat

The session itself ended with `is_error: true`, `terminal_reason: api_error`, message "Failed to authenticate: OAuth session expired and could not be refreshed" (process exit code 1). The init event is emitted before the model call, so the agent and skill listing above is unaffected, but no model reply ("ok") was obtained. The plugin and its agents were not exercised by a live model turn.
