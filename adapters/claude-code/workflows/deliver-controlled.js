export const meta = {
  name: 'deliver-controlled',
  description: 'Agentic Delivery Playbook Controlled run: Opus plans, Sonnet implements one task at a time, Opus reviews defects, Fable judges goal fit',
  phases: [
    { title: 'Plan', detail: 'Fingerprinted Opus lead returns a validated task list' },
    { title: 'Implement', detail: 'Sonnet workers, one task at a time, validated per task' },
    { title: 'Review', detail: 'Fresh-context defect review of contract, diff, and evidence' },
    { title: 'Goal-fit', detail: 'Fresh-context fitness review against the intent brief' },
  ],
}

// Agent definitions. test/deliver-workflow.test.js keeps model and effort equal to the agent frontmatter.
const AGENTS = {
  lead: { agentType: 'agentic-delivery-playbook:adp-lead', model: 'claude-opus-5-5', effort: 'xhigh' },
  worker: { agentType: 'agentic-delivery-playbook:adp-worker', model: 'claude-sonnet-5-5', effort: 'medium' },
  workerHigh: { agentType: 'agentic-delivery-playbook:adp-worker-high', model: 'claude-sonnet-5-5', effort: 'high' },
  workerOpus: { agentType: 'agentic-delivery-playbook:adp-worker', model: 'claude-opus-5-5', effort: 'high' },
  validator: { agentType: 'agentic-delivery-playbook:adp-validator', model: 'claude-sonnet-5-5', effort: 'low' },
  reviewer: { agentType: 'agentic-delivery-playbook:adp-reviewer', model: 'claude-opus-5-5', effort: 'medium' },
  reviewerHigh: { agentType: 'agentic-delivery-playbook:adp-reviewer-high', model: 'claude-opus-5-5', effort: 'high' },
  goalReviewer: { agentType: 'agentic-delivery-playbook:adp-goal-reviewer', model: 'claude-fable-5-1', effort: 'high' },
}

const WORKER_LADDER = ['worker', 'workerHigh', 'workerOpus']
const MAX_ATTEMPTS = 3
const MAX_REVIEW_CYCLES = 3
const FINGERPRINT_COMMAND = 'T=$(mktemp) && cp "$(git rev-parse --git-path index)" "$T" && GIT_INDEX_FILE="$T" git add -A && GIT_INDEX_FILE="$T" git write-tree; rm -f "$T"'
const DIFF_HASH_COMMAND = '{ git diff --no-color --no-ext-diff BASE; git ls-files --others --exclude-standard -z | while IFS= read -r -d \'\' f; do printf \'%s\\0\' "$f"; cat "$f"; done; } | shasum -a 256'
const FILE_STATES_COMMAND = 'git status --porcelain=v1 -uall -z --no-renames | while IFS= read -r -d \'\' e; do p="${e:3}"; if [ -e "$p" ]; then printf \'%s\\t%s\\n\' "$p" "$(git hash-object -- "$p")"; else printf \'%s\\tdeleted\\n\' "$p"; fi; done'

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
  const p = pattern.split('/').reduce((kept, segment) => {
    if (segment !== '**' || kept[kept.length - 1] !== '**') kept.push(segment);
    return kept;
  }, []);
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
  if (!Array.isArray(plan.openQuestions)) return fail('R8', 'openQuestions must be an empty array');
  if (plan.openQuestions.length > 0) return fail('R8', `${plan.openQuestions.length} open question(s)`);
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

// ---- schemas ---------------------------------------------------------------

const PLAN_SCHEMA = {
  type: 'object',
  required: ['tasks', 'assumptions', 'openQuestions'],
  properties: {
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'lane', 'title', 'ownedFiles', 'instructions', 'dependsOn', 'check', 'acceptanceCriteria'],
        properties: {
          id: { type: 'string' },
          lane: { type: 'string' },
          title: { type: 'string' },
          ownedFiles: { type: 'array', items: { type: 'string' } },
          instructions: { type: 'string' },
          dependsOn: { type: 'array', items: { type: 'string' } },
          check: { type: 'object', required: ['command', 'expectedExit'], properties: { command: { type: 'string' }, expectedExit: { type: 'integer' } } },
          acceptanceCriteria: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    assumptions: { type: 'array', items: { type: 'string' } },
    openQuestions: { type: 'array', items: { type: 'string' } },
  },
}

