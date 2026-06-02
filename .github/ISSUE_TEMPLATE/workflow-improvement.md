---
name: Workflow improvement
description: Suggest a change to the core playbook, gates, templates, or examples.
title: "Workflow: "
labels: [workflow]
body:
  - type: textarea
    id: problem
    attributes:
      label: Problem
      description: What is unclear, missing, unsafe, or too heavy?
    validations:
      required: true
  - type: textarea
    id: proposal
    attributes:
      label: Proposed improvement
      description: What should change?
    validations:
      required: true
  - type: textarea
    id: context
    attributes:
      label: Context
      description: Any example workflow, agent harness, or failure mode that motivated this?
    validations:
      required: false
