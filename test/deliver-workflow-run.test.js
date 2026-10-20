'use strict';

// Executes the Workflow script body against stubbed agents to check its control flow.
// The stub keeps a simulated working tree so validator fileStates and fingerprints stay consistent.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const scriptText = fs.readFileSync(path.resolve(__dirname, '..', 'adapters/claude-code/workflows/deliver-controlled.js'), 'utf8');
const metaStart = scriptText.indexOf('export const meta');
const body = scriptText.slice(scriptText.indexOf('\n}\n', metaStart) + 3);
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const runScript = new AsyncFunction('agent', 'phase', 'log', 'args', body);

const BASE = '0123456789abcdef0123456789abcdef01234567';
const SONNET = 'claude-sonnet-5-5';
const OPUS = 'claude-opus-5-5';
const WORKER = 'agentic-delivery-playbook:adp-worker';
const WORKER_HIGH = 'agentic-delivery-playbook:adp-worker-high';

const task = (id, file, dependsOn) => ({
  id, lane: 'src', title: `task ${id}`, ownedFiles: [file], instructions: 'do it', dependsOn,
  check: { command: `npm test -- ${id}`, expectedExit: 0 }, acceptanceCriteria: [`AC-${id}`],
});
const PLAN = { tasks: [task('1', 'src/a.js', []), task('2', 'src/b.js', ['1'])], assumptions: [], openQuestions: [] };
const ARGS = { contractPath: 'contract.md', briefPath: 'brief.md', baseCommit: BASE, lanes: [{ id: 'src', ownedFiles: ['src/**'] }] };

const workerResult = () => ({ changedFiles: [], commandsRun: [], assumptions: [], gaps: [], stopped: false, stopReason: '' });
const finding = (file) => ({ severity: 'high', acceptanceCriterion: 'AC', file, line: 1, summary: 'fix it' });
const review = (decision, findings = []) => ({ decision, findings, unprovenCriteria: [], diffSha256: 'sha' });

// scenario.on[label] overrides one call: a value, or a function (tree, opts) => value that may mutate the tree.
// scenario.exits[label] sets the check exit code of a `t<id>-validate-<n>` call (default 0).
async function simulate(args, scenario = {}) {
  const plan = scenario.plan || PLAN;
  const files = {};
  let version = 0;
  const tree = {
    write(file) { version += 1; files[file] = `blob${version}`; },
    snapshot(fields = {}) {
      return { head: BASE, fileStates: { ...files }, fingerprint: `tree${version}`, command: null, exitCode: null, outputExcerpt: '', ...fields };
    },
  };
  const calls = [];
  const agent = async (prompt, opts) => {
    const { label, agentType, model, effort } = opts;
    calls.push({ label, agentType, model, effort });
    const override = scenario.on && scenario.on[label];
    if (override !== undefined) return typeof override === 'function' ? override(tree, opts) : override;
    const role = agentType.replace('agentic-delivery-playbook:', '');
    if (role === 'adp-validator') {
      const check = label.match(/^t(.+)-validate-\d+$/);
      if (!check) return tree.snapshot();
      const exits = scenario.exits || {};
      return tree.snapshot({ command: plan.tasks.find((t) => t.id === check[1]).check.command, exitCode: label in exits ? exits[label] : 0 });
    }
    if (role === 'adp-lead') return plan;
    if (role === 'adp-worker' || role === 'adp-worker-high') {
      const id = label.match(/^t(.+)-implement-\d+$/)[1];
      tree.write(plan.tasks.find((t) => t.id === id).ownedFiles[0]);
      return workerResult();
    }
    if (role.startsWith('adp-reviewer')) return (scenario.reviews && scenario.reviews[label]) || review('accept');
    if (role === 'adp-goal-reviewer') return { verdict: 'fit', reasons: ['brief line 1'], usedDeliverable: true, howUsed: 'ran it' };
    throw new Error(`unexpected agent call ${label} ${agentType}`);
  };
  const result = await runScript(agent, () => {}, () => {}, args);
  return { result, calls, labels: calls.map((c) => c.label) };
}

const taskRecord = (result, id) => result.tasks.find((t) => t.id === id);

test('happy path with two dependent tasks completes with fifteen recorded calls', async () => {
  const { result, calls, labels } = await simulate(ARGS);
  assert.equal(result.status, 'completed');
  assert.equal(result.reason, null);
  assert.equal(result.goalFit.verdict, 'fit');
  assert.equal(result.review.finalDecision, 'accept');
  assert.equal(result.review.cycles.length, 1);
  assert.deepEqual(result.tasks.map((t) => [t.id, t.status, t.attempts.length]), [['1', 'passed', 1], ['2', 'passed', 1]]);
  assert.deepEqual(labels, [
    'plan-pre', 'plan', 'plan-post',
    't1-pre-1', 't1-implement-1', 't1-validate-1',
    't2-pre-1', 't2-implement-1', 't2-validate-1',
    'review-pre-1', 'review-1', 'review-post-1',
    'goal-fit-pre', 'goal-fit', 'goal-fit-post',
  ]);
  assert.equal(calls.length, 15);
  assert.deepEqual(result.requestedRoutes, calls);
  assert.deepEqual(taskRecord(result, '1').attempts[0].changedPaths, ['src/a.js']);
});

