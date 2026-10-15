import { useSyncExternalStore } from 'react';

/**
 * Se a abertura do app (BrandSplash) já saiu da tela. Janelas que abrem sozinhas no começo,
 * como o passo a passo, esperam a abertura terminar — um Modal apareceria por cima dela.
 */
let splashDone = false;
const listeners = new Set<() => void>();

export function markSplashDone(): void {
  if (splashDone) return;
  splashDone = true;
  listeners.forEach((listener) => listener());
}

function isSplashDone(): boolean {
  return splashDone;
}

function subscribeSplash(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSplashDone(): boolean {
  return useSyncExternalStore(subscribeSplash, isSplashDone, isSplashDone);
}
