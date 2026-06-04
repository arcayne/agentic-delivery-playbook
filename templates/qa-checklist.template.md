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

## High risk checks

Use for broad tickets or sensitive changes.

- [ ] Privacy/redaction risks reviewed.
- [ ] Authority, destructive action, or irreversible action boundaries reviewed.
- [ ] Routing/state precedence reviewed.
- [ ] Off, shadow, dry run, reply only, or safe mode behavior reviewed where relevant.
- [ ] Numeric/display edge cases reviewed.
- [ ] Provider/config failure behavior reviewed.

## Dynamic workflow findings

Use only when dynamic workflow or large parallel fanout was used.

- [ ] Launch note and approval evidence are recorded.
- [ ] Synthesis includes accepted, rejected, speculative, and conflicting findings.
- [ ] Accepted findings have independent verification or clear evidence.
- [ ] Speculative findings are labeled and not presented as final.

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
- [ ] Model or agent routing is recorded honestly.
- [ ] Implementation model evaluation is recorded when applicable.
- [ ] Known gaps are listed.
- [ ] Follow-up work is recommended when needed.
