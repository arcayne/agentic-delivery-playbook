'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  lineCount,
  readUtf8,
  findForbiddenTerms,
} = require('../lib/policy-helpers');

test('lineCount ignores one terminal newline', () => {
  assert.equal(lineCount('one\ntwo\n'), 2);
  assert.equal(lineCount(''), 0);
});

test('readUtf8 resolves repository-relative paths', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'adp-policy-'));
  fs.writeFileSync(path.join(root, 'sample.md'), 'sample\n');
  assert.equal(readUtf8(root, 'sample.md'), 'sample\n');
});

test('findForbiddenTerms reports file, term, and line', () => {
  const matches = findForbiddenTerms(
    new Map([
      ['one.md', 'Terra\nHermes route\n'],
      ['two.md', 'Sol only\n'],
    ]),
    [/Hermes/i],
  );

  assert.deepEqual(matches, [
    { file: 'one.md', term: 'Hermes', line: 2 },
  ]);
});
