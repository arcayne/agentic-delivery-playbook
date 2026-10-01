'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { lineCount, readUtf8 } = require('../lib/policy-helpers');
const { parseFrontmatter } = require('../lib/claude-route-probe');

const root = path.resolve(__dirname, '..');
const walk = (dir) => fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((entry) => {
  const rel = `${dir}/${entry.name}`;
  return entry.isDirectory() ? walk(rel) : [rel];
});
const json = (file) => JSON.parse(readUtf8(root, file));
const frontmatter = (file) => parseFrontmatter(readUtf8(root, file));

test('plugin manifest paths resolve inside the repository', () => {
  const plugin = json('.claude-plugin/plugin.json');
  assert.equal(plugin.name, 'agentic-delivery-playbook');
  assert.equal(plugin.version, '0.3.0');
  for (const target of [].concat(plugin.skills, plugin.agents)) {
    assert.match(target, /^\.\//);
    const resolved = path.resolve(root, target);
    assert.ok(resolved.startsWith(`${root}${path.sep}`), `${target} stays within plugin`);
    assert.ok(fs.existsSync(resolved), `${target} exists`);
  }
  for (const agent of plugin.agents) assert.match(agent, /\.md$/);
  assert.ok(fs.existsSync(path.join(root, plugin.skills[0], 'deliver', 'SKILL.md')));
});

test('marketplace lists the plugin at the repository root', () => {
  const marketplace = json('.claude-plugin/marketplace.json');
  assert.equal(marketplace.owner.name, 'arcayne');
  assert.equal(marketplace.plugins.length, 1);
  assert.equal(marketplace.plugins[0].name, json('.claude-plugin/plugin.json').name);
  assert.equal(marketplace.plugins[0].source, './');
});

test('agents use full model IDs and the contracted efforts and tools', () => {
  const worker = frontmatter('adapters/claude-code/agents/adp-worker.md');
  const reviewer = frontmatter('adapters/claude-code/agents/adp-reviewer.md');
  const explorer = frontmatter('adapters/claude-code/agents/adp-explorer.md');
  assert.deepEqual([worker.name, worker.model, worker.effort], ['adp-worker', 'claude-sonnet-5-5', 'medium']);
  assert.deepEqual([reviewer.name, reviewer.model, reviewer.effort], ['adp-reviewer', 'claude-opus-5-5', 'medium']);
  assert.deepEqual([explorer.name, explorer.model, explorer.effort], ['adp-explorer', 'claude-sonnet-5-5', 'low']);
  const workerHigh = frontmatter('adapters/claude-code/agents/adp-worker-high.md');
  const reviewerHigh = frontmatter('adapters/claude-code/agents/adp-reviewer-high.md');
  assert.deepEqual([workerHigh.name, workerHigh.model, workerHigh.effort], ['adp-worker-high', 'claude-sonnet-5-5', 'high']);
  assert.equal(workerHigh.tools, worker.tools);
  assert.deepEqual([reviewerHigh.name, reviewerHigh.model, reviewerHigh.effort], ['adp-reviewer-high', 'claude-opus-5-5', 'high']);
  assert.equal(reviewerHigh.tools, reviewer.tools);
  assert.equal(reviewerHigh.disallowedTools, reviewer.disallowedTools);
  assert.match(worker.tools, /\bEdit\b/);
  assert.match(worker.tools, /\bWrite\b/);
  assert.equal(reviewer.disallowedTools, 'Edit, Write, NotebookEdit');
  assert.doesNotMatch(reviewer.tools, /\b(?:Edit|Write|NotebookEdit)\b/);
  assert.doesNotMatch(explorer.tools, /\b(?:Edit|Write|NotebookEdit|Bash)\b/);
});

test('the deliver skill is explicit-invoke and translates the same two-mode kernel', () => {
  const file = 'adapters/claude-code/skills/deliver/SKILL.md';
  const text = readUtf8(root, file);
  const meta = frontmatter(file);
  assert.equal(meta.name, 'deliver');
  assert.equal(meta['disable-model-invocation'], 'true');
  assert.match(text, /Direct/);
  assert.match(text, /Controlled/);
  assert.match(text, /contract/i);
  assert.match(text, /actual diff/i);
  assert.match(text, /validation evidence/i);
  assert.match(text, /profiles\/claude-5\.md/);
  assert.match(text, /sole writer/i);
  assert.match(text, /preflight/i);
  assert.match(text, /one orchestration plane/i);
  assert.match(text, /depth one/i);
  assert.match(text, /serialized/i);
  assert.doesNotMatch(text, /\b(?:Lightweight|Full) mode\b/i);
  assert.ok(lineCount(text) <= 80, `skill has ${lineCount(text)} lines`);
});

test('skill references to packaged files resolve', () => {
  const text = readUtf8(root, 'adapters/claude-code/skills/deliver/SKILL.md');
  const refs = [...text.matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/([\w./-]+?)(?=[`.,\s)]*(?:[\s`]|$))/g)].map((m) => m[1].replace(/\.$/, ''));
  assert.ok(refs.length >= 3);
  for (const ref of refs) assert.ok(fs.existsSync(path.join(root, ref)), `${ref} exists`);
});

