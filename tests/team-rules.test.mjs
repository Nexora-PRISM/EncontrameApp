// Testes do Painel da equipe e da rede de busca. Rodar com `npm test`.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  aiIndication,
  ALERT_LIMITS,
  connectionCanTriggerAlert,
  distanceKm,
  expansionError,
  nextExpansionLevels,
  normalizeConnectionStatus,
  normalizeLevel,
  shouldSendAlert,
} from '../src/lib/search-network-rules.ts';
import {
  allowedStatusTransitions,
  canChangeStatus,
  justificationError,
  normalizeReportReason,
  normalizeReportTarget,
  sortReportsForReview,
} from '../src/lib/team-rules.ts';

describe('situação do caso', () => {
  it('segue as transições do servidor', () => {
    assert.deepEqual(allowedStatusTransitions(1), [2, 4, 99]);
    assert.deepEqual(allowedStatusTransitions(2), [4, 3, 99]);
    assert.equal(canChangeStatus(4, 2), true);
    assert.equal(canChangeStatus(2, 1), false);
  });

  it('Encontrado e Cancelado são finais', () => {
    assert.deepEqual(allowedStatusTransitions(3), []);
    assert.deepEqual(allowedStatusTransitions(99), []);
  });

  it('sem situação, vale Pendente', () => {
    assert.deepEqual(allowedStatusTransitions(undefined), [2, 4, 99]);
  });

  it('exige justificativa de pelo menos 10 letras', () => {
    assert.equal(justificationError(''), 'required');
    assert.equal(justificationError('ok'), 'too_short');
    assert.equal(justificationError('Família confirmou por telefone'), undefined);
    assert.equal(justificationError('x'.repeat(501)), 'too_long');
  });
});

describe('denúncias', () => {
  it('normaliza alvo e motivo', () => {
    assert.equal(normalizeReportTarget('SafetyNote'), 'SafetyNote');
    assert.equal(normalizeReportTarget('User'), 'other');
    assert.equal(normalizeReportReason('scam'), 'scam');
    assert.equal(normalizeReportReason('spam'), 'other');
  });

  it('golpe e informação falsa vêm primeiro, depois as mais antigas', () => {
    const sorted = sortReportsForReview([
      { id: 'a', reason: 'abuse', createdAt: '2026-10-01T00:00:00Z' },
      { id: 'b', reason: 'false_info', createdAt: '2026-10-03T00:00:00Z' },
      { id: 'c', reason: 'scam', createdAt: '2026-10-05T00:00:00Z' },
      { id: 'd', reason: 'false_info', createdAt: '2026-10-02T00:00:00Z' },
    ]);
    assert.deepEqual(sorted.map((item) => item.id), ['c', 'd', 'b', 'a']);
  });
});

describe('ampliação da busca', () => {
  it('só amplia para níveis maiores', () => {
    assert.deepEqual(nextExpansionLevels('state'), ['country', 'international']);
    assert.equal(expansionError('city', 'neighbors', false), undefined);
    assert.equal(expansionError('city', 'city', false), 'same_or_smaller');
    assert.equal(expansionError('state', 'city', false), 'same_or_smaller');
  });

  it('não amplia com alertas pausados', () => {
    assert.equal(expansionError('city', 'state', true), 'paused');
  });

  it('nível desconhecido vira bairro', () => {
    assert.equal(normalizeLevel('galaxy'), 'neighborhood');
  });
});

describe('limite de alertas', () => {
  const hour = 60 * 60 * 1000;
  const now = 100 * ALERT_LIMITS.dayMs;

  it('nunca repete a mesma informação do mesmo caso', () => {
    const history = [{ caseId: '1', at: now - 30 * hour, infoVersion: 1 }];
    assert.deepEqual(shouldSendAlert(history, { caseId: '1', infoVersion: 1 }, now), { send: false, reason: 'same_info' });
    assert.deepEqual(shouldSendAlert(history, { caseId: '1', infoVersion: 2 }, now), { send: true });
  });

  it('no máximo 3 alertas a cada 24 horas', () => {
    const history = [1, 2, 3].map((n) => ({ caseId: String(n), at: now - n * hour, infoVersion: 1 }));
    assert.deepEqual(shouldSendAlert(history, { caseId: '9', infoVersion: 1 }, now), { send: false, reason: 'daily_limit' });
    const old = history.map((item) => ({ ...item, at: item.at - ALERT_LIMITS.dayMs }));
    assert.deepEqual(shouldSendAlert(old, { caseId: '9', infoVersion: 1 }, now), { send: true });
  });

  it('nada sai com alertas pausados', () => {
    assert.deepEqual(shouldSendAlert([], { caseId: '1', infoVersion: 1, paused: true }, now), { send: false, reason: 'paused' });
  });
});

describe('teia e IA', () => {
  it('só conexão validada por pessoa gera nova divulgação', () => {
    assert.equal(connectionCanTriggerAlert('validated'), true);
    assert.equal(connectionCanTriggerAlert('suggested'), false);
    assert.equal(normalizeConnectionStatus('outra'), 'pending');
  });

  it('pontuação da IA é só indicação, nunca confirmação', () => {
    assert.equal(aiIndication(0.2), 'weak');
    assert.equal(aiIndication(0.65), 'moderate');
    assert.equal(aiIndication(0.95), 'strong');
    assert.equal(aiIndication(Number.NaN), 'weak');
  });

  it('calcula distâncias', () => {
    const bh = { latitude: -19.9167, longitude: -43.9345 };
    const contagem = { latitude: -19.9321, longitude: -44.0539 };
    const km = distanceKm(bh, contagem);
    assert.ok(km > 12 && km < 13.5, `distância ${km}`);
    assert.equal(distanceKm(bh, bh), 0);
  });
});
