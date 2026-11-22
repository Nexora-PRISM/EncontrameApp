/**
 * Cenários das regras puras. Rode com `npm run test:regras` (o carregador fica em test-regras.js).
 */
const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const geo = require('@/lib/geo');
const notes = require('@/lib/safety-notes');
const { safetyNotesMockRepository } = require('@/services/safety-notes/safety-notes.mock.repository');
const legitimacy = require('@/features/cadastrar-pessoa/legitimacy');
const relationship = require('@/lib/case-relationship');
const protecao = require('@/features/protecao/protecao-request');
const possible = require('@/features/possivel-desaparecimento/possible-missing');
const sightings = require('@/lib/sighting-privacy');
const account = require('@/lib/account-rules');

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 10, 22, 15, 0, 0);
const iso = (offsetDays) => new Date(NOW + offsetDays * DAY).toISOString();

/** Praça Sete (BH) e pontos a distâncias conhecidas. */
const PRACA_SETE = { latitude: -19.9191, longitude: -43.9386 };
const SAO_PAULO = { latitude: -23.5505, longitude: -46.6333 };

function note(overrides = {}) {
  return {
    id: 'a1',
    category: 'robbery',
    period: 'night',
    reference: 'Rua dos Tupis, perto da praça',
    latitude: PRACA_SETE.latitude,
    longitude: PRACA_SETE.longitude,
    createdAt: iso(-2),
    expiresAt: iso(10),
    confirmations: 0,
    outdatedReports: 0,
    myVote: null,
    ...overrides,
  };
}

/** Ponto deslocado para o norte em metros (1° de latitude ≈ 111,2 km). */
function north(point, meters) {
  return { latitude: point.latitude + meters / 111_195, longitude: point.longitude };
}

