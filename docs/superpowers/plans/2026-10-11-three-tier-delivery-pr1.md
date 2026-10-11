# Three-Tier Controlled Delivery, PR 1 (mechanism) Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Claude Code plugin mechanism from the approved spec: three new agents, a shipped Workflow script that runs Controlled work as Plan, Implement, Review, Goal-fit, a rewritten `deliver` skill, profile version 2, probe support for workflow transcripts with a route match check, run-record schema 1.1, and the 0.4.0 version bump, then a recorded dogfood run.

**Architecture:** The main session (Fable 5.1 or Opus 5.5) stays the only orchestration plane and the only spawner. Controlled implementation runs through `adapters/claude-code/workflows/deliver-controlled.js`, a plain-JavaScript Workflow script that calls plugin agents by namespaced `agentType` with explicit `model` and `effort`, gates each task on a content-hash ownership check and a deterministic command, runs a fresh-context Opus defect review and a fresh-context Fable goal-fit review, and returns one JSON record. Pure helpers (path matcher, topological sort, plan rules R1 to R8, file-state diff) live in `lib/deliver-plan-rules.js` and are copied verbatim into the script between marker comments, with a test that keeps the copies identical. The probe (`lib/claude-route-probe.js`) learns the workflow transcript layout and gains `compareRoutes` for the requested-versus-observed match rule.

**Tech Stack:** Node 18+ (CommonJS for `lib/`, `bin/`, `test/`), `node:test` + `node:assert/strict`, Claude Code plugin manifest, Claude Code Workflow tool script API (ESM `export const meta`, globals `agent`, `phase`, `log`, `args`; no `require`, `import`, filesystem, `Date.now`, or `Math.random`).

**Spec:** `docs/superpowers/specs/2026-10-11-claude-code-three-tier-delivery-design.md`. Read it first. Every rule name (R1 to R8), label scheme, reason string, and return shape below comes from it.

**Repository conventions you must keep:**
- `npm run check` runs `node --test test/*.test.js` and `node scripts/validate-active-policy.js`. Both must pass after every task.
- No personal absolute paths (`/Users/`, `/home/`, `C:\Users`) in any active file or fixture. Tests enforce this.
- Full model IDs in agent frontmatter: `claude-fable-5-1`, `claude-opus-5-5`, `claude-sonnet-5-5`.
- The read-only disclosure sentence must appear verbatim in every read-only agent, the profile, the skill, and the adapter README: `read-only by instruction; Bash is available for diff and checks`.
- `profiles/claude-5.md` is capped at 120 lines; `adapters/claude-code/skills/deliver/SKILL.md` at 80 lines; `templates/run.json` at 120 lines.
- Commit after each task with the message given. End every commit message with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Work on branch `feat/three-tier-pr1` created from `design/three-tier-delivery`.

**File structure (what each file is responsible for):**

| File | Responsibility |
| --- | --- |
| `lib/deliver-plan-rules.js` (new) | Pure helpers: path matcher, topological order, `validatePlan` (R1 to R8), `changedPaths`. Source of truth for the block copied into the script. |
| `adapters/claude-code/workflows/deliver-controlled.js` (new) | The Workflow script: `meta`, agent table, schemas, prompts, four phases, return record. |
| `adapters/claude-code/agents/adp-lead.md`, `adp-validator.md`, `adp-goal-reviewer.md` (new) | Agent definitions. Lead plans; validator fingerprints and runs one command; goal reviewer judges fitness. |
| `adapters/claude-code/agents/adp-worker*.md`, `adp-reviewer*.md` (modify) | Add structured-return and no-commit lines. |
| `adapters/claude-code/skills/deliver/SKILL.md` (rewrite) | Orchestrator instructions: grill, classify, contract, workflow call, closeout, manual fallback. |
| `adapters/claude-code/README.md` (rewrite) | Install, orchestrator route, and a Reference section: `args` example, run-record mapping, fingerprint and diff-hash commands, probe usage. |
| `profiles/claude-5.md` (rewrite) | Route table v2, escalation ladder, delegation limits, attestation rules, known gaps. |
| `templates/claude-settings.template.json` (modify) | Fable high orchestrator. |
| `templates/run.json`, `examples/controlled-run/run.json` (modify) | Schema 1.1 optional fields. |
| `lib/claude-route-probe.js` (modify) | Workflow folder walk, label/phase fields, effort precedence, `compareRoutes`. |
| `bin/agentic-delivery-playbook.js` (modify) | `--requested` option for `probe claude`. |
| `scripts/validate-active-policy.js` (modify) | New active files; `node --check` on the script. |
| `.claude-plugin/plugin.json`, `package.json`, `SECURITY.md`, `CHANGELOG.md` (modify) | Register agents, bump 0.4.0, ship the adapter in the npm package. |
| `test/deliver-plan-rules.test.js`, `test/deliver-workflow.test.js` (new); `test/claude-code-adapter.test.js`, `test/claude-code-route-probe.test.js`, `test/run-record.test.js`, `test/active-surface.test.js` (modify) | Tests. |
| `test/fixtures/claude-code/session-2.jsonl` and `session-2/` (new) | Synthetic workflow transcript in the observed layout, plus `workflow-result.json`. |
| `specs/<date>-three-tier-dogfood/` (new, by hand at the end) | AC-9 and AC-10 evidence. |

---

## Chunk 1: Plan rules library and agents

### Task 1: Branch and baseline

**Files:** none

- [ ] **Step 1: Create the working branch from the design branch**

```bash
cd /path/to/agentic-delivery-playbook
git fetch origin
git checkout design/three-tier-delivery
git pull --ff-only
git checkout -b feat/three-tier-pr1
```

- [ ] **Step 2: Confirm the baseline is green**

Run: `npm run check`
Expected: last lines include `# pass` with 0 fails and `active policy validation passed`.

### Task 2: Plan rules library, tests first

**Files:**
- Create: `lib/deliver-plan-rules.js`
- Test: `test/deliver-plan-rules.test.js`

- [ ] **Step 1: Write the failing tests**

Create `test/deliver-plan-rules.test.js`:

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  matchPattern,
  matchesAny,
  topologicalOrder,
  validatePlan,
  changedPaths,
} = require('../lib/deliver-plan-rules');

const lanes = [
  { id: 'worker', ownedFiles: ['src/**', 'test/unit/*.test.js', 'docs/notes.md'] },
  { id: 'docs', ownedFiles: ['docs/**'] },
];
const nonGoalFiles = ['README.md', 'legacy/**'];

const task = (overrides) => ({
  id: 't1',
  lane: 'worker',
  title: 'one',
  ownedFiles: ['src/a.js'],
  instructions: 'do it',
  dependsOn: [],
  check: { command: 'npm test', expectedExit: 0 },
  acceptanceCriteria: ['AC-1'],
  ...overrides,
});
const plan = (tasks, extra = {}) => ({ tasks, assumptions: [], openQuestions: [], ...extra });

test('matchPattern: literal, single-segment star, and double star', () => {
  assert.equal(matchPattern('docs/notes.md', 'docs/notes.md'), true);
  assert.equal(matchPattern('docs/notes.md', 'docs/other.md'), false);
  assert.equal(matchPattern('test/unit/*.test.js', 'test/unit/a.test.js'), true);
  assert.equal(matchPattern('test/unit/*.test.js', 'test/unit/deep/a.test.js'), false);
  assert.equal(matchPattern('src/**', 'src/a.js'), true);
  assert.equal(matchPattern('src/**', 'src/x/y/z.js'), true);
  assert.equal(matchPattern('src/**', 'src'), true);
  assert.equal(matchPattern('src/**', 'lib/a.js'), false);
  assert.equal(matchPattern('**/*.md', 'a/b/c.md'), true);
  assert.equal(matchPattern('**/*.md', 'c.md'), true);
  assert.equal(matchPattern('a.*', 'a.b'), true);
  assert.equal(matchPattern('a.*', 'axb'), false, 'dot is literal');
  assert.equal(matchesAny(['x/**', 'y.md'], 'y.md'), true);
  assert.equal(matchesAny([], 'y.md'), false);
});

test('topologicalOrder: dependency order, unknown dependency, cycle', () => {
  const ordered = topologicalOrder([
    task({ id: 'b', dependsOn: ['a'] }),
    task({ id: 'a' }),
    task({ id: 'c', dependsOn: ['a', 'b'] }),
  ]);
  assert.deepEqual(ordered, { order: ['a', 'b', 'c'], unknown: null, cycle: false });
  assert.deepEqual(topologicalOrder([task({ id: 'a', dependsOn: ['zzz'] })]), { order: null, unknown: 'zzz', cycle: false });
  assert.deepEqual(
    topologicalOrder([task({ id: 'a', dependsOn: ['b'] }), task({ id: 'b', dependsOn: ['a'] })]),
    { order: null, unknown: null, cycle: true },
  );
});

test('validatePlan accepts a valid plan and returns the task order', () => {
  const result = validatePlan(plan([task({ id: 'a' }), task({ id: 'b', ownedFiles: ['src/b.js'], dependsOn: ['a'] })]), lanes, nonGoalFiles);
  assert.deepEqual(result, { ok: true, order: ['a', 'b'] });
});

test('R1: empty tasks and duplicate ids are rejected', () => {
  assert.equal(validatePlan(plan([]), lanes, nonGoalFiles).reason, 'plan-rule-R1');
  assert.equal(validatePlan(null, lanes, nonGoalFiles).reason, 'plan-rule-R1');
  assert.equal(validatePlan(plan([task({ id: 'a' }), task({ id: 'a', ownedFiles: ['src/b.js'] })]), lanes, nonGoalFiles).reason, 'plan-rule-R1');
});

test('R2: empty ownedFiles, missing command, non-integer expectedExit are rejected', () => {
  assert.equal(validatePlan(plan([task({ ownedFiles: [] })]), lanes, nonGoalFiles).reason, 'plan-rule-R2');
  assert.equal(validatePlan(plan([task({ check: { command: '', expectedExit: 0 } })]), lanes, nonGoalFiles).reason, 'plan-rule-R2');
  assert.equal(validatePlan(plan([task({ check: { command: 'x', expectedExit: '0' } })]), lanes, nonGoalFiles).reason, 'plan-rule-R2');
});

test('R3 and R4: unknown lane and path outside the lane are rejected', () => {
  assert.equal(validatePlan(plan([task({ lane: 'nope' })]), lanes, nonGoalFiles).reason, 'plan-rule-R3');
  assert.equal(validatePlan(plan([task({ ownedFiles: ['lib/a.js'] })]), lanes, nonGoalFiles).reason, 'plan-rule-R4');
});

test('R5 and R6: non-goal paths and shared paths are rejected', () => {
  const docsLanes = [{ id: 'worker', ownedFiles: ['**'] }];
  assert.equal(validatePlan(plan([task({ ownedFiles: ['legacy/x.md'] })]), docsLanes, nonGoalFiles).reason, 'plan-rule-R5');
  assert.equal(validatePlan(plan([task({ id: 'a' }), task({ id: 'b' })]), lanes, nonGoalFiles).reason, 'plan-rule-R6');
});

test('R7 and R8: dependency problems and open questions are rejected, in rule order', () => {
  assert.equal(validatePlan(plan([task({ dependsOn: ['zzz'] })]), lanes, nonGoalFiles).reason, 'plan-rule-R7');
  assert.equal(validatePlan(plan([task({ id: 'a', dependsOn: ['b'] }), task({ id: 'b', ownedFiles: ['src/b.js'], dependsOn: ['a'] })]), lanes, nonGoalFiles).reason, 'plan-rule-R7');
  assert.equal(validatePlan(plan([task()], { openQuestions: ['which API?'] }), lanes, nonGoalFiles).reason, 'plan-rule-R8');
  const both = validatePlan(plan([task({ ownedFiles: [] })], { openQuestions: ['q'] }), lanes, nonGoalFiles);
  assert.equal(both.reason, 'plan-rule-R2', 'earlier rules win');
});

