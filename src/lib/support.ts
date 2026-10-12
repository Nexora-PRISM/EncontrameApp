import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

import { AppInfo, appVersion } from '@/lib/app-info';
import { msg } from '@/lib/i18n-msg';

export type SupportTopic =
  | 'duvida'
  | 'problema'
  | 'conta'
  | 'correcao'
  | 'privacidade'
  | 'exclusao'
  | 'denuncia';

export const SUPPORT_TOPIC_LABELS: Record<SupportTopic, string> = {
  duvida: msg('Dúvida sobre o app'),
  problema: msg('Relatar um problema'),
  conta: msg('Cadastro, login ou senha'),
  correcao: msg('Corrigir ou atualizar um caso'),
  privacidade: msg('Privacidade e meus dados'),
  exclusao: msg('Excluir minha conta'),
  denuncia: msg('Denunciar conteúdo ou golpe'),
};

export type SupportDraft = {
  topic: SupportTopic;
  message: string;
  /** E-mail da conta, quando houver sessão — ajuda o suporte a localizar o cadastro. */
  accountEmail?: string;
};

/**
 * Monta o e-mail de suporte. Não existe API de chamados ainda: a solicitação só
 * chega à equipe quando a pessoa envia o e-mail no próprio app de e-mail.
 */
export function buildSupportMailto(draft: SupportDraft): string {
  const subject = `[${AppInfo.name}] ${SUPPORT_TOPIC_LABELS[draft.topic]}`;
  const lines = [
    draft.message.trim(),
    '',
    '---',
    `App: ${AppInfo.name} ${appVersion()} (${Platform.OS})`,
    ...(draft.accountEmail ? [`Conta: ${draft.accountEmail}`] : []),
  ];
  return `mailto:${AppInfo.supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
}

/**
 * Abre o app de e-mail com a mensagem pronta. Retorna false se não houver app de e-mail.
 * Não usa `canOpenURL`: no Android 11+ ele responde "não" para `mailto:` quando o esquema não está
 * declarado em `<queries>` do AndroidManifest — e o suporte nunca abria. `openURL` já falha
 * sozinho quando nenhum app de e-mail atende.
 */
export async function openSupportEmail(draft: SupportDraft): Promise<boolean> {
  const url = buildSupportMailto(draft);
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
