# GPT-5.6-First Playbook Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current three-mode, multi-provider playbook with a small two-mode delivery kernel and one maintained GPT-5.6 Sol/Terra/Luna routing profile for Codex and ChatGPT Work.

**Architecture:** `playbook.md` becomes the provider-neutral source of truth for Direct and Controlled delivery. `profiles/gpt-5.6.md` maps task shape to model tier, reasoning effort, and topology. Codex and ChatGPT adapters translate that policy without redefining it. Controlled runs use one contract and one normalized run record. Node's built-in test runner enforces terminology, file budgets, profile consistency, and record shape; provider-specific history moves under `legacy/` and is excluded from the npm package.

**Tech Stack:** Markdown, JSON, TOML, CommonJS on Node.js 18+, `node:test`, Git.

## Global constraints

- Implement from an isolated worktree created with `superpowers:using-git-worktrees`, on branch `codex/gpt-5-6-simplification`, based on the commit containing the approved design and this plan.
- Do not apply, discard, or edit the unrelated dirty patch in the original worktree. Before integration, compare that patch with the migration and let the user decide how to reconcile overlapping files.
- Keep one sequential writer for this migration. The kernel, profile, adapters, tests, and documentation share terminology and should not be edited concurrently.
- Use only `Direct` and `Controlled` as active process modes. A checklist is not a third mode.
- Keep process mode separate from route: model tier + reasoning effort + topology.
- Maintain only `gpt-5.6-luna`, `gpt-5.6-terra`, and `gpt-5.6-sol` in active routing policy.
- Do not claim savings, speed, or quality improvements until `docs/evaluation.md` has produced evidence.
- Do not change global Codex or ChatGPT configuration. Ship reviewable project configuration examples only.
- Keep active policy within these budgets: `playbook.md` at most 150 lines, `profiles/gpt-5.6.md` at most 120 lines, `adapters/codex/AGENTS.md` at most 180 lines, and `templates/run.json` at most 120 lines.
- Use `git mv` for archival moves, `apply_patch` for textual edits, and commit after every task.

## Target file map

```text
playbook.md                              # canonical two-mode kernel
profiles/gpt-5.6.md                     # only maintained route profile
profiles/codex/config.toml              # project-scoped default and agent registry
profiles/codex/agents/
  mechanical-worker.toml
  explorer.toml
  worker.toml
  reviewer.toml
  escalation-reviewer.toml
adapters/codex/{AGENTS.md,README.md}     # thin Codex translation
adapters/chatgpt/{instructions.md,README.md}
templates/{contract.md,run.json}         # only active delivery artifacts
lib/policy-helpers.js
scripts/validate-active-policy.js
test/
  policy-helpers.test.js
  kernel.test.js
  routing-profile.test.js
  run-record.test.js
  adapters.test.js
  active-surface.test.js
docs/{getting-started.md,adapters.md,evaluation.md,publishing.md}
examples/{README.md,controlled-run/}
legacy/                                  # unsupported historical adapters/docs/templates/examples
```

The approved design remains at `docs/superpowers/specs/2026-07-10-gpt-5-6-simplification-design.md`. Implementation evidence lives at `specs/20260710-gpt-5-6-simplification/`.

---

## Task 1: Establish the dependency-free policy test harness

**Files:**

- Create: `lib/policy-helpers.js`
- Create: `test/policy-helpers.test.js`
- Modify: `package.json`

- [ ] **Step 1: Create the worktree and verify its base**

Invoke `superpowers:using-git-worktrees`, choose a repository-safe worktree location, and create `codex/gpt-5-6-simplification` from the commit containing this plan.

Run:

```bash
git status --short
git log -2 --oneline
```

Expected: the new worktree is clean, and the two newest commits are the approved design and this implementation plan. If the original dirty files appear here, stop; the worktree was created from the wrong state.

- [ ] **Step 2: Write failing helper tests**

Create `test/policy-helpers.test.js`:

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  lineCount,
  readUtf8,
  findForbiddenTerms,
} = require('../lib/policy-helpers');

test('lineCount ignores one terminal newline', () => {
  assert.equal(lineCount('one\ntwo\n'), 2);
  assert.equal(lineCount(''), 0);
});

test('readUtf8 resolves repository-relative paths', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'adp-policy-'));
  fs.writeFileSync(path.join(root, 'sample.md'), 'sample\n');
  assert.equal(readUtf8(root, 'sample.md'), 'sample\n');
});

test('findForbiddenTerms reports file, term, and line', () => {
  const matches = findForbiddenTerms(
    new Map([
      ['one.md', 'Terra\nHermes route\n'],
      ['two.md', 'Sol only\n'],
    ]),
    [/Hermes/i],
  );

  assert.deepEqual(matches, [
    { file: 'one.md', term: 'Hermes', line: 2 },
  ]);
});
```

- [ ] **Step 3: Run the test and confirm the red state**

Run:

```bash
node --test test/policy-helpers.test.js
```

Expected: FAIL with `Cannot find module '../lib/policy-helpers'`.

- [ ] **Step 4: Implement the helpers**

Create `lib/policy-helpers.js`:

```js
'use strict';

const fs = require('node:fs');
const path = require('node:path');

function lineCount(text) {
  const withoutTerminalNewline = text.replace(/\r?\n$/, '');
  return withoutTerminalNewline === ''
    ? 0
    : withoutTerminalNewline.split(/\r?\n/).length;
}

function readUtf8(root, relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function findForbiddenTerms(files, patterns) {
  const matches = [];

  for (const [file, text] of files) {
    text.split(/\r?\n/).forEach((lineText, index) => {
      for (const pattern of patterns) {
        const match = lineText.match(pattern);
        if (match) {
          matches.push({ file, term: match[0], line: index + 1 });
        }
      }
    });
  }

  return matches;
}

module.exports = {
  lineCount,
  readUtf8,
  findForbiddenTerms,
};
```

- [ ] **Step 5: Add the test script without changing other package metadata yet**

Add this object to `package.json` after `engines`:

```json
"scripts": {
  "test": "node --test test/*.test.js"
}
```

- [ ] **Step 6: Verify and commit**

Run:

```bash
npm test
git diff --check
```

Expected: three tests pass; `git diff --check` prints nothing.

Commit:

```bash
git add lib/policy-helpers.js test/policy-helpers.test.js package.json
git commit -m "test: add active policy test harness"
```

---

## Task 2: Replace the three-mode workflow with the two-mode kernel

**Files:**

- Create: `test/kernel.test.js`
- Create: `templates/contract.md`
- Rewrite: `playbook.md`

- [ ] **Step 1: Write the kernel contract test**

Create `test/kernel.test.js`:

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { lineCount, readUtf8 } = require('../lib/policy-helpers');

const root = path.resolve(__dirname, '..');

test('the active kernel has exactly Direct and Controlled modes', () => {
  const kernel = readUtf8(root, 'playbook.md');
  assert.match(kernel, /^## Direct mode$/m);
  assert.match(kernel, /^## Controlled mode$/m);
  assert.doesNotMatch(kernel, /\b(?:Lightweight|Full) mode\b/i);
  assert.ok(lineCount(kernel) <= 150, `playbook.md has ${lineCount(kernel)} lines`);
});

test('the kernel defines concise failure handling', () => {
  const kernel = readUtf8(root, 'playbook.md');
  for (const phrase of [
    'minimum safe route',
    'timed-out or unusable lane',
    'conflicting parallel edits',
    'Missing or contradictory evidence',
  ]) {
    assert.match(kernel, new RegExp(phrase, 'i'));
  }
});

test('the controlled contract contains every required decision field', () => {
  const contract = readUtf8(root, 'templates/contract.md');
  for (const heading of [
    'Objective',
    'Non-goals',
    'Acceptance criteria',
    'Risk and authority constraints',
    'Ownership',
    'Verification plan',
    'Unresolved decisions',
    'Approval',
  ]) {
    assert.match(contract, new RegExp(`^## ${heading}$`, 'm'));
  }
});
```

- [ ] **Step 2: Confirm the old kernel fails**

Run:

```bash
node --test test/kernel.test.js
```

Expected: FAIL because the old playbook still defines Lightweight/Full and `templates/contract.md` is absent.

- [ ] **Step 3: Rewrite `playbook.md` as the canonical kernel**

Use this complete structure and wording; only editorial tightening that preserves the tests and design is allowed:

```markdown
# Agentic Delivery Playbook

A small delivery kernel for coding work: classify by risk, choose the minimum safe route, bound ownership, and close from evidence.