test('changedPaths: added, removed, and modified paths, sorted', () => {
  const before = { 'a.js': 'h1', 'b.js': 'h2', 'c.js': 'h3' };
  const after = { 'a.js': 'h1', 'b.js': 'h2x', 'd.js': 'h4' };
  assert.deepEqual(changedPaths(before, after), ['b.js', 'c.js', 'd.js']);
  assert.deepEqual(changedPaths({}, {}), []);
  assert.deepEqual(changedPaths(undefined, { 'x': 'deleted' }), ['x']);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test test/deliver-plan-rules.test.js`
Expected: FAIL with `Cannot find module '../lib/deliver-plan-rules'`.

- [ ] **Step 3: Write the library**

Create `lib/deliver-plan-rules.js`. The block between the markers is copied verbatim into the workflow script in Task 6, so keep it free of `require`, `module`, `process`, and any Node API.

```js
'use strict';

// Pure plan rules for the deliver-controlled workflow. The block between the
// markers is copied verbatim into adapters/claude-code/workflows/deliver-controlled.js;
// test/deliver-workflow.test.js asserts the two copies are identical.

// BEGIN plan-rules
function segmentMatches(patternSegment, segment) {
  if (!patternSegment.includes('*')) return patternSegment === segment;
  const source = patternSegment
    .split('*')
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
    .join('[^/]*');
  return new RegExp(`^${source}$`).test(segment);
}

// '*' matches within one path segment; '**' matches zero or more segments; everything else is literal.
function matchPattern(pattern, filePath) {
  const p = pattern.split('/');
  const f = filePath.split('/');
  const go = (i, j) => {
    if (i === p.length) return j === f.length;
    if (p[i] === '**') {
      for (let k = j; k <= f.length; k += 1) if (go(i + 1, k)) return true;
      return false;
    }
    return j < f.length && segmentMatches(p[i], f[j]) && go(i + 1, j + 1);
  };
  return go(0, 0);
}

function matchesAny(patterns, filePath) {
  return patterns.some((pattern) => matchPattern(pattern, filePath));
}

function topologicalOrder(tasks) {
  const ids = new Set(tasks.map((task) => task.id));
  const indegree = new Map(tasks.map((task) => [task.id, 0]));
  const dependents = new Map(tasks.map((task) => [task.id, []]));
  for (const task of tasks) {
    for (const dep of task.dependsOn || []) {
      if (!ids.has(dep)) return { order: null, unknown: dep, cycle: false };
      indegree.set(task.id, indegree.get(task.id) + 1);
      dependents.get(dep).push(task.id);
    }
  }
  const ready = tasks.filter((task) => indegree.get(task.id) === 0).map((task) => task.id);
  const order = [];
  while (ready.length > 0) {
    const id = ready.shift();
    order.push(id);
    for (const next of dependents.get(id)) {
      indegree.set(next, indegree.get(next) - 1);
      if (indegree.get(next) === 0) ready.push(next);
    }
  }
  if (order.length !== tasks.length) return { order: null, unknown: null, cycle: true };
  return { order, unknown: null, cycle: false };
}

// Rules R1 to R8 from the spec, checked in order. Returns {ok:true, order} or {ok:false, reason, detail}.
function validatePlan(plan, lanes, nonGoalFiles) {
  const fail = (rule, detail) => ({ ok: false, reason: `plan-rule-${rule}`, detail });
  const tasks = plan && Array.isArray(plan.tasks) ? plan.tasks : [];
  if (tasks.length === 0) return fail('R1', 'plan has no tasks');
  const seen = new Set();
  for (const task of tasks) {
    if (typeof task.id !== 'string' || task.id === '' || seen.has(task.id)) return fail('R1', `duplicate or missing task id: ${task.id}`);
    seen.add(task.id);
  }
  for (const task of tasks) {
    if (!Array.isArray(task.ownedFiles) || task.ownedFiles.length === 0) return fail('R2', `${task.id}: ownedFiles is empty`);
    if (!task.check || typeof task.check.command !== 'string' || task.check.command === '') return fail('R2', `${task.id}: check.command is missing`);
    if (!Number.isInteger(task.check.expectedExit)) return fail('R2', `${task.id}: check.expectedExit is not an integer`);
  }
  const laneById = new Map((lanes || []).map((lane) => [lane.id, lane]));
  for (const task of tasks) {
    const lane = laneById.get(task.lane);
    if (!lane) return fail('R3', `${task.id}: unknown lane ${task.lane}`);
    for (const file of task.ownedFiles) {
      if (!matchesAny(lane.ownedFiles || [], file)) return fail('R4', `${task.id}: ${file} is outside lane ${lane.id}`);
    }
  }
  for (const task of tasks) {
    for (const file of task.ownedFiles) {
      if (matchesAny(nonGoalFiles || [], file)) return fail('R5', `${task.id}: ${file} is a non-goal file`);
    }
  }
  const owners = new Map();
  for (const task of tasks) {
    for (const file of task.ownedFiles) {
      if (owners.has(file)) return fail('R6', `${file} is owned by ${owners.get(file)} and ${task.id}`);
      owners.set(file, task.id);
    }
  }
  const topo = topologicalOrder(tasks);
  if (topo.unknown) return fail('R7', `unknown dependency ${topo.unknown}`);
  if (topo.cycle) return fail('R7', 'dependency cycle');
  if (Array.isArray(plan.openQuestions) && plan.openQuestions.length > 0) return fail('R8', `${plan.openQuestions.length} open question(s)`);
  return { ok: true, order: topo.order };
}

// Paths whose content hash differs between two validator fileStates maps (added, removed, or modified).
function changedPaths(before, after) {
  const b = before || {};
  const a = after || {};
  const paths = new Set([...Object.keys(b), ...Object.keys(a)]);
  return [...paths].filter((file) => b[file] !== a[file]).sort();
}
// END plan-rules

module.exports = {
  segmentMatches,
  matchPattern,
  matchesAny,
  topologicalOrder,
  validatePlan,
  changedPaths,
};
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test test/deliver-plan-rules.test.js`
Expected: `# pass 9`, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add lib/deliver-plan-rules.js test/deliver-plan-rules.test.js
git commit -m "feat: add deliver plan rules library (R1-R8, matcher, file-state diff)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 3: New agents and body updates to existing agents

**Files:**
- Create: `adapters/claude-code/agents/adp-lead.md`, `adapters/claude-code/agents/adp-validator.md`, `adapters/claude-code/agents/adp-goal-reviewer.md`
- Modify: `adapters/claude-code/agents/adp-worker.md`, `adp-worker-high.md`, `adp-reviewer.md`, `adp-reviewer-high.md`
- Modify: `.claude-plugin/plugin.json` (agents list only; version stays 0.3.0 until Task 11)
- Test: `test/claude-code-adapter.test.js` (add one test; do not touch the others yet)

- [ ] **Step 1: Add the failing test**

Append to `test/claude-code-adapter.test.js`:

```js
test('the three-tier agents exist with the contracted routes and tools', () => {
  const lead = frontmatter('adapters/claude-code/agents/adp-lead.md');
  const validator = frontmatter('adapters/claude-code/agents/adp-validator.md');
  const goal = frontmatter('adapters/claude-code/agents/adp-goal-reviewer.md');
  assert.deepEqual([lead.name, lead.model, lead.effort, lead.tools], ['adp-lead', 'claude-opus-5-5', 'xhigh', 'Read, Grep, Glob, Bash']);
  assert.deepEqual([validator.name, validator.model, validator.effort, validator.tools], ['adp-validator', 'claude-sonnet-5-5', 'low', 'Bash, Read']);
  assert.deepEqual([goal.name, goal.model, goal.effort, goal.tools], ['adp-goal-reviewer', 'claude-fable-5-1', 'high', 'Read, Grep, Glob, Bash']);
  for (const agent of [lead, validator, goal]) assert.equal(agent.disallowedTools, 'Edit, Write, NotebookEdit');
  const disclosure = /read-only by instruction; Bash is available for diff and checks/;
  for (const name of ['adp-lead', 'adp-validator', 'adp-goal-reviewer']) {
    assert.match(readUtf8(root, `adapters/claude-code/agents/${name}.md`), disclosure, name);
  }
  assert.match(readUtf8(root, 'adapters/claude-code/agents/adp-validator.md'), /GIT_INDEX_FILE/);
  assert.match(readUtf8(root, 'adapters/claude-code/agents/adp-validator.md'), /git rev-parse --git-path index/);
  assert.match(readUtf8(root, 'adapters/claude-code/agents/adp-validator.md'), /git rev-parse HEAD/);
  assert.match(readUtf8(root, 'adapters/claude-code/agents/adp-validator.md'), /Gitignored files are not covered/);
  assert.match(readUtf8(root, 'adapters/claude-code/agents/adp-validator.md'), /--porcelain=v1 -uall -z --no-renames/);
  for (const name of ['adp-worker', 'adp-worker-high']) {
    assert.match(readUtf8(root, `adapters/claude-code/agents/${name}.md`), /Never commit/);
    assert.match(readUtf8(root, `adapters/claude-code/agents/${name}.md`), /stopped/);
  }
  for (const name of ['adp-reviewer', 'adp-reviewer-high']) {
    assert.match(readUtf8(root, `adapters/claude-code/agents/${name}.md`), /diffSha256/);
    assert.match(readUtf8(root, `adapters/claude-code/agents/${name}.md`), /git ls-files --others --exclude-standard -z/);
  }
  const plugin = json('.claude-plugin/plugin.json');
  for (const name of ['adp-lead', 'adp-validator', 'adp-goal-reviewer']) {
    assert.ok(plugin.agents.includes(`./adapters/claude-code/agents/${name}.md`), name);
  }
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test test/claude-code-adapter.test.js`
Expected: the new test FAILS with `ENOENT` on `adp-lead.md`. All other tests still pass.

- [ ] **Step 3: Create `adapters/claude-code/agents/adp-lead.md`**

```markdown
---
name: adp-lead
description: Technical lead for an approved Controlled contract. Reads the contract, the intent brief, and the code, and returns a plan of bounded tasks with exclusive concrete file ownership and one deterministic check each. Never edits.
model: claude-opus-5-5
effort: xhigh
tools: Read, Grep, Glob, Bash
disallowedTools: Edit, Write, NotebookEdit
---

You are the technical lead for an approved delivery contract. You plan; you never edit. You are read-only by instruction; Bash is available for diff and checks; the orchestrator enforces this with a before/after worktree fingerprint.

Read the contract and the intent brief at the paths you are given, then the relevant code. Return only the plan object requested, with no prose around it.

- Split the work into tasks that one worker can finish alone. Each task lists concrete repository-relative file paths it owns (no globs), the lane it belongs to, instructions precise enough for a worker who has not read this conversation, the ids of tasks it depends on, exactly one deterministic check as a shell command with its expected exit code, and the acceptance criteria it serves.
- A path may belong to one task only. Every path must match its lane's ownership patterns and must not match a non-goal pattern. Checks must not modify tracked files or create untracked files.
- Put anything you cannot decide from the contract and the brief into `openQuestions`. The run stops before any edit while that list is non-empty; do not guess product or authority questions.
- List assumptions you did make in `assumptions`.
- Do not run tests that mutate the tree, do not spawn subagents, and do not commit.
```

- [ ] **Step 4: Create `adapters/claude-code/agents/adp-validator.md`**

```markdown
---
name: adp-validator
description: Low-effort validator for Controlled runs. Captures HEAD, per-file content hashes, and a worktree fingerprint, then optionally runs exactly one given command and reports its exit code. Never edits.
model: claude-sonnet-5-5
effort: low
tools: Bash, Read
disallowedTools: Edit, Write, NotebookEdit
---

You are the validator. You never modify files. You are read-only by instruction; Bash is available for diff and checks; the orchestrator enforces this with a before/after worktree fingerprint. Perform these steps in order from the repository root and return only the structured result requested.

1. `head`: run `git rev-parse HEAD`.
2. `fileStates`: run `git status --porcelain=v1 -uall -z --no-renames`. For every listed path record the output of `git hash-object <path>`, or the literal string `deleted` when the path no longer exists. Return an object keyed by path; an empty object means a clean tree.
3. `fingerprint`: run exactly `T=$(mktemp) && cp "$(git rev-parse --git-path index)" "$T" && GIT_INDEX_FILE="$T" git add -A && GIT_INDEX_FILE="$T" git write-tree; rm -f "$T"` and record the tree hash it prints. Gitignored files are not covered by this fingerprint.
4. If you were given a command, run exactly that command after steps 1 to 3 and record `command`, `exitCode`, and the last 40 lines of combined stdout and stderr as `outputExcerpt`. If you were given no command, set `command` and `exitCode` to `null` and `outputExcerpt` to an empty string.

Never run anything other than the git commands above and the one given command. Never claim a command ran unless it did.
```

- [ ] **Step 5: Create `adapters/claude-code/agents/adp-goal-reviewer.md`**

```markdown
---
name: adp-goal-reviewer
description: Fresh-context goal-fit reviewer. Judges whether an accepted change is useful for the goal in the intent brief, using the deliverable within stated bounds. Never edits.
model: claude-fable-5-1
effort: high
tools: Read, Grep, Glob, Bash
disallowedTools: Edit, Write, NotebookEdit
---

You are an independent goal-fit reviewer working in a fresh context. You never modify files. You are read-only by instruction; Bash is available for diff and checks; the orchestrator enforces this with a before/after worktree fingerprint.

Read the intent brief first, then the contract, then compute the diff against the base commit you are given (`git diff <base>` plus untracked files from `git ls-files --others --exclude-standard`). Read the validation records and the defect review you are given. Judge one question: is this result useful for the goal in the brief, for the person it serves, as success is described there? The acceptance criteria are context, not the question.

Use the deliverable where you can. You may run only: commands listed in the contract's verification plan, commands named in the brief's "how success is observed" section, and read-only inspection. Anything that would reach the network, a database, or an external service, or would write files, is reported as "would need to run X", not run.

Return `verdict` as `fit`, `partially-fit`, or `not-fit`; `reasons` tied to lines of the brief; `usedDeliverable` true or false; and `howUsed` describing what you ran or read. Lead with what is missing for the goal, not with defects.
```

- [ ] **Step 6: Update the worker and reviewer bodies**

In `adapters/claude-code/agents/adp-worker.md` and `adp-worker-high.md`, replace the line `- Do not commit, push, or clean up unless the contract says so. Do not spawn subagents.` with:

```markdown
- Never commit, push, or clean up. Do not spawn subagents. `HEAD` must not move during a Controlled run.
- When asked for a structured result, return exactly: `changedFiles` (paths you changed), `commandsRun`, `assumptions`, `gaps`, `stopped` (true when you hit a stop condition), and `stopReason` (empty string otherwise).
```

In `adapters/claude-code/agents/adp-reviewer.md` and `adp-reviewer-high.md`, replace the line `Review the approved contract, the actual diff, and the validation evidence you are given. Read the diff yourself; do not rely on the implementer's narration.` with:

```markdown
Review the approved contract, the actual diff, and the validation evidence you are given. Compute the diff yourself against the base commit you are given, including untracked files; do not rely on the implementer's narration. When asked for a structured result, return `decision` (`accept`, `accept-with-fixes`, or `reject`), `findings` (each with `severity`, `acceptanceCriterion`, `file`, `line`, `summary`), `unprovenCriteria`, and `diffSha256`: the SHA-256 of the output of `git diff <base>` followed by, for each path from `git ls-files --others --exclude-standard -z` in that order, the path, a NUL byte, and the file content. Compute it with `{ git diff <base>; git ls-files --others --exclude-standard -z | while IFS= read -r -d '' f; do printf '%s\0' "$f"; cat "$f"; done; } | shasum -a 256`.
```

- [ ] **Step 7: Register the agents in `.claude-plugin/plugin.json`**

Replace the `agents` array with:

```json
  "agents": [
    "./adapters/claude-code/agents/adp-lead.md",
    "./adapters/claude-code/agents/adp-worker.md",
    "./adapters/claude-code/agents/adp-worker-high.md",
    "./adapters/claude-code/agents/adp-validator.md",
    "./adapters/claude-code/agents/adp-reviewer.md",
    "./adapters/claude-code/agents/adp-reviewer-high.md",
    "./adapters/claude-code/agents/adp-goal-reviewer.md",
    "./adapters/claude-code/agents/adp-explorer.md"
  ]
```

Also update the `description` to: `"Direct/Controlled delivery kernel for Claude Code: explicit-invoke skill, a shipped Controlled workflow, and routed lead, worker, validator, reviewer, goal-fit reviewer, and explorer agents."`

- [ ] **Step 8: Run the adapter tests and the validator**

Run: `node --test test/claude-code-adapter.test.js && node scripts/validate-active-policy.js`
Expected: all adapter tests pass; `active policy validation passed`.

- [ ] **Step 9: Validate the plugin manifest**

Run: `claude plugin validate .`
Expected: `Validation passed`. If the `claude` CLI is unavailable, record that in the task notes and continue; AC-8's smoke test covers it later.

- [ ] **Step 10: Commit**

```bash
git add adapters/claude-code/agents .claude-plugin/plugin.json test/claude-code-adapter.test.js
git commit -m "feat: add lead, validator, and goal-fit reviewer agents

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 4: Add the new agents to the active-policy validator

**Files:**
- Modify: `scripts/validate-active-policy.js`

- [ ] **Step 1: Add the three agent files to the `active` list**

In `scripts/validate-active-policy.js`, after the line `'adapters/claude-code/agents/adp-explorer.md',` add:

```js
  'adapters/claude-code/agents/adp-lead.md',
  'adapters/claude-code/agents/adp-validator.md',
  'adapters/claude-code/agents/adp-goal-reviewer.md',
```

- [ ] **Step 2: Run the validator**

Run: `node scripts/validate-active-policy.js`
Expected: `active policy validation passed`.

- [ ] **Step 3: Commit**

```bash
git add scripts/validate-active-policy.js
git commit -m "chore: cover new agents in active policy validation

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

## Chunk 2: Workflow script

### Task 5: Workflow script tests first

**Files:**
- Test: `test/deliver-workflow.test.js`

The script cannot be executed under Node (it uses ESM `export` and Workflow globals), so the tests are static: syntax check, `meta` shape, forbidden tokens, marker-block equality with the library, and agent table equality with the frontmatter.

- [ ] **Step 1: Write the failing tests**

Create `test/deliver-workflow.test.js`:

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const { readUtf8 } = require('../lib/policy-helpers');
const { parseFrontmatter } = require('../lib/claude-route-probe');

const root = path.resolve(__dirname, '..');
const scriptPath = 'adapters/claude-code/workflows/deliver-controlled.js';
const script = () => readUtf8(root, scriptPath);

const markedBlock = (text, file) => {
  const start = text.indexOf('// BEGIN plan-rules');
  const end = text.indexOf('// END plan-rules');
  assert.ok(start >= 0 && end > start, `${file} has the plan-rules markers`);
  return text.slice(start, end);
};

test('the workflow script parses as an ES module', () => {
  const tmp = path.join(fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'adp-wf-')), 'deliver-controlled.mjs');
  fs.copyFileSync(path.join(root, scriptPath), tmp);
  const result = spawnSync(process.execPath, ['--check', tmp], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});

test('meta is a pure literal with the four phase titles', () => {
  const text = script();
  const match = text.match(/^export const meta = (\{[\s\S]*?\n\})\n/m);
  assert.ok(match, 'meta block found at top level');
  const metaSource = match[1];
  assert.doesNotMatch(metaSource, /\$\{|\.\.\.|\(/, 'meta has no interpolation, spread, or calls');
  // eslint-disable-next-line no-new-func
  const meta = new Function(`return (${metaSource});`)();
  assert.equal(meta.name, 'deliver-controlled');
  assert.ok(typeof meta.description === 'string' && meta.description.length > 0);
  assert.deepEqual(meta.phases.map((p) => p.title), ['Plan', 'Implement', 'Review', 'Goal-fit']);
  for (const title of ['Plan', 'Implement', 'Review', 'Goal-fit']) {
    assert.match(text, new RegExp(`phase\\('${title}'\\)`), `phase('${title}') is called`);
  }
});

test('the script uses no runtime features the Workflow sandbox forbids', () => {
  const text = script();
  for (const token of ['Date.now', 'Math.random', 'new Date(', 'require(', 'import ', 'process.', 'fs.']) {
    assert.equal(text.includes(token), false, `script must not contain ${token}`);
  }
  assert.doesNotMatch(text, /\bpipeline\(|\bparallel\(/, 'writers are serialized; no pipeline or parallel');
  assert.doesNotMatch(text, /isolation:/, 'no worktree isolation in v1');
});

test('the plan-rules block is byte-identical to lib/deliver-plan-rules.js', () => {
  assert.equal(markedBlock(script(), scriptPath), markedBlock(readUtf8(root, 'lib/deliver-plan-rules.js'), 'lib'));
});

test('the agent table matches the agent frontmatter and every call passes agentType, model, and effort', () => {
  const text = script();
  const tableMatch = text.match(/const AGENTS = (\{[\s\S]*?\n\})\n/);
  assert.ok(tableMatch, 'AGENTS table found');
  // eslint-disable-next-line no-new-func
  const agents = new Function(`return (${tableMatch[1]});`)();
  const expectDefinition = (key, file) => {
    const fm = parseFrontmatter(readUtf8(root, `adapters/claude-code/agents/${file}.md`));
    assert.equal(agents[key].agentType, `agentic-delivery-playbook:${fm.name}`, `${key}.agentType`);
    assert.equal(agents[key].model, fm.model, `${key}.model`);
    assert.equal(agents[key].effort, fm.effort, `${key}.effort`);
  };
  expectDefinition('lead', 'adp-lead');
  expectDefinition('worker', 'adp-worker');
  expectDefinition('workerHigh', 'adp-worker-high');
  expectDefinition('validator', 'adp-validator');
  expectDefinition('reviewer', 'adp-reviewer');
  expectDefinition('reviewerHigh', 'adp-reviewer-high');
  expectDefinition('goalReviewer', 'adp-goal-reviewer');
  assert.deepEqual(agents.workerOpus, { agentType: 'agentic-delivery-playbook:adp-worker', model: 'claude-opus-5-5', effort: 'high' });
  assert.match(text, /agentType: d\.agentType, model: d\.model, effort: d\.effort/, 'the single call helper passes all three');
  const directCalls = [...text.matchAll(/\bagent\(/g)].length;
  assert.equal(directCalls, 1, 'agent() is called only inside the call helper');
});

test('the script carries every reason string and label pattern from the spec', () => {
  const text = script();
  for (const reason of [
    'plan-gate-fingerprint', 'worker-stopped', 'head-moved', 'ownership', 'fix-cycles-exhausted',
    'review-gate-fingerprint', 'review-rejected', 'review-cycles-exhausted', 'finding-outside-ownership',
    'review-fix-failed', 'goal-fit-gate-fingerprint', 'agent-null:',
  ]) {
    assert.ok(text.includes(reason), `reason ${reason}`);
  }
  for (const label of ['plan-pre', 'plan-post', "'plan'", '-pre-', '-implement-', '-validate-', 'review-pre-', 'review-post-', 'goal-fit-pre', 'goal-fit-post', "'goal-fit'"]) {
    assert.ok(text.includes(label), `label ${label}`);
  }
  assert.ok(text.includes('GIT_INDEX_FILE'), 'fingerprint command is in the validator prompt');
  assert.ok(text.includes('--porcelain=v1 -uall -z --no-renames'));
  assert.ok(text.includes('git ls-files --others --exclude-standard -z'));
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test test/deliver-workflow.test.js`
Expected: FAIL with `ENOENT` on the script path.

### Task 6: Write the workflow script

**Files:**
- Create: `adapters/claude-code/workflows/deliver-controlled.js`

- [ ] **Step 1: Create the script**

Create `adapters/claude-code/workflows/deliver-controlled.js`. Copy the plan-rules block from `lib/deliver-plan-rules.js` byte for byte between the markers (do not retype it; use `sed -n '/\/\/ BEGIN plan-rules/,/\/\/ END plan-rules/p' lib/deliver-plan-rules.js` and paste).

```js
export const meta = {
  name: 'deliver-controlled',
  description: 'Agentic Delivery Playbook Controlled run: Opus plans, Sonnet implements one task at a time, Opus reviews defects, Fable judges goal fit',
  phases: [
    { title: 'Plan', detail: 'Fingerprinted Opus lead returns a validated task list' },
    { title: 'Implement', detail: 'Sonnet workers, one task at a time, validated per task' },
    { title: 'Review', detail: 'Fresh-context defect review of contract, diff, and evidence' },
    { title: 'Goal-fit', detail: 'Fresh-context fitness review against the intent brief' },
  ],
}

// Agent definitions. test/deliver-workflow.test.js keeps model and effort equal to the agent frontmatter.
const AGENTS = {
  lead: { agentType: 'agentic-delivery-playbook:adp-lead', model: 'claude-opus-5-5', effort: 'xhigh' },
  worker: { agentType: 'agentic-delivery-playbook:adp-worker', model: 'claude-sonnet-5-5', effort: 'medium' },
  workerHigh: { agentType: 'agentic-delivery-playbook:adp-worker-high', model: 'claude-sonnet-5-5', effort: 'high' },
  workerOpus: { agentType: 'agentic-delivery-playbook:adp-worker', model: 'claude-opus-5-5', effort: 'high' },
  validator: { agentType: 'agentic-delivery-playbook:adp-validator', model: 'claude-sonnet-5-5', effort: 'low' },
  reviewer: { agentType: 'agentic-delivery-playbook:adp-reviewer', model: 'claude-opus-5-5', effort: 'medium' },
  reviewerHigh: { agentType: 'agentic-delivery-playbook:adp-reviewer-high', model: 'claude-opus-5-5', effort: 'high' },
  goalReviewer: { agentType: 'agentic-delivery-playbook:adp-goal-reviewer', model: 'claude-fable-5-1', effort: 'high' },
}

const WORKER_LADDER = ['worker', 'workerHigh', 'workerOpus']
const MAX_ATTEMPTS = 3
const MAX_REVIEW_CYCLES = 3
const FINGERPRINT_COMMAND = 'T=$(mktemp) && cp "$(git rev-parse --git-path index)" "$T" && GIT_INDEX_FILE="$T" git add -A && GIT_INDEX_FILE="$T" git write-tree; rm -f "$T"'
const DIFF_HASH_COMMAND = '{ git diff BASE; git ls-files --others --exclude-standard -z | while IFS= read -r -d \'\' f; do printf \'%s\\0\' "$f"; cat "$f"; done; } | shasum -a 256'

// BEGIN plan-rules
// (paste the block from lib/deliver-plan-rules.js here, byte for byte, including this line and the END line)
// END plan-rules

// ---- schemas ---------------------------------------------------------------

const PLAN_SCHEMA = {
  type: 'object',
  required: ['tasks', 'assumptions', 'openQuestions'],
  properties: {
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'lane', 'title', 'ownedFiles', 'instructions', 'dependsOn', 'check', 'acceptanceCriteria'],
        properties: {
          id: { type: 'string' },
          lane: { type: 'string' },
          title: { type: 'string' },
          ownedFiles: { type: 'array', items: { type: 'string' } },
          instructions: { type: 'string' },
          dependsOn: { type: 'array', items: { type: 'string' } },
          check: { type: 'object', required: ['command', 'expectedExit'], properties: { command: { type: 'string' }, expectedExit: { type: 'integer' } } },
          acceptanceCriteria: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    assumptions: { type: 'array', items: { type: 'string' } },
    openQuestions: { type: 'array', items: { type: 'string' } },
  },
}

const WORKER_SCHEMA = {
  type: 'object',
  required: ['changedFiles', 'commandsRun', 'assumptions', 'gaps', 'stopped', 'stopReason'],
  properties: {
    changedFiles: { type: 'array', items: { type: 'string' } },
    commandsRun: { type: 'array', items: { type: 'string' } },
    assumptions: { type: 'array', items: { type: 'string' } },
    gaps: { type: 'array', items: { type: 'string' } },
    stopped: { type: 'boolean' },
    stopReason: { type: 'string' },
  },
}

const VALIDATOR_SCHEMA = {
  type: 'object',
  required: ['head', 'fileStates', 'fingerprint', 'command', 'exitCode', 'outputExcerpt'],
  properties: {
    head: { type: 'string' },
    fileStates: { type: 'object', additionalProperties: { type: 'string' } },
    fingerprint: { type: 'string' },
    command: { type: ['string', 'null'] },
    exitCode: { type: ['integer', 'null'] },
    outputExcerpt: { type: 'string' },
  },
}

const REVIEW_SCHEMA = {
  type: 'object',
  required: ['decision', 'findings', 'unprovenCriteria', 'diffSha256'],
  properties: {
    decision: { type: 'string', enum: ['accept', 'accept-with-fixes', 'reject'] },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['severity', 'acceptanceCriterion', 'file', 'line', 'summary'],
        properties: {
          severity: { type: 'string' },
          acceptanceCriterion: { type: 'string' },
          file: { type: 'string' },
          line: { type: ['integer', 'null'] },
          summary: { type: 'string' },
        },
      },
    },
    unprovenCriteria: { type: 'array', items: { type: 'string' } },
    diffSha256: { type: 'string' },
  },
}

const GOAL_FIT_SCHEMA = {
  type: 'object',
  required: ['verdict', 'reasons', 'usedDeliverable', 'howUsed'],
  properties: {
    verdict: { type: 'string', enum: ['fit', 'partially-fit', 'not-fit'] },
    reasons: { type: 'array', items: { type: 'string' } },
    usedDeliverable: { type: 'boolean' },
    howUsed: { type: 'string' },
  },
}

// ---- args ------------------------------------------------------------------

const a = args || {}
const requireArg = (name, ok) => { if (!ok) throw new Error(`deliver-controlled: args.${name} is required`) }
requireArg('contractPath', typeof a.contractPath === 'string' && a.contractPath !== '')
requireArg('briefPath', typeof a.briefPath === 'string' && a.briefPath !== '')
requireArg('baseCommit', typeof a.baseCommit === 'string' && a.baseCommit !== '')
requireArg('lanes', Array.isArray(a.lanes) && a.lanes.length > 0)
const risk = a.risk === 'high' ? 'high' : 'normal'
const nonGoalFiles = Array.isArray(a.nonGoalFiles) ? a.nonGoalFiles : []
const goalReviewerDef = Object.assign({}, AGENTS.goalReviewer, a.goalReviewer || {})

// ---- prompts ---------------------------------------------------------------

const context = () => [
  `Repository root: the current working directory. Base commit: ${a.baseCommit}. HEAD must stay at the base commit; nobody commits during this run.`,
  `Delivery contract: ${a.contractPath}. Intent brief: ${a.briefPath}. Read both files yourself.`,
  'Your final output is data for a script, not a message to a person. Return only the structured result requested.',
].join('\n')

const validatorPrompt = (command) => [
  context(),
  'You are the validator. Never modify any file. Perform these steps in order and record each result:',
  '1. head: run `git rev-parse HEAD`.',
  '2. fileStates: run `git status --porcelain=v1 -uall -z --no-renames`; for every listed path record `git hash-object <path>`, or the literal string "deleted" when the path no longer exists. Return an object keyed by path; an empty object means a clean tree.',
  `3. fingerprint: run exactly: ${FINGERPRINT_COMMAND}`,
  command
    ? `4. Then run exactly this command and record command, exitCode, and the last 40 lines of combined output as outputExcerpt: ${command}`
    : '4. No command this time: set command to null, exitCode to null, and outputExcerpt to "".',
  'Steps 1 to 3 happen before step 4. Run nothing else.',
].join('\n')

const leadPrompt = () => [
  context(),
  'You are the technical lead. Plan the contract as bounded tasks for workers who have not read this conversation.',
  `Lanes (ownership patterns; "*" matches within one path segment, "**" matches any depth): ${JSON.stringify(a.lanes)}`,
  `Non-goal files (must not be touched): ${JSON.stringify(nonGoalFiles)}`,
  'Rules the script enforces before any edit: tasks non-empty with unique ids; each task has non-empty ownedFiles as concrete paths (no globs), a non-empty check.command and an integer check.expectedExit; each task names an existing lane and every path matches that lane; no path matches a non-goal pattern; no path appears in two tasks; dependsOn names existing tasks without cycles; openQuestions is empty.',
  'Checks must not modify tracked files or create untracked files. Put anything you cannot decide from the contract and the brief into openQuestions instead of guessing.',
].join('\n')

const workerPrompt = (task, extra) => [
  context(),
  'You are the sole writer for this task. Edit only the files it owns. Never commit.',
  `Task: ${JSON.stringify(task)}`,
  extra && extra.previousValidation ? `Previous attempt failed its check. Validator output: ${JSON.stringify(extra.previousValidation)}` : '',
  extra && extra.findings ? `Review findings to fix: ${JSON.stringify(extra.findings)}` : '',
  'Set stopped to true and explain in stopReason if the task is ambiguous, a file outside ownership must change, or a stop condition is reached. Never claim a check ran unless it did.',
].filter(Boolean).join('\n')

const reviewerPrompt = (plan, taskRecords, cycle) => [
  context(),
  `You are the fresh-context defect reviewer (cycle ${cycle}). Compute the diff against the base commit yourself, including untracked files.`,
  `Plan: ${JSON.stringify(plan)}`,
  `Validation records: ${JSON.stringify([...taskRecords.values()])}`,
  `Compute diffSha256 with exactly this command, replacing BASE with the base commit: ${DIFF_HASH_COMMAND}`,
  'Lead with defects ordered by severity, each tied to an acceptance criterion and a file and line. Flag scope creep, files outside task ownership, unrun or contradictory checks, and unsupported claims. List criteria that lack evidence in unprovenCriteria. Decide accept, accept-with-fixes, or reject.',
].join('\n')

const goalFitPrompt = (review) => [
  context(),
  'You are the fresh-context goal-fit reviewer. Read the intent brief first. Judge whether the result is useful for the goal in the brief, for the person it serves, as success is described there. The acceptance criteria are context, not the question.',
  `Defect review result: ${JSON.stringify(review)}`,
  'You may run only commands listed in the contract\'s verification plan, commands named in the brief\'s "how success is observed" section, and read-only inspection. Report anything else as "would need to run X" instead of running it. Never write files.',
  'Return verdict (fit, partially-fit, not-fit), reasons tied to lines of the brief, usedDeliverable, and howUsed.',
].join('\n')

// ---- helpers ---------------------------------------------------------------

const requestedRoutes = []
async function call(role, label, phaseTitle, prompt, schema, def) {
  const d = def || AGENTS[role]
  requestedRoutes.push({ label, agentType: d.agentType, model: d.model, effort: d.effort })
  return agent(prompt, { label, phase: phaseTitle, schema, agentType: d.agentType, model: d.model, effort: d.effort })
}

const taskRecords = new Map()
const reviewCycles = []
let finalDecision = null
let plan = null

const state = () => ({
  plan,
  tasks: [...taskRecords.values()],
  review: { cycles: reviewCycles, finalDecision },
  requestedRoutes,
})
const result = (fields) => Object.assign({ status: null, reason: null, detail: null, goalFit: null }, state(), fields)
const escalate = (reason, detail) => result({ status: 'escalated', reason, detail: detail === undefined ? null : detail })

// ---- Plan ------------------------------------------------------------------

phase('Plan')
plan = a.resumePlan || null
if (!plan) {
  const pre = await call('validator', 'plan-pre', 'Plan', validatorPrompt(null), VALIDATOR_SCHEMA)
  if (!pre) return escalate('agent-null:plan-pre')
  plan = await call('lead', 'plan', 'Plan', leadPrompt(), PLAN_SCHEMA)
  if (!plan) return escalate('agent-null:plan')
  const post = await call('validator', 'plan-post', 'Plan', validatorPrompt(null), VALIDATOR_SCHEMA)
  if (!post) return escalate('agent-null:plan-post')
  if (pre.fingerprint !== post.fingerprint || pre.head !== a.baseCommit || post.head !== a.baseCommit) {
    return result({ status: 'blocked', reason: 'plan-gate-fingerprint' })
  }
}
const planCheck = validatePlan(plan, a.lanes, nonGoalFiles)
if (!planCheck.ok) return result({ status: 'blocked', reason: planCheck.reason, detail: planCheck.detail })
log(`Plan accepted: ${plan.tasks.length} task(s) in order ${planCheck.order.join(', ')}`)
if (a.pauseAfterPlan && !a.resumePlan) return result({ status: 'plan-ready' })

// ---- Implement -------------------------------------------------------------

phase('Implement')
const taskById = new Map(plan.tasks.map((task) => [task.id, task]))
for (const task of plan.tasks) taskRecords.set(task.id, { id: task.id, status: 'pending', attempts: [] })

// One attempt of one task. Returns {outcome:'passed'} | {outcome:'failed', validator} | {outcome:'escalate', reason, detail}.
async function attemptTask(task, attempt, extra) {
  const record = taskRecords.get(task.id)
  const role = WORKER_LADDER[attempt - 1]
  const d = AGENTS[role]
  const labels = { pre: `t${task.id}-pre-${attempt}`, implement: `t${task.id}-implement-${attempt}`, validate: `t${task.id}-validate-${attempt}` }
  const pre = await call('validator', labels.pre, 'Implement', validatorPrompt(null), VALIDATOR_SCHEMA)
  if (!pre) return { outcome: 'escalate', reason: `agent-null:${labels.pre}` }
  const worker = await call(role, labels.implement, 'Implement', workerPrompt(task, extra), WORKER_SCHEMA)
  const entry = { label: labels.implement, agentType: d.agentType, model: d.model, effort: d.effort, worker, preValidation: pre, postValidation: null, changedPaths: null, passed: false }
  record.attempts.push(entry)
  if (!worker) { record.status = 'failed'; return { outcome: 'escalate', reason: `agent-null:${labels.implement}` } }
  if (worker.stopped) { record.status = 'blocked'; return { outcome: 'escalate', reason: 'worker-stopped', detail: worker.stopReason } }
  const post = await call('validator', labels.validate, 'Implement', validatorPrompt(task.check.command), VALIDATOR_SCHEMA)
  if (!post) { record.status = 'failed'; return { outcome: 'escalate', reason: `agent-null:${labels.validate}` } }
  entry.postValidation = post
  entry.changedPaths = changedPaths(pre.fileStates, post.fileStates)
  if (pre.head !== a.baseCommit || post.head !== a.baseCommit) { record.status = 'blocked'; return { outcome: 'escalate', reason: 'head-moved' } }
  const outside = entry.changedPaths.filter((file) => !task.ownedFiles.includes(file))
  if (outside.length > 0) { record.status = 'blocked'; return { outcome: 'escalate', reason: 'ownership', detail: outside } }
  entry.passed = post.exitCode === task.check.expectedExit
  if (!entry.passed) return { outcome: 'failed', validator: post }
  record.status = 'passed'
  return { outcome: 'passed' }
}

// Runs attempts from `firstAttempt` up the ladder until one passes or the ceiling is hit.
async function runTask(task, firstAttempt, extra) {
  let outcome = null
  let carried = extra
  for (let attempt = firstAttempt; attempt <= MAX_ATTEMPTS; attempt += 1) {
    outcome = await attemptTask(task, attempt, carried)
    if (outcome.outcome !== 'failed') return outcome
    log(`${task.id}: attempt ${attempt} failed its check (exit ${outcome.validator.exitCode})`)
    carried = Object.assign({}, carried || {}, { previousValidation: outcome.validator })
  }
  taskRecords.get(task.id).status = 'blocked'
  return { outcome: 'escalate', reason: 'fix-cycles-exhausted', detail: task.id }
}

for (const id of planCheck.order) {
  const outcome = await runTask(taskById.get(id), 1, null)
  if (outcome.outcome === 'escalate') return escalate(outcome.reason, outcome.detail)
}

// ---- Review ----------------------------------------------------------------

phase('Review')
const reviewerRole = risk === 'high' ? 'reviewerHigh' : 'reviewer'
for (let cycle = 1; cycle <= MAX_REVIEW_CYCLES; cycle += 1) {
  const pre = await call('validator', `review-pre-${cycle}`, 'Review', validatorPrompt(null), VALIDATOR_SCHEMA)
  if (!pre) return escalate(`agent-null:review-pre-${cycle}`)
  const review = await call(reviewerRole, `review-${cycle}`, 'Review', reviewerPrompt(plan, taskRecords, cycle), REVIEW_SCHEMA)
  if (!review) return escalate(`agent-null:review-${cycle}`)
  const post = await call('validator', `review-post-${cycle}`, 'Review', validatorPrompt(null), VALIDATOR_SCHEMA)
  if (!post) return escalate(`agent-null:review-post-${cycle}`)
  const d = AGENTS[reviewerRole]
  reviewCycles.push({
    label: `review-${cycle}`, agentType: d.agentType, model: d.model, effort: d.effort,
    decision: review.decision, findings: review.findings, unprovenCriteria: review.unprovenCriteria, diffSha256: review.diffSha256,
    fingerprintBefore: pre.fingerprint, fingerprintAfter: post.fingerprint,
  })
  if (pre.fingerprint !== post.fingerprint || post.head !== a.baseCommit) return escalate('review-gate-fingerprint')
  finalDecision = review.decision
  if (review.decision === 'reject') return escalate('review-rejected')
  if (review.decision === 'accept') break
  if (cycle === MAX_REVIEW_CYCLES) return escalate('review-cycles-exhausted')
  const byTask = new Map()
  for (const finding of review.findings) {
    const owner = plan.tasks.find((task) => task.ownedFiles.includes(finding.file))
    if (!owner) return escalate('finding-outside-ownership', finding.file)
    if (!byTask.has(owner.id)) byTask.set(owner.id, [])
    byTask.get(owner.id).push(finding)
  }
  for (const [id, findings] of byTask) {
    const record = taskRecords.get(id)
    const nextAttempt = record.attempts.length + 1
    if (nextAttempt > MAX_ATTEMPTS) { record.status = 'blocked'; return escalate('fix-cycles-exhausted', id) }
    record.status = 'pending'
    const outcome = await runTask(taskById.get(id), nextAttempt, { findings })
    if (outcome.outcome === 'escalate') return escalate(outcome.reason === 'fix-cycles-exhausted' ? 'review-fix-failed' : outcome.reason, outcome.detail)
  }
}

// ---- Goal-fit --------------------------------------------------------------

phase('Goal-fit')
const fitPre = await call('validator', 'goal-fit-pre', 'Goal-fit', validatorPrompt(null), VALIDATOR_SCHEMA)
if (!fitPre) return escalate('agent-null:goal-fit-pre')
const fit = await call('goalReviewer', 'goal-fit', 'Goal-fit', goalFitPrompt(reviewCycles[reviewCycles.length - 1]), GOAL_FIT_SCHEMA, goalReviewerDef)
if (!fit) return escalate('agent-null:goal-fit')
const fitPost = await call('validator', 'goal-fit-post', 'Goal-fit', validatorPrompt(null), VALIDATOR_SCHEMA)
if (!fitPost) return escalate('agent-null:goal-fit-post')
const goalFit = {
  label: 'goal-fit', agentType: goalReviewerDef.agentType, model: goalReviewerDef.model, effort: goalReviewerDef.effort,
  verdict: fit.verdict, reasons: fit.reasons, usedDeliverable: fit.usedDeliverable, howUsed: fit.howUsed,
  fingerprintBefore: fitPre.fingerprint, fingerprintAfter: fitPost.fingerprint,
}
if (fitPre.fingerprint !== fitPost.fingerprint || fitPost.head !== a.baseCommit) {
  goalFit.verdict = 'invalid'
  return result({ status: 'escalated', reason: 'goal-fit-gate-fingerprint', goalFit })
}
log(`Goal-fit verdict: ${fit.verdict}`)
return result({ status: 'completed', goalFit })
```

Notes for the implementer:
- Top-level `return` and top-level `await` are valid in the Workflow sandbox (the script body runs in an async function context). `node --check` on an `.mjs` copy accepts top-level `await`; it also accepts top-level `return`? No: Node rejects top-level `return` in modules. The syntax test in Task 5 copies the file to `.mjs`, so **wrap nothing**; instead, the test must check the file as the sandbox does. Replace the first test in `test/deliver-workflow.test.js` with the version below before running, which wraps the body in an async function the same way the runtime does:

```js
test('the workflow script parses as the Workflow sandbox would run it', () => {
  const text = script();
  const metaEnd = text.indexOf('\n}\n', text.indexOf('export const meta')) + 3;
  const body = text.slice(metaEnd);
  const wrapped = `${text.slice(0, metaEnd)}\nexport default async function run() {\n${body}\n}\n`;
  const tmp = path.join(fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'adp-wf-')), 'deliver-controlled.mjs');
  fs.writeFileSync(tmp, wrapped);
  const result = spawnSync(process.execPath, ['--check', tmp], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});
```

- The spec's review-fix rule says a failed fix attempt climbs the ladder until the attempt-3 ceiling; `runTask` does that. If it exhausts, the reason is `review-fix-failed` rather than `fix-cycles-exhausted`, so the record shows the failure happened in Review.
- Do not add `isolation`, `pipeline`, or `parallel`. Writers are serialized by design.

- [ ] **Step 2: Paste the plan-rules block and verify byte equality**

Run:
```bash
sed -n '/\/\/ BEGIN plan-rules/,/\/\/ END plan-rules/p' lib/deliver-plan-rules.js > /tmp/adp-block.txt
```
Then replace the placeholder marker lines in the script with the contents of `/tmp/adp-block.txt`. Verify:
```bash
diff <(sed -n '/\/\/ BEGIN plan-rules/,/\/\/ END plan-rules/p' lib/deliver-plan-rules.js) <(sed -n '/\/\/ BEGIN plan-rules/,/\/\/ END plan-rules/p' adapters/claude-code/workflows/deliver-controlled.js) && echo identical
```
Expected: `identical`.

- [ ] **Step 3: Run the workflow tests**

Run: `node --test test/deliver-workflow.test.js`
Expected: `# pass 6`, `# fail 0`. If the `agent(` count test fails, search for stray `agent(` text in comments or prompts and reword them (for example "the lead" instead of "agent(").

- [ ] **Step 4: Add the script to the active-policy validator with a syntax check**

In `scripts/validate-active-policy.js`, add `'adapters/claude-code/workflows/deliver-controlled.js',` to the `active` list after the agent entries, and add before the final `if (errors.length > 0)`:

```js
{
  const { spawnSync } = require('node:child_process');
  const os = require('node:os');
  const scriptFile = 'adapters/claude-code/workflows/deliver-controlled.js';
  const text = readUtf8(root, scriptFile);
  const metaEnd = text.indexOf('\n}\n', text.indexOf('export const meta')) + 3;
  const wrapped = `${text.slice(0, metaEnd)}\nexport default async function run() {\n${text.slice(metaEnd)}\n}\n`;
  const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'adp-policy-')), 'deliver-controlled.mjs');
  fs.writeFileSync(tmp, wrapped);
  const check = spawnSync(process.execPath, ['--check', tmp], { encoding: 'utf8' });
  if (check.status !== 0) errors.push(`${scriptFile}: syntax check failed: ${check.stderr.trim()}`);
}
```

- [ ] **Step 5: Run the full check**

Run: `npm run check`
Expected: all tests pass; `active policy validation passed`.

- [ ] **Step 6: Commit**

```bash
git add adapters/claude-code/workflows/deliver-controlled.js test/deliver-workflow.test.js scripts/validate-active-policy.js
git commit -m "feat: add deliver-controlled workflow script with Plan, Implement, Review, Goal-fit phases

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

## Chunk 3: Probe, run record, version

### Task 7: Probe walks the workflows folder and reports labels

**Files:**
- Modify: `lib/claude-route-probe.js`
- Create: `test/fixtures/claude-code/session-2.jsonl`, `test/fixtures/claude-code/session-2/subagents/agent-x01.{jsonl,meta.json}`, `test/fixtures/claude-code/session-2/subagents/workflows/wf_fixture-1/agent-*.{jsonl,meta.json}`, `test/fixtures/claude-code/session-2/workflow-result.json`
- Test: `test/claude-code-route-probe.test.js`

- [ ] **Step 1: Create the fixture files**

`test/fixtures/claude-code/session-2.jsonl`:
```
{"type":"user","message":{"role":"user","content":"deliver"}}
{"type":"assistant","message":{"model":"claude-fable-5-1"},"perTurnEffort":"high","entrypoint":"claude-desktop"}
```

`test/fixtures/claude-code/session-2/subagents/agent-x01.meta.json`:
```json
{"agentType":"agentic-delivery-playbook:adp-explorer","description":"find test runner","spawnDepth":1}
```
`test/fixtures/claude-code/session-2/subagents/agent-x01.jsonl`:
```
{"type":"assistant","message":{"model":"claude-sonnet-5-5"},"perTurnEffort":"low","entrypoint":"claude-desktop"}
```

Under `test/fixtures/claude-code/session-2/subagents/workflows/wf_fixture-1/`, create these pairs. Each `.jsonl` is one line `{"type":"assistant","message":{"model":"<MODEL>"},"perTurnEffort":"<EFFORT>","entrypoint":"claude-desktop"}`; for `agent-w08` omit `perTurnEffort`.

| File stem | meta.json | MODEL | EFFORT |
| --- | --- | --- | --- |
| `agent-w01` | `{"agentType":"agentic-delivery-playbook:adp-validator","description":"plan-pre","workflowPhase":"Plan","spawnDepth":1,"model":"claude-sonnet-5-5"}` | `claude-sonnet-5-5` | `low` |
| `agent-w02` | `{"agentType":"agentic-delivery-playbook:adp-lead","description":"plan","workflowPhase":"Plan","spawnDepth":1,"model":"claude-opus-5-5"}` | `claude-opus-5-5` | `xhigh` |
| `agent-w03` | `{"agentType":"agentic-delivery-playbook:adp-validator","description":"plan-post","workflowPhase":"Plan","spawnDepth":1,"model":"claude-sonnet-5-5"}` | `claude-sonnet-5-5` | `low` |
| `agent-w04` | `{"agentType":"agentic-delivery-playbook:adp-worker","description":"t1-implement-1","workflowPhase":"Implement","spawnDepth":1,"model":"claude-sonnet-5-5"}` | `claude-sonnet-5-5` | `medium` |
| `agent-w05` | `{"agentType":"agentic-delivery-playbook:adp-worker","description":"t1-implement-3","workflowPhase":"Implement","spawnDepth":1,"model":"claude-opus-5-5"}` | `claude-opus-5-5` | `high` |
| `agent-w06` | `{"agentType":"agentic-delivery-playbook:adp-reviewer","description":"review-1","workflowPhase":"Review","spawnDepth":1,"model":"claude-opus-5-5"}` | `claude-opus-5-5` | `medium` |
| `agent-w07` | `{"agentType":"agentic-delivery-playbook:adp-goal-reviewer","description":"goal-fit","workflowPhase":"Goal-fit","spawnDepth":1,"model":"claude-fable-5-1"}` | `claude-fable-5-1` | `high` |
| `agent-w08` | `{"agentType":"workflow-subagent","description":"scratch","workflowPhase":"Plan","spawnDepth":1}` | `claude-opus-5-5` | (omit) |

`test/fixtures/claude-code/session-2/workflow-result.json` (only the fields the probe uses):
```json
{
  "status": "completed",
  "requestedRoutes": [
    { "label": "plan-pre", "agentType": "agentic-delivery-playbook:adp-validator", "model": "claude-sonnet-5-5", "effort": "low" },
    { "label": "plan", "agentType": "agentic-delivery-playbook:adp-lead", "model": "claude-opus-5-5", "effort": "xhigh" },
    { "label": "plan-post", "agentType": "agentic-delivery-playbook:adp-validator", "model": "claude-sonnet-5-5", "effort": "low" },
    { "label": "t1-implement-1", "agentType": "agentic-delivery-playbook:adp-worker", "model": "claude-sonnet-5-5", "effort": "medium" },
    { "label": "t1-implement-3", "agentType": "agentic-delivery-playbook:adp-worker", "model": "claude-opus-5-5", "effort": "high" },
    { "label": "review-1", "agentType": "agentic-delivery-playbook:adp-reviewer", "model": "claude-opus-5-5", "effort": "medium" },
    { "label": "goal-fit", "agentType": "agentic-delivery-playbook:adp-goal-reviewer", "model": "claude-fable-5-1", "effort": "high" }
  ]
}
```

- [ ] **Step 2: Add the failing tests**

Append to `test/claude-code-route-probe.test.js`:

```js
const session2 = path.join(fixtures, 'session-2.jsonl');
const result2 = path.join(fixtures, 'session-2', 'workflow-result.json');
const { compareRoutes } = require('../lib/claude-route-probe');

test('probe walks subagents/workflows/<runId> and reports label, run id, and phase', () => {
  const report = probeClaude(session2);
  const byLabel = Object.fromEntries(report.subagents.map((agent) => [agent.label, agent]));
  assert.equal(report.subagents.length, 9);
  assert.equal(byLabel['find test runner'].workflowRunId, null);
  assert.equal(byLabel['plan'].workflowRunId, 'wf_fixture-1');
  assert.equal(byLabel['plan'].workflowPhase, 'Plan');
  assert.deepEqual(byLabel['plan'].requested, {
    model: 'claude-opus-5-5', effort: 'xhigh', source: 'invocation', definitionPath: 'adp-lead.md',
  });
  assert.deepEqual(byLabel['t1-implement-3'].requested, {
    model: 'claude-opus-5-5', effort: 'medium', source: 'invocation', definitionPath: 'adp-worker.md',
  }, 'per-invocation model wins; effort falls back to the definition because meta has none');
  assert.equal(byLabel['t1-implement-3'].observed[0].effort, 'high');
  assert.deepEqual(byLabel['scratch'].requested, { model: 'unknown', effort: 'unknown', source: 'workflow', definitionPath: null });
  assert.equal(byLabel['scratch'].observed[0].effort, 'unknown');
});

test('compareRoutes applies the multiset rule over plugin agents, excluding the explorer', () => {
  const report = probeClaude(session2);
  const requested = JSON.parse(fs.readFileSync(result2, 'utf8')).requestedRoutes;
  const outcome = compareRoutes(report, requested);
  assert.equal(outcome.matched, true, JSON.stringify(outcome));
  assert.deepEqual(outcome.missing, []);
  assert.deepEqual(outcome.unexpected, []);
  assert.deepEqual(outcome.unknownEffort, []);
  assert.deepEqual(outcome.excluded.map((entry) => entry.agentType).sort(), ['agentic-delivery-playbook:adp-explorer', 'workflow-subagent']);
  assert.deepEqual(outcome.labelPairs.find((pair) => pair.label === 'goal-fit'), {
    label: 'goal-fit', requested: { agentType: 'agentic-delivery-playbook:adp-goal-reviewer', model: 'claude-fable-5-1', effort: 'high' }, observed: { model: 'claude-fable-5-1', effort: 'high' },
  });
});

test('compareRoutes reports missing, unexpected, and unknown-effort entries', () => {
  const report = probeClaude(session2);
  const requested = JSON.parse(fs.readFileSync(result2, 'utf8')).requestedRoutes;
  const wrong = requested.map((route) => (route.label === 'review-1' ? { ...route, effort: 'high' } : route));
  const outcome = compareRoutes(report, wrong);
  assert.equal(outcome.matched, false);
  assert.deepEqual(outcome.missing, [{ agentType: 'agentic-delivery-playbook:adp-reviewer', model: 'claude-opus-5-5', effort: 'high' }]);
  assert.deepEqual(outcome.unexpected, [{ agentType: 'agentic-delivery-playbook:adp-reviewer', model: 'claude-opus-5-5', effort: 'medium' }]);
  const unknown = { ...report, subagents: report.subagents.map((s) => (s.label === 'review-1' ? { ...s, observed: [{ ...s.observed[0], effort: 'unknown' }] } : s)) };
  const tolerant = compareRoutes(unknown, requested);
  assert.equal(tolerant.matched, true);
  assert.deepEqual(tolerant.unknownEffort, [{ label: 'review-1', agentType: 'agentic-delivery-playbook:adp-reviewer', model: 'claude-opus-5-5', requestedEffort: 'medium' }]);
});

test('CLI probe accepts repeated --requested and prints the comparison', () => {
  const probe = cli('probe', 'claude', session2, '--requested', result2);
  assert.equal(probe.status, 0, probe.stderr);
  const report = JSON.parse(probe.stdout);
  assert.equal(report.comparison.matched, true);
  const twice = cli('probe', 'claude', session2, '--requested', result2, '--requested', result2);
  assert.equal(JSON.parse(twice.stdout).comparison.matched, false, 'doubling requested routes produces missing entries');
  assert.notEqual(cli('probe', 'claude', session2, '--requested').status, 0);
  assert.notEqual(cli('probe', 'claude', session2, '--requested', path.join(fixtures, 'nope.json')).status, 0);
});
```

Add `const fs = require('node:fs');` to the top of the test file if it is not already imported.

- [ ] **Step 3: Run the probe tests to verify the new ones fail**

Run: `node --test test/claude-code-route-probe.test.js`
Expected: the four new tests FAIL (`compareRoutes is not a function`, length mismatch). Existing tests pass.

- [ ] **Step 4: Rewrite `lib/claude-route-probe.js`**

Replace the file with:

```js
'use strict';

// Read-only report of requested vs observed Claude Code routes from a session transcript.
// Reads <session>.jsonl, <session>/subagents/agent-*.{jsonl,meta.json},
// <session>/subagents/workflows/<runId>/agent-*.{jsonl,meta.json}, and agent definition files.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const pluginPrefix = 'agentic-delivery-playbook:';
const excludedFromComparison = new Set([`${pluginPrefix}adp-explorer`]);
const defaultAgentsDir = path.resolve(__dirname, '..', 'adapters', 'claude-code', 'agents');

// Never emit a raw absolute path under the home directory: use a cwd-relative path
// when inside the cwd, otherwise replace the home prefix with "~".
function displayPath(target) {
  const absolute = path.resolve(target);
  const relative = path.relative(process.cwd(), absolute);
  if (relative === '') return '.';
  if (!relative.startsWith('..') && !path.isAbsolute(relative)) return relative;
  const home = os.homedir();
  if (absolute === home) return '~';
  if (absolute.startsWith(home + path.sep)) return `~${absolute.slice(home.length)}`;
  return absolute;
}

function parseFrontmatter(text) {
  const block = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fields = {};
  if (!block) return fields;
  for (const line of block[1].split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z][\w-]*):\s*(.*?)\s*$/);
    if (match) fields[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
  return fields;
}

function loadAgentDefinitions(agentsDir) {
  const definitions = new Map();
  if (!agentsDir || !fs.existsSync(agentsDir)) return definitions;
  for (const file of fs.readdirSync(agentsDir).filter((name) => name.endsWith('.md')).sort()) {
    const fields = parseFrontmatter(fs.readFileSync(path.join(agentsDir, file), 'utf8'));
    const name = fields.name || file.replace(/\.md$/, '');
    definitions.set(name, { model: fields.model, effort: fields.effort, path: file });
  }
  return definitions;
}

function lookupDefinition(definitions, agentType) {
  if (typeof agentType !== 'string') return undefined;
  // Strip only this plugin's namespace; foreign namespaces must not match.
  const bare = agentType.startsWith(pluginPrefix) ? agentType.slice(pluginPrefix.length) : agentType;
  return bare.includes(':') ? undefined : definitions.get(bare);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function observedRoutes(file) {
  const routes = new Map();
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!line.trim()) continue;
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    const model = entry && entry.message && entry.message.model;
    if (typeof model !== 'string' || model === '' || model === '<synthetic>') continue;
    const route = { model, effort: entry.perTurnEffort ?? 'unknown', entrypoint: entry.entrypoint ?? 'unknown' };
    const key = JSON.stringify(route);
    const existing = routes.get(key);
    if (existing) existing.count += 1;
    else routes.set(key, { ...route, count: 1 });
  }
  return [...routes.values()];
}

// Requested model: per-invocation meta, else definition, else unknown.
// Requested effort: per-invocation meta (if a future Claude Code records it), else definition, else unknown.
function requestedRoute(meta, definition) {
  const route = {
    model: meta.model ?? definition?.model ?? 'unknown',
    effort: meta.effort ?? definition?.effort ?? 'unknown',
    source: 'unmatched',
    definitionPath: definition?.path ?? null,
  };
  if (meta.model || meta.effort) route.source = 'invocation';
  else if (definition) route.source = 'definition';
  else if (meta.agentType === 'workflow-subagent') route.source = 'workflow';
  return route;
}

function collectSubagentFiles(sessionFile) {
  const subDir = path.join(sessionFile.replace(/\.jsonl$/, ''), 'subagents');
  const entries = [];
  if (!fs.existsSync(subDir)) return entries;
  const jsonlIn = (dir) => fs.readdirSync(dir).filter((name) => name.endsWith('.jsonl')).sort();
  for (const name of jsonlIn(subDir)) entries.push({ dir: subDir, name, workflowRunId: null });
  const workflowsDir = path.join(subDir, 'workflows');
  if (fs.existsSync(workflowsDir)) {
    for (const runId of fs.readdirSync(workflowsDir).sort()) {
      const runDir = path.join(workflowsDir, runId);
      if (!fs.statSync(runDir).isDirectory()) continue;
      for (const name of jsonlIn(runDir)) entries.push({ dir: runDir, name, workflowRunId: runId });
    }
  }
  return entries;
}

function probeClaude(sessionFile, options = {}) {
  if (!sessionFile || !fs.existsSync(sessionFile) || !fs.statSync(sessionFile).isFile()) {
    throw new Error(`session transcript not found: ${displayPath(sessionFile)}`);
  }
  const agentsDir = options.agentsDir ?? defaultAgentsDir;
  if (options.agentsDir && !fs.existsSync(agentsDir)) {
    throw new Error(`agents directory not found: ${displayPath(agentsDir)}`);
  }
  const agentsDirMissing = !fs.existsSync(agentsDir);
  if (agentsDirMissing) {
    process.stderr.write(`warning: agents directory not found: ${displayPath(agentsDir)}; requested routes will be unmatched\n`);
  }
  const definitions = loadAgentDefinitions(agentsDir);
  const report = {
    session: path.basename(sessionFile),
    agentsDir: agentsDirMissing ? null : displayPath(agentsDir),
    main: { observed: observedRoutes(sessionFile) },
    subagents: [],
  };

  for (const { dir, name, workflowRunId } of collectSubagentFiles(sessionFile)) {
    const meta = readJson(path.join(dir, name.replace(/\.jsonl$/, '.meta.json')));
    report.subagents.push({
      agentId: name.replace(/^agent-/, '').replace(/\.jsonl$/, ''),
      agentType: meta.agentType ?? 'unknown',
      label: meta.description ?? null,
      workflowRunId,
      workflowPhase: meta.workflowPhase ?? null,
      spawnDepth: meta.spawnDepth ?? 'unknown',
      requested: requestedRoute(meta, lookupDefinition(definitions, meta.agentType)),
      observed: observedRoutes(path.join(dir, name)),
    });
  }
  return report;
}

// Multiset comparison of requested (agentType, model, effort) from workflow results against observed
// plugin subagents. Explorer and non-plugin agents are excluded and listed. An observed effort of
// 'unknown' whose agentType and model match a requested entry is consumed and listed as a gap.
function compareRoutes(report, requestedRoutes) {
  const key = (agentType, model, effort) => JSON.stringify({ agentType, model, effort });
  const parse = (k) => JSON.parse(k);
  const singleObserved = (subagent) => {
    if (subagent.observed.length === 1) return subagent.observed[0];
    const models = new Set(subagent.observed.map((o) => o.model));
    const efforts = new Set(subagent.observed.map((o) => o.effort));
    return { model: models.size === 1 ? [...models][0] : 'mixed', effort: efforts.size === 1 ? [...efforts][0] : 'mixed' };
  };

  const excluded = [];
  const candidates = [];
  for (const subagent of report.subagents) {
    const type = subagent.agentType;
    if (typeof type !== 'string' || !type.startsWith(pluginPrefix) || excludedFromComparison.has(type)) {
      excluded.push({ agentId: subagent.agentId, agentType: type, label: subagent.label });
      continue;
    }
    candidates.push({ ...subagent, route: singleObserved(subagent) });
  }

  const remaining = new Map();
  for (const route of requestedRoutes) {
    const k = key(route.agentType, route.model, route.effort);
    remaining.set(k, (remaining.get(k) || 0) + 1);
  }
  const unexpected = [];
  const unknownEffort = [];
  const consume = (k) => {
    const count = remaining.get(k);
    if (!count) return false;
    if (count === 1) remaining.delete(k);
    else remaining.set(k, count - 1);
    return true;
  };
  for (const candidate of candidates) {
    const { model, effort } = candidate.route;
    if (consume(key(candidate.agentType, model, effort))) continue;
    if (effort === 'unknown') {
      const match = [...remaining.keys()].map(parse).find((r) => r.agentType === candidate.agentType && r.model === model);
      if (match) {
        consume(key(match.agentType, match.model, match.effort));
        unknownEffort.push({ label: candidate.label, agentType: candidate.agentType, model, requestedEffort: match.effort });
        continue;
      }
    }
    unexpected.push({ agentType: candidate.agentType, model, effort });
  }
  const missing = [];
  for (const [k, count] of remaining) for (let i = 0; i < count; i += 1) missing.push(parse(k));

  const byLabel = new Map(candidates.filter((c) => c.label).map((c) => [c.label, c]));
  const labelPairs = requestedRoutes
    .filter((route) => route.label && byLabel.has(route.label))
    .map((route) => {
      const observed = byLabel.get(route.label).route;
      return { label: route.label, requested: { agentType: route.agentType, model: route.model, effort: route.effort }, observed: { model: observed.model, effort: observed.effort } };
    });

  return { matched: missing.length === 0 && unexpected.length === 0, missing, unexpected, unknownEffort, excluded, labelPairs };
}

module.exports = { probeClaude, compareRoutes, parseFrontmatter, loadAgentDefinitions };
```

- [ ] **Step 5: Add `--requested` to the CLI**

In `bin/agentic-delivery-playbook.js`, replace the `if (args[0] === 'probe') { ... }` block with:

```js
if (args[0] === 'probe') {
  const [, kind, sessionFile, ...rest] = args;
  if (kind !== 'claude' || !sessionFile) usage(1);
  let agentsDir;
  const requestedFiles = [];
  for (let i = 0; i < rest.length; i += 1) {
    if (rest[i] === '--agents-dir' && rest[i + 1] && agentsDir === undefined) agentsDir = rest[++i];
    else if (rest[i] === '--requested' && rest[i + 1]) requestedFiles.push(rest[++i]);
    else usage(1);
  }
  try {
    const { probeClaude, compareRoutes } = require('../lib/claude-route-probe');
    const report = probeClaude(sessionFile, { agentsDir });
    if (requestedFiles.length > 0) {
      const requested = requestedFiles.flatMap((file) => {
        const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
        if (!Array.isArray(parsed.requestedRoutes)) throw new Error(`${file}: no requestedRoutes array`);
        return parsed.requestedRoutes;
      });
      report.comparison = compareRoutes(report, requested);
    }
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    console.error(`error: ${error.message}`);
    usage(1);
  }
} else {
```

Update the usage text line to `agentic-delivery-playbook probe claude <session.jsonl> [--agents-dir <dir>] [--requested <workflow-result.json>]...` and add to the description: `With --requested (repeatable, one per workflow run), the report includes a comparison of requested and observed routes.`

- [ ] **Step 6: Run the probe tests**

Run: `node --test test/claude-code-route-probe.test.js`
Expected: all pass, including the original eight. The existing `CLI probe rejects bad input` test still passes because `--agents-dir` without a value and `--bogus` hit `usage(1)`.

- [ ] **Step 7: Run the full check and commit**

Run: `npm run check`
Expected: pass.

```bash
git add lib/claude-route-probe.js bin/agentic-delivery-playbook.js test/claude-code-route-probe.test.js test/fixtures/claude-code/session-2.jsonl test/fixtures/claude-code/session-2
git commit -m "feat: probe walks workflow transcripts and compares requested vs observed routes

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 8: Run record schema 1.1

**Files:**
- Modify: `templates/run.json`, `examples/controlled-run/run.json`
- Test: `test/run-record.test.js`

- [ ] **Step 1: Add the failing assertions**

In `test/run-record.test.js`, after `assert.equal(run.mode, 'controlled');` add:

```js
  assert.equal(run.schemaVersion, '1.1');
  assert.deepEqual(run.brief, { path: null, inception: null });
  assert.deepEqual(run.workflow, { mode: null, scriptPath: null, runs: [] });
  assert.equal(run.lanes[0].requested.agentType, null);
  assert.equal(run.closeout.goalFit, null);
```

Add a second test:

```js
test('the controlled example carries the 1.1 fields as null and keeps its GPT-6 lanes', () => {
  const run = JSON.parse(readUtf8(root, 'examples/controlled-run/run.json'));
  assert.equal(run.schemaVersion, '1.1');
  assert.deepEqual(run.brief, { path: null, inception: null });
  assert.deepEqual(run.workflow, { mode: null, scriptPath: null, runs: [] });
  for (const lane of run.lanes) assert.equal(lane.requested.agentType, null);
  assert.equal(run.closeout.goalFit, null);
  assert.equal(run.lanes[0].requested.model, 'gpt-6-luna');
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test test/run-record.test.js`
Expected: FAIL on `schemaVersion`.

- [ ] **Step 3: Update `templates/run.json`**

Change `"schemaVersion": "1.0"` to `"1.1"`. After the `"contract": {...}` object add:

```json
  "brief": {
    "path": null,
    "inception": null
  },
  "workflow": {
    "mode": null,
    "scriptPath": null,
    "runs": []
  },
```

In the lane's `requested` object add `"agentType": null` after `"topology": "single"`. In `closeout` add `"goalFit": null` after `"escalation": null`.

- [ ] **Step 4: Update `examples/controlled-run/run.json` the same way**

Same four edits: `schemaVersion` `"1.1"`, `brief` and `workflow` blocks after `contract`, `"agentType": null` in both lanes' `requested`, `"goalFit": null` in `closeout`.

- [ ] **Step 5: Run tests and the validator**

Run: `node --test test/run-record.test.js test/active-surface.test.js && node scripts/validate-active-policy.js`
Expected: pass; the template stays under 120 lines (check with `wc -l templates/run.json`, expected about 95).

- [ ] **Step 6: Commit**

```bash
git add templates/run.json examples/controlled-run/run.json test/run-record.test.js
git commit -m "feat: run record schema 1.1 with brief, workflow, agentType, and goalFit fields

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 9: Version 0.4.0, package files, security table, changelog

**Files:**
- Modify: `package.json`, `.claude-plugin/plugin.json`, `SECURITY.md`, `CHANGELOG.md`
- Test: `test/active-surface.test.js`, `test/claude-code-adapter.test.js`

- [ ] **Step 1: Update the tests first**

In `test/active-surface.test.js`:
- Change `assert.equal(manifest.version, '0.3.0');` to `'0.4.0'` and add after it:
  ```js
    assert.ok(manifest.files.includes('adapters/claude-code'));
    assert.ok(manifest.files.includes('.claude-plugin'));
  ```
- Rename the test `'repository contribution and support metadata matches 0.3'` to `'repository contribution and support metadata matches the current release'` and change `assert.match(security, /\| 0\.3\.x \| Yes \|/);` to `assert.match(security, /\| 0\.4\.x \| Yes \|/);` and `/\| 0\.2\.x and earlier \| No \|/` to `/\| 0\.3\.x and earlier \| No \|/`.

In `test/claude-code-adapter.test.js`, change `assert.equal(plugin.version, '0.3.0');` to `'0.4.0'`.

- [ ] **Step 2: Run to verify failure**

Run: `node --test test/active-surface.test.js test/claude-code-adapter.test.js`
Expected: version assertions FAIL.

- [ ] **Step 3: Bump and extend**

`package.json`: `"version": "0.4.0"`; add `"adapters/claude-code"` and `".claude-plugin"` to `files` (keep alphabetical order: `".claude-plugin"` first, then `"adapters/chatgpt"`, `"adapters/claude-code"`, ...).

`.claude-plugin/plugin.json`: `"version": "0.4.0"`.

`SECURITY.md` supported versions table:
```markdown
| Version | Supported |
| --- | --- |
| 0.4.x | Yes |
| 0.3.x and earlier | No |
```

`CHANGELOG.md`: rename `## Unreleased` to `## 0.4.0 - Unreleased` and add these bullets at the top of that section:

```markdown
- Added a three-tier Controlled route for Claude Code: Fable 5.1 or Opus 5.5 orchestrator, Opus 5.5 lead, Sonnet 5.5 workers, low-effort validator, Opus defect reviewer, and a configurable goal-fit reviewer defaulting to Fable 5.1.
- Added the shipped `deliver-controlled` Workflow script with Plan, Implement, Review, and Goal-fit phases, serialized writers, content-hash ownership gates, and fixed fix-cycle limits.
- Added `adp-lead`, `adp-validator`, and `adp-goal-reviewer` agents; the `deliver` skill now starts with an inception grill and ends with an orchestrator re-run of the verification plan.
- Probe reads workflow transcripts and compares requested with observed routes (`--requested`).
- Run record schema 1.1 adds `brief`, `workflow`, lane `requested.agentType`, and `closeout.goalFit`.
- Claude Code adapter and plugin manifest are included in the npm package.
```

- [ ] **Step 4: Verify the package contents**

Run: `npm pack --dry-run 2>&1 | grep -E 'deliver-controlled.js|adp-lead.md|plugin.json'`
Expected: three lines listing those files.

- [ ] **Step 5: Run the full check and commit**

Run: `npm run check`
Expected: pass.

```bash
git add package.json .claude-plugin/plugin.json SECURITY.md CHANGELOG.md test/active-surface.test.js test/claude-code-adapter.test.js
git commit -m "chore: bump to 0.4.0 and ship the Claude Code adapter in the package

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

## Chunk 4: Profile, skill, README, settings, dogfood

### Task 10: Profile version 2

**Files:**
- Rewrite: `profiles/claude-5.md`
- Test: `test/claude-code-adapter.test.js` (the profile test)

- [ ] **Step 1: Update the profile test**

Replace the test `'the Claude 5 profile holds routes, escalation, and attestation caveats'` with:

```js
test('the Claude 5 profile holds the three-tier routes, escalation, delegation limits, and attestation caveats', () => {
  const text = readUtf8(root, 'profiles/claude-5.md');
  for (const term of [
    'claude-fable-5-1', 'claude-opus-5-5', 'claude-sonnet-5-5',
    'adp-lead', 'adp-worker', 'adp-worker-high', 'adp-validator', 'adp-reviewer', 'adp-reviewer-high', 'adp-goal-reviewer', 'adp-explorer',
    'deliver-controlled.js',
  ]) {
    assert.ok(text.includes(term), term);
  }
  assert.match(text, /Profile version: 2/);
  assert.match(text, /Escalation/);
  assert.match(text, /requested.*configured.*observed/is);
  assert.match(text, /alias drift/i);
  assert.match(text, /not attestation/i);
  assert.match(text, /Depth: one/);
  assert.match(text, /Workflow/);
  assert.match(text, /agent teams/i);
  assert.match(text, /CLI-only/i);
  assert.match(text, /read-only by instruction; Bash is available for diff and checks/);
  assert.match(text, /Known gaps/);
  assert.doesNotMatch(text, /model: opus/, 'alias escalation route removed');
  assert.doesNotMatch(text, /probe claude/);
  assert.ok(lineCount(text) <= 120, `profile has ${lineCount(text)} lines`);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test test/claude-code-adapter.test.js`
Expected: the profile test FAILS on `claude-fable-5-1`.

- [ ] **Step 3: Rewrite `profiles/claude-5.md`**

```markdown
# Claude 5 routing profile

Status: maintained
Profile version: 2
Verified: 2026-10-11 (desktop plugin install and the custom `agentType` recording in workflow metadata are confirmed by the dogfood run recorded under `specs/`)
Surfaces: Claude Code desktop app (Code tab) and terminal CLI, plugin `agentic-delivery-playbook`
Recheck trigger: any Claude 5 model, alias, effort, Workflow tool, or Claude Code subagent/plugin change

This profile maps delivery capabilities to Claude 5 models in Claude Code. It replaces the playbook's profile reference here; Ultra and Codex topology do not apply. The kernel in `playbook.md` stays capability-based; model and reasoning effort are separate choices. Sources: spike notes (Claude Code 2.1.285), Claude Code docs checked 2026-10-11, and local transcripts.

## Route table

| Role | Model ID | Effort | Agent | Topology |
| --- | --- | --- | --- | --- |
| Orchestrator | `claude-fable-5-1` (economy: `claude-opus-5-5`) | high (economy: medium) | main session | one plane |
| Lead | `claude-opus-5-5` | xhigh | `adp-lead`, read-only | workflow Plan phase |
| Worker, attempt 1 | `claude-sonnet-5-5` | medium | `adp-worker` | workflow Implement phase, serialized |
| Worker, retry 1 | `claude-sonnet-5-5` | high | `adp-worker-high` | same |
| Worker, retry 2 | `claude-opus-5-5` | high | `adp-worker` with explicit workflow `model` and `effort` | same |
| Validator | `claude-sonnet-5-5` | low | `adp-validator`, Bash and Read | around every task and review |
| Defect reviewer | `claude-opus-5-5` | medium (high via `adp-reviewer-high` when risk is high) | `adp-reviewer` | workflow Review phase, fresh context |
| Goal-fit reviewer | `claude-fable-5-1` (configurable in workflow `args`) | high | `adp-goal-reviewer` | workflow Goal-fit phase, fresh context |
| Explorer | `claude-sonnet-5-5` | low | `adp-explorer`, read-only tools | ad hoc lookups |

Direct mode: the orchestrator edits directly. Controlled mode: the shipped Workflow script `adapters/claude-code/workflows/deliver-controlled.js` runs Plan, Implement, Review, and Goal-fit; the orchestrator writes only the brief, the contract, and the run record, and re-runs the contract's verification plan itself at closeout.

## Escalation

- Worker ladder inside the workflow: Sonnet medium, then Sonnet high, then Opus high. Three attempts per task, counting review fixes. A task that fails its check at attempt three stops the run as escalated.
- Review: `adp-reviewer` at medium; `adp-reviewer-high` when the contract's risk line is `high`. At most two accept-with-fixes cycles before the run escalates.
- Goal-fit: no automatic fix loop. `partially-fit` closes as partially accepted with the reasons as known gaps; `not-fit` escalates to the user.
- Escalate only from evidence: a failed check, a reviewer finding, a fingerprint mismatch, or a stop condition. Higher effort is not an unlimited retry loop.

## Review independence

A different model tier is not independent review. Lead, validator, both reviewers, and the explorer are read-only by instruction; Bash is available for diff and checks; enforcement is a before/after worktree fingerprint (temp-index tree including untracked files, plus `HEAD`) taken by the validator around every read-only phase. Workers never commit; `HEAD` must equal the base commit at every fingerprint. Fresh context, the fingerprint, deterministic checks, and the orchestrator's own closeout re-run provide the separation, not tool restrictions.

## Requested, configured, observed

- Requested: the route the workflow passed on each call, recorded in the workflow result's `requestedRoutes`; in manual mode, the agent definition or the per-invocation override the orchestrator used.
- Configured: project or user settings intent (`model`, `effortLevel`). The optional `templates/claude-settings.template.json` sets the orchestrator; it is a reviewed manual merge, never auto-applied.
- Observed: transcript fields `message.model` and `perTurnEffort`, read by the probe for the main session, top-level subagents, and workflow agents under `subagents/workflows/<runId>/`. Workflow metadata carries the label as `description` and the phase as `workflowPhase`; it carries `model` only when passed per invocation and never carries `effort`.
- Closeout applies the match rule: the multiset of (agent type, model, effort) over all workflow runs' requested routes equals the multiset observed for plugin agents other than `adp-explorer`. Observed effort `unknown` with matching type and model, and orphans from a crash resume, are recorded gaps; any other difference closes the run as escalated.
- A session can verify only its own model ID, not its effort. Check effort as configured, confirm it as observed at closeout, otherwise record `unknown`.
- `entrypoint` comes from an environment variable. Record it, but it is not attestation of surface.

## Alias drift

Aliases such as `sonnet`, `opus`, and `fable` resolve to the current model and can change. Agents and the workflow use full model IDs. Re-verify routes after any model release.

## Delegation limits

- One orchestration plane: the main session. The Workflow tool is its scheduler, not a second plane. Depth: one. Workflow agents do not spawn subagents.
- Agent teams are excluded: they are CLI-only and teammates cannot spawn teammates.
- One writer at a time; the workflow's Implement phase is a sequential loop. Parallel worktree workers are out of scope until the kernel defines a merge step.
- One named synthesis owner: the orchestrator.
- During a Controlled run the orchestrator does not invoke plugin lead, worker, validator, reviewer, or goal-reviewer agents outside the workflow. If a required route is unavailable, stop that lane and ask; do not silently substitute.
- Headless runs (`claude -p`, Agent SDK) have no Workflow tool: the orchestrator runs the same phases by hand with the same agents and records `workflow.mode: manual`.

## Known gaps

- A review fix to one task is validated only by that task's check inside the workflow; dependent tasks are covered by the next review cycle and the orchestrator's closeout re-run.
- The fingerprint does not cover gitignored files.
- Plugin subagents ignore frontmatter hooks and permission modes; read-only roles rely on tool allowlists plus the fingerprint.
- The plugin root is the repository root, so `bin/`, `legacy/`, `specs/`, and `.pi/` ship in the plugin cache.
- A bare, unnamespaced `adp-worker` (for example a project-local agent with the same name) is matched to the plugin definition; the probe cannot tell them apart.
```

- [ ] **Step 4: Run the adapter tests and the validator**

Run: `node --test test/claude-code-adapter.test.js && node scripts/validate-active-policy.js`
Expected: the profile test passes; validator passes (120-line budget). Check `wc -l profiles/claude-5.md` is at most 120.

- [ ] **Step 5: Commit**

```bash
git add profiles/claude-5.md test/claude-code-adapter.test.js
git commit -m "feat: Claude 5 profile version 2 with the three-tier route table

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 11: Settings template and adapter README

**Files:**
- Modify: `templates/claude-settings.template.json`
- Rewrite: `adapters/claude-code/README.md`
- Test: `test/claude-code-adapter.test.js`

- [ ] **Step 1: Update the tests**

In `test/claude-code-adapter.test.js`, in the test `'the settings template sets the orchestrator route and the README documents install'`, change the expected template to `{ model: 'claude-fable-5-1', effortLevel: 'high' }` and add:

```js
  assert.match(readme, /## Reference/);
  assert.match(readme, /"contractPath"/);
  assert.match(readme, /GIT_INDEX_FILE/);
  assert.match(readme, /git rev-parse --git-path index/);
  assert.match(readme, /Gitignored files are not covered/);
  assert.match(readme, /shasum -a 256/);
  assert.match(readme, /--requested/);
  assert.match(readme, /\| `closeout\.goalFit` \|/);
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test test/claude-code-adapter.test.js`
Expected: the settings/README test FAILS.

- [ ] **Step 3: Update the settings template**

`templates/claude-settings.template.json`:
```json
{
  "model": "claude-fable-5-1",
  "effortLevel": "high"
}
```

- [ ] **Step 4: Rewrite `adapters/claude-code/README.md`**

```markdown
# Claude Code adapter

A Claude Code plugin that applies the Direct and Controlled kernel in the desktop app (Code tab) and the terminal CLI. Routes are defined in [`profiles/claude-5.md`](../../profiles/claude-5.md). Controlled work runs as a shipped Workflow script: an Opus lead plans bounded tasks, Sonnet workers implement them one at a time, a low-effort validator gates each task, an Opus reviewer checks defects in fresh context, and a Fable goal-fit reviewer judges the result against the intent brief.

## What it provides

- Skill `/agentic-delivery-playbook:deliver` (explicit invoke only): inception grill, classification, contract, the workflow call, and closeout.
- Workflow script `adapters/claude-code/workflows/deliver-controlled.js` with phases Plan, Implement, Review, Goal-fit.
- Agents `adp-lead` (Opus 5.5 xhigh, read-only), `adp-worker` and `adp-worker-high` (Sonnet 5.5 medium and high, sole writers), `adp-validator` (Sonnet 5.5 low, Bash and Read), `adp-reviewer` and `adp-reviewer-high` (Opus 5.5 medium and high, fresh context), `adp-goal-reviewer` (Fable 5.1 high, fresh context), and `adp-explorer` (Sonnet 5.5 low, read-only tools).
- Every read-only agent is read-only by instruction; Bash is available for diff and checks; the validator's before/after worktree fingerprint enforces it.
- `agentic-delivery-playbook probe claude` for requested versus observed route evidence, with `--requested` to apply the match rule.

## Install

Desktop app (Code tab) and terminal use the same commands:

```text
/plugin marketplace add arcayne/agentic-delivery-playbook
/plugin install agentic-delivery-playbook@agentic-delivery-playbook
```

To try it without installing, run `claude --plugin-dir <path-to-this-repo>`.

## Orchestrator route

Plugins cannot set the main session model. Optionally merge [`templates/claude-settings.template.json`](../../templates/claude-settings.template.json) (`claude-fable-5-1`, effort `high`) into your project's `.claude/settings.json`. Review and merge it by hand; it is never auto-applied and this plugin never edits your settings. The skill's Controlled preflight accepts Fable 5.1 or Opus 5.5 as the main session and stops on anything else. The Workflow tool is unavailable in `claude -p`; there the skill runs the same phases by hand.

## Reference

### Workflow `args`

The skill passes these to the Workflow tool with `scriptPath` set to the plugin's `adapters/claude-code/workflows/deliver-controlled.js` (resolve it from the plugin root given by the `CLAUDE_PLUGIN_ROOT` variable):

```json
{
  "contractPath": "specs/<run>/contract.md",
  "briefPath": "specs/<run>/brief.md",
  "baseCommit": "<sha>",
  "risk": "normal",
  "pauseAfterPlan": false,
  "nonGoalFiles": ["README.md", "legacy/**"],
  "lanes": [{ "id": "worker", "ownedFiles": ["src/**", "test/x.test.js"] }],
  "goalReviewer": { "agentType": "agentic-delivery-playbook:adp-goal-reviewer", "model": "claude-fable-5-1", "effort": "high" },
  "resumePlan": null
}
```

Set `pauseAfterPlan` to `true` when the grill was skipped or `risk` is `high`; the run returns `plan-ready`, you approve the plan, then start a second run with `resumePlan` set to the approved plan and `pauseAfterPlan` `false`. A `blocked` run with `openQuestions` means: answer them, append the answers to the brief under "Answers", and start a new run. Other plan failures may be retried once the same way; a second failure goes to the user. Lane `ownedFiles` and `nonGoalFiles` are patterns where `*` matches within one path segment and `**` matches any depth. `goalReviewer` is optional and defaults to the values shown.

### Fingerprint and diff hash

Worktree fingerprint (temp-index tree including untracked files; Gitignored files are not covered):

```bash
T=$(mktemp) && cp "$(git rev-parse --git-path index)" "$T" && GIT_INDEX_FILE="$T" git add -A && GIT_INDEX_FILE="$T" git write-tree; rm -f "$T"
```

Diff hash, computed by the reviewer and again by the orchestrator at closeout before re-running the verification plan (replace `BASE`):

```bash
{ git diff BASE; git ls-files --others --exclude-standard -z | while IFS= read -r -d '' f; do printf '%s\0' "$f"; cat "$f"; done; } | shasum -a 256
```

### Closeout

| Workflow `status` | Goal-fit `verdict` | Outcome |
| --- | --- | --- |
| `completed` | `fit` | accepted, if the orchestrator's own verification re-run also passes |
| `completed` | `partially-fit` | partially accepted; reasons become known gaps |
| `completed` | `not-fit` | escalated to the user |
| `escalated` | any | escalated with `reason` |
| `blocked` | none | blocked with `reason` |

Mapping from the workflow result to `run.json` (schema 1.1):

| `run.json` field | Source |
| --- | --- |
| `brief` | `{ path, inception: "completed" or "skipped" }` from the brief file |
| `workflow` | `{ mode: "workflow" or "manual", scriptPath, runs: [{ runId, resultFile, status }] }`, one entry per Workflow invocation (a paused run and its resumed run are two) |
| `source.finalCommit` | `null`; workers never commit. `diffSha256` from the command above |
| `route.policy` | `profiles/claude-5.md` |
| `lanes[]` | one per entry in the concatenated `requestedRoutes`: `id` = `<run index>-<label>`, `role` from the agent type, `ownership` = the task's `ownedFiles` for workers, `requested` = `{ model, effort, topology: "workflow-agent" or "single", agentType }`, `observed` from the probe |
| `validation[]` | one per task `postValidation` and per closeout check: `id` = label or `closeout-<n>`; workflow entries have `startedAt`, `endedAt`, `outputSha256` `null` and `outputReference` = `specs/<run>/workflow-result.json#<label>` |
| `acceptance[]` | `passed` when a task or closeout check covers the criterion, every covering task passed, it is absent from the final review's `unprovenCriteria`, and every closeout check covering it passed; `unproven` when nothing covers it; else `failed` |
| `review` | `reviewerLaneId` = final cycle lane; `diffReviewed` true only when the reviewer's `diffSha256` equals the orchestrator's; `evidenceReviewed` true; `decision` = `finalDecision`; plus `cycles`, `unprovenCriteria`, fingerprints |
| `closeout.goalFit` | `{ verdict, reviewerModel, reviewerEffort, usedDeliverable, howUsed, reasons }` |

Save each workflow return verbatim as `specs/<run>/workflow-result.json` (suffix `-2`, `-3` for later runs).

### Route evidence

```text
npx agentic-delivery-playbook probe claude <session.jsonl> [--agents-dir <dir>] [--requested <workflow-result.json>]...
```

The transcript is `~/.claude/projects/<cwd with / replaced by ->/<session-id>.jsonl`; workflow agents are under `<session-id>/subagents/workflows/<runId>/`. Pass one `--requested` per workflow run. The report's `comparison` lists `missing`, `unexpected`, `unknownEffort` (a recorded gap), `excluded` (explorer and non-plugin agents), and `labelPairs`. Until an npm release includes this version, run `node <installed plugin path>/bin/agentic-delivery-playbook.js probe claude ...` instead.

## Known gaps

See the Known gaps section of the profile. Output paths are shown cwd-relative or with `~`, never as raw home-directory paths.
```

- [ ] **Step 5: Run the adapter tests**

Run: `node --test test/claude-code-adapter.test.js`
Expected: pass. In particular `assert.doesNotMatch(readme, /```[^`]*CLAUDE_PLUGIN_ROOT/)` still holds because the README mentions `CLAUDE_PLUGIN_ROOT` only in inline code.

- [ ] **Step 6: Commit**

```bash
git add templates/claude-settings.template.json adapters/claude-code/README.md test/claude-code-adapter.test.js
git commit -m "docs: Fable orchestrator settings template and adapter reference section

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 12: Rewrite the deliver skill

**Files:**
- Rewrite: `adapters/claude-code/skills/deliver/SKILL.md`
- Test: `test/claude-code-adapter.test.js`

- [ ] **Step 1: Update the skill tests**

Replace the test `'the deliver skill is explicit-invoke and translates the same two-mode kernel'` with:

```js
test('the deliver skill is explicit-invoke and translates the three-tier Controlled route', () => {
  const file = 'adapters/claude-code/skills/deliver/SKILL.md';
  const text = readUtf8(root, file);
  const meta = frontmatter(file);
  assert.equal(meta.name, 'deliver');
  assert.equal(meta['disable-model-invocation'], 'true');
  for (const pattern of [
    /Direct/, /Controlled/, /contract/i, /actual diff/i, /validation evidence/i, /profiles\/claude-5\.md/,
    /sole writer/i, /preflight/i, /one orchestration plane/i, /depth one/i, /serialized/i,
    /brief/i, /grill/i, /deliver-controlled\.js/, /pauseAfterPlan/, /resumePlan/, /openQuestions/,
    /goal-fit/i, /re-run/i, /manual/i, /workflow-result\.json/,
    /read-only by instruction; Bash is available for diff and checks/,
    /\$\{CLAUDE_PLUGIN_ROOT\}\/bin\/agentic-delivery-playbook\.js/, /~\/\.claude\/projects\//, /--requested/,
  ]) {
    assert.match(text, pattern, String(pattern));
  }
  assert.doesNotMatch(text, /\b(?:Lightweight|Full) mode\b/i);
  assert.doesNotMatch(text, /GIT_INDEX_FILE/, 'fingerprint command lives in the README and the validator');
  assert.ok(lineCount(text) <= 80, `skill has ${lineCount(text)} lines`);
});
```

In the test `'the reviewer read-only disclosure and fingerprint rule are stated plainly'`, delete these five lines (they moved to the validator and README tests):

```js
  assert.match(skill, /GIT_INDEX_FILE/);
  assert.match(skill, /git rev-parse HEAD/);
  assert.match(skill, /git rev-parse --git-path index/);
  assert.match(skill, /Gitignored files are not covered/);
```
and keep `assert.match(skill, /\$\{CLAUDE_PLUGIN_ROOT\}\/bin\/agentic-delivery-playbook\.js/);` and `assert.match(skill, /~\/\.claude\/projects\//);`.

- [ ] **Step 2: Run to verify failure**

Run: `node --test test/claude-code-adapter.test.js`
Expected: the skill test FAILS on `/brief/i` or `/grill/i`.

- [ ] **Step 3: Rewrite `adapters/claude-code/skills/deliver/SKILL.md`**

```markdown
---
name: deliver
description: Apply the Agentic Delivery Playbook in Claude Code. Grill the goal, classify work as Direct or Controlled, run Controlled work through the shipped workflow (Opus lead, Sonnet workers, Opus defect review, Fable goal-fit review), and close from evidence.
disable-model-invocation: true
---

# Agentic Delivery Playbook for Claude Code

Invoked explicitly as `/agentic-delivery-playbook:deliver <task>`.

## Canonical policy

- `${CLAUDE_PLUGIN_ROOT}/playbook.md` is authoritative for process, stop, and failure rules.
- `${CLAUDE_PLUGIN_ROOT}/profiles/claude-5.md` is the route table here; Ultra and Codex topology do not apply.
- Contract template: `${CLAUDE_PLUGIN_ROOT}/templates/contract.md`. Reference (args, fingerprint, diff hash, run-record mapping): `${CLAUDE_PLUGIN_ROOT}/adapters/claude-code/README.md`.
- Two process modes only: Direct and Controlled.

## 1. Inception grill

Ask one question at a time until you can state: the outcome, who it serves, how success is observed, what must not change, and what was already tried. Write the answers under those five headings as `specs/<run>/brief.md`, at most 20 lines. If the user says to skip, write `inception: skipped, risk accepted by user` in the brief instead. Direct work may skip the grill silently.

## 2. Classify

Inspect `git status`, repository instructions, and the relevant code. Choose Direct or Controlled from consequence, ambiguity, reversibility, authority, coupling, and verification quality. Switch to Controlled if a material risk appears.

## 3. Direct

You may edit directly. State the change, make the smallest correct edit, run relevant deterministic validation, and report changed files, results, assumptions, and gaps.

## 4. Controlled: preflight and contract

Preflight: your model ID (system prompt) must be `claude-fable-5-1` or `claude-opus-5-5`; otherwise stop and offer the settings template as a reviewed manual merge. You cannot verify your effort; check it as configured, confirm it as observed at closeout, else record `unknown`. Write `specs/<run>/contract.md` from the template: objective and acceptance criteria from the brief, lanes with exclusive file ownership (paths or `*`/`**` patterns), non-goal files, a verification plan, a `Risk: normal|high` line, and the rule that nobody commits during the run. Get approval for unresolved product choices, authority, or material boundaries. Record the base commit (`git rev-parse HEAD`).

## 5. Controlled: run the workflow

Call the Workflow tool with `scriptPath` = `${CLAUDE_PLUGIN_ROOT}/adapters/claude-code/workflows/deliver-controlled.js` and the `args` from the README reference. Set `pauseAfterPlan` true when the grill was skipped or risk is high. This instruction is the opt-in; no keyword is needed. One orchestration plane, depth one: the workflow schedules the agents; you spawn nothing else from the plugin during the run. The workflow serializes writers: `adp-worker` is the sole writer for each task, the lead and both reviewers are read-only by instruction; Bash is available for diff and checks; the validator's fingerprints enforce it.

- `plan-ready`: show the task list, get approval, then start a second run with `resumePlan` = the approved plan and `pauseAfterPlan` false.
- `blocked` with `openQuestions`: ask the user, append the answers to the brief under "Answers", start a new run. Other plan failures: fix the cause, retry once, then stop and ask.
- `escalated`: report the `reason` and the records; do not retry inside the same contract without the user.
- Save every return verbatim as `specs/<run>/workflow-result.json` (then `-2`, `-3`).

## 6. Controlled: closeout

Compute the diff hash (README) before anything else, then re-run every command in the contract's verification plan yourself and record command, exit status, and result; the validator's records gate tasks inside the run, your own re-run is the closeout evidence. Fill `run.json` with the README mapping. Run `node "${CLAUDE_PLUGIN_ROOT}/bin/agentic-delivery-playbook.js" probe claude <session.jsonl> --requested <workflow-result.json>...` where the transcript is `~/.claude/projects/<cwd with / replaced by ->/<session-id>.jsonl`; `comparison.matched` must be true, with `unknownEffort` entries recorded as gaps. Close by the README table: accepted needs defect review `accept`, goal-fit `fit`, a passing re-run, and a matched comparison. Report changed files, acceptance results, validation evidence, the actual diff hash, assumptions, known gaps, and escalation state. Never claim a check ran, a route was observed, or a reviewer was independent without evidence.

## 7. Manual fallback

If the Workflow tool is unavailable (`claude -p`, SDK), run the same phases by hand with the same agents and limits: validator, `adp-lead`, validator; apply the plan rules yourself; per task validator, `adp-worker` (ladder: `adp-worker`, `adp-worker-high`, `adp-worker` with model `claude-opus-5-5` effort high), validator with the task check; review and goal-fit each between two validator fingerprints. Build `requestedRoutes` by hand and record `workflow.mode: manual`.

## Stop and failure rules

With an approved end-to-end outcome, do not stop for repeated slice approvals. Stop only for new scope, an unresolved product decision, new authority, an unmet safe route, or contradictory evidence after two focused fix cycles. A timed-out or unusable lane is failed and its edits untrusted. If a required route is unavailable, stop that lane and ask; a different model tier is not independent review.
```

- [ ] **Step 4: Run the adapter tests and the validator**

Run: `node --test test/claude-code-adapter.test.js && node scripts/validate-active-policy.js`
Expected: pass. `wc -l adapters/claude-code/skills/deliver/SKILL.md` at most 80. If over, tighten prose in sections 5 and 6; do not drop any term the test asserts.

- [ ] **Step 5: Run the full check and commit**

Run: `npm run check`
Expected: pass.

```bash
git add adapters/claude-code/skills/deliver/SKILL.md test/claude-code-adapter.test.js
git commit -m "feat: deliver skill runs Controlled work through the three-tier workflow

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 13: Plugin smoke test without installing (AC-8 part)

**Files:** none committed except notes

- [ ] **Step 1: Validate and list components**

Run from the repo root:
```bash
claude plugin validate .
```
Expected: `Validation passed`.

Run a headless session that lists the plugin's agents (the exact flag set used in the October 1 spike):
```bash
claude -p --plugin-dir "$PWD" --output-format stream-json --verbose "Reply with the single word ok." 2>/dev/null | head -1 | grep -o '"agents":\[[^]]*\]'
```
Expected: the printed array includes `agentic-delivery-playbook:adp-lead`, `adp-validator`, and `adp-goal-reviewer`. If the init line has no `agents` field in this Claude Code version, instead run `claude --plugin-dir "$PWD"` interactively and type `/agents`; confirm the eight plugin agents are listed.

- [ ] **Step 2: Record**

Note the Claude Code version (`claude --version`) and the result in `specs/<date>-three-tier-dogfood/notes.md` (create the directory now; the file is completed in Task 14). Do not commit yet.

### Task 14: Dogfood run (AC-9) and self goal-fit review (AC-10)

**Files:**
- Create: `specs/<date>-three-tier-dogfood/brief.md`, `contract.md`, `run.json`, `workflow-result.json` (and `-2` for the resumed run), `probe.json`, `notes.md`, `design-brief.md`, `goal-fit-plugin.md`
- Possibly modify: `test/fixtures/claude-code/session-2/` and `lib/claude-route-probe.js` if the real layout differs

This task is run by a person with the plugin loaded, not by a subagent. It needs a second repository with a real, small, Controlled-worthy task (for example a documented behaviour change with an existing test suite). Steps:

- [ ] **Step 1: Load the plugin in a desktop Code-tab session on the target repository**

Either install from the marketplace at the PR branch, or start the session with `--plugin-dir` pointing at this checkout. Confirm the main session model is Fable 5.1 (or Opus 5.5) and note the configured effort.

- [ ] **Step 2: Run the skill end to end**

Type `/agentic-delivery-playbook:deliver <task>`. Answer the grill. Approve the contract with `Risk: high` so `pauseAfterPlan` is exercised. Approve the plan at the pause. Let the second run complete through Goal-fit. Follow the closeout, including the orchestrator's verification re-run and the probe with two `--requested` files.

- [ ] **Step 3: Copy the sanitized evidence into this repository**

Into `specs/<date>-three-tier-dogfood/`: `brief.md`, `contract.md`, `run.json`, `workflow-result.json`, `workflow-result-2.json`, `probe.json`, and `notes.md` with the lanes table (requested = observed per label), the comparison summary, the orchestrator assistant-turn count for the run (count `"type":"assistant"` lines in the session transcript), and any difference between the real workflow metadata and the synthetic fixture. Replace repository names or paths from the target repo that are private with neutral placeholders. Run `grep -rn '/Users/\|/home/' specs/<date>-three-tier-dogfood/` and expect no output.

- [ ] **Step 4: Correct the fixture if the real layout differs**

If the real `meta.json` for a workflow agent with a custom `agentType` records a different `agentType` string, or records `effort`, update `test/fixtures/claude-code/session-2/` and, if needed, `lib/claude-route-probe.js` so the probe and `compareRoutes` match reality, then run `npm run check`. Record what changed in `notes.md`.

- [ ] **Step 5: Self goal-fit review (AC-10) in a separate session**

Create `specs/<date>-three-tier-dogfood/design-brief.md` by copying the appendix "Appendix: design intent brief" from the spec verbatim. In a new session on this repository, invoke the Agent tool with `subagent_type` `agentic-delivery-playbook:adp-goal-reviewer` and a prompt that names: the brief path, "the PR 1 acceptance criteria in docs/superpowers/specs/2026-10-11-claude-code-three-tier-delivery-design.md as the contract", the diff `git diff main...HEAD`, the dogfood directory as evidence, and `npm run check` plus read-only inspection as the only allowed commands. Save its verdict, reasons, and howUsed as `goal-fit-plugin.md`.

- [ ] **Step 6: Merge gate**

AC-9 and AC-10 both need verdict `fit` and `comparison.matched` true (gaps only of the `unknownEffort` kind). If either is `partially-fit` or `not-fit`, address the reasons, repeat the affected run, and record both attempts.

- [ ] **Step 7: Commit the evidence**

```bash
git add specs/<date>-three-tier-dogfood test/fixtures/claude-code lib/claude-route-probe.js
git commit -m "docs: record three-tier dogfood run and plugin goal-fit review

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 15: Final verification and PR

- [ ] **Step 1: Full check and package listing**

Run: `npm run check && npm pack --dry-run 2>&1 | grep -c 'adapters/claude-code'`
Expected: pass; the count is at least 12 (eight agents, the skill, the workflow, the README, plus any fixtures excluded).

- [ ] **Step 2: Review the diff against the acceptance criteria**

Walk AC-1 to AC-10 in the spec and tick each against a file or an evidence artifact. Anything unmet is listed in the PR body as an accepted gap or blocks the PR.

- [ ] **Step 3: Push and open the PR**

```bash
git push -u origin feat/three-tier-pr1
gh pr create --base main --title "feat: three-tier Controlled delivery for Claude Code (PR 1, mechanism)" --body-file - <<'EOF'
Implements PR 1 of docs/superpowers/specs/2026-10-11-claude-code-three-tier-delivery-design.md.

- New agents adp-lead, adp-validator, adp-goal-reviewer; structured returns for worker and reviewer
- Shipped Workflow script deliver-controlled.js: Plan, Implement, Review, Goal-fit; serialized writers; content-hash ownership gate; fixed fix cycles
- Deliver skill: inception grill, workflow call, pause/resume, closeout re-run
- Profile v2, Fable orchestrator settings template, adapter reference
- Probe: workflow transcript layout, labels, compareRoutes, --requested
- Run record schema 1.1; version 0.4.0; adapter shipped in the npm package
- Dogfood evidence under specs/ (AC-9) and plugin goal-fit verdict (AC-10)

Known gaps: see profiles/claude-5.md.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
```

Pushing and opening the PR need the user's go-ahead in the executing session; stop before this step if it was not given.