const WORKER_SCHEMA = {
  type: 'object',
  required: ['changedFiles', 'commandsRun', 'assumptions', 'gaps', 'stopped', 'stopReason'],
  properties: {
    changedFiles: { type: 'array', items: { type: 'string' } },
    commandsRun: { type: 'array', items: { type: 'string' } },
    assumptions: { type: 'array', items: { type: 'string' } },
    gaps: { type: 'array', items: { type: 'string' } },
    stopped: { type: 'boolean' },
    stopReason: { type: 'string' },
  },
}

const VALIDATOR_SCHEMA = {
  type: 'object',
  required: ['head', 'fileStates', 'fingerprint', 'command', 'exitCode', 'outputExcerpt'],
  properties: {
    head: { type: 'string' },
    fileStates: { type: 'object', additionalProperties: { type: 'string' } },
    fingerprint: { type: 'string' },
    command: { type: ['string', 'null'] },
    exitCode: { type: ['integer', 'null'] },
    outputExcerpt: { type: 'string' },
  },
}

const REVIEW_SCHEMA = {
  type: 'object',
  required: ['decision', 'findings', 'unprovenCriteria', 'diffSha256'],
  properties: {
    decision: { type: 'string', enum: ['accept', 'accept-with-fixes', 'reject'] },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['severity', 'acceptanceCriterion', 'file', 'line', 'summary'],
        properties: {
          severity: { type: 'string' },
          acceptanceCriterion: { type: 'string' },
          file: { type: 'string' },
          line: { type: ['integer', 'null'] },
          summary: { type: 'string' },
        },
      },
    },
    unprovenCriteria: { type: 'array', items: { type: 'string' } },
    diffSha256: { type: 'string' },
  },
}

const GOAL_FIT_SCHEMA = {
  type: 'object',
  required: ['verdict', 'reasons', 'usedDeliverable', 'howUsed'],
  properties: {
    verdict: { type: 'string', enum: ['fit', 'partially-fit', 'not-fit'] },
    reasons: { type: 'array', items: { type: 'string' } },
    usedDeliverable: { type: 'boolean' },
    howUsed: { type: 'string' },
  },
}

// ---- args ------------------------------------------------------------------

// Malformed args throw, which surfaces as a Workflow tool error rather than an escalated record.
const a = args || {}
const requireArg = (name, ok, problem) => { if (!ok) throw new Error(`deliver-controlled: args.${name} ${problem || 'is required'}`) }
const isText = (value) => typeof value === 'string' && value !== ''
const isTextArray = (value) => Array.isArray(value) && value.every((item) => typeof item === 'string')
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
requireArg('contractPath', isText(a.contractPath))
requireArg('briefPath', isText(a.briefPath))
requireArg('baseCommit', isText(a.baseCommit))
requireArg('baseCommit', /^[0-9a-f]{40}([0-9a-f]{24})?$/.test(a.baseCommit), 'must be a full commit hash')
requireArg('lanes', Array.isArray(a.lanes) && a.lanes.length > 0)
a.lanes.forEach((lane, i) => requireArg(`lanes[${i}]`, isObject(lane) && isText(lane.id) && isTextArray(lane.ownedFiles), 'must be an object with a non-empty string id and an array of strings ownedFiles'))
a.lanes.forEach((lane, i) => requireArg('lanes', a.lanes.findIndex((other) => other.id === lane.id) === i, `has duplicate id ${lane.id}`))
requireArg('nonGoalFiles', a.nonGoalFiles === undefined || isTextArray(a.nonGoalFiles), 'must be an array of strings')
requireArg('risk', a.risk === undefined || a.risk === 'normal' || a.risk === 'high', "must be 'normal' or 'high'")
requireArg('goalReviewer', a.goalReviewer === undefined || (isObject(a.goalReviewer) && ['agentType', 'model', 'effort'].every((key) => a.goalReviewer[key] === undefined || isText(a.goalReviewer[key]))), 'must be an object whose agentType, model, and effort are non-empty strings when present')
requireArg('pauseAfterPlan', a.pauseAfterPlan === undefined || typeof a.pauseAfterPlan === 'boolean', 'must be a boolean')
requireArg('resumePlan', a.resumePlan === undefined || a.resumePlan === null || isObject(a.resumePlan), 'must be null or an object')
const risk = a.risk || 'normal'
const nonGoalFiles = a.nonGoalFiles || []
const goalReviewerDef = Object.assign({}, AGENTS.goalReviewer, a.goalReviewer || {})

