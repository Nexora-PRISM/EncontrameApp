/**
 * Proteção reforçada para crianças e adolescentes: textos do cadastro não podem citar escola, endereço de casa,
 * condomínio ou rotina (informações que podem colocar a criança em risco). Sem dependências do app
 * (tests/child-protection.test.mjs).
 */

export const MINOR_AGE_LIMIT = 18;

export function isMinor(age: number | undefined | null): boolean {
  return age != null && Number.isFinite(age) && age >= 0 && age < MINOR_AGE_LIMIT;
}

function plain(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

const SENSITIVE_PATTERNS: readonly RegExp[] = [
  /\b(escola|colegio|creche|ensino fundamental|ensino medio|sala de aula)\b/,
  /\b(endereco|mora (na|no|em)|casa d[aoe]s?|condominio|apartamento|apto|bloco \w+)\b/,
  /\b(rotina|todos os dias|todo dia|sai de casa|volta para casa|horario da aula|sai da aula)\b/,
  /\b(rua|avenida|av\.?|travessa|alameda)\s+[^,\n]{1,40}?(,|\s)\s*(n[ºo°.]?\s*)?\d{1,5}\b/,
];

/** True quando o texto cita escola, endereço, condomínio ou rotina. */
export function hasChildSensitiveText(text: string): boolean {
  const value = plain(text);
  if (!value.trim()) return false;
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(value));
}

/** Campos (pelas chaves recebidas) que precisam ser revistos para proteger a criança. */
export function childSensitiveFields(fields: Readonly<Record<string, string | undefined>>): string[] {
  return Object.entries(fields)
    .filter(([, value]) => Boolean(value) && hasChildSensitiveText(value ?? ''))
    .map(([key]) => key);
}
