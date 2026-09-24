# Publishing

## Repository metadata

Recommended repository description:

    GPT-6-first two-mode delivery kernel for Codex and ChatGPT Work: classify risk, route minimally, and verify from evidence.

Recommended topics:

    ai-agents
    coding-agents
    codex
    chatgpt-work
    gpt-6
    software-engineering
    human-in-the-loop

Set the metadata with:

    gh repo edit agentic-delivery-playbook \
      --description "GPT-6-first two-mode delivery kernel for Codex and ChatGPT Work: classify risk, route minimally, and verify from evidence." \
      --add-topic ai-agents \
      --add-topic coding-agents \
      --add-topic codex \
      --add-topic chatgpt-work \
      --add-topic gpt-6 \
      --add-topic software-engineering \
      --add-topic human-in-the-loop

## Release

Release v0.3.0 from a verified commit:

    VERSION=v0.3.0
    git tag "$VERSION"
    git push origin "$VERSION"
    gh release create "$VERSION" \
      --title "$VERSION" \
      --notes "Agentic Delivery Playbook $VERSION. See CHANGELOG.md."

## Launch blurb

> I open-sourced Agentic Delivery Playbook: a two-mode delivery kernel for Codex and ChatGPT Work that separates process from GPT-6 routing and closes changes from evidence.

A new social preview is an optional follow-up. The former three-mode assets are archived and are not a release claim.
