# Adapters

The core playbook is portable. Adapters translate it into specific coding-agent harnesses.

## Existing adapters

```text
adapters/pi/SKILL.md
```

The Pi adapter packages the workflow as a Pi skill.

For Claude, Claude Code, ChatGPT, and Codex usage without a formal adapter, see [`getting-started.md`](getting-started.md).

## Adapter expectations

An adapter should define:

- when to trigger the workflow
- how to create run artifacts
- how to route or record agents/models
- how to ask for approval
- how to run implementation QA
- how to close out evidence

Provider-specific model names should be examples or configuration, not hard requirements for the portable playbook.

## Suggested future adapters

- Claude Code command pack
- Codex CLI prompt pack
- Cursor rules
- GitHub Copilot workspace instructions
- Generic Markdown checklist