## Decide the process mode

Use **Direct** only when all are true:

- intent and acceptance are clear
- effects are low-consequence or readily reversible
- no material security, privacy, auth, payment, financial, destructive, public-contract, or external-authority concern exists
- one owner can make the change without unsafe coordination
- completion is objectively verifiable

Use **Controlled** when any condition above is false, or when broad delegated work needs ownership and synthesis controls. File count is context, not the deciding rule.

## Direct mode

1. State the intended change in one or two sentences.
2. Inspect the relevant code and local instructions.
3. Make the smallest correct edit.
4. Run the strongest relevant deterministic validation available.
5. Report changed files, validation results, assumptions, and known gaps.

Direct mode does not require a durable contract, run record, approval gate, independent reviewer, or explicit route record. A short checklist may be used without creating another mode.

Switch to Controlled mode if ambiguity, consequence, authority, coupling, or weak verification appears during execution.

## Controlled mode

1. Write a compact delivery contract using `templates/contract.md`.
2. Obtain approval for unresolved product choices, authority changes, or material boundaries.
3. Select the minimum safe route from the maintained profile and record exceptions.
4. Give every writer exclusive files or a coupled file cluster; cap delegation and define a synthesis owner.
5. Implement against the approved acceptance criteria.
6. Capture commands, exit status, and evidence for each acceptance criterion.
7. Review the approved contract, actual diff, and validation evidence in a fresh context.
8. Close as accepted, partially accepted, escalated, or blocked; never infer success from narration alone.

A durable contract and run record are required when Controlled work is broad, sensitive, long-running, delegated, handed off, or audit-relevant. Bounded Controlled work may keep the contract in the task.

When the user approved an end-to-end outcome, do not stop for repeated slice approvals. Stop only for new scope, an unresolved product decision, a new authority requirement, inability to satisfy the minimum safe route, or contradictory evidence after two focused fix cycles.

## Route separately from process

Record a route as:

```text
model tier + reasoning effort + topology
```

Process mode does not imply a model. Use `profiles/gpt-5.6.md` for the maintained mapping. A runtime preset such as Ultra is topology plus effort, not a fourth model tier or process mode.

Escalate only from evidence: the task stopped being mechanical, interpretation became material, a focused retry failed, hidden coupling appeared, or risk increased. Higher effort is not an unlimited retry loop.

## Delegation and review

- Prefer one capable agent for tightly coupled work.
- Delegate only genuinely independent lanes with explicit inputs, outputs, ownership, and a synthesis barrier.
- Use one orchestration plane. Do not add recursive fanout on top of native Ultra delegation by default.
- Default nesting depth is one.
- A different GPT-5.6 tier is not independent review by itself. Fresh context, adversarial instructions, direct diff access, deterministic checks, and human authority provide stronger separation.

## Failure rules

- If the minimum safe route is unavailable, use the next safe configured route, narrow the task, add compensating deterministic checks, or ask the user. Do not silently run below a Controlled task's safety floor.
- Mark a timed-out or unusable lane failed and treat its edits as untrusted. Retry once with a narrower contract, replace the route, or record an explicit takeover.
- Stop conflicting parallel edits at the synthesis barrier, restore exclusive ownership, and rerun affected validation.
- Stop the affected lane when contract or product ambiguity appears; a worker cannot silently decide outside its contract.
- Missing or contradictory evidence prevents accepted closeout. Rerun the check or record an explicitly accepted gap.

## Evidence and closeout

Evidence records the command or check, exit status, output reference, acceptance criterion, and result. The final report distinguishes verified facts, assumptions, skipped checks, and known gaps.

Never claim a test ran, a route was observed, a reviewer was independent, or an outcome was accepted unless the corresponding evidence exists.
```

- [ ] **Step 4: Create the compact Controlled contract template**

Create `templates/contract.md`:

```markdown
# Delivery contract: [short outcome]

Status: proposed
Owner: [single synthesis owner]
Approved evidence: [task message, issue, or review reference]

## Objective

[One measurable outcome.]

## Non-goals

- [Explicitly excluded outcome.]

## Acceptance criteria

- AC-1: [Observable condition and expected result.]

## Risk and authority constraints

- Risk: [Consequence, reversibility, and affected state.]
- Authority: [Actions allowed without further approval.]
- Stop condition: [New scope, decision, authority, or safety boundary.]

## Ownership

| Lane | Exclusive files or system boundary | Output |
| --- | --- | --- |
| synthesis | [Coupled file cluster or final integration] | [Reviewable diff and evidence] |

## Verification plan

| Criterion | Command or check | Required evidence |
| --- | --- | --- |
| AC-1 | [Deterministic command or explicit inspection] | [Exit status and output reference] |

## Unresolved decisions

- None.

## Approval

- Contract approved by: [user or authority]
- Approved at: [ISO-8601 timestamp or task reference]
```

- [ ] **Step 5: Verify and commit**

Run:

```bash
node --test test/kernel.test.js
npm test
wc -l playbook.md
git diff --check
```

Expected: all tests pass; `playbook.md` is no more than 150 lines.

Commit:

```bash
git add playbook.md templates/contract.md test/kernel.test.js
git commit -m "refactor: define direct and controlled delivery"
```

---

## Task 3: Add the only maintained GPT-5.6 routing profile

**Files:**

- Create: `test/routing-profile.test.js`
- Create: `profiles/gpt-5.6.md`
- Create: `profiles/codex/config.toml`
- Create: `profiles/codex/agents/mechanical-worker.toml`
- Create: `profiles/codex/agents/explorer.toml`
- Create: `profiles/codex/agents/worker.toml`
- Create: `profiles/codex/agents/reviewer.toml`
- Create: `profiles/codex/agents/escalation-reviewer.toml`

- [ ] **Step 1: Write the route/profile tests**

Create `test/routing-profile.test.js`:

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { lineCount, readUtf8 } = require('../lib/policy-helpers');

const root = path.resolve(__dirname, '..');

test('the maintained profile contains only the GPT-5.6 family', () => {
  const profile = readUtf8(root, 'profiles/gpt-5.6.md');
  assert.match(profile, /Profile version: 1\.0/);
  assert.match(profile, /Verified: 2026-07-10/);
  assert.match(profile, /developers\.openai\.com\/codex\/models/);
  for (const model of ['gpt-5.6-luna', 'gpt-5.6-terra', 'gpt-5.6-sol']) {
    assert.match(profile, new RegExp(model.replaceAll('.', '\\.'), 'i'));
  }
  assert.doesNotMatch(profile, /DeepSeek|Hermes|GPT-5\.[2-5]/i);
  assert.ok(lineCount(profile) <= 120, `profile has ${lineCount(profile)} lines`);
});

test('Codex defaults to Terra medium with bounded delegation', () => {
  const config = readUtf8(root, 'profiles/codex/config.toml');
  assert.match(config, /model = "gpt-5\.6-terra"/);
  assert.match(config, /model_reasoning_effort = "medium"/);
  assert.match(config, /max_depth = 1/);
  assert.match(config, /max_threads = 4/);
});

test('project agents map mechanical, work, and review lanes explicitly', () => {
  const expected = new Map([
    ['mechanical-worker.toml', ['gpt-5.6-luna', 'low', 'workspace-write']],
    ['explorer.toml', ['gpt-5.6-terra', 'medium', 'read-only']],
    ['worker.toml', ['gpt-5.6-terra', 'high', 'workspace-write']],
    ['reviewer.toml', ['gpt-5.6-sol', 'high', 'read-only']],
    ['escalation-reviewer.toml', ['gpt-5.6-sol', 'max', 'read-only']],
  ]);

  for (const [file, values] of expected) {
    const text = readUtf8(root, `profiles/codex/agents/${file}`);
    for (const value of values) assert.match(text, new RegExp(value.replaceAll('.', '\\.')));
  }
});
```

- [ ] **Step 2: Confirm the missing profile fails**

Run:

```bash
node --test test/routing-profile.test.js
```

Expected: FAIL with missing `profiles/gpt-5.6.md`.

- [ ] **Step 3: Create `profiles/gpt-5.6.md`**

The profile must contain these exact decisions:

