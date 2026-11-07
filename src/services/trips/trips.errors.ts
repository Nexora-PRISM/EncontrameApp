import { isAxiosError } from 'axios';

/** O que deu errado numa chamada de trajeto, para a tela explicar sem inventar. */
export type TripErrorCode =
  | 'not_found'
  | 'already_active'
  | 'not_active'
  | 'too_early'
  | 'limit_reached'
  | 'invalid'
  | 'forbidden'
  | 'offline'
  | 'unknown';

/** Erro do repositório de demonstração, com o mesmo código que a API devolveria. */
export class TripMockError extends Error {
  constructor(readonly tripCode: TripErrorCode) {
    super(tripCode);
  }
}

const KNOWN: readonly string[] = ['already_active', 'not_active', 'too_early', 'limit_reached'];

export function tripErrorCode(error: unknown): TripErrorCode {
  if (error instanceof TripMockError) return error.tripCode;
  if (!isAxiosError(error)) return 'unknown';
  if (!error.response) return 'offline';
  const { status } = error.response;
  if (status === 404) return 'not_found';
  if (status === 403) return 'forbidden';
  if (status === 400) {
    const body = error.response.data as { errors?: { field?: string; error?: string }[] } | undefined;
    const code = body?.errors?.find((item) => item?.error && KNOWN.includes(item.error))?.error;
    return (code as TripErrorCode | undefined) ?? 'invalid';
  }
  return 'unknown';
}
