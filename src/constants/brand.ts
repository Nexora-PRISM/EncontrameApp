/**
 * Identidade visual do Encontra-me — paletas light/dark.
 * Hex só aqui (e espelho em global.css). Na UI use `useBrand()`.
 */

const BrandLight = {
  navy: '#0B2442',
  navyDeep: '#081B33',
  orange: '#F5822E',
  orangeDark: '#E06F1E',
  /** Texto laranja sobre fundo claro (contraste ≥ 4.5:1) — ex.: "Sair" */
  orangeText: '#B4570F',
  cream: '#F4E4C1',
  blue: '#1B4DB8',
  blueDark: '#163F97',
  /** Fundo de tela (canvas) */
  white: '#EEF1F5',
  /** Superfície elevada (menus, cards, outline) */
  surface: '#FFFFFF',
  fieldBackground: '#FFFFFF',
  fieldBorder: '#C5CBD4',
  label: '#8A8A92',
  placeholder: '#B4B4BC',
  textDark: '#1F2430',
  textMuted: '#60646C',
  divider: '#DDE2E8',
  mapBackground: '#D2D9E2',
  mapStroke: '#B4BDC8',
  pin: '#E23B3B',
  /** Campo inválido: borda e mensagem de erro */
  error: '#D93025',
  avatarBackground: '#C2C7CE',
  avatarIcon: '#E6E9ED',
  /** Rodapé dos cards de pessoa (carrossel) */
  cardInfo: '#FFFFFF',
  /** Badges de status da pessoa desaparecida */
  statusCadastroPendente: '#C98912',
  statusPendente: '#5C6370',
  statusProcurando: '#1B4DB8',
  statusAlerta: '#F24C00',
  statusEncontrado: '#1E7A4C',
  statusCancelado: '#5C6370',
  /** Texto sobre o badge de status (branco no claro, marinho no escuro) */
  onStatusBadge: '#FFFFFF',
  chatBubbleAI: '#ECEBF6',
  chatBubbleUser: '#1B4DB8',
  /** Texto sobre a bolha do usuário */
  onChatBubbleUser: '#FFFFFF',
  /** Azul transparente para interpolateColor (não usar `transparent`) */
  blueClear: 'rgba(27, 77, 184, 0)',
  /** Ícone / texto sobre azul ou pin (sempre claro) */
  onPrimary: '#FFFFFF',
  /** Overlay de modal */
  overlay: 'rgba(11, 36, 66, 0.45)',
  /** Botão "Pedir ajuda" (emergência) — vermelho reservado só para isso */
  emergency: '#C62828',
  emergencyDark: '#A31F1F',
  /** Fundo suave de cartões de emergência */
  emergencySoft: '#FDECEC',
  onEmergency: '#FFFFFF',
  /** Véu sobre o mapa (preto neutro, igual nos dois esquemas) */
  scrim: '#000000',
  /** Faixas de idade (filtros do mapa, cartões e anel do pin). Nunca vermelho. */
  categoryAll: '#C2560F',
  categoryChild: '#1B4DB8',
  categoryAdult: '#0F766E',
  categoryElder: '#6D4AC9',
  /** Texto/ícone sobre a cor cheia de uma faixa de idade */
  onCategory: '#FFFFFF',
  /** Rosa da Nexora Prism (assinatura "Um produto da Nexora Prism") */
  nexoraPink: '#D63375',
} as const;

const BrandDark = {
  navy: '#0B2442',
  navyDeep: '#081B33',
  orange: '#F5822E',
  orangeDark: '#E06F1E',
  orangeText: '#F08A3E',
  cream: '#F4E4C1',
  blue: '#3264D1',
  blueDark: '#4073E2',
  white: '#07090B',
  surface: '#13171B',
  fieldBackground: '#1B2026',
  fieldBorder: '#3E4752',
  label: '#A8AFB8',
  placeholder: '#6F7680',
  textDark: '#E8EAED',
  textMuted: '#A8AFB8',
  divider: '#3E4752',
  mapBackground: '#07090B',
  mapStroke: '#3E4752',
  pin: '#E23B3B',
  error: '#F2645A',
  avatarBackground: '#252B33',
  avatarIcon: '#6F7680',
  cardInfo: '#13171B',
  statusCadastroPendente: '#F0C14D',
  statusPendente: '#D0D4DC',
  statusProcurando: '#6B9AFF',
  statusAlerta: '#FF6B1A',
  statusEncontrado: '#7ED9A5',
  statusCancelado: '#D0D4DC',
  onStatusBadge: '#0B2442',
  chatBubbleAI: '#13171B',
  chatBubbleUser: '#3264D1',
  onChatBubbleUser: '#FFFFFF',
  blueClear: 'rgba(50, 100, 209, 0)',
  onPrimary: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.75)',
  emergency: '#D93036',
  emergencyDark: '#B8262B',
  emergencySoft: '#2A1416',
  onEmergency: '#FFFFFF',
  scrim: '#000000',
  categoryAll: '#F5822E',
  categoryChild: '#6B9AFF',
  categoryAdult: '#4FC7B8',
  categoryElder: '#B49CFF',
  onCategory: '#0B2442',
  nexoraPink: '#F0629A',
} as const;

export type ColorSchemeName = 'light' | 'dark';
/** Tokens de cor como string para permitir overlay das paletas Sofia. */
export type BrandColors = { [K in keyof typeof BrandLight]: string };

export const BrandPalettes: Record<ColorSchemeName, BrandColors> = {
  light: BrandLight,
  dark: BrandDark,
};

/** Alias da paleta light (fallback). Preferir `useBrand()` na UI. */
export const Brand: BrandColors = BrandLight;

export const Radius = {
  xs: 3,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;
