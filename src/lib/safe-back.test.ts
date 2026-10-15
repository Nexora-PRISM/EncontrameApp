import { goBackOrReplace } from '@/lib/safe-back';

function router(canGoBack: boolean) {
  return { canGoBack: () => canGoBack, back: jest.fn(), replace: jest.fn() };
}

describe('voltar', () => {
  it('usa a pilha do navigator quando ela tem tela anterior', () => {
    const navigation = { canGoBack: () => true, goBack: jest.fn() };
    const current = router(true);
    goBackOrReplace(current, '/inicio', navigation);
    expect(navigation.goBack).toHaveBeenCalled();
    expect(current.replace).not.toHaveBeenCalled();
  });

  it('usa o histórico do router só quando não há navigator', () => {
    const current = router(true);
    goBackOrReplace(current, '/inicio');
    expect(current.back).toHaveBeenCalled();
    expect(current.replace).not.toHaveBeenCalled();
  });

  it('substitui pela rota de fallback quando não há para onde voltar', () => {
    const navigation = { canGoBack: () => false, goBack: jest.fn() };
    const current = router(true);
    goBackOrReplace(current, '/perfil', navigation);
    expect(navigation.goBack).not.toHaveBeenCalled();
    expect(current.back).not.toHaveBeenCalled();
    expect(current.replace).toHaveBeenCalledWith('/perfil');

    const alone = router(false);
    goBackOrReplace(alone);
    expect(alone.replace).toHaveBeenCalledWith('/inicio');
  });
});
