/**
 * Marca um texto para tradução sem traduzir agora. O valor continua o mesmo (em português) e é
 * traduzido na hora de aparecer, com `t()` (ou `tr()` em ações).
 *
 * Use em listas e constantes fora dos componentes (opções de seleção, mensagens de erro, conteúdo
 * da Central de Ajuda…): o `scripts/check-i18n.js` encontra esses textos e confere se todos os
 * idiomas têm tradução. Sem dependências de propósito — pode ser importado de qualquer arquivo.
 */
export function msg<T extends string>(text: T): T {
  return text;
}
