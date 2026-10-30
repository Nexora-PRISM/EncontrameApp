// Testes das regras da linha do tempo do caso. Rodar com `npm test`.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildFallbackTimeline,
  coarseLocation,
  countByClassification,
  normalizeActor,
  normalizeClassification,
  normalizeEventType,
  sortTimeline,
} from '../src/lib/case-timeline-rules.ts';

describe('classificação e tipo vindos da API', () => {
  it('aceita valores do contrato e nomes em português', () => {
    assert.equal(normalizeClassification('confirmed'), 'confirmed');
    assert.equal(normalizeClassification('Informação corrigida'), 'corrected');
    assert.equal(normalizeClassification('Aguardando análise'), 'pending_review');
    assert.equal(normalizeClassification('NÃO CONFIRMADO'), 'not_confirmed');
  });

  it('na dúvida, não afirma nada: classificação desconhecida vira "não confirmado"', () => {
    assert.equal(normalizeClassification('verdade'), 'not_confirmed');
    assert.equal(normalizeClassification(undefined), 'not_confirmed');
  });

  it('descarta tipo desconhecido e aceita os conhecidos', () => {
    assert.equal(normalizeEventType('sighting'), 'sighting');
    assert.equal(normalizeEventType('Status change'), 'status_change');
    assert.equal(normalizeEventType('selfie'), null);
  });

  it('reconhece quem fez a ação', () => {
    assert.equal(normalizeActor('Moderation'), 'moderation');
    assert.equal(normalizeActor('admin'), undefined);
  });
});

describe('local resumido', () => {
  it('prefere bairro, cidade e estado quando existem', () => {
    assert.equal(
      coarseLocation({ location: 'Rua X, 10', neighborhood: 'Centro', city: 'Belo Horizonte', state: 'MG' }),
      'Centro, Belo Horizonte, MG',
    );
  });

  it('tira rua, número e CEP de um endereço completo', () => {
    assert.equal(
      coarseLocation({ location: 'Rua da Bahia, 1000 - Centro, Belo Horizonte - MG, 30160-011' }),
      'Centro, Belo Horizonte, MG',
    );
    assert.equal(coarseLocation({ location: 'Avenida Afonso Pena, 1500, Funcionários' }), 'Funcionários');
  });

  it('não mostra nada quando só sobra a rua ou um texto genérico', () => {
    assert.equal(coarseLocation({ location: 'Rua das Flores, 25' }), undefined);
    assert.equal(coarseLocation({ location: 'Localização atual' }), undefined);
    assert.equal(coarseLocation({ location: '' }), undefined);
  });

  it('não repete partes iguais', () => {
    assert.equal(coarseLocation({ neighborhood: 'Centro', city: 'centro' }), 'Centro');
  });
});

describe('linha do tempo montada com os dados de hoje', () => {
  const person = {
    id: '7',
    dtRegistration: '2026-10-01T12:00:00Z',
    dtLastSeen: '2026-09-30T21:00:00Z',
    lastSeen: 'Savassi, Belo Horizonte',
  };
  const created = { id: 'h1', location: 'Praça da Savassi', neighborhood: 'Savassi', city: 'Belo Horizonte', dtRegistration: '2026-10-01T12:00:05Z' };

  it('sem avistamentos: desaparecimento (aproximado) e cadastro, ambos "informado"', () => {
    const events = buildFallbackTimeline(person, [created]);
    assert.deepEqual(
      events.map((event) => [event.type, event.classification, event.approximate === true]),
      [
        ['disappearance', 'informed', true],
        ['case_registered', 'informed', false],
      ],
    );
    assert.equal(events[0].place, 'Savassi, Belo Horizonte');
  });

  it('avistamentos da comunidade entram como "não confirmado", sem endereço exato', () => {
    const sighting = { id: 'h2', location: 'Rua Pernambuco, 500 - Funcionários, Belo Horizonte', dtRegistration: '2026-10-03T10:00:00Z' };
    const events = buildFallbackTimeline({ ...person, dtLastSeen: '2026-10-03T10:00:00Z' }, [sighting, created]);
    assert.deepEqual(
      events.map((event) => [event.type, event.classification]),
      [
        ['case_registered', 'informed'],
        ['sighting', 'not_confirmed'],
      ],
    );
    assert.equal(events[1].place, 'Funcionários, Belo Horizonte');
    assert.equal(events[1].actor, 'community');
  });

  it('com avistamentos, não inventa a data do desaparecimento', () => {
    const sighting = { id: 'h2', dtRegistration: '2026-10-03T10:00:00Z' };
    const events = buildFallbackTimeline(person, [created, sighting]);
    assert.equal(events.some((event) => event.type === 'disappearance'), false);
  });

  it('sem histórico e sem data de cadastro, a linha do tempo fica vazia', () => {
    assert.deepEqual(buildFallbackTimeline({ id: '9' }, []), []);
  });
});

describe('ordem e contagem', () => {
  it('ordena do mais antigo para o mais recente, com datas inválidas no fim', () => {
    const events = sortTimeline([
      { id: 'b', type: 'sighting', occurredAt: '2026-10-05T00:00:00Z', classification: 'not_confirmed' },
      { id: 'x', type: 'sighting', occurredAt: 'sem data', classification: 'not_confirmed' },
      { id: 'a', type: 'case_registered', occurredAt: '2026-10-01T00:00:00Z', classification: 'informed' },
    ]);
    assert.deepEqual(events.map((event) => event.id), ['a', 'b', 'x']);
  });

  it('conta por classificação', () => {
    const counts = countByClassification([
      { id: '1', type: 'sighting', occurredAt: '', classification: 'not_confirmed' },
      { id: '2', type: 'sighting', occurredAt: '', classification: 'not_confirmed' },
      { id: '3', type: 'status_change', occurredAt: '', classification: 'confirmed' },
    ]);
    assert.equal(counts.not_confirmed, 2);
    assert.equal(counts.confirmed, 1);
    assert.equal(counts.corrected, 0);
  });
});
