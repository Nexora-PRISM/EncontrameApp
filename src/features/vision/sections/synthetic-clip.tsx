import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { Radius, type BrandColors } from '@/constants/brand';
import type { VisionFormat } from '@/features/vision/vision-format';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import type { ClipAccess } from '@/services/vision/vision.types';

/**
 * Trecho liberado. No modo de demonstração mostra um quadro sintético (desenho, sem pessoa real), com a marca
 * d'água de quem abriu e quando. Na API real, o endereço é temporário e o player abre fora do app
 * (um player embutido exige a biblioteca expo-video, ainda não instalada).
 */
export function SyntheticClip({ access, viewer, format }: { access: ClipAccess; viewer: string; format: VisionFormat }) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  if (!access.synthetic) {
    const url = access.url;
    return (
      <View style={styles.real}>
        <Text style={styles.realText}>
          {t('Trecho liberado até {time}. O acesso fica registrado.', { time: format.time(access.expiresAt) })}
        </Text>
        {url ? <BrandButton label={t('Abrir o trecho')} variant="blue" onPress={() => void Linking.openURL(url)} /> : null}
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View
        style={styles.frame}
        accessible
        accessibilityRole="image"
        accessibilityLabel={t('Quadro sintético de demonstração, sem gravação real.')}
      >
        <View style={[styles.building, styles.buildingLeft]} />
        <View style={[styles.building, styles.buildingRight]} />
        <View style={styles.sidewalk} />
        <View style={styles.figure}>
          <View style={styles.head} />
          <View style={styles.body} />
        </View>
        <View style={styles.overlayTop}>
          <Text style={styles.overlayText} numberOfLines={1}>
            {access.synthetic.cameraName}
          </Text>
          <Text style={styles.overlayText}>{format.dateTime(access.synthetic.seenAt)}</Text>
        </View>
        <View style={styles.badge}>
          <MaterialCommunityIcons name="flask-outline" size={14} color={brand.navy} />
          <Text style={styles.badgeText}>{t('SINTÉTICO')}</Text>
        </View>
        <Text style={styles.watermark} numberOfLines={2}>
          {t('Aberto por {name} em {when}', { name: viewer, when: format.dateTime(access.grantedAt) })}
        </Text>
      </View>
      <Text style={styles.caption}>{t('Material sintético de demonstração: nenhuma gravação real.')}</Text>
      <Text style={styles.caption}>
        {t('Acesso liberado até {time} e registrado na auditoria.', { time: format.time(access.expiresAt) })}
      </Text>
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: { gap: 6 },
    frame: {
      width: '100%',
      aspectRatio: 16 / 9,
      borderRadius: Radius.md,
      overflow: 'hidden',
      backgroundColor: brand.navyDeep,
    },
    building: { position: 'absolute', bottom: '28%', backgroundColor: brand.navy, opacity: 0.9 },
    buildingLeft: { left: '6%', width: '30%', height: '55%' },
    buildingRight: { right: '8%', width: '24%', height: '45%' },
    sidewalk: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: '28%',
      backgroundColor: brand.textMuted,
      opacity: 0.45,
    },
    figure: { position: 'absolute', left: '50%', bottom: '18%', alignItems: 'center' },
    head: { width: 10, height: 10, borderRadius: 5, backgroundColor: brand.placeholder },
    body: { width: 14, height: 26, marginTop: 2, borderRadius: 5, backgroundColor: brand.orange },
    overlayTop: { position: 'absolute', top: 8, left: 10, right: 90, gap: 2 },
    overlayText: { fontSize: 12, fontWeight: '700', color: brand.onPrimary },
    badge: {
      position: 'absolute',
      top: 8,
      right: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: Radius.pill,
      backgroundColor: brand.cream,
    },
    badgeText: { fontSize: 11, fontWeight: '900', color: brand.navy },
    watermark: {
      position: 'absolute',
      left: 10,
      right: 10,
      bottom: 8,
      fontSize: 11,
      fontWeight: '700',
      color: brand.onPrimary,
      opacity: 0.85,
    },
    caption: { fontSize: 13, lineHeight: 18, color: brand.textMuted },
    real: { gap: 10 },
    realText: { fontSize: 15, lineHeight: 21, color: brand.textDark },
  });
}
