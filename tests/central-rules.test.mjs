import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  appendAudit,
  buildManifest,
  centralCan,
  centralDecide,
  checkFileAgainstManifest,
  closureError,
  crossTips,
  defaultSelection,
  endMobilization,
  isInstitutionalEmail,
  linkHoursError,
  linkStatus,
  manifestText,
  movementHypothesis,
  needsSecondApproval,
  nextMobilizationRadius,
  notifyDecision,
  overallHealth,
  passphraseFromBytes,
  publicViewAfterClosure,
  redactPersonalData,
  retentionState,
  splitTip,
  textSimilarity,
  validateConfidentialTip,
  validateExport,
  verifyAuditChain,
} from '../src/lib/central-rules.ts';
import { sha256Hex, sha256Text, utf8Bytes } from '../src/lib/sha256.ts';

const HOUR = 3600000;
const NOW = Date.parse('2026-10-30T12:00:00Z');

test('funções: público nada, analista sem exportar, administrador com MFA, técnico sem dossiês', () => {
  const analyst = { role: 'analyst', verified: true, mfa: true };
  const admin = { role: 'admin', verified: true, mfa: true };
  const adminNoMfa = { role: 'admin', verified: true, mfa: false };
  const adminPending = { role: 'admin', verified: false, mfa: true };
  const technical = { role: 'technical', verified: true, mfa: true };
  const auditor = { role: 'auditor', verified: true, mfa: true };
  const note = 'Requisição do delegado responsável pelo caso';

  assert.equal(centralCan({ role: 'public', verified: false, mfa: false }, 'view_dossiers'), false);
  assert.ok(centralCan(analyst, 'view_dossiers'));
  assert.equal(centralCan(analyst, 'export_dossier'), false);
  assert.equal(centralCan(analyst, 'view_witness_identity'), false);
  assert.equal(centralCan(adminPending, 'view_dossiers'), false);
  assert.deepEqual(centralDecide(admin, 'export_dossier', note), { allowed: true });
  assert.deepEqual(centralDecide(adminNoMfa, 'export_dossier', note), { allowed: false, reason: 'mfa' });
  assert.deepEqual(centralDecide(admin, 'export_dossier', 'curto'), { allowed: false, reason: 'justification' });
  assert.equal(centralCan(technical, 'view_dossiers'), false);
  assert.equal(centralCan(technical, 'export_dossier'), false);
  assert.ok(centralCan(technical, 'view_technical'));
  assert.ok(centralCan(auditor, 'view_audit'));
  assert.equal(centralCan(auditor, 'view_dossiers'), false);
});

test('auditoria encadeada: alterar, apagar ou reordenar quebra a verificação', () => {
  let chain = [];
  for (const target of ['dossiê 1', 'pista 3', 'exportação 7']) {
    chain = appendAudit(
      chain,
      { at: new Date(NOW).toISOString(), actorName: 'Admin fictício', role: 'admin', action: 'view_dossiers', target, result: 'allowed' },
      sha256Text,
    );
  }
  assert.deepEqual(verifyAuditChain(chain, sha256Text), { ok: true });
  const edited = chain.map((entry, index) => (index === 1 ? { ...entry, target: 'outra coisa' } : entry));
  assert.deepEqual(verifyAuditChain(edited, sha256Text), { ok: false, brokenAt: 2 });
  assert.equal(verifyAuditChain([chain[0], chain[2]], sha256Text).ok, false);
  assert.equal(verifyAuditChain([chain[1], chain[0], chain[2]], sha256Text).ok, false);
  assert.equal(chain[0].prevHash, '0'.repeat(64));
  assert.equal(chain[1].prevHash, chain[0].hash);
});

test('pista confidencial: validação e separação da identidade', () => {
  const base = { text: 'Vi uma pessoa parecida no ponto de ônibus perto da praça.', contactPreference: 'none', understood: true };
  assert.deepEqual(validateConfidentialTip(base), []);
  assert.ok(validateConfidentialTip({ ...base, text: 'curto' }).includes('text_short'));
  assert.ok(validateConfidentialTip({ ...base, understood: false }).includes('understood'));
  assert.ok(validateConfidentialTip({ ...base, contactPreference: 'phone', contact: '123' }).includes('contact'));
  assert.ok(validateConfidentialTip({ ...base, contactPreference: 'email', contact: 'x' }).includes('contact'));

  const anonymous = splitTip(base);
  assert.equal(anonymous.identity, null);
  assert.equal(anonymous.tip.hasIdentity, false);

  const identified = splitTip({ ...base, name: 'Maria', contactPreference: 'phone', contact: '(31) 99999-0000' });
  assert.deepEqual(Object.keys(identified.tip).sort(), ['caseId', 'hasIdentity', 'place', 'text', 'when']);
  assert.equal(JSON.stringify(identified.tip).includes('Maria'), false);
  assert.equal(JSON.stringify(identified.tip).includes('99999'), false);
  assert.equal(identified.identity.name, 'Maria');
  assert.equal(identified.tip.hasIdentity, true);
});

