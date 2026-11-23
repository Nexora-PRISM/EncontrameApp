import { env } from '@/lib/env';
import { accountAxiosRepository } from '@/services/account/account.axios.repository';
import { accountMockRepository } from '@/services/account/account.mock.repository';
import type {
  AccountCapabilities,
  AccountSession,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  UpdateProfilePayload,
  UserProfile,
} from '@/services/account/account.types';

/** Conta da própria pessoa: perfil, senha e sessões (`/Auth/me`, `/Auth/password`, `/Auth/sessions`). */
export interface AccountRepository {
  capabilities(): Promise<AccountCapabilities>;
  getProfile(): Promise<UserProfile>;
  updateProfile(payload: UpdateProfilePayload): Promise<UserProfile>;
  setPhoto(base64: string): Promise<UserProfile>;
  removePhoto(): Promise<UserProfile>;
  changePassword(payload: ChangePasswordPayload): Promise<void>;
  forgotPassword(payload: ForgotPasswordPayload): Promise<void>;
  resetPassword(payload: ResetPasswordPayload): Promise<void>;
  listSessions(): Promise<AccountSession[]>;
  revokeSession(id: string): Promise<void>;
  revokeOtherSessions(): Promise<number>;
}

export function getAccountRepository(): AccountRepository {
  return env.useMocks ? accountMockRepository : accountAxiosRepository;
}
