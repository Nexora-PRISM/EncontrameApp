/**
 * Central de Inteligência — regras puras (sem dependências; tests/central-rules.test.mjs).
 *
 * Três ambientes: público (pistas confidenciais e mobilização), institucional (dossiês, pistas, preservação,
 * exportação para autoridades) e técnico (saúde do sistema, sem acesso ao conteúdo dos dossiês).
 *
 * O que estas regras garantem:
 * - Hipótese nunca vira fato: cada registro tem natureza (fato documentado, relato não verificado ou hipótese).
 * - A identidade de quem envia uma pista fica separada da pista e nunca vai para a área pública.
 * - Exportar exige finalidade, fundamento, destinatário validado e quem autorizou; nada é enviado sozinho.
 * - O hash (SHA-256) mostra se um arquivo mudou; não certifica a autenticidade do conteúdo.
 * - O registro de auditoria é encadeado: qualquer alteração ou remoção quebra a verificação.
 *
 * Funções de hash entram como parâmetro (`HashText`/`HashBytes`) para manter este arquivo sem importações.
 */

export type HashText = (text: string) => string;
export type HashBytes = (bytes: Uint8Array) => string;

// ------------------------------------------------------------------ funções e permissões

export const CENTRAL_ROLES = ['public', 'analyst', 'admin', 'auditor', 'technical'] as const;
export type CentralRole = (typeof CENTRAL_ROLES)[number];

export type CentralAccess = {
  role: CentralRole;
  /** Habilitação institucional verificada pela equipe. */
  verified: boolean;
  /** Segundo fator confirmado nesta sessão. */
  mfa: boolean;
};

export type CentralAction =
  | 'view_dossiers'
  | 'add_note'
  | 'review_tip'
  | 'view_witness_identity'
  | 'preserve_records'
  | 'manage_mobilization'
  | 'export_dossier'
  | 'authorize_export'
  | 'manage_links'
  | 'close_case'
  | 'view_audit'
  | 'view_technical'
  | 'request_exceptional_access';

const ROLE_ACTIONS: Readonly<Record<CentralRole, readonly CentralAction[]>> = {
  public: [],
  analyst: ['view_dossiers', 'add_note', 'review_tip', 'manage_mobilization'],
  admin: [
    'view_dossiers',
    'add_note',
    'review_tip',
    'view_witness_identity',
    'preserve_records',
    'manage_mobilization',
    'export_dossier',
    'authorize_export',
    'manage_links',
    'close_case',
    'view_audit',
  ],
  // Auditoria lê o histórico de acessos; não abre dossiês nem exporta.
  auditor: ['view_audit'],
  // A equipe técnica vê a saúde do sistema; acesso a conteúdo só por pedido excepcional, justificado e registrado.
  technical: ['view_technical', 'request_exceptional_access'],
};

const INSTITUTIONAL: readonly CentralRole[] = ['analyst', 'admin', 'auditor'];

/** Ações que exigem segundo fator (MFA) confirmado na sessão. */
export const MFA_ACTIONS: readonly CentralAction[] = [
  'view_witness_identity',
  'export_dossier',
  'authorize_export',
  'manage_links',
  'close_case',
  'request_exceptional_access',
];

/** Ações que exigem justificativa escrita (vai para a auditoria). */
export const JUSTIFIED_CENTRAL_ACTIONS: readonly CentralAction[] = [
  'view_witness_identity',
  'preserve_records',
  'manage_mobilization',
  'export_dossier',
  'authorize_export',
  'manage_links',
  'close_case',
  'request_exceptional_access',
  'review_tip',
];

export const CENTRAL_JUSTIFICATION = { min: 15, max: 500 } as const;

export function centralJustificationError(text: string): 'required' | 'too_short' | 'too_long' | undefined {
  const value = text.trim();
  if (!value) return 'required';
  if (value.length < CENTRAL_JUSTIFICATION.min) return 'too_short';
  if (value.length > CENTRAL_JUSTIFICATION.max) return 'too_long';
  return undefined;
}

export function centralCan(access: CentralAccess | null | undefined, action: CentralAction): boolean {
  if (!access) return false;
  if (INSTITUTIONAL.includes(access.role) && !access.verified) return false;
  return ROLE_ACTIONS[access.role].includes(action);
}

export type CentralDecision = { allowed: true } | { allowed: false; reason: 'role' | 'mfa' | 'justification' };

