/**
 * Ficha de identificação: dados preparados ANTES, guardados só neste aparelho. Regras sem dependências.
 *
 * - Nada daqui vai para a API sozinho. Virar cadastro de desaparecimento é uma ação da pessoa, que revisa tudo.
 * - Observações de saúde e comunicação nunca entram no cadastro público; aparecem só na ficha para a polícia.
 * - A "foto do dia" (roupa de hoje) vale 24 horas e depois é apagada do aparelho.
 */
export const DAY_PHOTO_TTL_MS = 24 * 60 * 60 * 1000;
export const ID_SHEET_LIMIT = 10;
export const ID_SHEET_NAME_MAX = 120;
export const ID_SHEET_TEXT_MAX = 300;
export const ID_SHEET_HEALTH_MAX = 400;
/** Criança muda rápido: foto com mais de 6 meses pede atualização. */
export const CHILD_PHOTO_MAX_AGE_MS = 183 * 24 * 60 * 60 * 1000;
export const CHILD_AGE_LIMIT = 12;

export type IdSheet = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  nickname: string;
  /** dd/mm/aaaa (opcional): a idade é calculada na hora de usar. */
  birthDate: string;
  heightCm: string;
  build: string;
  ethnicity: string;
  hair: string;
  eyes: string;
  /** Sinais, cicatrizes, tatuagens, aparelho nos dentes… */
  marks: string;
  /** Saúde e comunicação (ex.: "não fala, usa cordão de girassol"). Só na ficha, nunca no cadastro público. */
  healthNotes: string;
  /** Telefone de quem cuida. */
  contactPhone: string;
  /** Foto do rosto (base64, sem prefixo). */
  photo: string;
  photoAt: string | null;
  /** Foto da roupa de hoje (base64), apagada 24 h depois de tirada. */
  dayPhoto: string;
  dayPhotoAt: string | null;
  dayClothes: string;
};

const text = (value: unknown, max: number) => (typeof value === 'string' ? value.slice(0, max) : '');
const isoOrNull = (value: unknown) =>
  typeof value === 'string' && !Number.isNaN(new Date(value).getTime()) ? value : null;

/** Lê o que está salvo, descartando o que não for ficha válida. */
export function parseIdSheet(raw: unknown): IdSheet | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  if (typeof item.id !== 'string' || !item.id || typeof item.name !== 'string') return null;
  const createdAt = isoOrNull(item.createdAt) ?? new Date(0).toISOString();
  return {
    id: item.id,
    createdAt,
    updatedAt: isoOrNull(item.updatedAt) ?? createdAt,
    name: text(item.name, ID_SHEET_NAME_MAX),
    nickname: text(item.nickname, ID_SHEET_NAME_MAX),
    birthDate: text(item.birthDate, 10),
    heightCm: text(item.heightCm, 10),
    build: text(item.build, 40),
    ethnicity: text(item.ethnicity, 40),
    hair: text(item.hair, ID_SHEET_TEXT_MAX),
    eyes: text(item.eyes, ID_SHEET_TEXT_MAX),
    marks: text(item.marks, ID_SHEET_TEXT_MAX),
    healthNotes: text(item.healthNotes, ID_SHEET_HEALTH_MAX),
    contactPhone: text(item.contactPhone, 20),
    photo: typeof item.photo === 'string' ? item.photo : '',
    photoAt: isoOrNull(item.photoAt),
    dayPhoto: typeof item.dayPhoto === 'string' ? item.dayPhoto : '',
    dayPhotoAt: isoOrNull(item.dayPhotoAt),
    dayClothes: text(item.dayClothes, ID_SHEET_TEXT_MAX),
  };
}

/** Quando a foto do dia deixa de valer (null: não há foto do dia). */
export function dayPhotoExpiresAt(sheet: Pick<IdSheet, 'dayPhoto' | 'dayPhotoAt'>): Date | null {
  if (!sheet.dayPhoto || !sheet.dayPhotoAt) return null;
  const taken = new Date(sheet.dayPhotoAt).getTime();
  return Number.isNaN(taken) ? null : new Date(taken + DAY_PHOTO_TTL_MS);
}

