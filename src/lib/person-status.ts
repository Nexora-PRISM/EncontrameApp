import type { BrandColors, ColorSchemeName } from '@/constants/brand';
import { msg } from '@/lib/i18n-msg';
import { hexToRgba } from '@/lib/map-style';

/** Prefixo dos IDs gravados só no aparelho, antes do sync com a API. */
export const LOCAL_PERSON_ID_PREFIX = 'local-';

/** Sentinel de client: não colide com StatusIds da API (Pendente=1, …). */
export const LOCAL_PERSON_STATUS_ID = 0;
export const LOCAL_PERSON_STATUS_LABEL = msg('Cadastro pendente');

/**
 * Situações que a API devolve em `statusDescription`. O texto vem em português e é traduzido na
 * tela com `t(person.statusDescription)`; esta lista existe para essas palavras entrarem no
 * dicionário de traduções (scripts/check-i18n.js).
 */
export const KNOWN_STATUS_LABELS = [
  msg('Pendente'),
  msg('Procurado'),
  msg('Procurando'),
  msg('Encontrado'),
  msg('Alerta'),
  msg('Cancelado'),
] as const;

const STATUS_PENDENTE = 1;
const STATUS_PROCURADO = 2;
const STATUS_ENCONTRADO = 3;
const STATUS_ALERTA = 4;
const STATUS_CANCELADO = 99;

export function isLocalPersonId(id: string): boolean {
  return id.startsWith(LOCAL_PERSON_ID_PREFIX);
}

/** Cor do badge/texto de status, com contraste no tema claro e no escuro. */
export function resolvePersonStatusColor(
  brand: BrandColors,
  statusId?: number,
  description?: string,
): string {
  if (statusId === LOCAL_PERSON_STATUS_ID) return brand.statusCadastroPendente;
  if (statusId === STATUS_PENDENTE) return brand.statusPendente;
  if (statusId === STATUS_PROCURADO) return brand.statusProcurando;
  if (statusId === STATUS_ENCONTRADO) return brand.statusEncontrado;
  if (statusId === STATUS_ALERTA) return brand.statusAlerta;
  if (statusId === STATUS_CANCELADO) return brand.statusCancelado;

  const normalized = description?.trim().toLowerCase() ?? '';
  if (normalized.includes('cadastro pendente')) return brand.statusCadastroPendente;
  if (normalized.includes('pendente')) return brand.statusPendente;
  if (normalized.includes('procur')) return brand.statusProcurando;
  if (normalized.includes('encontrado')) return brand.statusEncontrado;
  if (normalized.includes('alerta')) return brand.statusAlerta;
  if (normalized.includes('cancelado')) return brand.statusCancelado;

  return brand.statusCancelado;
}

export function isPersonAlertStatus(statusId?: number, description?: string): boolean {
  if (statusId === STATUS_ALERTA) return true;
  return (description?.trim().toLowerCase() ?? '').includes('alerta');
}

/** Pessoa em busca ativa: o pin do mapa pulsa na cor deste status. */
export function isPersonSearchingStatus(statusId?: number, description?: string): boolean {
  if (statusId === STATUS_PROCURADO) return true;
  return (description?.trim().toLowerCase() ?? '').includes('procur');
}

/** Fundo do badge suave. O texto usa a mesma cor, mais escura e opaca. */
const STATUS_BADGE_BG_ALPHA = 0.18;

/**
 * Badge de status no formato suave: fundo translúcido e texto na mesma cor, mais fechado.
 * No escuro o escurecimento é menor, para o texto continuar legível sobre o painel.
 */
export function resolvePersonStatusBadge(
  brand: BrandColors,
  scheme: ColorSchemeName,
  statusId?: number,
  description?: string,
): { backgroundColor: string; color: string } {
  const base = resolvePersonStatusColor(brand, statusId, description);
  return {
    backgroundColor: hexToRgba(base, STATUS_BADGE_BG_ALPHA),
    color: darkenHex(base, scheme === 'dark' ? 0.14 : 0.34),
  };
}

function darkenHex(color: string, amount: number): string {
  const match = /^#([0-9a-fA-F]{6})$/.exec(color);
  if (!match) return color;

  const raw = match[1];
  const factor = 1 - Math.min(1, Math.max(0, amount));
  const channels = [0, 2, 4].map((start) =>
    Math.round(Number.parseInt(raw.slice(start, start + 2), 16) * factor)
      .toString(16)
      .padStart(2, '0'),
  );
  return `#${channels.join('')}`;
}
