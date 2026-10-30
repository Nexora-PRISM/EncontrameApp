import {
  type AccessDecision,
  type AuditEntry,
  auditEntry,
  type Camera,
  type CameraAuthorization,
  canMovePreservation,
  decideAccess,
  type MatchClass,
  ownerCanSetAuthorization,
  type PreservationStatus,
  preservationActor,
  preservationDeadline,
  publicCoverage,
  type Reliability,
  validateCamera,
  type VisionAction,
  type VisionRole,
} from '@/lib/vision-rules';
import { VisionDeniedError } from '@/services/vision/vision.errors';
import type { VisionRepository } from '@/services/vision/vision.repository';
import type {
  CollaborativeInfo,
  OperationDetail,
  PreservationRequest,
  VisionAccessInfo,
  VisionOperation,
  VisualMatch,
} from '@/services/vision/vision.types';

/**
 * Modo de demonstração do Encontra-me Vision. TUDO aqui é fictício e fica só na memória do aparelho:
 * câmeras, responsáveis, operações, correspondências e pedidos. Nenhuma câmera real é acessada.
 * Cada resposta vem com `simulated: true`, e as telas mostram a faixa "Dados de demonstração".
 */

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));
const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const iso = (ms: number) => new Date(ms).toISOString();

/** Hora do último local conhecido: 30 horas antes de abrir o app, arredondada para 10 minutos. */
const T0 = Math.floor((Date.now() - 30 * HOUR) / (10 * MIN)) * (10 * MIN);
const at = (minutes: number) => T0 + minutes * MIN;

const CITY = 'Cidade de demonstração';
const CENTRAL = 'Região Central (fictícia)';
const NORTH = 'Região Norte (fictícia)';
const EAST = 'Região Leste (fictícia)';
const SOUTH = 'Região Sul (fictícia)';

const DEMO_OWNER_ID = 'demo-owner-1';
const DEMO_OWNER_NAME = 'Empresa fictícia de demonstração';

// ------------------------------------------------------------------ perfil de demonstração

type DemoProfile = { id: string; name: string; role: VisionRole; verified: boolean; institution?: string };

const DEMO_PROFILES: Record<VisionRole, DemoProfile> = {
  community: { id: 'demo-community', name: 'Pessoa da comunidade (fictícia)', role: 'community', verified: false },
  owner: { id: DEMO_OWNER_ID, name: DEMO_OWNER_NAME, role: 'owner', verified: false },
  agent: {
    id: 'demo-agent',
    name: 'Agente fictício',
    role: 'agent',
    verified: true,
    institution: 'Instituição fictícia de segurança',
  },
  coordinator: {
    id: 'demo-coordinator',
    name: 'Coordenadora fictícia',
    role: 'coordinator',
    verified: true,
    institution: 'Instituição fictícia de segurança',
  },
  auditor: {
    id: 'demo-auditor',
    name: 'Auditor fictício',
    role: 'auditor',
    verified: true,
    institution: 'Controladoria fictícia',
  },
  technical: { id: 'demo-technical', name: 'Técnico fictício (Nexora Prism)', role: 'technical', verified: true },
};

let demoRole: VisionRole = 'community';
const pendingRequests: Partial<Record<VisionRole, { id: string; requestedAt: string }>> = {};

/** Troca o perfil de demonstração (só existe no modo de demonstração). */
export function setVisionDemoRole(role: VisionRole) {
  demoRole = role;
}

export function getVisionDemoRole(): VisionRole {
  return demoRole;
}

const profile = () => DEMO_PROFILES[demoRole];
const access = () => ({ role: profile().role, verified: profile().verified });

// ------------------------------------------------------------------ auditoria e recusa

let seq = 100;
const nextId = (prefix: string) => `${prefix}-TESTE-${String(++seq).padStart(4, '0')}`;

