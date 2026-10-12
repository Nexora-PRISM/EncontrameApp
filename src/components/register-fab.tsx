import { useRouter } from 'expo-router';

import { BrandFab } from '@/components/brand-fab';
import { useFloatingPlacement } from '@/lib/bottom-bar-metrics';
import { useT } from '@/lib/i18n';
import { useWideLayout } from '@/lib/use-wide-layout';

type Props = {
  /** Quando true, aparece também no mobile (acima da BottomBar). */
  always?: boolean;
  /** Empurra o FAB para cima (ex.: carrossel da home no desktop). */
  extraBottom?: number;
};

/**
 * FAB para cadastrar pessoa em telas largas — substitui a aba do BottomBar.
 * Na listagem (`always`) fica fixo no canto inferior direito em qualquer largura,
 * sempre acima da barra inferior medida e escondido enquanto o teclado está aberto.
 */
export function RegisterFab({ always = false, extraBottom = 0 }: Props) {
  const t = useT();
  const router = useRouter();
  const { isWide } = useWideLayout();
  const placement = useFloatingPlacement();

  if (!always && !isWide) {
    return null;
  }

  return (
    <BrandFab
      accessibilityLabel={t('Cadastrar uma pessoa')}
      onPress={() => router.push('/cadastrar-pessoa')}
      visible={!placement.hidden}
      style={{ bottom: placement.bottom + extraBottom, right: 24, zIndex: 30, elevation: 12 }}
    />
  );
}
