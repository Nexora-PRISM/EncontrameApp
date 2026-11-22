import type { MaterialCommunityIcons } from '@expo/vector-icons';

import { haversineKm, isValidCoordinate } from '@/lib/geo';
import { type Translate, ptTranslate } from '@/lib/i18n';
import { msg } from '@/lib/i18n-msg';
import type {
  SafetyNote,
  SafetyNoteCategory,
  SafetyNotePeriod,
} from '@/services/safety-notes/safety-notes.types';

/**
 * Avisos de segurança da comunidade no mapa: regras e textos num só lugar.
 * O aviso descreve o LUGAR (rua, praça, trecho), nunca pessoas. Sem nomes, placas, telefones ou
 * características físicas — isso evita acusação, exposição e preconceito.
 */

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

/** Dias que um aviso fica no mapa sem nova confirmação. */
export const SAFETY_NOTE_VALID_DAYS = 30;
/** Diferença de "não está mais assim" sobre confirmações que tira o aviso do mapa. */
export const SAFETY_NOTE_HIDE_MARGIN = 3;
export const SAFETY_NOTE_REFERENCE_MIN = 4;
export const SAFETY_NOTE_REFERENCE_MAX = 80;
export const SAFETY_NOTE_TEXT_MAX = 140;

export const SAFETY_NOTE_CATEGORIES: {
  value: SafetyNoteCategory;
  label: string;
  description: string;
  icon: IconName;
}[] = [
  {
    value: 'attention',
    label: msg('Atenção redobrada'),
    description: msg('Lugar arriscado: fique atento ao passar.'),
    icon: 'alert-outline',
  },
  {
    value: 'robbery',
    label: msg('Assaltos frequentes'),
    description: msg('Relatos repetidos de roubo ou furto.'),
    icon: 'shield-alert-outline',
  },
  {
    value: 'deserted',
    label: msg('Rua deserta'),
    description: msg('Pouco movimento e pouca gente por perto.'),
    icon: 'road-variant',
  },
  {
    value: 'lighting',
    label: msg('Iluminação ruim'),
    description: msg('Rua escura ou postes apagados.'),
    icon: 'lightbulb-off-outline',
  },
  {
    value: 'avoid-time',
    label: msg('Evite neste horário'),
    description: msg('Tranquilo em parte do dia, arriscado em outra.'),
    icon: 'clock-alert-outline',
  },
  {
    value: 'other',
    label: msg('Outro cuidado'),
    description: msg('Outro motivo para redobrar a atenção.'),
    icon: 'map-marker-alert-outline',
  },
];

export const SAFETY_NOTE_PERIODS: { value: SafetyNotePeriod; label: string; hint?: string }[] = [
  { value: 'any', label: msg('Qualquer horário') },
  { value: 'dawn', label: msg('Madrugada'), hint: '0h–6h' },
  { value: 'morning', label: msg('Manhã'), hint: '6h–12h' },
  { value: 'afternoon', label: msg('Tarde'), hint: '12h–18h' },
  { value: 'night', label: msg('Noite'), hint: '18h–0h' },
];

export function safetyNoteCategoryInfo(category: SafetyNoteCategory) {
  return (
    SAFETY_NOTE_CATEGORIES.find((item) => item.value === category) ??
    SAFETY_NOTE_CATEGORIES[SAFETY_NOTE_CATEGORIES.length - 1]
  );
}

export function safetyNotePeriodInfo(period: SafetyNotePeriod) {
  return SAFETY_NOTE_PERIODS.find((item) => item.value === period) ?? SAFETY_NOTE_PERIODS[0];
}

/** Aviso derrubado pela comunidade ("não está mais assim" bem acima das confirmações). */
export function isSafetyNoteHidden(note: Pick<SafetyNote, 'confirmations' | 'outdatedReports'>) {
  return note.outdatedReports >= note.confirmations + SAFETY_NOTE_HIDE_MARGIN;
}

/** Confirmações de outras pessoas a partir das quais o aviso deixa de ser "relato não confirmado". */
export const SAFETY_NOTE_CONFIRMED_MIN = 2;
/** Mesmo tipo de aviso a até esta distância (metros) é tratado como o mesmo lugar. */
export const SAFETY_NOTE_DUPLICATE_RADIUS_M = 60;

/**
 * Quanto a comunidade já confirmou o aviso. Todo aviso continua sendo um relato de usuários — nunca
 * uma informação oficial:
 * - `unverified`: só quem publicou (ou uma pessoa) confirmou;
 * - `confirmed`: ao menos {@link SAFETY_NOTE_CONFIRMED_MIN} pessoas confirmaram e são maioria;
 * - `disputed`: há quem diga que "não está mais assim" na mesma medida (ou mais) que as confirmações.
 */
export type SafetyNoteVerification = 'unverified' | 'confirmed' | 'disputed';

export function safetyNoteVerification(
  note: Pick<SafetyNote, 'confirmations' | 'outdatedReports'>,
): SafetyNoteVerification {
  const confirmations = Math.max(0, note.confirmations || 0);
  const outdated = Math.max(0, note.outdatedReports || 0);
  if (outdated > 0 && outdated >= confirmations) return 'disputed';
  if (confirmations >= SAFETY_NOTE_CONFIRMED_MIN) return 'confirmed';
  return 'unverified';
}

