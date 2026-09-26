# Pi package support — run notes

## Status dashboard
- Current phase/slice: PR preparation
- Accepted slices: revised contract; Pi package/adapter/docs/tests; parent checks; installed package from local feature worktree; fresh GPT-6 Sol Medium review
- Blocked slices: none
- In-flight lanes: none
- Known validation exceptions: package source is a local worktree path because Pi 0.87.1 help does not document Git ref syntax; retain this worktree until a post-merge Git or npm source install is separately verified.
- Next gate: commit/push branch and open PR

## Scope and isolation
- Base: `origin/main` at `a35a66f0787c9dca7e615fcbf4b7378983e25f67`; branch `codex/pi-package-integration` in `/Users/dearkane/Documents/dev/.worktrees/agentic-delivery-playbook-pi-package`.
- The user's local `main` worktree has unrelated uncommitted/local-only work. It will not be staged, modified, or used as a branch base.
- One serialized writer owns package metadata, Pi skill, public docs, optional settings template, and assertions; parent owns installation, integration, validation, review, and PR.

## Design choices
- Installable Pi package, no executable extension code.
- Pi skill name is `agentic-delivery-playbook-pi`, distinct from the existing user skill `agentic-delivery-playbook`; verify current inventory before installation.
- The skill reads the package's current `playbook.md` and `profiles/gpt-6.md` rather than copying route policy; test relative references after packing/extraction.
- Package install adds a Pi resource declaration; it does not silently write project routing overrides. Provide an optional template for Luna High worker / Sol Medium reviewer.
- Initial spec critique blockers resolved and revised contract approved by GPT-6 Sol Medium: compare Pi user settings/package inventory before/after install; stop if unrelated settings would change. Update old tests/docs asserting Pi is unsupported, verify exact skill name, and test packed-artifact relative paths.
- For immediate use before merge, install the local feature-worktree path (Pi documents local package sources). The installed entry depends on that worktree remaining available; after merge, separately verify Git default-branch or npm source installation before switching. Git ref syntax was not used or tested.
- Parent validation: `npm run check` exit 0 (26 passed, active policy validation passed); `npm pack --dry-run` includes the Pi adapter and template; extracted tarball check resolves all 5 skill references.
- Pi 0.87.1 `pi install --help` documents `./local/path`. Skill inventory found no `agentic-delivery-playbook-pi` collision. Pre-install settings snapshot is `/tmp/pi-agent-settings-before-playbook-package.json` (SHA-256 `81a92bb7fce085017cfc23a8810691246482581d319f5412dade5cc16d3693dd`); `pi list` had no packages. After `pi install .`, `pi list` shows the local feature worktree and structural comparison confirms all other settings and Luna High/Sol Medium role overrides are preserved.
- Fresh GPT-6 Sol Medium final review found no remaining issues (OK with notes). Its first pass flagged the contract's stale Git-ref installation step; the contract was corrected to the tested local `pi install .` flow, a duplicate AC-6 was removed, and the reviewer verified the correction. Reviewer explicitly did not run shell/tests; parent validation artifacts were supplied and inspected.

## Decisions
- Do not publish or merge. Open a PR and install the package from its isolated local worktree into the user's Pi package list while preserving existing user role overrides.
