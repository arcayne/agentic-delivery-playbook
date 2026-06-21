# Changelog

## Unreleased

- Hardened Full-mode broad-ticket policy: multi-package/explicit-rollout work now requires a child-task map, file ownership matrix, recursion cap, and barrier plan before implementation workers write; whole-PRD single-worker prompts are recorded exceptions.
- Added recursive/fractal planner guidance: each planner that decomposes a still-broad slice proposes a subtree map, while the parent/orchestrator controls launch approval, recursion depth, and synthesis.
- Added Pi-native workflow guidance for layering Agentic Delivery Playbook with pi-goal-x, pi-subagents, and run artifacts.
- Added a Pi settings template for worker/reviewer/planner model lane separation.
- Updated the Pi skill so Full mode defaults to worker implementation plus reviewer QA, records gate failures, and treats subagent timeouts as failed gates instead of completed self-review.
- Repositioned the repo as Pi-first and portable second across README/getting-started/adapter docs.
- Added `install pi` and `install-pi-skill` CLI targets for Pi global/project skill installation.
- Reframed the Pi adapter as a lightweight value gate instead of a forced model-routing/spec-first workflow.
- Simplified Pi routing guidance around recording actual routes and asking before approved exceptions.

## 0.2.0

- Added Codex `AGENTS.md` adapter at `adapters/codex/`.
- Added ChatGPT Project/custom-GPT instruction adapter at `adapters/chatgpt/`.
- Added self-contained Claude skill adapter at `adapters/claude/`, with concise `SKILL.md` instructions, supporting `workflow.md`, and an `npx` installer.
- Added observability/ROI closeout guidance for sessions, turns, output tokens, approximate cost, model mix, and process-weight classification.
- Added budget-awareness language for lightweight vs broad-ticket runs.
- Added portability guidance: telemetry scripts and templates should use environment/config such as `PI_OBS_DB`, never personal absolute paths.
- Updated Pi adapter banner and run template to v0.2.

## 0.1.0

- Initial public draft of the Agentic Delivery Playbook.
- Added portable workflow docs, templates, Pi adapter, and a lightweight example run.
- Added README workflow image, social preview asset, publishing notes, security policy, and GitHub contribution templates.
- Added visual spec guidance, HTML spec template, high-risk QA checklist, closeout governance template, and implementation model evaluation guidance.
