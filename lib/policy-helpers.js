'use strict';

const fs = require('node:fs');
const path = require('node:path');

function lineCount(text) {
  const withoutTerminalNewline = text.replace(/\r?\n$/, '');
  return withoutTerminalNewline === ''
    ? 0
    : withoutTerminalNewline.split(/\r?\n/).length;
}

function readUtf8(root, relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function findForbiddenTerms(files, patterns) {
  const matches = [];

  for (const [file, text] of files) {
    text.split(/\r?\n/).forEach((lineText, index) => {
      for (const pattern of patterns) {
        const match = lineText.match(pattern);
        if (match) {
          matches.push({ file, term: match[0], line: index + 1 });
        }
      }
    });
  }

  return matches;
}

module.exports = {
  lineCount,
  readUtf8,
  findForbiddenTerms,
};
