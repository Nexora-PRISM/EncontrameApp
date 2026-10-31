import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  canSearchCaseLocation,
  isValidCasePoint,
  roundCasePoint,
} from '../src/lib/case-location-rules.ts';

test('ponto do cadastro: só coordenadas válidas', () => {
  assert.equal(isValidCasePoint({ latitude: -19.9245, longitude: -43.9352 }), true);
  assert.equal(isValidCasePoint({ latitude: 0, longitude: 0 }), false);
  assert.equal(isValidCasePoint({ latitude: 91, longitude: 0 }), false);
  assert.equal(isValidCasePoint({ latitude: -19.9, longitude: -181 }), false);
  assert.equal(isValidCasePoint({ latitude: Number.NaN, longitude: -43.9 }), false);
  assert.equal(isValidCasePoint({ latitude: -19.9, longitude: null }), false);
  assert.equal(isValidCasePoint(null), false);
});

test('ponto do cadastro: arredondado para cerca de 110 m', () => {
  assert.deepEqual(roundCasePoint({ latitude: -19.924567, longitude: -43.935249 }), { latitude: -19.925, longitude: -43.935 });
  assert.deepEqual(roundCasePoint({ latitude: 0.0004, longitude: 10 }), { latitude: 0, longitude: 10 });
  assert.equal(roundCasePoint({ latitude: 0, longitude: 0 }), null);
  assert.equal(roundCasePoint(undefined), null);
});

test('ponto do cadastro: precisa de texto para procurar o local', () => {
  assert.equal(canSearchCaseLocation('  BH '), false);
  assert.equal(canSearchCaseLocation('Savassi'), true);
});
