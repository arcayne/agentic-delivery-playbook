# Pi package support for the GPT-6 playbook

## Objective

Ship an installable Pi skill package that makes the maintained Agentic Delivery Playbook kernel and GPT-6 profile available through Pi, then install it from the isolated feature worktree into the user's Pi setup.

## Non-goals

- Do not add executable extensions or restore the removed legacy mutating CLI.
- Do not copy/duplicate the kernel or GPT-6 profile into the Pi skill; load bundled canonical files.
- Do not commit or overwrite user-global Pi settings/model defaults in the repository.
- Do not touch the user's dirty `main` worktree or include its pre-existing edits.
- Do not publish a release or merge this PR.

## Acceptance criteria

- AC-1: `package.json` declares the Pi skill resource; the packed npm artifact contains `adapters/pi/SKILL.md` and every referenced kernel/profile/template file, with relative paths resolving after extraction.
- AC-2: the Pi skill frontmatter name is `agentic-delivery-playbook-pi`, distinct from the existing user skill; compare against the installed-skill inventory. It reads `playbook.md` and `profiles/gpt-6.md` from the installed package and treats Pi runtime capability as independently verifiable.
- AC-3: optional Pi settings template documents worker GPT-6 Luna High and reviewer GPT-6 Sol Medium without being applied or overwriting settings automatically.
- AC-4: maintained README, adapter docs, getting-started docs, and profile surfaces describe Pi support consistently; tests assert the Pi adapter exists and the old absence assertion is removed. Docs clarify installation adds a skill, not project/global model overrides.
- AC-5: tests, `npm run check`, and packed-artifact path checks pass; from the isolated worktree, verify the installed Pi version accepts `pi install .` before configuration changes. Capture user settings/package inventory before install and compare afterward; confirm the package/skill is discoverable and abort if unrelated settings or package entries would be replaced.
- AC-6: independent GPT-6 Sol Medium review accepts the diff and the feature PR is opened against `main`.

## Risks and authority

- Pi package installation modifies the user's `~/.pi/agent/settings.json` package list. User explicitly requested Pi be updated; snapshot settings and package inventory first, preserve existing Luna/Sol role overrides, and abort if unrelated entries would be replaced.
- User settings, project settings, agent frontmatter, and explicit per-run overrides have precedence interactions. Document that package installation does not guarantee a route when a higher-precedence override exists.
- Verify the installed Pi CLI's local package install syntax before installing; stop if package-name/skill-name collision cannot be avoided or any request would modify the dirty main worktree.

## Ownership and routing

One serialized worker owns the coupled package manifest, Pi skill, documentation, template, and tests. Parent integrates, validates, installs from the isolated feature worktree, and opens the PR. Use GPT-6 Luna High for implementation and GPT-6 Sol Medium for fresh-context review, as explicitly requested by the user.

## Verification

- `npm run check`
- `npm pack --dry-run`
- Parse package/fixture JSON and verify packaged Pi skill/resource paths.
- From the isolated feature worktree, run `pi install .`; inspect `pi list` and preserve worker/reviewer overrides. Verify Git default-branch or npm source installation separately when switching after merge/publication; do not assume branch/ref syntax.
- Independent reviewer inspects contract, complete diff, and validation output.
