# Business Context

## Current thesis

Agentic Delivery Playbook helps senior and lead developers who already use coding agents on real codebases keep agent work scoped, testable, and evidence-backed without adopting another agent framework. The wedge is a prompt/workflow they paste before letting an agent touch the repo: classify the task, use the smallest safe process, define what may change, and require proof before trusting the result. The deeper playbook then supports controlled token/model spend by routing the right model to the right task/output and forcing self-check/evidence loops before calling the work done.

## Actors

### Busy agent-using developer

- Type: user | influencer | possible buyer
- Definition: Senior or lead developer already using Claude Code, Codex, Cursor, ChatGPT, or similar coding agents on real software work.
- Job-to-be-done: Achieve a defined coding goal with the best available model/task fit while keeping token consumption, context waste, retries, drift, quality, reviewability, and risk under control.
- Current workaround: Write better ad hoc prompts, rerun agents, manually inspect large diffs, add project instructions, or abandon agent output when it drifts.
- Notes: This is the first README audience. Do not optimize first for AI-curious beginners, generic "developers", or enterprise process buyers.

## Glossary

### Agent drift

When a coding agent changes scope, invents requirements, misses constraints, or optimizes for passing checks rather than satisfying the user's actual intent.

### Smallest safe process

The minimum workflow needed for a task: direct for obvious low-risk edits, lightweight for bounded work needing a short contract, and full for ambiguous, risky, cross-system, security/privacy, provider/config/state-machine, or drift-prone work.

### Quick value

A README promise that gives the busy developer a useful next action within minutes, especially a copy/paste prompt they can use before the next agent edit. The first win should not require a new runtime, service, orchestrator, vector database, dashboard, multi-agent platform, or full artifact workflow.

### Token control

Keeping total useful work inside the practical context/token budget by reducing unnecessary raw context, avoiding repeated full-agent retries, choosing cheaper/faster models for narrow implementation when appropriate, and reserving stronger reasoning for goal definition, spec critique, routing, QA, and escalation.

### Model/task fit

Choosing the model or agent based on the phase and required output: strong reasoning for defining the goal, spec, critique, edge cases, and QA; cheaper or faster implementers for clear bounded changes; escalation only when evidence shows the loop is failing.

### Goal-defined self-check loop

A workflow where the human and agent first agree on the goal and acceptance evidence, then the agent checks the result against that contract instead of merely summarizing what it did.

### Scoped, testable, and honest

Candidate emotional benefit for the README. "Scoped" means the agent is constrained to the intended change. "Testable" means acceptance criteria and verification are explicit. "Honest" means the closeout is evidence-based and does not claim validation without actual output.

### Freestyle

Useful provocative language for agent drift, over-editing, surprise refactors, and unapproved scope expansion. Use carefully: it is catchy, but too much anti-agent/yolo tone can weaken trust.

## Boundaries

### In scope

- README positioning for busy developers bombarded by new AI/agentic tools.
- Pain-first messaging that explains why the playbook saves time rather than adds ceremony.
- Progressive disclosure: prompt first, modes next, artifacts and full workflow later.
- Anti-hype positioning: usable as one pasted prompt or repo instruction, not a required platform.
- Graphic support for the core pain and workflow when it makes the value easier to grasp.

### Out of scope

- Positioning primarily for AI beginners, generic developer productivity audiences, or enterprise governance buyers.
- Selling process ceremony as the core benefit.

## Open terminology questions

- Which pain should be visualized first in the README graphic?
- What eval evidence is strong enough to support token-control and better-result claims?
- How much "freestyle" language should the README borrow without weakening trust and evidence discipline?

## Resolved positioning decisions

- README hero: "A no-hype workflow for keeping coding agents scoped, testable, and honest."
- First-screen wedge: lead with a simple delivery contract and 60-second pasted prompt before any artifact/run-directory instructions.
- Avoid opening with "create a run directory" because that contradicts the anti-ceremony promise for busy developers.
- Token/cost wording: say "designed to control token waste" unless measured baseline savings are available.
- Repo-name recommendation under consideration: `coding-agent-playbook` is clearer and less hype-loaded than `agentic-delivery-playbook`, but package/repo rename has not been executed.
