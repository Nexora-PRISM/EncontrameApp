import { getBiometricEnabled } from '@/lib/biometric';
import { queryClient } from '@/lib/query-client';
import { clearSession, getRefreshToken, lockSession } from '@/lib/session';
import { getAuthRepository } from '@/services/auth/auth.repository';

/**
 * Encerra a sessão neste aparelho.
 * - Com biometria ligada: só trava (tokens ficam guardados para o desbloqueio).
 * - Sem biometria: revoga o refresh token na API e apaga a sessão local.
 */
export async function signOut(): Promise<void> {
  if (await getBiometricEnabled()) {
    await lockSession();
    queryClient.clear();
    return;
  }

  const refreshToken = getRefreshToken();
  try {
    await getAuthRepository().logout(refreshToken);
  } finally {
    await clearSession();
    queryClient.clear();
  }
}
