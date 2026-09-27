# GPT-6 Pi route — contract-only notes

## Gate result
Full planning rigor under the model-neutral Controlled kernel. User approved this contract-only phase and desired route; no implementation approval is inferred beyond the explicitly described future worker plan. Source worktree HEAD equals `origin/main` at `e857e2bd3d600186ef1df82565c43a01f02f6bff`; only these three untracked contract artifacts are in scope. Original dirty repository, `.env`, and local board data were not read or modified. No Zcash scope.

The earlier blocker is resolved: installed official Pi `docs/settings.md` explicitly states **project settings override agent-directory settings**; `defaultProvider`, `defaultModel`, `defaultThinkingLevel` are **startup** settings, with `medium` a valid thinking level. Installed `docs/configuration.md` identifies `.pi/settings.json` as the trusted project settings path. This proves a fresh trusted Pi session can be configured with project-level `openai-codex` / `gpt-6-sol` / `medium` defaults. It does **not** retroactively switch the already-running Luna parent or prove a future model actually resolved. Project trust, manual/CLI/SDK override and launch-time runtime verification remain checks, not a schema blocker.

## Active files / findings
- `adapters/pi/SKILL.md`: package installation correctly disclaims automatic model/agent defaults; currently no explicit parent ownership or fresh-review role contract. Planned Pi-only clarification (medium, not a present contract blocker).
- `templates/pi-settings.template.json`: worker `openai-codex/gpt-6-luna` high and reviewer `openai-codex/gpt-6-sol` medium overrides exist; no parent startup defaults, and template is optional, not auto-applied (medium).
- `.pi/settings.json`: absent at origin/main; new file planned for fresh project-session default, not a live switch (medium).
- `profiles/gpt-6.md`: generic task-fit Sol Medium exists, but historical migration Luna High / Sol High text is not this Pi project's requested review exception; preserve historical truth, clarify narrow exception (low).
- `test/pi-adapter.test.js`, `test/routing-profile.test.js`: test existing routes and Codex task-fit, but not Pi parent project defaults and verification. `playbook.md` remains model-neutral. Frozen `docs/evaluation.md` untouched.

## Routing ledger / separation
| Role | Requested / intended | Source | Observed now |
| --- | --- | --- | --- |
| This contract-planning invocation | GPT-6 Sol Medium assigned in user task | explicit | Runtime-resolved subagent label/effort not exposed by tools; assignment recorded, not fabricated as observed |
| Current already-running root parent | GPT-6 Luna | user-reported | No live change from future startup settings |
| Fresh project parent/orchestrator | GPT-6 Sol Medium | explicit user route + official project-default docs capability | not launched; verify effective runtime route |
| Sole implementation writer | GPT-6 Luna High worker | explicit user route; optional template only configures defaults | not launched |
| Fresh-context read-only reviewer | GPT-6 Sol Medium reviewer | explicit user route; optional template only configures defaults | not launched |

One writer owns implementation, parent owns artifacts, one orchestration plane, depth one and concurrency one. Fresh parent must own contract/launch/validation/review synthesis and continuation; only Luna worker edits implementation. Fresh reviewer must see full diff, contract and checks. No invocation of future worker/reviewer or code changes in this gate.

## Next gate and checks
Launch fresh trusted Pi project session and verify its effective Sol Medium route (including override checks); explicitly route and verify Luna High worker. Worker performs bounded approved scope only. Parent runs `node --test test/pi-adapter.test.js test/routing-profile.test.js`, `npm run check`, JSON parse of both settings files, `git diff --check`, maintained Pi route scan, `git status --short`, `git diff --cached --name-only`, and full diff/new-file inspection. Then explicitly route fresh read-only Sol Medium reviewer and verify its effective route; request approval only for a newly unavailable required route, unapproved scope or material ambiguity. Original dirty repository remains off limits.

## Implementation and parent validation
The implementation and review phases are complete pending final independent review. The workflow runtime resolved the implementation child as `openai-codex/gpt-6-luna` with `high` thinking and the reviewer as `openai-codex/gpt-6-sol` with `medium` thinking. The implementation worker reported route metadata unavailable from its own view; the host workflow status supplied these resolved route labels. The Sol Medium contract/orchestration invocation is recorded separately; its resolved model was `gpt-6-sol`, while effort metadata was not exposed.

Parent validation passed after implementation:
- `node --test test/pi-adapter.test.js test/routing-profile.test.js`: 7 passed.
- `npm run check`: 26 tests passed and active-policy validation passed.
- JSON parsing: `.pi/settings.json` and `templates/pi-settings.template.json` valid.
- `git diff --check`: passed.
- Maintained route scan: 42 matching lines across the six route/config/test files.
- A fresh trusted project Pi process (`pi --mode json --approve --no-session --print ...`, no explicit model override) reported `provider=openai-codex`, `model=gpt-6-sol`; `defaultThinkingLevel=medium` is in the loaded project settings, but the JSON message metadata did not expose effective thinking level.
- No staged files. Target worktree changes are the five tracked files shown by `git diff --stat`, new `.pi/settings.json`, and this run-artifact directory. The original dirty checkout still has its same 15 modified files and was not edited.

The first fresh Sol Medium reviewer returned **request-changes** solely on the evidence gate: its read-only surface could not run Git/tests or see a full diff packet, and `run.json` still said contract-only. The complete implementation patch (133 lines) was supplied from `/tmp/agentic-delivery-playbook-gpt6-luna-sol.patch` to the final fresh-context Sol Medium reviewer. The duplicate patch file was removed after review so the PR does not contain a second copy of source. The reviewer inspected the patch, contract, run evidence, and all six implementation files. Verdict: **approve-with-notes; no issues found**. The prior P1 evidence gap is resolved. Residual risk: the fresh Pi process exposed provider/model but not effective thinking-level metadata; `medium` is configured in project settings.
