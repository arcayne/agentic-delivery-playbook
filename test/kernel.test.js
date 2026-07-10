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
