/**
 * Encontra-me Vision — regras puras do módulo de câmeras participantes.
 *
 * Sem dependências do app (testadas em tests/vision-rules.test.mjs). O servidor deve aplicar as mesmas regras;
 * no app elas protegem a tela (o que mostrar a quem) e alimentam o modo de demonstração.
 *
 * Princípios que estas regras garantem:
 * - A comunidade vê só a cobertura aproximada por região: nunca endereço, ângulo, responsável ou dado técnico.
 * - Câmera sem gravação não prova que a pessoa não passou pelo local.
 * - Semelhança visual nunca vira "pessoa encontrada"; só uma pessoa confirma uma correspondência.
 * - Análise biométrica (rosto, íris, digital, modo de andar) fica desligada.
 * - Sem evidência suficiente, não existe trajeto.
 */

// ------------------------------------------------------------------ geografia

export type LatLng = { latitude: number; longitude: number };

const EARTH_RADIUS_KM = 6371;
const toRad = (deg: number) => (deg * Math.PI) / 180;

export function isValidLatLng(point: Partial<LatLng> | null | undefined): point is LatLng {
  return (
    !!point &&
    typeof point.latitude === 'number' &&
    typeof point.longitude === 'number' &&
    Number.isFinite(point.latitude) &&
    Number.isFinite(point.longitude) &&
    Math.abs(point.latitude) <= 90 &&
    Math.abs(point.longitude) <= 180
  );
}

