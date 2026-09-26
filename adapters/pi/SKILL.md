---
name: agentic-delivery-playbook-pi
description: "Apply the maintained Agentic Delivery Playbook in Pi: classify delivery as Direct or Controlled, select a route from the canonical GPT-6 profile, and close from evidence. Use for coding work when scope, risk, or verification benefits from explicit delivery guidance."
---

# Agentic Delivery Playbook for Pi

Use the packaged canonical sources; do not treat this skill as a copy of the policy:

- Read [`../../playbook.md`](../../playbook.md) for Direct and Controlled process rules.
- Read [`../../profiles/gpt-6.md`](../../profiles/gpt-6.md) for maintained model/effort routes and client limitations.
- For a compact contract or durable evidence record, use [`../../templates/contract.md`](../../templates/contract.md) or [`../../templates/run.json`](../../templates/run.json) when the work warrants them.

## Apply the playbook

Classify process mode from the kernel and select a route separately from mode using the maintained profile. Make the smallest change that meets the approved scope, then validate and report changed files, evidence, assumptions, and gaps. Do not add ceremony to clear, low-risk work.

Pi is a supported skill-package surface, not proof of any particular runtime capability or model route. Verify the Pi version, configured model, effort controls, and agent behavior independently before relying on them. Record `runtime-default` or `unknown` when a route is not exposed; do not claim that installing this package changes project/global model defaults.

For workspaces that choose to set Pi worker/reviewer defaults, the optional [`../../templates/pi-settings.template.json`](../../templates/pi-settings.template.json) shows GPT-6 Luna High for worker and GPT-6 Sol Medium for reviewer. Review and merge it deliberately into the appropriate settings; installation does not apply it or overwrite user settings.
