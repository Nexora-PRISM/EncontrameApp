import { type Translate, ptTranslate } from '@/lib/i18n';
import { msg } from '@/lib/i18n-msg';
import type { ModerationReason } from '@/services/moderation/moderation.types';

/**
 * "Sou a pessoa procurada" e "Estou sofrendo perseguição": regras e textos num só lugar.
 *
 * Hoje o pedido segue por dois caminhos que já existem:
 * 1. com conta conectada e um caso publicado, uma denúncia vai para a fila da equipe
 *    (`POST /Moderation/reports`), que pode ocultar o caso enquanto analisa;
 * 2. sempre, o app de e-mail abre com a mensagem pronta para a equipe (sem login).
 *
 * Nunca pedimos a localização de quem contesta e nada disso é mostrado a quem criou o alerta.
 * Foto para verificação, acompanhamento do pedido e decisão registrada dependem da API de
 * contestação (pasta `atualizacao-futura/`).
 */
export type ProtectionMode = 'sou-eu' | 'perseguicao';

export type ProtectionSituation =
  | 'estou-bem'
  | 'uso-indevido'
  | 'retirar'
  | 'risco'
  | 'localizar'
  | 'alerta-falso'
  | 'ameacas'
  | 'dados'
  | 'outro';

export const PROTECTION_DETAILS_MAX = 1000;

export const PROTECTION_SITUATIONS: Record<
  ProtectionMode,
  { value: ProtectionSituation; label: string }[]
> = {
  'sou-eu': [
    { value: 'estou-bem', label: msg('Estou bem e não estou desaparecido(a)') },
    { value: 'uso-indevido', label: msg('Meus dados ou minha imagem estão sendo usados sem autorização') },
    { value: 'retirar', label: msg('Quero que o alerta seja retirado ou suspenso') },
    { value: 'risco', label: msg('Existe perseguição, ameaça ou risco para mim') },
  ],
  perseguicao: [
    { value: 'localizar', label: msg('Alguém está usando o app para tentar me localizar') },
    { value: 'alerta-falso', label: msg('Alguém publicou um alerta falso com a minha foto') },
    { value: 'ameacas', label: msg('Estou recebendo ameaças') },
    { value: 'dados', label: msg('Estão usando meus dados sem autorização') },
    { value: 'outro', label: msg('Outro motivo') },
  ],
};

const RISK_SITUATIONS: readonly ProtectionSituation[] = [
  'risco',
  'localizar',
  'alerta-falso',
  'ameacas',
];

export function parseProtectionMode(value: unknown): ProtectionMode {
  return value === 'perseguicao' ? 'perseguicao' : 'sou-eu';
}

/** Mantém só situações que existem no modo escolhido (e sem repetição). */
export function normalizeSituations(
  mode: ProtectionMode,
  situations: readonly string[],
): ProtectionSituation[] {
  const allowed = new Set<string>(PROTECTION_SITUATIONS[mode].map((item) => item.value));
  return [...new Set(situations)].filter((item): item is ProtectionSituation => allowed.has(item));
}

/** Perseguição, ameaça ou alerta falso: análise com urgência (e ocultação preventiva pela equipe). */
export function isUrgentProtection(mode: ProtectionMode, situations: readonly ProtectionSituation[]) {
  return mode === 'perseguicao' || situations.some((item) => RISK_SITUATIONS.includes(item));
}

/** Motivo da denúncia na fila da equipe (a API aceita só alguns valores fechados). */
export function protectionReportReason(
  mode: ProtectionMode,
  situations: readonly ProtectionSituation[],
): ModerationReason {
  return isUrgentProtection(mode, situations) ? 'abuse' : 'false_info';
}

/**
 * Detalhes que parecem um endereço ou um ponto de encontro (CEP, rua com número, coordenada).
 * Não bloqueia: o app pede para conferir, porque a equipe não precisa saber onde a pessoa está.
 */
export function looksLikeLocation(text: string): boolean {
  const value = text.toLowerCase();
  if (/\b\d{5}-?\d{3}\b/.test(value)) return true; // CEP
  if (/-?\d{1,2}[.,]\d{4,}\s*[,;\s]\s*-?\d{1,3}[.,]\d{4,}/.test(value)) return true; // coordenada
  return /\b(rua|r\.|avenida|av\.?|travessa|alameda|estrada|rodovia|praça|bairro)\s+[^\n]{2,60}?\b(n[ºo°]?\.?\s*)?\d{1,5}\b/.test(
    value,
  );
}

export interface ProtectionEmailInput {
  mode: ProtectionMode;
  situations: readonly ProtectionSituation[];
  details: string;
  /** Identificação do caso publicado (quando a pessoa veio da página dele). */
  caseId?: string;
  /** A denúncia também foi registrada na fila da equipe pelo app. */
  registeredInApp?: boolean;
}

/** Assunto e corpo do e-mail para a equipe, no idioma do app. Sem localização de quem escreve. */
export function buildProtectionEmail(
  input: ProtectionEmailInput,
  t: Translate = ptTranslate,
): { subject: string; body: string } {
  const urgent = isUrgentProtection(input.mode, input.situations);
  const title =
    input.mode === 'perseguicao' ? t('Estou sofrendo perseguição') : t('Sou a pessoa procurada');
  const subject = `${urgent ? t('URGENTE') : t('PRIORITÁRIO')} — ${title}`;
  const labels = PROTECTION_SITUATIONS[input.mode]
    .filter((item) => input.situations.includes(item.value))
    .map((item) => `- ${t(item.label)}`);

  const lines = [
    title,
    '',
    ...(input.caseId ? [t('Identificação do caso: {id}', { id: input.caseId }), ''] : []),
    t('O que está acontecendo:'),
    ...(labels.length > 0 ? labels : [`- ${t('Não informado')}`]),
    '',
    t('Detalhes:'),
    input.details.trim() || t('(sem detalhes)'),
    '',
    input.registeredInApp
      ? t('Também registrei este pedido pelo app.')
      : t('Pedido enviado só por e-mail (sem registro pelo app).'),
    t('Não informei minha localização. Por favor, não compartilhem meus dados com quem criou o alerta.'),
    t('Se precisarem confirmar que sou eu, respondam a este e-mail. Posso enviar uma foto atual só para essa verificação.'),
  ];
  return { subject, body: lines.join('\n') };
}
