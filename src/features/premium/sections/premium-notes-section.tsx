import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { Radius, type BrandColors } from '@/constants/brand';
import type { PremiumController } from '@/features/premium/premium.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

type Props = { controller: PremiumController };

/** Compromissos do plano e atalhos. */
export function PremiumNotesSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <MaterialCommunityIcons name="lifebuoy" size={22} color={brand.blue} />
        <View style={styles.texts}>
          <Text style={styles.title}>{t('Emergência nunca será paga')}</Text>
          <Text style={styles.body}>
            {t('Pedir ajuda, ligar para os números de emergência, mandar sua localização e buscar pessoas desaparecidas não dependem de assinatura.')}
          </Text>
        </View>
      </View>
      <View style={styles.card}>
        <MaterialCommunityIcons name="information-outline" size={22} color={brand.blue} />
        <View style={styles.texts}>
          <Text style={styles.title}>{t('Como vai funcionar')}</Text>
          <Text style={styles.body}>
            {t('Cada recurso aparece no app só quando estiver pronto. Quando a venda começar, a assinatura será feita pela loja de aplicativos, onde também é possível cancelar.')}
          </Text>
        </View>
      </View>

      {c.petsEnabled ? (
        <BrandButton label={t('Ver pets desaparecidos')} trailingIcon="paw" onPress={c.goToPets} />
      ) : null}
      <BrandButton label={t('Dúvidas sobre o Premium')} variant="outline" onPress={c.goToHelp} />
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: {
      gap: 12,
    },
    card: {
      flexDirection: 'row',
      gap: 12,
      padding: 16,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    texts: {
      flex: 1,
      gap: 4,
    },
    title: {
      fontSize: 16,
      fontWeight: '800',
      color: brand.textDark,
    },
    body: {
      fontSize: 14,
      lineHeight: 20,
      color: brand.textMuted,
    },
  });
}
