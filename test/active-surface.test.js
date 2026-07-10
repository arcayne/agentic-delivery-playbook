'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const {
  lineCount,
  readUtf8,
  findForbiddenTerms,
} = require('../lib/policy-helpers');

const root = path.resolve(__dirname, '..');
const activePolicyFiles = [
  'playbook.md',
  'profiles/gpt-5.6.md',
  'adapters/codex/AGENTS.md',
  'adapters/chatgpt/instructions.md',
];

test('active policy contains no retired model matrix', () => {
  const files = new Map(activePolicyFiles.map((file) => [file, readUtf8(root, file)]));
  const matches = findForbiddenTerms(files, [
    /DeepSeek/i,
    /Hermes/i,
    /GPT-5\.[2-5]/i,
    /Pi-native/i,
  ]);
  assert.deepEqual(matches, []);
});

test('active policy respects its line budgets', () => {
  const budgets = new Map([
    ['playbook.md', 150],
    ['profiles/gpt-5.6.md', 120],
    ['adapters/codex/AGENTS.md', 180],
    ['templates/run.json', 120],
  ]);
  for (const [file, budget] of budgets) {
    assert.ok(lineCount(readUtf8(root, file)) <= budget, `${file} exceeds ${budget} lines`);
  }
});

test('retired provider adapters are legacy-only', () => {
  assert.throws(() => readUtf8(root, 'adapters/pi/SKILL.md'), /ENOENT/);
  assert.throws(() => readUtf8(root, 'adapters/claude/SKILL.md'), /ENOENT/);
  assert.match(readUtf8(root, 'legacy/README.md'), /unsupported/i);
});

test('CLI exposes active artifacts without mutating the target project', () => {
  const result = spawnSync(
    process.execPath,
    ['bin/agentic-delivery-playbook.js', 'show', 'profile'],
    { cwd: root, encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /^# GPT-5\.6 routing profile/m);
});

test('the breaking package release excludes legacy material', () => {
  const manifest = JSON.parse(readUtf8(root, 'package.json'));
  assert.equal(manifest.version, '0.3.0');
  assert.equal(manifest.files.includes('legacy'), false);
  assert.equal(manifest.files.includes('test'), false);
});