```markdown
# GPT-5.6 routing profile

Status: maintained
Profile version: 1.0
Verified: 2026-07-10
Surfaces: Codex and ChatGPT Work
Recheck trigger: any GPT-5.6 or Codex routing/configuration change

This profile maps delivery capabilities to GPT-5.6. The kernel in `playbook.md` remains capability-based.

Sources: [GPT-5.6 release](https://openai.com/index/gpt-5-6/), [Codex models](https://developers.openai.com/codex/models), [Codex multi-agent](https://developers.openai.com/codex/multi-agent), and [Codex configuration](https://developers.openai.com/codex/config-reference).

## Default

Use `gpt-5.6-terra` with medium reasoning and a single agent for ordinary project work. The runtime default may be recorded as `runtime-default` when the exact observed route is unavailable; do not infer it.

## Route table

| Task shape | Minimum route | Topology |
| --- | --- | --- |
| Clear, repeatable, high-volume, objectively checked | `gpt-5.6-luna` low; use medium if interpretation appears | single |
| Repository exploration and ordinary bounded implementation | `gpt-5.6-terra` medium | single or one focused subagent |
| Bounded work needing stronger implementation judgment | `gpt-5.6-terra` high | single |
| Ambiguous, architecture-sensitive, risky, or high-value | `gpt-5.6-sol` high | single |
| Hardest tightly coupled problem | `gpt-5.6-sol` max | single |
| Broad work with genuinely independent lanes | `gpt-5.6-sol` max | Ultra proactive or explicitly capped subagents |
| High-risk review or repeated-failure escalation | `gpt-5.6-sol` high or max in fresh context | read-only reviewer |

Ultra means maximum reasoning plus `ultra-proactive` topology. Record the runtime label separately when available. Do not treat Ultra as another process mode or model tier.

## Escalation

- Luna to Terra: the task is no longer mechanical, validation needs interpretation, or one focused retry failed.
- Terra to Sol: architecture, security, public contracts, hidden coupling, difficult trade-offs, or repeated failure appears.
- Sol high to Sol max: a tightly coupled problem needs deeper analysis.
- Single to delegated: independent lanes can improve elapsed time or evidence quality and ownership is explicit.

After two fix cycles, reopen the contract, split the task, or ask for a decision. Do not keep increasing effort as a retry strategy.

## Route verification

A project-approved default needs no repeated user approval. Block Controlled implementation only when its minimum tier or effort cannot be confirmed or satisfied and task narrowing or deterministic validation cannot compensate. Otherwise record the observed route or `runtime-default` without unsupported claims.

## Review independence

Switching among Luna, Terra, and Sol does not create independence. Use a fresh context with adversarial instructions and give the reviewer the approved contract, actual diff, and captured validation. Prefer deterministic checks and human authority for consequential decisions.

## Delegation limits

- One orchestration plane.
- Default depth: one.
- Default concurrency cap: four.
- One writer per file or coupled file cluster.
- One named synthesis owner.
- No recursive fanout on top of native Ultra without an approved exception.
```

- [ ] **Step 4: Create the project-scoped Codex example**

Create `profiles/codex/config.toml`:

```toml
model = "gpt-5.6-terra"
model_reasoning_effort = "medium"

[agents]
max_threads = 4
max_depth = 1

[agents.mechanical_worker]
description = "Mechanical, objectively verifiable edits."
config_file = "agents/mechanical-worker.toml"

[agents.explorer]
description = "Read-only repository exploration and evidence gathering."
config_file = "agents/explorer.toml"

[agents.worker]
description = "Bounded implementation with exclusive ownership."
config_file = "agents/worker.toml"

[agents.reviewer]
description = "Fresh-context review of contract, diff, and evidence."
config_file = "agents/reviewer.toml"

[agents.escalation_reviewer]
description = "Maximum-depth review for high-risk or repeated-failure work."
config_file = "agents/escalation-reviewer.toml"
```

Create the five files under `profiles/codex/agents/` using this exact field pattern:

```toml
# mechanical-worker.toml
model = "gpt-5.6-luna"
model_reasoning_effort = "low"
sandbox_mode = "workspace-write"
developer_instructions = "Make only mechanical, objectively verifiable edits inside the assigned ownership. Stop when interpretation or risk appears."

# explorer.toml
model = "gpt-5.6-terra"
model_reasoning_effort = "medium"
sandbox_mode = "read-only"
developer_instructions = "Gather repository evidence only. Report exact paths, constraints, uncertainty, and verification opportunities. Do not edit files."

# worker.toml
model = "gpt-5.6-terra"
model_reasoning_effort = "high"
sandbox_mode = "workspace-write"
developer_instructions = "Implement only the approved bounded slice. Respect exclusive ownership, run assigned validation, and report evidence and gaps."

# reviewer.toml
model = "gpt-5.6-sol"
model_reasoning_effort = "high"
sandbox_mode = "read-only"
developer_instructions = "Review the approved contract, actual diff, and captured evidence in fresh context. Lead with concrete defects and do not rely on the implementer summary."

# escalation-reviewer.toml
model = "gpt-5.6-sol"
model_reasoning_effort = "max"
sandbox_mode = "read-only"
developer_instructions = "Perform a maximum-depth, fresh-context review of high-risk or repeatedly failing work. Identify contract errors, hidden coupling, missing evidence, and the minimum safe next action."
```

Write each comment-delimited block to its named file; do not put all five blocks in one TOML file.

- [ ] **Step 5: Verify and commit**

Run:

```bash
node --test test/routing-profile.test.js
npm test
CODEX_HOME="$PWD/profiles/codex" codex --strict-config features list >/tmp/adp-codex-features.txt
wc -l profiles/gpt-5.6.md
git diff --check
```

Expected: all tests pass; Codex accepts the project example with strict configuration parsing; the profile is no more than 120 lines.

Commit:

```bash
git add profiles test/routing-profile.test.js
git commit -m "feat: add GPT-5.6 routing profile"
```

---

## Task 4: Normalize Controlled-run evidence

**Files:**

- Create: `test/run-record.test.js`
- Create: `templates/run.json`
- Create: `specs/20260710-gpt-5-6-simplification/contract.md`
- Create: `specs/20260710-gpt-5-6-simplification/run.json`

- [ ] **Step 1: Write the run-record test**

Create `test/run-record.test.js`:

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { lineCount, readUtf8 } = require('../lib/policy-helpers');

const root = path.resolve(__dirname, '..');

