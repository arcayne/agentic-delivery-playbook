# Adapters

The playbook is Pi-first and portable second. The primary adapter is the Pi skill; other adapters translate the same delivery discipline into specific coding-agent harnesses.

## Existing adapters

```text
adapters/pi/SKILL.md
adapters/claude/
  SKILL.md
  workflow.md
adapters/codex/
  AGENTS.md
  README.md
adapters/chatgpt/
  README.md
  instructions.md
```

## Pi skill

The Pi adapter packages the workflow as a Pi skill. It is intentionally a value gate: use it when classification, approval, routing truth, or evidence will change the work; skip it for clear direct edits.

Install globally:

```bash
npx github:arcayne/agentic-delivery-playbook install pi
```

Install into the current project:

```bash
npx github:arcayne/agentic-delivery-playbook install pi --project
```

Invoke in Pi:

```text
/skill:agentic-delivery-playbook <task>
```

Pi skill commands use `/skill:agentic-delivery-playbook`; the bare `/agentic-delivery-playbook` form is for Claude-style skill environments.

## Portable adapters

The Claude adapter packages the workflow as a self-contained Claude skill. Its `SKILL.md` is intentionally concise and points to `workflow.md` as supporting material. Install it with `npx agentic-delivery-playbook install claude`, or copy/upload the whole `adapters/claude/` folder according to your Claude environment's skill installation flow.

The Codex adapter packages the workflow as repository instructions. Install it by copying `adapters/codex/AGENTS.md` into the target repository root, or merge it into an existing `AGENTS.md`.

The ChatGPT adapter packages the workflow as Project/custom-GPT instructions. ChatGPT does not currently use skill folders, so install it by pasting `adapters/chatgpt/instructions.md` into ChatGPT Project instructions, custom GPT instructions, or the start of a session.

For Claude Code project memory and slash-command setup, see [`getting-started.md`](getting-started.md).

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
- Cursor rules
- GitHub Copilot workspace instructions
- Generic Markdown checklist
