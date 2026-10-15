import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Radius, type BrandColors } from '@/constants/brand';
import type { TutorialIllustration } from '@/features/inicio/tutorial-steps';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { hexToRgba } from '@/lib/map-style';

type Props = {
  kind: TutorialIllustration;
};

/**
 * Desenho de cada passo do tutorial. Reproduz, em miniatura, o botão ou cartão que a pessoa vai
 * encontrar na tela — assim ela reconhece o lugar certo de tocar. Só decoração: o leitor de tela
 * lê o título e o texto do passo.
 */
export function TutorialArt({ kind }: Props) {
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  return (
    <LinearGradient
      colors={[brand.navy, brand.navyDeep]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.stage}
    >
      <View
        style={styles.stageInner}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {kind === 'welcome' ? <WelcomeArt styles={styles} /> : null}
        {kind === 'alerts' ? <AlertsArt brand={brand} styles={styles} /> : null}
        {kind === 'map' ? <MapArt brand={brand} styles={styles} /> : null}
        {kind === 'sighting' ? <SightingArt brand={brand} styles={styles} /> : null}
        {kind === 'emergency' ? <EmergencyArt brand={brand} styles={styles} /> : null}
        {kind === 'bottom-bar' ? <BottomBarArt brand={brand} styles={styles} /> : null}
        {kind === 'start' ? <StartArt styles={styles} /> : null}
      </View>
    </LinearGradient>
  );
}

type ArtProps = { brand: BrandColors; styles: Styles };

function WelcomeArt({ styles }: { styles: Styles }) {
  return (
    <View style={styles.center}>
      <Image
        source={require('@/assets/images/sofia-avatar.jpg')}
        style={styles.avatar}
        resizeMode="cover"
      />
      <Image
        source={require('@/assets/images/encontrame-mark.png')}
        style={styles.avatarBadge}
        resizeMode="contain"
      />
    </View>
  );
}

function AlertsArt({ brand, styles }: ArtProps) {
  const t = useT();
  return (
    <View style={styles.center}>
      <View style={styles.miniCard}>
        <View style={[styles.miniPhoto, { backgroundColor: hexToRgba(brand.categoryChild, 0.18) }]}>
          <MaterialCommunityIcons name="human-child" size={30} color={brand.categoryChild} />
        </View>
        <View style={styles.miniCardText}>
          <View style={[styles.miniPill, { backgroundColor: brand.statusAlerta }]}>
            <Text style={styles.miniPillText}>{t('Alerta').toUpperCase()}</Text>
          </View>
          <Text style={styles.miniName}>Ana Clara</Text>
          <Text style={styles.miniMeta}>{t('{age} anos', { age: 8 })}</Text>
        </View>
      </View>
      <TapHint brand={brand} styles={styles} />
    </View>
  );
}

function MapArt({ brand, styles }: ArtProps) {
  const t = useT();
  const chips = [
    { label: t('Todos'), color: brand.categoryAll, filled: true },
    { label: t('Crianças'), color: brand.categoryChild, filled: false },
    { label: t('Idosos'), color: brand.categoryElder, filled: false },
  ];
  const pins = [
    { color: brand.categoryChild, icon: 'human-child' as const, top: 62, left: 34 },
    { color: brand.categoryAdult, icon: 'account' as const, top: 96, left: 150 },
    { color: brand.categoryElder, icon: 'human-cane' as const, top: 54, left: 214 },
  ];

  return (
    <View style={styles.mapBox}>
      <View style={[styles.road, { top: 84, transform: [{ rotate: '-8deg' }] }]} />
      <View style={[styles.road, { top: 40, width: 6, height: 160, left: 120 }]} />
      <View style={styles.chipRow}>
        {chips.map((chip) => (
          <View
            key={chip.label}
            style={[
              styles.miniChip,
              chip.filled
                ? { backgroundColor: chip.color, borderColor: chip.color }
                : { borderColor: chip.color },
            ]}
          >
            <Text style={[styles.miniChipText, { color: chip.filled ? brand.onCategory : chip.color }]}>
              {chip.label}
            </Text>
          </View>
        ))}
      </View>
      {pins.map((pin) => (
        <View key={pin.left} style={[styles.mapPin, { top: pin.top, left: pin.left, borderColor: pin.color }]}>
          <MaterialCommunityIcons name={pin.icon} size={18} color={pin.color} />
        </View>
      ))}
      <View style={styles.userDot} />
    </View>
  );
}

function SightingArt({ brand, styles }: ArtProps) {
  const t = useT();
  return (
    <View style={styles.center}>
      <View style={[styles.replicaButton, { backgroundColor: brand.orange }]}>
        <MaterialCommunityIcons name="eye-outline" size={22} color={brand.onPrimary} />
        <Text style={styles.replicaLabel}>{t('Vi essa pessoa por perto')}</Text>
      </View>
      <View style={styles.locationRow}>
        <MaterialCommunityIcons name="map-marker-radius" size={26} color={brand.cream} />
        <View style={styles.dashLine} />
        <MaterialCommunityIcons name="account-heart-outline" size={26} color={brand.cream} />
      </View>
      <TapHint brand={brand} styles={styles} />
    </View>
  );
}

function EmergencyArt({ brand, styles }: ArtProps) {
  const t = useT();
  return (
    <View style={styles.center}>
      <View style={[styles.replicaButton, styles.helpPill, { backgroundColor: brand.emergency }]}>
        <MaterialCommunityIcons name="alarm-light-outline" size={26} color={brand.onEmergency} />
        <Text style={styles.replicaLabel}>{t('Pedir ajuda')}</Text>
      </View>
      <View style={styles.numbersRow}>
        {['190', '192', '193'].map((number) => (
          <View key={number} style={styles.numberChip}>
            <MaterialCommunityIcons name="phone" size={14} color={brand.cream} />
            <Text style={styles.numberText}>{number}</Text>
          </View>
        ))}
      </View>
      <TapHint brand={brand} styles={styles} />
    </View>
  );
}

