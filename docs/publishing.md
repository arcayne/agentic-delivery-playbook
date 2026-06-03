# Publishing

Recommended GitHub repository name:

```text
agentic-delivery-playbook
```

Recommended description:

```text
Spec first workflow for coding agents: choose the right model per task, use strong reasoning early, split work into smaller tickets, reduce drift, retries, and spend.
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
  --description "Spec first workflow for coding agents: choose the right model per task, use strong reasoning early, split work into smaller tickets, reduce drift, retries, and spend." \
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

## Release

Set the release version explicitly, then tag and publish:

```bash
VERSION=v0.2.0
git tag "$VERSION"
git push origin "$VERSION"
gh release create "$VERSION" \
  --title "$VERSION" \
  --notes "Agentic Delivery Playbook release $VERSION."
```

For the initial public release, use notes that describe the first draft. For later releases, summarize the workflow/template changes from `CHANGELOG.md`.

## Launch blurb

> I open-sourced Agentic Delivery Playbook: a spec-gated workflow for coding agents with critique, approval gates, implementation contracts, QA evidence, run artifacts, and escalation rules.
