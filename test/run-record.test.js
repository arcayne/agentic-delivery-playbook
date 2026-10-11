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
  assert.equal(run.schemaVersion, '1.1');
  assert.deepEqual(run.brief, { path: null, inception: null });
  assert.deepEqual(run.workflow, { mode: null, scriptPath: null, runs: [] });
  assert.equal(run.lanes[0].requested.agentType, null);
  assert.equal(run.closeout.goalFit, null);
  assert.ok(Array.isArray(run.lanes));
  assert.ok(Array.isArray(run.validation));
  assert.ok(Array.isArray(run.acceptance));
  assert.ok(run.contract.path);
  assert.ok(run.source.baseCommit);
  assert.equal(run.lanes[0].requested.model, 'gpt-6-luna');
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

test('the controlled example carries the 1.1 fields as null and keeps its GPT-6 lanes', () => {
  const run = JSON.parse(readUtf8(root, 'examples/controlled-run/run.json'));
  assert.equal(run.schemaVersion, '1.1');
  assert.deepEqual(run.brief, { path: null, inception: null });
  assert.deepEqual(run.workflow, { mode: null, scriptPath: null, runs: [] });
  for (const lane of run.lanes) assert.equal(lane.requested.agentType, null);
  assert.equal(run.closeout.goalFit, null);
  assert.equal(run.lanes[0].requested.model, 'gpt-6-luna');
});
