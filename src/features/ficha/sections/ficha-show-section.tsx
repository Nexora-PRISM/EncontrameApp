import { Image } from 'expo-image';
import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { Radius, type BrandColors } from '@/constants/brand';
import type { FichaShowController } from '@/features/ficha/ficha-show.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { POSTER_PRINT_ID } from '@/lib/print-poster';

type Props = { controller: FichaShowController };

/** Ficha em tela cheia: fácil de ler no balcão da delegacia ou de imprimir. */
export function FichaShowSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  if (c.loading) return <ActivityIndicator size="large" color={brand.orange} />;
  if (c.notFound || !c.sheet) return <Text style={styles.muted}>{t('Ficha não encontrada neste aparelho.')}</Text>;
  const s = c.sheet;

  const rows: [string, string][] = [
    [t('Apelido'), s.nickname],
    [t('Idade'), c.age === null ? '' : t('{age} anos', { age: c.age })],
    [t('Data de nascimento'), s.birthDate],
    [t('Altura'), s.heightCm ? `${s.heightCm} cm` : ''],
    [t('Porte físico'), s.build ? t(s.build) : ''],
    [t('Cor/Etnia'), s.ethnicity ? t(s.ethnicity) : ''],
    [t('Cabelo'), s.hair],
    [t('Olhos'), s.eyes],
    [t('Sinais particulares'), s.marks],
    [t('Roupa de hoje'), c.dayValid ? s.dayClothes : ''],
    [t('Telefone de quem cuida'), s.contactPhone],
  ];

  return (
    <View style={styles.wrap}>
      <View style={styles.actions}>
        <BrandButton label={t('Ligar 190')} variant="blue" trailingIcon="phone" onPress={() => void c.call190()} />
        {c.canPrint ? <BrandButton label={t('Imprimir ou salvar em PDF')} variant="outline" trailingIcon="printer" onPress={c.print} /> : null}
      </View>

      <View style={styles.sheet} nativeID={POSTER_PRINT_ID}>
        <Text style={styles.kicker}>{t('Ficha de identificação')}</Text>
        <Text style={styles.name} accessibilityRole="header">
          {s.name}
        </Text>
        <View style={styles.photos}>
          {s.photo ? (
            <View style={styles.photoBox}>
              <Image source={{ uri: `data:image/jpeg;base64,${s.photo}` }} style={styles.photo} contentFit="cover" accessibilityLabel={t('Foto do rosto')} />
              {c.photoTaken ? <Text style={styles.caption}>{t('Foto de {date}', { date: c.photoTaken })}</Text> : null}
            </View>
          ) : null}
          {c.dayValid ? (
            <View style={styles.photoBox}>
              <Image source={{ uri: `data:image/jpeg;base64,${s.dayPhoto}` }} style={styles.photo} contentFit="cover" accessibilityLabel={t('Foto do dia')} />
              <Text style={styles.caption}>{t('Roupa de hoje · {date}', { date: c.dayTaken })}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.table}>
          {rows
            .filter(([, value]) => value.trim())
            .map(([label, value]) => (
              <View key={label} style={styles.row}>
                <Text style={styles.rowLabel}>{label}</Text>
                <Text style={styles.rowValue}>{value}</Text>
              </View>
            ))}
        </View>

        {s.healthNotes.trim() ? (
          <View style={styles.health}>
            <Text style={styles.healthTitle}>{t('Saúde e comunicação')}</Text>
            <Text style={styles.healthText}>{s.healthNotes}</Text>
          </View>
        ) : null}

        <Text style={styles.footer}>
          {t('Preparada pela família no app Encontra-me e atualizada em {date}. Não é documento oficial.', { date: c.updated })}
        </Text>
      </View>
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: { gap: 16 },
    actions: { gap: 10 },
    muted: { fontSize: 15, color: brand.textMuted },
    sheet: {
      gap: 14,
      padding: 18,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: brand.divider,
      backgroundColor: brand.surface,
    },
    kicker: { fontSize: 13, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', color: brand.textMuted },
    name: { fontSize: 26, lineHeight: 32, fontWeight: '900', color: brand.textDark },
    photos: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
    photoBox: { gap: 6 },
    photo: { width: 170, height: 210, borderRadius: Radius.md, backgroundColor: brand.avatarBackground },
    caption: { fontSize: 13, color: brand.textMuted },
    table: { gap: 8 },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: brand.divider },
    rowLabel: { width: 170, fontSize: 15, fontWeight: '700', color: brand.textMuted },
    rowValue: { flex: 1, minWidth: 160, fontSize: 17, lineHeight: 23, fontWeight: '700', color: brand.textDark },
    health: { gap: 4, padding: 12, borderRadius: Radius.md, backgroundColor: brand.cream },
    healthTitle: { fontSize: 15, fontWeight: '800', color: brand.navy },
    healthText: { fontSize: 17, lineHeight: 24, color: brand.navy },
    footer: { fontSize: 13, lineHeight: 18, color: brand.textMuted },
  });
}