describe('avisos de segurança — coordenadas e distância', () => {
  it('aceita só coordenadas válidas (sem 0,0, NaN, texto ou fora da faixa)', () => {
    assert.equal(geo.isValidCoordinate(-19.9, -43.9), true);
    assert.equal(geo.isValidCoordinate(0, 0), false);
    assert.equal(geo.isValidCoordinate(Number.NaN, -43.9), false);
    assert.equal(geo.isValidCoordinate('-19.9', -43.9), false);
    assert.equal(geo.isValidCoordinate(95, -43.9), false);
    assert.equal(geo.isValidCoordinate(-19.9, 190), false);
  });

  it('calcula distâncias curtas e longas com precisão de metros', () => {
    const at500 = north(PRACA_SETE, 500);
    const km500 = geo.haversineKm(PRACA_SETE.latitude, PRACA_SETE.longitude, at500.latitude, at500.longitude);
    assert.ok(Math.abs(km500 - 0.5) < 0.005, `esperava ~0,5 km, veio ${km500}`);
    const bhSp = geo.haversineKm(PRACA_SETE.latitude, PRACA_SETE.longitude, SAO_PAULO.latitude, SAO_PAULO.longitude);
    assert.ok(bhSp > 480 && bhSp < 500, `BH–SP ~490 km, veio ${bhSp}`);
  });

  it('formata a distância para leitura', () => {
    assert.equal(geo.formatDistanceKm(0.004), '10 m');
    assert.equal(geo.formatDistanceKm(0.347), '350 m');
    assert.equal(geo.formatDistanceKm(1.24), '1,2 km');
    assert.equal(geo.formatDistanceKm(18.4), '18 km');
    assert.equal(geo.formatDistanceKm(Number.NaN), '');
  });

describe('avisos de segurança — relato x confirmado', () => {
  it('só vira "confirmado" com pelo menos 2 confirmações e maioria', () => {
    assert.equal(notes.safetyNoteVerification({ confirmations: 0, outdatedReports: 0 }), 'unverified');
    assert.equal(notes.safetyNoteVerification({ confirmations: 1, outdatedReports: 0 }), 'unverified');
    assert.equal(notes.safetyNoteVerification({ confirmations: 2, outdatedReports: 0 }), 'confirmed');
    assert.equal(notes.safetyNoteVerification({ confirmations: 12, outdatedReports: 1 }), 'confirmed');
  });

  it('marca como divergente quando "não está mais assim" empata ou passa', () => {
    assert.equal(notes.safetyNoteVerification({ confirmations: 2, outdatedReports: 2 }), 'disputed');
    assert.equal(notes.safetyNoteVerification({ confirmations: 0, outdatedReports: 1 }), 'disputed');
  });

  it('identifica o horário do aviso nas bordas', () => {
    assert.equal(notes.periodIncludesHour('night', 18), true);
    assert.equal(notes.periodIncludesHour('night', 23), true);
    assert.equal(notes.periodIncludesHour('night', 17), false);
    assert.equal(notes.periodIncludesHour('dawn', 0), true);
    assert.equal(notes.periodIncludesHour('dawn', 6), false);
    assert.equal(notes.periodIncludesHour('any', 3), true);
  });
});

describe('avisos de segurança — lista que vai para o mapa', () => {
  it('não mostra aviso vencido, derrubado, sem data válida ou sem coordenada', () => {
    const list = notes.sanitizeSafetyNotes(
      [
        note({ id: 'ok' }),
        note({ id: 'vencido', expiresAt: iso(-1) }),
        note({ id: 'derrubado', confirmations: 1, outdatedReports: 4 }),
        note({ id: 'data-ruim', expiresAt: 'amanhã' }),
        note({ id: 'zero', latitude: 0, longitude: 0 }),
        note({ id: 'nan', latitude: Number.NaN }),
      ],
      NOW,
    );
    assert.deepEqual(list.map((item) => item.id), ['ok']);
  });

  it('remove repetidos pelo id e junta o mesmo tipo de aviso no mesmo ponto', () => {
    const list = notes.sanitizeSafetyNotes(
      [
        note({ id: 'a', confirmations: 1 }),
        note({ id: 'a', confirmations: 1 }),
        note({ id: 'b', confirmations: 7, ...north(PRACA_SETE, 15) }),
        note({ id: 'outro-tipo', category: 'lighting' }),
        note({ id: 'longe', ...north(PRACA_SETE, 200) }),
      ],
      NOW,
    );
    assert.deepEqual(list.map((item) => item.id).sort(), ['b', 'longe', 'outro-tipo']);
  });

  it('acha o aviso igual a até 60 m para confirmar em vez de duplicar', () => {
    const existing = [note({ id: 'perto' })];
    assert.equal(notes.findSimilarSafetyNote(existing, north(PRACA_SETE, 40), 'robbery')?.id, 'perto');
    assert.equal(notes.findSimilarSafetyNote(existing, north(PRACA_SETE, 90), 'robbery'), null);
    assert.equal(notes.findSimilarSafetyNote(existing, north(PRACA_SETE, 10), 'lighting'), null);
  });
});

describe('avisos de segurança — busca por região (repositório de demonstração)', () => {
  it('encontra os avisos de BH a partir do centro da cidade', async () => {
    const list = await safetyNotesMockRepository.listNearby({ ...PRACA_SETE, radiusKm: 50 });
    assert.ok(list.length >= 3, `esperava os avisos de BH, vieram ${list.length}`);
  });

  it('não inventa aviso onde não há registro (São Paulo)', async () => {
    const list = await safetyNotesMockRepository.listNearby({ ...SAO_PAULO, radiusKm: 50 });
    assert.equal(list.length, 0);
  });

  it('respeita raios pequenos (1 km) e grandes (50 km)', async () => {
    const timbiras = { latitude: -19.9265, longitude: -43.9405 };
    const small = await safetyNotesMockRepository.listNearby({ ...timbiras, radiusKm: 1 });
    const large = await safetyNotesMockRepository.listNearby({ ...timbiras, radiusKm: 50 });
    assert.ok(small.length >= 1 && small.length < large.length);
    for (const item of small) {
      assert.ok(geo.haversineKm(timbiras.latitude, timbiras.longitude, item.latitude, item.longitude) <= 1);
    }
  });
});

describe('publicação de alertas — vínculo e boletim de ocorrência', () => {
  const required = (age, rel) => legitimacy.requiresPoliceReport(age, rel);
  const error = (bo, age, rel) => legitimacy.policeReportError(bo, required(age, rel));

  it('1. familiar adulto publica sem boletim (recomendado)', () => {
    assert.equal(error('', '35', 'Pai ou mãe'), undefined);
    assert.equal(legitimacy.relationshipGroup('Irmão ou irmã'), 'family');
  });

  it('2. amigo com boletim pode enviar', () => {
    assert.equal(error('2026-123456', '30', 'Amigo ou conhecido'), undefined);
  });

  it('3. amigo sem boletim é barrado', () => {
    assert.equal(error('', '30', 'Amigo ou conhecido'), 'required');
    assert.equal(error('', '30', 'Vizinho'), 'required');
  });

  it('4. desconhecido sem boletim é barrado (e com número curto também)', () => {
    assert.equal(legitimacy.relationshipGroup('Pessoa desconhecida'), 'stranger');
    assert.equal(error('', '40', 'Pessoa desconhecida'), 'required');
    assert.equal(error('12', '40', 'Pessoa desconhecida'), 'too_short');
  });

  it('instituição precisa de boletim; criança sempre precisa, mesmo com familiar', () => {
    assert.equal(error('', '50', 'Instituição ou autoridade'), 'required');
    assert.equal(error('', '9', 'Pai ou mãe'), 'required');
    assert.equal(legitimacy.ageError(''), 'required');
  });

  it('envia à API só valores que ela aceita hoje', () => {
    const accepted = ['Mãe ou pai', 'Responsável legal', 'Outro familiar', 'Cônjuge ou companheiro(a)', 'Amigo(a)', 'Outro'];
    for (const option of legitimacy.RELATIONSHIP_OPTIONS) {
      assert.ok(accepted.includes(relationship.relationshipApiValue(option)), option);
    }
    assert.equal(legitimacy.RELATIONSHIP_OPTIONS.length, 10);
  });

  it('converte rascunhos antigos e pede nova escolha para "Outro"', () => {
    assert.equal(legitimacy.normalizeRelationship('Mãe ou pai'), 'Pai ou mãe');
    assert.equal(legitimacy.normalizeRelationship('Amigo(a)'), 'Amigo ou conhecido');
    assert.equal(legitimacy.normalizeRelationship('Outro'), '');
    assert.equal(legitimacy.normalizeRelationship('Vizinho'), 'Vizinho');
  });
});

describe('proteção — sou a pessoa procurada / perseguição', () => {
  it('8. contestação monta pedido prioritário sem localização e com o id do caso', () => {
    const email = protecao.buildProtectionEmail({
      mode: 'sou-eu',
      situations: ['estou-bem', 'retirar'],
      details: 'Estou bem, mudei de cidade por vontade própria.',
      caseId: '42',
    });
    assert.match(email.subject, /^PRIORITÁRIO/);
    assert.match(email.body, /Identificação do caso: 42/);
    assert.match(email.body, /Não informei minha localização/);
    assert.equal(protecao.protectionReportReason('sou-eu', ['estou-bem']), 'false_info');
  });

  it('risco ou perseguição vira pedido urgente e denúncia de abuso', () => {
    assert.equal(protecao.isUrgentProtection('sou-eu', ['risco']), true);
    assert.equal(protecao.isUrgentProtection('perseguicao', ['outro']), true);
    assert.equal(protecao.protectionReportReason('perseguicao', ['localizar']), 'abuse');
    assert.match(protecao.buildProtectionEmail({ mode: 'perseguicao', situations: ['ameacas'], details: '' }).subject, /^URGENTE/);
  });

  it('aceita só situações do modo escolhido e sem repetição', () => {
    assert.deepEqual(protecao.normalizeSituations('sou-eu', ['estou-bem', 'estou-bem', 'ameacas']), ['estou-bem']);
    assert.equal(protecao.parseProtectionMode('qualquer'), 'sou-eu');
    assert.equal(protecao.parseProtectionMode('perseguicao'), 'perseguicao');
  });

  it('percebe quando a pessoa escreveu um endereço', () => {
    assert.equal(protecao.looksLikeLocation('Moro na Rua das Flores, 123'), true);
    assert.equal(protecao.looksLikeLocation('CEP 30130-010'), true);
    assert.equal(protecao.looksLikeLocation('-19.9191, -43.9386'), true);
    assert.equal(protecao.looksLikeLocation('Estou bem e não quero ser encontrada.'), false);
  });
});

describe('alerta de possível desaparecimento', () => {
  it('5. criança perdida: ligar 190 e Disque 100, aviso urgente sem boletim', () => {
    assert.deepEqual(possible.possibleMissingInfo('crianca').calls, ['190', '100']);
    const email = possible.buildPossibleMissingEmail({
      situation: 'crianca',
      place: 'Praça da Estação',
      details: 'Menino de uns 6 anos, camiseta azul.',
      calledEmergency: true,
    });
    assert.match(email.subject, /^URGENTE/);
    assert.match(email.body, /Já liguei para os serviços de emergência/);
    assert.match(email.body, /Não publiquei fotos/);
  });

  it('6. idoso desorientado: 190 e SAMU', () => {
    assert.deepEqual(possible.possibleMissingInfo('idoso').calls, ['190', '192']);
  });
});

describe('avistamentos — o histórico não serve para rastrear', () => {
  it('tira número da casa e CEP do texto', () => {
    assert.equal(sightings.stripHouseNumber('Rua das Flores, 123'), 'Rua das Flores');
    assert.equal(sightings.stripHouseNumber('Av. Afonso Pena 1200 - apto 302'), 'Av. Afonso Pena');
    assert.equal(sightings.stripHouseNumber('Centro, CEP 30130-010'), 'Centro');
    assert.equal(sightings.stripHouseNumber('Praça Sete'), 'Praça Sete');
  });

  it('troca o ponto pelo centro de uma região de ~10 km e mostra só cidade e estado', () => {
    const [item] = sightings.publicSightings([
      {
        id: 'x',
        location: 'Rua da Bahia, 1148',
        neighborhood: 'Centro',
        city: 'Belo Horizonte',
        state: 'MG',
        latitude: PRACA_SETE.latitude,
        longitude: PRACA_SETE.longitude,
        dtRegistration: iso(-1),
      },
    ]);
    assert.equal(item.location, undefined);
    assert.equal(item.neighborhood, undefined);
    assert.equal(item.city, 'Belo Horizonte');
    const km = geo.haversineKm(PRACA_SETE.latitude, PRACA_SETE.longitude, item.latitude, item.longitude);
    assert.ok(km < 8, `o centro da região fica a no máximo ~8 km do ponto real (veio ${km})`);
    // Qualquer ponto da mesma região de ~10 km cai no mesmo centro: o ponto real não aparece.
    assert.equal(sightings.blurCoordinate(-19.92), sightings.blurCoordinate(-19.98));
  });

  it('regiões têm pelo menos 10 km e pontos próximos viram um só', () => {
    const a = sightings.blurCoordinate(-19.95);
    const b = sightings.blurCoordinate(-20.05);
    const kmBetween = geo.haversineKm(a, -43.9, b, -43.9);
    assert.ok(kmBetween >= 10, `centros vizinhos a ${kmBetween} km`);

    const items = Array.from({ length: 8 }, (_, index) => ({
      id: String(index),
      latitude: -19.92 + index * 0.001,
      longitude: -43.94,
      city: 'Belo Horizonte',
      dtRegistration: iso(index - 10),
    }));
    const result = sightings.publicSightings(items);
    assert.equal(result.length, 1);
    assert.equal(result[0].id, '7');
  });

  it('mostra no máximo as 5 regiões mais recentes', () => {
    const items = Array.from({ length: 8 }, (_, index) => ({
      id: String(index),
      latitude: -19.95 + index * 0.2,
      longitude: -43.94,
      dtRegistration: iso(index - 10),
    }));
    assert.deepEqual(sightings.publicSightings(items).map((item) => item.id), ['3', '4', '5', '6', '7']);
  });
});
});