function BottomBarArt({ brand, styles }: ArtProps) {
  const t = useT();
  return (
    <View style={styles.center}>
      <View style={styles.barReplica}>
        <View style={[styles.barTab, styles.barTabHighlight]}>
          <MaterialCommunityIcons name="menu" size={24} color={brand.textDark} />
          <Text style={styles.barTabLabel}>{t('Menu')}</Text>
        </View>
        <View style={[styles.barHelp, { backgroundColor: brand.emergency }]}>
          <MaterialCommunityIcons name="alarm-light-outline" size={18} color={brand.onEmergency} />
        </View>
        <View style={[styles.barTab, styles.barTabHighlight]}>
          <MaterialCommunityIcons name="account-plus-outline" size={24} color={brand.textDark} />
          <Text style={styles.barTabLabel}>{t('Cadastrar')}</Text>
        </View>
      </View>
      <View style={styles.arrowsRow}>
        <MaterialCommunityIcons name="arrow-up-bold" size={26} color={brand.orange} />
        <MaterialCommunityIcons name="arrow-up-bold" size={26} color={brand.orange} />
      </View>
    </View>
  );
}

function StartArt({ styles }: { styles: Styles }) {
  return (
    <View style={styles.center}>
      <Image
        source={require('@/assets/images/encontrame-mark.png')}
        style={styles.bigMark}
        resizeMode="contain"
      />
    </View>
  );
}

function TapHint({ brand, styles }: ArtProps) {
  return (
    <View style={styles.tapHint}>
      <MaterialCommunityIcons name="gesture-tap" size={34} color={brand.cream} />
    </View>
  );
}

type Styles = ReturnType<typeof makeStyles>;

function makeStyles(brand: BrandColors) {
  const glass = hexToRgba(brand.onPrimary, 0.1);
  return StyleSheet.create({
    stage: {
      width: '100%',
      maxWidth: 380,
      height: 230,
      borderRadius: Radius.xl,
      overflow: 'hidden',
      alignSelf: 'center',
    },
    stageInner: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    center: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
    },
    avatar: {
      width: 140,
      height: 140,
      borderRadius: 70,
      borderWidth: 4,
      borderColor: brand.orange,
      backgroundColor: brand.avatarBackground,
    },
    avatarBadge: {
      position: 'absolute',
      right: -6,
      bottom: -4,
      width: 52,
      height: 52,
    },
    miniCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      minWidth: 230,
    },
    miniPhoto: {
      width: 64,
      height: 64,
      borderRadius: Radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    miniCardText: {
      gap: 3,
      alignItems: 'flex-start',
    },
    miniPill: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: Radius.pill,
    },
    miniPillText: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.6,
      color: brand.onStatusBadge,
    },
    miniName: {
      fontSize: 17,
      fontWeight: '800',
      color: brand.textDark,
    },
    miniMeta: {
      fontSize: 14,
      fontWeight: '600',
      color: brand.textMuted,
    },
    tapHint: {
      position: 'absolute',
      right: -28,
      bottom: -30,
    },
    mapBox: {
      width: '88%',
      height: 190,
      borderRadius: Radius.lg,
      backgroundColor: brand.mapBackground,
      overflow: 'hidden',
    },
    road: {
      position: 'absolute',
      left: -20,
      width: '130%',
      height: 6,
      borderRadius: 3,
      backgroundColor: brand.surface,
      opacity: 0.8,
    },
    chipRow: {
      flexDirection: 'row',
      gap: 6,
      padding: 10,
    },
    miniChip: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: Radius.pill,
      borderWidth: 1.5,
      backgroundColor: brand.surface,
    },
    miniChipText: {
      fontSize: 12,
      fontWeight: '800',
    },
    mapPin: {
      position: 'absolute',
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 3,
      backgroundColor: brand.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    userDot: {
      position: 'absolute',
      top: 128,
      left: 92,
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 3,
      borderColor: brand.onPrimary,
      backgroundColor: brand.blue,
    },
    replicaButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      height: 54,
      paddingHorizontal: 20,
      borderRadius: Radius.md,
    },
    helpPill: {
      height: 60,
      paddingHorizontal: 28,
      borderRadius: Radius.pill,
    },
    replicaLabel: {
      fontSize: 17,
      fontWeight: '800',
      color: brand.onPrimary,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    dashLine: {
      width: 70,
      height: 0,
      borderTopWidth: 2,
      borderStyle: 'dashed',
      borderColor: brand.cream,
    },
    numbersRow: {
      flexDirection: 'row',
      gap: 8,
    },
    numberChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: Radius.pill,
      backgroundColor: glass,
    },
    numberText: {
      fontSize: 14,
      fontWeight: '800',
      color: brand.cream,
    },
    barReplica: {
      width: 290,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
    },
    barTab: {
      alignItems: 'center',
      gap: 2,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: Radius.md,
    },
    barTabHighlight: {
      borderWidth: 2,
      borderColor: brand.orange,
    },
    barTabLabel: {
      fontSize: 13,
      fontWeight: '800',
      color: brand.textDark,
    },
    barHelp: {
      width: 74,
      height: 40,
      borderRadius: Radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    arrowsRow: {
      width: 230,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    bigMark: {
      width: 150,
      height: 150,
    },
  });
}
