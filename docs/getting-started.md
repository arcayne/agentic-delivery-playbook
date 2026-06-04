# Getting started with the Agentic Delivery Playbook

This is the general onboarding guide for using the playbook with common AI tools: Claude, Claude Code, ChatGPT, and Codex.

The playbook is tool-neutral. Use it as either:

- **a Claude skill** when your Claude environment supports skills
- **persistent project instructions** for coding agents that can edit a repo, such as Claude Code or Codex
- **copy/paste review prompts** for chat models, such as Claude or ChatGPT

The same rule applies in every tool: choose the smallest safe process, write a spec only when the task needs one, get approval before implementation unless the human asked for an end-to-end run, and close with evidence.

## Start here

1. If your agent edits the repo, add persistent instructions:
   - Claude: install the self-contained skill in `adapters/claude/` when your Claude environment supports skills.
   - Claude Code: use the Claude skill, `CLAUDE.md`, or the slash command below.
   - Codex: use `AGENTS.md` or paste the universal prompt.
2. If your assistant is chat-only and skills are unavailable, use it as a spec author, critic, or QA reviewer by pasting the reusable role prompts below.
3. For every task, ask the assistant to classify the work first: direct, lightweight, or full.
4. For non-direct work, approve the spec before implementation unless you explicitly want an end-to-end run.
5. At closeout, require evidence: changed files, commands run, results, known gaps, and next action.

## Universal quick prompt

Paste this into any assistant when you want the playbook applied:

```text
Use the Agentic Delivery Playbook for this task.

First classify the task as one of:
- direct: clear, low-risk, narrow edit; no run directory
- lightweight: bounded work that needs a compact spec/checklist
- full: broad, ambiguous, security/privacy/provider/state/API, or drift-prone work

If direct, make the smallest correct change, run the obvious validation, and report changed files plus evidence.

If lightweight or full:
1. Create specs/YYYYMMDD-HHMM-<slug>/ with spec.md, run.json, and notes.md.
2. Draft an implementation-ready spec with objective, non-goals, acceptance criteria, risks, and verification plan.
3. Critique the spec for ambiguity, hidden assumptions, missing tests, and safety/privacy/security gaps.
4. Stop for human approval before implementation unless I explicitly say “continue end-to-end”.
5. Implement only against the approved spec.
6. QA the diff against the spec, not against the implementer summary.
7. Close out with changed files, validation commands/results, known gaps, model/agent routing if available, and next action.

Do not invent evidence. If routing/model choice cannot be controlled, record runtime-default and avoid model-specific claims.

Task:
<describe the task here>
```

## Claude

### Option A: Claude skill

Use the self-contained skill adapter when your Claude environment supports skills:

```text
adapters/claude/
  SKILL.md
  workflow.md
```

Install it with `npx`:

```bash
# User skill, available across projects
npx agentic-delivery-playbook install claude

# Or project skill, available in one repo
npx agentic-delivery-playbook install claude --project
```

Until the package is published to npm, install from GitHub:

```bash
npx github:arcayne/agentic-delivery-playbook install claude
```

The installer copies the whole `adapters/claude/` directory into the selected Claude skills location so supporting files remain available. The skill command name comes from the install directory, for example `/agentic-delivery-playbook`. If your Claude environment uses upload/import instead of local skill folders, upload the whole `adapters/claude/` folder, not just `SKILL.md`.

Then ask Claude to use the Agentic Delivery Playbook for the task.

### Option B: prompt-only Claude chat

Use Claude chat when you want a strong planner, critic, or QA reviewer.

Good uses:

- draft a lightweight or full spec before any coding agent edits files
- critique a spec for ambiguity, missing acceptance criteria, or unsafe assumptions
- review a pasted diff against an approved spec
- help decide whether the task should be direct, lightweight, or full mode

Suggested prompt:

```text
Act as the Agentic Delivery Playbook spec critic.
Review the spec below before implementation.
Find vague requirements, contradictions, missing edge cases, unsafe assumptions, and missing verification.
Classify findings as blocker, high, medium, low, or spec ambiguity.
Do not claim code was changed or tests passed unless I provide that evidence.

Spec:
<paste spec>
```

For QA review, paste the approved spec and the diff, then ask Claude to verify every acceptance criterion and non-goal.

## Claude Code

Use Claude Code when you want the playbook to run inside the repository.

### Option A: project memory

Add a compact rule to `CLAUDE.md`:

