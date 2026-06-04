# Business Assumptions

## Active assumptions

| ID | Assumption | Type | Confidence | Evidence | Test | Status |
|---|---|---|---|---|---|---|
| A001 | Busy senior/lead developers already using coding agents care enough about token/context control and model/task routing to try a playbook. | pain | low | Founder is repeatedly running evals because this is the hoped-for value; internal eval artifacts exist in `/Users/dearkane/Documents/dev/Farming`; no external user evidence recorded yet. | E001 | open |
| A002 | The playbook can produce better outcomes than a single-agent/self-check run by agreeing on a goal, routing phases to suitable models, and verifying against evidence. | technical | medium | Farming repo includes offline eval lanes (`eval:llm`, `eval:telegram`, `eval:telegram:screens`, `eval:agent-models`) and a spec-first run showing critic/QA/fix-loop evidence. Current evidence supports methodology; broad token-savings magnitude still needs measured baseline. | E002 | open |
| A003 | A README that leads with quick token/control value will convert bombarded busy devs better than one that leads with workflow/process. | distribution | low | Strategic judgment from current positioning discussion; no A/B or user test yet. | E001 | open |
