import { Share } from 'react-native';

import { showAlert } from '@/lib/dialog';
import { tr } from '@/lib/i18n';

/**
 * Abre o compartilhamento do sistema (WhatsApp, Instagram, SMS…).
 * Se o aparelho/navegador não tiver compartilhamento, mostra o texto para a pessoa copiar.
 * Retorna true quando o compartilhamento do sistema abriu (não quer dizer que algo foi enviado).
 */
export async function shareText(message: string, title?: string): Promise<boolean> {
  try {
    await Share.share(title ? { message, title } : { message });
    return true;
  } catch {
    showAlert(tr('Copie o texto para enviar'), message);
    return false;
  }
}
