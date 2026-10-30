import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  BIOMETRIC_ANALYSIS_ENABLED,
  aiSuggestedClass,
  auditEntry,
  buildTrajectory,
  camerasInRadius,
  can,
  canMovePreservation,
  classifyError,
  compassFromBearing,
  containsSecret,
  coverageLevel,
  decideAccess,
  distanceKm,
  isInstitutional,
  nextCamerasToCheck,
  nonBiometricFeatures,
  ownerCanSetAuthorization,
  preservationActor,
  preservationDeadline,
  preservationLetterText,
  preservationPriority,
  preservationWindowError,
  publicCoverage,
  recordingStatus,
  recordsAt,
  reliabilityChangeError,
  stepRadius,
  urgencyFor,
  validateCamera,
  validateOperation,
} from '../src/lib/vision-rules.ts';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const NOW = Date.parse('2026-10-30T12:00:00Z');

function camera(id, extra = {}) {
  return {
    id,
    name: `Câmera ${id}`,
    ownerId: 'owner-1',
    ownerName: 'Responsável fictício',
    source: 'commerce',
    latitude: -19.92,
    longitude: -43.94,
    region: 'Região Central (fictícia)',
    city: 'Cidade de demonstração',
    coverage: 'Calçada em frente à loja',
    equipment: 'Câmera fixa',
    retentionDays: 7,
    recordingsAvailable: true,
    integration: 'manual_upload',
    authorization: 'authorized',
    sharing: 'preservation_request',
    history: [],
    ...extra,
  };
}

const validInput = {
  name: 'Entrada da padaria',
  source: 'commerce',
  region: 'Centro',
  city: 'Belo Horizonte',
  coverage: 'Calçada e entrada da loja',
  equipment: 'Câmera fixa, 1080p',
  retentionDays: 7,
  integration: 'manual_upload',
  sharing: 'preservation_request',
  consent: true,
};

test('distância e direção', () => {
  const a = { latitude: -19.92, longitude: -43.94 };
  const b = { latitude: -19.91, longitude: -43.94 };
  assert.ok(Math.abs(distanceKm(a, b) - 1.11) < 0.02);
  assert.equal(compassFromBearing(0), 'N');
  assert.equal(compassFromBearing(44), 'NE');
  assert.equal(compassFromBearing(181), 'S');
  assert.equal(compassFromBearing(359), 'N');
  assert.equal(compassFromBearing(-90), 'W');
});

test('cadastro de câmera: válido e campos obrigatórios', () => {
  assert.deepEqual(validateCamera(validInput), []);
  const errors = validateCamera({ ...validInput, name: 'a', source: '', consent: false, retentionDays: 0, sharing: '' });
  for (const key of ['name', 'source', 'consent', 'retention', 'sharing']) assert.ok(errors.includes(key), key);
  assert.ok(validateCamera({ ...validInput, hoursStart: '08:00' }).includes('hours'));
  assert.deepEqual(validateCamera({ ...validInput, hoursStart: '18:00', hoursEnd: '06:00' }), []);
  assert.ok(validateCamera({ ...validInput, latitude: -19.9 }).includes('location'));
  assert.ok(validateCamera({ ...validInput, latitude: 120, longitude: 10 }).includes('location'));
});

test('cadastro de câmera nunca aceita senha, IP ou endereço de acesso', () => {
  assert.ok(containsSecret('rtsp://admin:1234@192.168.0.10/stream'));
  assert.ok(containsSecret('ip 192.168.0.10'));
  assert.ok(containsSecret('senha: 1234'));
  assert.ok(containsSecret('usuário = admin'));
  assert.ok(containsSecret('admin:segredo@camera'));
  assert.equal(containsSecret('Funciona das 08:00 às 18:00'), false);
  assert.equal(containsSecret('Câmera fixa 1080p, visão da calçada'), false);
  assert.ok(validateCamera({ ...validInput, equipment: 'rtsp://user:pass@10.0.0.2' }).includes('secret'));
});