let audit: AuditEntry[] = [
  {
    id: 'AU-TESTE-0001',
    at: iso(at(40)),
    actorId: 'demo-coordinator',
    actorName: 'Coordenadora fictícia',
    role: 'coordinator',
    action: 'create_operation',
    target: 'OP-TESTE-0001',
    justification: 'Operação autorizada pela autoridade responsável pelo caso (demonstração).',
    result: 'allowed',
    simulated: true,
  },
  {
    id: 'AU-TESTE-0002',
    at: iso(at(300)),
    actorId: 'demo-agent',
    actorName: 'Agente fictício',
    role: 'agent',
    action: 'view_footage',
    target: 'OP-TESTE-0001 · trecho CL-01',
    justification: 'Conferir a passagem registrada logo após o último local conhecido.',
    result: 'allowed',
    simulated: true,
  },
  {
    id: 'AU-TESTE-0003',
    at: iso(at(360)),
    actorId: 'demo-community',
    actorName: 'Pessoa da comunidade (fictícia)',
    role: 'community',
    action: 'view_footage',
    target: 'OP-TESTE-0001 · trecho CL-02',
    result: 'denied',
    simulated: true,
  },
];

function record(action: VisionAction, target: string, decision: AccessDecision, justification?: string) {
  const p = profile();
  audit = [
    auditEntry(
      { id: nextId('AU'), at: new Date().toISOString(), actorId: p.id, actorName: p.name, role: p.role, action, target, simulated: true },
      decision,
      justification,
    ),
    ...audit,
  ];
}

/** Decide, registra (inclusive a recusa) e só continua se for permitido. */
function guard(action: VisionAction, target: string, justification = '') {
  const decision = decideAccess(access(), action, justification);
  record(action, target, decision, justification);
  if (!decision.allowed) throw new VisionDeniedError(decision.reason);
}

const receipt = (id: string) => ({ id, receivedAt: new Date().toISOString(), simulated: true });

// ------------------------------------------------------------------ câmeras fictícias

function cam(
  id: string,
  name: string,
  latitude: number,
  longitude: number,
  extra: Partial<Camera> = {},
): Camera {
  return {
    id,
    name,
    ownerId: 'demo-other',
    ownerName: 'Responsável fictício',
    source: 'commerce',
    latitude,
    longitude,
    region: CENTRAL,
    city: CITY,
    coverage: 'Calçada em frente ao imóvel (descrição fictícia)',
    equipment: 'Câmera fixa (fictícia)',
    retentionDays: 7,
    recordingsAvailable: true,
    integration: 'manual_upload',
    authorization: 'authorized',
    sharing: 'preservation_request',
    history: [{ at: iso(T0 - 60 * DAY), kind: 'registered' }, { at: iso(T0 - 58 * DAY), kind: 'authorized' }],
    simulated: true,
    ...extra,
  };
}