test('the run template is compact and normalized around lanes', () => {
  const text = readUtf8(root, 'templates/run.json');
  const run = JSON.parse(text);

  assert.equal(run.mode, 'controlled');
  assert.ok(Array.isArray(run.lanes));
  assert.ok(Array.isArray(run.validation));
  assert.ok(Array.isArray(run.acceptance));
  assert.ok(run.contract.path);
  assert.ok(run.source.baseCommit);
  assert.equal(run.lanes[0].requested.model, 'gpt-5.6-terra');
  assert.equal(run.lanes[0].requested.effort, 'high');
  assert.equal(run.lanes[0].requested.topology, 'single');
  assert.ok(Object.hasOwn(run.lanes[0], 'observed'));
  assert.ok(Object.hasOwn(run, 'review'));
  assert.ok(Object.hasOwn(run, 'closeout'));
  for (const field of ['id', 'command', 'exitCode', 'startedAt', 'endedAt', 'outputReference', 'outputSha256', 'status']) {
    assert.ok(Object.hasOwn(run.validation[0], field), `validation is missing ${field}`);
  }
  assert.deepEqual(run.acceptance[0].evidence, ['validation:validation-1']);
  assert.ok(lineCount(text) <= 120, `run template has ${lineCount(text)} lines`);

  for (const duplicate of ['modelLedger', 'roles', 'routeEvaluations', 'parallelization']) {
    assert.equal(Object.hasOwn(run, duplicate), false, `${duplicate} must not return`);
  }
});
```

- [ ] **Step 2: Confirm the missing template fails**

Run:

```bash
node --test test/run-record.test.js
```

Expected: FAIL with missing `templates/run.json`.

- [ ] **Step 3: Create `templates/run.json`**

```json
{
  "schemaVersion": "1.0",
  "mode": "controlled",
  "status": "planned",
  "contract": {
    "path": "specs/example/contract.md",
    "sha256": "sha256:contract-content-hash",
    "approvalEvidence": "task-or-review-reference"
  },
  "source": {
    "baseCommit": "git-commit-sha",
    "finalCommit": null,
    "diffSha256": null
  },
  "route": {
    "policy": "profiles/gpt-5.6.md",
    "exception": null
  },
  "lanes": [
    {
      "id": "implementation",
      "role": "worker",
      "taskShape": "bounded-implementation",
      "ownership": ["path-or-coupled-cluster"],
      "requested": {
        "model": "gpt-5.6-terra",
        "effort": "high",
        "topology": "single"
      },
      "observed": {
        "model": "runtime-default",
        "effort": "unknown",
        "runtimePreset": null,
        "threadId": "unknown",
        "source": "unavailable"
      },
      "status": "planned",
      "evidence": []
    }
  ],
  "validation": [
    {
      "id": "validation-1",
      "command": "deterministic command or explicit inspection",
      "exitCode": null,
      "startedAt": null,
      "endedAt": null,
      "outputReference": "path, task output, or artifact reference",
      "outputSha256": null,
      "status": "pending"
    }
  ],
  "acceptance": [
    {
      "criterion": "AC-1",
      "status": "pending",
      "evidence": ["validation:validation-1"]
    }
  ],
  "review": {
    "reviewerLaneId": null,
    "diffReviewed": false,
    "evidenceReviewed": false,
    "decision": "pending",
    "findings": []
  },
  "closeout": {
    "outcome": "pending",
    "knownGaps": [],
    "escalation": null
  }
}
```

- [ ] **Step 4: Start the implementation's own Controlled record**

Create `specs/20260710-gpt-5-6-simplification/contract.md` from `templates/contract.md` with:

- Objective: the Goal at the top of this plan.
- Non-goals: global configuration changes, multi-provider active support, and unmeasured performance claims.
- Acceptance criteria: AC-1 two active modes only; AC-2 GPT-5.6-only active route profile; AC-3 normalized compact artifacts; AC-4 thin first-class adapters; AC-5 legacy excluded from active package; AC-6 all policy and package checks pass.
- Risk: breaking documentation/package migration with easy Git rollback.
- Authority: repository-local edits and archival moves only; no publishing or global installation.
- Ownership: one sequential synthesis owner for the whole migration.
- Verification: map each AC to the test files and final commands in Task 8.
- Approval evidence: reference the user's approval of massive simplification, option 3, and Direct/Controlled.

Copy `templates/run.json` to `specs/20260710-gpt-5-6-simplification/run.json`, then replace example values with the actual base commit, contract path/hash, current route observations, six validation entries, six acceptance mappings, and the implementation lane. Compute the contract hash with:

```bash
shasum -a 256 specs/20260710-gpt-5-6-simplification/contract.md
```

Expected: one SHA-256 digest. Prefix the stored digest with `sha256:`.

- [ ] **Step 5: Verify and commit**

Run:

```bash
node --test test/run-record.test.js
npm test
wc -l templates/run.json
node -e "JSON.parse(require('node:fs').readFileSync('specs/20260710-gpt-5-6-simplification/run.json'))"
git diff --check
```

Expected: all tests pass; both JSON files parse; the template is no more than 120 lines.

Commit:

```bash
git add templates/run.json test/run-record.test.js specs/20260710-gpt-5-6-simplification
git commit -m "refactor: normalize controlled run evidence"
```

---

## Task 5: Thin the Codex and ChatGPT Work adapters

**Files:**

- Create: `test/adapters.test.js`
- Rewrite: `adapters/codex/AGENTS.md`
- Rewrite: `adapters/codex/README.md`
- Rewrite: `adapters/chatgpt/instructions.md`
- Rewrite: `adapters/chatgpt/README.md`
- Rewrite: `AGENTS.md`

- [ ] **Step 1: Write adapter conformance tests**

Create `test/adapters.test.js`:

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { lineCount, readUtf8 } = require('../lib/policy-helpers');

const root = path.resolve(__dirname, '..');
const adapters = [
  'adapters/codex/AGENTS.md',
  'adapters/chatgpt/instructions.md',
];

test('first-class adapters translate the same two-mode kernel', () => {
  for (const file of adapters) {
    const text = readUtf8(root, file);
    assert.match(text, /Direct/);
    assert.match(text, /Controlled/);
    assert.match(text, /contract/i);
    assert.match(text, /actual diff/i);
    assert.match(text, /validation evidence/i);
    assert.match(text, /profiles\/gpt-5\.6\.md/);
    assert.doesNotMatch(text, /\b(?:Lightweight|Full) mode\b/i);
  }
});

test('the Codex adapter stays thin', () => {
  const text = readUtf8(root, 'adapters/codex/AGENTS.md');
  assert.ok(lineCount(text) <= 180, `Codex adapter has ${lineCount(text)} lines`);
});

test('the root instructions point only to active policy', () => {
  const text = readUtf8(root, 'AGENTS.md');
  assert.match(text, /adapters\/codex\/AGENTS\.md/);
  assert.match(text, /Direct and Controlled/);
  assert.match(text, /profiles\/gpt-5\.6\.md/);
  assert.doesNotMatch(text, /docs\/(?:model-routing|dynamic-workflows)\.md/);
});
```

- [ ] **Step 2: Confirm the old adapters fail**

Run:

```bash
node --test test/adapters.test.js
```

Expected: FAIL because the current adapters still define three modes and duplicate old routing policy.

- [ ] **Step 3: Rewrite the Codex adapter**

`adapters/codex/AGENTS.md` must be a thin executable translation with these sections and rules:

```markdown
# Agentic Delivery Playbook — Codex adapter

Use `playbook.md` as the process source of truth and `profiles/gpt-5.6.md` as the maintained route source of truth. Project-local instructions closer to a file still apply.

## Before editing

1. Inspect relevant repository instructions and code.
2. Classify the request as Direct or Controlled from consequence, ambiguity, reversibility, authority, coupling, and verification quality.
3. Select the minimum safe GPT-5.6 route separately from the mode. Do not claim an observed model or effort unless Codex exposes it.

## Direct

- State the intended change briefly.
- Make the smallest correct edit.
- Run relevant deterministic validation.
- Report changed files, results, assumptions, and gaps.
- Switch to Controlled if a material risk condition appears.

Do not create specs, run records, approval gates, reviewers, or subagents merely because a task touches several files.

## Controlled

- Create or state the compact contract from `templates/contract.md`.
- Resolve material product choices and authority boundaries before implementation.
- Give each writer exclusive files or one coupled cluster and name one synthesis owner.
- Capture validation against every acceptance criterion.
- Review the approved contract, actual diff, and validation evidence in fresh context.
- Use `templates/run.json` only for broad, sensitive, long-running, delegated, handed-off, or audit-relevant work.

Do not stop between approved implementation slices unless new scope, a product decision, external authority, inability to meet the safe route, or repeated contradictory evidence requires it.

## Routing and agents

- Project default: Terra medium, single agent.
- Mechanical and objectively checked: Luna low or medium.
- Strong bounded implementation judgment: Terra high.
- Ambiguous, architecture-sensitive, risky, or escalation work: Sol high or max.
- Prefer Sol max single-agent depth for tightly coupled hard work.
- Use Ultra or explicit subagents only for genuinely independent lanes with a synthesis barrier.
- Use one orchestration plane, maximum default depth one, and maximum default concurrency four.
- A different GPT-5.6 tier is not independent review. Use fresh context, adversarial instructions, direct diff/evidence access, deterministic tools, or human review.

Project-scoped example agent files are in `profiles/codex/`. Review and merge them into `.codex/`; never overwrite a user's global configuration.

## Evidence and closeout

Evidence includes the command or check, exit status, output reference, acceptance criterion, and result. Never convert an unrun check, implementer statement, or inferred route into a verified fact.

End with changed files, acceptance results, validation evidence, assumptions, known gaps, and escalation state.
```

- [ ] **Step 4: Rewrite the ChatGPT Work adapter**

Rewrite `adapters/chatgpt/instructions.md` as:

