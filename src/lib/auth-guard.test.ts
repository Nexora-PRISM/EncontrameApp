import { isProtectedPath, safeReturnTo } from '@/lib/auth-guard';

describe('rotas protegidas', () => {
  it('reconhece as rotas que exigem sessão, com ou sem query', () => {
    expect(isProtectedPath('/chat')).toBe(true);
    expect(isProtectedPath('/chat/1')).toBe(true);
    expect(isProtectedPath('/perfil?aba=conta')).toBe(true);
    expect(isProtectedPath('/inicio')).toBe(false);
    expect(isProtectedPath('/pessoa/1')).toBe(false);
  });

  it('aceita só destinos internos da lista', () => {
    expect(safeReturnTo('/inicio')).toBe('/inicio');
    expect(safeReturnTo('/pessoa/abc?x=1')).toBe('/pessoa/abc');
    expect(safeReturnTo(['/perfil'])).toBe('/perfil');
    expect(safeReturnTo(null)).toBeNull();
    expect(safeReturnTo('')).toBeNull();
  });

  it('recusa URL externa, protocolo e caminho aberto', () => {
    expect(safeReturnTo('https://evil.example')).toBeNull();
    expect(safeReturnTo('//evil.example')).toBeNull();
    expect(safeReturnTo('%2F%2Fevil.example')).toBeNull();
    expect(safeReturnTo('/admin')).toBeNull();
    expect(safeReturnTo('%')).toBeNull();
  });
});
