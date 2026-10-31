/**
 * Nossos Apoiadores: regras sem dependências (testadas direto no Node).
 * Categorias só organizam o reconhecimento; não há classificação por valor.
 */
export const SUPPORTER_CATEGORIES = ['patrocinador', 'parceiro', 'apoiador'] as const;
export type SupporterCategory = (typeof SUPPORTER_CATEGORIES)[number];

export const SUPPORTER_NAME_MIN = 2;
export const SUPPORTER_NAME_MAX = 80;
export const SUPPORTER_NOTE_MAX = 200;
/** Mesmo limite da API: logotipos são leves. */
export const SUPPORTER_LOGO_MAX_BYTES = 300 * 1024;

export type SupporterFormErrorCode = 'required' | 'too_short' | 'invalid_format';

export type SupporterFormInput = {
  name: string;
  websiteUrl: string;
  category: string;
  isActive: boolean;
  authorizationConfirmed: boolean;
  authorizationNote: string;
};

export type SupporterFormErrors = Partial<Record<keyof SupporterFormInput, SupporterFormErrorCode>>;

export const isSupporterCategory = (value: string): value is SupporterCategory =>
  (SUPPORTER_CATEGORIES as readonly string[]).includes(value);

/** Site oficial: só https e com domínio de verdade. Devolve o endereço normalizado ou null. */
export function normalizeWebsite(value: string): string | null {
  const text = value.trim();
  if (!text || text.length > 300) return null;
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || url.username || url.password) return null;
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(url.hostname)) return null;
  return url.toString();
}

/** Mostra só o domínio ("exemplo.com.br") no lugar do endereço completo. */
export function websiteLabel(url: string | null | undefined): string {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/** Erros do formulário da equipe. Publicar exige a autorização de uso da marca confirmada. */
export function validateSupporterForm(input: SupporterFormInput): SupporterFormErrors {
  const errors: SupporterFormErrors = {};
  const name = input.name.trim();
  if (!name) errors.name = 'required';
  else if (name.length < SUPPORTER_NAME_MIN) errors.name = 'too_short';
  else if (name.length > SUPPORTER_NAME_MAX) errors.name = 'invalid_format';
  if (input.websiteUrl.trim() && normalizeWebsite(input.websiteUrl) === null) errors.websiteUrl = 'invalid_format';
  if (!input.category) errors.category = 'required';
  else if (!isSupporterCategory(input.category)) errors.category = 'invalid_format';
  if (input.authorizationNote.trim().length > SUPPORTER_NOTE_MAX) errors.authorizationNote = 'invalid_format';
  if (input.isActive && !input.authorizationConfirmed) errors.authorizationConfirmed = 'required';
  return errors;
}

const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Decodifica só o começo do base64 (o suficiente para reconhecer o tipo do arquivo). */
function headBytes(base64: string, count: number): number[] {
  const clean = base64.replace(/^data:[^,]*,/, '').replace(/\s/g, '').slice(0, Math.ceil((count * 4) / 3) + 4);
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const char of clean) {
    const value = BASE64_ALPHABET.indexOf(char);
    if (value < 0) break;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return bytes.slice(0, count);
}

const ascii = (bytes: number[], start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));

/** Tipo do logotipo pelo conteúdo (base64): só PNG, JPEG e WebP. SVG fica de fora (pode ter script). */
export function logoTypeFromBase64(base64: string): 'image/png' | 'image/jpeg' | 'image/webp' | null {
  const bytes = headBytes(base64, 12);
  if (bytes[0] === 0x89 && ascii(bytes, 1, 4) === 'PNG') return 'image/png';
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 12) === 'WEBP') return 'image/webp';
  return null;
}

/** Bytes de um texto base64 (sem o prefixo data:). */
export function base64Bytes(base64: string): number {
  const clean = base64.replace(/^data:[^,]*,/, '').replace(/\s/g, '');
  if (!clean) return 0;
  const padding = clean.endsWith('==') ? 2 : clean.endsWith('=') ? 1 : 0;
  return Math.floor((clean.length * 3) / 4) - padding;
}

/** Agrupa por categoria na ordem de apresentação: patrocinadores, parceiros, apoiadores. */
export function groupByCategory<T extends { category: SupporterCategory }>(items: T[]): { category: SupporterCategory; items: T[] }[] {
  return SUPPORTER_CATEGORIES.map((category) => ({ category, items: items.filter((item) => item.category === category) })).filter(
    (group) => group.items.length > 0,
  );
}

/** Move um item uma posição (para cima: -1, para baixo: +1) e devolve a nova lista de ids. */
export function moveId(ids: string[], id: string, direction: -1 | 1): string[] {
  const index = ids.indexOf(id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= ids.length) return ids;
  const next = [...ids];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/** Colunas da grade conforme a largura disponível (celular 2, tablet 3 ou 4, computador 5). */
export function supporterColumns(width: number): number {
  if (width < 520) return 2;
  if (width < 760) return 3;
  if (width < 1100) return 4;
  return 5;
}
