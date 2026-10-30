// Testes das regras do cartaz digital. Rodar com `npm test`.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildPosterContent,
  caseUrl,
  DEFAULT_POSTER_OPTIONS,
  formatPosterDate,
  posterAvailability,
} from '../src/lib/case-poster-rules.ts';

describe('quando o cartaz pode ser gerado', () => {
  it('só para casos em busca (Procurado ou Alerta)', () => {
    assert.equal(posterAvailability(2), 'available');
    assert.equal(posterAvailability(4), 'available');
    assert.equal(posterAvailability(undefined, 'Procurando'), 'available');
  });

  it('caso pendente ainda não foi aprovado', () => {
    assert.equal(posterAvailability(1), 'pending');
    assert.equal(posterAvailability(0), 'pending');
  });

  it('caso encerrado não pode ser divulgado', () => {
    assert.equal(posterAvailability(3), 'closed');
    assert.equal(posterAvailability(99), 'closed');
    assert.equal(posterAvailability(undefined, 'Encontrado'), 'closed');
  });

  it('situação desconhecida não gera cartaz', () => {
    assert.equal(posterAvailability(), 'pending');
    assert.equal(posterAvailability(7, 'outra'), 'pending');
  });
});

describe('link do QR Code', () => {
  it('monta o link da página do caso', () => {
    assert.equal(caseUrl('https://encontrame.nexoraprism.com.br/', '123'), 'https://encontrame.nexoraprism.com.br/pessoa/123');
    assert.equal(caseUrl('https://x.com', 'a b'), 'https://x.com/pessoa/a%20b');
  });

  it('sem o endereço do app web não há link', () => {
    assert.equal(caseUrl('', '123'), null);
    assert.equal(caseUrl('https://x.com', ''), null);
  });
});

describe('conteúdo do cartaz', () => {
  const person = {
    id: '1',
    fullName: '  Maria   da Silva ',
    nickname: 'Mari',
    age: 15,
    heightCm: '160',
    hair: 'castanho',
    clothes: 'casaco azul',
    eyes: 'castanhos',
    tattoo: 'flor no braço',
    dtLastSeen: '2026-10-28T12:00:00Z',
  };

  it('usa no máximo 3 características, roupa primeiro', () => {
    const content = buildPosterContent(person, DEFAULT_POSTER_OPTIONS);
    assert.equal(content.name, 'Maria da Silva');
    assert.equal(content.age, 15);
    assert.equal(content.lastSeenDate, '28/10/2026');
    assert.deepEqual(content.traits.map((trait) => trait.kind), ['clothes', 'height', 'hair']);
    assert.equal(content.traits[1].value, '160 cm');
  });

  it('respeita as opções de esconder idade, data e características', () => {
    const content = buildPosterContent(person, { showAge: false, showDate: false, showTraits: false });
    assert.equal(content.age, undefined);
    assert.equal(content.lastSeenDate, undefined);
    assert.deepEqual(content.traits, []);
  });

  it('nunca leva telefone nem endereço', () => {
    const content = buildPosterContent({ ...person, phone: '31999999999', location: 'Rua X, 10' }, DEFAULT_POSTER_OPTIONS);
    const text = JSON.stringify(content);
    assert.equal(text.includes('31999999999'), false);
    assert.equal(text.includes('Rua X'), false);
  });

  it('encurta textos longos', () => {
    const content = buildPosterContent({ ...person, clothes: 'a'.repeat(100) }, DEFAULT_POSTER_OPTIONS);
    assert.equal(content.traits[0].value.length, 60);
    assert.ok(content.traits[0].value.endsWith('…'));
  });

  it('data inválida não aparece', () => {
    assert.equal(formatPosterDate('ontem'), undefined);
  });
});