/** Ainda vale: dentro do prazo (data válida) e não derrubado pela comunidade. */
export function isSafetyNoteActive(
  note: Pick<SafetyNote, 'expiresAt' | 'confirmations' | 'outdatedReports'>,
  now = Date.now(),
): boolean {
  const expires = new Date(note.expiresAt).getTime();
  return Number.isFinite(expires) && expires > now && !isSafetyNoteHidden(note);
}

/**
 * Limpa a lista que veio da API (ou do cache) antes de ir para o mapa:
 * - descarta aviso sem coordenada válida (nunca "chuta" um lugar);
 * - descarta vencido ou derrubado (o cache pode guardar um aviso que venceu depois da consulta);
 * - remove repetidos pelo id;
 * - junta avisos do mesmo tipo praticamente no mesmo ponto, ficando o mais confirmado.
 */
export function sanitizeSafetyNotes(notes: readonly SafetyNote[], now = Date.now()): SafetyNote[] {
  const byId = new Map<string, SafetyNote>();
  for (const note of notes) {
    if (!note || !note.id) continue;
    if (!isValidCoordinate(note.latitude, note.longitude)) continue;
    if (!isSafetyNoteActive(note, now)) continue;
    const current = byId.get(note.id);
    if (!current || new Date(note.expiresAt).getTime() > new Date(current.expiresAt).getTime()) {
      byId.set(note.id, note);
    }
  }

  const ranked = [...byId.values()].sort(
    (left, right) =>
      right.confirmations - left.confirmations ||
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
  const kept: SafetyNote[] = [];
  for (const note of ranked) {
    const duplicate = kept.some(
      (other) =>
        other.category === note.category &&
        haversineKm(other.latitude, other.longitude, note.latitude, note.longitude) * 1000 <=
          SAFETY_NOTE_DUPLICATE_RADIUS_M / 2,
    );
    if (!duplicate) kept.push(note);
  }
  return kept;
}

/** Aviso ativo do mesmo tipo perto do ponto marcado — para confirmar em vez de repetir. */
export function findSimilarSafetyNote(
  notes: readonly SafetyNote[],
  point: { latitude: number; longitude: number },
  category: SafetyNoteCategory,
  radiusMeters = SAFETY_NOTE_DUPLICATE_RADIUS_M,
): SafetyNote | null {
  let best: { note: SafetyNote; meters: number } | null = null;
  for (const note of notes) {
    if (note.category !== category) continue;
    const meters = haversineKm(point.latitude, point.longitude, note.latitude, note.longitude) * 1000;
    if (meters <= radiusMeters && (!best || meters < best.meters)) best = { note, meters };
  }
  return best?.note ?? null;
}

/** O horário informado no aviso inclui esta hora do dia (0–23)? */
export function periodIncludesHour(period: SafetyNotePeriod, hour: number): boolean {
  switch (period) {
    case 'dawn':
      return hour >= 0 && hour < 6;
    case 'morning':
      return hour >= 6 && hour < 12;
    case 'afternoon':
      return hour >= 12 && hour < 18;
    case 'night':
      return hour >= 18 && hour < 24;
    default:
      return true;
  }
}

/**
 * Bloqueia dados pessoais no texto: telefone/CPF (8 ou mais dígitos, mesmo com pontos e traços),
 * e-mail e @perfil. O aviso fala do lugar; contato e identificação de pessoas não entram.
 */
export function containsPersonalData(text: string): boolean {
  const digits = text.replace(/[\s.\-()/]/g, '');
  if (/\d{8,}/.test(digits)) return true;
  if (/\S+@\S+\.\S+/.test(text)) return true;
  return /(^|\s)@\w{3,}/.test(text);
}

/** Dias inteiros desde uma data ISO (0 = hoje). */
export function daysSince(iso: string, now = Date.now()): number {
  const time = new Date(iso).getTime();
  if (!Number.isFinite(time)) return 0;
  return Math.max(0, Math.floor((now - time) / (24 * 60 * 60 * 1000)));
}

/** "Hoje", "Ontem" ou "Há 3 dias". */
export function publishedAgo(iso: string, t: Translate = ptTranslate): string {
  const days = daysSince(iso);
  if (days === 0) return t('Publicado hoje');
  if (days === 1) return t('Publicado ontem');
  return t('Publicado há {count} dias', { count: days });
}

/** Corpo do e-mail de denúncia de um aviso (sem API de moderação ainda). */
export function buildSafetyNoteReportMessage(
  note: Pick<SafetyNote, 'id' | 'reference'>,
  t: Translate = ptTranslate,
): string {
  return [
    t('Aviso de segurança: {reference}', { reference: note.reference }),
    t('Identificação do aviso: {id}', { id: note.id }),
    '',
    t('Motivo (aviso falso, ofensivo, preconceituoso, cita pessoas, já não é verdade, outro):'),
    '',
    '',
    t('Detalhes:'),
    '',
  ].join('\n');
}
