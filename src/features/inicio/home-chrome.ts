import { useMemo } from 'react';

import type { BrandColors, ColorSchemeName } from '@/constants/brand';
import type { SofiaPaletteId } from '@/constants/sofia-palettes';
import { useBrand, useBrandColorScheme, useBrandTheme } from '@/lib/brand-theme';
import { hexToRgba } from '@/lib/map-style';

export type HomeChrome = {
  /** Fundo da faixa acima do mapa. */
  background: string;
  /** Texto e ícones sobre essa faixa. */
  ink: string;
  muted: string;
  /** Fundo dos botões redondos da faixa (busca). */
  glass: string;
  status: 'light' | 'dark';
};

/**
 * Com uma cor da Sofia escolhida, a faixa usa o tom mais fechado dessa cor (`orangeDark`),
 * para o título continuar legível. Sem paleta, claro fica no canvas e escuro no marinho.
 */
export function homeChrome(
  brand: BrandColors,
  scheme: ColorSchemeName,
  paletteId: SofiaPaletteId | null,
): HomeChrome {
  if (paletteId) {
    return {
      background: brand.orangeDark,
      ink: brand.onPrimary,
      muted: hexToRgba(brand.onPrimary, 0.78),
      glass: hexToRgba(brand.onPrimary, 0.16),
      status: 'light',
    };
  }

  const dark = scheme === 'dark';
  return {
    background: dark ? brand.navy : brand.white,
    ink: dark ? brand.onPrimary : brand.textDark,
    muted: dark ? hexToRgba(brand.cream, 0.85) : brand.textMuted,
    glass: dark ? hexToRgba(brand.onPrimary, 0.12) : hexToRgba(brand.textDark, 0.06),
    status: dark ? 'light' : 'dark',
  };
}

export function useHomeChrome(): HomeChrome {
  const brand = useBrand();
  const scheme = useBrandColorScheme();
  const { paletteId } = useBrandTheme();
  return useMemo(() => homeChrome(brand, scheme, paletteId), [brand, paletteId, scheme]);
}
