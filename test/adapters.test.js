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
    assert.match(text, /profiles\/gpt-6\.md/);
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
  assert.match(text, /profiles\/gpt-6\.md/);
  assert.doesNotMatch(text, /docs\/(?:model-routing|dynamic-workflows)\.md/);
});
