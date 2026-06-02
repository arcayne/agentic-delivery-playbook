# Failure Modes

Agentic delivery should make failures visible early.

## Vague spec

Symptoms:

- implementer asks basic intent questions after coding starts
- QA cannot tell whether behavior is correct
- tests pass but the result feels wrong

Response:

- stop implementation
- revise the spec
- ask the human to decide unresolved intent

## Implementation drift

Symptoms:

- unrelated refactors
- new behavior not in the spec
- hidden product decisions
- edits outside allowed files or packages

Response:

- classify as drift in QA
- revert or isolate unrelated changes
- give a narrower fix prompt
- escalate if repeated

## Missing validation

Symptoms:

- implementer says "should work"
- no tests or commands were run
- validation does not cover acceptance criteria

Response:

- require concrete validation
- add targeted tests when appropriate
- record any remaining manual validation

## Repeated fix cycles

Symptoms:

- more than two fix cycles
- same issue keeps returning
- fixes create new failures

Response:

- stop blind prompting
- split the ticket
- improve the spec
- use an escalation reviewer

## Over-broad ticket

Symptoms:

- implementation prompt includes many unrelated tasks
- files changed across multiple systems without a plan
- QA surface is too large

Response:

- split into implementer-sized tickets
- sequence the tickets
- QA each ticket independently

## Unsafe defaults

Symptoms:

- destructive actions happen without confirmation
- private data is logged or sent to external services
- auth, payment, account, or permission behavior changes casually

Response:

- block the run
- restore safe defaults
- require explicit human approval
- add regression tests or guards

## Model-routing mismatch

Symptoms:

- intended model/agent was not used
- runtime silently chose a default
- run summary claims a model that was not routed

Response:

- correct the run ledger
- do not make model-specific claims
- ask for approval before continuing if routing was required for risk reasons
