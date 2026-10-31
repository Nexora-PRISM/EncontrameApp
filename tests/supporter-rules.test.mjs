import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  base64Bytes,
  groupByCategory,
  logoTypeFromBase64,
  moveId,
  normalizeWebsite,
  supporterColumns,
  validateSupporterForm,
  websiteLabel,
} from '../src/lib/supporter-rules.ts';

const form = (overrides = {}) => ({
  name: 'Empresa Exemplo', websiteUrl: '', category: 'apoiador', isActive: false, authorizationConfirmed: false,
  authorizationNote: '', ...overrides,
});

test('site oficial: só https com domínio; mostra só o domínio', () => {
  assert.equal(normalizeWebsite('https://exemplo.com.br'), 'https://exemplo.com.br/');
  assert.equal(normalizeWebsite('http://exemplo.com.br'), null);
  assert.equal(normalizeWebsite('javascript:alert(1)'), null);
  assert.equal(normalizeWebsite('https://usuario:senha@exemplo.com'), null);
  assert.equal(websiteLabel('https://www.exemplo.com.br/sobre'), 'exemplo.com.br');
});

test('publicar exige autorização de uso da marca; nome e categoria obrigatórios', () => {
  assert.deepEqual(validateSupporterForm(form()), {});
  assert.deepEqual(validateSupporterForm(form({ isActive: true })), { authorizationConfirmed: 'required' });
  assert.deepEqual(validateSupporterForm(form({ isActive: true, authorizationConfirmed: true })), {});
  assert.deepEqual(validateSupporterForm(form({ name: ' ', category: '', websiteUrl: 'site' })), {
    name: 'required', websiteUrl: 'invalid_format', category: 'required',
  });
  assert.deepEqual(validateSupporterForm(form({ name: 'A', category: 'ouro' })), { name: 'too_short', category: 'invalid_format' });
});

test('logotipo: reconhece PNG, JPEG e WebP pelo conteúdo e recusa SVG', () => {
  assert.equal(logoTypeFromBase64('iVBORw0KGgoAAAANSUhEUgAA'), 'image/png');
  assert.equal(logoTypeFromBase64('data:image/jpeg;base64,/9j/4AAQSkZJRg'), 'image/jpeg');
  assert.equal(logoTypeFromBase64('UklGRiQAAABXRUJQVlA4'), 'image/webp');
  assert.equal(logoTypeFromBase64('PHN2ZyB4bWxucz0i'), null);
  assert.equal(base64Bytes('QUJD'), 3);
  assert.equal(base64Bytes('QUI='), 2);
});

test('ordem, grupos e colunas', () => {
  assert.deepEqual(moveId(['a', 'b', 'c'], 'b', -1), ['b', 'a', 'c']);
  assert.deepEqual(moveId(['a', 'b', 'c'], 'c', 1), ['a', 'b', 'c']);
  const groups = groupByCategory([{ id: 1, category: 'apoiador' }, { id: 2, category: 'patrocinador' }]);
  assert.deepEqual(groups.map((g) => g.category), ['patrocinador', 'apoiador']);
  assert.deepEqual([360, 600, 900, 1400].map(supporterColumns), [2, 3, 4, 5]);
});
