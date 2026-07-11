---
name: Workflow improvement
description: Suggest a change to the kernel, profile, templates, or active examples.
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
      description: What should change in the kernel, profile, templates, or active examples?
    validations:
      required: true
  - type: textarea
    id: evidence
    attributes:
      label: Evidence
      description: What validation, example, or evaluation evidence supports this change?
    validations:
      required: true