```markdown
# Agentic Delivery Playbook — ChatGPT Work adapter

Use `playbook.md` as the process source of truth and `profiles/gpt-5.6.md` as the maintained route source of truth. Workspace instructions and user authority still apply.

## Before work

1. Inspect the relevant attached or connected sources.
2. Classify the request as Direct or Controlled from consequence, ambiguity, reversibility, authority, coupling, and verification quality.
3. Select the minimum safe GPT-5.6 route separately from the mode. Do not infer a model, effort, or runtime preset that the workspace does not expose.

## Direct

- State the intended change briefly.
- Make the smallest correct in-scope change.
- Run or inspect the strongest relevant deterministic validation available.
- Report changed artifacts, results, assumptions, and gaps.
- Switch to Controlled if a material risk condition appears.

Do not create durable artifacts, approval gates, reviewers, or delegated lanes merely because a task has several steps.

## Controlled

- Create or state the compact contract from `templates/contract.md`.
- Resolve material product choices and authority boundaries before implementation.
- Give every delegated writer exclusive artifacts or one coupled cluster and name one synthesis owner.
- Capture validation against every acceptance criterion.
- Review the approved contract, actual diff, and validation evidence in fresh context.
- Use `templates/run.json` only for broad, sensitive, long-running, delegated, handed-off, or audit-relevant work.

Do not stop between approved implementation slices unless new scope, a product decision, external authority, inability to meet the safe route, or repeated contradictory evidence requires it.

## ChatGPT Work routing

Use the available GPT-5.6 selector or workspace policy to choose Luna, Terra, or Sol according to `profiles/gpt-5.6.md`. Record `runtime-default` when the exact route is not exposed. Use native Ultra only when the work has independent lanes and one synthesis barrier; do not add another recursive delegation tree on top of it.

Keep the contract in the conversation for bounded Controlled work. Attach `templates/contract.md` and `templates/run.json` only when durable handoff or audit evidence is useful.

Changing among Luna, Terra, and Sol is not independent review. Use fresh context, adversarial instructions, direct source/evidence access, deterministic checks, or human review.

## Evidence and closeout

Evidence includes the command or check, exit status, output reference, acceptance criterion, and result. Never convert an unrun check, implementer statement, or inferred route into a verified fact.

End with changed artifacts, acceptance results, validation evidence, assumptions, known gaps, and escalation state.
```

- [ ] **Step 5: Update adapter READMEs and root discovery instructions**

`adapters/codex/README.md` must explain two reviewable installation steps:

1. Merge `AGENTS.md` into the target repository's existing instructions.
2. Optionally copy `profiles/codex/` into the target's `.codex/` after reviewing collisions.

`adapters/chatgpt/README.md` must explain how to paste `instructions.md` into ChatGPT Work project instructions and optionally attach the profile/templates.

Use these exact README skeletons:

```markdown
# Codex adapter

1. Review and merge `AGENTS.md` into the target repository's existing `AGENTS.md`.
2. Optionally review `../../profiles/codex/`, then copy its contents into the target `.codex/` directory without overwriting local choices.

The repository instructions implement Direct and Controlled delivery. The project configuration keeps Terra medium as the default and registers bounded GPT-5.6 worker/reviewer examples. Nothing here should be copied into global Codex configuration without an explicit user decision.
```

```markdown
# ChatGPT Work adapter

Paste `instructions.md` into the ChatGPT Work project instructions. When durable Controlled artifacts are useful, attach `../../profiles/gpt-5.6.md`, `../../templates/contract.md`, and `../../templates/run.json` to the project.

Use the workspace's available GPT-5.6 controls; record `runtime-default` when the selected route is not exposed. The adapter adds no process mode beyond Direct and Controlled.
```

Replace root `AGENTS.md` with:

```markdown
# Agentic Delivery Playbook — Codex Instructions

Use `adapters/codex/AGENTS.md` as the repository operating instructions.

Before non-trivial coding work:

1. Read `adapters/codex/AGENTS.md`.
2. Classify delivery as Direct or Controlled using `playbook.md`.
3. Route separately with `profiles/gpt-5.6.md`.
4. Preserve captured validation evidence when Controlled work calls for a durable run record.

The adapter translates the canonical kernel; it must not redefine another workflow.
```

- [ ] **Step 6: Verify and commit**

Run:

```bash
node --test test/adapters.test.js
npm test
wc -l adapters/codex/AGENTS.md
git diff --check
```

Expected: all tests pass; Codex adapter is no more than 180 lines.

Commit:

```bash
git add AGENTS.md adapters test/adapters.test.js
git commit -m "refactor: thin first-class adapters"
```

---

## Task 6: Archive unsupported workflows and simplify the package surface

**Files:**

- Create: `legacy/README.md`
- Create: `scripts/validate-active-policy.js`
- Create: `test/active-surface.test.js`
- Rewrite: `bin/agentic-delivery-playbook.js`
- Rewrite: `package.json`
- Move: `adapters/{claude,pi}` to `legacy/adapters/`
- Move: old workflow docs to `legacy/docs/`
- Move: old templates to `legacy/templates/`
- Move: old examples to `legacy/examples/`
- Move: stale three-mode marketing assets to `legacy/assets/`

- [ ] **Step 1: Write active-surface and CLI tests**

Create `test/active-surface.test.js` with these assertions:

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const {
  lineCount,
  readUtf8,
  findForbiddenTerms,
} = require('../lib/policy-helpers');

const root = path.resolve(__dirname, '..');
const activePolicyFiles = [
  'playbook.md',
  'profiles/gpt-5.6.md',
  'adapters/codex/AGENTS.md',
  'adapters/chatgpt/instructions.md',
];

test('active policy contains no retired model matrix', () => {
  const files = new Map(activePolicyFiles.map((file) => [file, readUtf8(root, file)]));
  const matches = findForbiddenTerms(files, [
    /DeepSeek/i,
    /Hermes/i,
    /GPT-5\.[2-5]/i,
    /Pi-native/i,
  ]);
  assert.deepEqual(matches, []);
});

test('active policy respects its line budgets', () => {
  const budgets = new Map([
    ['playbook.md', 150],
    ['profiles/gpt-5.6.md', 120],
    ['adapters/codex/AGENTS.md', 180],
    ['templates/run.json', 120],
  ]);
  for (const [file, budget] of budgets) {
    assert.ok(lineCount(readUtf8(root, file)) <= budget, `${file} exceeds ${budget} lines`);
  }
});

test('retired provider adapters are legacy-only', () => {
  assert.throws(() => readUtf8(root, 'adapters/pi/SKILL.md'), /ENOENT/);
  assert.throws(() => readUtf8(root, 'adapters/claude/SKILL.md'), /ENOENT/);
  assert.match(readUtf8(root, 'legacy/README.md'), /unsupported/i);
});

test('CLI exposes active artifacts without mutating the target project', () => {
  const result = spawnSync(
    process.execPath,
    ['bin/agentic-delivery-playbook.js', 'show', 'profile'],
    { cwd: root, encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /^# GPT-5\.6 routing profile/m);
});

test('the breaking package release excludes legacy material', () => {
  const manifest = JSON.parse(readUtf8(root, 'package.json'));
  assert.equal(manifest.version, '0.3.0');
  assert.equal(manifest.files.includes('legacy'), false);
  assert.equal(manifest.files.includes('test'), false);
});
```

- [ ] **Step 2: Confirm the old surface fails**

Run:

```bash
node --test test/active-surface.test.js
```

Expected: FAIL because Pi/Claude remain active and the CLI has no `show profile` command.

- [ ] **Step 3: Move unsupported material without rewriting it**

Run these moves exactly:

```bash
mkdir -p legacy/adapters legacy/docs legacy/templates legacy/examples
git mv assets legacy/assets
git mv adapters/claude legacy/adapters/claude
git mv adapters/pi legacy/adapters/pi
git mv docs/dynamic-workflows.md legacy/docs/dynamic-workflows.md
git mv docs/failure-modes.md legacy/docs/failure-modes.md
git mv docs/gates.md legacy/docs/gates.md
git mv docs/handoff-economics.md legacy/docs/handoff-economics.md
git mv docs/high-risk-qa.md legacy/docs/high-risk-qa.md
git mv docs/model-routing.md legacy/docs/model-routing.md
git mv docs/openai-hermes-pi-routing-prd.md legacy/docs/openai-hermes-pi-routing-prd.md
git mv docs/openai-hermes-pi-routing.md legacy/docs/openai-hermes-pi-routing.md
git mv docs/philosophy.md legacy/docs/philosophy.md
git mv docs/pi-native-workflow.md legacy/docs/pi-native-workflow.md
git mv docs/pi-task-fit-model-routing.md legacy/docs/pi-task-fit-model-routing.md
git mv docs/public-run-reports.md legacy/docs/public-run-reports.md
git mv docs/tool-quickstart.md legacy/docs/tool-quickstart.md
git mv docs/validation-plan.md legacy/docs/validation-plan.md
git mv docs/visual-specs.md legacy/docs/visual-specs.md
git mv templates/child-task.md legacy/templates/child-task.md
git mv templates/closeout-governance.template.md legacy/templates/closeout-governance.template.md
git mv templates/final-review.md legacy/templates/final-review.md
git mv templates/model-ledger.md legacy/templates/model-ledger.md
git mv templates/notes.template.md legacy/templates/notes.template.md
git mv templates/pi-settings.template.json legacy/templates/pi-settings.template.json
git mv templates/public-run-report legacy/templates/public-run-report
git mv templates/qa-checklist.template.md legacy/templates/qa-checklist.template.md
git mv templates/run.template.json legacy/templates/run.template.json
git mv templates/spec.template.html legacy/templates/spec.template.html
git mv templates/spec.template.md legacy/templates/spec.template.md
git mv examples/lightweight-ticket legacy/examples/lightweight-ticket
git mv examples/pi-task-fit-routing legacy/examples/pi-task-fit-routing
```

Do not move `docs/superpowers/`; it contains the approved design and this plan. Leave existing root `specs/` history in place.

- [ ] **Step 4: Mark the archive honestly**

Create `legacy/README.md`:

```markdown
# Legacy material

This directory preserves unsupported historical adapters, model matrices, templates, examples, and marketing assets from the pre-0.3 playbook.

It is not active policy, is not tested against current runtimes, and is not included in the npm package. Do not copy routing or process rules from here into a new run without re-validating them.

Active policy lives in:

- `../playbook.md`
- `../profiles/gpt-5.6.md`
- `../adapters/codex/`
- `../adapters/chatgpt/`
- `../templates/contract.md`
- `../templates/run.json`
```

- [ ] **Step 5: Replace the mutating installer with a read-only artifact viewer**

Rewrite `bin/agentic-delivery-playbook.js`:

```js
#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const targets = Object.freeze({
  codex: 'adapters/codex/AGENTS.md',
  chatgpt: 'adapters/chatgpt/instructions.md',
  profile: 'profiles/gpt-5.6.md',
  contract: 'templates/contract.md',
  run: 'templates/run.json',
});

