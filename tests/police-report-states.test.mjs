import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const source = readFileSync(new URL('../src/lib/police-report-states.ts', import.meta.url), 'utf8');

test('B.O. on-line: os 27 estados, sem repetir', () => {
  const ufs = [...source.matchAll(/\{ uf: '([A-Z]{2})', name: '/g)].map((match) => match[1]);
  assert.equal(ufs.length, 27);
  assert.equal(new Set(ufs).size, 27);
});

test('B.O. on-line: todo link é oficial (https e domínio gov.br)', () => {
  const urls = [...source.matchAll(/url: '([^']+)'/g)].map((match) => match[1]);
  assert.ok(urls.length >= 4);
  for (const url of urls) {
    const parsed = new URL(url);
    assert.equal(parsed.protocol, 'https:', url);
    assert.match(parsed.hostname, /(^|\.)gov\.br$/, url);
  }
});
