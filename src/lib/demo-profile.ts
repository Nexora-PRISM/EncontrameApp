/**
 * Perfil escolhido no modo de demonstração, lembrado no navegador (para não voltar ao início ao recarregar a página).
 * Conveniência só da demonstração: no celular fica na memória; se o armazenamento falhar, nada quebra.
 */
export function readDemoValue(key: string): string | null {
  try {
    const storage = (globalThis as { localStorage?: Storage }).localStorage;
    return storage ? storage.getItem(`encontrame.demo.${key}`) : null;
  } catch {
    return null;
  }
}

export function writeDemoValue(key: string, value: string): void {
  try {
    const storage = (globalThis as { localStorage?: Storage }).localStorage;
    storage?.setItem(`encontrame.demo.${key}`, value);
  } catch {
    // Sem armazenamento (navegação privada, prévia): o perfil vale só até recarregar.
  }
}
