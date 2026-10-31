import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  arrivalPhase,
  canExtendArrivalCheck,
  extendArrivalCheck,
  formatRemaining,
  parseArrivalCheck,
  remainingMs,
  startArrivalCheck,
} from '../src/lib/arrival-check-rules.ts';

const NOW = new Date('2026-10-31T21:00:00.000Z');
const at = (minutes) => new Date(NOW.getTime() + minutes * 60000);

test('chegada segura: começa, conta e vence no horário', () => {
  const check = startArrivalCheck(NOW, 30, '  Casa  ');
  assert.equal(check.deadline, '2026-10-31T21:30:00.000Z');
  assert.equal(check.destination, 'Casa');
  assert.equal(arrivalPhase(null, NOW), 'none');
  assert.equal(arrivalPhase(check, at(29)), 'running');
  assert.equal(arrivalPhase(check, at(30)), 'overdue');
  assert.equal(remainingMs(check, at(10)), 20 * 60000);
  assert.equal(remainingMs(check, at(40)), 0);
});

test('chegada segura: mais 15 minutos a partir do horário ou de agora, até 12 horas', () => {
  const check = startArrivalCheck(NOW, 30, '');
  assert.equal(extendArrivalCheck(check, at(10)).deadline, '2026-10-31T21:45:00.000Z');
  assert.equal(extendArrivalCheck(check, at(50)).deadline, '2026-10-31T22:05:00.000Z');
  const long = startArrivalCheck(NOW, 12 * 60, '');
  assert.equal(canExtendArrivalCheck(long), false);
  assert.equal(extendArrivalCheck(long, at(5)).deadline, long.deadline);
  assert.equal(startArrivalCheck(NOW, 100000, '').deadline, at(12 * 60).toISOString());
});

test('chegada segura: tempo restante legível', () => {
  assert.equal(formatRemaining(8 * 60000 + 5000), '08:05');
  assert.equal(formatRemaining(65 * 60000), '1 h 05 min');
  assert.equal(formatRemaining(0), '00:00');
});

test('chegada segura: só lê trajeto válido', () => {
  const check = startArrivalCheck(NOW, 45, 'Faculdade');
  assert.deepEqual(parseArrivalCheck(JSON.stringify(check)), check);
  assert.equal(parseArrivalCheck(null), null);
  assert.equal(parseArrivalCheck('{'), null);
  assert.equal(parseArrivalCheck(JSON.stringify({ startedAt: check.deadline, deadline: check.startedAt })), null);
  assert.equal(parseArrivalCheck(JSON.stringify({ startedAt: NOW.toISOString(), deadline: at(13 * 60).toISOString() })), null);
});