let cameras: Camera[] = [
  cam('CAM-01', 'Câmera de demonstração 01 — comércio', -19.9185, -43.9372, {
    ownerId: DEMO_OWNER_ID,
    ownerName: DEMO_OWNER_NAME,
    coverage: 'Entrada da loja e parte da calçada (fictício)',
  }),
  cam('CAM-02', 'Câmera de demonstração 02 — condomínio', -19.9162, -43.936, {
    source: 'condo',
    ownerName: 'Condomínio fictício',
    retentionDays: 15,
  }),
  cam('CAM-03', 'Câmera de demonstração 03 — trânsito', -19.914, -43.9348, {
    source: 'traffic',
    ownerName: 'Prefeitura fictícia',
    integration: 'monitoring_api',
    sharing: 'institutional_request',
    retentionDays: 30,
  }),
  cam('CAM-04', 'Câmera de demonstração 04 — segurança privada', -19.9118, -43.9332, {
    source: 'security_company',
    ownerId: DEMO_OWNER_ID,
    ownerName: DEMO_OWNER_NAME,
    retentionDays: 2,
    integration: 'local_recorder',
  }),
  cam('CAM-05', 'Câmera de demonstração 05 — casa', -19.9235, -43.9395, {
    source: 'home',
    ownerName: 'Morador fictício',
    retentionDays: 3,
  }),
  cam('CAM-06', 'Câmera de demonstração 06 — comércio', -19.9205, -43.9425, { retentionDays: 1 }),
  cam('CAM-07', 'Câmera de demonstração 07 — casa', -19.9188, -43.93, {
    source: 'home',
    ownerName: 'Moradora fictícia',
    hoursStart: '06:00',
    hoursEnd: '12:00',
  }),
  cam('CAM-08', 'Câmera de demonstração 08 — condomínio', -19.917, -43.9415, {
    source: 'condo',
    ownerName: 'Condomínio fictício 2',
    recordingsAvailable: false,
    coverage: 'Portaria (só imagem ao vivo, sem gravação) — fictício',
  }),
  cam('CAM-09', 'Câmera de demonstração 09 — comércio', -19.9105, -43.9318, { region: NORTH }),
  cam('CAM-10', 'Câmera de demonstração 10 — prefeitura', -19.906, -43.929, {
    source: 'municipal',
    ownerName: 'Prefeitura fictícia',
    region: NORTH,
    integration: 'monitoring_api',
    sharing: 'institutional_request',
    retentionDays: 30,
  }),
  cam('CAM-11', 'Câmera de demonstração 11 — estacionamento', -19.9215, -43.935, {
    ownerId: DEMO_OWNER_ID,
    ownerName: DEMO_OWNER_NAME,
    authorization: 'pending',
    history: [{ at: iso(T0 - 2 * DAY), kind: 'registered' }],
  }),
  cam('CAM-12', 'Câmera de demonstração 12 — comércio', -19.929, -43.905, { region: EAST }),
  cam('CAM-13', 'Câmera de demonstração 13 — casa', -19.931, -43.903, { region: EAST, source: 'home' }),
  cam('CAM-14', 'Câmera de demonstração 14 — condomínio', -19.927, -43.9065, { region: EAST, source: 'condo' }),
  cam('CAM-15', 'Câmera de demonstração 15 — comércio', -19.9302, -43.9072, { region: EAST }),
  cam('CAM-16', 'Câmera de demonstração 16 — comércio', -19.952, -43.94, { region: SOUTH }),
  cam('CAM-17', 'Câmera de demonstração 17 — casa', -19.95, -43.944, {
    region: SOUTH,
    source: 'home',
    authorization: 'suspended',
  }),
];

const cameraById = (id: string) => cameras.find((camera) => camera.id === id);

// ------------------------------------------------------------------ operações, pedidos, correspondências

const LAST_KNOWN = { latitude: -19.92, longitude: -43.938 };

let operations: VisionOperation[] = [
  {
    id: 'OP-TESTE-0001',
    caseId: 'TESTE-CASO-01',
    caseLabel: 'Caso de demonstração 01 (pessoa fictícia)',
    lastKnownPlace: 'Praça de demonstração, Região Central (fictícia)',
    lastSeenAt: iso(T0),
    radiusKm: 1,
    status: 'open',
    createdAt: iso(at(40)),
    createdByName: 'Coordenadora fictícia',
    openRequests: 0,
    matchesToReview: 0,
    latitude: LAST_KNOWN.latitude,
    longitude: LAST_KNOWN.longitude,
    description: 'Camiseta vermelha, calça jeans e mochila preta (informado pela família — fictício).',
    scope: 'Câmeras participantes no raio da operação, da hora do último local conhecido até 2 horas depois.',
    justification: 'Operação autorizada pela autoridade responsável pelo caso (demonstração).',
    responsible: ['Coordenadora fictícia', 'Agente fictício'],
    history: [
      { at: iso(at(40)), byName: 'Coordenadora fictícia', text: 'Operação aberta com raio de 1 km.' },
      { at: iso(at(55)), byName: 'Agente fictício', text: 'Pedidos de preservação preparados para as câmeras do raio.' },
      { at: iso(at(240)), byName: 'Coordenadora fictícia', text: 'Correspondência da câmera 01 confirmada após revisão do trecho.' },
    ],
    simulated: true,
  },
  {
    id: 'OP-TESTE-0002',
    caseId: 'TESTE-CASO-02',
    caseLabel: 'Caso de demonstração 02 (pessoa fictícia)',
    lastKnownPlace: 'Rua de demonstração, Região Leste (fictícia)',
    lastSeenAt: iso(T0 - 3 * HOUR),
    radiusKm: 0.5,
    status: 'open',
    createdAt: iso(T0 - 2 * HOUR),
    createdByName: 'Coordenadora fictícia',
    openRequests: 0,
    matchesToReview: 0,
    latitude: -19.9295,
    longitude: -43.9058,
    description: 'Casaco azul e boné branco (fictício).',
    scope: 'Câmeras participantes até 500 metros do último local conhecido.',
    justification: 'Operação de demonstração sem correspondências, para mostrar que não há trajeto sem evidência.',
    responsible: ['Coordenadora fictícia'],
    history: [{ at: iso(T0 - 2 * HOUR), byName: 'Coordenadora fictícia', text: 'Operação aberta com raio de 500 m.' }],
    simulated: true,
  },
];