describe('conta — perfil, senha nova, código e aparelhos', () => {
  it('perfil: nome, celular obrigatórios; CEP só se preenchido', () => {
    assert.deepEqual(account.profileErrors({ name: 'Ana Maria', cellPhone: '(31) 99999-8888', cep: '' }), {});
    assert.deepEqual(account.profileErrors({ name: 'An', cellPhone: '9999-8888', cep: '301' }), {
      name: 'too_short',
      cellPhone: 'invalid_format',
      cep: 'invalid_format',
    });
    assert.deepEqual(account.profileErrors({ name: ' ', cellPhone: '', cep: '30130-010' }), {
      name: 'required',
      cellPhone: 'required',
    });
  });

  it('senha nova: mesma regra do cadastro (8+, letra e número) e confirmação igual', () => {
    assert.deepEqual(account.newPasswordErrors('Senha123', 'Senha123'), {});
    assert.deepEqual(account.newPasswordErrors('abc12', 'abc12'), { newPassword: 'too_short' });
    assert.deepEqual(account.newPasswordErrors('somenteletras', 'somenteletras'), { newPassword: 'invalid_format' });
    assert.deepEqual(account.newPasswordErrors('Senha123', 'Senha124'), { confirmPassword: 'invalid_format' });
    assert.deepEqual(account.newPasswordErrors('Senha123', ''), { confirmPassword: 'required' });
  });

  it('código: aceita minúsculas e hífen, descarta letras ambíguas e corta em 8', () => {
    assert.equal(account.normalizeResetCode('abcd-2345'), 'ABCD2345');
    assert.equal(account.normalizeResetCode('O0I1L abcd'), 'ABCD');
    assert.equal(account.formatResetCode('abcd2345xyz'), 'ABCD-2345');
    assert.equal(account.formatResetCode('ab'), 'AB');
    assert.equal(account.resetCodeError(''), 'required');
    assert.equal(account.resetCodeError('ABCD-23'), 'too_short');
    assert.equal(account.resetCodeError('ABCD-2345'), undefined);
  });

  it('aparelhos: este primeiro, depois do mais recente para o mais antigo', () => {
    const list = account.sortSessions([
      { id: 'velho', lastActiveAt: iso(-5), current: false },
      { id: 'este', lastActiveAt: iso(-3), current: true },
      { id: 'novo', lastActiveAt: iso(-1), current: false },
    ]);
    assert.deepEqual(list.map((item) => item.id), ['este', 'novo', 'velho']);
    assert.equal(account.otherSessionsCount(list), 2);
  });
});
