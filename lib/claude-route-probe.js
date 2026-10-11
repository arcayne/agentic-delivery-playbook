'use strict';

// Read-only report of requested vs observed Claude Code routes from a session transcript.
// Reads <session>.jsonl, <session>/subagents/agent-*.{jsonl,meta.json},
// <session>/subagents/workflows/<runId>/agent-*.{jsonl,meta.json}, and agent definition files.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const pluginPrefix = 'agentic-delivery-playbook:';
const excludedFromComparison = new Set([`${pluginPrefix}adp-explorer`]);
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
    definitions.set(name, { model: fields.model, effort: fields.effort, path: file });
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
    const route = { model, effort: entry.perTurnEffort ?? 'unknown', entrypoint: entry.entrypoint ?? 'unknown' };
    const key = JSON.stringify(route);
    const existing = routes.get(key);
    if (existing) existing.count += 1;
    else routes.set(key, { ...route, count: 1 });
  }
  return [...routes.values()];
}

// Requested model: per-invocation meta, else definition, else unknown.
// Requested effort: per-invocation meta (if a future Claude Code records it), else definition, else unknown.
// Source: 'invocation' whenever the meta carries model or effort (including a workflow-subagent with a
// passed model), else 'definition', else 'workflow' for a bare workflow-subagent, else 'unmatched'.
function requestedRoute(meta, definition) {
  const route = {
    model: meta.model ?? definition?.model ?? 'unknown',
    effort: meta.effort ?? definition?.effort ?? 'unknown',
    source: 'unmatched',
    definitionPath: definition?.path ?? null,
  };
  if (meta.model || meta.effort) route.source = 'invocation';
  else if (definition) route.source = 'definition';
  else if (meta.agentType === 'workflow-subagent') route.source = 'workflow';
  return route;
}

function collectSubagentFiles(sessionFile) {
  const subDir = path.join(sessionFile.replace(/\.jsonl$/, ''), 'subagents');
  const entries = [];
  if (!fs.existsSync(subDir)) return entries;
  const list = (dir) => fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  const jsonlIn = (dir) => list(dir).filter((e) => e.isFile() && e.name.endsWith('.jsonl')).map((e) => e.name);
  for (const name of jsonlIn(subDir)) entries.push({ dir: subDir, name, workflowRunId: null });
  const workflowsDir = path.join(subDir, 'workflows');
  if (fs.existsSync(workflowsDir)) {
    for (const runEntry of list(workflowsDir)) {
      if (!runEntry.isDirectory()) continue;
      const runDir = path.join(workflowsDir, runEntry.name);
      for (const name of jsonlIn(runDir)) entries.push({ dir: runDir, name, workflowRunId: runEntry.name });
    }
  }
  return entries;
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

  for (const { dir, name, workflowRunId } of collectSubagentFiles(sessionFile)) {
    const meta = readJson(path.join(dir, name.replace(/\.jsonl$/, '.meta.json')));
    report.subagents.push({
      agentId: name.replace(/^agent-/, '').replace(/\.jsonl$/, ''),
      agentType: meta.agentType ?? 'unknown',
      label: meta.description ?? null,
      workflowRunId,
      workflowPhase: meta.workflowPhase ?? null,
      spawnDepth: meta.spawnDepth ?? 'unknown',
      requested: requestedRoute(meta, lookupDefinition(definitions, meta.agentType)),
      observed: observedRoutes(path.join(dir, name)),
    });
  }
  return report;
}

// Multiset comparison of requested (agentType, model, effort) from workflow results against observed
// plugin subagents. Explorer and non-plugin agents are excluded and listed. An observed effort of
// 'unknown' whose agentType and model match a requested entry is consumed and listed as a gap.
function compareRoutes(report, requestedRoutes) {
  const key = (agentType, model, effort) => JSON.stringify({ agentType, model, effort });
  const parse = (k) => JSON.parse(k);
  const singleObserved = (subagent) => {
    if (subagent.observed.length === 0) return { model: 'unknown', effort: 'unknown' };
    if (subagent.observed.length === 1) return subagent.observed[0];
    const models = new Set(subagent.observed.map((o) => o.model));
    const efforts = new Set(subagent.observed.map((o) => o.effort));
    return { model: models.size === 1 ? [...models][0] : 'mixed', effort: efforts.size === 1 ? [...efforts][0] : 'mixed' };
  };

  const excluded = [];
  const candidates = [];
  for (const subagent of report.subagents) {
    const type = subagent.agentType;
    if (typeof type !== 'string' || !type.startsWith(pluginPrefix) || excludedFromComparison.has(type)) {
      excluded.push({ agentId: subagent.agentId, agentType: type, label: subagent.label });
      continue;
    }
    candidates.push({ ...subagent, route: singleObserved(subagent) });
  }

  const remaining = new Map();
  for (const route of requestedRoutes) {
    const k = key(route.agentType, route.model, route.effort);
    remaining.set(k, (remaining.get(k) || 0) + 1);
  }
  const unexpected = [];
  const unknownEffort = [];
  const consume = (k) => {
    const count = remaining.get(k);
    if (!count) return false;
    if (count === 1) remaining.delete(k);
    else remaining.set(k, count - 1);
    return true;
  };
  // Pass 1: exact matches, so an unknown-effort candidate cannot steal a slot an exact candidate needs.
  const leftover = [];
  for (const candidate of candidates) {
    const { model, effort } = candidate.route;
    if (!consume(key(candidate.agentType, model, effort))) leftover.push(candidate);
  }
  // Pass 2: unknown-effort fallback on whatever remains, recorded as a gap.
  for (const candidate of leftover) {
    const { model, effort } = candidate.route;
    if (effort === 'unknown') {
      const match = [...remaining.keys()].map(parse).find((r) => r.agentType === candidate.agentType && r.model === model);
      if (match) {
        consume(key(match.agentType, match.model, match.effort));
        unknownEffort.push({ label: candidate.label, agentType: candidate.agentType, model, requestedEffort: match.effort });
        continue;
      }
    }
    unexpected.push({ agentType: candidate.agentType, model, effort });
  }
  const missing = [];
  for (const [k, count] of remaining) for (let i = 0; i < count; i += 1) missing.push(parse(k));

  const queues = new Map();
  for (const candidate of candidates) {
    if (!candidate.label) continue;
    if (!queues.has(candidate.label)) queues.set(candidate.label, []);
    queues.get(candidate.label).push(candidate);
  }
  const labelPairs = requestedRoutes
    .filter((route) => route.label)
    .map((route) => {
      const next = queues.get(route.label)?.shift();
      return {
        label: route.label,
        requested: { agentType: route.agentType, model: route.model, effort: route.effort },
        observed: next ? { model: next.route.model, effort: next.route.effort } : null,
      };
    });

  return { matched: missing.length === 0 && unexpected.length === 0, missing, unexpected, unknownEffort, excluded, labelPairs };
}

module.exports = { probeClaude, compareRoutes, parseFrontmatter, loadAgentDefinitions };
