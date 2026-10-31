import assert from 'node:assert/strict';
import { test } from 'node:test';

import { uniqueAddressText } from '../src/lib/address-text.ts';

test('último local sem trechos repetidos (location e city com o mesmo texto)', () => {
  assert.equal(uniqueAddressText('Praça Sete, Belo Horizonte, Praça Sete, Belo Horizonte'), 'Praça Sete, Belo Horizonte');
  assert.equal(uniqueAddressText('Rua A, Centro, rua a, MG'), 'Rua A, Centro, MG');
  assert.equal(uniqueAddressText('Savassi'), 'Savassi');
  assert.equal(uniqueAddressText(' , '), undefined);
  assert.equal(uniqueAddressText(null), undefined);
});
