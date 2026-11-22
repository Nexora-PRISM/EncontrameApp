import { msg } from '@/lib/i18n-msg';

/**
 * Quem publica, em quatro grupos com regras diferentes:
 * - `family`: familiar ou responsável legal — conta verificada + vínculo + declaração; a equipe pode
 *   pedir documentos antes de aprovar;
 * - `acquaintance`: amigo, conhecido ou vizinho — boletim de ocorrência obrigatório;
 * - `stranger`: não conhece a pessoa — boletim obrigatório; em emergência (criança perdida, idoso
 *   desorientado), o caminho é "Encontrei alguém perdido", que não publica nada sem análise;
 * - `institution`: instituição ou autoridade — boletim obrigatório e comprovação pedida pela equipe.
 *
 * Todo cadastro entra como "Pendente" e só aparece ao público depois da aprovação da equipe.
 * O boletim vai só para a equipe (nunca aparece no caso) e, sozinho, não prova legitimidade.
 */
export type RelationshipGroup = 'family' | 'acquaintance' | 'stranger' | 'institution';

export const RELATIONSHIPS: readonly {
  /** Texto mostrado e guardado no rascunho (chave de tradução). */
  label: string;
  group: RelationshipGroup;
  /**
   * Valor aceito pela API hoje (lista fechada em CaseLegitimacy.Relationships). A API ainda não
   * conhece as opções novas; quando passar a aceitá-las (atualizacao-futura/), envie o `label`.
   */
  api: string;
}[] = [
  { label: msg('Pai ou mãe'), group: 'family', api: 'Mãe ou pai' },
  { label: msg('Filho ou filha'), group: 'family', api: 'Outro familiar' },
  { label: msg('Irmão ou irmã'), group: 'family', api: 'Outro familiar' },
  { label: msg('Cônjuge ou companheiro(a)'), group: 'family', api: 'Cônjuge ou companheiro(a)' },
  { label: msg('Responsável legal'), group: 'family', api: 'Responsável legal' },
  { label: msg('Outro familiar'), group: 'family', api: 'Outro familiar' },
  { label: msg('Amigo ou conhecido'), group: 'acquaintance', api: 'Amigo(a)' },
  { label: msg('Vizinho'), group: 'acquaintance', api: 'Outro' },
  { label: msg('Pessoa desconhecida'), group: 'stranger', api: 'Outro' },
  { label: msg('Instituição ou autoridade'), group: 'institution', api: 'Outro' },
];

export const RELATIONSHIP_OPTIONS: readonly string[] = RELATIONSHIPS.map((item) => item.label);

/** Rótulos antigos (rascunhos salvos antes da mudança) que têm equivalente exato. */
const LEGACY_RELATIONSHIPS: Readonly<Record<string, string>> = {
  'Mãe ou pai': 'Pai ou mãe',
  'Amigo(a)': 'Amigo ou conhecido',
};

/** Vínculo válido para o formulário, ou vazio (o antigo "Outro" pede uma nova escolha). */
export function normalizeRelationship(value: string | undefined | null): string {
  const trimmed = (value ?? '').trim();
  if (RELATIONSHIP_OPTIONS.includes(trimmed)) return trimmed;
  return LEGACY_RELATIONSHIPS[trimmed] ?? '';
}

export function relationshipGroup(value: string): RelationshipGroup | null {
  return RELATIONSHIPS.find((item) => item.label === value)?.group ?? null;
}

/** Valor enviado à API para o vínculo escolhido (compatível com a lista que ela aceita hoje). */
export function relationshipApiValue(value: string): string {
  return RELATIONSHIPS.find((item) => item.label === value)?.api ?? value;
}

