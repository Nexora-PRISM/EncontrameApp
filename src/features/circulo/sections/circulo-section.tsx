import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandField } from '@/components/brand-field';
import { Radius, type BrandColors } from '@/constants/brand';
import type { CirculoController } from '@/features/circulo/circulo.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

interface Props {
  controller: CirculoController;
}

export function CirculoSection({ controller: c }: Props) {
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
    return <Text style={styles.text}>{t('O círculo familiar ainda não está disponível. Tente de novo mais tarde.')}</Text>;
  }

  if (c.loadError) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.error}>{t('Não foi possível carregar o seu círculo.')}</Text>
        <BrandButton label={t('Tentar de novo')} variant="outline" onPress={c.retry} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.box}>
        <Text style={styles.text}>
          {t('Pessoas de confiança que podem acompanhar os trajetos que você decidir compartilhar — e você os delas. Ninguém vê sua localização o tempo todo: só durante um trajeto que você liga, e os pontos são apagados quando ele termina.')}
        </Text>
      </View>

      <Text style={styles.heading}>
        {t('No seu círculo ({count} de {max})', { count: c.members.length, max: c.maxMembers })}
      </Text>
      {c.members.length === 0 ? (
        <Text style={styles.hint}>{t('Ninguém ainda. Convide alguém com um código.')}</Text>
      ) : (
        <View style={styles.card}>
          {c.members.map((member, index) => (
            <View key={member.userId} style={[styles.row, index > 0 && styles.rowDivider]}>
              <View style={styles.initialBubble}>
                <Text style={styles.initial}>{member.initial}</Text>
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{member.name}</Text>
                <Text style={styles.rowSubtitle}>{member.sinceLabel}</Text>
              </View>
              <Pressable
                onPress={() => c.remove(member.userId, member.name)}
                disabled={c.removing}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={t('Tirar {name} do círculo?', { name: member.name })}
              >
                <MaterialCommunityIcons name="account-remove-outline" size={22} color={brand.textMuted} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {c.tripsAvailable && c.members.length > 0 ? (
        <BrandButton label={t('Compartilhar um trajeto')} variant="orange" onPress={c.goToTrip} />
      ) : null}

      <Text style={styles.heading}>{t('Convidar alguém')}</Text>
      {c.invite ? (
        <View style={styles.box}>
          <Text style={styles.hint}>{t('Mande este código para a pessoa digitar no app dela:')}</Text>
          <Text style={styles.code} selectable>
            {c.invite.code}
          </Text>
          <Text style={styles.hint}>{t('Vale até {until} e serve uma vez só.', { until: c.invite.until })}</Text>
          {c.shareAgain ? (
            <Pressable onPress={c.shareAgain} hitSlop={8} accessibilityRole="button">
              <Text style={styles.link}>{t('Compartilhar o código')}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      {c.inviteError ? <Text style={styles.error}>{c.inviteError}</Text> : null}
      <BrandButton
        label={c.invite ? t('Gerar outro código') : t('Gerar código de convite')}
        variant="outline"
        loading={c.creatingInvite}
        disabled={c.full}
        onPress={c.createInvite}
      />

      <Text style={styles.heading}>{t('Entrar com um código')}</Text>
      <BrandField
        label={t('Código que você recebeu')}
        value={c.code}
        onChangeText={c.setCode}
        autoCapitalize="characters"
        placeholder="ABCD-EFGH"
        maxLength={9}
        error={c.codeError || undefined}
      />
      <BrandButton label={t('Entrar no círculo')} variant="blue" loading={c.joining} onPress={c.join} />
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
      gap: 14,
    },
    box: {
      gap: 8,
      padding: 12,
      borderRadius: Radius.md,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    heading: {
      marginTop: 8,
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: brand.textMuted,
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
      paddingVertical: 12,
    },
    rowDivider: {
      borderTopWidth: 1,
      borderTopColor: brand.divider,
    },
    initialBubble: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brand.navy,
    },
    initial: {
      fontSize: 17,
      fontWeight: '700',
      color: brand.onPrimary,
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
    code: {
      fontSize: 30,
      fontWeight: '800',
      letterSpacing: 3,
      color: brand.textDark,
    },
    text: {
      fontSize: 14,
      lineHeight: 20,
      color: brand.textDark,
    },
    hint: {
      fontSize: 13,
      lineHeight: 18,
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
