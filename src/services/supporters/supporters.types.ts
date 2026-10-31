import type { SupporterCategory } from '@/lib/supporter-rules';

/** Apoiador como aparece em público (só ativos e com a marca autorizada). */
export interface Supporter {
  id: string;
  name: string;
  websiteUrl: string | null;
  category: SupporterCategory;
  /** Endereço completo do logotipo; null mostra o nome no lugar. */
  logoUrl: string | null;
  logoWidth: number | null;
  logoHeight: number | null;
  /** Dado de demonstração (modo mock): nunca é um apoiador real. */
  demo?: boolean;
}

/** Visão da equipe: inclui situação, autorização e ordem. */
export interface SupporterAdmin extends Supporter {
  isActive: boolean;
  showOnHome: boolean;
  displayOrder: number;
  authorizationConfirmed: boolean;
  authorizationConfirmedAt: string | null;
  authorizationNote: string;
  hasLogo: boolean;
}

export interface SupporterPayload {
  name: string;
  websiteUrl: string;
  category: SupporterCategory;
  /** Logotipo novo em base64 (PNG, JPEG ou WebP). Ausente mantém o atual. */
  logoBase64?: string;
  removeLogo?: boolean;
  isActive: boolean;
  showOnHome: boolean;
  authorizationConfirmed: boolean;
  authorizationNote: string;
}
