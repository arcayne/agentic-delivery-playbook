'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

function localMarkdownTargets(text) {
  return [...text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)]
    .map((match) => match[1].trim().replace(/^<|>$/g, '').split('#')[0])
    .filter((target) => target && !/^(?:https?:|mailto:|#)/.test(target));
}

test('Pi package declares and includes the skill resource', () => {
  const manifest = JSON.parse(read('package.json'));
  assert.deepEqual(manifest.pi.skills, ['./adapters/pi']);
  assert.ok(manifest.keywords.includes('pi-package'));
  assert.ok(manifest.files.includes('adapters/pi'));
  assert.ok(manifest.files.includes('playbook.md'));
  assert.ok(manifest.files.includes('profiles'));
  assert.ok(manifest.files.includes('templates'));
});

test('Pi skill uses the canonical product name and resolves all packaged references', () => {
  const skillPath = 'adapters/pi/SKILL.md';
  const skill = read(skillPath);
  const frontmatter = skill.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(frontmatter, 'skill has YAML frontmatter');
  assert.match(frontmatter[1], /^name: agentic-delivery-playbook$/m);
  assert.doesNotMatch(frontmatter[1], /^name: agentic-delivery-playbook-pi$/m);

  const manifest = JSON.parse(read('package.json'));
  for (const reference of localMarkdownTargets(skill)) {
    const resolved = path.resolve(path.dirname(path.join(root, skillPath)), reference);
    assert.ok(resolved.startsWith(`${root}${path.sep}`), `${reference} stays within package`);
    assert.ok(fs.existsSync(resolved), `${reference} exists when extracted`);
    const relative = path.relative(root, resolved).split(path.sep).join('/');
    assert.ok(manifest.files.some((entry) => relative === entry || relative.startsWith(`${entry}/`)),
      `${relative} is included in npm package`);
  }
  assert.match(skill, /A Pi package install makes this skill available; it does not set model, effort, worker, or reviewer defaults/);
  assert.match(read('docs/adapters.md'), /\/skill:agentic-delivery-playbook/);
  assert.match(skill, /Do not introduce a separate Pi-only process mode/);
  assert.match(skill, /Sol Medium parent owns planning, contract and task launch, sequencing, validation, synthesis, and continuation/);
  assert.match(skill, /Luna High worker is the sole writer for every implementation edit, including small edits/);
  assert.match(skill, /fresh-context Sol Medium reviewer is read-only and checks the actual diff and evidence/);
  assert.match(skill, /requested.*configured.*observed/s);
  assert.match(skill, /settings establish configuration capability, not route attestation/);
  assert.match(skill, /stop that affected lane and ask for approval; do not silently substitute/);
});

test('project Pi settings and optional template declare matching startup and role routes', () => {
  const project = JSON.parse(read('.pi/settings.json'));
  const template = JSON.parse(read('templates/pi-settings.template.json'));
  for (const settings of [project, template]) {
    assert.deepEqual({
      defaultProvider: settings.defaultProvider,
      defaultModel: settings.defaultModel,
      defaultThinkingLevel: settings.defaultThinkingLevel,
    }, {
      defaultProvider: 'openai-codex',
      defaultModel: 'gpt-6-sol',
      defaultThinkingLevel: 'medium',
    });
    assert.deepEqual(settings.subagents.agentOverrides.worker, {
      model: 'openai-codex/gpt-6-luna',
      thinking: 'high',
    });
    assert.deepEqual(settings.subagents.agentOverrides.reviewer, {
      model: 'openai-codex/gpt-6-sol',
      thinking: 'medium',
    });
  }
});
