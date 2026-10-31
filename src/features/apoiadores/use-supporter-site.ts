import * as Linking from 'expo-linking';

import { confirmAction, showAlert } from '@/lib/dialog';
import { tr } from '@/lib/i18n';
import { normalizeWebsite, websiteLabel } from '@/lib/supporter-rules';
import type { Supporter } from '@/services/supporters/supporters.types';

/**
 * Abre o site oficial de um apoiador. Pergunta antes, porque o link sai do Encontra-me,
 * e só abre endereço https válido (o mesmo critério da API).
 */
export async function openSupporterSite(supporter: Supporter): Promise<void> {
  const url = normalizeWebsite(supporter.websiteUrl ?? '');
  if (!url) return;
  const ok = await confirmAction({
    title: tr('Abrir o site de {name}?', { name: supporter.name }),
    message: tr('O site {site} abre fora do Encontra-me.', { site: websiteLabel(url) }),
    confirmLabel: tr('Abrir site'),
  });
  if (!ok) return;
  try {
    await Linking.openURL(url);
  } catch {
    showAlert(tr('Não foi possível abrir o site'), tr('Tente de novo em alguns instantes.'));
  }
}
