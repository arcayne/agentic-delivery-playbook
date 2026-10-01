'use strict';

// Read-only report of requested vs observed Claude Code routes from a session transcript.
// Reads <session>.jsonl, <session>/subagents/agent-*.{jsonl,meta.json}, and agent definition files.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const pluginPrefix = 'agentic-delivery-playbook:';
const defaultAgentsDir = path.resolve(__dirname, '..', 'adapters', 'claude-code', 'agents');

// Never emit a raw absolute path under the home directory: use a cwd-relative path
// when inside the cwd, otherwise replace the home prefix with "~".
function displayPath(target) {
  const absolute = path.resolve(target);
  const relative = path.relative(process.cwd(), absolute);
  if (relative === '') return '.';
  if (!relative.startsWith('..') && !path.isAbsolute(relative)) return relative;
  const home = os.homedir();
  if (absolute === home) return '~';
  if (absolute.startsWith(home + path.sep)) return `~${absolute.slice(home.length)}`;
  return absolute;
}

function parseFrontmatter(text) {
  const block = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fields = {};
  if (!block) return fields;
  for (const line of block[1].split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z][\w-]*):\s*(.*?)\s*$/);
    if (match) fields[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
  return fields;
}

function loadAgentDefinitions(agentsDir) {
  const definitions = new Map();
  if (!agentsDir || !fs.existsSync(agentsDir)) return definitions;
  for (const file of fs.readdirSync(agentsDir).filter((name) => name.endsWith('.md')).sort()) {
    const fields = parseFrontmatter(fs.readFileSync(path.join(agentsDir, file), 'utf8'));
    const name = fields.name || file.replace(/\.md$/, '');
    definitions.set(name, {
      model: fields.model,
      effort: fields.effort,
      path: file,
    });
  }
  return definitions;
}

function lookupDefinition(definitions, agentType) {
  if (typeof agentType !== 'string') return undefined;
  // Strip only this plugin's namespace; foreign namespaces must not match.
  const bare = agentType.startsWith(pluginPrefix) ? agentType.slice(pluginPrefix.length) : agentType;
  return bare.includes(':') ? undefined : definitions.get(bare);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function observedRoutes(file) {
  const routes = new Map();
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!line.trim()) continue;
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    const model = entry && entry.message && entry.message.model;
    if (typeof model !== 'string' || model === '' || model === '<synthetic>') continue;
    const route = {
      model,
      effort: entry.perTurnEffort ?? 'unknown',
      entrypoint: entry.entrypoint ?? 'unknown',
    };
    const key = JSON.stringify(route);
    const existing = routes.get(key);
    if (existing) existing.count += 1;
    else routes.set(key, { ...route, count: 1 });
  }
  return [...routes.values()];
}

function requestedRoute(meta, definition) {
  const route = {
    model: meta.model ?? definition?.model ?? 'unknown',
    effort: definition?.effort ?? 'unknown',
    source: 'unmatched',
    definitionPath: definition?.path ?? null,
  };
  if (meta.model) route.source = 'invocation';
  else if (definition) route.source = 'definition';
  return route;
}

function probeClaude(sessionFile, options = {}) {
  if (!sessionFile || !fs.existsSync(sessionFile) || !fs.statSync(sessionFile).isFile()) {
    throw new Error(`session transcript not found: ${displayPath(sessionFile)}`);
  }
  const agentsDir = options.agentsDir ?? defaultAgentsDir;
  if (options.agentsDir && !fs.existsSync(agentsDir)) {
    throw new Error(`agents directory not found: ${displayPath(agentsDir)}`);
  }
  const agentsDirMissing = !fs.existsSync(agentsDir);
  if (agentsDirMissing) {
    process.stderr.write(`warning: agents directory not found: ${displayPath(agentsDir)}; requested routes will be unmatched\n`);
  }
  const definitions = loadAgentDefinitions(agentsDir);
  const report = {
    session: path.basename(sessionFile),
    agentsDir: agentsDirMissing ? null : displayPath(agentsDir),
    main: { observed: observedRoutes(sessionFile) },
    subagents: [],
  };

  const subDir = path.join(sessionFile.replace(/\.jsonl$/, ''), 'subagents');
  if (fs.existsSync(subDir)) {
    for (const name of fs.readdirSync(subDir).filter((file) => file.endsWith('.jsonl')).sort()) {
      const meta = readJson(path.join(subDir, name.replace(/\.jsonl$/, '.meta.json')));
      report.subagents.push({
        agentId: name.replace(/^agent-/, '').replace(/\.jsonl$/, ''),
        agentType: meta.agentType ?? 'unknown',
        spawnDepth: meta.spawnDepth ?? 'unknown',
        requested: requestedRoute(meta, lookupDefinition(definitions, meta.agentType)),
        observed: observedRoutes(path.join(subDir, name)),
      });
    }
  }
  return report;
}

module.exports = { probeClaude, parseFrontmatter, loadAgentDefinitions };
