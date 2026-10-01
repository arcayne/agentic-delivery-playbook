#!/usr/bin/env node
'use strict';

// Spike artifact: report requested vs observed Claude Code routes from session transcripts.
// Usage: node route-probe.js <path/to/<session-id>.jsonl>
// Reads <session>.jsonl and <session>/subagents/agent-*.{jsonl,meta.json}. Read-only.

const fs = require('node:fs');
const path = require('node:path');

function observed(file) {
  const routes = new Map();
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    let entry;
    try { entry = JSON.parse(line); } catch { continue; }
    const model = entry.message && entry.message.model;
    if (!model || model === '<synthetic>') continue;
    const key = [model, entry.perTurnEffort ?? 'unknown', entry.entrypoint ?? 'unknown'].join(' | ');
    routes.set(key, (routes.get(key) || 0) + 1);
  }
  return Object.fromEntries(routes);
}

const sessionFile = process.argv[2];
if (!sessionFile || !fs.existsSync(sessionFile)) {
  console.error('Usage: node route-probe.js <path/to/<session-id>.jsonl>');
  process.exit(1);
}

const report = { session: path.basename(sessionFile), main: observed(sessionFile), subagents: [] };
const subDir = path.join(sessionFile.replace(/\.jsonl$/, ''), 'subagents');
if (fs.existsSync(subDir)) {
  for (const name of fs.readdirSync(subDir).filter((f) => f.endsWith('.jsonl'))) {
    const metaPath = path.join(subDir, name.replace(/\.jsonl$/, '.meta.json'));
    const meta = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, 'utf8')) : {};
    report.subagents.push({
      agentId: name.replace(/^agent-|\.jsonl$/g, ''),
      agentType: meta.agentType ?? 'unknown',
      requestedModel: meta.model ?? 'unknown',
      spawnDepth: meta.spawnDepth ?? 'unknown',
      observed: observed(path.join(subDir, name)),
    });
  }
}

console.log(JSON.stringify(report, null, 2));
