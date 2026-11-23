/**
 * Regras puras da conta (perfil, senha nova, código de recuperação, lista de aparelhos).
 * Espelham a API (`AccountService`, `FieldRules`, `PasswordResetCode`) — alterar as duas pontas juntas.
 */
import {
  type FieldErrors,
  collectErrors,
  formatError,
  isPhone,
  isCep,
  newPasswordError,
  optionalFormatError,
  NAME_MIN_LENGTH,
  textError,
} from '@/lib/validation';

/** O código do e-mail tem 8 caracteres, sem 0, O, 1, I e L (fica "ABCD-EFGH"). */
export const RESET_CODE_LENGTH = 8;
const RESET_CODE_ALPHABET = /[^23456789ABCDEFGHJKMNPQRSTUVWXYZ]/g;

export function profileErrors(input: { name: string; cellPhone: string; cep: string }): FieldErrors {
  return collectErrors({
    name: textError(input.name, NAME_MIN_LENGTH),
    cellPhone: formatError(input.cellPhone, isPhone),
    cep: optionalFormatError(input.cep, isCep),
  });
}

/** Senha nova + confirmação (troca e recuperação). */
export function newPasswordErrors(newPassword: string, confirmPassword: string): FieldErrors {
  return collectErrors({
    newPassword: newPasswordError(newPassword),
    confirmPassword: !confirmPassword
      ? 'required'
      : confirmPassword !== newPassword
        ? 'invalid_format'
        : undefined,
  });
}

/** Só o que pode estar no código, em maiúsculas, até 8 caracteres. */
export function normalizeResetCode(input: string): string {
  return input.toUpperCase().replace(RESET_CODE_ALPHABET, '').slice(0, RESET_CODE_LENGTH);
}

/** Para mostrar enquanto a pessoa digita: "ABCD-EF". */
export function formatResetCode(input: string): string {
  const code = normalizeResetCode(input);
  return code.length > 4 ? `${code.slice(0, 4)}-${code.slice(4)}` : code;
}

export function resetCodeError(input: string) {
  const code = normalizeResetCode(input);
  if (!code) return 'required' as const;
  if (code.length < RESET_CODE_LENGTH) return 'too_short' as const;
  return undefined;
}

type SessionLike = { id: string; lastActiveAt: string; current: boolean };

/** Este aparelho primeiro; depois do uso mais recente para o mais antigo. */
export function sortSessions<T extends SessionLike>(sessions: readonly T[]): T[] {
  return [...sessions].sort((left, right) => {
    if (left.current !== right.current) return left.current ? -1 : 1;
    return new Date(right.lastActiveAt).getTime() - new Date(left.lastActiveAt).getTime();
  });
}

/** Quantos aparelhos além deste. */
export function otherSessionsCount(sessions: readonly SessionLike[]): number {
  return sessions.filter((session) => !session.current).length;
}

/** Foto em base64 da API → endereço que o <Image> mostra (JPEG começa com "/9j/", PNG com "iVBOR"). */
export function photoDataUri(base64: string | null | undefined): string | null {
  const value = (base64 ?? '').trim();
  if (!value) return null;
  if (value.startsWith('data:')) return value;
  const mime = value.startsWith('iVBOR') ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${value}`;
}
