import { type Translate, ptTranslate } from '@/lib/i18n';
import { msg } from '@/lib/i18n-msg';

/**
 * "Alerta de possível desaparecimento": para quem encontra uma criança perdida, um idoso
 * desorientado ou alguém que não sabe dizer quem é — situações urgentes em que ainda não existe
 * boletim de ocorrência. Ligar para os serviços de emergência vem sempre primeiro.
 *
 * Nada é publicado no mapa a partir daqui: o relato vai para a equipe com prioridade (hoje por
 * e-mail; a fila própria com análise prioritária depende da API — `atualizacao-futura/`).
 */
export type PossibleMissingSituation = 'crianca' | 'idoso' | 'sem-identificacao' | 'outro';

export const POSSIBLE_MISSING_DETAILS_MAX = 800;
export const POSSIBLE_MISSING_PLACE_MAX = 120;

export const POSSIBLE_MISSING_SITUATIONS: {
  value: PossibleMissingSituation;
  label: string;
  /** Números a ligar, em ordem de prioridade. */
  calls: string[];
}[] = [
  { value: 'crianca', label: msg('Encontrei uma criança que parece perdida'), calls: ['190', '100'] },
  { value: 'idoso', label: msg('Encontrei um idoso desorientado'), calls: ['190', '192'] },
  {
    value: 'sem-identificacao',
    label: msg('Encontrei alguém que não consegue dizer quem é ou achar a família'),
    calls: ['190', '192'],
  },
  {
    value: 'outro',
    label: msg('Acho que alguém desapareceu, mas ainda não há boletim de ocorrência'),
    calls: ['190'],
  },
];

/** O que fazer agora, em frases curtas (vale para todas as situações). */
export const POSSIBLE_MISSING_STEPS: string[] = [
  msg('Ligue para a polícia (190). Se a pessoa estiver passando mal, ligue para o SAMU (192).'),
  msg('Fique com a pessoa num lugar movimentado e visível. Não a leve para a sua casa nem para o seu carro.'),
  msg('Peça ajuda a um segurança, funcionário ou policial por perto.'),
  msg('Pergunte com calma o nome, o nome de um familiar ou um telefone.'),
  msg('Não publique a foto da pessoa em redes sociais: isso pode expô-la a quem quer fazer mal.'),
];

export function possibleMissingInfo(situation: PossibleMissingSituation) {
  return (
    POSSIBLE_MISSING_SITUATIONS.find((item) => item.value === situation) ??
    POSSIBLE_MISSING_SITUATIONS[POSSIBLE_MISSING_SITUATIONS.length - 1]
  );
}

export interface PossibleMissingInput {
  situation: PossibleMissingSituation;
  /** Onde a pessoa foi encontrada (referência escrita, opcional). */
  place: string;
  details: string;
  /** A pessoa já ligou para a polícia/SAMU pelo app. */
  calledEmergency: boolean;
}

/** E-mail para a equipe, marcado como urgente. Sem fotos: a equipe pede, se precisar. */
export function buildPossibleMissingEmail(
  input: PossibleMissingInput,
  t: Translate = ptTranslate,
): { subject: string; body: string } {
  const info = possibleMissingInfo(input.situation);
  const subject = `${t('URGENTE')} — ${t('Alerta de possível desaparecimento')}`;
  const body = [
    t('Alerta de possível desaparecimento'),
    '',
    t('Situação: {situation}', { situation: t(info.label) }),
    t('Onde: {place}', { place: input.place.trim() || t('não informado') }),
    input.calledEmergency
      ? t('Já liguei para os serviços de emergência pelo app.')
      : t('Ainda não liguei para os serviços de emergência.'),
    '',
    t('Detalhes (como a pessoa está, roupas, o que ela conseguiu dizer):'),
    input.details.trim() || t('(sem detalhes)'),
    '',
    t('Não publiquei fotos da pessoa. Se precisarem de mais informações, respondam a este e-mail.'),
  ].join('\n');
  return { subject, body };
}
