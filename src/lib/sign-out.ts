import { getBiometricEnabled } from '@/lib/biometric';
import { queryClient } from '@/lib/query-client';
import { clearSession, getRefreshToken, lockSession } from '@/lib/session';
import { getAuthRepository } from '@/services/auth/auth.repository';
import { unregisterPushDevice } from '@/services/notifications/notifications.service';

/**
 * Encerra a sessão neste aparelho.
 * - Com biometria ligada: só trava (tokens ficam guardados para o desbloqueio).
 * - Sem biometria: tira o aparelho dos avisos, revoga o refresh token na API e apaga a sessão local.
 */
export async function signOut(): Promise<void> {
  if (await getBiometricEnabled()) {
    await lockSession();
    queryClient.clear();
    return;
  }

  const refreshToken = getRefreshToken();
  try {
    await unregisterPushDevice();
    await getAuthRepository().logout(refreshToken);
  } finally {
    await clearSession();
    queryClient.clear();
  }
}