export function centralDecide(
  access: CentralAccess | null | undefined,
  action: CentralAction,
  justification = '',
): CentralDecision {
  if (!centralCan(access, action)) return { allowed: false, reason: 'role' };
  if (MFA_ACTIONS.includes(action) && !access?.mfa) return { allowed: false, reason: 'mfa' };
  if (JUSTIFIED_CENTRAL_ACTIONS.includes(action) && centralJustificationError(justification)) {
    return { allowed: false, reason: 'justification' };
  }
  return { allowed: true };
}

// ------------------------------------------------------------------ auditoria encadeada (contra alteração)

export type ChainedAudit = {
  seq: number;
  at: string;
  actorName: string;
  role: CentralRole;
  action: CentralAction | 'confidential_tip_received' | 'export_generated' | 'file_received';
  target: string;
  justification?: string;
  result: 'allowed' | 'denied';
  prevHash: string;
  hash: string;
};

export const AUDIT_GENESIS = '0'.repeat(64);

function auditPayload(entry: Omit<ChainedAudit, 'hash'>): string {
  return JSON.stringify([
    entry.seq,
    entry.at,
    entry.actorName,
    entry.role,
    entry.action,
    entry.target,
    entry.justification ?? '',
    entry.result,
    entry.prevHash,
  ]);
}

/** Acrescenta ao final (nunca altera nem remove). O hash de cada registro inclui o anterior. */
export function appendAudit(
  chain: readonly ChainedAudit[],
  entry: Omit<ChainedAudit, 'seq' | 'prevHash' | 'hash'>,
  hash: HashText,
): ChainedAudit[] {
  const last = chain[chain.length - 1];
  const base = { ...entry, seq: (last?.seq ?? 0) + 1, prevHash: last?.hash ?? AUDIT_GENESIS };
  return [...chain, { ...base, hash: hash(auditPayload(base)) }];
}

/** Confere a corrente inteira. `brokenAt` é o primeiro registro alterado, fora de ordem ou com elo perdido. */
export function verifyAuditChain(chain: readonly ChainedAudit[], hash: HashText): { ok: boolean; brokenAt?: number } {
  let prev = AUDIT_GENESIS;
  for (let index = 0; index < chain.length; index += 1) {
    const entry = chain[index];
    const { hash: stored, ...rest } = entry;
    if (entry.seq !== index + 1 || entry.prevHash !== prev || hash(auditPayload(rest)) !== stored) {
      return { ok: false, brokenAt: entry.seq };
    }
    prev = stored;
  }
  return { ok: true };
}

// ------------------------------------------------------------------ natureza da informação (fato × relato × hipótese)

export const INFO_NATURES = ['documented_fact', 'unverified_report', 'hypothesis'] as const;
export type InfoNature = (typeof INFO_NATURES)[number];

/** Situação da pista. Mesmo "relevante" continua sendo relato (não vira fato documentado). */
export const TIP_STATUSES = ['new', 'under_review', 'relevant', 'not_confirmed', 'duplicate'] as const;
export type TipStatus = (typeof TIP_STATUSES)[number];

// ------------------------------------------------------------------ pistas: separação de identidade

export const TIP_CONTACT_PREFERENCES = ['none', 'in_app', 'phone', 'email'] as const;
export type TipContactPreference = (typeof TIP_CONTACT_PREFERENCES)[number];

export type ConfidentialTipInput = {
  caseId?: string;
  text: string;
  /** Quando aconteceu (texto livre ou ISO). */
  when?: string;
  place?: string;
  contactPreference: TipContactPreference;
  contact?: string;
  /** Nome, se a pessoa quiser se identificar para a equipe. */
  name?: string;
  /** Entendeu os limites da confidencialidade. */
  understood: boolean;
};

export type TipError = 'text_short' | 'text_long' | 'contact' | 'understood';

export const TIP_TEXT = { min: 20, max: 2000 } as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateConfidentialTip(input: ConfidentialTipInput): TipError[] {
  const errors: TipError[] = [];
  const text = input.text.trim();
  if (text.length < TIP_TEXT.min) errors.push('text_short');
  if (text.length > TIP_TEXT.max) errors.push('text_long');
  const contact = (input.contact ?? '').trim();
  if (input.contactPreference === 'phone' && contact.replace(/\D/g, '').length < 10) errors.push('contact');
  if (input.contactPreference === 'email' && !EMAIL_RE.test(contact)) errors.push('contact');
  if (!input.understood) errors.push('understood');
  return errors;
}

/**
 * Separa a pista (vai para a análise) da identidade de quem enviou (cofre separado, acesso só com justificativa,
 * segundo fator e registro). A pista nunca carrega nome ou contato.
 */
