# Adapters

The core playbook is portable. Adapters translate it into specific coding-agent harnesses.

## Existing adapters

```text
adapters/chatgpt/
  README.md
  instructions.md
adapters/claude/
  SKILL.md
  workflow.md
adapters/pi/SKILL.md
```

The ChatGPT adapter packages the workflow as Project/custom-GPT instructions. ChatGPT does not currently use Claude-style skill folders, so install it by pasting `adapters/chatgpt/instructions.md` into ChatGPT Project instructions, custom GPT instructions, or the start of a session.

The Claude adapter packages the workflow as a self-contained Claude skill. Its `SKILL.md` is intentionally concise and points to `workflow.md` as supporting material. Install it with `npx agentic-delivery-playbook install claude`, or copy/upload the whole `adapters/claude/` folder according to your Claude environment's skill installation flow.

The Pi adapter packages the workflow as a Pi skill.

For Claude Code project memory, slash-command setup, and Codex usage without a formal adapter, see [`getting-started.md`](getting-started.md).

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