function usage(exitCode = 0) {
  const output = exitCode === 0 ? console.log : console.error;
  output(`Agentic Delivery Playbook

Usage:
  agentic-delivery-playbook show <codex|chatgpt|profile|contract|run>
  agentic-delivery-playbook --help

The show command prints a maintained artifact to stdout. It never changes local or global configuration.`);
  process.exit(exitCode);
}

const args = process.argv.slice(2);
if (args.includes('-h') || args.includes('--help')) usage(0);
if (args.length !== 2 || args[0] !== 'show' || !targets[args[1]]) usage(1);

process.stdout.write(fs.readFileSync(path.join(repoRoot, targets[args[1]]), 'utf8'));
```

- [ ] **Step 6: Add the active-policy validator**

Create `scripts/validate-active-policy.js`:

```js
#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  lineCount,
  readUtf8,
  findForbiddenTerms,
} = require('../lib/policy-helpers');

const root = path.resolve(__dirname, '..');
const active = [
  'playbook.md',
  'profiles/gpt-5.6.md',
  'adapters/codex/AGENTS.md',
  'adapters/chatgpt/instructions.md',
];
const budgets = new Map([
  ['playbook.md', 150],
  ['profiles/gpt-5.6.md', 120],
  ['adapters/codex/AGENTS.md', 180],
  ['templates/run.json', 120],
]);
const errors = [];

for (const [file, budget] of budgets) {
  const count = lineCount(readUtf8(root, file));
  if (count > budget) errors.push(`${file}: ${count} lines exceeds ${budget}`);
}

const files = new Map(active.map((file) => [file, readUtf8(root, file)]));
for (const match of findForbiddenTerms(files, [
  /DeepSeek/i,
  /Hermes/i,
  /GPT-5\.[2-5]/i,
  /Pi-native/i,
])) {
  errors.push(`${match.file}:${match.line}: retired active term ${match.term}`);
}

for (const file of ['templates/run.json']) {
  try {
    JSON.parse(readUtf8(root, file));
  } catch (error) {
    errors.push(`${file}: invalid JSON: ${error.message}`);
  }
}

for (const retired of ['adapters/pi', 'adapters/claude']) {
  if (fs.existsSync(path.join(root, retired))) errors.push(`${retired}: must be under legacy/`);
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('active policy validation passed');
}
```

- [ ] **Step 7: Rewrite package metadata for the 0.3.0 breaking simplification**

Set these exact values in `package.json` while retaining the existing name, license, repository, bin, CommonJS type, and Node engine:

```json
"version": "0.3.0",
"description": "GPT-5.6-first delivery kernel for Codex and ChatGPT Work: classify risk, route minimally, and verify from evidence.",
"files": [
  "adapters/chatgpt",
  "adapters/codex",
  "bin",
  "docs/adapters.md",
  "docs/evaluation.md",
  "docs/getting-started.md",
  "docs/publishing.md",
  "lib",
  "profiles",
  "scripts",
  "templates",
  "playbook.md",
  "README.md",
  "LICENSE"
],
"scripts": {
  "test": "node --test test/*.test.js",
  "validate:policy": "node scripts/validate-active-policy.js",
  "check": "npm test && npm run validate:policy"
},
"keywords": [
  "coding-agents",
  "codex",
  "chatgpt-work",
  "gpt-5.6",
  "agentic-delivery",
  "software-engineering",
  "human-in-the-loop"
]
```

The `files` array must not include `legacy`, `test`, root `specs`, or `docs/superpowers`.

- [ ] **Step 8: Verify and commit**

Run:

```bash
node --test test/active-surface.test.js
npm run check
node bin/agentic-delivery-playbook.js --help
node bin/agentic-delivery-playbook.js show codex | head -1
npm pack --dry-run
git diff --check
```

Expected:

- all tests and active policy validation pass;
- help lists only read-only `show` targets;
- Codex output starts with its adapter heading;
- the package contains active adapters/profile/templates and contains no `legacy/` path;
- `git diff --check` prints nothing.

Commit:

```bash
git add legacy adapters docs templates examples bin package.json scripts test/active-surface.test.js
git commit -m "chore: archive legacy delivery workflows"
```

---

## Task 7: Publish the new user journey and evaluation protocol

**Files:**

- Create: `docs/evaluation.md`
- Create: `examples/controlled-run/contract.md`
- Create: `examples/controlled-run/run.json`
- Rewrite: `README.md`
- Rewrite: `docs/getting-started.md`
- Rewrite: `docs/adapters.md`
- Modify: `docs/business-assumptions.md`
- Modify: `docs/publishing.md`
- Rewrite: `examples/README.md`
- Modify: `BUSINESS-CONTEXT.md`
- Modify: `CHANGELOG.md`
- Modify: `CONTRIBUTING.md`
- Modify: `SECURITY.md`
- Modify: `.github/pull_request_template.md`
- Modify: `.github/ISSUE_TEMPLATE/adapter-request.md`
- Modify: `.github/ISSUE_TEMPLATE/workflow-improvement.md`
- Modify: `test/active-surface.test.js`

- [ ] **Step 1: Add failing public-surface assertions**

Append to `test/active-surface.test.js`:

```js
test('public docs describe the maintained surface honestly', () => {
  const readme = readUtf8(root, 'README.md');
  assert.match(readme, /Direct and Controlled/);
  assert.match(readme, /GPT-5\.6 Sol, Terra, and Luna/);
  assert.match(readme, /Codex and ChatGPT Work/);
  assert.match(readme, /docs\/evaluation\.md/);
  assert.doesNotMatch(readme, /Pi-first|Direct.*Lightweight.*Full/is);

  const evaluation = readUtf8(root, 'docs/evaluation.md');
  for (const arm of [
    'Sol medium without the playbook',
    'Sol medium with the simplified kernel',
    'Routed GPT-5.6 family with the simplified kernel',
    'Sol Ultra high-compute comparison',
  ]) {
    assert.match(evaluation, new RegExp(arm, 'i'));
  }
});

test('repository contribution and support metadata matches 0.3', () => {
  const security = readUtf8(root, 'SECURITY.md');
  const contributing = readUtf8(root, 'CONTRIBUTING.md');
  const pullRequest = readUtf8(root, '.github/pull_request_template.md');
  assert.match(security, /\| 0\.3\.x \| Yes \|/);
  assert.match(security, /\| 0\.2\.x and earlier \| No \|/);
  assert.match(contributing, /Direct and Controlled/);
  assert.match(contributing, /GPT-5\.6/);
  assert.match(pullRequest, /Direct and Controlled/);
  assert.match(pullRequest, /active profile/i);
});