export function splitTip(input: ConfidentialTipInput): {
  tip: { caseId?: string; text: string; when?: string; place?: string; hasIdentity: boolean };
  identity: { name?: string; contactPreference: TipContactPreference; contact?: string } | null;
} {
  const name = input.name?.trim() || undefined;
  const contact = input.contactPreference === 'none' || input.contactPreference === 'in_app' ? undefined : input.contact?.trim() || undefined;
  const hasIdentity = Boolean(name || contact || input.contactPreference === 'in_app');
  return {
    tip: {
      caseId: input.caseId?.trim() || undefined,
      text: input.text.trim(),
      when: input.when?.trim() || undefined,
      place: input.place?.trim() || undefined,
      hasIdentity,
    },
    identity: hasIdentity ? { name, contactPreference: input.contactPreference, contact } : null,
  };
}

// ------------------------------------------------------------------ ocultação de dados pessoais

export const REDACTED = '[ocultado]';

const REDACTION_PATTERNS: RegExp[] = [
  /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, // CPF
  /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g, // CNPJ
  /[^\s@]+@[^\s@]+\.[^\s@]+/g, // e-mail
  /(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?9?\d{4}[-\s]?\d{4}\b/g, // telefone
  /\b\d{5}-?\d{3}\b/g, // CEP
  /\b[A-Z]{3}-?\d[A-Z0-9]\d{2}\b/g, // placa de veículo
];

/** Oculta CPF, CNPJ, e-mail, telefone, CEP e placa. Nomes não são detectáveis com segurança: revisar o texto. */
export function redactPersonalData(text: string): { text: string; count: number } {
  let count = 0;
  let out = text;
  for (const pattern of REDACTION_PATTERNS) {
    out = out.replace(pattern, () => {
      count += 1;
      return REDACTED;
    });
  }
  return { text: out, count };
}

export function containsPersonalData(text: string): boolean {
  return redactPersonalData(text).count > 0;
}

// ------------------------------------------------------------------ exportação para autoridades

export const LEGAL_BASES = ['authority_request', 'court_order', 'family_consent', 'protection_of_life'] as const;
export type LegalBasis = (typeof LEGAL_BASES)[number];

export type ExportItemKind = 'summary' | 'timeline' | 'tip' | 'file' | 'geo' | 'movement' | 'note';
export type Sensitivity = 'normal' | 'personal' | 'confidential' | 'witness_identity';

export type ExportItem = {
  id: string;
  kind: ExportItemKind;
  label: string;
  sensitivity: Sensitivity;
};

export type ExportChoice = { include: boolean; redact: boolean };

export type ExportSelection = Record<string, ExportChoice>;

/**
 * Seleção inicial, a mais protetora: identidade de testemunhas fora, documentos sigilosos fora,
 * dados pessoais ocultados. Quem exporta pode mudar, com registro.
 */
export function defaultSelection(items: readonly ExportItem[]): ExportSelection {
  const selection: ExportSelection = {};
  for (const item of items) {
    const include = item.sensitivity === 'normal' || item.sensitivity === 'personal';
    selection[item.id] = { include, redact: item.sensitivity !== 'normal' };
  }
  return selection;
}

export type Recipient = { institution: string; name: string; email: string };

const INSTITUTIONAL_DOMAINS = ['.gov.br', '.jus.br', '.mp.br', '.def.br', '.leg.br', '.mil.br'];

/** E-mail de órgão público brasileiro. Outros destinatários precisam de validação manual registrada. */
export function isInstitutionalEmail(email: string): boolean {
  const value = email.trim().toLowerCase();
  if (!EMAIL_RE.test(value)) return false;
  const domain = value.slice(value.lastIndexOf('@') + 1);
  return INSTITUTIONAL_DOMAINS.some((suffix) => domain.endsWith(suffix));
}

export type ExportRequest = {
  purpose: string;
  legalBasis: LegalBasis | '';
  recipient: Recipient;
  /** O destinatário foi confirmado por canal oficial (telefone do órgão, ofício). */
  recipientConfirmed: boolean;
  requesterName: string;
  authorizerName: string;
  items: readonly ExportItem[];
  selection: ExportSelection;
};

export type ExportError =
  | 'purpose'
  | 'legal_basis'
  | 'recipient'
  | 'recipient_email'
  | 'recipient_confirmed'
  | 'authorizer'
  | 'second_approval'
  | 'empty';

/** Incluir identidade de testemunha ou documento sigiloso exige uma segunda pessoa autorizando. */
export function needsSecondApproval(items: readonly ExportItem[], selection: ExportSelection): boolean {
  return items.some(
    (item) =>
      selection[item.id]?.include &&
      (item.sensitivity === 'witness_identity' || item.sensitivity === 'confidential'),
  );
}

export function validateExport(request: ExportRequest): ExportError[] {
  const errors: ExportError[] = [];
  if (centralJustificationError(request.purpose)) errors.push('purpose');
  if (!request.legalBasis || !(LEGAL_BASES as readonly string[]).includes(request.legalBasis)) errors.push('legal_basis');
  if (request.recipient.institution.trim().length < 3 || request.recipient.name.trim().length < 3) errors.push('recipient');
  if (!isInstitutionalEmail(request.recipient.email)) errors.push('recipient_email');
  if (!request.recipientConfirmed) errors.push('recipient_confirmed');
  if (request.authorizerName.trim().length < 3) errors.push('authorizer');
  const same = request.authorizerName.trim().toLowerCase() === request.requesterName.trim().toLowerCase();
  if (needsSecondApproval(request.items, request.selection) && same) errors.push('second_approval');
  if (!request.items.some((item) => request.selection[item.id]?.include)) errors.push('empty');
  return errors;
}

// ------------------------------------------------------------------ manifesto de integridade

export type PackageFile = {
  path: string;
  bytes: Uint8Array;
  /** De onde veio (ex.: "Relato pelo app", "Arquivo enviado pela família"). */
  origin: string;
  receivedAt?: string;
  /** Arquivo original recebido (nunca alterado) ou cópia controlada gerada para a exportação. */
  original: boolean;
  /** Para cópias com dados ocultados: hash do original de onde saiu. */
  derivedFromSha256?: string;
};

export type ManifestFile = {
  path: string;
  size: number;
  sha256: string;
  origin: string;
  receivedAt?: string;
  original: boolean;
  derivedFromSha256?: string;
};

export type Manifest = {
  format: 'encontrame-manifest-1';
  caseReference: string;
  generatedAt: string;
  generatedBy: string;
  authorizedBy: string;
  purpose: string;
  legalBasis: LegalBasis;
  recipient: Recipient;
  files: ManifestFile[];
  notice: string;
};

export const HASH_NOTICE =
  'O SHA-256 permite conferir se cada arquivo continua igual ao que foi registrado. Ele não certifica, sozinho, a autenticidade ou a veracidade do conteúdo.';

export function buildManifest(
  files: readonly PackageFile[],
  meta: Omit<Manifest, 'format' | 'files' | 'notice'>,
  hash: HashBytes,
): Manifest {
  return {
    format: 'encontrame-manifest-1',
    ...meta,
    files: files.map((file) => ({
      path: file.path,
      size: file.bytes.length,
      sha256: hash(file.bytes),
      origin: file.origin,
      ...(file.receivedAt ? { receivedAt: file.receivedAt } : {}),
      original: file.original,
      ...(file.derivedFromSha256 ? { derivedFromSha256: file.derivedFromSha256 } : {}),
    })),
    notice: HASH_NOTICE,
  };
}

/** Versão em texto do manifesto (para quem não lê JSON). */
export function manifestText(manifest: Manifest): string {
  return [
    'MANIFESTO DE INTEGRIDADE — Encontra-me',
    `Caso: ${manifest.caseReference}`,
    `Gerado em: ${manifest.generatedAt} por ${manifest.generatedBy}`,
    `Autorizado por: ${manifest.authorizedBy}`,
    `Finalidade: ${manifest.purpose}`,
    `Fundamento: ${manifest.legalBasis}`,
    `Destinatário: ${manifest.recipient.name} — ${manifest.recipient.institution} <${manifest.recipient.email}>`,
    '',
    'SHA-256                                                           TAMANHO  ARQUIVO',
    ...manifest.files.map(
      (file) =>
        `${file.sha256}  ${String(file.size).padStart(7)}  ${file.path}${file.original ? '' : ' (cópia controlada)'}`,
    ),
    '',
    manifest.notice,
  ].join('\n');
}

export type FileCheck = 'ok' | 'changed' | 'not_listed';

export function checkFileAgainstManifest(manifest: Pick<Manifest, 'files'>, path: string, sha256: string): FileCheck {
  const byPath = manifest.files.find((file) => file.path === path);
  if (byPath) return byPath.sha256 === sha256.toLowerCase() ? 'ok' : 'changed';
  // Arquivo renomeado: ainda dá para achar pelo hash.
  return manifest.files.some((file) => file.sha256 === sha256.toLowerCase()) ? 'ok' : 'not_listed';
}

// ------------------------------------------------------------------ entrega segura

export const LINK_HOURS = { min: 1, max: 168 } as const;

export type SecureLink = { id: string; createdAt: string; expiresAt: string; revokedAt?: string; accesses: number };

export function linkHoursError(hours: number): 'range' | undefined {
  return Number.isInteger(hours) && hours >= LINK_HOURS.min && hours <= LINK_HOURS.max ? undefined : 'range';
}

export function linkStatus(link: SecureLink, now: number): 'active' | 'expired' | 'revoked' {
  if (link.revokedAt) return 'revoked';
  return Date.parse(link.expiresAt) <= now ? 'expired' : 'active';
}

const PASS_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Senha em blocos (ex.: "K7QH-M2XA-…") a partir de bytes aleatórios. Vai por canal separado do arquivo. */
export function passphraseFromBytes(bytes: Uint8Array, groups = 6): string {
  const chars: string[] = [];
  for (let i = 0; i < groups * 4; i += 1) chars.push(PASS_ALPHABET[(bytes[i % bytes.length] ?? 0) % PASS_ALPHABET.length]);
  const out: string[] = [];
  for (let g = 0; g < groups; g += 1) out.push(chars.slice(g * 4, g * 4 + 4).join(''));
  return out.join('-');
}

// ------------------------------------------------------------------ cruzamento de pistas (organização automática)

export type LocatedTip = {
  id: string;
  text: string;
  at: number;
  latitude?: number;
  longitude?: number;
};

const KM_PER_DEG = 111.32;

export function approxKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }): number {
  const dLat = (b.latitude - a.latitude) * KM_PER_DEG;
  const dLng = (b.longitude - a.longitude) * KM_PER_DEG * Math.cos((((a.latitude + b.latitude) / 2) * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

const hasPoint = (tip: LocatedTip): tip is LocatedTip & { latitude: number; longitude: number } =>
  typeof tip.latitude === 'number' && typeof tip.longitude === 'number';

function words(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 3),
  );
}

export function textSimilarity(a: string, b: string): number {
  const wa = words(a);
  const wb = words(b);
  if (wa.size === 0 || wb.size === 0) return 0;
  let common = 0;
  for (const word of wa) if (wb.has(word)) common += 1;
  return common / (wa.size + wb.size - common);
}

export type TipLink = {
  kind: 'related' | 'duplicate' | 'divergence';
  a: string;
  b: string;
  minutes: number;
  km: number | null;
};

/**
 * Relações entre pistas, sempre para análise humana:
 * - `duplicate`: texto muito parecido (≥ 60%) e até 2 h de diferença.
 * - `related`: até 1 km e até 2 h de diferença.
 * - `divergence`: até 30 min de diferença, mas a mais de 5 km — não dá para estar nos dois lugares.
 */
export function crossTips(tips: readonly LocatedTip[]): TipLink[] {
  const links: TipLink[] = [];
  for (let i = 0; i < tips.length; i += 1) {
    for (let j = i + 1; j < tips.length; j += 1) {
      const a = tips[i];
      const b = tips[j];
      const minutes = Math.round(Math.abs(a.at - b.at) / 60000);
      const km = hasPoint(a) && hasPoint(b) ? Math.round(approxKm(a, b) * 100) / 100 : null;
      if (textSimilarity(a.text, b.text) >= 0.6 && minutes <= 120) {
        links.push({ kind: 'duplicate', a: a.id, b: b.id, minutes, km });
      } else if (km != null && minutes <= 30 && km > 5) {
        links.push({ kind: 'divergence', a: a.id, b: b.id, minutes, km });
      } else if (km != null && km <= 1 && minutes <= 120) {
        links.push({ kind: 'related', a: a.id, b: b.id, minutes, km });
      }
    }
  }
  return links;
}

/** Possível sequência de deslocamento (hipótese): pistas com local, em ordem de horário, com velocidade plausível. */
export function movementHypothesis(tips: readonly LocatedTip[], maxKmh = 60): string[] {
  const located = tips.filter(hasPoint).sort((a, b) => a.at - b.at);
  if (located.length < 2) return [];
  const chain = [located[0]];
  for (const tip of located.slice(1)) {
    const prev = chain[chain.length - 1];
    const hours = (tip.at - prev.at) / 3600000;
    const km = approxKm(prev, tip);
    if (hours > 0 && km / hours <= maxKmh) chain.push(tip);
  }
  return chain.length >= 2 ? chain.map((tip) => tip.id) : [];
}

// ------------------------------------------------------------------ mobilização geográfica

export const MOBILIZATION_STEPS_KM = [2, 5, 10, 25, 50, 100] as const;

export type MobilizationArea = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  status: 'active' | 'paused' | 'ended';
  reason: string;
};

