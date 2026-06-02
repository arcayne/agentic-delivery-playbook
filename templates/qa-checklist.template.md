# QA checklist

QA target: `<spec path>`

## Acceptance criteria

- [ ] Every required acceptance criterion is satisfied.
- [ ] Each criterion has evidence.
- [ ] Any unmet criterion is marked as a blocker or approved gap.

## Non-goals

- [ ] Implementation did not modify out-of-scope behavior.
- [ ] Unrelated refactors are absent or explicitly justified.

## Safety, security, and privacy

- [ ] No unsafe default was introduced.
- [ ] Sensitive data handling was preserved or improved.
- [ ] External-provider, auth, destructive, or irreversible actions require explicit approval where relevant.

## Validation

- [ ] Relevant tests were run.
- [ ] Validation output is recorded.
- [ ] Manual checks are documented when automated checks are insufficient.

## Drift review

- [ ] No hidden product decisions.
- [ ] No unnecessary public contract changes.
- [ ] No broad edits outside the implementation task.

## Closeout

- [ ] Changed files are listed.
- [ ] Known gaps are listed.
- [ ] Follow-up work is recommended when needed.
