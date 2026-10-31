import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  ageFromBirthDate,
  dayPhotoExpiresAt,
  isDayPhotoValid,
  parseIdSheet,
  photoNeedsUpdate,
  purgeExpiredDayPhoto,
  sheetToCaseValues,
  sortIdSheets,
} from '../src/lib/id-sheet-rules.ts';

const NOW = new Date('2026-10-31T15:00:00.000Z');
const base = parseIdSheet({
  id: 'f1',
  createdAt: '2026-01-10T10:00:00.000Z',
  updatedAt: '2026-10-30T10:00:00.000Z',
  name: '  Ana Exemplo ',
  nickname: 'Aninha',
  birthDate: '15/11/2019',
  heightCm: '110',
  build: 'Magro',
  ethnicity: 'Parda',
  hair: 'Castanho, cacheado',
  eyes: 'Castanhos',
  marks: 'Pinta no queixo',
  healthNotes: 'Autista, não verbal',
  contactPhone: '(31) 99999-0000',
  photo: 'cm9zdG8=',
  photoAt: '2026-09-01T10:00:00.000Z',
  dayPhoto: 'cm91cGE=',
  dayPhotoAt: '2026-10-31T08:00:00.000Z',
  dayClothes: 'Camiseta amarela',
});

test('ficha: lê só o que é ficha válida', () => {
  assert.equal(parseIdSheet(null), null);
  assert.equal(parseIdSheet({ name: 'Sem id' }), null);
  const parsed = parseIdSheet({ id: 'x', name: 'Teste', photoAt: 'não é data', healthNotes: 'a'.repeat(900) });
  assert.equal(parsed.photoAt, null);
  assert.equal(parsed.healthNotes.length, 400);
  assert.equal(parsed.dayPhoto, '');
});

test('ficha: foto do dia vale 24 horas e depois é apagada', () => {
  assert.equal(dayPhotoExpiresAt(base).toISOString(), '2026-11-01T08:00:00.000Z');
  assert.equal(isDayPhotoValid(base, NOW), true);
  assert.equal(purgeExpiredDayPhoto(base, NOW), base);
  const later = new Date('2026-11-01T08:00:00.000Z');
  assert.equal(isDayPhotoValid(base, later), false);
  const purged = purgeExpiredDayPhoto(base, later);
  assert.equal(purged.dayPhoto, '');
  assert.equal(purged.dayPhotoAt, null);
  assert.equal(purged.dayClothes, '');
  assert.equal(purged.photo, base.photo);
});

test('ficha: idade calculada na hora pela data de nascimento', () => {
  assert.equal(ageFromBirthDate('15/11/2019', NOW), 6);
  assert.equal(ageFromBirthDate('31/10/2019', NOW), 7);
  assert.equal(ageFromBirthDate('31/02/2019', NOW), null);
  assert.equal(ageFromBirthDate('01/01/2030', NOW), null);
  assert.equal(ageFromBirthDate('', NOW), null);
});

test('ficha: foto de criança com mais de 6 meses pede atualização', () => {
  assert.equal(photoNeedsUpdate(base, NOW), false);
  assert.equal(photoNeedsUpdate({ ...base, photoAt: '2026-01-01T10:00:00.000Z' }, NOW), true);
  assert.equal(photoNeedsUpdate({ ...base, birthDate: '01/01/1950', photoAt: '2020-01-01T10:00:00.000Z' }, NOW), false);
  assert.equal(photoNeedsUpdate({ ...base, photo: '' }, NOW), true);
});

test('ficha → cadastro: saúde fica de fora; roupa só com foto do dia válida', () => {
  const values = sheetToCaseValues(base, NOW);
  assert.equal(values.fullName, 'Ana Exemplo');
  assert.equal(values.age, '6');
  assert.equal(values.tattoo, 'Pinta no queixo');
  assert.equal(values.clothes, 'Camiseta amarela');
  assert.equal(values.photoBase64, 'cm9zdG8=');
  assert.equal(JSON.stringify(values).includes('Autista'), false);
  const expired = sheetToCaseValues(base, new Date('2026-11-02T10:00:00.000Z'));
  assert.equal(expired.clothes, '');
  const onlyDay = sheetToCaseValues({ ...base, photo: '' }, NOW);
  assert.equal(onlyDay.photoBase64, 'cm91cGE=');
});

test('ficha: mais recentes primeiro', () => {
  const older = { ...base, id: 'f0', updatedAt: '2026-05-01T00:00:00.000Z' };
  assert.deepEqual(sortIdSheets([older, base]).map((s) => s.id), ['f1', 'f0']);
});