export function nextMobilizationRadius(current: number): number | null {
  return MOBILIZATION_STEPS_KM.find((step) => step > current) ?? null;
}

export const NOTIFY_LIMITS = { perDay: 3, minGapHours: 6 } as const;

export type NotifyInput = {
  optedIn: boolean;
  insideActiveArea: boolean;
  caseActive: boolean;
  /** Horários (ms) dos alertas já enviados a esta pessoa nas últimas 24 h, de qualquer caso. */
  sentAt: readonly number[];
  /** Último alerta deste caso para esta pessoa. */
  lastForCase?: number;
  now: number;
};

export type NotifyDecision =
  | { send: true }
  | { send: false; reason: 'not_opted_in' | 'outside_area' | 'case_closed' | 'daily_limit' | 'too_soon' };

/** Só quem autorizou, dentro de uma área ativa, caso ainda ativo, até 3 por dia e no mínimo 6 h entre alertas do caso. */
export function notifyDecision(input: NotifyInput): NotifyDecision {
  if (!input.caseActive) return { send: false, reason: 'case_closed' };
  if (!input.optedIn) return { send: false, reason: 'not_opted_in' };
  if (!input.insideActiveArea) return { send: false, reason: 'outside_area' };
  const day = 24 * 3600000;
  if (input.sentAt.filter((time) => input.now - time < day).length >= NOTIFY_LIMITS.perDay) {
    return { send: false, reason: 'daily_limit' };
  }
  if (input.lastForCase != null && input.now - input.lastForCase < NOTIFY_LIMITS.minGapHours * 3600000) {
    return { send: false, reason: 'too_soon' };
  }
  return { send: true };
}

