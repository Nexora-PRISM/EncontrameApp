import { msg } from '@/lib/i18n-msg';
import { type ErrorCode, optionalRangeError } from '@/lib/validation';

/**
 * Regras de legitimidade do cadastro de pessoa desaparecida.
 * Objetivo: reduzir falsos alertas e o uso do app para localizar quem se afastou por segurança.
 */
export const RELATIONSHIP_OPTIONS = [
  msg('Mãe ou pai'),
  msg('Responsável legal'),
  msg('Outro familiar'),
  msg('Cônjuge ou companheiro(a)'),
  msg('Amigo(a)'),
  msg('Outro'),
] as const;

/** Idade abaixo da qual o cadastro exige número de boletim de ocorrência (ECA: até 17 anos). */
export const ADULT_AGE = 18;

const POLICE_REPORT_MIN = 4;

/** Menor de idade pela idade digitada (campo opcional: vazio não conta como menor). */
export function isMinorAge(age: string): boolean {
  const digits = age.replace(/\D/g, '');
  if (!digits) return false;
  const value = Number.parseInt(digits, 10);
  return Number.isFinite(value) && value < ADULT_AGE;
}

export const AGE_MIN = 0;
export const AGE_MAX = 130;

/**
 * Idade obrigatória (pode ser aproximada). Antes era opcional — e bastava deixá-la em branco
 * para que o boletim de ocorrência de uma criança deixasse de ser exigido.
 */
export function ageError(value: string): ErrorCode | undefined {
  if (!value.trim()) return 'required';
  return optionalRangeError(value, AGE_MIN, AGE_MAX);
}

/** Boletim de ocorrência: obrigatório para menores; se informado, precisa ter número plausível. */
export function policeReportError(value: string, required: boolean): ErrorCode | undefined {
  const trimmed = value.trim();
  if (!trimmed) return required ? 'required' : undefined;
  const digits = trimmed.replace(/\D/g, '');
  return digits.length < POLICE_REPORT_MIN ? 'too_short' : undefined;
}
