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

test('R1 and R2 guard malformed input instead of throwing', () => {
  assert.equal(validatePlan(plan([null]), lanes, nonGoalFiles).reason, 'plan-rule-R1');
  assert.equal(validatePlan(plan([task({ ownedFiles: 'src/a.js' })]), lanes, nonGoalFiles).reason, 'plan-rule-R2');
  assert.equal(validatePlan(plan([task({ ownedFiles: [42] })]), lanes, nonGoalFiles).reason, 'plan-rule-R2');
  assert.equal(validatePlan(plan([task({ dependsOn: 'a' })]), lanes, nonGoalFiles).reason, 'plan-rule-R2');
});

test('R2: empty ownedFiles, glob or unsafe paths, missing command, non-integer expectedExit are rejected', () => {
  assert.equal(validatePlan(plan([task({ ownedFiles: [] })]), lanes, nonGoalFiles).reason, 'plan-rule-R2');
  assert.equal(validatePlan(plan([task({ ownedFiles: ['src/**'] })]), lanes, nonGoalFiles).reason, 'plan-rule-R2', 'task paths are concrete');
  assert.equal(validatePlan(plan([task({ ownedFiles: ['/src/a.js'] })]), lanes, nonGoalFiles).reason, 'plan-rule-R2', 'no absolute paths');
  assert.equal(validatePlan(plan([task({ ownedFiles: ['src/../lib/a.js'] })]), lanes, nonGoalFiles).reason, 'plan-rule-R2', 'no dot segments');
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
