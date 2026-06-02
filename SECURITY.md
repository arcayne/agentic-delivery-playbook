# Security Policy

This repository contains a workflow/playbook and adapter prompts. It does not ship production application code, but security-sensitive guidance still matters.

## Reporting a vulnerability

If you find guidance that could cause unsafe agent behavior, secret leakage, missing approval for destructive actions, or misleading verification, please open a GitHub security advisory if available.

If private advisories are not enabled, open an issue with a minimal description and avoid posting exploitable details publicly.

## Supported versions

| Version | Supported |
| --- | --- |
| 0.1.x | Yes |

## Scope

Relevant reports include:

- instructions that encourage leaking secrets or private data
- unsafe defaults for destructive or irreversible actions
- missing human approval gates for sensitive operations
- model-routing claims that can mislead users about what ran
- examples that normalize weak validation for high-risk work