test('ocultação de dados pessoais', () => {
  const { text, count } = redactPersonalData(
    'CPF 123.456.789-09, tel (31) 99876-5432, email joao@exemplo.com, CEP 30140-071, placa ABC1D23.',
  );
  assert.equal(count, 5);
  for (const leaked of ['123.456', '99876', 'joao@', '30140', 'ABC1D23']) assert.equal(text.includes(leaked), false, leaked);
  assert.equal(redactPersonalData('Camiseta vermelha às 18h30').count, 0);
});

test('exportação: seleção protetora, destinatário institucional, segunda aprovação', () => {
  const items = [
    { id: 'summary', kind: 'summary', label: 'Resumo', sensitivity: 'normal' },
    { id: 'tip1', kind: 'tip', label: 'Pista', sensitivity: 'personal' },
    { id: 'bo', kind: 'file', label: 'Boletim', sensitivity: 'confidential' },
    { id: 'wit', kind: 'note', label: 'Identidade da testemunha', sensitivity: 'witness_identity' },
  ];
  const selection = defaultSelection(items);
  assert.deepEqual(selection.summary, { include: true, redact: false });
  assert.deepEqual(selection.tip1, { include: true, redact: true });
  assert.equal(selection.bo.include, false);
  assert.equal(selection.wit.include, false);
  assert.equal(needsSecondApproval(items, selection), false);

  assert.ok(isInstitutionalEmail('delegacia@pc.mg.gov.br'));
  assert.ok(isInstitutionalEmail('promotoria@mpmg.mp.br'));
  assert.equal(isInstitutionalEmail('alguem@gmail.com'), false);

  const request = {
    purpose: 'Instrução do inquérito sobre o desaparecimento',
    legalBasis: 'authority_request',
    recipient: { institution: 'Delegacia fictícia', name: 'Delegada fictícia', email: 'delegacia@pc.mg.gov.br' },
    recipientConfirmed: true,
    requesterName: 'Admin A',
    authorizerName: 'Admin A',
    items,
    selection,
  };
  assert.deepEqual(validateExport(request), []);
  const withWitness = { ...request, selection: { ...selection, wit: { include: true, redact: false } } };
  assert.ok(needsSecondApproval(items, withWitness.selection));
  assert.ok(validateExport(withWitness).includes('second_approval'));
  assert.deepEqual(validateExport({ ...withWitness, authorizerName: 'Admin B' }), []);
  const bad = validateExport({
    ...request,
    purpose: 'x',
    legalBasis: '',
    recipient: { institution: 'X', name: '', email: 'a@gmail.com' },
    recipientConfirmed: false,
    selection: Object.fromEntries(items.map((item) => [item.id, { include: false, redact: false }])),
  });
  for (const key of ['purpose', 'legal_basis', 'recipient', 'recipient_email', 'recipient_confirmed', 'empty']) {
    assert.ok(bad.includes(key), key);
  }
});

test('manifesto: hash de cada arquivo, verificação e aviso de que hash não é certificação', () => {
  const files = [
    { path: 'relatorio.html', bytes: utf8Bytes('<h1>Relatório</h1>'), origin: 'Gerado na exportação', original: false },
    { path: 'anexos/foto.svg', bytes: utf8Bytes('<svg/>'), origin: 'Enviado pela família', original: true, receivedAt: '2026-10-29T10:00:00Z' },
  ];
  const manifest = buildManifest(
    files,
    {
      caseReference: 'TESTE-1',
      generatedAt: '2026-10-30T12:00:00Z',
      generatedBy: 'Admin A',
      authorizedBy: 'Admin B',
      purpose: 'Finalidade de teste com texto suficiente',
      legalBasis: 'court_order',
      recipient: { institution: 'Vara fictícia', name: 'Servidor fictício', email: 'vara@tjmg.jus.br' },
    },
    sha256Hex,
  );
  assert.equal(manifest.files[1].sha256, sha256Hex(files[1].bytes));
  assert.equal(manifest.files[1].original, true);
  assert.match(manifest.notice, /não certifica/);
  assert.equal(checkFileAgainstManifest(manifest, 'anexos/foto.svg', sha256Hex(files[1].bytes)), 'ok');
  assert.equal(checkFileAgainstManifest(manifest, 'anexos/foto.svg', sha256Text('alterado')), 'changed');
  assert.equal(checkFileAgainstManifest(manifest, 'renomeado.svg', sha256Hex(files[1].bytes)), 'ok');
  assert.equal(checkFileAgainstManifest(manifest, 'outro.txt', sha256Text('x')), 'not_listed');
  const text = manifestText(manifest);
  assert.match(text, /cópia controlada/);
  assert.match(text, new RegExp(sha256Hex(files[0].bytes)));
});

