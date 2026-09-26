# Getting started

This walkthrough uses one small reversible change and one public-contract change. Process mode is selected from risk and verification quality; the GPT-6 route is selected separately.

## 1. Handle a small reversible change as Direct

Request: correct a misspelled label in a maintained adapter README.

The intent and acceptance are clear, the change is readily reversible, no material authority or public-contract risk exists, one owner can make it safely, and a deterministic text check is available. Classify it as Direct.

Make the one-file edit, then close it concisely:

    Changed: adapters/codex/README.md
    Validation: rg -n "correct label" adapters/codex/README.md (exit 0)
    Assumption: the target label is the approved wording
    Gaps: none

Direct work normally does not need a contract or an artifact directory.

## 2. Handle a public API response change as Controlled

Request: add a version field to the fictional Acme Catalog API v2 product response so clients can identify the response contract.

This is Controlled because it changes a public contract. Write the compact contract before implementation, including the response field, compatibility boundary, non-goals, acceptance criteria, ownership, and evidence plan. The completed fictional contract is [examples/controlled-run/contract.md](../examples/controlled-run/contract.md).

Mode does not select the model. Route the bounded implementation to Luna high. Because this changes a public contract, use Sol high in a fresh context to review the contract, actual diff, and validation evidence.

Capture evidence for every acceptance criterion. One recorded row could be:

    Criterion: the v2 response includes apiVersion: "2026-07"
    Command: npm run test:contract -- api/v2/products
    Exit code: 0
    Output reference: CI build 482, contract-test section
    Result: passed

Before closeout, review the approved contract, the actual diff, and the captured test output together. The reviewer must distinguish proven evidence from assumptions and decide whether the change is accepted, partially accepted, escalated, or blocked.

Use a durable run record when Controlled work is broad, sensitive, long-running, delegated, handed off, or audit-relevant. The completed example at [examples/controlled-run/run.json](../examples/controlled-run/run.json) shows the required route, validation, review, and closeout fields.

## 3. Use the packaged skill in Pi

Install an unmerged checkout from its local path with `pi install /path/to/agentic-delivery-playbook`. After merge, install the default branch with `pi install git:github.com/arcayne/agentic-delivery-playbook`; after publication, use `pi install npm:agentic-delivery-playbook`. Then invoke `/skill:agentic-delivery-playbook-pi`. The skill reads the packaged [kernel](../playbook.md) and [profile](../profiles/gpt-6.md), and does not set project/global model defaults. Pi runtime model and effort support must be verified independently. The optional [settings template](../templates/pi-settings.template.json) documents Luna High worker and Sol Medium reviewer defaults but is not automatically applied; higher-precedence overrides may change the effective route.

## Next

Use [playbook.md](../playbook.md) for mode selection and [profiles/gpt-6.md](../profiles/gpt-6.md) for routing. [Protocol 1.0](evaluation.md) is frozen historical GPT-5.6 evidence; it does not validate current GPT-6 routing. Evaluating GPT-6 requires a separately versioned protocol.
