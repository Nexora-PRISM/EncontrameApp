import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { type BrandColors } from '@/constants/brand';
import type { CartazController } from '@/features/cartaz/cartaz.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

type Props = { controller: CartazController };

/** Poucas ações, grandes e diretas: imprimir (no computador) e compartilhar o link. */
export function CartazActionsSection({ controller }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  return (
    <View style={styles.wrap}>
      {controller.canPrint ? (
        <BrandButton
          label={t('Imprimir ou salvar em PDF')}
          variant="orange"
          trailingIcon="printer-outline"
          onPress={controller.print}
        />
      ) : (
        <Text style={styles.tip}>
          {t('No celular, mostre o cartaz na tela ou tire um print. Para imprimir, abra este caso no computador.')}
        </Text>
      )}
      <BrandButton
        label={t('Compartilhar texto e link do caso')}
        variant="outline"
        trailingIcon="share-variant-outline"
        onPress={controller.share}
      />
      {controller.url ? null : (
        <Text style={styles.tip}>
          {t('O QR Code aparece quando o endereço público do app estiver configurado (EXPO_PUBLIC_WEB_URL).')}
        </Text>
      )}
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: {
      gap: 12,
    },
    tip: {
      fontSize: 15,
      lineHeight: 21,
      color: brand.textMuted,
    },
  });
}
