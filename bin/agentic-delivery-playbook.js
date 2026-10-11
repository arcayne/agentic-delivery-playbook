#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const targets = Object.freeze({
  codex: 'adapters/codex/AGENTS.md',
  chatgpt: 'adapters/chatgpt/instructions.md',
  profile: 'profiles/gpt-6.md',
  contract: 'templates/contract.md',
  run: 'templates/run.json',
});

function usage(exitCode = 0) {
  const output = exitCode === 0 ? console.log : console.error;
  output(`Agentic Delivery Playbook

Usage:
  agentic-delivery-playbook show <codex|chatgpt|profile|contract|run>
  agentic-delivery-playbook probe claude <session.jsonl> [--agents-dir <dir>] [--requested <workflow-result.json>]...
  agentic-delivery-playbook --help

The show command prints a maintained artifact to stdout. The probe command reads a Claude Code session transcript and prints requested and observed routes as JSON. With --requested (repeatable, one per workflow run), the report includes a comparison of requested and observed routes. Neither changes local or global configuration.`);
  process.exit(exitCode);
}

const args = process.argv.slice(2);
if (args[0] === '-h' || args[0] === '--help') usage(0);

if (args[0] === 'probe') {
  const [, kind, sessionFile, ...rest] = args;
  if (kind !== 'claude' || !sessionFile) usage(1);
  let agentsDir;
  const requestedFiles = [];
  for (let i = 0; i < rest.length; i += 1) {
    if (rest[i] === '--agents-dir' && rest[i + 1] && agentsDir === undefined) agentsDir = rest[++i];
    else if (rest[i] === '--requested' && rest[i + 1]) requestedFiles.push(rest[++i]);
    else usage(1);
  }
  try {
    const { probeClaude, compareRoutes } = require('../lib/claude-route-probe');
    const report = probeClaude(sessionFile, { agentsDir });
    if (requestedFiles.length > 0) {
      const requested = requestedFiles.flatMap((file) => {
        if (!fs.existsSync(file)) throw new Error(`requested file not found: ${path.basename(file)}`);
        const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
        if (!Array.isArray(parsed.requestedRoutes)) throw new Error(`${path.basename(file)}: no requestedRoutes array`);
        return parsed.requestedRoutes;
      });
      report.comparison = compareRoutes(report, requested);
    }
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    console.error(`error: ${error.message}`);
    usage(1);
  }
} else {
  if (args.length !== 2 || args[0] !== 'show' || !targets[args[1]]) usage(1);
  process.stdout.write(fs.readFileSync(path.join(repoRoot, targets[args[1]]), 'utf8'));
}