test('pauseAfterPlan returns plan-ready after the Plan agents, and resumePlan skips them', async () => {
  const paused = await simulate({ ...ARGS, pauseAfterPlan: true });
  assert.equal(paused.result.status, 'plan-ready');
  assert.deepEqual(paused.labels, ['plan-pre', 'plan', 'plan-post']);
  assert.deepEqual(paused.result.plan, PLAN);

  const resumed = await simulate({ ...ARGS, pauseAfterPlan: false, resumePlan: paused.result.plan });
  assert.equal(resumed.result.status, 'completed');
  assert.equal(resumed.labels.some((l) => l.startsWith('plan')), false);
  assert.equal(resumed.calls.length, 12);
  assert.deepEqual(resumed.result.requestedRoutes, resumed.calls);
});

test('a plan violating R6 is blocked before any Implement call', async () => {
  const plan = { ...PLAN, tasks: [task('1', 'src/a.js', []), task('2', 'src/a.js', ['1'])] };
  const { result, labels } = await simulate(ARGS, { plan });
  assert.equal(result.status, 'blocked');
  assert.equal(result.reason, 'plan-rule-R6');
  assert.match(result.detail, /src\/a\.js/);
  assert.deepEqual(labels, ['plan-pre', 'plan', 'plan-post']);
});

test('a worker edit outside task ownership escalates with the offending paths', async () => {
  const { result, labels } = await simulate(ARGS, {
    on: { 't1-implement-1': (tree) => { tree.write('src/a.js'); tree.write('src/c.js'); return workerResult(); } },
  });
  assert.equal(result.status, 'escalated');
  assert.equal(result.reason, 'ownership');
  assert.deepEqual(result.detail, ['src/c.js']);
  assert.equal(taskRecord(result, '1').status, 'blocked');
  assert.equal(taskRecord(result, '2').status, 'pending');
  assert.equal(labels[labels.length - 1], 't1-validate-1');
});

test('a check failing three times climbs the worker ladder and escalates', async () => {
  const { result } = await simulate(ARGS, { exits: { 't1-validate-1': 1, 't1-validate-2': 1, 't1-validate-3': 1 } });
  assert.equal(result.status, 'escalated');
  assert.equal(result.reason, 'fix-cycles-exhausted');
  assert.equal(result.detail, '1');
  const attempts = taskRecord(result, '1').attempts;
  assert.equal(taskRecord(result, '1').status, 'blocked');
  assert.deepEqual(attempts.map((x) => x.effort), ['medium', 'high', 'high']);
  assert.deepEqual(attempts.map((x) => x.model), [SONNET, SONNET, OPUS]);
  assert.deepEqual(attempts.map((x) => x.agentType), [WORKER, WORKER_HIGH, WORKER]);
  assert.deepEqual(attempts.map((x) => x.passed), [false, false, false]);
});

test('accept-with-fixes on t1 reruns t1 one rung up, then accept completes', async () => {
  const { result } = await simulate(ARGS, { reviews: { 'review-1': review('accept-with-fixes', [finding('src/a.js')]) } });
  assert.equal(result.status, 'completed');
  assert.equal(result.review.finalDecision, 'accept');
  assert.deepEqual(result.review.cycles.map((c) => c.decision), ['accept-with-fixes', 'accept']);
  const attempts = taskRecord(result, '1').attempts;
  assert.equal(attempts.length, 2);
  assert.equal(attempts[1].agentType, WORKER_HIGH);
  assert.equal(attempts[1].label, 't1-implement-2');
  assert.equal(taskRecord(result, '2').attempts.length, 1);
});

test('review fixes run in dependency order', async () => {
  const { result, labels } = await simulate(ARGS, {
    reviews: { 'review-1': review('accept-with-fixes', [finding('src/b.js'), finding('src/a.js')]) },
  });
  assert.equal(result.status, 'completed');
  assert.ok(labels.indexOf('t1-implement-2') < labels.indexOf('t2-implement-2'), 't1 is fixed before t2');
});

test('accept-with-fixes with no findings counts as accept after one cycle', async () => {
  const { result } = await simulate(ARGS, { reviews: { 'review-1': review('accept-with-fixes') } });
  assert.equal(result.status, 'completed');
  assert.equal(result.review.finalDecision, 'accept');
  assert.equal(result.review.cycles.length, 1);
});

