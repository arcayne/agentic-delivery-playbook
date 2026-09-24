'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { lineCount, readUtf8 } = require('../lib/policy-helpers');

const root = path.resolve(__dirname, '..');

test('the maintained profile contains only the GPT-6 family', () => {
  const profile = readUtf8(root, 'profiles/gpt-6.md');
  assert.match(profile, /Profile version: 1\.0/);
  assert.match(profile, /Verified: 2026-09-24/);
  assert.match(profile, /developers\.openai\.com\/codex\/models/);
  for (const model of ['gpt-6-luna', 'gpt-6-sol', 'gpt-6-astra']) {
    assert.match(profile, new RegExp(model.replaceAll('.', '\\.'), 'i'));
  }
  assert.match(profile, /Quick mechanical, objectively checked work \| `gpt-6-luna` \| low \| single/);
  assert.match(profile, /Normal focused implementation work \| `gpt-6-luna` \| high \| single/);
  assert.match(profile, /Difficult tasks that warrant more depth \| `gpt-6-luna` \| xhigh \(Codex, where supported\)/);
  assert.match(profile, /Sol Max is available for the hardest problems/i);
  assert.match(profile, /ChatGPT Work, Pi, or another client/);
  assert.match(profile, /Luna xhigh is optional and conditional/i);
  assert.match(profile, /GPT-5\.6 may be used as an explicitly named fallback/i);
  assert.doesNotMatch(profile, /gpt-6-terra/i);
  assert.doesNotMatch(profile, /DeepSeek|Hermes|GPT-5\.[2-5]/i);
  assert.ok(lineCount(profile) <= 120, `profile has ${lineCount(profile)} lines`);
});

test('Codex defaults to Luna high with bounded delegation', () => {
  const config = readUtf8(root, 'profiles/codex/config.toml');
  assert.match(config, /model = "gpt-6-luna"/);
  assert.match(config, /model_reasoning_effort = "high"/);
  assert.match(config, /max_depth = 1/);
  assert.match(config, /max_threads = 4/);
});

test('Codex README default matches the configured model and effort', () => {
  const config = readUtf8(root, 'profiles/codex/config.toml');
  const readme = readUtf8(root, 'adapters/codex/README.md');
  const model = config.match(/^model = "([^"]+)"$/m)?.[1];
  const effort = config.match(/^model_reasoning_effort = "([^"]+)"$/m)?.[1];

  assert.ok(model, 'Codex config defines a default model');
  assert.ok(effort, 'Codex config defines a default reasoning effort');
  assert.ok(readme.includes(`\`${model}\``), 'README states the configured default model');
  assert.ok(readme.includes(`\`${effort}\` reasoning effort`), 'README states the configured reasoning effort');
});

test('project agents map mechanical, work, and review lanes explicitly', () => {
  const expected = new Map([
    ['mechanical-worker.toml', ['gpt-6-luna', 'low', 'workspace-write']],
    ['explorer.toml', ['gpt-6-luna', 'low', 'read-only']],
    ['worker.toml', ['gpt-6-luna', 'high', 'workspace-write']],
    ['reviewer.toml', ['gpt-6-sol', 'high', 'read-only']],
    ['escalation-reviewer.toml', ['gpt-6-sol', 'max', 'read-only']],
  ]);

  for (const [file, values] of expected) {
    const text = readUtf8(root, `profiles/codex/agents/${file}`);
    for (const value of values) assert.match(text, new RegExp(value.replaceAll('.', '\\.')));
  }
});
