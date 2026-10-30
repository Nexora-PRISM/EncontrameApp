import { useEffect } from 'react';

import { BIOMETRIC_FAIL, lockedSessionCopy, unlockWithBiometric } from '@/features/biometric/biometric-unlock';
import { showAlert } from '@/lib/dialog';
import { tr } from '@/lib/i18n';
import { getSessionUser } from '@/lib/session';

let launchHandled = false;

/**
 * Com a entrada por digital ligada, pede a digital assim que o app abre (uma vez por abertura).
 * `ready` = app montado e abertura (splash) fora da tela. Cancelar deixa a conta travada: o botão
 * "Entrar" continua oferecendo a digital.
 */
export function useBiometricLaunchUnlock(ready: boolean): void {
  useEffect(() => {
    if (!ready || launchHandled) return;
    launchHandled = true;

    void (async () => {
      if (getSessionUser() != null || !(await lockedSessionCopy())) return;
      const result = await unlockWithBiometric();
      if (result === 'rejected') showAlert(tr(BIOMETRIC_FAIL));
    })().catch(() => undefined);
  }, [ready]);
}