function request(
  id: string,
  cameraId: string,
  status: PreservationStatus,
  fromMin: number,
  toMin: number,
  steps: { status: PreservationStatus; min: number; by: string; note?: string }[],
): PreservationRequest {
  const camera = cameraById(cameraId)!;
  return {
    id,
    operationId: 'OP-TESTE-0001',
    caseReference: 'TESTE-CASO-01',
    cameraId,
    cameraName: camera.name,
    ownerName: camera.ownerName,
    region: camera.region,
    city: camera.city,
    from: iso(at(fromMin)),
    to: iso(at(toMin)),
    deadline: iso(preservationDeadline(at(fromMin), camera.retentionDays)),
    status,
    createdAt: iso(at(steps[0]?.min ?? 50)),
    requesterName: 'Agente fictício',
    institution: 'Instituição fictícia de segurança',
    contact: 'contato@exemplo.invalid',
    history: steps.map((step) => ({ at: iso(at(step.min)), status: step.status, byName: step.by, note: step.note })),
    simulated: true,
  };
}

const AGENT = 'Agente fictício';
let requests: PreservationRequest[] = [
  request('PP-TESTE-0001', 'CAM-01', 'images_received', -30, 90, [
    { status: 'draft', min: 50, by: AGENT },
    { status: 'sent', min: 55, by: AGENT },
    { status: 'accepted', min: 80, by: DEMO_OWNER_NAME },
    { status: 'images_received', min: 150, by: AGENT, note: 'Arquivo recebido do responsável (fictício).' },
  ]),
  request('PP-TESTE-0002', 'CAM-02', 'images_received', -30, 90, [
    { status: 'draft', min: 50, by: AGENT },
    { status: 'sent', min: 56, by: AGENT },
    { status: 'accepted', min: 95, by: 'Condomínio fictício' },
    { status: 'images_received', min: 170, by: AGENT },
  ]),
  request('PP-TESTE-0003', 'CAM-03', 'images_received', -30, 90, [
    { status: 'draft', min: 50, by: AGENT },
    { status: 'sent', min: 57, by: AGENT },
    { status: 'accepted', min: 70, by: 'Prefeitura fictícia' },
    { status: 'images_received', min: 120, by: AGENT },
  ]),
  request('PP-TESTE-0004', 'CAM-05', 'images_received', -30, 90, [
    { status: 'draft', min: 51, by: AGENT },
    { status: 'sent', min: 58, by: AGENT },
    { status: 'accepted', min: 100, by: 'Morador fictício' },
    { status: 'images_received', min: 200, by: AGENT },
  ]),
  request('PP-TESTE-0005', 'CAM-06', 'images_received', -30, 90, [
    { status: 'draft', min: 51, by: AGENT },
    { status: 'sent', min: 58, by: AGENT },
    { status: 'accepted', min: 65, by: 'Responsável fictício' },
    { status: 'images_received', min: 110, by: AGENT },
  ]),
  request('PP-TESTE-0006', 'CAM-04', 'sent', 15, 120, [
    { status: 'draft', min: 260, by: AGENT },
    { status: 'sent', min: 265, by: AGENT, note: 'Texto do pedido enviado por e-mail ao responsável (fictício).' },
  ]),
  request('PP-TESTE-0007', 'CAM-10', 'declined', -30, 90, [
    { status: 'draft', min: 52, by: AGENT },
    { status: 'sent', min: 60, by: AGENT },
    { status: 'declined', min: 130, by: 'Prefeitura fictícia', note: 'Equipamento em manutenção naquele dia (fictício).' },
  ]),
];

