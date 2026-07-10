---
name: Adapter request
description: Propose a community-maintained adapter beyond the maintained Codex and ChatGPT Work boundary.
title: "Adapter: "
labels: [adapter]
body:
  - type: input
    id: harness
    attributes:
      label: Harness or editor
      placeholder: e.g. editor, coding agent, or workspace
    validations:
      required: true
  - type: textarea
    id: mapping
    attributes:
      label: Kernel mapping
      description: How would Direct and Controlled, evidence, and GPT-5.6 route observability map to this runtime?
    validations:
      required: true
  - type: textarea
    id: maintenance
    attributes:
      label: Maintenance and testing commitment
      description: Who will maintain and test this adapter, against which runtime versions and deterministic checks?
    validations:
      required: true
  - type: textarea
    id: constraints
    attributes:
      label: Constraints
      description: What authority, routing, configuration, or evidence limits must the adapter disclose?
    validations:
      required: false
