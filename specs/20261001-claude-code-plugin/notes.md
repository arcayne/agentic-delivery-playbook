# Closeout: Claude Code plugin adapter (slice A)

Status: accepted, with recorded gaps
Mode: Controlled
Contract: [contract.md](contract.md) (approved 2026-10-01; skill name `deliver`)
Base: `f0774a4`, branch `feat/claude-code-plugin`, isolated worktree

## Lanes and routes

| Lane | Requested | Observed (transcript) | Evidence |
| --- | --- | --- | --- |
| Orchestrator (main session) | Opus 5.5 / medium | `claude-opus-5-5` / `medium` | `orchestrator-run-probe.json` |
| Worker (sole writer, 3 passes: build, fix 1, fix 2) | `general-purpose`, per-invocation `sonnet` | `claude-sonnet-5-5` / `medium` | `orchestrator-run-probe.json` |
| Reviewer (fresh context, 3 passes) | `general-purpose`, per-invocation `opus` | `claude-opus-5-5` / `medium` | `orchestrator-run-probe.json` |

This run did not dogfood the plugin agents, because they aren't loaded in the session that builds them. The worker and reviewer used alias overrides, so their requested effort is `unknown`, and medium was inherited from the parent.

## Review gate

- The reviewer is read-only by instruction. Worktree fingerprints (temp-index `write-tree`, plus `HEAD` = `f0774a4`) matched before and after every review:
  - review 1: `bccb48d0…`
  - review 2: `3041c32e…`
  - review 3: `1f88cb58…`
- Review 1: accept-with-fixes (2 high, 6 medium, 4 low, 3 nit).
- Review 2: accept-with-fixes (1 new medium: absolute paths in probe output and evidence; 3 low).
- Review 3: **accept**.
- Fix cycles: 2 (the kernel limit for focused cycles). No escalation was needed.

## Acceptance

| AC | Result | Evidence |
| --- | --- | --- |
| AC-1 manifest + marketplace | accepted | `claude plugin validate .` → `✔ Validation passed`; `smoke-init.json` |
| AC-2 skill (`/agentic-delivery-playbook:deliver`, 50 lines) | accepted | review 3; `test/claude-code-adapter.test.js` |
| AC-3 agents (5 incl. `-high` escalation agents) | accepted | `smoke-probe.json`: requested = observed for all 5 |
| AC-4 profile | accepted | review 3 |
| AC-5 settings template | accepted | smoke repo used the template → main `claude-opus-5-5` / `medium` |
| AC-6 `probe claude` | accepted | `test/claude-code-route-probe.test.js`; probe JSONs |
| AC-7 validator/tests | accepted | `npm run check`: 44 tests, 44 pass, 0 fail; `active policy validation passed` |
| AC-8 smoke test via `--plugin-dir` | accepted | `smoke-init.json`, `smoke-probe.json` |
| AC-9 README | accepted | review 3 |

Non-goals: no violations. No README, playbook, docs, package.json, `templates/run.json`, Pi, or legacy files were touched.

## Smoke-test routes (`smoke-probe.json`)

| Agent | Model / effort (requested = observed) |
| --- | --- |
| `adp-worker` | `claude-sonnet-5-5` / medium |
| `adp-worker-high` | `claude-sonnet-5-5` / high |
| `adp-reviewer` | `claude-opus-5-5` / medium |
| `adp-reviewer-high` | `claude-opus-5-5` / high |
| `adp-explorer` | `claude-sonnet-5-5` / low |

## Accepted gaps

1. This run's worker and reviewer were `general-purpose` with alias overrides, not the plugin agents (see Lanes).
2. Desktop Code-tab plugin install and loading are unverified (spike F10/F11). Only CLI `--plugin-dir` was exercised.
3. The reviewer is read-only by instruction only. The fingerprint doesn't cover gitignored files.
4. The probe matches a bare project-local `adp-worker` to the plugin definition. "Requested" means the definition currently on disk.
5. The plugin root is the repo root: root `bin/` is a plugin executable dir (this may block claude.ai/Cowork distribution), and `legacy/`, `specs/` and `.pi/` ship in the plugin cache.
6. The Opus-worker escalation is an alias route (`model: opus`), so the probe must confirm it.
7. The README's `npx agentic-delivery-playbook probe` works only after an npm release that includes `probe` and `adapters/claude-code`. Until then, use `node <plugin path>/bin/agentic-delivery-playbook.js`.

## Next action

- Pushing, opening the PR and merging need separate user approval.
- Slice B, after PRD restoration lands:
  - npm `files`
  - README, adapters and getting-started positioning
  - generalize `playbook.md` from `gpt-6.md` to "the active profile"
  - `run.json` lane integration for `probe`
  - version bump
- Then verify desktop install (F10/F11) from the GitHub marketplace.