/** Distância em linha reta (km). */
export function distanceKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Rumo de A para B em graus (0 = norte, 90 = leste). */
export function bearingDeg(a: LatLng, b: LatLng): number {
  const y = Math.sin(toRad(b.longitude - a.longitude)) * Math.cos(toRad(b.latitude));
  const x =
    Math.cos(toRad(a.latitude)) * Math.sin(toRad(b.latitude)) -
    Math.sin(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.cos(toRad(b.longitude - a.longitude));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;
export type Compass = (typeof COMPASS)[number];

export function compassFromBearing(bearing: number): Compass {
  return COMPASS[Math.round((((bearing % 360) + 360) % 360) / 45) % 8];
}

/** Menor diferença entre dois rumos (0 a 180 graus). */
export function bearingGap(a: number, b: number): number {
  const diff = Math.abs((((a - b) % 360) + 360) % 360);
  return diff > 180 ? 360 - diff : diff;
}

// ------------------------------------------------------------------ câmeras participantes

export const CAMERA_SOURCES = [
  'municipal',
  'traffic',
  'official_public',
  'commerce',
  'home',
  'condo',
  'security_company',
  'institutional',
] as const;
export type CameraSource = (typeof CAMERA_SOURCES)[number];

/** Forma de entregar imagens. Cada equipamento tem a sua; nenhuma é presumida. */
export const CAMERA_INTEGRATIONS = ['manual_upload', 'ip_rtsp', 'monitoring_api', 'cloud_storage', 'local_recorder'] as const;
export type CameraIntegration = (typeof CAMERA_INTEGRATIONS)[number];

/** Situação da autorização de participação (decidida pelo responsável e verificada pela plataforma). */
export const CAMERA_AUTHORIZATIONS = ['pending', 'authorized', 'suspended', 'revoked'] as const;
export type CameraAuthorization = (typeof CAMERA_AUTHORIZATIONS)[number];

/** Em que condição o responsável aceita fornecer gravações. Nunca é "qualquer pessoa assistir". */
export const SHARING_CONDITIONS = ['preservation_request', 'institutional_request', 'court_order'] as const;
export type SharingCondition = (typeof SHARING_CONDITIONS)[number];

export type CameraShareEvent = {
  at: string;
  kind: 'registered' | 'authorized' | 'suspended' | 'revoked' | 'reactivated' | 'updated' | 'request_received' | 'images_sent';
  note?: string;
};

export type Camera = {
  id: string;
  name: string;
  ownerId: string;
  /** Responsável (nome da pessoa, empresa ou órgão). Restrito: não aparece para a comunidade. */
  ownerName: string;
  source: CameraSource;
  /** Posição exata: restrita ao responsável e ao ambiente institucional. */
  latitude: number;
  longitude: number;
  /** Região aproximada (bairro/cidade), a única parte que a comunidade vê. */
  region: string;
  city: string;
  /** O que a câmera enxerga, em palavras (ex.: "calçada em frente à loja"). Restrito. */
  coverage: string;
  equipment: string;
  /** Horário em que grava ("HH:MM"). Sem horário: grava o dia todo. */
  hoursStart?: string;
  hoursEnd?: string;
  /** Por quantos dias as gravações ficam guardadas antes de serem apagadas pelo equipamento. */
  retentionDays: number;
  recordingsAvailable: boolean;
  integration: CameraIntegration;
  authorization: CameraAuthorization;
  sharing: SharingCondition;
  history: CameraShareEvent[];
  simulated?: boolean;
};

export type CameraInput = {
  name: string;
  source: CameraSource | '';
  region: string;
  city: string;
  coverage: string;
  equipment: string;
  latitude?: number;
  longitude?: number;
  hoursStart?: string;
  hoursEnd?: string;
  retentionDays: number;
  integration: CameraIntegration | '';
  sharing: SharingCondition | '';
  /** Declaração: sou responsável pelo equipamento e entendo as condições de participação. */
  consent: boolean;
};

export type CameraError =
  | 'name'
  | 'source'
  | 'region'
  | 'city'
  | 'coverage'
  | 'location'
  | 'hours'
  | 'retention'
  | 'integration'
  | 'sharing'
  | 'consent'
  | 'secret';

export const RETENTION_RANGE = { min: 1, max: 90 } as const;

/**
 * Detecta senha, endereço de acesso ou usuário digitados em campos de texto.
 * A plataforma nunca pede nem guarda credenciais da câmera pelo app: a conexão técnica é feita depois,
 * por procedimento próprio e com autorização do responsável.
 */
export function containsSecret(text: string): boolean {
  const value = text.toLowerCase();
  if (/\b(rtsp|rtmp|http|https|onvif):\/\//.test(value)) return true;
  if (/\b\d{1,3}(\.\d{1,3}){3}\b/.test(value)) return true;
  if (/\b(senha|password|passwd|pwd|login|usu[aá]rio|user(name)?|token)\b\s*[:=]/.test(value)) return true;
  if (/[^\s@]+:[^\s@]+@/.test(value)) return true;
  return false;
}

const HOUR_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function parseHour(value: string | undefined): number | null {
  if (!value || !HOUR_RE.test(value)) return null;
  const [h, m] = value.split(':').map(Number);
  return h * 60 + m;
}

export function validateCamera(input: CameraInput): CameraError[] {
  const errors: CameraError[] = [];
  const name = input.name.trim();
  if (name.length < 3 || name.length > 60) errors.push('name');
  if (!input.source || !(CAMERA_SOURCES as readonly string[]).includes(input.source)) errors.push('source');
  if (input.region.trim().length < 2) errors.push('region');
  if (input.city.trim().length < 2) errors.push('city');
  if (input.coverage.trim().length < 5) errors.push('coverage');
  const hasLat = input.latitude != null;
  const hasLng = input.longitude != null;
  if (hasLat !== hasLng || (hasLat && !isValidLatLng({ latitude: input.latitude, longitude: input.longitude }))) {
    errors.push('location');
  }
  const start = input.hoursStart?.trim();
  const end = input.hoursEnd?.trim();
  if ((start || end) && (parseHour(start) == null || parseHour(end) == null || start === end)) errors.push('hours');
  if (
    !Number.isInteger(input.retentionDays) ||
    input.retentionDays < RETENTION_RANGE.min ||
    input.retentionDays > RETENTION_RANGE.max
  ) {
    errors.push('retention');
  }
  if (!input.integration || !(CAMERA_INTEGRATIONS as readonly string[]).includes(input.integration)) errors.push('integration');
  if (!input.sharing || !(SHARING_CONDITIONS as readonly string[]).includes(input.sharing)) errors.push('sharing');
  if (!input.consent) errors.push('consent');
  if ([input.name, input.region, input.city, input.coverage, input.equipment].some(containsSecret)) errors.push('secret');
  return errors;
}

/** A câmera participa das buscas (autorizada pelo responsável e verificada). */
export function cameraParticipates(camera: Pick<Camera, 'authorization'>): boolean {
  return camera.authorization === 'authorized';
}

/** Mudanças de participação que o próprio responsável pode fazer a qualquer momento. */
export function ownerCanSetAuthorization(current: CameraAuthorization, next: CameraAuthorization): boolean {
  if (current === next) return false;
  if (next === 'revoked') return current !== 'revoked';
  if (next === 'suspended') return current === 'authorized' || current === 'pending';
  // Voltar a participar passa de novo pela verificação da plataforma.
  if (next === 'pending') return current === 'suspended' || current === 'revoked';
  return false;
}

// ------------------------------------------------------------------ cobertura pública (comunidade)

export type CoverageLevel = 'high' | 'medium' | 'low';

export type PublicCoverageArea = {
  /** Região e cidade (texto informado pelos responsáveis). */
  region: string;
  city: string;
  level: CoverageLevel;
};

/** Quantas câmeras participantes mudam o nível da região. Contagem exata não é mostrada. */
export const COVERAGE_THRESHOLDS = { medium: 3, high: 6 } as const;

export function coverageLevel(count: number): CoverageLevel {
  if (count >= COVERAGE_THRESHOLDS.high) return 'high';
  if (count >= COVERAGE_THRESHOLDS.medium) return 'medium';
  return 'low';
}

const regionKey = (region: string, city: string) => `${region.trim().toLowerCase()}|${city.trim().toLowerCase()}`;

/**
 * O que a comunidade pode ver: só regiões e um nível (maior ou menor cobertura). Sem posição, nome, responsável,
 * ângulo, horário, contagem exata ou tipo de integração. Só entram câmeras autorizadas.
 */
export function publicCoverage(cameras: readonly Camera[]): PublicCoverageArea[] {
  const groups = new Map<string, { region: string; city: string; count: number }>();
  for (const camera of cameras) {
    if (!cameraParticipates(camera)) continue;
    const key = regionKey(camera.region, camera.city);
    const group = groups.get(key) ?? { region: camera.region.trim(), city: camera.city.trim(), count: 0 };
    group.count += 1;
    groups.set(key, group);
  }
  const order: Record<CoverageLevel, number> = { high: 0, medium: 1, low: 2 };
  return [...groups.values()]
    .map((group) => ({ region: group.region, city: group.city, level: coverageLevel(group.count) }))
    .sort((a, b) => order[a.level] - order[b.level] || a.city.localeCompare(b.city) || a.region.localeCompare(b.region));
}

// ------------------------------------------------------------------ acesso por função

/** comunidade · responsável por câmera · agente · coordenador · auditor · técnico (Nexora Prism). */
export const VISION_ROLES = ['community', 'owner', 'agent', 'coordinator', 'auditor', 'technical'] as const;
export type VisionRole = (typeof VISION_ROLES)[number];

export const INSTITUTIONAL_ROLES: readonly VisionRole[] = ['agent', 'coordinator', 'auditor'];

export type VisionAccess = {
  role: VisionRole;
  /** Habilitação institucional verificada (cadastro como autoridade não habilita sozinho). */
  verified: boolean;
  /** Tem câmeras cadastradas (o painel do responsável vale para qualquer conta). */
  ownsCameras?: boolean;
};

export type VisionAction =
  | 'view_coverage'
  | 'manage_own_cameras'
  | 'answer_preservation'
  | 'view_operations'
  | 'create_operation'
  | 'change_radius'
  | 'request_preservation'
  | 'view_footage'
  | 'classify_match'
  | 'rate_information'
  | 'view_audit'
  | 'view_technical_status';

const ROLE_ACTIONS: Readonly<Record<VisionRole, readonly VisionAction[]>> = {
  community: ['view_coverage', 'manage_own_cameras', 'answer_preservation'],
  owner: ['view_coverage', 'manage_own_cameras', 'answer_preservation'],
  agent: ['view_coverage', 'view_operations', 'request_preservation', 'view_footage', 'rate_information'],
  coordinator: [
    'view_coverage',
    'view_operations',
    'create_operation',
    'change_radius',
    'request_preservation',
    'view_footage',
    'classify_match',
    'rate_information',
    'view_audit',
  ],
  // O auditor lê o histórico de acessos e decisões, mas não assiste a gravações nem decide nada.
  auditor: ['view_coverage', 'view_operations', 'view_audit'],
  // A equipe técnica vê a saúde do sistema, nunca o conteúdo das operações ou das gravações.
  technical: ['view_coverage', 'view_technical_status'],
};

export function can(access: VisionAccess | null | undefined, action: VisionAction): boolean {
  if (!access) return action === 'view_coverage';
  const institutional = INSTITUTIONAL_ROLES.includes(access.role);
  if (institutional && !access.verified) {
    // Sem habilitação verificada, a conta institucional vale como conta comum.
    return ROLE_ACTIONS.community.includes(action);
  }
  return ROLE_ACTIONS[access.role].includes(action);
}

export function isInstitutional(access: VisionAccess | null | undefined): boolean {
  return !!access && access.verified && INSTITUTIONAL_ROLES.includes(access.role);
}

/** Ações que só acontecem com justificativa escrita (vai para a auditoria junto com a ação). */
export const JUSTIFIED_ACTIONS: readonly VisionAction[] = [
  'create_operation',
  'change_radius',
  'request_preservation',
  'view_footage',
  'classify_match',
  'rate_information',
];

export const VISION_JUSTIFICATION = { min: 15, max: 500 } as const;

export function visionJustificationError(text: string): 'required' | 'too_short' | 'too_long' | undefined {
  const value = text.trim();
  if (!value) return 'required';
  if (value.length < VISION_JUSTIFICATION.min) return 'too_short';
  if (value.length > VISION_JUSTIFICATION.max) return 'too_long';
  return undefined;
}

export type AccessDecision = { allowed: true } | { allowed: false; reason: 'role' | 'justification' };

/** Decisão completa de uma ação: função + justificativa (quando exigida). */
export function decideAccess(
  access: VisionAccess | null | undefined,
  action: VisionAction,
  justification = '',
): AccessDecision {
  if (!can(access, action)) return { allowed: false, reason: 'role' };
  if (JUSTIFIED_ACTIONS.includes(action) && visionJustificationError(justification)) {
    return { allowed: false, reason: 'justification' };
  }
  return { allowed: true };
}

// ------------------------------------------------------------------ auditoria

export type AuditEntry = {
  id: string;
  at: string;
  actorId: string;
  actorName: string;
  role: VisionRole;
  action: VisionAction;
  /** O que foi acessado ou alterado (ex.: "operação OP-1 · trecho C-03"). */
  target: string;
  justification?: string;
  result: 'allowed' | 'denied';
  simulated?: boolean;
};

export function auditEntry(
  base: Omit<AuditEntry, 'result' | 'justification'>,
  decision: AccessDecision,
  justification?: string,
): AuditEntry {
  const text = justification?.trim();
  return { ...base, result: decision.allowed ? 'allowed' : 'denied', ...(text ? { justification: text } : {}) };
}

export function sortAudit(entries: readonly AuditEntry[]): AuditEntry[] {
  return [...entries].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
}

// ------------------------------------------------------------------ operação de busca audiovisual

/** Passos do raio (km): ampliar ou reduzir anda um passo por vez. */
export const RADIUS_STEPS_KM = [0.5, 1, 2, 3, 5, 10, 20] as const;
export const DEFAULT_RADIUS_KM = 1;

export function clampRadius(km: number): number {
  if (!Number.isFinite(km)) return DEFAULT_RADIUS_KM;
  return Math.min(RADIUS_STEPS_KM[RADIUS_STEPS_KM.length - 1], Math.max(RADIUS_STEPS_KM[0], km));
}

export function stepRadius(current: number, direction: 'up' | 'down'): number {
  const value = clampRadius(current);
  if (direction === 'up') return RADIUS_STEPS_KM.find((step) => step > value) ?? value;
  return [...RADIUS_STEPS_KM].reverse().find((step) => step < value) ?? value;
}

export type OperationInput = {
  caseId: string;
  lastKnown: Partial<LatLng>;
  lastKnownPlace: string;
  lastSeenAt: number;
  radiusKm: number;
  scope: string;
  justification: string;
};

export type OperationError = 'case' | 'location' | 'place' | 'time' | 'future' | 'radius' | 'scope' | 'justification';

export function validateOperation(input: OperationInput, now: number): OperationError[] {
  const errors: OperationError[] = [];
  if (!input.caseId.trim()) errors.push('case');
  if (!isValidLatLng(input.lastKnown)) errors.push('location');
  if (input.lastKnownPlace.trim().length < 3) errors.push('place');
  if (!Number.isFinite(input.lastSeenAt)) errors.push('time');
  else if (input.lastSeenAt > now + 5 * 60 * 1000) errors.push('future');
  if (!(RADIUS_STEPS_KM as readonly number[]).includes(input.radiusKm)) errors.push('radius');
  if (input.scope.trim().length < 10) errors.push('scope');
  if (visionJustificationError(input.justification)) errors.push('justification');
  return errors;
}

export type CameraInRadius<T extends Camera = Camera> = { camera: T; distanceKm: number };

/** Câmeras participantes dentro do raio, da mais perto para a mais longe. */
export function camerasInRadius<T extends Camera>(cameras: readonly T[], center: LatLng, radiusKm: number): CameraInRadius<T>[] {
  return cameras
    .filter(cameraParticipates)
    .map((camera) => ({ camera, distanceKm: distanceKm(center, camera) }))
    .filter((item) => item.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Situação das gravações de uma câmera para o horário procurado.
 * - `no_recording`: a câmera não guarda gravações.
 * - `outside_hours`: não grava naquele horário.
 * - `possibly_deleted`: o prazo de guarda já passou (o equipamento costuma apagar).
 * - `expiring`: menos de 24 horas para o prazo de guarda acabar — pedir preservação já.
 * - `available`: dentro do prazo.
 * Nenhuma delas prova que a pessoa passou ou não passou pelo local.
 */
export type RecordingStatus = 'available' | 'expiring' | 'possibly_deleted' | 'outside_hours' | 'no_recording';

export type RecordingInfo = { status: RecordingStatus; hoursLeft?: number; expiresAt?: number };

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export function recordsAt(camera: Pick<Camera, 'hoursStart' | 'hoursEnd'>, minutesOfDay: number): boolean {
  const start = parseHour(camera.hoursStart);
  const end = parseHour(camera.hoursEnd);
  if (start == null || end == null) return true;
  if (start < end) return minutesOfDay >= start && minutesOfDay < end;
  // Atravessa a meia-noite (ex.: 18:00 às 06:00).
  return minutesOfDay >= start || minutesOfDay < end;
}

export function recordingStatus(
  camera: Pick<Camera, 'recordingsAvailable' | 'retentionDays' | 'hoursStart' | 'hoursEnd'>,
  seenAt: number,
  seenAtMinutesOfDay: number,
  now: number,
): RecordingInfo {
  if (!camera.recordingsAvailable) return { status: 'no_recording' };
  if (!recordsAt(camera, seenAtMinutesOfDay)) return { status: 'outside_hours' };
  const expiresAt = seenAt + camera.retentionDays * DAY_MS;
  const left = expiresAt - now;
  if (left <= 0) return { status: 'possibly_deleted', expiresAt };
  const hoursLeft = Math.floor(left / HOUR_MS);
  return { status: left < DAY_MS ? 'expiring' : 'available', hoursLeft, expiresAt };
}

/** Ordem de prioridade para pedir preservação: o que vence antes vem primeiro; depois, o mais perto. */
export function preservationPriority<T extends { recording: RecordingInfo; distanceKm: number }>(items: readonly T[]): T[] {
  const rank: Record<RecordingStatus, number> = {
    expiring: 0,
    available: 1,
    outside_hours: 2,
    possibly_deleted: 3,
    no_recording: 4,
  };
  return [...items].sort(
    (a, b) =>
      rank[a.recording.status] - rank[b.recording.status] ||
      (a.recording.expiresAt ?? Infinity) - (b.recording.expiresAt ?? Infinity) ||
      a.distanceKm - b.distanceKm,
  );
}

// ------------------------------------------------------------------ pedido de preservação de imagens

export const PRESERVATION_STATUSES = [
  'draft',
  'sent',
  'accepted',
  'declined',
  'images_received',
  'expired',
  'cancelled',
] as const;
export type PreservationStatus = (typeof PRESERVATION_STATUSES)[number];

const PRESERVATION_FLOW: Readonly<Record<PreservationStatus, readonly PreservationStatus[]>> = {
  draft: ['sent', 'cancelled'],
  sent: ['accepted', 'declined', 'expired', 'cancelled'],
  accepted: ['images_received', 'expired', 'cancelled'],
  declined: [],
  images_received: [],
  expired: [],
  cancelled: [],
};

export function preservationNext(current: PreservationStatus): readonly PreservationStatus[] {
  return PRESERVATION_FLOW[current] ?? [];
}

export function canMovePreservation(current: PreservationStatus, next: PreservationStatus): boolean {
  return preservationNext(current).includes(next);
}

/** Quem pode registrar cada passo: a equipe institucional envia, cancela e registra o recebimento; o responsável aceita ou recusa. */
export function preservationActor(next: PreservationStatus): 'institution' | 'owner' | 'system' {
  if (next === 'accepted' || next === 'declined') return 'owner';
  if (next === 'expired') return 'system';
  return 'institution';
}

export const PRESERVATION_MAX_WINDOW_HOURS = 12;

export type PreservationWindowError = 'order' | 'too_long' | 'future';

export function preservationWindowError(from: number, to: number, now: number): PreservationWindowError | undefined {
  if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) return 'order';
  if (to - from > PRESERVATION_MAX_WINDOW_HOURS * HOUR_MS) return 'too_long';
  if (from > now) return 'future';
  return undefined;
}

/** Até quando o equipamento guarda o começo do intervalo pedido. */
export function preservationDeadline(from: number, retentionDays: number): number {
  return from + retentionDays * DAY_MS;
}

export type Urgency = 'overdue' | 'urgent' | 'soon' | 'normal';

export function urgencyFor(deadline: number, now: number): Urgency {
  const left = deadline - now;
  if (left <= 0) return 'overdue';
  if (left < DAY_MS) return 'urgent';
  if (left < 3 * DAY_MS) return 'soon';
  return 'normal';
}

/** Pedido "aberto" é o que ainda pode mudar (aguarda envio, resposta ou imagens). */
export function preservationIsOpen(status: PreservationStatus): boolean {
  return preservationNext(status).length > 0;
}

export type PreservationLetter = {
  requestId: string;
  cameraName: string;
  ownerName: string;
  region: string;
  city: string;
  fromText: string;
  toText: string;
  deadlineText: string;
  caseReference: string;
  institution: string;
  requesterName: string;
  contact: string;
};

/**
 * Texto formal do pedido (em português, como será enviado no Brasil). Não traz nome, foto ou dados da pessoa
 * desaparecida — só a referência do caso — e deixa claro que fornecer as imagens é decisão do responsável.
 */
export function preservationLetterText(letter: PreservationLetter): string {
  return [
    `PEDIDO DE PRESERVAÇÃO DE IMAGENS — ${letter.requestId}`,
    '',
    `Ao(À) responsável: ${letter.ownerName}`,
    `Câmera: ${letter.cameraName} (${letter.region}, ${letter.city})`,
    '',
    `Em razão da busca por uma pessoa desaparecida (referência ${letter.caseReference}), solicitamos que as gravações do intervalo abaixo NÃO sejam apagadas ou sobrescritas:`,
    '',
    `• De: ${letter.fromText}`,
    `• Até: ${letter.toText}`,
    `• Pelo prazo de guarda do seu equipamento, as gravações podem ser apagadas a partir de: ${letter.deadlineText}`,
    '',
    'Este pedido é apenas de preservação. O fornecimento das imagens depende da sua autorização ou de procedimento legal adequado, e elas serão tratadas somente para esta busca.',
    'Não divulgue as imagens nas redes sociais: isso pode atrapalhar a investigação e expor pessoas inocentes.',
    '',
    `Solicitante: ${letter.requesterName} — ${letter.institution}`,
    `Contato: ${letter.contact}`,
    '',
    'Encontra-me — para que nenhuma história termine em silêncio.',
  ].join('\n');
}

// ------------------------------------------------------------------ análise visual (IA) e correspondências

/** Reconhecimento facial e outras análises biométricas: desligadas até avaliação jurídica e autorização. */
export const BIOMETRIC_ANALYSIS_ENABLED = false;

export const VISUAL_FEATURE_KINDS = [
  'clothing_color',
  'clothing_type',
  'backpack',
  'bag',
  'accessory',
  'direction',
  'vehicle',
  'other',
] as const;
export type VisualFeatureKind = (typeof VISUAL_FEATURE_KINDS)[number];

export type VisualFeature = { kind: VisualFeatureKind; value: string };

const BIOMETRIC_WORDS =
  /\b(rosto|face|facial|biometri\w*|[ií]ris|retina|digital|impress[aã]o|marcha|modo de andar|voz|tatuagem|cicatriz)\b/i;

export function isBiometricFeature(feature: { kind: string; value: string }): boolean {
  if (!(VISUAL_FEATURE_KINDS as readonly string[]).includes(feature.kind)) return true;
  return BIOMETRIC_WORDS.test(feature.value);
}

/** Mantém só características não biométricas (o resto é descartado antes de chegar à tela). */
export function nonBiometricFeatures<T extends { kind: string; value: string }>(features: readonly T[]): T[] {
  return features.filter((feature) => !isBiometricFeature(feature));
}

export const MATCH_CLASSES = ['confirmed', 'probable', 'inconclusive', 'discarded'] as const;
export type MatchClass = (typeof MATCH_CLASSES)[number];

export function normalizeMatchClass(value: unknown): MatchClass {
  return (MATCH_CLASSES as readonly unknown[]).includes(value) ? (value as MatchClass) : 'inconclusive';
}

/** Abaixo disso a IA não mostra o resultado (ruído). */
export const MATCH_MIN_CONFIDENCE = 0.35;

/** O que a IA pode sugerir sozinha: nunca "confirmada" e nunca "descartada" — essas são decisões humanas. */
export function aiSuggestedClass(confidence: number): MatchClass | null {
  if (!Number.isFinite(confidence) || confidence < MATCH_MIN_CONFIDENCE) return null;
  return confidence >= 0.75 ? 'probable' : 'inconclusive';
}

export type ConfidenceBand = 'high' | 'medium' | 'low';

export function confidenceBand(confidence: number): ConfidenceBand {
  if (confidence >= 0.75) return 'high';
  if (confidence >= 0.5) return 'medium';
  return 'low';
}

export function confidencePercent(confidence: number): number {
  if (!Number.isFinite(confidence)) return 0;
  return Math.round(Math.min(1, Math.max(0, confidence)) * 100);
}

export type ClassifyError = 'same' | 'note' | 'clip_not_reviewed';

/**
 * Mudar a classificação exige justificativa. Confirmar exige ainda que a pessoa tenha aberto o trecho de vídeo:
 * ninguém confirma sem olhar. Confirmar é "a pessoa da gravação é compatível", nunca "pessoa encontrada".
 */
export function classifyError(
  current: MatchClass,
  next: MatchClass,
  note: string,
  clipReviewed: boolean,
): ClassifyError | undefined {
  if (current === next) return 'same';
  if (visionJustificationError(note)) return 'note';
  if (next === 'confirmed' && !clipReviewed) return 'clip_not_reviewed';
  return undefined;
}

// ------------------------------------------------------------------ reconstrução de trajeto

export type Certainty = 'fact' | 'confirmed' | 'hypothesis' | 'inconclusive';

export type TrajectoryMatch = LatLng & {
  id: string;
  cameraId: string;
  cameraName: string;
  region: string;
  seenAt: number;
  confidence: number;
  classification: MatchClass;
};

export type TrajectoryPoint = LatLng & {
  id: string;
  kind: 'last_known' | 'camera';
  label: string;
  at: number;
  certainty: Certainty;
  confidence?: number;
  cameraId?: string;
};

export type TrajectorySegment = {
  fromId: string;
  toId: string;
  distanceKm: number;
  minutes: number;
  speedKmh: number | null;
  direction: Compass | null;
  /** Deslocamento possível no tempo entre os registros (a pé ou de veículo). */
  plausible: boolean;
  /** Ao menos uma ponta é hipótese: a linha aparece tracejada e com aviso. */
  hypothetical: boolean;
};

export type Trajectory = {
  points: TrajectoryPoint[];
  segments: TrajectorySegment[];
  /** Registros fora da linha: inconclusivos e os anteriores ao último local conhecido. */
  loosePoints: TrajectoryPoint[];
  sufficient: boolean;
  reason?: 'no_last_known' | 'no_evidence';
  overallDirection: Compass | null;
  totalKm: number;
};

export const MAX_PLAUSIBLE_KMH = 80;

export type LastKnown = LatLng & { at: number; label: string };

/**
 * Monta o trajeto possível só com o que existe: último local conhecido (fato informado) + correspondências
 * confirmadas (fato verificado por pessoa) e prováveis (hipótese). Inconclusivas ficam soltas, fora da linha;
 * descartadas não entram. Sem nenhuma correspondência confirmada ou provável depois do último local, não há trajeto.
 */
export function buildTrajectory(lastKnown: LastKnown | null, matches: readonly TrajectoryMatch[]): Trajectory {
  const empty: Trajectory = {
    points: [],
    segments: [],
    loosePoints: [],
    sufficient: false,
    overallDirection: null,
    totalKm: 0,
  };
  if (!lastKnown || !isValidLatLng(lastKnown) || !Number.isFinite(lastKnown.at)) {
    return { ...empty, reason: 'no_last_known' };
  }

  const start: TrajectoryPoint = {
    id: 'last-known',
    kind: 'last_known',
    label: lastKnown.label,
    latitude: lastKnown.latitude,
    longitude: lastKnown.longitude,
    at: lastKnown.at,
    certainty: 'fact',
  };

  const toPoint = (match: TrajectoryMatch): TrajectoryPoint => ({
    id: match.id,
    kind: 'camera',
    label: match.cameraName,
    latitude: match.latitude,
    longitude: match.longitude,
    at: match.seenAt,
    certainty:
      match.classification === 'confirmed' ? 'confirmed' : match.classification === 'probable' ? 'hypothesis' : 'inconclusive',
    confidence: match.confidence,
    cameraId: match.cameraId,
  });

  const usable = matches.filter((match) => match.classification !== 'discarded' && isValidLatLng(match) && Number.isFinite(match.seenAt));
  const loose: TrajectoryPoint[] = [];
  const chain: TrajectoryPoint[] = [];
  for (const match of usable) {
    const point = toPoint(match);
    if (match.classification === 'inconclusive' || match.seenAt < lastKnown.at) loose.push(point);
    else chain.push(point);
  }
  chain.sort((a, b) => a.at - b.at);
  loose.sort((a, b) => a.at - b.at);

  if (chain.length === 0) {
    return { ...empty, points: [start], loosePoints: loose, reason: 'no_evidence' };
  }

  const points = [start, ...chain];
  const segments: TrajectorySegment[] = [];
  let totalKm = 0;
  for (let index = 1; index < points.length; index += 1) {
    const from = points[index - 1];
    const to = points[index];
    const km = distanceKm(from, to);
    const minutes = Math.max(0, Math.round((to.at - from.at) / 60000));
    const speedKmh = minutes > 0 ? (km / minutes) * 60 : null;
    totalKm += km;
    segments.push({
      fromId: from.id,
      toId: to.id,
      distanceKm: Math.round(km * 100) / 100,
      minutes,
      speedKmh: speedKmh == null ? null : Math.round(speedKmh * 10) / 10,
      direction: km >= 0.02 ? compassFromBearing(bearingDeg(from, to)) : null,
      plausible: speedKmh == null ? km < 0.1 : speedKmh <= MAX_PLAUSIBLE_KMH,
      hypothetical: from.certainty === 'hypothesis' || to.certainty === 'hypothesis',
    });
  }
  const last = points[points.length - 1];
  const overallKm = distanceKm(start, last);
  return {
    points,
    segments,
    loosePoints: loose,
    sufficient: true,
    overallDirection: overallKm >= 0.05 ? compassFromBearing(bearingDeg(start, last)) : null,
    totalKm: Math.round(totalKm * 100) / 100,
  };
}

/**
 * Próximas câmeras a consultar: participantes perto do último ponto do trajeto, ainda sem pedido, priorizando as que
 * estão na direção do deslocamento. É uma sugestão para a equipe, não uma conclusão.
 */
export function nextCamerasToCheck<T extends Camera>(
  cameras: readonly T[],
  trajectory: Trajectory,
  alreadyRequested: readonly string[],
  maxKm = 1.5,
): { camera: T; distanceKm: number; onTheWay: boolean }[] {
  if (!trajectory.sufficient || trajectory.points.length === 0) return [];
  const last = trajectory.points[trajectory.points.length - 1];
  const used = new Set([...alreadyRequested, ...trajectory.points.map((point) => point.cameraId ?? '')]);
  const lastSegment = trajectory.segments[trajectory.segments.length - 1];
  const heading =
    lastSegment && lastSegment.distanceKm >= 0.02
      ? bearingDeg(trajectory.points[trajectory.points.length - 2], last)
      : null;
  return cameras
    .filter((camera) => cameraParticipates(camera) && !used.has(camera.id))
    .map((camera) => {
      const km = distanceKm(last, camera);
      const onTheWay = heading != null && km >= 0.02 && bearingGap(heading, bearingDeg(last, camera)) <= 60;
      return { camera, distanceKm: Math.round(km * 100) / 100, onTheWay };
    })
    .filter((item) => item.distanceKm <= maxKm)
    .sort((a, b) => Number(b.onTheWay) - Number(a.onTheWay) || a.distanceKm - b.distanceKm);
}

// ------------------------------------------------------------------ informações de outras fontes

export const INFO_SOURCES = ['resident', 'merchant', 'condo', 'company', 'volunteer', 'institution', 'public_system'] as const;
export type InfoSource = (typeof INFO_SOURCES)[number];

export const RELIABILITY_LEVELS = ['unrated', 'low', 'medium', 'high'] as const;
export type Reliability = (typeof RELIABILITY_LEVELS)[number];

export type ReliabilityChange = { at: string; byName: string; from: Reliability; to: Reliability; note: string };

export function reliabilityChangeError(current: Reliability, next: Reliability, note: string): 'same' | 'note' | 'invalid' | undefined {
  if (!(RELIABILITY_LEVELS as readonly string[]).includes(next) || next === 'unrated') return 'invalid';
  if (current === next) return 'same';
  if (visionJustificationError(note)) return 'note';
  return undefined;
}
