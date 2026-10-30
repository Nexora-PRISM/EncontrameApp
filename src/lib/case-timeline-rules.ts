/**
 * Regras da linha do tempo do caso, sem dependências do app (testadas com `npm test`,
 * tests/case-timeline-rules.test.mjs). Os textos visíveis ficam em `lib/case-timeline.ts`.
 */

/** Tipos de acontecimento. Valores do contrato da API (GET /MissingPerson/{id}/timeline). */
export const TIMELINE_EVENT_TYPES = [
  'disappearance',
  'case_registered',
  'sighting',
  'status_change',
  'family_update',
  'search_expanded',
  'correction',
  'closed',
] as const;

export type TimelineEventType = (typeof TIMELINE_EVENT_TYPES)[number];

/**
 * Classificação de cada informação. "informed" é o que quem cadastrou declarou (não foi verificado
 * por ninguém); "confirmed" só vale para o que a equipe confirmou ou para fatos do próprio sistema.
 */
export const TIMELINE_CLASSIFICATIONS = [
  'confirmed',
  'informed',
  'pending_review',
  'not_confirmed',
  'corrected',
] as const;

export type TimelineClassification = (typeof TIMELINE_CLASSIFICATIONS)[number];

export type TimelineActor = 'family' | 'community' | 'moderation' | 'system';

export interface CaseTimelineEvent {
  id: string;
  type: TimelineEventType;
  /** Quando aconteceu (ISO). */
  occurredAt: string;
  /** true quando a data ou o horário são aproximados (ex.: o desaparecimento informado no cadastro). */
  approximate?: boolean;
  classification: TimelineClassification;
  /** Local resumido (bairro, cidade). Nunca o endereço exato de um avistamento. */
  place?: string;
  /** Situação do caso antes e depois (só em status_change e closed). */
  statusFrom?: number;
  statusTo?: number;
  /** Texto livre vindo do servidor (ex.: atualização da família). Não é traduzido. */
  note?: string;
  actor?: TimelineActor;
}

