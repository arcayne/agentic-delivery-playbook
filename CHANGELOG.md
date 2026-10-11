# Changelog

## 0.4.0 - Unreleased

- Added a three-tier Controlled route for Claude Code: Fable 5.1 or Opus 5.5 orchestrator, Opus 5.5 lead, Sonnet 5.5 workers, low-effort validator, Opus defect reviewer, and a configurable goal-fit reviewer defaulting to Fable 5.1.
- Added the shipped `deliver-controlled` Workflow script with Plan, Implement, Review, and Goal-fit phases, serialized writers, content-hash ownership gates, and fixed fix-cycle limits.
- Added `adp-lead`, `adp-validator`, and `adp-goal-reviewer` agents; the `deliver` skill now starts with an inception grill and ends with an orchestrator re-run of the verification plan.
- Claude 5 profile version 2: Fable 5.1 or Opus 5.5 orchestrator, delegation depth one, the Workflow tool permitted as the orchestrator's scheduler, agent teams excluded.
- The orchestrator settings template now sets `claude-fable-5-1` at effort `high` (previously Opus 5.5 at effort `medium`).
- Probe reads workflow transcripts and compares requested with observed routes (`--requested`).
- Run record schema 1.1 adds `brief`, `workflow`, lane `requested.agentType`, and `closeout.goalFit`.
- Claude Code adapter and plugin manifest are included in the npm package.
- Made GPT-6 the maintained profile while preserving frozen GPT-5.6 evaluation and historical evidence.
- Added a skill-only Pi package adapter that loads the packaged canonical kernel and GPT-6 profile.
- Consolidated the Pi command under `agentic-delivery-playbook`, evolving the existing skill instead of introducing a second product identity.
- Added optional Pi worker/reviewer settings reference and Pi installation/use guidance.

## 0.3.0 - 2026-07-10

- Breaking: Direct/Lightweight/Full is replaced by Direct/Controlled.
- Made GPT-5.6 the only maintained profile.
- Made Codex and ChatGPT Work first-class adapters.
- Normalized contract and run artifacts.
- Archived unsupported historical material and made the CLI read-only.
- Added the comparative evaluation protocol.

## 0.2.0

Historical 0.2 material is unsupported. Its adapters, examples, and assets are preserved under legacy/ for reference only.

## 0.1.0

- Initial public draft.
