# Spec: Add retry classification to webhook consumer

## Objective

Add deterministic retry classification to a webhook consumer so transient failures are retried and permanent failures are acknowledged without retry.

## Non-goals

- Do not change the webhook payload schema.
- Do not change authentication behavior.
- Do not add a new queue provider.
- Do not alter unrelated logging format.

## Current state

The webhook consumer processes events and returns success or failure. All failures currently look the same to the caller, which makes retry behavior ambiguous.

## Proposed approach

Introduce a small pure function that classifies processing errors as either `retryable` or `terminal`. Use it inside the webhook consumer response path.

Suggested classification:

- network timeout: retryable
- upstream 5xx: retryable
- malformed payload: terminal
- unsupported event type: terminal
- authentication failure: terminal

## Contracts and interfaces

No public payload schema changes.

The internal processing result should expose:

```text
status: processed | retryable_failure | terminal_failure
reason: short stable reason code
```

## Safety, security, and privacy constraints

- Do not include raw webhook payloads in error messages.
- Do not log secrets, tokens, or full request headers.
- Preserve existing authentication checks.

## Edge cases and failure modes

- unknown thrown error type
- malformed JSON body
- upstream timeout
- upstream 502 response
- unsupported event type

## Acceptance criteria

- [ ] Retryable failures return a retryable result with a stable reason code.
- [ ] Terminal failures return a terminal result with a stable reason code.
- [ ] Malformed payloads are not retried.
- [ ] Network timeouts are retried.
- [ ] No raw payload or secret-bearing header is logged.
- [ ] Unit tests cover at least one retryable and one terminal failure.

## Verification plan

```text
npm test -- webhook-consumer
npm run typecheck
```

## Implementation checklist

- [ ] Add pure classification helper.
- [ ] Add tests for retryable and terminal classifications.
- [ ] Wire helper into consumer response path.
- [ ] Confirm logs remain sanitized.

## QA checklist

- [ ] Compare implementation against every acceptance criterion.
- [ ] Confirm non-goals were not changed.
- [ ] Confirm validation output exists.
- [ ] Confirm no raw payload is logged.

## Open questions

None for the example.
