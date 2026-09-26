# Contributing

Contributions must keep the maintained surface small, capability-based, and reproducible.

## Requirements

- Use Direct and Controlled terminology consistently with [playbook.md](playbook.md).
- Keep kernel changes capability-based; do not create another process mode to describe a provider feature.
- Keep routing guidance conformant with the maintained [GPT-6 profile](profiles/gpt-6.md).
- Support performance, cost, route, review, and validation statements with captured evidence.
- Update focused tests and the active [controlled example](examples/controlled-run/) when behavior or evidence semantics change.
- Keep unsupported historical material in [legacy/](legacy/README.md).

## Adapter proposals

Codex, ChatGPT Work, and the skill-only Pi package are maintained surfaces. New provider or runtime adapters are community proposals unless the project explicitly accepts a maintenance and evaluation commitment. A proposal must identify the maintainer, supported runtime, route observability limits, deterministic validation, and how it will stay aligned with the kernel and GPT-6 profile.

## Pull requests

Describe the delivery mode, changed acceptance behavior, validation evidence, assumptions, and known gaps. Do not represent an unobserved route, an unrun check, or a same-family review as independently verified.