test('responsável controla a participação; voltar passa por nova verificação', () => {
  assert.ok(ownerCanSetAuthorization('authorized', 'suspended'));
  assert.ok(ownerCanSetAuthorization('authorized', 'revoked'));
  assert.ok(ownerCanSetAuthorization('suspended', 'pending'));
  assert.equal(ownerCanSetAuthorization('suspended', 'authorized'), false);
  assert.equal(ownerCanSetAuthorization('revoked', 'revoked'), false);
});

test('cobertura pública: só região e nível, só câmeras autorizadas', () => {
  const cams = [
    ...Array.from({ length: 6 }, (_, i) => camera(`a${i}`)),
    camera('b1', { region: 'Região Norte (fictícia)' }),
    camera('b2', { region: 'Região Norte (fictícia)', authorization: 'revoked' }),
    camera('c1', { region: 'Região Sul (fictícia)', authorization: 'pending' }),
  ];
  const areas = publicCoverage(cams);
  assert.equal(areas.length, 2);
  assert.deepEqual(areas[0], { region: 'Região Central (fictícia)', city: 'Cidade de demonstração', level: 'high' });
  assert.equal(areas[1].level, 'low');
  for (const area of areas) {
    assert.deepEqual(Object.keys(area).sort(), ['city', 'level', 'region']);
  }
  assert.equal(coverageLevel(2), 'low');
  assert.equal(coverageLevel(3), 'medium');
  assert.equal(coverageLevel(6), 'high');
});

test('acesso por função: três ambientes e habilitação verificada', () => {
  const community = { role: 'community', verified: false };
  const agentPending = { role: 'agent', verified: false };
  const agent = { role: 'agent', verified: true };
  const coordinator = { role: 'coordinator', verified: true };
  const auditor = { role: 'auditor', verified: true };
  const technical = { role: 'technical', verified: true };

  assert.ok(can(null, 'view_coverage'));
  assert.equal(can(null, 'manage_own_cameras'), false);
  assert.ok(can(community, 'manage_own_cameras'));
  assert.equal(can(community, 'view_operations'), false);
  assert.equal(can(community, 'view_footage'), false);

  // Dizer que é autoridade não habilita nada.
  assert.equal(can(agentPending, 'view_operations'), false);
  assert.equal(isInstitutional(agentPending), false);

  assert.ok(can(agent, 'view_footage'));
  assert.equal(can(agent, 'classify_match'), false);
  assert.equal(can(agent, 'create_operation'), false);
  assert.ok(can(coordinator, 'classify_match'));
  assert.ok(can(coordinator, 'view_audit'));
  assert.ok(can(auditor, 'view_audit'));
  assert.equal(can(auditor, 'view_footage'), false);
  assert.equal(can(technical, 'view_operations'), false);
  assert.equal(can(technical, 'view_footage'), false);
  assert.ok(can(technical, 'view_technical_status'));
});

test('ações sensíveis exigem justificativa e ficam na auditoria (inclusive as negadas)', () => {
  const agent = { role: 'agent', verified: true };
  assert.deepEqual(decideAccess(agent, 'view_footage', 'curto'), { allowed: false, reason: 'justification' });
  assert.deepEqual(decideAccess(agent, 'view_footage', 'Verificar passagem às 18h37 na câmera A'), { allowed: true });
  assert.deepEqual(decideAccess({ role: 'community', verified: false }, 'view_footage', 'qualquer justificativa longa'), {
    allowed: false,
    reason: 'role',
  });
  const base = { id: 'x', at: new Date(NOW).toISOString(), actorId: 'u', actorName: 'U', role: 'community', action: 'view_footage', target: 'trecho 1' };
  assert.equal(auditEntry(base, { allowed: false, reason: 'role' }).result, 'denied');
  const ok = auditEntry({ ...base, role: 'agent' }, { allowed: true }, '  motivo registrado  ');
  assert.equal(ok.result, 'allowed');
  assert.equal(ok.justification, 'motivo registrado');
});

