# Publishing

Recommended GitHub repository name:

```text
agentic-delivery-playbook
```

Recommended description:

```text
Spec-first workflow for coding agents: front-load strong reasoning, split smaller tickets, reduce drift, retries, and model spend.
```

Recommended topics:

```text
ai-agents
coding-agents
agentic-workflow
spec-first
software-engineering
ai-assisted-development
human-in-the-loop
prompt-engineering
```

## First publish

From the repository root:

```bash
git add .
git commit -m "Initial agentic delivery playbook"
gh repo create agentic-delivery-playbook --public --source=. --remote=origin --push
```

Then set the repository metadata:

```bash
gh repo edit agentic-delivery-playbook \
  --description "Spec-first workflow for coding agents: front-load strong reasoning, split smaller tickets, reduce drift, retries, and model spend." \
  --add-topic ai-agents \
  --add-topic coding-agents \
  --add-topic agentic-workflow \
  --add-topic spec-first \
  --add-topic software-engineering \
  --add-topic ai-assisted-development \
  --add-topic human-in-the-loop
```

## Social preview

GitHub social preview images are configured in the repository web UI, not by `gh repo edit`.

Use:

```text
assets/social-preview.png
```

Upload it at:

```text
Repository Settings -> Social preview -> Upload an image
```

Recommended image size is 1280x640.

## First release

```bash
git tag v0.1.0
git push origin v0.1.0
gh release create v0.1.0 \
  --title "v0.1.0" \
  --notes "Initial public draft of the Agentic Delivery Playbook."
```

## Launch blurb

> I open-sourced Agentic Delivery Playbook: a spec-gated workflow for coding agents with critique, approval gates, implementation contracts, QA evidence, run artifacts, and escalation rules.
