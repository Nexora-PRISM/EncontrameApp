/**
 * Regras do relato de avistamento ("Eu vi essa pessoa"), sem dependências do app.
 * Nada aqui acessa rede, aparelho ou tradução — por isso é testado direto com `npm test`
 * (tests/sighting-report-rules.test.mjs). Os textos visíveis ficam em `lib/sighting-report.ts`.
 */

/** Situações de um relato, na ordem em que normalmente acontecem. Valores do contrato da API. */
export const SIGHTING_STATUSES = [
  'received',
  'pending_review',
  'in_review',
  'relevant',
  'not_confirmed',
  'closed',
] as const;

export type SightingStatus = (typeof SIGHTING_STATUSES)[number];

const STATUS_ALIASES: Readonly<Record<string, SightingStatus>> = {
  received: 'received',
  recebido: 'received',
  pending_review: 'pending_review',
  pendingreview: 'pending_review',
  aguardando_analise: 'pending_review',
  in_review: 'in_review',
  inreview: 'in_review',
  em_analise: 'in_review',
  relevant: 'relevant',
  relevante: 'relevant',
  informacao_considerada_relevante: 'relevant',
  not_confirmed: 'not_confirmed',
  notconfirmed: 'not_confirmed',
  nao_confirmado: 'not_confirmed',
  closed: 'closed',
  encerrado: 'closed',
};

/**
 * Converte a situação devolvida pela API (em inglês ou português, com ou sem acento) para o valor interno.
 * Valor desconhecido vira "received": o servidor respondeu, mas não dá para afirmar mais nada.
 */
export function normalizeSightingStatus(value: unknown): SightingStatus {
  if (typeof value !== 'string') return 'received';
  const key = value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return STATUS_ALIASES[key] ?? 'received';
}

/**
 * Só há confirmação de recebimento quando o servidor devolve o número do relato e o horário em que o recebeu.
 * Sem os dois, a tela não pode dizer "recebido" (mesma regra do alerta de emergência).
 */
export function isConfirmedReceipt(
  receipt: { reportId?: string | null; receivedAt?: string | null } | null | undefined,
): boolean {
  if (!receipt) return false;
  const id = typeof receipt.reportId === 'string' ? receipt.reportId.trim() : '';
  const at = typeof receipt.receivedAt === 'string' ? receipt.receivedAt.trim() : '';
  return id.length > 0 && at.length > 0 && !Number.isNaN(Date.parse(at));
}

// ------------------------------------------------------------------ data e horário do avistamento

/** Tolerância para relógios adiantados: um avistamento não pode estar no futuro além disso. */
export const FUTURE_TOLERANCE_MS = 5 * 60 * 1000;

export type SeenAtError = 'date_required' | 'date_invalid' | 'date_future' | 'time_required' | 'time_invalid' | 'time_future';

export type SeenAtResult = { ok: true; iso: string } | { ok: false; field: 'date' | 'time'; error: SeenAtError };

function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

/** dd/mm/aaaa no horário local do aparelho. */
export function formatDateBr(date: Date): string {
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/** hh:mm no horário local do aparelho. */
export function formatTimeBr(date: Date): string {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

/** Máscara de horário enquanto a pessoa digita: "1435" → "14:35". */
export function maskTime(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

/**
 * Junta data (dd/mm/aaaa) e horário (hh:mm) do avistamento em ISO (UTC), no fuso do aparelho.
 * Recusa datas inexistentes (31/02), anteriores a 1900 e momentos no futuro.
 */
export function parseSeenAt(dateText: string, timeText: string, now: Date = new Date()): SeenAtResult {
  const dateValue = dateText.trim();
  const timeValue = timeText.trim();
  if (!dateValue) return { ok: false, field: 'date', error: 'date_required' };

  const dateMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateValue);
  if (!dateMatch) return { ok: false, field: 'date', error: 'date_invalid' };
  const day = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const year = Number(dateMatch[3]);
  const dayStart = new Date(year, month - 1, day, 0, 0, 0, 0);
  if (
    year < 1900 ||
    dayStart.getFullYear() !== year ||
    dayStart.getMonth() !== month - 1 ||
    dayStart.getDate() !== day
  ) {
    return { ok: false, field: 'date', error: 'date_invalid' };
  }

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  if (dayStart.getTime() > todayStart.getTime()) {
    return { ok: false, field: 'date', error: 'date_future' };
  }

  if (!timeValue) return { ok: false, field: 'time', error: 'time_required' };
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(timeValue);
  if (!timeMatch) return { ok: false, field: 'time', error: 'time_invalid' };
  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  if (hours > 23 || minutes > 59) return { ok: false, field: 'time', error: 'time_invalid' };

  const seen = new Date(year, month - 1, day, hours, minutes, 0, 0);
  if (seen.getTime() > now.getTime() + FUTURE_TOLERANCE_MS) {
    return { ok: false, field: 'time', error: 'time_future' };
  }
  return { ok: true, iso: seen.toISOString() };
}

// ------------------------------------------------------------------ textos do relato

export const SIGHTING_TEXT_LIMITS = {
  descriptionMin: 10,
  descriptionMax: 1000,
  shortMax: 300,
  detailsMax: 1000,
} as const;

export type SightingTextField = 'description' | 'clothes' | 'features' | 'direction' | 'reference' | 'details';
export type SightingTextError = 'required' | 'too_short' | 'too_long';
export type SightingTextValues = Record<SightingTextField, string>;

/** Descrição é obrigatória (mínimo de 10 letras); os outros campos são opcionais, só com limite de tamanho. */
export function validateSightingTexts(values: SightingTextValues): Partial<Record<SightingTextField, SightingTextError>> {
  const errors: Partial<Record<SightingTextField, SightingTextError>> = {};
  const description = values.description.trim();
  if (!description) errors.description = 'required';
  else if (description.length < SIGHTING_TEXT_LIMITS.descriptionMin) errors.description = 'too_short';
  else if (description.length > SIGHTING_TEXT_LIMITS.descriptionMax) errors.description = 'too_long';

  for (const field of ['clothes', 'features', 'direction', 'reference'] as const) {
    if (values[field].trim().length > SIGHTING_TEXT_LIMITS.shortMax) errors[field] = 'too_long';
  }
  if (values.details.trim().length > SIGHTING_TEXT_LIMITS.detailsMax) errors.details = 'too_long';
  return errors;
}

/** Texto opcional limpo: vazio vira undefined (não vai à API). */
export function optionalText(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

// ------------------------------------------------------------------ limite contra envios repetidos

/** Até 3 relatos sobre o mesmo caso a cada 10 minutos, por aparelho. O servidor precisa ter o seu próprio limite. */
export const SIGHTING_RATE_LIMIT = { max: 3, windowMs: 10 * 60 * 1000 } as const;

export type RateLimitResult = { allowed: boolean; retryInMs: number; recent: number[] };

export function checkRateLimit(
  timestamps: readonly number[],
  now: number,
  limit: { max: number; windowMs: number } = SIGHTING_RATE_LIMIT,
): RateLimitResult {
  const recent = timestamps.filter((at) => at <= now && now - at < limit.windowMs).sort((a, b) => a - b);
  if (recent.length < limit.max) return { allowed: true, retryInMs: 0, recent };
  const oldest = recent[recent.length - limit.max] ?? now;
  return { allowed: false, retryInMs: Math.max(0, oldest + limit.windowMs - now), recent };
}

/** Minutos para mostrar na tela (arredonda para cima, mínimo 1). */
export function retryMinutes(retryInMs: number): number {
  return Math.max(1, Math.ceil(retryInMs / 60000));
}