function match(
  id: string,
  cameraId: string,
  minutes: number,
  confidence: number,
  classification: MatchClass,
  aiSuggestion: MatchClass | null,
  features: VisualMatch['features'],
  reason: string,
  limitations: string[],
  review?: { by: string; min: number; note: string },
): VisualMatch {
  const camera = cameraById(cameraId)!;
  return {
    id,
    operationId: 'OP-TESTE-0001',
    cameraId,
    cameraName: camera.name,
    region: camera.region,
    latitude: camera.latitude,
    longitude: camera.longitude,
    seenAt: iso(at(minutes)),
    confidence,
    features,
    reason,
    limitations,
    clipId: `CL-${id.slice(-2)}`,
    classification,
    aiSuggestion,
    ...(review ? { reviewedByName: review.by, reviewedAt: iso(at(review.min)), reviewNote: review.note } : {}),
    simulated: true,
  };
}

let matches: VisualMatch[] = [
  match(
    'CR-TESTE-01',
    'CAM-01',
    7,
    0.86,
    'confirmed',
    'probable',
    [
      { kind: 'clothing_color', value: 'Parte de cima vermelha' },
      { kind: 'clothing_type', value: 'Calça comprida azul' },
      { kind: 'backpack', value: 'Mochila escura nas costas' },
      { kind: 'direction', value: 'Seguindo para o norte' },
    ],
    'Roupa e mochila compatíveis com a descrição, 7 minutos após o último local conhecido e a menos de 200 metros.',
    ['Imagem de longe; não dá para ver detalhes da roupa.'],
    { by: 'Coordenadora fictícia', min: 240, note: 'Trecho revisto: roupas, mochila e horário compatíveis com a descrição.' },
  ),
  match(
    'CR-TESTE-02',
    'CAM-02',
    14,
    0.78,
    'probable',
    'probable',
    [
      { kind: 'clothing_color', value: 'Parte de cima vermelha' },
      { kind: 'backpack', value: 'Mochila escura' },
      { kind: 'direction', value: 'Seguindo para o nordeste' },
    ],
    'Roupa compatível e deslocamento coerente com o registro anterior (cerca de 300 metros em 7 minutos).',
    ['Iluminação baixa: a cor pode estar alterada.', 'Parte da pessoa encoberta por um carro.'],
  ),
  match(
    'CR-TESTE-03',
    'CAM-03',
    21,
    0.76,
    'probable',
    'probable',
    [
      { kind: 'clothing_color', value: 'Parte de cima vermelha' },
      { kind: 'clothing_type', value: 'Calça comprida' },
    ],
    'Roupa compatível, na mesma direção dos registros anteriores.',
    ['Câmera de trânsito: a pessoa aparece pequena na imagem.'],
  ),
  match(
    'CR-TESTE-04',
    'CAM-05',
    12,
    0.52,
    'inconclusive',
    'inconclusive',
    [{ kind: 'backpack', value: 'Mochila escura' }],
    'Só a mochila é compatível; a roupa não aparece bem.',
    ['Imagem desfocada.', 'Direção oposta à dos outros registros.'],
  ),
  match(
    'CR-TESTE-05',
    'CAM-06',
    9,
    0.61,
    'discarded',
    'inconclusive',
    [{ kind: 'clothing_color', value: 'Parte de cima vermelha' }],
    'Cor da roupa compatível.',
    ['Pessoa sem mochila.'],
    { by: 'Coordenadora fictícia', min: 250, note: 'Revisado: pessoa diferente, sem mochila e com altura bem diferente.' },
  ),
];

