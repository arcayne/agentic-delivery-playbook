#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const targets = Object.freeze({
  codex: 'adapters/codex/AGENTS.md',
  chatgpt: 'adapters/chatgpt/instructions.md',
  profile: 'profiles/gpt-5.6.md',
  contract: 'templates/contract.md',
  run: 'templates/run.json',
});

function usage(exitCode = 0) {
  const output = exitCode === 0 ? console.log : console.error;
  output(`Agentic Delivery Playbook

Usage:
  agentic-delivery-playbook show <codex|chatgpt|profile|contract|run>
  agentic-delivery-playbook --help

The show command prints a maintained artifact to stdout. It never changes local or global configuration.`);
  process.exit(exitCode);
}

const args = process.argv.slice(2);
if (args.includes('-h') || args.includes('--help')) usage(0);
if (args.length !== 2 || args[0] !== 'show' || !targets[args[1]]) usage(1);

process.stdout.write(fs.readFileSync(path.join(repoRoot, targets[args[1]]), 'utf8'));
