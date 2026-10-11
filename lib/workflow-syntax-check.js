'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

// A Workflow script is an ES module whose body (after `export const meta`) runs inside an async
// function, so top-level await and return are valid there. Wrap it the same way before `node --check`.
function checkWorkflowSyntax(scriptText) {
  const metaStart = scriptText.indexOf('export const meta');
  const metaEnd = scriptText.indexOf('\n}\n', metaStart);
  if (metaStart < 0 || metaEnd < 0) return { ok: false, stderr: 'export const meta block not found' };
  const cut = metaEnd + 3;
  const wrapped = `${scriptText.slice(0, cut)}\nexport default async function run() {\n${scriptText.slice(cut)}\n}\n`;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'adp-workflow-check-'));
  try {
    const file = path.join(dir, 'deliver-controlled.mjs');
    fs.writeFileSync(file, wrapped);
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    return { ok: result.status === 0, stderr: result.stderr.trim() };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

module.exports = { checkWorkflowSyntax };
