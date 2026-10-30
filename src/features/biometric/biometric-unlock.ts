import { isAxiosError } from 'axios';

import {
  authenticate,
  biometricCopy,
  getBiometricEnabled,
  getBiometricKind,
  isBiometricAvailable,
  type BiometricCopy,
} from '@/lib/biometric';
import { tr } from '@/lib/i18n';
import { msg } from '@/lib/i18n-msg';
import { getSessionUser, hasStoredSession, lockSession } from '@/lib/session';
import { revokeStoredSession, unlockAndRefreshSession } from '@/services/auth/auth.service';

export const BIOMETRIC_FAIL = msg('Não foi possível entrar com a digital. Use e-mail e senha.');

export type BiometricUnlockResult =
  /** Sessão destravada e tokens renovados. */
  | 'unlocked'
  /** A pessoa cancelou ou a digital não confirmou: a sessão continua guardada e travada. */
  | 'cancelled'
  /** A API recusou a sessão guardada: ela foi apagada e é preciso entrar com e-mail e senha. */
  | 'rejected'
  /** Sem conexão com a API: a sessão continua guardada para tentar de novo. */
  | 'offline';

let inFlight: Promise<BiometricUnlockResult> | null = null;

/** Textos da digital/rosto quando há sessão travada que dá para abrir; senão `null`. */
export async function lockedSessionCopy(): Promise<BiometricCopy | null> {
  const [enabled, stored, available] = await Promise.all([
    getBiometricEnabled(),
    hasStoredSession(),
    isBiometricAvailable(),
  ]);
  if (!enabled || !stored || !available) return null;
  return biometricCopy(await getBiometricKind());
}

/**
 * Pede a digital e destrava a sessão guardada. Chamadas ao mesmo tempo (abertura do app e tela de
 * login) dividem o mesmo pedido, para o sistema não abrir duas janelas de digital.
 */
export function unlockWithBiometric(): Promise<BiometricUnlockResult> {
  if (!inFlight) {
    inFlight = runUnlock().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

async function runUnlock(): Promise<BiometricUnlockResult> {
  if (getSessionUser() != null) return 'unlocked';

  const copy = biometricCopy(await getBiometricKind());
  if (!(await authenticate(tr(copy.loginPrompt)))) return 'cancelled';

  try {
    await unlockAndRefreshSession();
    return 'unlocked';
  } catch (error) {
    if (isAxiosError(error) && !error.response) {
      await lockSession();
      return 'offline';
    }
    await revokeStoredSession();
    return 'rejected';
  }
}
