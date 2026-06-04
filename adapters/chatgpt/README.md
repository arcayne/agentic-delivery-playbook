# ChatGPT adapter

ChatGPT does not currently use Claude-style `SKILL.md` folders. Use this adapter as Project instructions, custom GPT instructions, or a pasted session instruction.

## Install in a ChatGPT Project

1. Create or open a ChatGPT Project.
2. Open the Project instructions.
3. Paste the contents of [`instructions.md`](instructions.md).
4. Add repository docs or files as Project knowledge only when useful for the task.

## Install in a custom GPT

1. Create or edit a custom GPT.
2. Paste the contents of [`instructions.md`](instructions.md) into the instruction field.
3. Optionally upload `playbook.md`, templates, or example specs as knowledge.
4. Keep the GPT configured to avoid claiming tests or code changes unless it has tool evidence.

## One-off use

Paste [`instructions.md`](instructions.md) at the start of a chat and then describe the task.