test('raio da operação anda um passo por vez, entre 0,5 e 20 km', () => {
  assert.equal(stepRadius(1, 'up'), 2);
  assert.equal(stepRadius(1, 'down'), 0.5);
  assert.equal(stepRadius(0.5, 'down'), 0.5);
  assert.equal(stepRadius(20, 'up'), 20);
  assert.equal(stepRadius(4, 'up'), 5);
});

test('operação: validação', () => {
  const input = {
    caseId: 'TESTE-1',
    lastKnown: { latitude: -19.92, longitude: -43.94 },
    lastKnownPlace: 'Praça fictícia',
    lastSeenAt: NOW - HOUR,
    radiusKm: 1,
    scope: 'Câmeras do entorno da praça entre 18h e 20h',
    justification: 'Busca autorizada pela autoridade responsável pelo caso',
  };
  assert.deepEqual(validateOperation(input, NOW), []);
  const errors = validateOperation({ ...input, lastSeenAt: NOW + DAY, radiusKm: 4, justification: 'x', lastKnown: {} }, NOW);
  for (const key of ['future', 'radius', 'justification', 'location']) assert.ok(errors.includes(key), key);
});

test('câmeras no raio: só participantes, da mais perto para a mais longe', () => {
  const center = { latitude: -19.92, longitude: -43.94 };
  const cams = [
    camera('longe', { latitude: -19.95 }),
    camera('perto', { latitude: -19.921 }),
    camera('meio', { latitude: -19.925 }),
    camera('revogada', { latitude: -19.9201, authorization: 'revoked' }),
  ];
  assert.deepEqual(
    camerasInRadius(cams, center, 1).map((item) => item.camera.id),
    ['perto', 'meio'],
  );
});

test('gravações: prazo de guarda, horário e câmera sem gravação', () => {
  const seenAt = NOW - 2 * DAY;
  assert.equal(recordingStatus(camera('a', { retentionDays: 7 }), seenAt, 18 * 60, NOW).status, 'available');
  assert.equal(recordingStatus(camera('a', { retentionDays: 2 }), seenAt + 2 * HOUR, 18 * 60, NOW).status, 'expiring');
  assert.equal(recordingStatus(camera('a', { retentionDays: 1 }), seenAt, 18 * 60, NOW).status, 'possibly_deleted');
  assert.equal(recordingStatus(camera('a', { recordingsAvailable: false }), seenAt, 18 * 60, NOW).status, 'no_recording');
  assert.equal(
    recordingStatus(camera('a', { hoursStart: '08:00', hoursEnd: '18:00' }), seenAt, 18 * 60 + 30, NOW).status,
    'outside_hours',
  );
  assert.ok(recordsAt({ hoursStart: '18:00', hoursEnd: '06:00' }, 23 * 60));
  assert.ok(recordsAt({ hoursStart: '18:00', hoursEnd: '06:00' }, 5 * 60));
  assert.equal(recordsAt({ hoursStart: '18:00', hoursEnd: '06:00' }, 12 * 60), false);

  const order = preservationPriority([
    { id: 'apagada', recording: { status: 'possibly_deleted' }, distanceKm: 0.1 },
    { id: 'normal', recording: { status: 'available', expiresAt: NOW + 5 * DAY }, distanceKm: 0.1 },
    { id: 'vence', recording: { status: 'expiring', expiresAt: NOW + HOUR }, distanceKm: 0.9 },
  ]).map((item) => item.id);
  assert.deepEqual(order, ['vence', 'normal', 'apagada']);
});

