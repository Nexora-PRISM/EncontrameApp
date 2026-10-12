import { useEffect, useMemo, useState } from 'react';

import { authenticate, isBiometricAvailable } from '@/lib/biometric';
import { confirmAction, showAlert } from '@/lib/dialog';
import {
  canPinEmergencyShortcut,
  disableEmergencyShortcut,
  emergencyShortcutAvailability,
  enableEmergencyShortcut,
  isEmergencyShortcutEnabled,
  requestPinEmergencyShortcut,
} from '@/lib/emergency-shortcut';
import { useT } from '@/lib/i18n';

/**
 * Configuração do atalho "Pedir ajuda" na tela inicial (Android).
 * - Ativar exige conta conectada e, se o celular tiver, confirmação por digital/rosto.
 * - Desativar pede confirmação (evita desligar sem querer).
 * - Usar o atalho nunca exige login: ele só abre a tela de ajuda.
 */
export function useEmergencyShortcutSettings(loggedIn: boolean) {
  const t = useT();
  const availability = useMemo(() => emergencyShortcutAvailability(), []);
  const pinSupported = useMemo(() => canPinEmergencyShortcut(), []);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void isEmergencyShortcutEnabled().then((value) => {
      if (!cancelled) setEnabled(value);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const pinToHomeScreen = () => {
    if (requestPinEmergencyShortcut()) {
      showAlert(
        t('Confirme no Android'),
        t('Na janela do Android, toque em "Adicionar" para colocar o ícone "Pedir ajuda" na tela inicial.'),
      );
      return;
    }
    showAlert(
      t('Adicione manualmente'),
      t('Toque e segure o ícone do Encontra-me na tela inicial e arraste "Pedir ajuda" para onde quiser.'),
    );
  };

  const toggle = (next: boolean) => {
    void (async () => {
      setBusy(true);
      try {
        if (!next) {
          const confirmed = await confirmAction({
            title: t('Desativar o atalho de emergência?'),
            message: t('O ícone "Pedir ajuda" da tela inicial vai parar de funcionar neste celular.'),
            confirmLabel: t('Desativar'),
          });
          if (!confirmed) return;
          await disableEmergencyShortcut();
          setEnabled(false);
          return;
        }

        if (!loggedIn) return;

        // Confirma que é o dono do celular quando há digital/rosto cadastrados.
        if (await isBiometricAvailable()) {
          const confirmedOwner = await authenticate(t('Confirme para ativar o atalho de emergência.'));
          if (!confirmedOwner) return;
        }

        const ok = await enableEmergencyShortcut();
        if (!ok) {
          showAlert(
            t('Não foi possível ativar'),
            t('Tente de novo. Se continuar, atualize o Encontra-me pela loja de aplicativos.'),
          );
          return;
        }
        setEnabled(true);

        if (pinSupported) {
          const addNow = await confirmAction({
            title: t('Atalho ativado'),
            message: t('Quer colocar o ícone "Pedir ajuda" na tela inicial agora?'),
            confirmLabel: t('Adicionar'),
            cancelLabel: t('Depois'),
          });
          if (addNow) pinToHomeScreen();
          return;
        }

        showAlert(
          t('Atalho ativado'),
          t('Toque e segure o ícone do Encontra-me para ver "Pedir ajuda". Você pode arrastá-lo para a tela inicial.'),
        );
      } finally {
        setBusy(false);
      }
    })();
  };

  return {
    shortcutAvailability: availability,
    shortcutPinSupported: pinSupported,
    shortcutEnabled: enabled,
    shortcutBusy: busy,
    toggleEmergencyShortcut: toggle,
    pinEmergencyShortcut: pinToHomeScreen,
  };
}
