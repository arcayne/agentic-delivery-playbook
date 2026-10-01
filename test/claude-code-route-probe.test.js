'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const { probeClaude } = require('../lib/claude-route-probe');

const root = path.resolve(__dirname, '..');
const fixtures = path.join(__dirname, 'fixtures', 'claude-code');
const session = path.join(fixtures, 'session-1.jsonl');
const agentsDir = path.join(fixtures, 'agents');
const cli = (...args) => spawnSync(process.execPath, ['bin/agentic-delivery-playbook.js', ...args], {
  cwd: root,
  encoding: 'utf8',
});

test('probe reports observed main-session route and skips synthetic and malformed lines', () => {
  const report = probeClaude(session, { agentsDir });
  assert.deepEqual(report.main.observed, [
    { model: 'claude-opus-5-5', effort: 'medium', entrypoint: 'cli', count: 2 },
  ]);
});

test('probe reads requested routes from agent definitions, including namespaced agents', () => {
  const report = probeClaude(session, { agentsDir });
  const byId = Object.fromEntries(report.subagents.map((agent) => [agent.agentId, agent]));
  assert.deepEqual(byId.aaa.requested, {
    model: 'claude-sonnet-5-5',
    effort: 'medium',
    source: 'definition',
    definitionPath: 'adp-worker.md',
  });
  assert.equal(byId.aaa.observed[0].model, 'claude-sonnet-5-5');
  assert.equal(byId.aaa.spawnDepth, 1);
  assert.deepEqual(byId.bbb.requested, {
    model: 'claude-opus-5-5',
    effort: 'medium',
    source: 'definition',
    definitionPath: 'adp-reviewer.md',
  });
  assert.equal(byId.bbb.agentType, 'agentic-delivery-playbook:adp-reviewer');
});

test('probe prefers per-invocation model and reports unknown effort without inference', () => {
  const report = probeClaude(session, { agentsDir });
  const agent = report.subagents.find((entry) => entry.agentId === 'ccc');
  assert.deepEqual(agent.requested, {
    model: 'haiku',
    effort: 'unknown',
    source: 'invocation',
    definitionPath: null,
  });
  assert.equal(agent.observed[0].effort, 'unknown');
});

test('probe does not match foreign namespaces and tolerates missing or malformed meta', () => {
  const report = probeClaude(session, { agentsDir });
  const byId = Object.fromEntries(report.subagents.map((agent) => [agent.agentId, agent]));
  assert.deepEqual(byId.ddd.requested, {
    model: 'unknown',
    effort: 'unknown',
    source: 'unmatched',
    definitionPath: null,
  });
  assert.equal(byId.eee.agentType, 'unknown');
  assert.equal(byId.eee.requested.source, 'unmatched');
  assert.equal(byId.fff.agentType, 'adp-worker');
  assert.equal(byId.fff.requested.source, 'definition');
  assert.equal(report.agentsDir, path.relative(process.cwd(), agentsDir));
});

test('probe defaults to the packaged agent definitions', () => {
  const report = probeClaude(session);
  const worker = report.subagents.find((entry) => entry.agentId === 'aaa');
  assert.equal(worker.requested.model, 'claude-sonnet-5-5');
});

test('CLI probe prints JSON and show is unchanged', () => {
  const probe = cli('probe', 'claude', session, '--agents-dir', agentsDir);
  assert.equal(probe.status, 0, probe.stderr);
  assert.equal(JSON.parse(probe.stdout).subagents.length, 6);
  const show = cli('show', 'profile');
  assert.equal(show.status, 0, show.stderr);
  assert.match(show.stdout, /^# GPT-6 routing profile/m);
});

test('CLI probe rejects bad input with usage and a nonzero exit', () => {
  for (const args of [
    ['probe'],
    ['probe', 'claude'],
    ['probe', 'other', session],
    ['probe', 'claude', path.join(fixtures, 'missing.jsonl')],
    ['probe', 'claude', session, '--agents-dir'],
    ['probe', 'claude', session, '--agents-dir', path.join(fixtures, 'nope')],
    ['probe', 'claude', session, '--bogus'],
  ]) {
    const result = cli(...args);
    assert.notEqual(result.status, 0, args.join(' '));
    assert.match(result.stderr, /Usage:/);
  }
});

test('probe warns on stderr and emits agentsDir null when the default agents dir is missing', () => {
  const { spawnSync: spawn } = require('node:child_process');
  const script = `
    const fs = require('node:fs');
    fs.existsSync = ((orig) => (p) => (String(p).endsWith('adapters/claude-code/agents') ? false : orig(p)))(fs.existsSync);
    const { probeClaude } = require(${JSON.stringify(path.join(root, 'lib/claude-route-probe'))});
    console.log(JSON.stringify(probeClaude(${JSON.stringify(session)})));
  `;
  const result = spawn(process.execPath, ['-e', script], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stderr, /warning: agents directory not found/);
  const report = JSON.parse(result.stdout);
  assert.equal(report.agentsDir, null);
  assert.equal(report.subagents.find((a) => a.agentId === 'aaa').requested.source, 'unmatched');
});

test('probe output never contains raw absolute home-directory paths', () => {
  const os = require('node:os');
  const strings = [];
  const collect = (value) => {
    if (typeof value === 'string') strings.push(value);
    else if (value && typeof value === 'object') Object.values(value).forEach(collect);
  };
  collect(probeClaude(session, { agentsDir }));
  collect(probeClaude(session));
  const outside = path.join(os.homedir(), 'nonexistent-adp-agents');
  assert.throws(() => probeClaude(session, { agentsDir: outside }), (error) => {
    strings.push(error.message);
    return true;
  });
  assert.ok(strings.length > 0);
  for (const value of strings) {
    for (const prefix of ['/Users/', '/home/', os.homedir()]) {
      assert.ok(!value.startsWith(prefix), `${value} starts with ${prefix}`);
    }
  }
  assert.ok(strings.some((value) => value.includes('~/')), 'home paths are shown with ~');
});
