'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const path = require('node:path');

const { readUtf8 } = require('../lib/policy-helpers');
const { parseFrontmatter } = require('../lib/claude-route-probe');
const { checkWorkflowSyntax } = require('../lib/workflow-syntax-check');

const root = path.resolve(__dirname, '..');
const scriptPath = 'adapters/claude-code/workflows/deliver-controlled.js';
const script = () => readUtf8(root, scriptPath);

const markedBlock = (text, file) => {
  const start = text.indexOf('// BEGIN plan-rules');
  const end = text.indexOf('// END plan-rules');
  assert.ok(start >= 0 && end > start, `${file} has the plan-rules markers`);
  return text.slice(start, end);
};

test('the workflow script parses as the Workflow sandbox would run it', () => {
  const result = checkWorkflowSyntax(script());
  assert.equal(result.ok, true, result.stderr);
  const broken = checkWorkflowSyntax(script().replace('phase(\'Plan\')', 'phase(\'Plan\'')) ;
  assert.equal(broken.ok, false, 'a syntax error is detected');
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
  assert.ok(text.includes('git diff --no-color --no-ext-diff'));
  assert.ok(text.includes('git ls-files --others --exclude-standard -z'));
});