test('local links in the maintained public docs resolve', () => {
  const publicDocs = [
    'README.md',
    'BUSINESS-CONTEXT.md',
    'playbook.md',
    'profiles/gpt-5.6.md',
    'adapters/codex/README.md',
    'adapters/chatgpt/README.md',
    'docs/getting-started.md',
    'docs/adapters.md',
    'docs/business-assumptions.md',
    'docs/evaluation.md',
    'docs/publishing.md',
    'examples/README.md',
  ];
  const linkPattern = /!?\[[^\]]*\]\(([^)]+)\)/g;

  for (const file of publicDocs) {
    const sourcePath = path.join(root, file);
    for (const match of fs.readFileSync(sourcePath, 'utf8').matchAll(linkPattern)) {
      const rawTarget = match[1].trim().replace(/^<|>$/g, '');
      if (/^(?:https?:|mailto:|#)/.test(rawTarget)) continue;
      const localTarget = decodeURI(rawTarget.split('#')[0]);
      const resolved = path.resolve(path.dirname(sourcePath), localTarget);
      assert.ok(fs.existsSync(resolved), `${file}: broken local link ${rawTarget}`);
    }
  }
});
```

- [ ] **Step 2: Confirm the old public story fails**

Run:

```bash
node --test test/active-surface.test.js
```

Expected: FAIL because README is still Pi-first and `docs/evaluation.md` is absent.

- [ ] **Step 3: Rewrite README around one decision and one route table**

The README must contain, in this order:

1. One-paragraph purpose: a small evidence-first kernel for Codex and ChatGPT Work.
2. A `Direct and Controlled` table using the exact decision conditions from `playbook.md`.
3. A route table summarizing Luna mechanical, Terra default, Sol judgment/escalation, and Ultra only for independent lanes.
4. A five-minute Codex setup: review/merge `adapters/codex/AGENTS.md`; optionally review/copy `profiles/codex/` into `.codex/`.
5. A ChatGPT Work setup: paste `adapters/chatgpt/instructions.md`; optionally attach the profile/templates.
6. CLI examples for `show codex`, `show chatgpt`, and `show profile`; say explicitly that the CLI does not install or overwrite configuration.
7. Links to `playbook.md`, `profiles/gpt-5.6.md`, `templates/contract.md`, `templates/run.json`, and `docs/evaluation.md`.
8. An honest status note: only the GPT-5.6 profile is maintained; prior material is unsupported under `legacy/` and excluded from the npm package.
9. A 0.2 migration note: the mutating `install pi` and `install claude` commands were removed; existing installations are not updated automatically, and users must review/merge the maintained Codex or ChatGPT Work artifacts themselves.

Remove the old mode tree, Pi-native workflow, provider comparison, three-file bundle, mandatory model-ledger, and public-run-report guidance. Do not preserve those sections as collapsed or secondary active docs.

- [ ] **Step 4: Rewrite focused supporting docs**

`docs/getting-started.md` should be a single end-to-end example:

- classify one small reversible change as Direct and show its concise closeout;
- classify one public-contract change as Controlled;
- fill one compact contract;
- choose Terra high or Sol high based on the described risk, separately from mode;
- capture one command, exit code, and output reference;
- review contract + actual diff + evidence;
- show where the run record becomes necessary.

`docs/adapters.md` should list only Codex and ChatGPT Work as maintained, show their installation paths, and link to `legacy/README.md` for historical material.

`examples/README.md` should list only `controlled-run/` as an active example and state that Direct work normally needs no artifact directory.

Create `examples/controlled-run/contract.md` and `run.json` as fully filled, internally consistent examples for a fictional versioned API response change. Use Terra high for implementation and Sol high fresh-context review. Every validation row must have a realistic command, exit code `0`, output reference, and `passed` status; mark the fictional run `accepted`.

- [ ] **Step 5: Create the comparative evaluation protocol**

`docs/evaluation.md` must define:

```markdown
# Evaluation protocol

## Question

Does the simplified kernel improve delivery outcomes, and does routing among GPT-5.6 Luna, Terra, and Sol add value beyond using Sol medium for every task?

## Arms

1. Sol medium without the playbook.
2. Sol medium with the simplified kernel.
3. Routed GPT-5.6 family with the simplified kernel.
4. Sol Ultra high-compute comparison.

## Corpus

Use frozen tasks across mechanical, bounded implementation, ambiguous architecture, high-risk review, and broad decomposable work. Each task includes a hidden reference outcome, deterministic checks where possible, and a fixed authority boundary. Run arms in fresh contexts, randomize order, and use at least three repetitions per task and arm when cost permits.

## Measures

- acceptance-criterion completion
- critical and non-critical defects in the actual diff
- focused fix cycles before acceptance
- unsupported claims about tests, routes, or review
- elapsed time and token usage when the runtime exposes them
- total model cost or credits when the runtime exposes them
- human intervention and unresolved decisions
- accepted, rejected, and duplicative delegated lanes

Do not substitute narrative quality for code/evidence quality. Report unavailable telemetry as unavailable.

## Review

Use task-specific deterministic checks first. Use blinded human review for consequential qualitative judgments. A fresh Sol context may provide an additional review signal, but same-family review is not labeled independent.

## Decision rules

- If arm 2 does not materially outperform arm 1 on drift, defects, or human burden, simplify the kernel further.
- If arm 3 does not reduce total cost or time without degrading quality versus arm 2, remove most explicit tier routing.
- If arm 4 dominates quality and total economics on representative work, prefer Sol Ultra and retain only the intent and evidence controls.
- If confidence intervals overlap materially or the corpus is too small, record the result as inconclusive rather than claiming a win.

## Reporting