test('entrega: prazo do link, situação e senha em blocos', () => {
  assert.equal(linkHoursError(0), 'range');
  assert.equal(linkHoursError(200), 'range');
  assert.equal(linkHoursError(48), undefined);
  const link = { id: 'l', createdAt: '', expiresAt: new Date(NOW + HOUR).toISOString(), accesses: 0 };
  assert.equal(linkStatus(link, NOW), 'active');
  assert.equal(linkStatus(link, NOW + 2 * HOUR), 'expired');
  assert.equal(linkStatus({ ...link, revokedAt: 'x' }, NOW), 'revoked');
  const pass = passphraseFromBytes(Uint8Array.from({ length: 24 }, (_, i) => i * 11));
  assert.match(pass, /^[A-Z2-9]{4}(-[A-Z2-9]{4}){5}$/);
  assert.doesNotMatch(pass, /[IO01]/);
});

test('cruzamento de pistas: relacionadas, duplicadas, divergentes e sequência (hipótese)', () => {
  const t0 = NOW;
  const tips = [
    { id: 'a', text: 'Pessoa de mochila preta e camiseta vermelha perto da padaria', at: t0, latitude: -19.92, longitude: -43.938 },
    { id: 'b', text: 'Vi pessoa de camiseta vermelha e mochila preta perto da padaria', at: t0 + 20 * 60000, latitude: -19.9202, longitude: -43.9381 },
    { id: 'c', text: 'Alguém parecido no ponto de ônibus da avenida', at: t0 + 40 * 60000, latitude: -19.915, longitude: -43.936 },
    { id: 'd', text: 'Vista em outra cidade, na rodoviária', at: t0 + 10 * 60000, latitude: -19.7, longitude: -44.1 },
  ];
  const links = crossTips(tips);
  const find = (kind, a, b) => links.find((link) => link.kind === kind && link.a === a && link.b === b);
  assert.ok(find('duplicate', 'a', 'b'));
  assert.ok(find('related', 'a', 'c'));
  assert.ok(find('divergence', 'a', 'd'));
  assert.ok(textSimilarity(tips[0].text, tips[1].text) >= 0.6);
  assert.deepEqual(movementHypothesis(tips), ['a', 'b', 'c']);
  assert.deepEqual(movementHypothesis([tips[0]]), []);
});

test('mobilização: raio em passos, limite de alertas e fim no encerramento', () => {
  assert.equal(nextMobilizationRadius(2), 5);
  assert.equal(nextMobilizationRadius(100), null);
  const base = { optedIn: true, insideActiveArea: true, caseActive: true, sentAt: [], now: NOW };
  assert.deepEqual(notifyDecision(base), { send: true });
  assert.deepEqual(notifyDecision({ ...base, optedIn: false }), { send: false, reason: 'not_opted_in' });
  assert.deepEqual(notifyDecision({ ...base, insideActiveArea: false }), { send: false, reason: 'outside_area' });
  assert.deepEqual(notifyDecision({ ...base, caseActive: false }), { send: false, reason: 'case_closed' });
  assert.deepEqual(notifyDecision({ ...base, sentAt: [NOW - HOUR, NOW - 2 * HOUR, NOW - 3 * HOUR] }), {
    send: false,
    reason: 'daily_limit',
  });
  assert.deepEqual(notifyDecision({ ...base, lastForCase: NOW - 2 * HOUR }), { send: false, reason: 'too_soon' });
  const ended = endMobilization([
    { id: '1', label: 'A', latitude: 0, longitude: 0, radiusKm: 5, status: 'active', reason: 'x' },
    { id: '2', label: 'B', latitude: 0, longitude: 0, radiusKm: 10, status: 'paused', reason: 'y' },
  ]);
  assert.ok(ended.every((area) => area.status === 'ended'));
});

test('encerramento: protege a pessoa encontrada e exige justificativa', () => {
  assert.deepEqual(publicViewAfterClosure('found'), {
    status: 'located',
    showPhoto: false,
    showLastPlace: false,
    showDetails: false,
  });
  assert.equal(closureError({ outcome: 'found', justification: 'curto', legalHolds: 0 }), 'justification');
  assert.equal(closureError({ outcome: 'found', justification: 'Pessoa localizada e família confirmou', legalHolds: 1 }), undefined);
});

test('retenção: preservação legal vence o prazo', () => {
  const created = NOW - 400 * 24 * HOUR;
  assert.equal(retentionState(created, 365, false, NOW), 'review_disposal');
  assert.equal(retentionState(created, 365, true, NOW), 'legal_hold');
  assert.equal(retentionState(NOW - 10 * 24 * HOUR, 365, false, NOW), 'keep');
});

test('saúde técnica geral', () => {
  assert.equal(overallHealth(['ok', 'ok', 'not_connected']), 'ok');
  assert.equal(overallHealth(['ok', 'degraded']), 'degraded');
  assert.equal(overallHealth(['down', 'ok']), 'down');
  assert.equal(overallHealth(['not_connected']), 'not_connected');
});
