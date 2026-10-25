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
        {kind === 'safety' ? <SafetyArt brand={brand} styles={styles} /> : null}
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
  const faces = [
    { icon: 'human-child' as const, color: brand.statusAlerta, name: 'Ana' },
    { icon: 'account' as const, color: brand.statusProcurando, name: 'Lucas' },
    { icon: 'human-cane' as const, color: brand.statusEncontrado, name: 'Helena' },
  ];
  return (
    <View style={styles.center}>
      <View style={styles.viewToggle}>
        <View style={[styles.viewToggleBtn, styles.viewToggleBtnOn]}>
          <MaterialCommunityIcons name="account-circle-outline" size={16} color={brand.orangeDark} />
        </View>
        <View style={styles.viewToggleBtn}>
          <MaterialCommunityIcons name="card-text-outline" size={16} color={brand.onPrimary} />
        </View>
      </View>
      <View style={styles.avatarRow}>
        {faces.map((face) => (
          <View key={face.icon} style={styles.avatarWithName}>
            <View style={[styles.roundAvatar, { borderColor: face.color }]}>
              <MaterialCommunityIcons name={face.icon} size={28} color={face.color} />
            </View>
            <Text style={styles.avatarCaption}>{face.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function MapArt({ brand, styles }: ArtProps) {
  const t = useT();
  const chips = [
    { label: t('Todos'), filled: true },
    { label: t('Crianças'), filled: false },
    { label: t('Idosos'), filled: false },
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
                ? { backgroundColor: brand.orange, borderColor: brand.orange }
                : { backgroundColor: brand.surface, borderColor: brand.orange },
            ]}
          >
            <Text style={[styles.miniChipText, { color: chip.filled ? brand.onPrimary : brand.orange }]}>
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

function SafetyArt({ brand, styles }: ArtProps) {
  const t = useT();
  const notes = [
    { icon: 'road-variant' as const, top: 40, left: 52 },
    { icon: 'shield-alert-outline' as const, top: 92, left: 196 },
    { icon: 'lightbulb-off-outline' as const, top: 30, left: 236 },
  ];

  return (
    <View style={styles.mapBox}>
      <View style={[styles.road, { top: 74, transform: [{ rotate: '6deg' }] }]} />
      <View style={[styles.road, { top: 20, width: 6, height: 170, left: 150 }]} />
      {notes.map((note) => (
        <View
          key={note.left}
          style={[styles.noteDiamond, { top: note.top, left: note.left, backgroundColor: brand.safetyNote }]}
        >
          <View style={styles.noteDiamondIcon}>
            <MaterialCommunityIcons name={note.icon} size={16} color={brand.onSafetyNote} />
          </View>
        </View>
      ))}
      <View style={styles.addNoteReplica}>
        <MaterialCommunityIcons name="map-marker-plus-outline" size={18} color={brand.safetyNote} />
        <Text style={styles.addNoteReplicaText}>{t('Adicionar aviso')}</Text>
      </View>
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
    viewToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      padding: 3,
      borderRadius: Radius.pill,
      backgroundColor: hexToRgba(brand.onPrimary, 0.16),
    },
    viewToggleBtn: {
      width: 32,
      height: 26,
      borderRadius: Radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    viewToggleBtnOn: {
      backgroundColor: brand.surface,
    },
    avatarRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 16,
    },
    avatarWithName: {
      width: 72,
      alignItems: 'center',
    },
    avatarCaption: {
      marginTop: 4,
      fontSize: 11,
      lineHeight: 14,
      fontWeight: '700',
      color: brand.onPrimary,
      textAlign: 'center',
    },
    roundAvatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      borderWidth: 4,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brand.avatarBackground,
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
    noteDiamond: {
      position: 'absolute',
      width: 32,
      height: 32,
      borderRadius: 9,
      borderWidth: 2.5,
      borderColor: brand.onPrimary,
      alignItems: 'center',
      justifyContent: 'center',
      transform: [{ rotate: '45deg' }],
    },
    noteDiamondIcon: {
      transform: [{ rotate: '-45deg' }],
    },
    addNoteReplica: {
      position: 'absolute',
      bottom: 12,
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      height: 38,
      paddingHorizontal: 14,
      borderRadius: Radius.pill,
      backgroundColor: brand.navy,
    },
    addNoteReplicaText: {
      fontSize: 14,
      fontWeight: '800',
      color: brand.onPrimary,
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