test('pedido de preservação: fluxo, intervalo, prazo e urgência', () => {
  assert.ok(canMovePreservation('draft', 'sent'));
  assert.ok(canMovePreservation('sent', 'accepted'));
  assert.ok(canMovePreservation('accepted', 'images_received'));
  assert.equal(canMovePreservation('draft', 'images_received'), false);
  assert.equal(canMovePreservation('declined', 'accepted'), false);
  assert.equal(preservationActor('accepted'), 'owner');
  assert.equal(preservationActor('declined'), 'owner');
  assert.equal(preservationActor('sent'), 'institution');

  assert.equal(preservationWindowError(NOW - HOUR, NOW - 2 * HOUR, NOW), 'order');
  assert.equal(preservationWindowError(NOW - 20 * HOUR, NOW - HOUR, NOW), 'too_long');
  assert.equal(preservationWindowError(NOW + HOUR, NOW + 2 * HOUR, NOW), 'future');
  assert.equal(preservationWindowError(NOW - 3 * HOUR, NOW - HOUR, NOW), undefined);

  assert.equal(preservationDeadline(NOW, 7), NOW + 7 * DAY);
  assert.equal(urgencyFor(NOW - 1, NOW), 'overdue');
  assert.equal(urgencyFor(NOW + 2 * HOUR, NOW), 'urgent');
  assert.equal(urgencyFor(NOW + 2 * DAY, NOW), 'soon');
  assert.equal(urgencyFor(NOW + 5 * DAY, NOW), 'normal');
});

test('texto do pedido de preservação não expõe a pessoa e não obriga o responsável', () => {
  const text = preservationLetterText({
    requestId: 'PP-TESTE-1',
    cameraName: 'Câmera 01',
    ownerName: 'Responsável fictício',
    region: 'Centro',
    city: 'Cidade',
    fromText: '30/10/2026 18:00',
    toText: '30/10/2026 19:00',
    deadlineText: '06/11/2026 18:00',
    caseReference: 'TESTE-1',
    institution: 'Instituição fictícia',
    requesterName: 'Agente fictício',
    contact: 'contato@exemplo.org',
  });
  assert.match(text, /PP-TESTE-1/);
  assert.match(text, /depende da sua autorização/);
  assert.match(text, /TESTE-1/);
  assert.doesNotMatch(text, /encontrad/i);
});

test('análise visual: sem biometria e sem "pessoa encontrada"', () => {
  assert.equal(BIOMETRIC_ANALYSIS_ENABLED, false);
  const kept = nonBiometricFeatures([
    { kind: 'clothing_color', value: 'camiseta vermelha' },
    { kind: 'backpack', value: 'mochila preta' },
    { kind: 'other', value: 'formato do rosto' },
    { kind: 'face', value: 'semelhança facial' },
    { kind: 'other', value: 'modo de andar' },
  ]);
  assert.deepEqual(
    kept.map((feature) => feature.value),
    ['camiseta vermelha', 'mochila preta'],
  );

  assert.equal(aiSuggestedClass(0.9), 'probable');
  assert.equal(aiSuggestedClass(0.5), 'inconclusive');
  assert.equal(aiSuggestedClass(0.2), null);
  for (const value of [0, 0.3, 0.5, 0.8, 0.99, 1]) {
    assert.notEqual(aiSuggestedClass(value), 'confirmed');
    assert.notEqual(aiSuggestedClass(value), 'discarded');
  }
});

test('classificar correspondência: justificativa e trecho revisto antes de confirmar', () => {
  const note = 'Roupas e mochila conferem com a descrição da família';
  assert.equal(classifyError('probable', 'probable', note, true), 'same');
  assert.equal(classifyError('probable', 'confirmed', 'curto', true), 'note');
  assert.equal(classifyError('probable', 'confirmed', note, false), 'clip_not_reviewed');
  assert.equal(classifyError('probable', 'confirmed', note, true), undefined);
  assert.equal(classifyError('probable', 'discarded', note, false), undefined);
});