// ---- prompts ---------------------------------------------------------------

const context = () => [
  `Repository root: the current working directory, which is the git top level; run every command from it. Base commit: ${a.baseCommit}. HEAD must stay at the base commit; nobody commits during this run.`,
  `Delivery contract: ${a.contractPath}. Intent brief: ${a.briefPath}. Read both files yourself.`,
  'Your final output is data for a script, not a message to a person. Return only the structured result requested.',
].join('\n')

const ARTIFACTS_RULE = 'Files under the directory containing the brief and contract are orchestrator artifacts, not part of the change under review, and are never findings.'

const validatorPrompt = (command) => [
  context(),
  'You are the validator. Never modify any file. Perform these steps in order and record each result:',
  '1. head: run `git rev-parse HEAD`.',
  `2. fileStates: run exactly the command between the backticks: \`${FILE_STATES_COMMAND}\` Each output line is a path, a tab, and its content hash or the literal "deleted". Return an object keyed by path; an empty object means a clean tree.`,
  `3. fingerprint: run exactly the command between the backticks: \`${FINGERPRINT_COMMAND}\``,
  command
    ? `4. Then run exactly the command between the backticks and record command, exitCode, and the last 40 lines of combined output as outputExcerpt: \`${command}\``
    : '4. No command this time: set command to null, exitCode to null, and outputExcerpt to "".',
  'Steps 1 to 3 happen before step 4. Run nothing else.',
].join('\n')

const leadPrompt = () => [
  context(),
  'You are the technical lead. Plan the contract as bounded tasks for workers who have not read this conversation.',
  `Lanes (ownership patterns; "*" matches within one path segment, "**" matches any depth): ${JSON.stringify(a.lanes)}`,
  `Non-goal files (must not be touched): ${JSON.stringify(nonGoalFiles)}`,
  'Rules the script enforces before any edit: tasks non-empty with unique ids; each task has non-empty ownedFiles as concrete paths (no globs), a non-empty check.command and an integer check.expectedExit; each task names an existing lane and every path matches that lane; no path matches a non-goal pattern; no path appears in two tasks; dependsOn names existing tasks without cycles; openQuestions is empty.',
  'Checks must not modify tracked files or create untracked files. Put anything you cannot decide from the contract and the brief into openQuestions instead of guessing. Always return your best task list even when you have open questions.',
].join('\n')

const workerPrompt = (task, extra) => [
  context(),
  'You are the sole writer for this task. Edit only the files it owns. Never commit. Run only this task\'s check. Leave no untracked files behind other than files this task owns.',
  `Task: ${JSON.stringify(task)}`,
  extra && extra.previousValidation ? `Previous attempt failed its check. Validator output: ${JSON.stringify(extra.previousValidation)}` : '',
  extra && extra.findings ? `Review findings to fix: ${JSON.stringify(extra.findings)}` : '',
  'Set stopped to true and explain in stopReason if the task is ambiguous, a file outside ownership must change, or a stop condition is reached. Never claim a check ran unless it did.',
].filter(Boolean).join('\n')

