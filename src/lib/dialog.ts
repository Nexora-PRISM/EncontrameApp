import { Alert, Platform } from 'react-native';

import { tr } from '@/lib/i18n';

/**
 * Avisos e confirmações que funcionam no Android/iOS e no web.
 * No react-native-web o `Alert.alert` não exibe nada, então no navegador
 * usamos `window.alert` / `window.confirm`.
 */
export function showAlert(title: string, message?: string): void {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(message ? `${title}\n\n${message}` : title);
    }
    return;
  }

  Alert.alert(title, message);
}

/** Pede confirmação antes de uma ação importante. Resolve `true` se o usuário confirmar. */
export function confirmAction(options: {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}): Promise<boolean> {
  const { title, message } = options;
  const confirmLabel = options.confirmLabel ?? tr('Confirmar');
  const cancelLabel = options.cancelLabel ?? tr('Cancelar');

  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || typeof window.confirm !== 'function') {
      return Promise.resolve(false);
    }
    return Promise.resolve(window.confirm(message ? `${title}\n\n${message}` : title));
  }

  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: cancelLabel, style: 'cancel', onPress: () => resolve(false) },
        { text: confirmLabel, onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