export function isDayPhotoValid(sheet: Pick<IdSheet, 'dayPhoto' | 'dayPhotoAt'>, now: Date): boolean {
  const expires = dayPhotoExpiresAt(sheet);
  return expires !== null && now.getTime() < expires.getTime();
}

/** Apaga a foto do dia vencida (e a roupa descrita junto). Devolve a mesma ficha se nada mudou. */
export function purgeExpiredDayPhoto(sheet: IdSheet, now: Date): IdSheet {
  if (!sheet.dayPhoto && !sheet.dayPhotoAt && !sheet.dayClothes) return sheet;
  if (isDayPhotoValid(sheet, now)) return sheet;
  if (!sheet.dayPhoto && !sheet.dayPhotoAt && sheet.dayClothes) {
    return { ...sheet, dayClothes: '' };
  }
  return { ...sheet, dayPhoto: '', dayPhotoAt: null, dayClothes: '' };
}

/** Idade completa na data `now` a partir de dd/mm/aaaa. Data inválida ou futura: null. */
export function ageFromBirthDate(birthDate: string, now: Date): number | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(birthDate.trim());
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const birth = new Date(Date.UTC(year, month - 1, day));
  if (birth.getUTCFullYear() !== year || birth.getUTCMonth() !== month - 1 || birth.getUTCDate() !== day) return null;
  if (year < 1900 || birth.getTime() > now.getTime()) return null;
  let age = now.getUTCFullYear() - year;
  const beforeBirthday =
    now.getUTCMonth() + 1 < month || (now.getUTCMonth() + 1 === month && now.getUTCDate() < day);
  if (beforeBirthday) age -= 1;
  return age;
}

/** Foto de criança com mais de 6 meses: a ficha pede para atualizar. */
export function photoNeedsUpdate(sheet: Pick<IdSheet, 'photo' | 'photoAt' | 'birthDate'>, now: Date): boolean {
  if (!sheet.photo) return true;
  const age = ageFromBirthDate(sheet.birthDate, now);
  if (age === null || age >= CHILD_AGE_LIMIT || !sheet.photoAt) return false;
  return now.getTime() - new Date(sheet.photoAt).getTime() > CHILD_PHOTO_MAX_AGE_MS;
}

export type CaseFormValuesFromSheet = {
  fullName: string;
  nickname: string;
  age: string;
  heightCm: string;
  ethnicity: string;
  build: string;
  hair: string;
  eyes: string;
  tattoo: string;
  clothes: string;
  phone: string;
  photoBase64: string;
};

/**
 * Valores para o formulário de cadastro de desaparecimento. Observações de saúde ficam de fora (cadastro é
 * público). A roupa só vem se a foto do dia ainda vale; a foto preferida é a do rosto.
 */
export function sheetToCaseValues(sheet: IdSheet, now: Date): CaseFormValuesFromSheet {
  const age = ageFromBirthDate(sheet.birthDate, now);
  const dayValid = isDayPhotoValid(sheet, now);
  return {
    fullName: sheet.name.trim(),
    nickname: sheet.nickname.trim(),
    age: age === null ? '' : String(age),
    heightCm: sheet.heightCm.trim(),
    ethnicity: sheet.ethnicity,
    build: sheet.build,
    hair: sheet.hair.trim(),
    eyes: sheet.eyes.trim(),
    tattoo: sheet.marks.trim(),
    clothes: dayValid ? sheet.dayClothes.trim() : '',
    phone: sheet.contactPhone,
    photoBase64: sheet.photo || (dayValid ? sheet.dayPhoto : ''),
  };
}

/** Mais recentes primeiro. */
export function sortIdSheets(sheets: IdSheet[]): IdSheet[] {
  return [...sheets].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
