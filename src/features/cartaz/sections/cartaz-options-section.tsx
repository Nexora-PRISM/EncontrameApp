import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SettingsGroup, SettingsRow, SettingsSegmented } from '@/components/settings-list';
import { type BrandColors } from '@/constants/brand';
import type { CartazController, PosterFormat } from '@/features/cartaz/cartaz.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { msg } from '@/lib/i18n-msg';

type Props = { controller: CartazController };

const FORMAT_OPTIONS: { value: PosterFormat; label: string }[] = [
  { value: 'vertical', label: msg('Vertical (para imprimir)') },
  { value: 'square', label: msg('Quadrado (redes sociais)') },
];

/** Ajustes do cartaz: formato e o que aparece. Telefone, endereço e documentos nunca aparecem. */
export function CartazOptionsSection({ controller }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title} accessibilityRole="header">
        {t('Ajustar o cartaz')}
      </Text>
      <SettingsSegmented
        label={t('Formato do cartaz')}
        options={FORMAT_OPTIONS}
        value={controller.format}
        onChange={controller.setFormat}
      />
      <SettingsGroup
        title={t('O que aparece')}
        footer={t('O cartaz usa só o que já é público na página do caso. Telefone, endereço e documentos nunca aparecem.')}
      >
        <SettingsRow
          icon="cake-variant-outline"
          label={t('Idade')}
          switchValue={controller.options.showAge}
          onSwitchChange={() => controller.toggleOption('showAge')}
        />
        <SettingsRow
          icon="calendar-outline"
          label={t('Data em que foi vista')}
          switchValue={controller.options.showDate}
          onSwitchChange={() => controller.toggleOption('showDate')}
        />
        <SettingsRow
          icon="tshirt-crew-outline"
          label={t('Roupas e características')}
          switchValue={controller.options.showTraits}
          onSwitchChange={() => controller.toggleOption('showTraits')}
        />
      </SettingsGroup>
      <SettingsGroup title={t('Mais opções')}>
        <SettingsRow icon="image-outline" label={t('Salvar como imagem')} unavailable />
      </SettingsGroup>
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: {
      gap: 14,
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: brand.textDark,
    },
  });
}
