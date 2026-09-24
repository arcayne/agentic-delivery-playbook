# Codex adapter

1. Review and merge `AGENTS.md` into the target repository's existing `AGENTS.md`.
2. Optionally review `../../profiles/codex/`, then copy its contents into the target `.codex/` directory without overwriting local choices.

The repository instructions implement Direct and Controlled delivery. The project configuration defaults to `gpt-6-luna` with `high` reasoning effort and registers bounded GPT-6 worker/reviewer examples. Nothing here should be copied into global Codex configuration without an explicit user decision.
