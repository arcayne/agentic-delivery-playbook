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
