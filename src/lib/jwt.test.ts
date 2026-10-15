import { isAccessTokenExpiring, readJwtExpiry } from '@/lib/jwt';

function token(payload: Record<string, unknown>): string {
  const body = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  return `header.${body}.sig`;
}

describe('JWT de acesso', () => {
  it('lê o exp e trata payload inválido como ausente', () => {
    expect(readJwtExpiry(token({ exp: 1_700_000_000 }))).toBe(1_700_000_000);
    expect(readJwtExpiry(token({ exp: 'não' }))).toBeNull();
    expect(readJwtExpiry('sem-ponto')).toBeNull();
    expect(readJwtExpiry('a.%%% .b')).toBeNull();
  });

  it('considera vencido o token que já passou ou vence dentro da folga', () => {
    const now = Math.floor(Date.now() / 1000);
    expect(isAccessTokenExpiring(token({ exp: now - 10 }))).toBe(true);
    expect(isAccessTokenExpiring(token({ exp: now + 10 }))).toBe(true);
    expect(isAccessTokenExpiring(token({ exp: now + 10 }), 0)).toBe(false);
    expect(isAccessTokenExpiring(token({ exp: now + 3600 }))).toBe(false);
    expect(isAccessTokenExpiring('token-invalido')).toBe(true);
  });
});
