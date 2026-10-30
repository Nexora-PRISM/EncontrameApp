import type { MaterialCommunityIcons } from '@expo/vector-icons';

import type { BrandColors } from '@/constants/brand';
import type { TimelineActor, TimelineClassification, TimelineEventType } from '@/lib/case-timeline-rules';
import { msg } from '@/lib/i18n-msg';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

/** Título e ícone de cada tipo de acontecimento da linha do tempo. */
export const TIMELINE_TYPE_META: Readonly<Record<TimelineEventType, { label: string; icon: IconName }>> = {
  disappearance: { label: msg('Desaparecimento'), icon: 'account-question-outline' },
  case_registered: { label: msg('Caso cadastrado'), icon: 'file-document-edit-outline' },
  sighting: { label: msg('Avistamento informado'), icon: 'eye-outline' },
  status_change: { label: msg('Mudança de situação'), icon: 'swap-horizontal' },
  family_update: { label: msg('Atualização da família'), icon: 'home-heart' },
  search_expanded: { label: msg('Busca ampliada'), icon: 'map-marker-radius-outline' },
  correction: { label: msg('Informação corrigida'), icon: 'pencil-outline' },
  closed: { label: msg('Caso encerrado'), icon: 'flag-checkered' },
};

/** Como cada classificação aparece. Nenhuma é vermelha (vermelho é só do "Pedir ajuda"). */
export const TIMELINE_CLASSIFICATION_META: Readonly<
  Record<TimelineClassification, { label: string; description: string }>
> = {
  confirmed: {
    label: msg('Confirmado'),
    description: msg('Verificado pela equipe ou registrado pelo próprio sistema.'),
  },
  informed: {
    label: msg('Informado no cadastro'),
    description: msg('Declarado por quem cadastrou o caso. Não foi verificado.'),
  },
  pending_review: {
    label: msg('Aguardando análise'),
    description: msg('Recebido e esperando a análise da equipe.'),
  },
  not_confirmed: {
    label: msg('Não confirmado'),
    description: msg('Informação da comunidade que não foi verificada.'),
  },
  corrected: {
    label: msg('Informação corrigida'),
    description: msg('Substituída por uma informação mais precisa.'),
  },
};

export const TIMELINE_CLASSIFICATION_ORDER: readonly TimelineClassification[] = [
  'confirmed',
  'informed',
  'pending_review',
  'not_confirmed',
  'corrected',
];

export function timelineClassificationColor(brand: BrandColors, classification: TimelineClassification): string {
  switch (classification) {
    case 'confirmed':
      return brand.categoryAdult;
    case 'informed':
      return brand.blue;
    case 'pending_review':
      return brand.orangeText;
    case 'not_confirmed':
      return brand.textMuted;
    case 'corrected':
      return brand.categoryElder;
  }
}

export const TIMELINE_ACTOR_LABEL: Readonly<Record<TimelineActor, string>> = {
  family: msg('Família'),
  community: msg('Comunidade'),
  moderation: msg('Equipe do Encontra-me'),
  system: msg('Sistema'),
};

/** Nome da situação do caso pelo id da API (StatusIds no backend). */
export const CASE_STATUS_LABEL_BY_ID: Readonly<Record<number, string>> = {
  1: msg('Pendente'),
  2: msg('Procurado'),
  3: msg('Encontrado'),
  4: msg('Alerta'),
  99: msg('Cancelado'),
};