const reviewerPrompt = (plan, taskRecords, cycle) => [
  context(),
  `You are the fresh-context defect reviewer (cycle ${cycle}). Compute the diff against the base commit yourself, including untracked files.`,
  `Plan: ${JSON.stringify(plan)}`,
  `Validation records: ${JSON.stringify([...taskRecords.values()])}`,
  `Compute diffSha256 with exactly this command: \`${DIFF_HASH_COMMAND.replace('BASE', () => a.baseCommit)}\` Report only the 64-character hex digest, not the trailing \` -\`.`,
  ARTIFACTS_RULE,
  'Lead with defects ordered by severity, each tied to an acceptance criterion and a file and line. For each finding, file must be the repository-relative path exactly as it appears in a task\'s ownedFiles; put the line number only in line. Flag scope creep, files outside task ownership, unrun or contradictory checks, and unsupported claims. List criteria that lack evidence in unprovenCriteria. Decide accept, accept-with-fixes, or reject.',
].join('\n')

const goalFitPrompt = (taskRecords, review) => [
  context(),
  'You are the fresh-context goal-fit reviewer. Read the intent brief first. Judge whether the result is useful for the goal in the brief, for the person it serves, as success is described there. The acceptance criteria are context, not the question.',
  `Validation records: ${JSON.stringify([...taskRecords.values()])}`,
  `Defect review result: ${JSON.stringify(review)}`,
  'You may run only commands listed in the contract\'s verification plan, commands named in the brief\'s "how success is observed" section, and read-only inspection. Report anything else as "would need to run X" instead of running it. Never write files.',
  ARTIFACTS_RULE,
  'Return verdict (fit, partially-fit, not-fit), reasons tied to lines of the brief, usedDeliverable, and howUsed.',
].join('\n')

// ---- helpers ---------------------------------------------------------------

const requestedRoutes = []
async function call(role, label, phaseTitle, prompt, schema, def) {
  const d = def || AGENTS[role]
  requestedRoutes.push({ label, agentType: d.agentType, model: d.model, effort: d.effort })
  return agent(prompt, { label, phase: phaseTitle, schema, agentType: d.agentType, model: d.model, effort: d.effort })
}

const taskRecords = new Map()
const reviewCycles = []
let finalDecision = null
let plan = null

const state = () => ({
  plan,
  tasks: [...taskRecords.values()],
  review: { cycles: reviewCycles, finalDecision },
  requestedRoutes,
})
const result = (fields) => Object.assign({ status: null, reason: null, detail: null, goalFit: null }, state(), fields)
const escalate = (reason, detail) => result({ status: 'escalated', reason, detail: detail === undefined ? null : detail })

// ---- Plan ------------------------------------------------------------------

phase('Plan')
plan = a.resumePlan || null
if (!plan) {
  const pre = await call('validator', 'plan-pre', 'Plan', validatorPrompt(null), VALIDATOR_SCHEMA)
  if (!pre) return escalate('agent-null:plan-pre')
  plan = await call('lead', 'plan', 'Plan', leadPrompt(), PLAN_SCHEMA)
  if (!plan) return escalate('agent-null:plan')
  const post = await call('validator', 'plan-post', 'Plan', validatorPrompt(null), VALIDATOR_SCHEMA)
  if (!post) return escalate('agent-null:plan-post')
  if (pre.fingerprint !== post.fingerprint || pre.head !== a.baseCommit || post.head !== a.baseCommit) {
    return result({ status: 'blocked', reason: 'plan-gate-fingerprint' })
  }
}
const planCheck = validatePlan(plan, a.lanes, nonGoalFiles)
if (!planCheck.ok) return result({ status: 'blocked', reason: planCheck.reason, detail: planCheck.detail })
log(`Plan accepted: ${plan.tasks.length} task(s) in order ${planCheck.order.join(', ')}`)
if (a.pauseAfterPlan && !a.resumePlan) return result({ status: 'plan-ready' })

// ---- Implement -------------------------------------------------------------

