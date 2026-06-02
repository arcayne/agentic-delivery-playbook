---
name: Adapter request
description: Request support for another coding-agent harness or editor.
title: "Adapter: "
labels: [adapter]
body:
  - type: input
    id: harness
    attributes:
      label: Harness or editor
      placeholder: e.g. Claude Code, Cursor, Codex CLI, Copilot Workspace
    validations:
      required: true
  - type: textarea
    id: mapping
    attributes:
      label: Needed mapping
      description: How should the playbook map to this tool's commands, rules, agents, or settings?
    validations:
      required: true
  - type: textarea
    id: constraints
    attributes:
      label: Constraints
      description: Any model-routing, approval, tool-use, or artifact constraints?
    validations:
      required: false
