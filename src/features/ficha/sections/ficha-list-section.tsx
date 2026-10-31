import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { Radius, type BrandColors } from '@/constants/brand';
import type { FichaListController } from '@/features/ficha/ficha-list.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

type Props = { controller: FichaListController };

export function FichaListSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  return (
    <View style={styles.wrap}>
      <View style={styles.notice} accessible accessibilityRole="summary">
        <MaterialCommunityIcons name="card-account-details-outline" size={26} color={brand.blue} />
        <View style={styles.noticeTexts}>
          <Text style={styles.noticeTitle}>{t('Prepare antes, ganhe tempo depois')}</Text>
          <Text style={styles.noticeBody}>
            {t('Monte a ficha de quem precisa de mais cuidado — uma criança, um idoso, alguém com Alzheimer ou autismo. Se a pessoa sumir, foto, sinais e informações de saúde já estão prontos para mostrar à polícia e para o cadastro no app.')}
          </Text>
          <Text style={styles.noticeBody}>
            {t('Fica só neste aparelho: nada é enviado. Quem usar este aparelho consegue ver.')}
          </Text>
        </View>
      </View>

      {c.loading ? (
        <ActivityIndicator size="large" color={brand.orange} />
      ) : c.error ? (
        <Text style={styles.muted}>{t('Não foi possível abrir as fichas deste aparelho.')}</Text>
      ) : c.items.length === 0 ? (
        <Text style={styles.muted}>{t('Nenhuma ficha ainda.')}</Text>
      ) : (
        c.items.map(({ sheet, age, dayPhotoUntil, photoNeedsUpdate }) => (
          <Pressable
            key={sheet.id}
            onPress={() => c.open(sheet.id)}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={sheet.name}
          >
            <View style={styles.photo}>
              {sheet.photo ? (
                <Image source={{ uri: `data:image/jpeg;base64,${sheet.photo}` }} style={styles.photoImage} contentFit="cover" accessible={false} />
              ) : (
                <MaterialCommunityIcons name="account" size={30} color={brand.avatarIcon} />
              )}
            </View>
            <View style={styles.cardTexts}>
              <Text style={styles.name} numberOfLines={1}>
                {sheet.name}
              </Text>
              {age !== null ? <Text style={styles.muted}>{t('{age} anos', { age })}</Text> : null}
              {dayPhotoUntil ? (
                <Text style={styles.ok}>{t('Foto do dia até {time}', { time: dayPhotoUntil })}</Text>
              ) : (
                <Text style={styles.muted}>{t('Sem foto do dia')}</Text>
              )}
              {photoNeedsUpdate ? <Text style={styles.warn}>{t('Atualize a foto do rosto')}</Text> : null}
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={brand.textMuted} />
          </Pressable>
        ))
      )}

      {c.limitReached ? (
        <Text style={styles.muted}>{t('Este aparelho guarda até {limit} fichas. Apague uma antes de criar outra.', { limit: c.limit })}</Text>
      ) : (
        <BrandButton label={t('Nova ficha')} variant="blue" trailingIcon="plus" onPress={c.add} />
      )}
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: { gap: 16 },
    notice: {
      flexDirection: 'row',
      gap: 12,
      padding: 14,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    noticeTexts: { flex: 1, gap: 6 },
    noticeTitle: { fontSize: 16, fontWeight: '800', color: brand.textDark },
    noticeBody: { fontSize: 14, lineHeight: 20, color: brand.textMuted },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: brand.divider,
      backgroundColor: brand.surface,
    },
    pressed: { opacity: 0.8 },
    photo: {
      width: 64,
      height: 64,
      borderRadius: Radius.md,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brand.avatarBackground,
    },
    photoImage: { width: '100%', height: '100%' },
    cardTexts: { flex: 1, gap: 2 },
    name: { fontSize: 17, fontWeight: '800', color: brand.textDark },
    muted: { fontSize: 14, lineHeight: 20, color: brand.textMuted },
    ok: { fontSize: 14, lineHeight: 20, fontWeight: '700', color: brand.statusEncontrado },
    warn: { fontSize: 14, lineHeight: 20, fontWeight: '700', color: brand.orangeText },
  });
}
