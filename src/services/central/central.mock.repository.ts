import {
  appendAudit,
  type CentralAction,
  type CentralDecision,
  centralDecide,
  type CentralRole,
  CENTRAL_ROLES,
  type ChainedAudit,
  endMobilization,
  linkHoursError,
  nextMobilizationRadius,
  type TipStatus,
} from '@/lib/central-rules';
import { readDemoValue, writeDemoValue } from '@/lib/demo-profile';
import { sha256Hex, sha256Text, utf8Bytes } from '@/lib/sha256';
import { CentralDeniedError } from '@/services/central/central.errors';
import type { CentralRepository } from '@/services/central/central.repository';
import type {
  CentralAccessInfo,
  Dossier,
  DossierFile,
  DossierSummary,
  WitnessIdentity,
} from '@/services/central/central.types';

/**
 * Modo de demonstração da Central de Inteligência. TUDO aqui é fictício e fica na memória do aparelho:
 * pessoas, pistas, testemunhas, arquivos, ofícios e decisões. As respostas vêm com `simulated: true`.
 */

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));
const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const iso = (ms: number) => new Date(ms).toISOString();
/** Mesmo horário-base do Vision de demonstração (30 h atrás, arredondado a 10 min). */
const T0 = Math.floor((Date.now() - 30 * HOUR) / (10 * MIN)) * (10 * MIN);
const at = (minutes: number) => iso(T0 + minutes * MIN);

// ------------------------------------------------------------------ perfis

type DemoProfile = { name: string; role: CentralRole; verified: boolean; institution?: string };

const PROFILES: Record<CentralRole, DemoProfile> = {
  public: { name: 'Pessoa da comunidade (fictícia)', role: 'public', verified: false },
  analyst: { name: 'Analista fictício', role: 'analyst', verified: true, institution: 'Instituição fictícia de segurança' },
  admin: {
    name: 'Administradora fictícia A',
    role: 'admin',
    verified: true,
    institution: 'Instituição fictícia de segurança',
  },
  auditor: { name: 'Auditor fictício', role: 'auditor', verified: true, institution: 'Controladoria fictícia' },
  technical: { name: 'Técnico fictício (Nexora Prism)', role: 'technical', verified: true },
};

/** Outra pessoa com poder de autorizar (para a regra das duas pessoas). */
export const DEMO_SECOND_ADMIN = 'Administrador fictício B';

const savedRole = readDemoValue('centralRole');
let role: CentralRole = (CENTRAL_ROLES as readonly string[]).includes(savedRole ?? '') ? (savedRole as CentralRole) : 'public';
let mfa = readDemoValue('centralMfa') !== 'false';

export function setCentralDemoRole(next: CentralRole) {
  role = next;
  writeDemoValue('centralRole', next);
}

export function setCentralDemoMfa(next: boolean) {
  mfa = next;
  writeDemoValue('centralMfa', String(next));
}

const profile = () => PROFILES[role];
const access = () => ({ role, verified: profile().verified, mfa });

// ------------------------------------------------------------------ auditoria encadeada

let audit: ChainedAudit[] = [];
const log = (action: ChainedAudit['action'], target: string, decision: CentralDecision | null, justification?: string, who = profile()) => {
  audit = appendAudit(
    audit,
    {
      at: new Date().toISOString(),
      actorName: who.name,
      role: who.role,
      action,
      target,
      ...(justification?.trim() ? { justification: justification.trim() } : {}),
      result: decision && !decision.allowed ? 'denied' : 'allowed',
    },
    sha256Text,
  );
};

function guard(action: CentralAction, target: string, justification = '') {
  const decision = centralDecide(access(), action, justification);
  log(action, target, decision, justification);
  if (!decision.allowed) throw new CentralDeniedError(decision.reason);
}

let seq = 200;
const nextId = (prefix: string) => `${prefix}-TESTE-${String(++seq).padStart(4, '0')}`;
const receipt = (id: string) => ({ id, receivedAt: new Date().toISOString(), simulated: true });

