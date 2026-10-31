import { msg } from '@/lib/i18n-msg';
import type { SupporterCategory } from '@/lib/supporter-rules';

/** Nome da categoria (um apoiador). */
export const SUPPORTER_CATEGORY_LABEL: Record<SupporterCategory, string> = {
  patrocinador: msg('Patrocinador'),
  parceiro: msg('Parceiro'),
  apoiador: msg('Apoiador'),
};

/** Título do grupo na página completa. */
export const SUPPORTER_CATEGORY_TITLE: Record<SupporterCategory, string> = {
  patrocinador: msg('Patrocinadores'),
  parceiro: msg('Parceiros'),
  apoiador: msg('Apoiadores'),
};

/** Explicação para a equipe ao escolher a categoria. Nenhuma depende de valor em dinheiro. */
export const SUPPORTER_CATEGORY_HINT: Record<SupporterCategory, string> = {
  patrocinador: msg('Patrocina o projeto de forma contínua.'),
  parceiro: msg('Trabalha junto em ações, divulgação ou serviços.'),
  apoiador: msg('Apoia a causa de outras formas.'),
};

export const SUPPORTERS_INTRO = msg(
  'Empresas e organizações que acreditam na importância de unir tecnologia, sociedade e solidariedade para ajudar a encontrar pessoas desaparecidas.',
);
