import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PersonAlertIcon } from '@/components/person-alert-icon';
import { ScreenHeader } from '@/components/screen-header';
import { type BrandColors } from '@/constants/brand';
import { contentGutter } from '@/constants/theme';
import type { PessoaDetalheController } from '@/features/pessoa-detalhe/pessoa-detalhe.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { resolvePersonStatusColor } from '@/lib/person-status';
import { useWideLayout } from '@/lib/use-wide-layout';

interface PessoaDetalheHeroSectionProps {
  controller: PessoaDetalheController;
}

/** Altura até a foto carregar. Depois, a moldura segue a proporção da imagem. */
const PHOTO_HEIGHT_COMFORT = 360;
const PHOTO_HEIGHT_WIDE = 420;
/** No desktop a foto não acompanha a janela inteira — senão a altura explode junto. */
const PHOTO_MAX_WIDTH = 720;

export function PessoaDetalheHeroSection({ controller }: PessoaDetalheHeroSectionProps) {
  const t = useT();
  const brand = useBrand();
  const insets = useSafeAreaInsets();
  const { width, isWide } = useWideLayout();
  const gutter = contentGutter(width);
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const [aspect, setAspect] = useState<number | null>(null);
  const { person } = controller;
  if (!person) {
    return null;
  }

  const statusColor = resolvePersonStatusColor(brand, person.statusId, person.statusDescription);
  const photoWidth = isWide ? Math.min(width, PHOTO_MAX_WIDTH) : width;
  const fallbackHeight = (isWide ? PHOTO_HEIGHT_WIDE : PHOTO_HEIGHT_COMFORT) + insets.top;
  const photoHeight = aspect ? Math.round(photoWidth / aspect) : fallbackHeight;

  return (
    <View style={styles.hero}>
      <View style={[styles.stage, { minHeight: photoHeight }]}>
        <View style={[styles.photo, { width: photoWidth, height: photoHeight }]}>
          {person.photoUri ? (
            <Image
              source={{ uri: person.photoUri }}
              style={styles.photoImage}
              contentFit="contain"
              contentPosition="center"
              accessibilityLabel={person.fullName}
              onLoad={(event) => {
                const nextWidth = event.source.width;
                const nextHeight = event.source.height;
                if (nextWidth > 0 && nextHeight > 0) {
                  setAspect(nextWidth / nextHeight);
                }
              }}
            />
          ) : (
            <MaterialCommunityIcons name="account" size={96} color={brand.onPrimary} />
          )}
        </View>
        <View style={[styles.header, { paddingTop: insets.top, paddingHorizontal: gutter }]}>
          <ScreenHeader
            onPhoto
            title={person.fullName}
            accessory={
              <PersonAlertIcon
                statusId={person.statusId}
                statusDescription={person.statusDescription}
                size={18}
              />
            }
          />
        </View>
      </View>
      <View style={[styles.meta, { paddingHorizontal: gutter }]}>
        {person.nickname ? <Text style={styles.nickname}>{person.nickname}</Text> : null}
        {person.age != null ? <Text style={styles.detail}>{t('{age} anos', { age: person.age })}</Text> : null}
        {person.statusDescription ? (
          <Text style={[styles.status, { color: statusColor }]}>{t(person.statusDescription)}</Text>
        ) : null}
      </View>
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    hero: {
      gap: 16,
    },
    stage: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brand.orange,
    },
    photo: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    photoImage: {
      width: '100%',
      height: '100%',
    },
    header: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 2,
    },
    meta: {
      gap: 4,
    },
    nickname: {
      fontSize: 18,
      fontWeight: '700',
      color: brand.textDark,
    },
    detail: {
      fontSize: 15,
      color: brand.textMuted,
    },
    status: {
      marginTop: 4,
      fontSize: 13,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
  });
}