let infos: CollaborativeInfo[] = [
  {
    id: 'IN-TESTE-01',
    operationId: 'OP-TESTE-0001',
    source: 'resident',
    sourceLabel: 'Relato pelo app (identidade protegida)',
    receivedAt: iso(at(180)),
    happenedAt: iso(at(15)),
    place: 'Rua de demonstração, perto da padaria (fictício)',
    text: 'Vi uma pessoa de mochila preta subindo a rua no começo da noite.',
    reliability: 'unrated',
    changes: [],
    simulated: true,
  },
  {
    id: 'IN-TESTE-02',
    operationId: 'OP-TESTE-0001',
    source: 'merchant',
    sourceLabel: 'Comerciante da região (contato com a equipe)',
    receivedAt: iso(at(200)),
    place: 'Loja de demonstração, Região Central (fictícia)',
    text: 'A câmera da loja ficou desligada entre 18h e 19h por falta de energia.',
    reliability: 'high',
    changes: [
      {
        at: iso(at(220)),
        byName: 'Agente fictício',
        from: 'unrated',
        to: 'high',
        note: 'Confirmado por telefone com o comerciante (fictício).',
      },
    ],
    simulated: true,
  },
  {
    id: 'IN-TESTE-03',
    operationId: 'OP-TESTE-0001',
    source: 'volunteer',
    sourceLabel: 'Voluntário cadastrado',
    receivedAt: iso(at(320)),
    happenedAt: iso(at(30)),
    place: 'Ponto de ônibus de demonstração (fictício)',
    text: 'Ouvi de uma pessoa no ponto de ônibus que alguém parecido passou por ali.',
    reliability: 'low',
    changes: [
      {
        at: iso(at(330)),
        byName: 'Agente fictício',
        from: 'unrated',
        to: 'low',
        note: 'Informação de segunda mão, sem horário preciso.',
      },
    ],
    simulated: true,
  },
];

function summary(operation: VisionOperation) {
  const own = requests.filter((item) => item.operationId === operation.id);
  return {
    ...operation,
    openRequests: own.filter((item) => ['draft', 'sent', 'accepted'].includes(item.status)).length,
    matchesToReview: matches.filter(
      (item) => item.operationId === operation.id && (item.classification === 'probable' || item.classification === 'inconclusive'),
    ).length,
  };
}

const findOperation = (id: string) => {
  const operation = operations.find((item) => item.id === id);
  if (!operation) throw new VisionDeniedError('invalid');
  return operation;
};

function addHistory(operationId: string, text: string) {
  operations = operations.map((item) =>
    item.id === operationId
      ? { ...item, history: [...item.history, { at: new Date().toISOString(), byName: profile().name, text }] }
      : item,
  );
}

// ------------------------------------------------------------------ repositório

