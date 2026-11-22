import { onlyDigits } from '@/lib/masks';
import { getSessionUser } from '@/lib/session';
import type { AccountRepository } from '@/services/account/account.repository';
import type { AccountSession, UserProfile } from '@/services/account/account.types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Senha atual aceita pelo mock (o login mockado aceita qualquer senha). */
export const MOCK_CURRENT_PASSWORD = 'senha123';
/** Código aceito pelo mock na recuperação de senha. */
export const MOCK_RESET_CODE = 'ABCD2345';

/** Erro no mesmo formato do axios/API (isAxiosError + response), para a tela tratar igual. */
function apiError(status: number, field: string, code: string): Error {
  const error = new Error(code) as Error & { isAxiosError: boolean; response: unknown; toJSON: () => object };
  error.isAxiosError = true;
  error.response = { status, data: { message: 'validation_failed', errors: [{ field, error: code }] } };
  error.toJSON = () => ({});
  return error;
}

let profile: UserProfile | null = null;
let sessions: AccountSession[] | null = null;

function currentProfile(): UserProfile {
  const user = getSessionUser();
  if (!profile || (user && profile.id !== user.id)) {
    profile = {
      id: user?.id ?? 'mock-user',
      name: user?.name ?? 'Pessoa de teste',
      email: user?.email ?? 'teste@encontra.me',
      cellPhone: '31999998888',
      cep: '30130010',
      hasPassword: true,
      googleLinked: false,
    };
  }
  return profile;
}

function currentSessions(): AccountSession[] {
  if (!sessions) {
    const now = Date.now();
    sessions = [
      {
        id: 's-este',
        lastActiveAt: new Date(now).toISOString(),
        expiresAt: new Date(now + 30 * 86400000).toISOString(),
        current: true,
      },
      {
        id: 's-outro',
        lastActiveAt: new Date(now - 26 * 3600000).toISOString(),
        expiresAt: new Date(now + 29 * 86400000).toISOString(),
        current: false,
      },
    ];
  }
  return sessions;
}

export const accountMockRepository: AccountRepository = {
  async capabilities() {
    await delay(100);
    return { profile: true, changePassword: true, sessions: true, passwordReset: true };
  },

  async getProfile() {
    await delay(250);
    return { ...currentProfile() };
  },

  async updateProfile(payload) {
    await delay(300);
    profile = {
      ...currentProfile(),
      name: payload.name.trim(),
      cellPhone: onlyDigits(payload.cellPhone),
      cep: onlyDigits(payload.cep),
    };
    return { ...profile };
  },

  async changePassword(payload) {
    await delay(300);
    if (payload.currentPassword !== MOCK_CURRENT_PASSWORD) {
      throw apiError(400, 'currentPassword', 'incorrect');
    }
    if (payload.newPassword === payload.currentPassword) {
      throw apiError(400, 'newPassword', 'same_as_current');
    }
    sessions = currentSessions().filter((session) => session.current);
  },

  async forgotPassword() {
    await delay(300);
  },

  async resetPassword(payload) {
    await delay(300);
    if (payload.code.replace(/[^a-z0-9]/gi, '').toUpperCase() !== MOCK_RESET_CODE) {
      throw apiError(400, 'code', 'invalid_or_expired');
    }
  },

  async listSessions() {
    await delay(250);
    return currentSessions().map((session) => ({ ...session }));
  },

  async revokeSession(id) {
    await delay(200);
    const before = currentSessions().length;
    sessions = currentSessions().filter((session) => session.id !== id);
    if (sessions.length === before) throw apiError(404, 'id', 'not_found');
  },

  async revokeOtherSessions() {
    await delay(200);
    const others = currentSessions().filter((session) => !session.current).length;
    sessions = currentSessions().filter((session) => session.current);
    return others;
  },
};