```markdown
# Agentic Delivery Playbook

For non-trivial coding work, use the Agentic Delivery Playbook.

1. Classify the task first: direct, lightweight, or full.
2. Direct mode: no run directory; edit narrowly, validate, and report evidence.
3. Lightweight/full mode: create specs/YYYYMMDD-HHMM-<slug>/ with spec.md, run.json, and notes.md.
4. Draft and critique the spec before implementation.
5. Stop for human approval before coding unless the user explicitly says continue end-to-end.
6. Implement only against the approved spec.
7. QA the diff against the spec and close out with evidence.
8. Do not invent evidence or claim model-specific routing unless it was actually controlled and recorded.
```

### Option B: slash command

Create a project command:

```bash
mkdir -p .claude/commands
cat > .claude/commands/agentic-delivery.md <<'EOF'
Use the Agentic Delivery Playbook for this task:

$ARGUMENTS

Classify the task as direct, lightweight, or full before editing.
For direct mode, edit narrowly and validate.
For lightweight/full mode, create specs/YYYYMMDD-HHMM-<slug>/ with spec.md, run.json, and notes.md, draft and critique the spec, then stop for approval before implementation unless I said continue end-to-end.
After implementation, QA against the approved spec and close out with changed files, validation, known gaps, and next action.
EOF
```

Then run Claude Code in the repo and invoke:

```text
/agentic-delivery <your task>
```

## ChatGPT

Use ChatGPT for planning, spec critique, QA review, and human-readable explanations.

### Option A: ChatGPT Project or custom GPT instructions

ChatGPT does not currently use Claude-style skill folders. Use the ChatGPT adapter instead:

```text
adapters/chatgpt/
  README.md
  instructions.md
```

Recommended setup:

1. Create a ChatGPT Project or custom GPT named `Agentic Delivery Playbook`.
2. Paste `adapters/chatgpt/instructions.md` into the Project/custom GPT instructions.
3. Optionally upload `playbook.md`, templates, or example specs as knowledge.
4. Upload or paste only the files, specs, diffs, and logs needed for the current review.
5. Ask for evidence-based output: changed files, validation commands/results, risks, and open questions.

### Option B: prompt-only ChatGPT

Paste the universal quick prompt or the ChatGPT adapter instructions at the start of a session.

Suggested QA prompt:

```text
Review this implementation against the approved Agentic Delivery Playbook spec.
Check every acceptance criterion, non-goal, and verification requirement.
Separate proven evidence from assumptions.
Return blockers first, then high/medium/low findings, then known gaps.

Approved spec:
<paste spec>

Diff or changed files:
<paste diff>

Validation evidence:
<paste command output or say not run>
```

## Codex

Use Codex when you want a repo-editing agent to follow the playbook.

### Project instructions

Use the Codex adapter:

```text
adapters/codex/
  AGENTS.md
  README.md
```

Install it by copying `adapters/codex/AGENTS.md` into the target repository root:

```bash
cp adapters/codex/AGENTS.md /path/to/your/repo/AGENTS.md
```

If the repository already has an `AGENTS.md`, merge the playbook rules into the existing file instead of overwriting project-specific instructions.

Then start Codex in the repository and ask:

```text
Use the Agentic Delivery Playbook for: <your task>
```

If your Codex setup does not read `AGENTS.md`, paste `adapters/codex/AGENTS.md` or the universal quick prompt at the start of the session.

## Role prompts you can reuse

### Spec author

```text
Act as the Agentic Delivery Playbook spec author.
Ask only blocking clarification questions.
Then draft a compact implementation-ready spec with objective, non-goals, acceptance criteria, risks, verification plan, and implementation checklist.
```

### Spec critic

```text
Act as a skeptical Agentic Delivery Playbook critic.
Attack the spec for ambiguity, contradictions, missing states, unsafe assumptions, missing tests, and hidden scope creep.
Return actionable revisions before implementation.
```

### Implementer

```text
Implement only the approved spec.
Make the smallest correct change.
Do not broaden scope, refactor unrelated code, or make unapproved product decisions.
Run relevant validation and report changed files, commands, outcomes, assumptions, and gaps.
```

### QA reviewer

```text
QA the implementation against the approved spec, not the implementer summary.
Check every acceptance criterion and non-goal.
Classify findings as blocker, high, medium, low, spec ambiguity, implementation drift, or missing validation.
Separate evidence from assumptions.
```

## Common mistakes

- Do not force full mode for tiny direct edits.
- Do not let a chat model claim tests passed unless you provided test output.
- Do not implement before approval on non-direct runs unless the human asked for end-to-end execution.
- Do not treat a worker finding as final without synthesis and verification.
- Do not claim a specific model or agent handled a role unless the harness actually routed it and the run recorded it.
