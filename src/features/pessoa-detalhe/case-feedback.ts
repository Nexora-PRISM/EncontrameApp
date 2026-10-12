import { type Translate, ptTranslate } from '@/lib/i18n';

/**
 * Pedidos sobre um caso publicado: correção/atualização ou denúncia.
 *
 * Ainda não há API de moderação: o pedido vai por e-mail para o suporte (lib/support.ts), já com
 * a identificação do caso. A mensagem só chega à equipe quando a pessoa a envia no app de e-mail —
 * a tela nunca diz que o pedido "foi registrado".
 */
export type CaseFeedbackKind = 'correcao' | 'denuncia';

export interface CaseFeedbackTarget {
  id: string;
  fullName: string;
}

/** Corpo do e-mail, no idioma do app (`t`) — a identificação do caso vai sempre. */
export function buildCaseFeedbackMessage(
  kind: CaseFeedbackKind,
  person: CaseFeedbackTarget,
  t: Translate = ptTranslate,
): string {
  const header = [
    t('Caso: {name}', { name: person.fullName }),
    t('Identificação do caso: {id}', { id: person.id }),
    '',
  ];

  if (kind === 'correcao') {
    return [
      ...header,
      t(
        'O que precisa mudar (por exemplo: a pessoa foi encontrada, há um dado errado, tenho uma foto mais recente):',
      ),
      '',
      '',
      t('Meu vínculo com a pessoa:'),
      '',
    ].join('\n');
  }

  return [
    ...header,
    t(
      'Motivo (cadastro falso, golpe ou pedido de dinheiro, exposição indevida, sou a pessoa cadastrada e estou em segurança, outro):',
    ),
    '',
    '',
    t('Detalhes:'),
    '',
  ].join('\n');
}
