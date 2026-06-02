# High risk QA checklist

Use this checklist for broad tickets or any change involving sensitive data, authority, external providers, state transitions, or subtle negative cases.

## Privacy and redaction

- [ ] No secrets, tokens, credentials, private payloads, or raw provider responses are logged.
- [ ] Error messages are useful without exposing sensitive data.
- [ ] Prompt or model inputs are minimized and sanitized where relevant.

## Authority and irreversible actions

- [ ] Destructive, financial, permission, account, or irreversible actions require explicit approval.
- [ ] Preview or confirmation flows cannot be reused after expiry, mutation, or consumption.
- [ ] Idempotency or replay protection is preserved where needed.

## Routing and state precedence

- [ ] Active drafts, confirmations, user replies, and command handlers have deterministic precedence.
- [ ] State transitions are explicit and tested for negative paths.
- [ ] Ambiguous references fail safely or ask for clarification.

## Mode behavior

- [ ] Off, shadow, dry run, reply only, or safe mode behavior is deterministic.
- [ ] No write path is accidentally enabled in observation only modes.
- [ ] User visible copy makes the active mode clear.

## Numeric and display edge cases

- [ ] NaN, Infinity, empty values, negative values, unsupported units, and formatting edge cases are handled.
- [ ] User facing numbers include appropriate precision, units, and uncertainty.

## Configuration and providers

- [ ] Missing or invalid configuration fails safely with redacted errors.
- [ ] Provider allowlists, model names, timeouts, caps, and retries are explicit.
- [ ] External provider failures do not leak secrets or create unsafe fallback behavior.

## Validation evidence

- [ ] Tests cover the highest risk positive and negative paths.
- [ ] Manual checks are listed when automation is insufficient.
- [ ] Any skipped validation is recorded as a known gap or approved exception.