export const visionMockRepository: VisionRepository = {
  async getAccess(): Promise<VisionAccessInfo> {
    await delay(150);
    const p = profile();
    return {
      role: p.role,
      verified: p.verified,
      ownsCameras: cameras.some((camera) => camera.ownerId === p.id),
      userName: p.name,
      institution: p.institution,
      pendingRequest: pendingRequests[p.role],
      simulated: true,
    };
  },

  async requestInstitutionalAccess() {
    await delay();
    const id = nextId('HB');
    // Nunca aprova sozinho: fica em análise até a equipe verificar a instituição e a pessoa.
    pendingRequests[demoRole] = { id, requestedAt: new Date().toISOString() };
    return receipt(id);
  },

  async getCoverage() {
    await delay(150);
    return { areas: publicCoverage(cameras), simulated: true };
  },

  async getMyCameras() {
    await delay(150);
    return cameras.filter((camera) => camera.ownerId === profile().id);
  },

  async saveCamera(id, input) {
    await delay();
    guard('manage_own_cameras', id ?? 'nova câmera');
    if (validateCamera(input).length > 0) throw new VisionDeniedError('invalid');
    const now = new Date().toISOString();
    if (id) {
      const current = cameraById(id);
      if (!current || current.ownerId !== profile().id) throw new VisionDeniedError('owner');
      cameras = cameras.map((camera) =>
        camera.id === id
          ? {
              ...camera,
              ...input,
              source: input.source as Camera['source'],
              integration: input.integration as Camera['integration'],
              sharing: input.sharing as Camera['sharing'],
              history: [...camera.history, { at: now, kind: 'updated' }],
            }
          : camera,
      );
      return receipt(id);
    }
    const newId = nextId('CAM');
    cameras = [
      ...cameras,
      {
        id: newId,
        ownerId: profile().id,
        ownerName: profile().name,
        name: input.name.trim(),
        source: input.source as Camera['source'],
        latitude: input.latitude ?? LAST_KNOWN.latitude,
        longitude: input.longitude ?? LAST_KNOWN.longitude,
        region: input.region.trim(),
        city: input.city.trim(),
        coverage: input.coverage.trim(),
        equipment: input.equipment.trim(),
        hoursStart: input.hoursStart || undefined,
        hoursEnd: input.hoursEnd || undefined,
        retentionDays: input.retentionDays,
        recordingsAvailable: true,
        integration: input.integration as Camera['integration'],
        sharing: input.sharing as Camera['sharing'],
        // Toda câmera nova começa em verificação: cadastrar não é participar automaticamente.
        authorization: 'pending',
        history: [{ at: now, kind: 'registered' }],
        simulated: true,
      },
    ];
    return receipt(newId);
  },

  async setCameraParticipation(id, next: CameraAuthorization) {
    await delay();
    guard('manage_own_cameras', id);
    const camera = cameraById(id);
    if (!camera || camera.ownerId !== profile().id) throw new VisionDeniedError('owner');
    if (!ownerCanSetAuthorization(camera.authorization, next)) throw new VisionDeniedError('flow');
    const kind = next === 'revoked' ? 'revoked' : next === 'suspended' ? 'suspended' : 'reactivated';
    cameras = cameras.map((item) =>
      item.id === id
        ? { ...item, authorization: next, history: [...item.history, { at: new Date().toISOString(), kind }] }
        : item,
    );
    return receipt(id);
  },

  async getReceivedRequests() {
    await delay(150);
    const mine = new Set(cameras.filter((camera) => camera.ownerId === profile().id).map((camera) => camera.id));
    return requests.filter((item) => mine.has(item.cameraId));
  },

  async getOperations() {
    await delay(150);
    if (!decideAccess(access(), 'view_operations').allowed) throw new VisionDeniedError('role');
    return operations.map(summary);
  },

  async createOperation(input) {
    await delay();
    const id = nextId('OP');
    guard('create_operation', id, input.justification);
    operations = [
      {
        id,
        caseId: input.caseId,
        caseLabel: `Caso ${input.caseId} (demonstração)`,
        lastKnownPlace: input.lastKnownPlace,
        lastSeenAt: input.lastSeenAt,
        radiusKm: input.radiusKm,
        status: 'open',
        createdAt: new Date().toISOString(),
        createdByName: profile().name,
        openRequests: 0,
        matchesToReview: 0,
        latitude: input.latitude,
        longitude: input.longitude,
        description: input.description,
        scope: input.scope,
        justification: input.justification,
        responsible: [profile().name],
        history: [{ at: new Date().toISOString(), byName: profile().name, text: `Operação aberta com raio de ${input.radiusKm} km.` }],
        simulated: true,
      },
      ...operations,
    ];
    return receipt(id);
  },

  async getOperation(id): Promise<OperationDetail> {
    await delay(200);
    if (!decideAccess(access(), 'view_operations').allowed) throw new VisionDeniedError('role');
    const operation = findOperation(id);
    return {
      operation: summary(operation),
      cameras: cameras.filter((camera) => camera.authorization === 'authorized'),
      requests: requests.filter((item) => item.operationId === id),
      matches: matches.filter((item) => item.operationId === id),
      infos: infos.filter((item) => item.operationId === id),
    };
  },

  async changeRadius(operationId, radiusKm, justification) {
    await delay();
    guard('change_radius', `${operationId} · raio ${radiusKm} km`, justification);
    const operation = findOperation(operationId);
    operations = operations.map((item) => (item.id === operationId ? { ...item, radiusKm } : item));
    addHistory(operationId, `Raio alterado de ${operation.radiusKm} km para ${radiusKm} km. Justificativa: ${justification}`);
    return receipt(operationId);
  },

  async requestPreservation(operationId, input) {
    await delay();
    const id = nextId('PP');
    guard('request_preservation', `${operationId} · ${input.cameraId}`, input.justification);
    const operation = findOperation(operationId);
    const camera = cameraById(input.cameraId);
    if (!camera) throw new VisionDeniedError('invalid');
    const p = profile();
    requests = [
      ...requests,
      {
        id,
        operationId,
        caseReference: operation.caseId,
        cameraId: camera.id,
        cameraName: camera.name,
        ownerName: camera.ownerName,
        region: camera.region,
        city: camera.city,
        from: input.from,
        to: input.to,
        deadline: new Date(preservationDeadline(Date.parse(input.from), camera.retentionDays)).toISOString(),
        status: 'draft',
        createdAt: new Date().toISOString(),
        requesterName: p.name,
        institution: p.institution ?? '—',
        contact: 'contato@exemplo.invalid',
        history: [{ at: new Date().toISOString(), status: 'draft', byName: p.name, note: input.justification }],
        simulated: true,
      },
    ];
    addHistory(operationId, `Pedido de preservação ${id} preparado para ${camera.name}.`);
    return receipt(id);
  },

  async movePreservation(requestId, status, note) {
    await delay();
    const current = requests.find((item) => item.id === requestId);
    if (!current) throw new VisionDeniedError('invalid');
    const actor = preservationActor(status);
    if (actor === 'owner') {
      guard('answer_preservation', requestId);
      if (cameraById(current.cameraId)?.ownerId !== profile().id) throw new VisionDeniedError('owner');
    } else {
      guard('request_preservation', requestId, note);
    }
    if (!canMovePreservation(current.status, status)) throw new VisionDeniedError('flow');
    requests = requests.map((item) =>
      item.id === requestId
        ? {
            ...item,
            status,
            history: [
              ...item.history,
              { at: new Date().toISOString(), status, byName: profile().name, note: note.trim() || undefined },
            ],
          }
        : item,
    );
    return receipt(requestId);
  },

  async classifyMatch(matchId, classification, note) {
    await delay();
    guard('classify_match', matchId, note);
    const current = matches.find((item) => item.id === matchId);
    if (!current) throw new VisionDeniedError('invalid');
    matches = matches.map((item) =>
      item.id === matchId
        ? {
            ...item,
            classification,
            reviewedByName: profile().name,
            reviewedAt: new Date().toISOString(),
            reviewNote: note.trim(),
          }
        : item,
    );
    addHistory(current.operationId, `Correspondência ${matchId} classificada como "${classification}".`);
    return receipt(matchId);
  },

  async openClip(clipId, justification) {
    await delay(300);
    const found = matches.find((item) => item.clipId === clipId);
    guard('view_footage', `${found?.operationId ?? '—'} · trecho ${clipId}`, justification);
    const grantedAt = Date.now();
    return {
      clipId,
      grantedAt: new Date(grantedAt).toISOString(),
      expiresAt: new Date(grantedAt + 10 * MIN).toISOString(),
      synthetic: {
        cameraName: found?.cameraName ?? '—',
        seenAt: found?.seenAt ?? new Date(grantedAt).toISOString(),
        caption: 'Material sintético de demonstração: nenhuma gravação real.',
      },
      simulated: true,
    };
  },

  async rateInfo(infoId, reliability: Reliability, note) {
    await delay();
    guard('rate_information', infoId, note);
    infos = infos.map((item) =>
      item.id === infoId
        ? {
            ...item,
            reliability,
            changes: [
              ...item.changes,
              { at: new Date().toISOString(), byName: profile().name, from: item.reliability, to: reliability, note: note.trim() },
            ],
          }
        : item,
    );
    return receipt(infoId);
  },

  async getAudit(operationId) {
    await delay(150);
    if (!decideAccess(access(), 'view_audit').allowed) throw new VisionDeniedError('role');
    return operationId ? audit.filter((entry) => entry.target.includes(operationId)) : audit;
  },
};
