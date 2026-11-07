import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  alertReason,
  contactAttemptError,
  extendedArrival,
  formatInviteCode,
  inviteLink,
  normalizeInviteCode,
  parseActiveTripRef,
  parsePointQueue,
  POINT_QUEUE_MAX,
  queuePoint,
  serializePointQueue,
  signalState,
  tripPhase,
  validateTripForm,
  watcherSeesLocation,
} from '../src/lib/trip-rules.ts';

const NOW = new Date('2026-11-06T23:00:00.000Z');
const at = (minutes) => new Date(NOW.getTime() + minutes * 60000);
const iso = (minutes) => at(minutes).toISOString();
const trip = (overrides = {}) => ({
  status: 'active', startedAt: iso(0), expectedArrivalAt: iso(30), toleranceMinutes: 15, endedAt: null, lastPointAt: iso(0), ...overrides,
});
const point = (seconds, extra = {}) => ({
  latitude: -19.9, longitude: -43.9, accuracyMeters: 20, recordedAt: new Date(NOW.getTime() + seconds * 1000).toISOString(), ...extra,
});

describe('Trajeto compartilhado: regras do app', () => {
  test('fase: a caminho até previsão + tolerância; depois, atraso (nunca "desaparecida")', () => {
    assert.equal(tripPhase(trip(), at(44)), 'active');
    assert.equal(tripPhase(trip(), at(45)), 'overdue');
    assert.equal(tripPhase(trip({ status: 'arrived' }), at(60)), 'arrived');
  });

  test('sinal: ok até 10 min sem posição nova; depois sem atualização', () => {
    assert.equal(signalState(trip(), at(9)), 'ok');
    assert.equal(signalState(trip(), at(10)), 'stale');
    assert.equal(signalState(trip({ lastPointAt: null }), at(1)), 'none');
  });

  test('Sinal de Alerta só com motivo, igual ao servidor', () => {
    assert.equal(alertReason(trip(), at(5)), null);
    assert.equal(alertReason(trip(), at(12)), 'signal_lost');
    assert.equal(alertReason(trip({ lastPointAt: iso(11) }), at(12)), null, 'posição recente: sem motivo');
    assert.equal(alertReason(trip({ lastPointAt: iso(40) }), at(45)), 'overdue');
    assert.equal(alertReason(trip({ status: 'expired', endedAt: iso(0) }), at(60)), 'expired');
    assert.equal(alertReason(trip({ status: 'expired', endedAt: iso(0) }), at(25 * 60)), null);
    assert.equal(alertReason(trip({ status: 'arrived', endedAt: iso(20) }), at(60)), null);
  });

  test('contato vê a localização só enquanto faz sentido', () => {
    assert.equal(watcherSeesLocation(trip(), NOW, false), true);
    assert.equal(watcherSeesLocation(trip({ status: 'arrived' }), NOW, false), false);
    assert.equal(watcherSeesLocation(trip({ status: 'cancelled' }), NOW, true), true, 'alerta aberto');
    assert.equal(watcherSeesLocation(trip({ status: 'expired', endedAt: iso(0) }), at(60), false), true);
    assert.equal(watcherSeesLocation(trip({ status: 'expired', endedAt: iso(0) }), at(25 * 60), false), false);
  });

  test('"Ainda estou em deslocamento": +15 min a partir da previsão ou de agora, até 12 h', () => {
    assert.equal(extendedArrival(trip(), at(10)), iso(45));
    assert.equal(extendedArrival(trip(), at(50)), iso(65));
    assert.equal(extendedArrival(trip({ expectedArrivalAt: iso(12 * 60 - 5) }), at(60)), null);
  });

  test('convite: código normalizado, exibido em blocos e link só com endereço do app web', () => {
    assert.equal(normalizeInviteCode(' abcd-efgh-jkmn '), 'ABCDEFGHJKMN');
    assert.equal(normalizeInviteCode('ABCDEFGHJKM0'), null, 'zero não existe no alfabeto');
    assert.equal(normalizeInviteCode('CURTO'), null);
    assert.equal(formatInviteCode('ABCDEFGHJKMN'), 'ABCD-EFGH-JKMN');
    assert.equal(inviteLink('ABCDEFGHJKMN', 'https://app.exemplo.com.br/'), 'https://app.exemplo.com.br/trajeto/convite/ABCDEFGHJKMN');
    assert.equal(inviteLink('ABCDEFGHJKMN', ''), null);
  });

  test('início: origem, destino, previsão, tolerância, 1 a 5 contatos e consentimento', () => {
    const ok = { originLabel: 'Casa', destinationLabel: 'Faculdade', arrivalMinutes: 30, toleranceMinutes: 15, contactIds: ['1'], consent: true };
    assert.deepEqual(validateTripForm(ok), {});
    assert.deepEqual(validateTripForm({ ...ok, consent: false }), { consent: 'required' });
    assert.deepEqual(validateTripForm({ ...ok, contactIds: [] }), { contactIds: 'required' });
    assert.deepEqual(validateTripForm({ ...ok, contactIds: ['1', '2', '3', '4', '5', '6'] }), { contactIds: 'limit_reached' });
    assert.deepEqual(validateTripForm({ ...ok, destinationLabel: ' ' , toleranceMinutes: 7 }), { destinationLabel: 'required', toleranceMinutes: 'required' });
  });

  test('Sinal de Alerta: dizer como tentou falar com a pessoa (10 a 500 letras)', () => {
    assert.equal(contactAttemptError(''), 'required');
    assert.equal(contactAttemptError('liguei'), 'too_short');
    assert.equal(contactAttemptError('Liguei 3 vezes às 22h e mandei mensagem'), null);
    assert.equal(contactAttemptError('x'.repeat(501)), 'too_long');
  });

  test('fila sem internet: uma posição por minuto, descarta inválidas e guarda as 30 mais recentes', () => {
    let queue = [];
    queue = queuePoint(queue, point(0));
    queue = queuePoint(queue, point(20));
    assert.equal(queue.length, 1, 'mesmo minuto: substitui');
    assert.equal(queue[0].recordedAt, point(20).recordedAt);
    queue = queuePoint(queue, point(10));
    assert.equal(queue.length, 1, 'mais antiga que a última: ignora');
    queue = queuePoint(queue, point(90, { accuracyMeters: 5000 }));
    queue = queuePoint(queue, point(95, { latitude: 0, longitude: 0 }));
    assert.equal(queue.length, 1);
    for (let i = 1; i <= 40; i += 1) queue = queuePoint(queue, point(i * 61));
    assert.equal(queue.length, POINT_QUEUE_MAX);
    assert.equal(queue.at(-1).recordedAt, point(40 * 61).recordedAt);
    const back = parsePointQueue(serializePointQueue(queue));
    assert.equal(back.length, POINT_QUEUE_MAX);
    assert.ok(serializePointQueue(queue).length < 2048, 'cabe no armazenamento seguro do aparelho');
    assert.deepEqual(parsePointQueue('não é json'), []);
  });

  test('trajeto ativo guardado no aparelho: some depois do prazo e recusa id estranho', () => {
    const raw = JSON.stringify({ tripId: '42', until: iso(60) });
    assert.deepEqual(parseActiveTripRef(raw, NOW), { tripId: '42', until: iso(60) });
    assert.equal(parseActiveTripRef(raw, at(61)), null);
    assert.equal(parseActiveTripRef(JSON.stringify({ tripId: '../x', until: iso(60) }), NOW), null);
  });
});

test('rótulo curto das opções de previsão', async () => {
  const { shortDuration } = await import('../src/lib/trip-rules.ts');
  assert.equal(shortDuration(45), '45 min');
  assert.equal(shortDuration(60), '1 h');
  assert.equal(shortDuration(90), '1 h 30');
  assert.equal(shortDuration(120), '2 h');
});
