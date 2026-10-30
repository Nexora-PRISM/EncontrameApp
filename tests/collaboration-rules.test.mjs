// Testes de voluntariado, sugestão de região e proteção de crianças. Rodar com `npm test`.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { childSensitiveFields, hasChildSensitiveText, isMinor } from '../src/lib/child-protection.ts';
import {
  isReceiptConfirmed,
  normalizeWays,
  validateRegionSuggestion,
  validateVolunteer,
} from '../src/lib/collaboration-rules.ts';

describe('voluntariado', () => {
  const ok = { region: 'Contagem', ways: ['share_posters'], availability: '', acceptedGuidelines: true };

  it('pede região, uma forma de colaborar e o aceite das orientações', () => {
    assert.deepEqual(validateVolunteer(ok), []);
    assert.deepEqual(validateVolunteer({ ...ok, region: ' ', ways: [], acceptedGuidelines: false }), ['region', 'ways', 'guidelines']);
  });

  it('formas desconhecidas não contam', () => {
    assert.deepEqual(validateVolunteer({ ...ok, ways: ['busca_em_campo'] }), ['ways']);
    assert.deepEqual(normalizeWays(['regional_alerts', 'x', 'share_posters', 'share_posters']), ['share_posters', 'regional_alerts']);
  });
});

describe('sugestão de região', () => {
  it('pede o lugar e o motivo', () => {
    assert.deepEqual(validateRegionSuggestion('Betim', 'Ela tem parentes no bairro.'), []);
    assert.deepEqual(validateRegionSuggestion('BH', 'curto'), ['place', 'reason']);
  });

  it('recebimento só com número e horário', () => {
    assert.equal(isReceiptConfirmed('S-1', '2026-10-30T10:00:00Z'), true);
    assert.equal(isReceiptConfirmed('S-1', undefined), false);
    assert.equal(isReceiptConfirmed('', '2026-10-30T10:00:00Z'), false);
  });
});

describe('proteção de crianças e adolescentes', () => {
  it('menor de 18 anos', () => {
    assert.equal(isMinor(12), true);
    assert.equal(isMinor(18), false);
    assert.equal(isMinor(undefined), false);
  });

  it('detecta escola, endereço, condomínio e rotina', () => {
    assert.equal(hasChildSensitiveText('Saiu da Escola Estadual Central'), true);
    assert.equal(hasChildSensitiveText('mora no Condomínio Jardim'), true);
    assert.equal(hasChildSensitiveText('Todos os dias pega o ônibus às 7h'), true);
    assert.equal(hasChildSensitiveText('Rua das Flores, 120'), true);
    assert.equal(hasChildSensitiveText('Avenida Brasil nº 45'), true);
  });

  it('não reclama de descrições comuns', () => {
    assert.equal(hasChildSensitiveText('Camiseta azul, tênis branco'), false);
    assert.equal(hasChildSensitiveText('Vista pela última vez na Praça da Liberdade'), false);
    assert.equal(hasChildSensitiveText('Bairro Savassi'), false);
    assert.equal(hasChildSensitiveText(''), false);
  });

  it('aponta os campos a revisar', () => {
    assert.deepEqual(childSensitiveFields({ clothes: 'uniforme da escola', hair: 'castanho', location: 'Rua A, 10' }), ['clothes', 'location']);
  });
});