test('trajeto: fatos, hipóteses, inconclusivos e descartados', () => {
  const t0 = Date.parse('2026-10-29T21:30:00Z');
  const last = { latitude: -19.92, longitude: -43.94, at: t0, label: 'Praça fictícia' };
  const match = (id, minutes, lat, classification, extra = {}) => ({
    id,
    cameraId: `cam-${id}`,
    cameraName: `Câmera ${id}`,
    region: 'Centro',
    latitude: lat,
    longitude: -43.94,
    seenAt: t0 + minutes * 60000,
    confidence: 0.8,
    classification,
    ...extra,
  });
  const result = buildTrajectory(last, [
    match('C', 21, -19.905, 'probable'),
    match('A', 7, -19.915, 'confirmed'),
    match('B', 14, -19.91, 'probable'),
    match('X', 10, -19.93, 'discarded'),
    match('I', 12, -19.925, 'inconclusive'),
    match('antes', -30, -19.921, 'probable'),
  ]);
  assert.ok(result.sufficient);
  assert.deepEqual(
    result.points.map((point) => point.id),
    ['last-known', 'A', 'B', 'C'],
  );
  assert.deepEqual(
    result.points.map((point) => point.certainty),
    ['fact', 'confirmed', 'hypothesis', 'hypothesis'],
  );
  assert.deepEqual(
    result.loosePoints.map((point) => point.id),
    ['antes', 'I'],
  );
  assert.equal(result.segments.length, 3);
  assert.equal(result.segments[0].hypothetical, false);
  assert.equal(result.segments[1].hypothetical, true);
  assert.equal(result.segments[0].direction, 'N');
  assert.equal(result.overallDirection, 'N');
  assert.ok(result.segments.every((segment) => segment.plausible));

  const impossible = buildTrajectory(last, [match('longe', 5, -19.5, 'probable')]);
  assert.equal(impossible.segments[0].plausible, false);
});

test('trajeto: sem evidência não inventa caminho', () => {
  const last = { latitude: -19.92, longitude: -43.94, at: NOW, label: 'Praça' };
  const none = buildTrajectory(last, []);
  assert.equal(none.sufficient, false);
  assert.equal(none.reason, 'no_evidence');
  assert.equal(none.segments.length, 0);

  const onlyWeak = buildTrajectory(last, [
    { id: 'i', cameraId: 'c', cameraName: 'C', region: 'R', latitude: -19.91, longitude: -43.94, seenAt: NOW + 60000, confidence: 0.5, classification: 'inconclusive' },
    { id: 'd', cameraId: 'd', cameraName: 'D', region: 'R', latitude: -19.91, longitude: -43.94, seenAt: NOW + 60000, confidence: 0.9, classification: 'discarded' },
  ]);
  assert.equal(onlyWeak.sufficient, false);
  assert.equal(onlyWeak.segments.length, 0);
  assert.equal(onlyWeak.loosePoints.length, 1);

  assert.equal(buildTrajectory(null, []).reason, 'no_last_known');
});

test('próximas câmeras: perto do último ponto, sem pedido, na direção do deslocamento primeiro', () => {
  const t0 = NOW;
  const last = { latitude: -19.92, longitude: -43.94, at: t0, label: 'Praça' };
  const trajectory = buildTrajectory(last, [
    { id: 'm1', cameraId: 'cam-1', cameraName: 'C1', region: 'R', latitude: -19.915, longitude: -43.94, seenAt: t0 + 5 * 60000, confidence: 0.9, classification: 'confirmed' },
  ]);
  const cams = [
    camera('cam-1', { latitude: -19.915 }),
    camera('norte', { latitude: -19.91 }),
    camera('sul', { latitude: -19.917 }),
    camera('pedida', { latitude: -19.912 }),
    camera('longe', { latitude: -19.85 }),
  ];
  const next = nextCamerasToCheck(cams, trajectory, ['pedida']);
  assert.deepEqual(
    next.map((item) => item.camera.id),
    ['norte', 'sul'],
  );
  assert.equal(next[0].onTheWay, true);
  assert.equal(next[1].onTheWay, false);
  assert.deepEqual(nextCamerasToCheck(cams, buildTrajectory(last, []), []), []);
});

test('confiabilidade das informações: muda com justificativa', () => {
  assert.equal(reliabilityChangeError('unrated', 'high', 'Confirmado com o comerciante por telefone'), undefined);
  assert.equal(reliabilityChangeError('high', 'high', 'Confirmado com o comerciante por telefone'), 'same');
  assert.equal(reliabilityChangeError('unrated', 'low', 'curto'), 'note');
  assert.equal(reliabilityChangeError('low', 'unrated', 'Justificativa suficiente aqui'), 'invalid');
});
