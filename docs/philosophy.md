# Philosophy

Agentic coding fails most often when the agent is asked to infer too much at once.

A coding agent can edit files, run tools, and recover from errors, but it is not automatically aligned with the user's unstated product intent. The more ambiguous the request, the more likely the agent is to invent scope, miss edge cases, or optimize for passing tests rather than satisfying the real requirement.

The Agentic Delivery Playbook treats software work as a controlled loop:

1. make intent explicit
2. critique the intent before code exists
3. approve the contract
4. implement narrowly
5. verify against evidence
6. escalate when the loop degrades

## Why spec first?

A spec is not paperwork. In an agentic workflow, the spec is the interface between human intent and machine execution.

It gives the implementer:

- objective
- constraints
- non-goals
- acceptance criteria
- validation commands
- failure modes

It gives the reviewer:

- a basis for rejecting drift
- a checklist for verification
- a record of what was intentionally out of scope

## Why critique before implementation?

Critiquing a spec is cheaper than repairing code written from a flawed prompt.

The critic's job is to find ambiguity, contradictions, missing states, unsafe assumptions, and weak verification before implementation begins.

## Why role separation?

Different agent roles optimize for different work:

- spec author: understand and structure the task
- critic: attack assumptions
- implementer: make focused changes
- QA reviewer: compare diff to contract
- human approver: decide intent and risk

One model can perform multiple roles, but the workflow should still keep the roles conceptually separate.

## Why artifacts?

Artifacts make the run inspectable.

Without artifacts, the team only has a chat transcript and a diff. With artifacts, the team has:

- what was approved
- what changed
- why decisions were made
- which tests ran
- what remains risky

That turns agentic coding from an opaque conversation into an auditable engineering process.
