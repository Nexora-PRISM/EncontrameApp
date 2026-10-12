import { useSyncExternalStore } from 'react';

import { useBottomSafeInset } from '@/lib/use-bottom-safe-inset';
import { useKeyboardVisible } from '@/lib/use-keyboard-visible';
import { useWideLayout } from '@/lib/use-wide-layout';

/**
 * Altura real da barra inferior (medida no `onLayout`). Os botões flutuantes usam esse valor
 * para ficar SEMPRE acima da barra — antes a distância era fixa e, com fonte grande ou na
 * barra de 3 botões do Android, o "+" encostava ou cobria a navegação.
 */
let barHeight: number | null = null;
const listeners = new Set<() => void>();

export function setBottomBarHeight(height: number | null) {
  const next = height == null ? null : Math.round(height);
  if (next === barHeight) return;
  barHeight = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getHeight() {
  return barHeight;
}

export function useBottomBarHeight(): number | null {
  return useSyncExternalStore(subscribe, getHeight, getHeight);
}

/** Espaço entre o botão flutuante e a barra (ou a borda da tela). */
export const FLOATING_GAP = 16;
/** Tamanho do BrandFab — também usado como folga no fim das listas e formulários. */
export const FLOATING_SIZE = 56;

/** Altura estimada da barra antes da primeira medição: 8 (respiro) + 56 (botão) + área segura. */
const ESTIMATED_BAR_CONTENT = 64;

/**
 * Posição dos botões flutuantes da página: acima da barra inferior no celular; no canto da tela
 * em telas largas (onde a barra vira um botão no centro). `hidden` = teclado aberto.
 */
export function useFloatingPlacement(): { bottom: number; hidden: boolean } {
  const measured = useBottomBarHeight();
  const bottomInset = useBottomSafeInset();
  const { isWide } = useWideLayout();
  const keyboardVisible = useKeyboardVisible();

  if (isWide) {
    return { bottom: bottomInset + 8, hidden: keyboardVisible };
  }
  const bar = measured ?? ESTIMATED_BAR_CONTENT + bottomInset;
  return { bottom: bar + FLOATING_GAP, hidden: keyboardVisible };
}
