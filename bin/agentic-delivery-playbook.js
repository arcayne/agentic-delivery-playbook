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
  agentic-delivery-playbook install pi [--user|--project] [--force]
  agentic-delivery-playbook install claude [--user|--project] [--force]
  agentic-delivery-playbook install-pi-skill [--user|--project] [--force]
  agentic-delivery-playbook install-claude-skill [--user|--project] [--force]

Options:
  --user       Install to the user skill directory (default)
  --project    Install to the current project's skill directory
  --force      Replace an existing installed skill
  -h, --help   Show this help

Targets:
  pi user       ~/.pi/agent/skills/${skillName}
  pi project    ./.pi/skills/${skillName}
  claude user   ~/.claude/skills/${skillName}
  claude project ./.claude/skills/${skillName}

Examples:
  npx agentic-delivery-playbook install pi
  npx agentic-delivery-playbook install pi --project
  npx agentic-delivery-playbook install claude
  npx github:arcayne/agentic-delivery-playbook install pi --force
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

function parseInstallOptions(args) {
  const project = args.includes('--project');
  const user = args.includes('--user');
  const force = args.includes('--force');

  if (project && user) {
    console.error('Choose only one install target: --user or --project.');
    process.exit(1);
  }

  return { project, force };
}

function installSkill({ adapter, label, commandHint, userRoot, projectRoot, args }) {
  const { project, force } = parseInstallOptions(args);
  const source = path.join(repoRoot, 'adapters', adapter);

  if (!fs.existsSync(path.join(source, 'SKILL.md'))) {
    console.error(`${label} skill source not found: ${source}`);
    process.exit(1);
  }

  const targetRoot = project ? path.resolve(process.cwd(), projectRoot) : userRoot;
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

  console.log(`Installed ${label} skill: ${target}`);
  console.log(`Invoke it as: ${commandHint}`);
}

function installPiSkill(args) {
  installSkill({
    adapter: 'pi',
    label: 'Pi',
    commandHint: `/skill:${skillName}`,
    userRoot: path.join(os.homedir(), '.pi', 'agent', 'skills'),
    projectRoot: path.join('.pi', 'skills'),
    args,
  });
}

function installClaudeSkill(args) {
  installSkill({
    adapter: 'claude',
    label: 'Claude',
    commandHint: `/${skillName}`,
    userRoot: path.join(os.homedir(), '.claude', 'skills'),
    projectRoot: path.join('.claude', 'skills'),
    args,
  });
}

const args = process.argv.slice(2);
if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
  usage(args.length === 0 ? 1 : 0);
}

const [command, subcommand, ...rest] = args;
if (command === 'install' && subcommand === 'pi') {
  installPiSkill(rest);
} else if (command === 'install' && subcommand === 'claude') {
  installClaudeSkill(rest);
} else if (command === 'install-pi-skill') {
  installPiSkill([subcommand, ...rest].filter(Boolean));
} else if (command === 'install-claude-skill') {
  installClaudeSkill([subcommand, ...rest].filter(Boolean));
} else {
  usage(1);
}
