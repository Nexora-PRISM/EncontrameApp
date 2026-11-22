import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { Radius, type BrandColors } from '@/constants/brand';
import type { SessoesController } from '@/features/sessoes/sessoes.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

interface Props {
  controller: SessoesController;
}

export function SessoesListSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  if (c.loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={brand.orange} />
      </View>
    );
  }

  if (!c.available) {
    return <Text style={styles.text}>{t('A lista de aparelhos conectados ainda não está disponível. Tente de novo mais tarde.')}</Text>;
  }

  if (c.loadError) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.error}>{t('Não foi possível carregar a lista.')}</Text>
        <BrandButton label={t('Tentar de novo')} variant="outline" onPress={c.retry} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>
        {t('Cada item é um aparelho ou navegador em que sua conta está conectada. Por privacidade, o Encontra-me não guarda o modelo do aparelho nem o lugar de cada acesso.')}
      </Text>

      <View style={styles.card}>
        {c.sessions.map((session, index) => (
          <View key={session.id} style={[styles.row, index > 0 && styles.rowDivider]}>
            <MaterialCommunityIcons
              name={session.current ? 'cellphone-check' : 'devices'}
              size={24}
              color={session.current ? brand.blue : brand.textMuted}
            />
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{session.title}</Text>
              <Text style={styles.rowSubtitle}>{session.subtitle}</Text>
            </View>
            {session.current ? null : (
              <Pressable
                onPress={() => c.endSession(session.id)}
                disabled={c.busy}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={t('Desconectar')}
              >
                <Text style={styles.action}>{t('Desconectar')}</Text>
              </Pressable>
            )}
          </View>
        ))}
      </View>

      {c.othersCount > 0 ? (
        <BrandButton
          label={t('Desconectar todos os outros')}
          variant="outline"
          loading={c.busy}
          onPress={c.endOthers}
        />
      ) : (
        <Text style={styles.hint}>{t('Sua conta só está conectada neste aparelho.')}</Text>
      )}

      <View style={styles.box}>
        <Text style={styles.text}>
          {t('Não reconhece algum acesso? Desconecte e troque sua senha.')}
        </Text>
        <Pressable onPress={c.goToChangePassword} hitSlop={10} accessibilityRole="button">
          <Text style={styles.link}>{t('Alterar senha')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    center: {
      paddingVertical: 48,
      alignItems: 'center',
    },
    wrap: {
      gap: 16,
    },
    card: {
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: brand.divider,
      backgroundColor: brand.surface,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    rowDivider: {
      borderTopWidth: 1,
      borderTopColor: brand.divider,
    },
    rowText: {
      flex: 1,
      gap: 2,
    },
    rowTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: brand.textDark,
    },
    rowSubtitle: {
      fontSize: 13,
      color: brand.textMuted,
    },
    action: {
      fontSize: 14,
      fontWeight: '700',
      color: brand.blue,
    },
    box: {
      gap: 6,
      padding: 12,
      borderRadius: Radius.md,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    text: {
      fontSize: 14,
      lineHeight: 20,
      color: brand.textDark,
    },
    hint: {
      fontSize: 13,
      color: brand.textMuted,
    },
    error: {
      fontSize: 13,
      fontWeight: '600',
      color: brand.error,
    },
    link: {
      fontSize: 14,
      fontWeight: '700',
      color: brand.blue,
    },
  });
}