test('the Claude 5 profile holds routes, escalation, and attestation caveats', () => {
  const text = readUtf8(root, 'profiles/claude-5.md');
  for (const term of ['claude-opus-5-5', 'claude-sonnet-5-5', 'adp-worker', 'adp-reviewer', 'adp-explorer']) {
    assert.ok(text.includes(term), term);
  }
  assert.match(text, /Escalation/);
  assert.match(text, /requested.*configured.*observed/is);
  assert.match(text, /alias drift/i);
  assert.match(text, /not attestation/i);
  assert.match(text, /Depth: one/);
  assert.ok(lineCount(text) <= 120);
});

test('the settings template sets the orchestrator route and the README documents install', () => {
  assert.deepEqual(json('templates/claude-settings.template.json'), {
    model: 'claude-opus-5-5',
    effortLevel: 'medium',
  });
  const readme = readUtf8(root, 'adapters/claude-code/README.md');
  assert.match(readme, /\/plugin marketplace add arcayne\/agentic-delivery-playbook/);
  assert.match(readme, /\/plugin install/);
  assert.match(readme, /never auto-applied/);
  assert.match(readme, /Known gaps/);
});

test('the reviewer read-only disclosure and fingerprint rule are stated plainly', () => {
  const disclosure = /read-only by instruction; Bash is available for diff and checks/;
  for (const file of [
    'adapters/claude-code/README.md',
    'profiles/claude-5.md',
    'adapters/claude-code/agents/adp-reviewer.md',
    'adapters/claude-code/agents/adp-reviewer-high.md',
    'adapters/claude-code/skills/deliver/SKILL.md',
  ]) {
    assert.match(readUtf8(root, file), disclosure, file);
  }
  const skill = readUtf8(root, 'adapters/claude-code/skills/deliver/SKILL.md');
  assert.match(skill, /GIT_INDEX_FILE/);
  assert.match(skill, /git rev-parse HEAD/);
  assert.match(skill, /\$\{CLAUDE_PLUGIN_ROOT\}\/bin\/agentic-delivery-playbook\.js/);
  assert.match(skill, /~\/\.claude\/projects\//);
  assert.match(skill, /git rev-parse --git-path index/);
  assert.match(skill, /Gitignored files are not covered/);
  assert.doesNotMatch(readUtf8(root, 'adapters/claude-code/README.md'), /```[^`]*CLAUDE_PLUGIN_ROOT/);
  assert.doesNotMatch(readUtf8(root, 'profiles/claude-5.md'), /probe claude/);
  const plugin = json('.claude-plugin/plugin.json');
  for (const name of ['adp-worker-high', 'adp-reviewer-high']) {
    assert.ok(plugin.agents.includes(`./adapters/claude-code/agents/${name}.md`));
  }
  assert.equal('version' in json('.claude-plugin/marketplace.json').plugins[0], false);
});

test('active Claude Code files have no personal absolute paths', () => {
  for (const file of [
    'adapters/claude-code/README.md',
    'adapters/claude-code/skills/deliver/SKILL.md',
    'profiles/claude-5.md',
    'templates/claude-settings.template.json',
    'lib/claude-route-probe.js',
    '.claude-plugin/plugin.json',
    '.claude-plugin/marketplace.json',
    ...walk('adapters/claude-code/agents'),
    ...walk('test/fixtures/claude-code'),
  ]) {
    assert.doesNotMatch(readUtf8(root, file), /\/Users\/|\/home\/|C:\\Users/);
  }
});
