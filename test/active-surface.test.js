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

test('public docs describe the maintained surface honestly', () => {
  const readme = readUtf8(root, 'README.md');
  assert.match(readme, /Direct and Controlled/);
  assert.match(readme, /GPT-5\.6 Sol, Terra, and Luna/);
  assert.match(readme, /Codex and ChatGPT Work/);
  assert.match(readme, /docs\/evaluation\.md/);
  assert.doesNotMatch(readme, /Pi-first|Direct.*Lightweight.*Full/is);

  const evaluation = readUtf8(root, 'docs/evaluation.md');
  for (const arm of [
    'Sol medium without the playbook',
    'Sol medium with the simplified kernel',
    'Routed GPT-5.6 family with the simplified kernel',
    'Sol Ultra high-compute comparison',
  ]) {
    assert.match(evaluation, new RegExp(arm, 'i'));
  }
});

test('repository contribution and support metadata matches 0.3', () => {
  const security = readUtf8(root, 'SECURITY.md');
  const contributing = readUtf8(root, 'CONTRIBUTING.md');
  const pullRequest = readUtf8(root, '.github/pull_request_template.md');
  assert.match(security, /\| 0\.3\.x \| Yes \|/);
  assert.match(security, /\| 0\.2\.x and earlier \| No \|/);
  assert.match(contributing, /Direct and Controlled/);
  assert.match(contributing, /GPT-5\.6/);
  assert.match(pullRequest, /Direct and Controlled/);
  assert.match(pullRequest, /active profile/i);
});

test('local links in the maintained public docs resolve', () => {
  const publicDocs = [
    'README.md',
    'BUSINESS-CONTEXT.md',
    'playbook.md',
    'profiles/gpt-5.6.md',
    'adapters/codex/README.md',
    'adapters/chatgpt/README.md',
    'docs/getting-started.md',
    'docs/adapters.md',
    'docs/business-assumptions.md',
    'docs/evaluation.md',
    'docs/publishing.md',
    'examples/README.md',
  ];
  const linkPattern = /!?\[[^\]]*\]\(([^)]+)\)/g;

  for (const file of publicDocs) {
    const sourcePath = path.join(root, file);
    for (const match of fs.readFileSync(sourcePath, 'utf8').matchAll(linkPattern)) {
      const rawTarget = match[1].trim().replace(/^<|>$/g, '');
      if (/^(?:https?:|mailto:|#)/.test(rawTarget)) continue;
      const localTarget = decodeURI(rawTarget.split('#')[0]);
      const resolved = path.resolve(path.dirname(sourcePath), localTarget);
      assert.ok(fs.existsSync(resolved), `${file}: broken local link ${rawTarget}`);
    }
  }
});

test('controlled guidance matches the active example and migration mapping', () => {
  const readme = readUtf8(root, 'README.md');
  const gettingStarted = readUtf8(root, 'docs/getting-started.md');
  const run = JSON.parse(readUtf8(root, 'examples/controlled-run/run.json'));
  const changelog = readUtf8(root, 'CHANGELOG.md');

  assert.match(readme, /\|\s*Terra\s*\|[^\n]*\bdefault\b/i);
  assert.match(gettingStarted, /Route the bounded implementation to Terra high\./);
  assert.match(gettingStarted, /Sol high in a fresh context to review/);

  const implementation = run.lanes.find((lane) => lane.id === 'implementation');
  const review = run.lanes.find((lane) => lane.id === 'fresh-context-review');
  assert.equal(implementation.requested.model, 'gpt-5.6-terra');
  assert.equal(implementation.requested.effort, 'high');
  assert.equal(review.requested.model, 'gpt-5.6-sol');
  assert.equal(review.requested.effort, 'high');

  assert.match(
    changelog,
    /Direct\/Lightweight\/Full\s+is\s+replaced\s+by\s+Direct\/Controlled/i,
  );
});