test('a review fix on a task already at attempt 3 escalates review-fix-failed', async () => {
  const { result, labels } = await simulate(ARGS, {
    exits: { 't1-validate-1': 1, 't1-validate-2': 1 },
    reviews: { 'review-1': review('accept-with-fixes', [finding('src/a.js')]) },
  });
  assert.equal(result.status, 'escalated');
  assert.equal(result.reason, 'review-fix-failed');
  assert.equal(result.detail, '1');
  assert.equal(taskRecord(result, '1').status, 'blocked');
  assert.equal(taskRecord(result, '1').attempts.length, 3);
  assert.equal(labels.includes('t1-implement-4'), false);
});

test('a head that moved before the review or goal-fit gate escalates', async () => {
  const moved = (tree) => tree.snapshot({ head: 'elsewhere' });
  const reviewRun = await simulate(ARGS, { on: { 'review-pre-1': moved } });
  assert.equal(reviewRun.result.reason, 'review-gate-fingerprint');
  const fitRun = await simulate(ARGS, { on: { 'goal-fit-pre': moved } });
  assert.equal(fitRun.result.reason, 'goal-fit-gate-fingerprint');
  assert.equal(fitRun.result.goalFit.verdict, 'invalid');
});

test('a goal-fit reviewer that changes the tree invalidates the verdict', async () => {
  const { result } = await simulate(ARGS, {
    on: { 'goal-fit': (tree) => { tree.write('src/a.js'); return { verdict: 'fit', reasons: [], usedDeliverable: true, howUsed: '' }; } },
  });
  assert.equal(result.status, 'escalated');
  assert.equal(result.reason, 'goal-fit-gate-fingerprint');
  assert.equal(result.goalFit.verdict, 'invalid');
  assert.notEqual(result.goalFit.fingerprintBefore, result.goalFit.fingerprintAfter);
});

test('a null result from plan-pre escalates without further calls', async () => {
  const { result, labels } = await simulate(ARGS, { on: { 'plan-pre': null } });
  assert.equal(result.status, 'escalated');
  assert.equal(result.reason, 'agent-null:plan-pre');
  assert.deepEqual(labels, ['plan-pre']);
});

test('malformed args reject with an error naming the argument', async () => {
  await assert.rejects(simulate({ ...ARGS, nonGoalFiles: 'src/a.js' }), (err) => err.message.includes('args.nonGoalFiles'));
  const malformed = [
    [{ risk: 'urgent' }, 'args.risk'],
    [{ lanes: [{ ownedFiles: ['src/**'] }] }, 'args.lanes[0]'],
    [{ lanes: [{ id: 'src', ownedFiles: 'src/**' }] }, 'args.lanes[0]'],
    [{ goalReviewer: { model: null } }, 'args.goalReviewer'],
    [{ pauseAfterPlan: 'yes' }, 'args.pauseAfterPlan'],
    [{ resumePlan: [] }, 'args.resumePlan'],
    [{ workerLadder: 'workerHigh' }, 'args.workerLadder'],
    [{ workerLadder: ['nope'] }, 'args.workerLadder'],
    [{ workerLadder: ['worker', 'workerHigh', 'workerOpus', 'workerOpus'] }, 'args.workerLadder'],
    [{ baseCommit: '0123456' }, 'args.baseCommit must be a full commit hash'],
    [{ lanes: [{ id: 'src', ownedFiles: ['src/**'] }, { id: 'src', ownedFiles: ['test/**'] }] }, 'args.lanes has duplicate id src'],
  ];
  for (const [patch, name] of malformed) {
    await assert.rejects(simulate({ ...ARGS, ...patch }), (err) => err.message.includes(name), name);
  }
});

test('workerLadder overrides the attempt rungs and is recorded in requestedRoutes', async () => {
  const { result, calls } = await simulate(
    { ...ARGS, workerLadder: ['workerHigh', 'workerHigh', 'workerOpus'] },
    { exits: { 't1-validate-1': 1 } },
  );
  assert.equal(result.status, 'completed');
  const attempts = taskRecord(result, '1').attempts;
  assert.deepEqual(attempts.map((x) => x.agentType), [WORKER_HIGH, WORKER_HIGH]);
  assert.deepEqual(attempts.map((x) => x.effort), ['high', 'high']);
  assert.deepEqual(attempts.map((x) => x.model), [SONNET, SONNET]);
  assert.deepEqual(result.requestedRoutes, calls);
});

test('a one-rung workerLadder escalates after exactly one worker attempt', async () => {
  const { result, labels } = await simulate({ ...ARGS, workerLadder: ['worker'] }, { exits: { 't1-validate-1': 1 } });
  assert.equal(result.status, 'escalated');
  assert.equal(result.reason, 'fix-cycles-exhausted');
  assert.equal(taskRecord(result, '1').attempts.length, 1);
  assert.equal(labels.filter((l) => l.startsWith('t1-implement')).length, 1);
});
