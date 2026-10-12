import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { Radius, type BrandColors } from '@/constants/brand';
import type { PetsController } from '@/features/pets/pets.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

type Props = { controller: PetsController };

/** Acesso ao cadastro de pets: conforme o plano (Premium, se a chave exigir); sem venda de assinatura ainda. */
export function PetsPremiumSection({ controller }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  if (controller.loggedIn && controller.premiumLoading) {
    return <ActivityIndicator color={brand.blue} style={styles.loading} />;
  }

  if (controller.canRegister) {
    return (
      <BrandButton
        label={t('Cadastrar pet desaparecido')}
        trailingIcon="paw"
        onPress={controller.goToRegister}
      />
    );
  }

  return (
    <View style={styles.card}>
      <MaterialCommunityIcons name="star-outline" size={24} color={brand.blue} />
      <View style={styles.texts}>
        <Text style={styles.title}>{t('Tem um pet desaparecido?')}</Text>
        <Text style={styles.body}>
          {!controller.petsRequirePremium
            ? t('Entre na sua conta para cadastrar e divulgar o seu pet.')
            : controller.loggedIn
              ? t('Cadastrar e divulgar o seu pet faz parte do plano Premium, que ainda não está disponível para assinatura.')
              : t('Cadastrar e divulgar o seu pet faz parte do plano Premium. Entre na sua conta para continuar.')}
        </Text>
        {controller.loggedIn ? null : (
          <BrandButton label={t('Entrar')} variant="outline" onPress={controller.goToLogin} />
        )}
        {controller.petsRequirePremium ? (
          <BrandButton label={t('Conhecer o Premium')} variant="outline" onPress={controller.goToPremium} />
        ) : null}
      </View>
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    loading: {
      marginVertical: 12,
    },
    card: {
      flexDirection: 'row',
      gap: 12,
      padding: 14,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    texts: {
      flex: 1,
      gap: 8,
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
