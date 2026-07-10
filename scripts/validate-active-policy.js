#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  lineCount,
  readUtf8,
  findForbiddenTerms,
} = require('../lib/policy-helpers');

const root = path.resolve(__dirname, '..');
const active = [
  'playbook.md',
  'profiles/gpt-5.6.md',
  'adapters/codex/AGENTS.md',
  'adapters/chatgpt/instructions.md',
];
const budgets = new Map([
  ['playbook.md', 150],
  ['profiles/gpt-5.6.md', 120],
  ['adapters/codex/AGENTS.md', 180],
  ['templates/run.json', 120],
]);
const errors = [];

for (const [file, budget] of budgets) {
  const count = lineCount(readUtf8(root, file));
  if (count > budget) errors.push(`${file}: ${count} lines exceeds ${budget}`);
}

const files = new Map(active.map((file) => [file, readUtf8(root, file)]));
for (const match of findForbiddenTerms(files, [
  /DeepSeek/i,
  /Hermes/i,
  /GPT-5\.[2-5]/i,
  /Pi-native/i,
])) {
  errors.push(`${match.file}:${match.line}: retired active term ${match.term}`);
}

for (const file of ['templates/run.json']) {
  try {
    JSON.parse(readUtf8(root, file));
  } catch (error) {
    errors.push(`${file}: invalid JSON: ${error.message}`);
  }
}

for (const retired of ['adapters/pi', 'adapters/claude']) {
  if (fs.existsSync(path.join(root, retired))) errors.push(`${retired}: must be under legacy/`);
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('active policy validation passed');
}