function normalizeKey(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

const CLASSIFICATION_ALIASES: Readonly<Record<string, TimelineClassification>> = {
  confirmed: 'confirmed',
  confirmado: 'confirmed',
  informed: 'informed',
  informado: 'informed',
  informado_no_cadastro: 'informed',
  pending_review: 'pending_review',
  aguardando_analise: 'pending_review',
  em_analise: 'pending_review',
  not_confirmed: 'not_confirmed',
  nao_confirmado: 'not_confirmed',
  corrected: 'corrected',
  corrigido: 'corrected',
  informacao_corrigida: 'corrected',
};

/** Classificação desconhecida vira "não confirmado": na dúvida, a tela não afirma nada. */
export function normalizeClassification(value: unknown): TimelineClassification {
  return CLASSIFICATION_ALIASES[normalizeKey(value)] ?? 'not_confirmed';
}

/** Tipo desconhecido é descartado (devolve null) para não mostrar um acontecimento sem saber o que é. */
export function normalizeEventType(value: unknown): TimelineEventType | null {
  const key = normalizeKey(value);
  return (TIMELINE_EVENT_TYPES as readonly string[]).includes(key) ? (key as TimelineEventType) : null;
}

export function normalizeActor(value: unknown): TimelineActor | undefined {
  const key = normalizeKey(value);
  return key === 'family' || key === 'community' || key === 'moderation' || key === 'system' ? key : undefined;
}

// ------------------------------------------------------------------ local resumido

/** Textos que o app grava quando não consegue o endereço — não dizem onde foi. */
const PLACEHOLDERS = new Set(['localizacao atual', 'current location', 'ubicacion actual']);

const STREET_PREFIX = /^(rua|r\.|avenida|av\.?|travessa|tv\.?|alameda|al\.?|praca|praça|rodovia|rod\.?|estrada|est\.?|largo|viela|beco|via)\s/i;

/**
 * Resume um endereço para a linha do tempo pública: tira rua, número e CEP e fica com bairro, cidade e estado.
 * "Rua da Bahia, 1000 - Centro, Belo Horizonte - MG, 30160-011" → "Centro, Belo Horizonte, MG".
 * Sem nada seguro para mostrar, devolve undefined.
 */
export function coarseLocation(parts: {
  location?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
}): string | undefined {
  const structured = [parts.neighborhood, parts.city, parts.state]
    .map((value) => (value ?? '').trim())
    .filter(Boolean);
  if (structured.length > 0) return dedupe(structured).join(', ');

  const text = (parts.location ?? '').trim();
  if (!text) return undefined;
  const plain = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (PLACEHOLDERS.has(plain)) return undefined;
  const pieces = text
    .split(/,|\s-\s(?=\D)/)
    .map((piece) => piece.trim())
    .filter(Boolean)
    .filter((piece) => !/\d/.test(piece))
    .filter((piece) => !STREET_PREFIX.test(`${piece} `));
  if (pieces.length === 0) return undefined;
  return dedupe(pieces).join(', ');
}

function dedupe(values: string[]): string[] {
  const out: string[] = [];
  for (const value of values) {
    if (!out.some((existing) => existing.toLowerCase() === value.toLowerCase())) out.push(value);
  }
  return out;
}

// ------------------------------------------------------------------ ordem

function timeOf(value: string): number {
  const time = Date.parse(value);
  return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time;
}

/** Do mais antigo para o mais recente; eventos sem data válida vão para o fim. */
export function sortTimeline(events: readonly CaseTimelineEvent[]): CaseTimelineEvent[] {
  return [...events].sort((left, right) => timeOf(left.occurredAt) - timeOf(right.occurredAt));
}

// ------------------------------------------------------------------ linha do tempo montada no app

export interface FallbackPersonInput {
  id: string;
  /** Quando o caso foi cadastrado (API: dtRegistration). */
  dtRegistration?: string;
  /** API: DtLastSeen do registro mais recente de "visto por último". */
  dtLastSeen?: string;
  lastSeen?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

export interface FallbackSightingInput {
  id: string;
  location?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  dtRegistration: string;
}

/**
 * Linha do tempo montada só com o que a API de hoje já devolve: o cadastro e o histórico de "visto por último".
 * - O primeiro registro do histórico é o local informado no cadastro ("informado").
 * - Os seguintes são avistamentos enviados pela comunidade, que hoje não passam por análise ("não confirmado").
 * - A data do desaparecimento só aparece quando não há avistamentos: com eles, a API devolve a data do mais recente.
 */
export function buildFallbackTimeline(
  person: FallbackPersonInput,
  history: readonly FallbackSightingInput[],
): CaseTimelineEvent[] {
  const ordered = [...history].sort((left, right) => timeOf(left.dtRegistration) - timeOf(right.dtRegistration));
  const events: CaseTimelineEvent[] = [];
  const first = ordered[0];

  if (ordered.length <= 1 && person.dtLastSeen) {
    events.push({
      id: `${person.id}-disappearance`,
      type: 'disappearance',
      occurredAt: person.dtLastSeen,
      approximate: true,
      classification: 'informed',
      place: coarseLocation({
        location: first?.location ?? person.lastSeen,
        neighborhood: first?.neighborhood ?? person.neighborhood,
        city: first?.city ?? person.city,
        state: first?.state ?? person.state,
      }),
      actor: 'family',
    });
  }

  const registeredAt = person.dtRegistration ?? first?.dtRegistration;
  if (registeredAt) {
    events.push({
      id: `${person.id}-registered`,
      type: 'case_registered',
      occurredAt: registeredAt,
      classification: 'informed',
      place: first
        ? coarseLocation(first)
        : coarseLocation({ location: person.lastSeen, neighborhood: person.neighborhood, city: person.city, state: person.state }),
      actor: 'family',
    });
  }

  for (const item of ordered.slice(1)) {
    events.push({
      id: item.id,
      type: 'sighting',
      occurredAt: item.dtRegistration,
      classification: 'not_confirmed',
      place: coarseLocation(item),
      actor: 'community',
    });
  }

  return sortTimeline(events);
}

/** Quantos acontecimentos há de cada classificação (para o resumo no topo da tela). */
export function countByClassification(
  events: readonly CaseTimelineEvent[],
): Record<TimelineClassification, number> {
  const counts: Record<TimelineClassification, number> = {
    confirmed: 0,
    informed: 0,
    pending_review: 0,
    not_confirmed: 0,
    corrected: 0,
  };
  for (const event of events) counts[event.classification] += 1;
  return counts;
}
