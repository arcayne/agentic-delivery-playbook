#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const skillName = 'agentic-delivery-playbook';

function usage(exitCode = 0) {
  const out = exitCode === 0 ? console.log : console.error;
  out(`Agentic Delivery Playbook

Usage:
  agentic-delivery-playbook install claude [--user|--project] [--force]
  agentic-delivery-playbook install-claude-skill [--user|--project] [--force]

Options:
  --user       Install to ~/.claude/skills/${skillName} (default)
  --project    Install to ./.claude/skills/${skillName}
  --force      Replace an existing installed skill
  -h, --help   Show this help

Examples:
  npx agentic-delivery-playbook install claude
  npx agentic-delivery-playbook install claude --project
  npx github:arcayne/agentic-delivery-playbook install claude --force
`);
  process.exit(exitCode);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function installClaudeSkill(args) {
  const project = args.includes('--project');
  const user = args.includes('--user');
  const force = args.includes('--force');

  if (project && user) {
    console.error('Choose only one install target: --user or --project.');
    process.exit(1);
  }

  const source = path.join(repoRoot, 'adapters', 'claude');
  if (!fs.existsSync(path.join(source, 'SKILL.md'))) {
    console.error(`Claude skill source not found: ${source}`);
    process.exit(1);
  }

  const targetRoot = project
    ? path.resolve(process.cwd(), '.claude', 'skills')
    : path.join(os.homedir(), '.claude', 'skills');
  const target = path.join(targetRoot, skillName);

  if (fs.existsSync(target)) {
    if (!force) {
      console.error(`Skill already exists: ${target}`);
      console.error('Re-run with --force to replace it.');
      process.exit(1);
    }
    fs.rmSync(target, { recursive: true, force: true });
  }

  copyDir(source, target);

  console.log(`Installed Claude skill: ${target}`);
  console.log(`Invoke it as: /${skillName}`);
}

const args = process.argv.slice(2);
if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
  usage(args.length === 0 ? 1 : 0);
}

const [command, subcommand, ...rest] = args;
if (command === 'install' && subcommand === 'claude') {
  installClaudeSkill(rest);
} else if (command === 'install-claude-skill') {
  installClaudeSkill([subcommand, ...rest].filter(Boolean));
} else {
  usage(1);
}