Publish task-level results, aggregate medians and rates, route observations, failures, exclusions, and the frozen protocol version. Do not publish cost or quality claims that the collected evidence cannot reproduce.
```

Below these required sections, define protocol version `1.0` and a run sheet with these exact fields:

```text
protocolVersion, taskId, taskStratum, arm, repetition, randomizedOrder,
promptSha256, baseCommit, requestedModel, requestedEffort, requestedTopology,
observedModel, observedEffort, observedRuntimePreset, routeSource,
startedAt, endedAt, elapsedSeconds, inputTokens, cachedTokens, outputTokens,
modelCostOrCredits, acceptancePassed, acceptanceTotal, criticalDefects,
nonCriticalDefects, fixCycles, unsupportedClaims, humanInterventions,
acceptedLanes, rejectedLanes, duplicativeLanes, outcome, exclusions, notes
```

Define the aggregate result table as one row per arm and task stratum with repetitions, completion rate, median acceptance rate, critical-defect rate, median fix cycles, median human interventions, median elapsed time, median tokens, median cost/credits, and confidence interval fields. Before the first run, record the materiality threshold for each decision metric and freeze it with the task corpus. Do not change the four arms or decision rules without recording a new protocol version.

- [ ] **Step 6: Align product and release claims**

Update `docs/business-assumptions.md` and `BUSINESS-CONTEXT.md` so the current hypothesis is explicit: the kernel may be useful, routing may or may not add value, and evaluation decides. Remove claims that Pi-native delivery or broad provider support is the active differentiator.

Update `docs/publishing.md` to version `v0.3.0`, the new description, Codex/ChatGPT/GPT-5.6 topics, and a launch blurb that says “two-mode delivery kernel” rather than “spec-gated multi-provider workflow.” Remove the obsolete social-preview instructions because the three-mode assets are archived; record a new preview as optional follow-up, not a release claim.

Update `CONTRIBUTING.md` to require Direct/Controlled terminology, capability-based kernel changes, GPT-5.6 profile conformance, evidence-backed claims, and updates to tests/examples when semantics change. Explain that new provider adapters are community proposals unless the project explicitly accepts a maintenance and evaluation commitment.

Update `SECURITY.md` so `0.3.x` is supported and `0.2.x and earlier` is not. Keep the existing responsible-reporting and unsafe-agent-guidance scope.

Update `.github/pull_request_template.md` so its checklist verifies Direct/Controlled consistency, no stale active model references, evidence/schema updates, active profile consistency, and no unsupported performance claims. Update the adapter-request template to disclose the maintained Codex/ChatGPT boundary and ask who will maintain/test a proposed adapter. Replace “core playbook, gates” in the workflow-improvement template with “kernel, profile, templates.”

Add a `0.3.0 - 2026-07-10` entry at the top of `CHANGELOG.md` listing:

- breaking replacement of Direct/Lightweight/Full with Direct/Controlled;
- GPT-5.6 as the only maintained profile;
- first-class Codex and ChatGPT Work adapters;
- normalized contract/run artifacts;
- legacy archive and read-only CLI;
- comparative evaluation protocol.

- [ ] **Step 7: Verify and commit**

Run:

```bash
node --test test/active-surface.test.js
npm run check
rg -n 'Pi-first|Direct/Lightweight/Full|Lightweight mode|Full mode' README.md AGENTS.md CONTRIBUTING.md SECURITY.md .github playbook.md profiles adapters/codex adapters/chatgpt templates docs/getting-started.md docs/adapters.md docs/evaluation.md docs/publishing.md examples
git diff --check
```

Expected: all checks pass; `rg` returns exit code 1 with no active matches; `git diff --check` prints nothing.

Commit:

```bash
git add README.md BUSINESS-CONTEXT.md CHANGELOG.md CONTRIBUTING.md SECURITY.md .github docs examples test/active-surface.test.js
git commit -m "docs: publish GPT-5.6-first user journey"
```

---

## Task 8: Review, package, and close the Controlled migration

**Files:**

- Modify: `specs/20260710-gpt-5-6-simplification/run.json`
- Create: `specs/20260710-gpt-5-6-simplification/artifacts/npm-check.log`
- Create: `specs/20260710-gpt-5-6-simplification/artifacts/codex-show.md`
- Create: `specs/20260710-gpt-5-6-simplification/artifacts/chatgpt-show.md`
- Create: `specs/20260710-gpt-5-6-simplification/artifacts/profile-show.md`
- Create: `specs/20260710-gpt-5-6-simplification/artifacts/npm-pack.log`
- Create: `specs/20260710-gpt-5-6-simplification/artifacts/active-surface.log`
- Create: `specs/20260710-gpt-5-6-simplification/artifacts/reviewer.md`
- Modify only if evidence finds a defect: any active file from Tasks 1-7

- [ ] **Step 1: Run the complete deterministic suite from a clean index**

Run:

```bash
set -e
ARTIFACTS=specs/20260710-gpt-5-6-simplification/artifacts
mkdir -p "$ARTIFACTS"
npm run check >"$ARTIFACTS/npm-check.log" 2>&1
node bin/agentic-delivery-playbook.js show codex >"$ARTIFACTS/codex-show.md"
node bin/agentic-delivery-playbook.js show chatgpt >"$ARTIFACTS/chatgpt-show.md"
node bin/agentic-delivery-playbook.js show profile >"$ARTIFACTS/profile-show.md"
test -s "$ARTIFACTS/codex-show.md"
test -s "$ARTIFACTS/chatgpt-show.md"
test -s "$ARTIFACTS/profile-show.md"
npm pack --dry-run >"$ARTIFACTS/npm-pack.log" 2>&1
cat "$ARTIFACTS/npm-check.log"
cat "$ARTIFACTS/npm-pack.log"
git diff --check
git status --short
```

Expected:

- tests and policy validation pass;
- all three `show` commands exit `0` and produce non-empty captured files;
- package preview excludes `legacy/`, `test/`, root `specs/`, and `docs/superpowers/`;
- no whitespace errors;
- the only new worktree paths are the captured artifact files.

- [ ] **Step 2: Check the active surface for semantic duplication and retired policy**

Run:

```bash
set -e
ARTIFACTS=specs/20260710-gpt-5-6-simplification/artifacts
find adapters profiles templates docs -maxdepth 3 -type f | sort >"$ARTIFACTS/active-surface.log"
wc -l playbook.md profiles/gpt-5.6.md adapters/codex/AGENTS.md templates/run.json >>"$ARTIFACTS/active-surface.log"
set +e
rg -n 'DeepSeek|Hermes|GPT-5\.[2-5]|Pi-native|Lightweight mode|Full mode' README.md AGENTS.md CONTRIBUTING.md SECURITY.md .github playbook.md profiles adapters/codex adapters/chatgpt templates docs/getting-started.md docs/adapters.md docs/evaluation.md docs/publishing.md examples >>"$ARTIFACTS/active-surface.log" 2>&1
RG_EXIT=$?
set -e
test "$RG_EXIT" -eq 1
cat "$ARTIFACTS/active-surface.log"
```

Expected: only intended active files are listed; `rg` has no matches and exits `1`; every line budget passes.

- [ ] **Step 3: Perform the required fresh-context review**

Use `gpt-5.6-sol` high in a fresh read-only context. Provide:

- the approved design;
- this implementation plan;
- `specs/20260710-gpt-5-6-simplification/contract.md`;
- the actual `git diff` from the base commit;
- complete output from Steps 1 and 2.

Ask the reviewer to check contract coverage, contradictions between kernel/profile/adapters, unsafe installation behavior, stale active links, misleading claims, package contents, and missing evidence. Do not call the review independent; record it as fresh-context same-family review.

Save the reviewer result, route observations, and finding dispositions to `specs/20260710-gpt-5-6-simplification/artifacts/reviewer.md` using `apply_patch`. Exclude secrets and irrelevant conversation content.

Expected: a concrete finding list or an explicit no-findings result grounded in the diff and evidence.

- [ ] **Step 4: Resolve findings and repeat affected validation**

For every valid finding, add a focused regression assertion to the relevant existing test file before the fix, confirm it fails, apply the smallest correction, and rerun the focused test plus `npm run check`. Send the focused correction diff and new evidence back to the reviewer and record closure in `artifacts/reviewer.md`. If review exposes a product decision or scope change, stop and ask the user rather than silently changing the approved design.

If review caused any code or documentation fix, commit the verified fixes before finalizing evidence:

```bash
git add -u
git commit -m "fix: address simplification review findings"
```

If the review produced no valid finding, do not create an empty commit.

- [ ] **Step 5: Finalize the run record**

Update `specs/20260710-gpt-5-6-simplification/run.json` with:

- final implementation and reviewer lane observations;
- actual validation commands, exit codes, and output references for AC-1 through AC-6;
- reviewed diff SHA-256;
- reviewer decision and findings disposition;
- known gaps, including unavailable model/effort telemetry;
- closeout outcome `accepted` only if every criterion passed, otherwise `partially-accepted` or `escalated`;
- `source.finalCommit` set to the current implementation commit before the evidence-only closeout commit.

Read the recorded base, capture the final implementation commit, and compute the reviewed source diff hash with:

```bash
BASE_COMMIT=$(node -e 'process.stdout.write(require("./specs/20260710-gpt-5-6-simplification/run.json").source.baseCommit)')
FINAL_IMPLEMENTATION_COMMIT=$(git rev-parse HEAD)
git diff --binary "$BASE_COMMIT".."$FINAL_IMPLEMENTATION_COMMIT" | shasum -a 256
```

Store `FINAL_IMPLEMENTATION_COMMIT` in `source.finalCommit` and the digest with a `sha256:` prefix in `source.diffSha256`. The closeout evidence commit is intentionally not part of the reviewed implementation range.

Run:

```bash
shasum -a 256 specs/20260710-gpt-5-6-simplification/artifacts/*
```

Store each digest with a `sha256:` prefix in the matching validation row's `outputSha256`. Record actual start/end timestamps and exit codes; do not reconstruct values that were not observed.

- [ ] **Step 6: Commit closeout evidence and perform final verification**

Run:

```bash
npm run check
git diff --check
git status --short
```

Commit:

```bash
git add specs/20260710-gpt-5-6-simplification/run.json specs/20260710-gpt-5-6-simplification/artifacts
git commit -m "chore: close GPT-5.6 simplification run"
```

Run `npm run check` and `git status --short` once more. Expected: the final worktree is clean and the complete suite passes. Report both `source.finalCommit` (the reviewed implementation tree) and the later closeout-evidence commit in the handoff.

---

## Final acceptance checklist

- [ ] Active policy defines only Direct and Controlled.
- [ ] Process mode is not coupled to model tier, effort, or topology.
- [ ] GPT-5.6 Sol/Terra/Luna is the only maintained route profile.
- [ ] Terra medium is the project default; Ultra is opt-in for independent lanes.
- [ ] Controlled work uses one compact contract and normalized lane/evidence record.
- [ ] Codex and ChatGPT Work are the only first-class adapters.
- [ ] Historical provider material is clearly unsupported under `legacy/` and absent from the npm package.
- [ ] CLI operations are read-only.
- [ ] Active policy line budgets pass.
- [ ] Evaluation documentation makes no unsupported outcome or savings claim.
- [ ] The migration's actual diff and evidence received fresh-context review.
- [ ] `npm run check`, `npm pack --dry-run`, and `git diff --check` pass from a clean worktree.
