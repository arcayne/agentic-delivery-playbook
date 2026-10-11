'use strict';

// Pure plan rules for the deliver-controlled workflow. The block between the
// markers is copied verbatim into adapters/claude-code/workflows/deliver-controlled.js;
// test/deliver-workflow.test.js asserts the two copies are identical.

// BEGIN plan-rules
function segmentMatches(patternSegment, segment) {
  if (!patternSegment.includes('*')) return patternSegment === segment;
  const source = patternSegment
    .split('*')
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
    .join('[^/]*');
  return new RegExp(`^${source}$`).test(segment);
}

// '*' matches within one path segment; '**' matches zero or more segments; everything else is literal.
function matchPattern(pattern, filePath) {
  const p = pattern.split('/');
  const f = filePath.split('/');
  const go = (i, j) => {
    if (i === p.length) return j === f.length;
    if (p[i] === '**') {
      for (let k = j; k <= f.length; k += 1) if (go(i + 1, k)) return true;
      return false;
    }
    return j < f.length && segmentMatches(p[i], f[j]) && go(i + 1, j + 1);
  };
  return go(0, 0);
}

function matchesAny(patterns, filePath) {
  return patterns.some((pattern) => matchPattern(pattern, filePath));
}

function topologicalOrder(tasks) {
  const ids = new Set(tasks.map((task) => task.id));
  const indegree = new Map(tasks.map((task) => [task.id, 0]));
  const dependents = new Map(tasks.map((task) => [task.id, []]));
  for (const task of tasks) {
    for (const dep of task.dependsOn || []) {
      if (!ids.has(dep)) return { order: null, unknown: dep, cycle: false };
      indegree.set(task.id, indegree.get(task.id) + 1);
      dependents.get(dep).push(task.id);
    }
  }
  const ready = tasks.filter((task) => indegree.get(task.id) === 0).map((task) => task.id);
  const order = [];
  while (ready.length > 0) {
    const id = ready.shift();
    order.push(id);
    for (const next of dependents.get(id)) {
      indegree.set(next, indegree.get(next) - 1);
      if (indegree.get(next) === 0) ready.push(next);
    }
  }
  if (order.length !== tasks.length) return { order: null, unknown: null, cycle: true };
  return { order, unknown: null, cycle: false };
}

// A concrete repository-relative path: a non-empty string with no glob, not absolute, no '.' or '..' segment.
function isConcretePath(value) {
  if (typeof value !== 'string' || value === '' || value.includes('*') || value.startsWith('/')) return false;
  return value.split('/').every((segment) => segment !== '' && segment !== '.' && segment !== '..');
}

// Rules R1 to R8 from the spec, checked in order. Returns {ok:true, order} or {ok:false, reason, detail}.
// Guards types instead of throwing, because resumePlan may be hand-edited.
function validatePlan(plan, lanes, nonGoalFiles) {
  const fail = (rule, detail) => ({ ok: false, reason: `plan-rule-${rule}`, detail });
  const tasks = plan && Array.isArray(plan.tasks) ? plan.tasks : [];
  if (tasks.length === 0) return fail('R1', 'plan has no tasks');
  const seen = new Set();
  for (const task of tasks) {
    if (!task || typeof task !== 'object') return fail('R1', 'task is not an object');
    if (typeof task.id !== 'string' || task.id === '' || seen.has(task.id)) return fail('R1', `duplicate or missing task id: ${task.id}`);
    seen.add(task.id);
  }
  for (const task of tasks) {
    if (!Array.isArray(task.ownedFiles) || task.ownedFiles.length === 0) return fail('R2', `${task.id}: ownedFiles is empty`);
    for (const file of task.ownedFiles) {
      if (!isConcretePath(file)) return fail('R2', `${task.id}: ${String(file)} is not a concrete repository-relative path`);
    }
    if (!Array.isArray(task.dependsOn)) return fail('R2', `${task.id}: dependsOn is not an array`);
    if (!task.check || typeof task.check.command !== 'string' || task.check.command === '') return fail('R2', `${task.id}: check.command is missing`);
    if (!Number.isInteger(task.check.expectedExit)) return fail('R2', `${task.id}: check.expectedExit is not an integer`);
  }
  const laneById = new Map((lanes || []).map((lane) => [lane.id, lane]));
  for (const task of tasks) {
    const lane = laneById.get(task.lane);
    if (!lane) return fail('R3', `${task.id}: unknown lane ${task.lane}`);
    for (const file of task.ownedFiles) {
      if (!matchesAny(lane.ownedFiles || [], file)) return fail('R4', `${task.id}: ${file} is outside lane ${lane.id}`);
    }
  }
  for (const task of tasks) {
    for (const file of task.ownedFiles) {
      if (matchesAny(nonGoalFiles || [], file)) return fail('R5', `${task.id}: ${file} is a non-goal file`);
    }
  }
  const owners = new Map();
  for (const task of tasks) {
    for (const file of task.ownedFiles) {
      if (owners.has(file)) return fail('R6', `${file} is owned by ${owners.get(file)} and ${task.id}`);
      owners.set(file, task.id);
    }
  }
  const topo = topologicalOrder(tasks);
  if (topo.unknown) return fail('R7', `unknown dependency ${topo.unknown}`);
  if (topo.cycle) return fail('R7', 'dependency cycle');
  if (Array.isArray(plan.openQuestions) && plan.openQuestions.length > 0) return fail('R8', `${plan.openQuestions.length} open question(s)`);
  return { ok: true, order: topo.order };
}

// Paths whose content hash differs between two validator fileStates maps (added, removed, or modified).
function changedPaths(before, after) {
  const b = before || {};
  const a = after || {};
  const paths = new Set([...Object.keys(b), ...Object.keys(a)]);
  return [...paths].filter((file) => b[file] !== a[file]).sort();
}
// END plan-rules

module.exports = {
  segmentMatches,
  matchPattern,
  matchesAny,
  isConcretePath,
  topologicalOrder,
  validatePlan,
  changedPaths,
};