// ------------------------------------------------------------------ protocolo de encerramento

export const CLOSURE_STEPS = [
  'status_updated',
  'notifications_stopped',
  'mobilization_ended',
  'public_channels_updated',
  'old_alerts_expired',
  'records_preserved',
  'identity_protected',
  'history_kept',
  'administrative_closure',
] as const;
export type ClosureStep = (typeof CLOSURE_STEPS)[number];

export type ClosureOutcome = 'found' | 'cancelled';

/** O que continua público depois do encerramento: só a situação e uma mensagem genérica. */
export function publicViewAfterClosure(outcome: ClosureOutcome): {
  status: 'located' | 'closed';
  showPhoto: boolean;
  showLastPlace: boolean;
  showDetails: boolean;
} {
  return { status: outcome === 'found' ? 'located' : 'closed', showPhoto: false, showLastPlace: false, showDetails: false };
}

export type ClosureInput = {
  outcome: ClosureOutcome;
  justification: string;
  /** Pedidos de preservação ou ordens que obrigam a guardar registros. */
  legalHolds: number;
};

export function closureError(input: ClosureInput): 'justification' | undefined {
  return centralJustificationError(input.justification) ? 'justification' : undefined;
}

/** Áreas de mobilização ficam todas encerradas quando a busca pública acaba. */
export function endMobilization(areas: readonly MobilizationArea[]): MobilizationArea[] {
  return areas.map((area) => ({ ...area, status: 'ended' as const }));
}

// ------------------------------------------------------------------ retenção

export type RetentionState = 'keep' | 'legal_hold' | 'review_disposal';

/** Política definida pelos sócios e pelo jurídico. Preservação legal sempre vence o prazo. */
export function retentionState(createdAt: number, policyDays: number, legalHold: boolean, now: number): RetentionState {
  if (legalHold) return 'legal_hold';
  return now - createdAt >= policyDays * 24 * 3600000 ? 'review_disposal' : 'keep';
}

// ------------------------------------------------------------------ central técnica

export type ServiceState = 'ok' | 'degraded' | 'down' | 'not_connected';

export function overallHealth(states: readonly ServiceState[]): ServiceState {
  const live = states.filter((state) => state !== 'not_connected');
  if (live.length === 0) return 'not_connected';
  if (live.includes('down')) return 'down';
  if (live.includes('degraded')) return 'degraded';
  return 'ok';
}
