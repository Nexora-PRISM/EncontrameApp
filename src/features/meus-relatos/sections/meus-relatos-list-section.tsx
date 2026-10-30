import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { SightingStatusChip } from '@/components/sighting-status-chip';
import { Radius, type BrandColors } from '@/constants/brand';
import type { MeusRelatosController } from '@/features/meus-relatos/meus-relatos.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { SIGHTING_STATUS_META } from '@/lib/sighting-report';

type Props = { controller: MeusRelatosController };

/** Lista dos relatos enviados, com estados de carregamento, erro, vazio e sem conta. */
export function MeusRelatosListSection({ controller }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  if (!controller.enabled) {
    return (
      <View style={styles.empty}>
        <MaterialCommunityIcons name="clock-outline" size={40} color={brand.textMuted} />
        <Text style={styles.emptyTitle}>{t('Em breve')}</Text>
        <Text style={styles.emptyText}>{t('Este recurso ainda não está disponível no seu aplicativo.')}</Text>
      </View>
    );
  }

  if (!controller.loggedIn) {
    return (
      <View style={styles.empty}>
        <MaterialCommunityIcons name="account-lock-outline" size={40} color={brand.textMuted} />
        <Text style={styles.emptyText}>{t('Entre na sua conta para ver os relatos que você enviou.')}</Text>
        <BrandButton label={t('Entrar na conta')} variant="blue" onPress={controller.goToLogin} />
      </View>
    );
  }

  if (controller.loading) {
    return (
      <View style={styles.empty}>
        <ActivityIndicator size="large" color={brand.orange} />
      </View>
    );
  }

  if (controller.error) {
    return (
      <View style={styles.empty}>
        <MaterialCommunityIcons name="cloud-off-outline" size={40} color={brand.textMuted} />
        <Text style={styles.emptyText}>{t('Não foi possível carregar seus relatos.')}</Text>
        <BrandButton
          label={t('Tentar de novo')}
          variant="outline"
          loading={controller.refreshing}
          onPress={controller.refresh}
        />
      </View>
    );
  }

  if (controller.reports.length === 0) {
    return (
      <View style={styles.empty}>
        <MaterialCommunityIcons name="eye-outline" size={40} color={brand.textMuted} />
        <Text style={styles.emptyTitle}>{t('Você ainda não enviou relatos')}</Text>
        <Text style={styles.emptyText}>
          {t('Quando você informar que viu alguém, o relato aparece aqui com a situação da análise.')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {controller.reports.map((report) => {
        const name = report.personName ?? t('Caso nº {id}', { id: report.personId });
        return (
          <Pressable
            key={report.reportId}
            style={styles.card}
            onPress={() => controller.openCase(report.personId)}
            accessibilityRole="button"
            accessibilityHint={t('Abre a página do caso')}
          >
            <View style={styles.cardTop}>
              <Text style={styles.name} numberOfLines={2}>
                {name}
              </Text>
              <SightingStatusChip status={report.status} />
            </View>
            <Text style={styles.meta}>
              {t('Visto em {date}', { date: controller.formatDateTime(report.seenAt) })}
            </Text>
            {report.location ? (
              <Text style={styles.meta} numberOfLines={2}>
                {report.location}
              </Text>
            ) : null}
            <Text style={styles.statusText}>{t(SIGHTING_STATUS_META[report.status].description)}</Text>
            <Text style={styles.small}>
              {t('Relato nº {id} · enviado em {date}', {
                id: report.reportId,
                date: controller.formatDateTime(report.receivedAt),
              })}
              {report.hasPhoto ? ` · ${t('com foto')}` : ''}
            </Text>
          </Pressable>
        );
      })}
      <Text style={styles.footer}>
        {t('A situação muda conforme a análise da equipe. "Considerado relevante" não quer dizer que a pessoa foi encontrada.')}
      </Text>
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    list: {
      gap: 12,
    },
    card: {
      gap: 6,
      padding: 16,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: brand.divider,
      backgroundColor: brand.surface,
    },
    cardTop: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    name: {
      flexShrink: 1,
      fontSize: 17,
      fontWeight: '800',
      color: brand.textDark,
    },
    meta: {
      fontSize: 15,
      color: brand.textDark,
    },
    statusText: {
      fontSize: 14,
      lineHeight: 20,
      color: brand.textMuted,
    },
    small: {
      fontSize: 13,
      color: brand.textMuted,
    },
    footer: {
      marginTop: 4,
      fontSize: 13,
      lineHeight: 18,
      color: brand.textMuted,
    },
    empty: {
      alignItems: 'center',
      gap: 12,
      paddingVertical: 40,
      paddingHorizontal: 8,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '800',
      textAlign: 'center',
      color: brand.textDark,
    },
    emptyText: {
      fontSize: 15,
      lineHeight: 22,
      textAlign: 'center',
      color: brand.textMuted,
    },
  });
}
