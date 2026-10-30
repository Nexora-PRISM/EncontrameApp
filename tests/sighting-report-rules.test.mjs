// Testes das regras do relato de avistamento. Rodar com `npm test` (node --test, sem dependências).
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  checkRateLimit,
  formatDateBr,
  formatTimeBr,
  isConfirmedReceipt,
  maskTime,
  normalizeSightingStatus,
  optionalText,
  parseSeenAt,
  retryMinutes,
  SIGHTING_RATE_LIMIT,
  SIGHTING_STATUSES,
  validateSightingTexts,
} from '../src/lib/sighting-report-rules.ts';

const EMPTY_TEXTS = { description: '', clothes: '', features: '', direction: '', reference: '', details: '' };

describe('situação do relato', () => {
  it('aceita os valores do contrato', () => {
    for (const status of SIGHTING_STATUSES) assert.equal(normalizeSightingStatus(status), status);
  });

  it('aceita os nomes em português, com ou sem acento', () => {
    assert.equal(normalizeSightingStatus('Aguardando análise'), 'pending_review');
    assert.equal(normalizeSightingStatus('EM ANALISE'), 'in_review');
    assert.equal(normalizeSightingStatus('Não confirmado'), 'not_confirmed');
    assert.equal(normalizeSightingStatus('Informação considerada relevante'), 'relevant');
    assert.equal(normalizeSightingStatus('encerrado'), 'closed');
  });

  it('valor desconhecido ou ausente fica como "recebido", sem afirmar mais nada', () => {
    assert.equal(normalizeSightingStatus('confirmado'), 'received');
    assert.equal(normalizeSightingStatus(undefined), 'received');
    assert.equal(normalizeSightingStatus(3), 'received');
  });
});

describe('confirmação de recebimento', () => {
  it('só confirma com número e horário válidos', () => {
    assert.equal(isConfirmedReceipt({ reportId: 'R-1', receivedAt: '2026-10-30T15:00:00Z' }), true);
    assert.equal(isConfirmedReceipt({ reportId: 'R-1' }), false);
    assert.equal(isConfirmedReceipt({ receivedAt: '2026-10-30T15:00:00Z' }), false);
    assert.equal(isConfirmedReceipt({ reportId: '  ', receivedAt: '2026-10-30T15:00:00Z' }), false);
    assert.equal(isConfirmedReceipt({ reportId: 'R-1', receivedAt: 'ontem' }), false);
    assert.equal(isConfirmedReceipt(null), false);
  });
});

describe('data e horário do avistamento', () => {
  const now = new Date(2026, 9, 30, 14, 0, 0); // 30/10/2026 14:00, horário local

  it('formata data e horário locais', () => {
    assert.equal(formatDateBr(new Date(2026, 0, 5, 9, 7)), '05/01/2026');
    assert.equal(formatTimeBr(new Date(2026, 0, 5, 9, 7)), '09:07');
  });

  it('aplica a máscara de horário', () => {
    assert.equal(maskTime('1'), '1');
    assert.equal(maskTime('143'), '14:3');
    assert.equal(maskTime('14h35'), '14:35');
    assert.equal(maskTime('143599'), '14:35');
  });

  it('aceita um momento válido no passado e devolve ISO', () => {
    const result = parseSeenAt('30/10/2026', '13:30', now);
    assert.equal(result.ok, true);
    assert.equal(result.iso, new Date(2026, 9, 30, 13, 30).toISOString());
  });

  it('tolera relógio adiantado em até 5 minutos', () => {
    assert.equal(parseSeenAt('30/10/2026', '14:04', now).ok, true);
    assert.deepEqual(parseSeenAt('30/10/2026', '14:30', now), { ok: false, field: 'time', error: 'time_future' });
  });

  it('recusa data vazia, inválida, inexistente ou futura', () => {
    assert.deepEqual(parseSeenAt('', '10:00', now), { ok: false, field: 'date', error: 'date_required' });
    assert.deepEqual(parseSeenAt('3/10/2026', '10:00', now), { ok: false, field: 'date', error: 'date_invalid' });
    assert.deepEqual(parseSeenAt('31/02/2026', '10:00', now), { ok: false, field: 'date', error: 'date_invalid' });
    assert.deepEqual(parseSeenAt('01/01/1800', '10:00', now), { ok: false, field: 'date', error: 'date_invalid' });
    assert.deepEqual(parseSeenAt('31/10/2026', '10:00', now), { ok: false, field: 'date', error: 'date_future' });
  });

  it('recusa horário vazio ou inválido', () => {
    assert.deepEqual(parseSeenAt('29/10/2026', '', now), { ok: false, field: 'time', error: 'time_required' });
    assert.deepEqual(parseSeenAt('29/10/2026', '25:00', now), { ok: false, field: 'time', error: 'time_invalid' });
    assert.deepEqual(parseSeenAt('29/10/2026', '10:7', now), { ok: false, field: 'time', error: 'time_invalid' });
  });
});

describe('textos do relato', () => {
  it('exige a descrição com pelo menos 10 letras', () => {
    assert.deepEqual(validateSightingTexts(EMPTY_TEXTS), { description: 'required' });
    assert.deepEqual(validateSightingTexts({ ...EMPTY_TEXTS, description: 'curto' }), { description: 'too_short' });
    assert.deepEqual(validateSightingTexts({ ...EMPTY_TEXTS, description: 'Estava sentada no ponto de ônibus' }), {});
  });

  it('limita o tamanho dos campos opcionais', () => {
    const long = 'x'.repeat(301);
    const errors = validateSightingTexts({ ...EMPTY_TEXTS, description: 'Descrição suficiente', clothes: long, details: 'y'.repeat(1001) });
    assert.deepEqual(errors, { clothes: 'too_long', details: 'too_long' });
  });

  it('texto opcional vazio não vai para a API', () => {
    assert.equal(optionalText('   '), undefined);
    assert.equal(optionalText('  casaco azul '), 'casaco azul');
  });
});

describe('limite contra envios repetidos', () => {
  const minute = 60 * 1000;
  const now = 1_000 * minute;

  it('permite até 3 relatos em 10 minutos', () => {
    assert.equal(checkRateLimit([], now).allowed, true);
    assert.equal(checkRateLimit([now - 2 * minute, now - minute], now).allowed, true);
  });

  it('bloqueia o quarto e diz quando liberar', () => {
    const result = checkRateLimit([now - 8 * minute, now - 5 * minute, now - minute], now);
    assert.equal(result.allowed, false);
    assert.equal(result.retryInMs, 2 * minute);
    assert.equal(retryMinutes(result.retryInMs), 2);
  });

  it('esquece envios fora da janela', () => {
    const old = now - SIGHTING_RATE_LIMIT.windowMs - minute;
    assert.equal(checkRateLimit([old, old, old], now).allowed, true);
  });

  it('mostra pelo menos 1 minuto de espera', () => {
    assert.equal(retryMinutes(1), 1);
    assert.equal(retryMinutes(0), 1);
  });
});
