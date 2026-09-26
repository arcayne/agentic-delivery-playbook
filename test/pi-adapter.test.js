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

test('Pi skill has the non-colliding name and resolves all packaged references', () => {
  const skillPath = 'adapters/pi/SKILL.md';
  const skill = read(skillPath);
  const frontmatter = skill.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(frontmatter, 'skill has YAML frontmatter');
  assert.match(frontmatter[1], /^name: agentic-delivery-playbook-pi$/m);
  assert.doesNotMatch(frontmatter[1], /^name: agentic-delivery-playbook$/m);

  const manifest = JSON.parse(read('package.json'));
  for (const reference of localMarkdownTargets(skill)) {
    const resolved = path.resolve(path.dirname(path.join(root, skillPath)), reference);
    assert.ok(resolved.startsWith(`${root}${path.sep}`), `${reference} stays within package`);
    assert.ok(fs.existsSync(resolved), `${reference} exists when extracted`);
    const relative = path.relative(root, resolved).split(path.sep).join('/');
    assert.ok(manifest.files.some((entry) => relative === entry || relative.startsWith(`${entry}/`)),
      `${relative} is included in npm package`);
  }
  assert.match(skill, /Pi is a supported skill-package surface, not proof of any particular runtime capability/);
});

test('optional Pi settings template declares the documented role routes', () => {
  const settings = JSON.parse(read('templates/pi-settings.template.json'));
  assert.deepEqual(settings.subagents.agentOverrides.worker, {
    model: 'openai-codex/gpt-6-luna',
    thinking: 'high',
  });
  assert.deepEqual(settings.subagents.agentOverrides.reviewer, {
    model: 'openai-codex/gpt-6-sol',
    thinking: 'medium',
  });
});
