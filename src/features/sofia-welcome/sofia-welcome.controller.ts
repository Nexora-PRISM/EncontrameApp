import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';

import { getSofiaPalette } from '@/constants/sofia-palettes';
import { useBrandTheme } from '@/lib/brand-theme';
import { completeSofiaWelcome, isSofiaWelcomeComplete } from '@/lib/sofia-prefs';

/** Apresentação da Sofia na primeira visita ao chat. */
export function useSofiaWelcomeController() {
  const router = useRouter();
  const { paletteId, colorScheme } = useBrandTheme();
  const palette = getSofiaPalette(paletteId ?? 'green', colorScheme);
  /** Evita o voltar reabrir esta tela depois que a pessoa já saiu dela. */
  const leaving = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void isSofiaWelcomeComplete().then((done) => {
        if (active && done && !leaving.current) {
          router.dismissTo('/inicio');
        }
      });
      return () => {
        active = false;
      };
    }, [router]),
  );

  const continueToTheme = () => {
    leaving.current = true;
    router.replace('/sofia-theme?from=welcome' as Href);
  };

  const skipTutorial = () => {
    leaving.current = true;
    void (async () => {
      await completeSofiaWelcome();
      router.replace('/chat' as Href);
    })();
  };

  return {
    palette,
    continueToTheme,
    skipTutorial,
  };
}

export type SofiaWelcomeController = ReturnType<typeof useSofiaWelcomeController>;
