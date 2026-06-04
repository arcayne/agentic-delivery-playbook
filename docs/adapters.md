# Adapters

The core playbook is portable. Adapters translate it into specific coding-agent harnesses.

## Existing adapters

```text
adapters/claude/
  SKILL.md
  workflow.md
adapters/pi/SKILL.md
```

The Claude adapter packages the workflow as a self-contained Claude skill. Its `SKILL.md` is intentionally concise and points to `workflow.md` as supporting material. Install it with `npx agentic-delivery-playbook install claude`, or copy/upload the whole `adapters/claude/` folder according to your Claude environment's skill installation flow.

The Pi adapter packages the workflow as a Pi skill.

For Claude Code project memory, slash-command setup, ChatGPT, and Codex usage without a formal adapter, see [`getting-started.md`](getting-started.md).

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