phase('Implement')
const taskById = new Map(plan.tasks.map((task) => [task.id, task]))
for (const task of plan.tasks) taskRecords.set(task.id, { id: task.id, status: 'pending', attempts: [] })

// One attempt of one task. Returns {outcome:'passed'} | {outcome:'failed', validator} | {outcome:'escalate', reason, detail}.
async function attemptTask(task, attempt, extra) {
  const record = taskRecords.get(task.id)
  const role = WORKER_LADDER[attempt - 1]
  const d = AGENTS[role]
  const labels = { pre: `t${task.id}-pre-${attempt}`, implement: `t${task.id}-implement-${attempt}`, validate: `t${task.id}-validate-${attempt}` }
  const pre = await call('validator', labels.pre, 'Implement', validatorPrompt(null), VALIDATOR_SCHEMA)
  if (!pre) { record.status = 'failed'; return { outcome: 'escalate', reason: `agent-null:${labels.pre}` } }
  const worker = await call(role, labels.implement, 'Implement', workerPrompt(task, extra), WORKER_SCHEMA)
  const entry = { label: labels.implement, agentType: d.agentType, model: d.model, effort: d.effort, worker, preValidation: pre, postValidation: null, changedPaths: null, passed: false }
  record.attempts.push(entry)
  if (!worker) { record.status = 'failed'; return { outcome: 'escalate', reason: `agent-null:${labels.implement}` } }
  if (worker.stopped) { record.status = 'blocked'; return { outcome: 'escalate', reason: 'worker-stopped', detail: worker.stopReason } }
  const post = await call('validator', labels.validate, 'Implement', validatorPrompt(task.check.command), VALIDATOR_SCHEMA)
  if (!post) { record.status = 'failed'; return { outcome: 'escalate', reason: `agent-null:${labels.validate}` } }
  entry.postValidation = post
  entry.changedPaths = changedPaths(pre.fileStates, post.fileStates)
  if (pre.head !== a.baseCommit || post.head !== a.baseCommit) { record.status = 'blocked'; return { outcome: 'escalate', reason: 'head-moved' } }
  const outside = entry.changedPaths.filter((file) => !task.ownedFiles.includes(file))
  if (outside.length > 0) { record.status = 'blocked'; return { outcome: 'escalate', reason: 'ownership', detail: outside } }
  entry.passed = post.exitCode === task.check.expectedExit
  if (!entry.passed) return { outcome: 'failed', validator: post }
  record.status = 'passed'
  return { outcome: 'passed' }
}

// Runs attempts from `firstAttempt` up the ladder until one passes or the ceiling is hit.
async function runTask(task, firstAttempt, extra) {
  let outcome = null
  let carried = extra
  for (let attempt = firstAttempt; attempt <= MAX_ATTEMPTS; attempt += 1) {
    outcome = await attemptTask(task, attempt, carried)
    if (outcome.outcome !== 'failed') return outcome
    log(`${task.id}: attempt ${attempt} failed its check (exit ${outcome.validator.exitCode})`)
    carried = Object.assign({}, carried || {}, { previousValidation: outcome.validator })
  }
  taskRecords.get(task.id).status = 'blocked'
  return { outcome: 'escalate', reason: 'fix-cycles-exhausted', detail: task.id }
}

for (const id of planCheck.order) {
  const outcome = await runTask(taskById.get(id), 1, null)
  if (outcome.outcome === 'escalate') return escalate(outcome.reason, outcome.detail)
}

// ---- Review ----------------------------------------------------------------