// ------------------------------------------------------------------ arquivos fictícios (bytes originais, nunca alterados)

const svgPhoto = (label: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="360" viewBox="0 0 300 360"><rect width="300" height="360" fill="lightgray"/><circle cx="150" cy="130" r="55" fill="gray"/><rect x="80" y="200" width="140" height="120" rx="40" fill="gray"/><text x="150" y="40" font-family="sans-serif" font-size="18" text-anchor="middle">${label}</text><text x="150" y="345" font-family="sans-serif" font-size="14" text-anchor="middle">FOTO FICTÍCIA — DEMONSTRAÇÃO</text></svg>`;

const ORIGINALS: Record<string, Uint8Array> = {
  'F-01': utf8Bytes(svgPhoto('Pessoa de demonstração A — atual')),
  'F-02': utf8Bytes(svgPhoto('Pessoa de demonstração A — 2019')),
  'F-03': utf8Bytes(
    'RELATO DA FAMÍLIA (FICTÍCIO)\n\nSaiu de casa por volta das 18h para ir à padaria e não voltou. Usava camiseta vermelha, calça jeans e mochila preta.\nContato da família: (31) 90000-0000. CPF informado: 000.000.000-00.\n\nDocumento de demonstração: não se refere a nenhuma pessoa real.\n',
  ),
  'F-04': utf8Bytes(
    'BOLETIM DE OCORRÊNCIA — CÓPIA FICTÍCIA\n\nNúmero: 0000/2026 (fictício)\nNatureza: desaparecimento de pessoa\nDocumento de demonstração: não é um boletim real.\n',
  ),
  'F-05': utf8Bytes(
    'data_hora;local;fonte\n' +
      `${at(25)};Ônibus da linha de demonstração 0000;Registro fornecido por ofício nº 000/2026 (fictício)\n`,
  ),
  'F-06': utf8Bytes(svgPhoto('Pessoa de demonstração B')),
};

function file(
  id: string,
  name: string,
  mime: string,
  kind: DossierFile['kind'],
  sensitivity: DossierFile['sensitivity'],
  origin: string,
  receivedMin: number,
): DossierFile {
  const bytes = ORIGINALS[id];
  const hash = sha256Hex(bytes);
  return {
    id,
    name,
    mime,
    size: bytes.length,
    sha256: hash,
    origin,
    receivedAt: at(receivedMin),
    sensitivity,
    kind,
    versions: [{ at: at(receivedMin), byName: 'Sistema', note: 'Original recebido (nunca alterado)', sha256: hash }],
    custody: [{ at: at(receivedMin), byName: 'Sistema', action: 'Recebido e registrado com SHA-256' }],
  };
}

// ------------------------------------------------------------------ dossiês fictícios

const identities: Record<string, WitnessIdentity> = {
  'PI-TESTE-01': {
    tipId: 'PI-TESTE-01',
    name: 'Testemunha fictícia 1',
    contactPreference: 'phone',
    contact: '(31) 90000-0001',
  },
  'PI-TESTE-02': { tipId: 'PI-TESTE-02', name: 'Conta de demonstração', contactPreference: 'in_app' },
};

let dossiers: Dossier[] = [
  {
    id: 'D-TESTE-01',
    caseId: 'TESTE-CASO-01',
    label: 'Caso de demonstração 01 (pessoa fictícia)',
    status: 'searching',
    lastSeenAt: at(0),
    lastKnownPlace: 'Praça de demonstração, Região Central (fictícia)',
    priority: false,
    tipsToReview: 0,
    activePreservations: 0,
    updatedAt: at(330),
    simulated: true,
    person: {
      name: 'Pessoa de demonstração A',
      age: 34,
      characteristics: ['Cerca de 1,70 m', 'Cabelo castanho curto', 'Óculos de armação preta'],
      description: 'Camiseta vermelha, calça jeans e mochila preta (informado pela família).',
    },
    latitude: -19.92,
    longitude: -43.938,
    files: [
      file('F-01', 'foto-atual-ficticia.svg', 'image/svg+xml', 'photo_current', 'personal', 'Enviada pela família no cadastro', -60),
      file('F-02', 'foto-antiga-ficticia.svg', 'image/svg+xml', 'photo_old', 'personal', 'Enviada pela família', -55),
      file('F-03', 'relato-da-familia.txt', 'text/plain', 'document', 'personal', 'Escrito pela família no cadastro', -50),
      file('F-04', 'boletim-ocorrencia-ficticio.txt', 'text/plain', 'document', 'confidential', 'Anexado pela família', 120),
      file('F-05', 'registro-transporte-ficticio.csv', 'text/csv', 'document', 'confidential', 'Ofício nº 000/2026 (fictício)', 600),
    ],
    timeline: [
      { id: 'L1', at: at(0), title: 'Último local conhecido: Praça de demonstração', nature: 'documented_fact', origin: 'Cadastro do caso' },
      { id: 'L2', at: at(-50), title: 'Caso cadastrado pela família', nature: 'documented_fact', origin: 'Cadastro do caso' },
      { id: 'L3', at: at(120), title: 'Boletim de ocorrência anexado (fictício)', nature: 'documented_fact', origin: 'Família' },
      { id: 'L4', at: at(40), title: 'Operação de câmeras aberta', detail: 'OP-TESTE-0001', nature: 'documented_fact', origin: 'Vision', originRef: 'OP-TESTE-0001' },
      {
        id: 'L5',
        at: at(7),
        title: 'Registro em câmera compatível com a descrição (revisado por pessoa)',
        detail: 'Semelhança visual, não identificação.',
        nature: 'unverified_report',
        origin: 'Vision',
        originRef: 'CR-TESTE-01',
      },
      { id: 'L6', at: at(15), title: 'Pista confidencial: mochila preta perto da padaria', nature: 'unverified_report', origin: 'Pista confidencial', originRef: 'PI-TESTE-01' },
      { id: 'L7', at: at(25), title: 'Registro de transporte público (obtido por ofício)', nature: 'documented_fact', origin: 'Ofício (fictício)', originRef: 'F-05' },
      {
        id: 'L8',
        at: at(30),
        title: 'Possível sequência de deslocamento rumo ao norte',
        detail: 'Hipótese montada a partir de pistas e câmeras; precisa de análise humana.',
        nature: 'hypothesis',
        origin: 'Organização automática',
      },
    ],
    tips: [
      {
        id: 'PI-TESTE-01',
        receivedAt: at(180),
        happenedAt: at(15),
        place: 'Perto da padaria de demonstração',
        latitude: -19.9188,
        longitude: -43.9372,
        text: 'Vi uma pessoa de mochila preta e camiseta vermelha perto da padaria, andando rápido.',
        channel: 'confidential',
        status: 'new',
        hasIdentity: true,
        history: [{ at: at(180), byName: 'Sistema', status: 'new' }],
      },
      {
        id: 'PI-TESTE-02',
        receivedAt: at(200),
        happenedAt: at(22),
        place: 'Rua da padaria de demonstração',
        latitude: -19.9186,
        longitude: -43.937,
        text: 'Pessoa de camiseta vermelha e mochila preta passou perto da padaria andando rápido.',
        channel: 'sighting_report',
        status: 'new',
        hasIdentity: true,
        history: [{ at: at(200), byName: 'Sistema', status: 'new' }],
      },
      {
        id: 'PI-TESTE-03',
        receivedAt: at(320),
        happenedAt: at(30),
        place: 'Ponto de ônibus de demonstração',
        latitude: -19.9152,
        longitude: -43.9352,
        text: 'Alguém parecido esperava no ponto de ônibus da avenida.',
        channel: 'volunteer',
        status: 'under_review',
        hasIdentity: false,
        history: [
          { at: at(320), byName: 'Sistema', status: 'new' },
          { at: at(330), byName: 'Analista fictício', status: 'under_review', note: 'Conferir com o registro de transporte.' },
        ],
      },
      {
        id: 'PI-TESTE-04',
        receivedAt: at(240),
        happenedAt: at(20),
        place: 'Rodoviária de outra cidade (fictícia)',
        latitude: -19.7,
        longitude: -44.1,
        text: 'Acho que vi essa pessoa na rodoviária de outra cidade.',
        channel: 'phone',
        status: 'new',
        hasIdentity: false,
        history: [{ at: at(240), byName: 'Sistema', status: 'new' }],
      },
      {
        id: 'PI-TESTE-05',
        receivedAt: at(400),
        text: 'Ouvi dizer que a pessoa costumava visitar parentes em outro bairro.',
        channel: 'confidential',
        status: 'not_confirmed',
        hasIdentity: false,
        history: [
          { at: at(400), byName: 'Sistema', status: 'new' },
          { at: at(420), byName: 'Analista fictício', status: 'not_confirmed', note: 'Família informou que não há parentes no bairro.' },
        ],
      },
    ],
    movements: [
      {
        id: 'M-01',
        at: at(25),
        place: 'Ônibus da linha de demonstração 0000',
        latitude: -19.9152,
        longitude: -43.9352,
        source: 'Registro de transporte público fornecido por ofício nº 000/2026 (fictício)',
      },
    ],
    preservation: [
      {
        id: 'PR-TESTE-01',
        requestedAt: at(150),
        requestedBy: 'Administradora fictícia A',
        legalBasis: 'authority_request',
        reference: 'Ofício nº 000/2026 (fictício)',
        scope: 'Relatos, pistas, arquivos e registros de acesso do caso',
        until: iso(T0 + 180 * DAY),
        status: 'active',
      },
    ],
    mobilization: [
      {
        id: 'AR-01',
        label: 'Região Central (fictícia)',
        latitude: -19.92,
        longitude: -43.938,
        radiusKm: 5,
        status: 'active',
        reason: 'Último local conhecido',
      },
      {
        id: 'AR-02',
        label: 'Região Norte (fictícia)',
        latitude: -19.905,
        longitude: -43.93,
        radiusKm: 10,
        status: 'paused',
        reason: 'Pistas na direção norte, aguardando confirmação',
      },
    ],
    actions: [
      { at: at(-45), byName: 'Sistema', text: 'Caso aprovado pela equipe e divulgado.' },
      { at: at(40), byName: 'Coordenadora fictícia', text: 'Operação de câmeras aberta (Vision).' },
      { at: at(150), byName: 'Administradora fictícia A', text: 'Preservação de registros pedida por ofício (fictício).' },
    ],
    links: { visionOperationId: 'OP-TESTE-0001', sightingReports: ['TESTE-R1'], contentReports: [] },
    exports: [],
  },
  {
    id: 'D-TESTE-02',
    caseId: 'TESTE-CASO-02',
    label: 'Caso de demonstração 02 (pessoa fictícia)',
    status: 'found',
    lastSeenAt: iso(T0 - 5 * DAY),
    lastKnownPlace: 'Região Leste (fictícia)',
    priority: true,
    tipsToReview: 0,
    activePreservations: 0,
    updatedAt: iso(T0 - DAY),
    simulated: true,
    person: {
      name: 'Pessoa de demonstração B',
      age: 15,
      characteristics: ['Cerca de 1,60 m'],
      description: 'Casaco azul (informado pela família).',
    },
    latitude: -19.9295,
    longitude: -43.9058,
    files: [file('F-06', 'foto-ficticia.svg', 'image/svg+xml', 'photo_current', 'personal', 'Enviada pela família no cadastro', -7200)],
    timeline: [
      { id: 'L1', at: iso(T0 - 5 * DAY), title: 'Caso cadastrado', nature: 'documented_fact', origin: 'Cadastro do caso' },
      { id: 'L2', at: iso(T0 - DAY), title: 'Pessoa localizada; caso encerrado', nature: 'documented_fact', origin: 'Equipe' },
    ],
    tips: [],
    movements: [],
    preservation: [],
    mobilization: [
      { id: 'AR-01', label: 'Região Leste (fictícia)', latitude: -19.9295, longitude: -43.9058, radiusKm: 5, status: 'ended', reason: 'Último local conhecido' },
    ],
    actions: [{ at: iso(T0 - DAY), byName: 'Administradora fictícia A', text: 'Encerramento: pessoa localizada.' }],
    links: { sightingReports: [], contentReports: [] },
    closure: {
      outcome: 'found',
      at: iso(T0 - DAY),
      byName: 'Administradora fictícia A',
      steps: [
        'status_updated',
        'notifications_stopped',
        'mobilization_ended',
        'public_channels_updated',
        'old_alerts_expired',
        'records_preserved',
        'identity_protected',
        'history_kept',
        'administrative_closure',
      ],
    },
    exports: [],
  },
];

// Registros iniciais da auditoria (encadeados desde o primeiro).
log('view_dossiers', 'D-TESTE-01', { allowed: true }, undefined, PROFILES.analyst);
log('preserve_records', 'D-TESTE-01 · PR-TESTE-01', { allowed: true }, 'Ofício recebido da autoridade responsável (fictício).', PROFILES.admin);
log('view_dossiers', 'D-TESTE-01', { allowed: false, reason: 'role' }, undefined, PROFILES.technical);

function withCounts(dossier: Dossier): Dossier {
  return {
    ...dossier,
    tipsToReview: dossier.tips.filter((tip) => tip.status === 'new' || tip.status === 'under_review').length,
    activePreservations: dossier.preservation.filter((item) => item.status === 'active').length,
  };
}

function summary(dossier: Dossier): DossierSummary {
  const full = withCounts(dossier);
  return {
    id: full.id,
    caseId: full.caseId,
    label: full.label,
    status: full.status,
    lastSeenAt: full.lastSeenAt,
    lastKnownPlace: full.lastKnownPlace,
    priority: full.priority,
    tipsToReview: full.tipsToReview,
    activePreservations: full.activePreservations,
    updatedAt: full.updatedAt,
    simulated: true,
  };
}

function find(id: string): Dossier {
  const dossier = dossiers.find((item) => item.id === id);
  if (!dossier) throw new CentralDeniedError('invalid');
  return dossier;
}

function update(id: string, change: (dossier: Dossier) => Dossier) {
  dossiers = dossiers.map((item) => (item.id === id ? { ...change(item), updatedAt: new Date().toISOString() } : item));
}

const note = (text: string) => ({ at: new Date().toISOString(), byName: profile().name, text });

// ------------------------------------------------------------------ repositório

export const centralMockRepository: CentralRepository = {
  async getAccess(): Promise<CentralAccessInfo> {
    await delay(120);
    const p = profile();
    return { ...access(), userName: p.name, institution: p.institution, simulated: true };
  },

  async submitConfidentialTip(body) {
    await delay(400);
    const id = nextId('PI');
    // A pista e a identidade são guardadas separadas. O registro de auditoria não traz o texto nem a identidade.
    if (body.identity) identities[id] = { tipId: id, ...body.identity };
    log('confidential_tip_received', `${id} (${body.tip.caseId ?? 'sem caso'})`, null);
    return receipt(id);
  },

  async listDossiers() {
    await delay(150);
    guard('view_dossiers', 'lista de dossiês');
    return dossiers.map(summary);
  },

  async getDossier(id) {
    await delay(150);
    guard('view_dossiers', id);
    return withCounts(find(id));
  },

  async getFileBytes(dossierId, fileId) {
    await delay(80);
    guard('view_dossiers', `${dossierId} · ${fileId}`);
    const bytes = ORIGINALS[fileId];
    if (!bytes) throw new CentralDeniedError('invalid');
    // Sempre uma cópia: o original guardado nunca é entregue para ser alterado.
    return bytes.slice();
  },

  async reviewTip(dossierId, tipId, status: TipStatus, text) {
    await delay();
    guard('review_tip', `${dossierId} · ${tipId}`, text);
    update(dossierId, (dossier) => ({
      ...dossier,
      tips: dossier.tips.map((tip) =>
        tip.id === tipId
          ? { ...tip, status, history: [...tip.history, { at: new Date().toISOString(), byName: profile().name, status, note: text.trim() }] }
          : tip,
      ),
    }));
    return receipt(tipId);
  },

  async openWitnessIdentity(dossierId, tipId, justification) {
    await delay(300);
    guard('view_witness_identity', `${dossierId} · identidade de ${tipId}`, justification);
    const identity = identities[tipId];
    if (!identity) throw new CentralDeniedError('invalid');
    return identity;
  },

  async addPreservation(dossierId, input) {
    await delay();
    const id = nextId('PR');
    guard('preserve_records', `${dossierId} · ${id}`, input.justification);
    update(dossierId, (dossier) => ({
      ...dossier,
      preservation: [
        ...dossier.preservation,
        {
          id,
          requestedAt: new Date().toISOString(),
          requestedBy: profile().name,
          legalBasis: input.legalBasis,
          reference: input.reference,
          scope: input.scope,
          until: input.until,
          status: 'active',
        },
      ],
      actions: [...dossier.actions, note(`Preservação registrada (${input.reference}).`)],
    }));
    return receipt(id);
  },

  async changeMobilization(dossierId, input) {
    await delay();
    guard('manage_mobilization', `${dossierId} · ${input.areaId ?? 'nova área'} · ${input.action}`, input.justification);
    const dossier = find(dossierId);
    if (dossier.status === 'found' || dossier.status === 'closed') throw new CentralDeniedError('flow');
    update(dossierId, (current) => ({
      ...current,
      mobilization: current.mobilization.map((area) => {
        if (area.id !== input.areaId) return area;
        if (input.action === 'pause') return { ...area, status: 'paused' };
        if (input.action === 'resume') return { ...area, status: 'active' };
        const next = nextMobilizationRadius(area.radiusKm);
        if (next == null) throw new CentralDeniedError('flow');
        return { ...area, radiusKm: next };
      }),
      actions: [...current.actions, note(`Mobilização: ${input.action} (${input.areaId}).`)],
    }));
    return receipt(input.areaId ?? dossierId);
  },

  async closeCase(dossierId, input) {
    await delay(500);
    guard('close_case', dossierId, input.justification);
    update(dossierId, (dossier) => ({
      ...dossier,
      status: input.outcome === 'found' ? 'found' : 'closed',
      mobilization: endMobilization(dossier.mobilization),
      closure: {
        outcome: input.outcome,
        at: new Date().toISOString(),
        byName: profile().name,
        steps: [
          'status_updated',
          'notifications_stopped',
          'mobilization_ended',
          'public_channels_updated',
          'old_alerts_expired',
          'records_preserved',
          'identity_protected',
          'history_kept',
          'administrative_closure',
        ],
      },
      actions: [...dossier.actions, note('Encerramento do caso registrado (demonstração).')],
    }));
    return receipt(dossierId);
  },

  async registerExport(dossierId, input) {
    await delay(300);
    const id = nextId('EX');
    guard('export_dossier', `${dossierId} · ${id} → ${input.recipient.institution}`, input.justification);
    log('export_generated', `${dossierId} · ${id} · manifesto ${input.manifestSha256.slice(0, 16)}…`, null);
    update(dossierId, (dossier) => ({
      ...dossier,
      exports: [
        ...dossier.exports,
        {
          id,
          at: new Date().toISOString(),
          byName: profile().name,
          authorizedBy: input.authorizedBy,
          recipient: input.recipient,
          purpose: input.purpose,
          legalBasis: input.legalBasis,
          manifestSha256: input.manifestSha256,
          files: input.files,
          delivery: input.delivery,
          links: [],
        },
      ],
    }));
    return receipt(id);
  },

  async createLink(dossierId, exportId, hours, justification) {
    await delay();
    guard('manage_links', `${dossierId} · ${exportId} · link ${hours} h`, justification);
    if (linkHoursError(hours)) throw new CentralDeniedError('invalid');
    const id = nextId('LK');
    update(dossierId, (dossier) => ({
      ...dossier,
      exports: dossier.exports.map((item) =>
        item.id === exportId
          ? {
              ...item,
              links: [
                ...item.links,
                {
                  id,
                  createdAt: new Date().toISOString(),
                  expiresAt: new Date(Date.now() + hours * HOUR).toISOString(),
                  accesses: 0,
                  simulated: true,
                },
              ],
            }
          : item,
      ),
    }));
    return receipt(id);
  },

  async revokeLink(dossierId, exportId, linkId, justification) {
    await delay();
    guard('manage_links', `${dossierId} · ${exportId} · revogar ${linkId}`, justification);
    update(dossierId, (dossier) => ({
      ...dossier,
      exports: dossier.exports.map((item) =>
        item.id === exportId
          ? {
              ...item,
              links: item.links.map((link) => (link.id === linkId ? { ...link, revokedAt: new Date().toISOString() } : link)),
            }
          : item,
      ),
    }));
    return receipt(linkId);
  },

  async getAudit() {
    await delay(120);
    const decision = centralDecide(access(), 'view_audit');
    if (!decision.allowed) {
      log('view_audit', 'auditoria', decision);
      throw new CentralDeniedError(decision.reason);
    }
    return audit;
  },

  async getTechnicalStatus() {
    await delay(200);
    const decision = centralDecide(access(), 'view_technical');
    if (!decision.allowed) throw new CentralDeniedError(decision.reason);
    const denied = audit.filter((entry) => entry.result === 'denied').length;
    return {
      checkedAt: new Date().toISOString(),
      services: [
        { key: 'api', label: 'API principal', state: 'ok' },
        { key: 'db', label: 'Banco de dados', state: 'ok' },
        { key: 'push', label: 'Fila de notificações', state: 'degraded', detail: 'Atraso de cerca de 3 minutos (simulado)' },
        { key: 'files', label: 'Armazenamento de arquivos', state: 'ok' },
        { key: 'video', label: 'Análise de vídeo (Vision)', state: 'not_connected' },
      ],
      securityAlerts: [
        { at: new Date().toISOString(), level: denied > 0 ? 'warning' : 'info', text: `${denied} tentativa(s) de acesso negada(s) registrada(s) na auditoria.` },
        { at: at(300), level: 'info', text: 'Certificados HTTPS válidos (simulado).' },
      ],
      logs: [
        { at: at(310), level: 'info', event: 'Exportação gerada', code: 'EXPORT_OK' },
        { at: at(305), level: 'warn', event: 'Fila de notificações lenta', code: 'PUSH_DELAY' },
        { at: at(290), level: 'error', event: 'Tempo esgotado ao consultar serviço externo', code: 'HTTP_504' },
      ],
      integrations: [
        { key: 'cameras', label: 'Câmeras participantes (Vision)', state: 'not_connected' },
        { key: 'police', label: 'Sistemas policiais', state: 'not_connected' },
        { key: 'courts', label: 'Sistemas do Judiciário', state: 'not_connected' },
        { key: 'mail', label: 'E-mail transacional', state: 'not_connected' },
      ],
      simulated: true,
    };
  },

  async requestExceptionalAccess(target, justification) {
    await delay();
    const id = nextId('AE');
    guard('request_exceptional_access', `${id} · ${target}`, justification);
    // Fica pendente: precisa de aprovação de quem responde pelos dados, e o acesso, se aprovado, é temporário.
    return receipt(id);
  },
};
