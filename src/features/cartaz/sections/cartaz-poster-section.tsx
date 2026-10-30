import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { QrCodeView } from '@/components/qr-code-view';
import { BrandPalettes, Radius } from '@/constants/brand';
import type { CartazController } from '@/features/cartaz/cartaz.controller';
import { AppInfo } from '@/lib/app-info';
import type { PosterTraitKind } from '@/lib/case-poster-rules';
import { useT } from '@/lib/i18n';
import { msg } from '@/lib/i18n-msg';
import { POSTER_PRINT_ID } from '@/lib/print-poster';
import { useWideLayout } from '@/lib/use-wide-layout';

type Props = { controller: CartazController };

/** O cartaz é sempre claro (para imprimir e para fotos), qualquer que seja o tema do app. */
const P = BrandPalettes.light;

const TRAIT_LABEL: Record<PosterTraitKind, string> = {
  height: msg('Altura'),
  hair: msg('Cabelo'),
  eyes: msg('Olhos'),
  clothes: msg('Roupas'),
  tattoo: msg('Tatuagem'),
  accessories: msg('Acessórios'),
};

/** Prévia do cartaz. No web, a impressão mostra só este bloco (`nativeID`). */
export function CartazPosterSection({ controller }: Props) {
  const t = useT();
  const { width: screenWidth } = useWideLayout();
  const square = controller.format === 'square';
  const width = Math.min(Math.max(screenWidth - 40, 260), square ? 520 : 460);
  const height = square ? width : Math.round(width * 1.414);
  const unit = width / 24;
  const styles = useMemo(() => makeStyles(unit, square), [unit, square]);
  const content = controller.content;
  if (!content) return null;

  const photoSize = square ? width * 0.42 : width * 0.56;
  const qrSize = square ? width * 0.26 : width * 0.3;
  const photo = controller.person?.photoUri;

  const info = (
    <View style={styles.info}>
      <Text style={styles.name} numberOfLines={2}>
        {content.name}
      </Text>
      {content.nickname ? <Text style={styles.line}>{t('Conhecida como {nickname}.', { nickname: content.nickname })}</Text> : null}
      {content.age != null ? <Text style={styles.age}>{t('{age} anos', { age: content.age })}</Text> : null}
      {controller.place || content.lastSeenDate ? (
        <Text style={styles.line} numberOfLines={3}>
          {controller.place && content.lastSeenDate
            ? t('Vista pela última vez em {place}, em {date}.', { place: controller.place, date: content.lastSeenDate })
            : controller.place
              ? t('Vista pela última vez em {place}.', { place: controller.place })
              : t('Vista pela última vez em {date}.', { date: content.lastSeenDate ?? '' })}
        </Text>
      ) : null}
      {content.traits.map((trait) => (
        <Text key={trait.kind} style={styles.trait} numberOfLines={1}>
          <Text style={styles.traitLabel}>{t(TRAIT_LABEL[trait.kind])}: </Text>
          {trait.value}
        </Text>
      ))}
    </View>
  );

  return (
    <View style={styles.center}>
      <View
        nativeID={POSTER_PRINT_ID}
        style={[styles.poster, { width, height }]}
        accessible
        accessibilityLabel={t('Cartaz do caso de {name}', { name: content.name })}
      >
        <View style={styles.band}>
          <Text style={styles.bandTitle}>{t('PESSOA DESAPARECIDA')}</Text>
          <Text style={styles.bandSub}>{t('Ajude a encontrar')}</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.main}>
            {photo ? (
              <Image source={{ uri: photo }} style={[styles.photo, { width: photoSize, height: photoSize }]} />
            ) : (
              <View style={[styles.photo, styles.photoEmpty, { width: photoSize, height: photoSize }]}>
                <MaterialCommunityIcons name="account" size={photoSize * 0.6} color={P.avatarIcon} />
              </View>
            )}
            {info}
          </View>

          <View style={styles.qrRow}>
            {controller.url ? (
              <QrCodeView
                value={controller.url}
                size={qrSize}
                accessibilityLabel={t('QR Code com o link da página do caso')}
              />
            ) : null}
            <Text style={styles.qrText}>
              {controller.url
                ? t('Aponte a câmera do celular para ver o caso atualizado e avisar se viu esta pessoa.')
                : t('Veja o caso e avise se viu esta pessoa pelo app {app}.', { app: AppInfo.name })}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.emergency}>{t('Em emergência, ligue 190')}</Text>
          <Text style={styles.brand}>
            {AppInfo.name} · {AppInfo.companyFrom} {AppInfo.company} · {t('Caso nº {id}', { id: controller.id })}
          </Text>
        </View>
      </View>
    </View>
  );
}

function makeStyles(u: number, square: boolean) {
  return StyleSheet.create({
    center: {
      alignItems: 'center',
    },
    poster: {
      backgroundColor: P.surface,
      borderRadius: Radius.md,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: P.divider,
    },
    band: {
      backgroundColor: P.navy,
      paddingVertical: u * 0.9,
      paddingHorizontal: u,
      alignItems: 'center',
    },
    bandTitle: {
      color: P.onPrimary,
      fontSize: u * (square ? 1.5 : 1.7),
      fontWeight: '900',
      letterSpacing: u * 0.08,
      textAlign: 'center',
    },
    bandSub: {
      marginTop: u * 0.2,
      color: P.orange,
      fontSize: u * 0.8,
      fontWeight: '800',
      textAlign: 'center',
    },
    body: {
      flex: 1,
      paddingHorizontal: u,
      paddingTop: u * 0.9,
      justifyContent: 'space-between',
    },
    main: {
      flexDirection: square ? 'row' : 'column',
      alignItems: square ? 'flex-start' : 'center',
      gap: u * 0.8,
    },
    photo: {
      borderRadius: u * 0.6,
      backgroundColor: P.avatarBackground,
    },
    photoEmpty: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    info: {
      flex: square ? 1 : undefined,
      alignSelf: 'stretch',
      alignItems: square ? 'flex-start' : 'center',
      gap: u * 0.25,
    },
    name: {
      color: P.navy,
      fontSize: u * (square ? 1.3 : 1.45),
      fontWeight: '900',
      textAlign: square ? 'left' : 'center',
    },
    age: {
      color: P.orangeText,
      fontSize: u * 0.95,
      fontWeight: '800',
    },
    line: {
      color: P.textDark,
      fontSize: u * 0.72,
      lineHeight: u * 1.0,
      textAlign: square ? 'left' : 'center',
    },
    trait: {
      color: P.textDark,
      fontSize: u * 0.66,
      textAlign: square ? 'left' : 'center',
    },
    traitLabel: {
      fontWeight: '800',
    },
    qrRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: u * 0.7,
      paddingVertical: u * 0.6,
    },
    qrText: {
      flex: 1,
      color: P.textDark,
      fontSize: u * 0.68,
      lineHeight: u * 0.95,
      fontWeight: '700',
    },
    footer: {
      backgroundColor: P.cream,
      paddingVertical: u * 0.55,
      paddingHorizontal: u,
      alignItems: 'center',
      gap: u * 0.15,
    },
    emergency: {
      color: P.navy,
      fontSize: u * 0.85,
      fontWeight: '900',
    },
    brand: {
      color: P.navy,
      fontSize: u * 0.5,
      textAlign: 'center',
    },
  });
}