phase('Review')
const reviewerRole = risk === 'high' ? 'reviewerHigh' : 'reviewer'
for (let cycle = 1; cycle <= MAX_REVIEW_CYCLES; cycle += 1) {
  const pre = await call('validator', `review-pre-${cycle}`, 'Review', validatorPrompt(null), VALIDATOR_SCHEMA)
  if (!pre) return escalate(`agent-null:review-pre-${cycle}`)
  const review = await call(reviewerRole, `review-${cycle}`, 'Review', reviewerPrompt(plan, taskRecords, cycle), REVIEW_SCHEMA)
  if (!review) return escalate(`agent-null:review-${cycle}`)
  const post = await call('validator', `review-post-${cycle}`, 'Review', validatorPrompt(null), VALIDATOR_SCHEMA)
  if (!post) return escalate(`agent-null:review-post-${cycle}`)
  const d = AGENTS[reviewerRole]
  reviewCycles.push({
    label: `review-${cycle}`, agentType: d.agentType, model: d.model, effort: d.effort,
    decision: review.decision, findings: review.findings, unprovenCriteria: review.unprovenCriteria, diffSha256: review.diffSha256,
    fingerprintBefore: pre.fingerprint, fingerprintAfter: post.fingerprint,
  })
  if (pre.fingerprint !== post.fingerprint || pre.head !== a.baseCommit || post.head !== a.baseCommit) return escalate('review-gate-fingerprint')
  finalDecision = review.decision
  if (review.decision === 'reject') return escalate('review-rejected', review.findings)
  // accept-with-fixes with nothing to fix is an accept.
  if (review.decision === 'accept' || review.findings.length === 0) { finalDecision = 'accept'; break }
  if (cycle === MAX_REVIEW_CYCLES) return escalate('review-cycles-exhausted')
  const byTask = new Map()
  for (const finding of review.findings) {
    const file = String(finding.file).replace(/^\.\//, '')
    const owner = plan.tasks.find((task) => task.ownedFiles.includes(file))
    if (!owner) return escalate('finding-outside-ownership', finding.file)
    if (!byTask.has(owner.id)) byTask.set(owner.id, [])
    byTask.get(owner.id).push(finding)
  }
  // Fix in dependency order so a dependency is repaired before its dependents.
  for (const id of planCheck.order.filter((taskId) => byTask.has(taskId))) {
    const findings = byTask.get(id)
    const record = taskRecords.get(id)
    const nextAttempt = record.attempts.length + 1
    if (nextAttempt > MAX_ATTEMPTS) { record.status = 'blocked'; return escalate('review-fix-failed', id) }
    record.status = 'pending'
    const outcome = await runTask(taskById.get(id), nextAttempt, { findings })
    if (outcome.outcome === 'escalate') return escalate(outcome.reason === 'fix-cycles-exhausted' ? 'review-fix-failed' : outcome.reason, outcome.detail)
  }
}

// ---- Goal-fit --------------------------------------------------------------

phase('Goal-fit')
const fitPre = await call('validator', 'goal-fit-pre', 'Goal-fit', validatorPrompt(null), VALIDATOR_SCHEMA)
if (!fitPre) return escalate('agent-null:goal-fit-pre')
const fit = await call('goalReviewer', 'goal-fit', 'Goal-fit', goalFitPrompt(taskRecords, reviewCycles[reviewCycles.length - 1]), GOAL_FIT_SCHEMA, goalReviewerDef)
if (!fit) return escalate('agent-null:goal-fit')
const fitPost = await call('validator', 'goal-fit-post', 'Goal-fit', validatorPrompt(null), VALIDATOR_SCHEMA)
if (!fitPost) return escalate('agent-null:goal-fit-post')
const goalFit = {
  label: 'goal-fit', agentType: goalReviewerDef.agentType, model: goalReviewerDef.model, effort: goalReviewerDef.effort,
  verdict: fit.verdict, reasons: fit.reasons, usedDeliverable: fit.usedDeliverable, howUsed: fit.howUsed,
  fingerprintBefore: fitPre.fingerprint, fingerprintAfter: fitPost.fingerprint,
}
if (fitPre.fingerprint !== fitPost.fingerprint || fitPre.head !== a.baseCommit || fitPost.head !== a.baseCommit) {
  goalFit.verdict = 'invalid'
  return result({ status: 'escalated', reason: 'goal-fit-gate-fingerprint', goalFit })
}
log(`Goal-fit verdict: ${fit.verdict}`)
return result({ status: 'completed', goalFit })
