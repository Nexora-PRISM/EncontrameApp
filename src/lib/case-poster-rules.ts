/**
 * Regras do cartaz digital do caso, sem dependências do app (testadas em tests/case-poster-rules.test.mjs).
 * O cartaz só usa o que já é público na página do caso: nunca telefone, endereço ou documentos.
 */

export type PosterAvailability = 'available' | 'pending' | 'closed';

/**
 * Cartaz só para caso em busca (Procurado ou Alerta). Caso Pendente ainda não foi aprovado pela equipe;
 * Encontrado ou Cancelado não pode continuar sendo divulgado. Situação desconhecida: não gera cartaz.
 */
export function posterAvailability(statusId?: number, description?: string): PosterAvailability {
  if (statusId === 2 || statusId === 4) return 'available';
  if (statusId === 3 || statusId === 99) return 'closed';
  if (statusId === 1 || statusId === 0) return 'pending';
  const text = (description ?? '').trim().toLowerCase();
  if (text.includes('encontrad') || text.includes('cancelad')) return 'closed';
  if (text.includes('procur') || text.includes('alerta')) return 'available';
  return 'pending';
}

/** Link público do caso, para o QR Code. Sem o endereço do app web, não há link (devolve null). */
export function caseUrl(webUrl: string, personId: string): string | null {
  const base = webUrl.trim().replace(/\/+$/, '');
  if (!base || !personId) return null;
  return `${base}/pessoa/${encodeURIComponent(personId)}`;
}

export type PosterTraitKind = 'height' | 'hair' | 'eyes' | 'clothes' | 'tattoo' | 'accessories';

export interface PosterPersonInput {
  id: string;
  fullName: string;
  nickname?: string;
  age?: number;
  heightCm?: string;
  hair?: string;
  eyes?: string;
  clothes?: string;
  tattoo?: string;
  accessories?: string;
  dtLastSeen?: string;
}

export interface PosterOptions {
  showAge: boolean;
  showDate: boolean;
  showTraits: boolean;
}

export const DEFAULT_POSTER_OPTIONS: PosterOptions = { showAge: true, showDate: true, showTraits: true };

export interface PosterContent {
  name: string;
  nickname?: string;
  age?: number;
  /** dd/mm/aaaa (lida em UTC, como no resto do app). */
  lastSeenDate?: string;
  /** No máximo 3 características, na ordem de prioridade. */
  traits: { kind: PosterTraitKind; value: string }[];
}

export const POSTER_MAX_TRAITS = 3;
const TRAIT_MAX_LENGTH = 60;

function trimText(value: string | undefined, max: number): string | undefined {
  const text = (value ?? '').replace(/\s+/g, ' ').trim();
  if (!text) return undefined;
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

export function formatPosterDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return undefined;
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getUTCFullYear()}`;
}

/** Monta o conteúdo do cartaz com as opções escolhidas. */
export function buildPosterContent(person: PosterPersonInput, options: PosterOptions): PosterContent {
  const candidates: { kind: PosterTraitKind; value?: string }[] = [
    { kind: 'clothes', value: person.clothes },
    { kind: 'height', value: person.heightCm ? `${person.heightCm.trim()} cm` : undefined },
    { kind: 'hair', value: person.hair },
    { kind: 'eyes', value: person.eyes },
    { kind: 'tattoo', value: person.tattoo },
    { kind: 'accessories', value: person.accessories },
  ];
  const traits = options.showTraits
    ? candidates
        .map((item) => ({ kind: item.kind, value: trimText(item.value, TRAIT_MAX_LENGTH) }))
        .filter((item): item is { kind: PosterTraitKind; value: string } => Boolean(item.value))
        .slice(0, POSTER_MAX_TRAITS)
    : [];
  return {
    name: trimText(person.fullName, 80) ?? '',
    nickname: trimText(person.nickname, 40),
    age: options.showAge && person.age != null && person.age >= 0 ? person.age : undefined,
    lastSeenDate: options.showDate ? formatPosterDate(person.dtLastSeen) : undefined,
    traits,
  };
}
