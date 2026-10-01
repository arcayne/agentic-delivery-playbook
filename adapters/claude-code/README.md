# Claude Code adapter

A Claude Code plugin that applies the Direct and Controlled kernel in the terminal CLI and the desktop app. Routes are defined in [`profiles/claude-5.md`](../../profiles/claude-5.md).

## What it provides

- Skill `/agentic-delivery-playbook:deliver` (explicit invoke only).
- Agents `adp-worker` (Sonnet 5.5, medium, sole Controlled writer), `adp-reviewer` (Opus 5.5, medium, fresh context), `adp-explorer` (Sonnet 5.5, low, read-only tools), and escalation agents `adp-worker-high` and `adp-reviewer-high` (high effort).
- The reviewer is read-only by instruction; Bash is available for diff and checks; enforced by an orchestrator before/after worktree fingerprint (index tree including untracked files, plus HEAD).
- `agentic-delivery-playbook probe claude` for requested versus observed route evidence.

## Install

Terminal and desktop app (Code tab) use the same commands:

```text
/plugin marketplace add arcayne/agentic-delivery-playbook
/plugin install agentic-delivery-playbook@agentic-delivery-playbook
```

To try it without installing, run `claude --plugin-dir <path-to-this-repo>`.

## Orchestrator route

Plugins cannot set the main session model. Optionally merge [`templates/claude-settings.template.json`](../../templates/claude-settings.template.json) (`claude-opus-5-5`, effort `medium`) into your project's `.claude/settings.json`. Review and merge it by hand; it is never auto-applied and this plugin never edits your settings. The skill's Controlled preflight stops when the session route does not match the profile.

## Route evidence

```text
npx agentic-delivery-playbook probe claude <session.jsonl> [--agents-dir <dir>]
```

The transcript is `~/.claude/projects/<cwd with / replaced by ->/<session-id>.jsonl`. You can also run `node <installed plugin path>/bin/agentic-delivery-playbook.js probe claude <session.jsonl>`; the skill runs the probe for you at closeout. The probe prints JSON with the requested route (from the agent definitions currently on disk, with `definitionPath` relative to `agentsDir`; foreign-namespace agents are `unmatched`) and the observed route (`message.model`, `perTurnEffort`, `entrypoint`) for the main session and each subagent. It is read-only. `entrypoint` comes from an environment variable and is not attestation of surface.

## Known gaps

- Interactive desktop Code-tab sessions loading plugin agents are not separately verified; headless CLI and desktop-environment runs showed identical routes.
- Plugin install through the desktop app has not been exercised beyond `--plugin-dir`.
- The plugin root is the repo root, so the root `bin/` is a plugin executable directory (per the docs this may block claude.ai/Cowork distribution), and `legacy/`, `specs/` and `.pi/` ship in the plugin cache. Moving the plugin root is deferred.
- A bare, unnamespaced `adp-worker` (for example a project-local agent with the same name) is matched to the plugin definition; the probe cannot tell them apart.
- Probe output paths are shown cwd-relative or with `~`, never as raw home-directory paths.
- Aliases can drift; agents use full model IDs and the profile should be rechecked after model releases.
- The optional orchestrator settings are startup configuration, not route attestation.
