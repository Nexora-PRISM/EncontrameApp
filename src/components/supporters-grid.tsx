import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandEnter } from '@/components/brand-enter';
import { Radius, type BrandColors } from '@/constants/brand';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { supporterColumns, websiteLabel } from '@/lib/supporter-rules';
import type { Supporter } from '@/services/supporters/supporters.types';

const GAP = 12;

type Props = {
  supporters: Supporter[];
  /** Toque num logotipo com site: quem chama confirma e abre o link. */
  onOpen: (supporter: Supporter) => void;
  /** Nome e domínio abaixo de cada logotipo (página completa). */
  showNames?: boolean;
};

/**
 * Grade responsiva de logotipos (2 colunas no celular, até 5 no computador).
 * O logotipo fica inteiro e sem distorção num quadro claro; sem logotipo, aparece o nome.
 */
export function SupportersGrid({ supporters, onOpen, showNames = false }: Props) {
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const [width, setWidth] = useState(0);
  const columns = supporterColumns(width || 360);
  const tileWidth = width > 0 ? Math.floor((width - GAP * (columns - 1)) / columns) : undefined;

  const onLayout = (event: LayoutChangeEvent) => {
    const next = Math.round(event.nativeEvent.layout.width);
    if (next !== width) setWidth(next);
  };

  return (
    <View style={styles.grid} onLayout={onLayout}>
      {tileWidth
        ? supporters.map((supporter, index) => (
            <BrandEnter key={supporter.id} from="fade" index={Math.min(index, 8)} style={{ width: tileWidth }}>
              <SupporterTile supporter={supporter} onOpen={onOpen} showName={showNames} styles={styles} brand={brand} />
            </BrandEnter>
          ))
        : null}
    </View>
  );
}

function SupporterTile({
  supporter,
  onOpen,
  showName,
  styles,
  brand,
}: {
  supporter: Supporter;
  onOpen: (supporter: Supporter) => void;
  showName: boolean;
  styles: ReturnType<typeof makeStyles>;
  brand: BrandColors;
}) {
  const t = useT();
  const [logoFailed, setLogoFailed] = useState(false);
  const hasSite = Boolean(supporter.websiteUrl);
  const showLogo = Boolean(supporter.logoUrl) && !logoFailed;
  const domain = websiteLabel(supporter.websiteUrl);

  return (
    <Pressable
      onPress={hasSite ? () => onOpen(supporter) : undefined}
      disabled={!hasSite}
      style={({ pressed }) => [styles.item, pressed && hasSite && styles.itemActive]}
      accessibilityRole={hasSite ? 'link' : 'image'}
      accessibilityLabel={supporter.name}
      accessibilityHint={hasSite ? t('Abre o site oficial fora do app') : undefined}
    >
      <View style={styles.tile}>
        {showLogo ? (
          <Image
            source={{ uri: supporter.logoUrl as string }}
            style={styles.logo}
            contentFit="contain"
            transition={180}
            accessible={false}
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <Text style={styles.fallback} numberOfLines={3} adjustsFontSizeToFit minimumFontScale={0.7}>
            {supporter.name}
          </Text>
        )}
      </View>
      {showName ? (
        <View style={styles.caption}>
          <Text style={styles.name} numberOfLines={2}>
            {supporter.name}
          </Text>
          {domain ? (
            <Text style={[styles.domain, { color: brand.blue }]} numberOfLines={1}>
              {domain}
            </Text>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
    item: { gap: 8, borderRadius: Radius.md },
    itemActive: { opacity: 0.82 },
    tile: {
      aspectRatio: 3 / 2,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: '12%',
      paddingVertical: '10%',
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: brand.divider,
      backgroundColor: brand.logoTile,
      overflow: 'hidden',
    },
    logo: { width: '100%', height: '100%' },
    fallback: {
      fontSize: 15,
      lineHeight: 19,
      fontWeight: '800',
      textAlign: 'center',
      letterSpacing: 0.2,
      color: brand.onLogoTile,
    },
    caption: { gap: 2, paddingHorizontal: 2 },
    name: { fontSize: 14, lineHeight: 18, fontWeight: '700', color: brand.textDark },
    domain: { fontSize: 13, lineHeight: 17 },
  });
}
