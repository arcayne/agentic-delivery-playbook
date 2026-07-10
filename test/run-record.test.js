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
