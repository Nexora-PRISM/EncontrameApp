import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { Radius, type BrandColors } from '@/constants/brand';
import type { ApoiadoresAdminController } from '@/features/equipe/apoiadores-admin.controller';
import { makeEquipeStyles } from '@/features/equipe/sections/equipe-styles';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { SUPPORTER_CATEGORY_LABEL } from '@/lib/supporter-labels';
import { websiteLabel } from '@/lib/supporter-rules';
import type { SupporterAdmin } from '@/services/supporters/supporters.types';

type Props = { controller: ApoiadoresAdminController };

/** Lista da equipe: situação de cada marca, autorização, ordem e atalhos. */
export function ApoiadoresAdminSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const shared = useMemo(() => makeEquipeStyles(brand), [brand]);
  const styles = useMemo(() => makeStyles(brand), [brand]);

  if (!c.enabled) {
    return (
      <Text style={shared.muted}>
        {t('Nossos apoiadores está desligado neste ambiente (EXPO_PUBLIC_ENABLE_SUPPORTERS).')}
      </Text>
    );
  }

  return (
    <View style={shared.section}>
      <Text style={shared.muted}>
        {t(
          'Só a equipe publica marcas. Publicar exige autorização por escrito da empresa para usar o nome e o logotipo. As categorias organizam o reconhecimento e não dependem de valores.',
        )}
      </Text>
      <View style={shared.row}>
        <BrandButton label={t('Novo apoiador')} variant="blue" trailingIcon="plus" onPress={c.add} />
        <BrandButton label={t('Ver como o público vê')} variant="outline" onPress={c.preview} />
      </View>

      {c.loading ? (
        <ActivityIndicator size="large" color={brand.orange} />
      ) : c.error ? (
        <View style={styles.center}>
          <Text style={shared.muted}>{t('Não foi possível carregar os apoiadores.')}</Text>
          <BrandButton label={t('Tentar de novo')} variant="outline" onPress={c.reload} />
        </View>
      ) : c.items.length === 0 ? (
        <Text style={shared.muted}>{t('Nenhum apoiador cadastrado.')}</Text>
      ) : (
        c.items.map((item, index) => (
          <AdminCard
            key={item.id}
            item={item}
            first={index === 0}
            last={index === c.items.length - 1}
            controller={c}
            brand={brand}
            shared={shared}
            styles={styles}
          />
        ))
      )}
    </View>
  );
}

function AdminCard({
  item,
  first,
  last,
  controller: c,
  brand,
  shared,
  styles,
}: {
  item: SupporterAdmin;
  first: boolean;
  last: boolean;
  controller: ApoiadoresAdminController;
  brand: BrandColors;
  shared: ReturnType<typeof makeEquipeStyles>;
  styles: ReturnType<typeof makeStyles>;
}) {
  const t = useT();
  const [logoFailed, setLogoFailed] = useState(false);
  const domain = websiteLabel(item.websiteUrl);

  return (
    <View style={shared.card}>
      <View style={styles.top}>
        <View style={styles.thumb}>
          {item.logoUrl && !logoFailed ? (
            <Image
              source={{ uri: item.logoUrl }}
              style={styles.thumbImage}
              contentFit="contain"
              accessible={false}
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <Text style={styles.thumbText} numberOfLines={2}>
              {item.name}
            </Text>
          )}
        </View>
        <View style={styles.info}>
          <Text style={shared.cardTitle} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={shared.muted}>
            {t(SUPPORTER_CATEGORY_LABEL[item.category])}
            {domain ? ` · ${domain}` : ''}
          </Text>
        </View>
        <View style={styles.order}>
          <OrderButton
            icon="chevron-up"
            label={t('Subir na ordem')}
            disabled={first || c.busy}
            onPress={() => c.move(item, -1)}
            brand={brand}
            styles={styles}
          />
          <OrderButton
            icon="chevron-down"
            label={t('Descer na ordem')}
            disabled={last || c.busy}
            onPress={() => c.move(item, 1)}
            brand={brand}
            styles={styles}
          />
        </View>
      </View>

      <View style={shared.row}>
        <Chip text={item.isActive ? t('Publicado') : t('Não publicado')} color={item.isActive ? brand.blue : brand.textMuted} shared={shared} />
        {item.isActive && item.showOnHome ? <Chip text={t('No Início')} color={brand.blue} shared={shared} /> : null}
        <Chip
          text={
            item.authorizationConfirmed
              ? t('Autorização confirmada em {date}', { date: c.formatDate(item.authorizationConfirmedAt) })
              : t('Sem autorização da marca')
          }
          color={item.authorizationConfirmed ? brand.textMuted : brand.safetyNoteText}
          shared={shared}
        />
      </View>

      <View style={shared.row}>
        <BrandButton label={t('Editar')} variant="outline" onPress={() => c.edit(item)} />
        <BrandButton
          label={item.isActive ? t('Tirar do ar') : t('Publicar')}
          variant={item.isActive ? 'outline' : 'blue'}
          loading={c.busy}
          onPress={() => c.togglePublished(item)}
        />
        {item.isActive ? (
          <BrandButton
            label={item.showOnHome ? t('Tirar do Início') : t('Mostrar no Início')}
            variant="outline"
            loading={c.busy}
            onPress={() => c.toggleHome(item)}
          />
        ) : null}
      </View>
    </View>
  );
}

function Chip({ text, color, shared }: { text: string; color: string; shared: ReturnType<typeof makeEquipeStyles> }) {
  return (
    <View style={[shared.chip, { borderColor: color }]}>
      <Text style={[shared.chipText, { color }]}>{text}</Text>
    </View>
  );
}

function OrderButton({
  icon,
  label,
  disabled,
  onPress,
  brand,
  styles,
}: {
  icon: 'chevron-up' | 'chevron-down';
  label: string;
  disabled: boolean;
  onPress: () => void;
  brand: BrandColors;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      style={({ pressed }) => [styles.orderBtn, pressed && styles.pressed, disabled && styles.disabled]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <MaterialCommunityIcons name={icon} size={24} color={brand.textDark} />
    </Pressable>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    center: { alignItems: 'center', gap: 12 },
    top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    thumb: {
      width: 84,
      aspectRatio: 3 / 2,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 8,
      borderRadius: Radius.sm,
      borderWidth: 1,
      borderColor: brand.divider,
      backgroundColor: brand.logoTile,
      overflow: 'hidden',
    },
    thumbImage: { width: '100%', height: '100%' },
    thumbText: { fontSize: 11, fontWeight: '800', textAlign: 'center', color: brand.onLogoTile },
    info: { flex: 1, gap: 2 },
    order: { gap: 4 },
    orderBtn: {
      width: 40,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Radius.sm,
      borderWidth: 1,
      borderColor: brand.divider,
      backgroundColor: brand.white,
    },
    pressed: { opacity: 0.7 },
    disabled: { opacity: 0.35 },
  });
}
