# Visual specs

Specs should be easy for humans to review, not just easy for agents to consume.

Markdown is enough for many lightweight tickets. Use an HTML spec when visual hierarchy, diagrams, screenshots, state machines, or side by side comparisons make approval safer.

## When HTML helps

Use `spec.html` instead of `spec.md` when:

- the workflow has multiple states or modes
- UI, message formatting, screenshots, or diagrams clarify intent
- the human approver needs to scan a larger contract
- acceptance criteria are easier to understand with tables or visual grouping
- the risk of blindly accepting an agent plan is high

Do not add visuals as decoration. Add them when they improve human understanding before approval.

## Template

Use:

```text
templates/spec.template.html
```

The template is self contained and dark themed so it previews well in a local coding workspace.

## Local preview

A simple local preview is enough:

```bash
python3 -m http.server 8765 --bind 127.0.0.1 --directory specs
```

Then open:

```text
http://127.0.0.1:8765/YYYYMMDD-HHMM-feature-slug/spec.html
```

If your harness can create a short symlink or preview URL, record that URL in `run.json` and the phase banner.

## Approval rule

The human approves the rendered spec, not the agent's summary of the spec.

If the visual spec reveals ambiguity, revise the spec before implementation.
