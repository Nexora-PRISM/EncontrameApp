import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { type Href, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, Vibration, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, type BrandColors } from '@/constants/brand';
import { EMERGENCY_LINES, type EmergencyLine } from '@/constants/emergency';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

type Props = {
  visible: boolean;
  onClose: () => void;
};

type DialState = { number: string; status: 'opening' | 'failed' } | null;

/**
 * Folha "Pedir ajuda". Abrir a folha é o 1º toque; escolher o número é o 2º —
 * isso evita ligação acidental sem criar etapas extras numa emergência.
 * O conteúdo (EmergencyOptions) é o mesmo da tela /pedir-ajuda, aberta pelo atalho da tela inicial.
 */
export function EmergencySheet({ visible, onClose }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeSheetStyles(brand), [brand]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const goTo = (href: Href) => {
    onClose();
    router.push(href);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          style={styles.scrim}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('Fechar')}
        />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerTexts}>
              <Text style={styles.title} accessibilityRole="header">
                {t('Pedir ajuda')}
              </Text>
              <Text style={styles.subtitle}>{t('Escolha o que está acontecendo.')}</Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel={t('Fechar')}
            >
              <MaterialCommunityIcons name="close" size={24} color={brand.label} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <EmergencyOptions onNavigate={goTo} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/**
 * Opções de ajuda, separadas: alerta com contagem × pedir socorro (ligação) × avisar contatos ×
 * comunicar desaparecimento × informar avistamento.
 * O app NÃO avisa autoridades automaticamente: a ligação é feita pelo telefone da pessoa.
 */
export function EmergencyOptions({ onNavigate }: { onNavigate: (href: Href) => void }) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeOptionStyles(brand), [brand]);
  const [dial, setDial] = useState<DialState>(null);

  const call = (line: EmergencyLine) => {
    try {
      Vibration.vibrate(40);
    } catch {
      // Sem vibração no aparelho/navegador.
    }
    setDial({ number: line.number, status: 'opening' });
    Linking.openURL(`tel:${line.number}`).catch(() => {
      setDial({ number: line.number, status: 'failed' });
    });
  };

  const primary = EMERGENCY_LINES.filter((line) => line.primary);
  const secondary = EMERGENCY_LINES.filter((line) => !line.primary);

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => onNavigate('/alerta-emergencia' as Href)}
        style={({ pressed }) => [styles.alertCard, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={t('Acionar alerta de emergência. Contagem de 10 segundos, com opção de cancelar.')}
      >
        <View style={styles.alertIcon}>
          <MaterialCommunityIcons name="alarm-light" size={28} color={brand.onEmergency} />
        </View>
        <View style={styles.callTexts}>
          <Text style={styles.callName}>{t('Acionar alerta de emergência')}</Text>
          <Text style={styles.callWhen}>
            {t('Contagem de 10 segundos para cancelar. Depois abre o 190 e deixa sua localização pronta para seus contatos.')}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={22} color={brand.emergency} />
      </Pressable>

      <Text style={styles.sectionTitle}>{t('Perigo agora — ligar')}</Text>
      {primary.map((line) => (
        <Pressable
          key={line.number}
          onPress={() => call(line)}
          style={({ pressed }) => [styles.callCard, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={t('Ligar {number}, {name}. {when}', { number: line.number, name: t(line.name), when: t(line.when) })}
        >
          <View style={styles.callNumberWrap}>
            <Text style={styles.callNumber}>{line.number}</Text>
          </View>
          <View style={styles.callTexts}>
            <Text style={styles.callName}>{t(line.name)}</Text>
            <Text style={styles.callWhen}>{t(line.when)}</Text>
          </View>
          <MaterialCommunityIcons name="phone" size={24} color={brand.emergency} />
        </Pressable>
      ))}

      <View style={styles.secondaryRow}>
        {secondary.map((line) => (
          <Pressable
            key={line.number}
            onPress={() => call(line)}
            style={({ pressed }) => [styles.secondaryCall, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={t('Ligar {number}, {name}', { number: line.number, name: t(line.name) })}
          >
            <Text style={styles.secondaryNumber}>{line.number}</Text>
            <Text style={styles.secondaryName}>{t(line.name)}</Text>
          </Pressable>
        ))}
      </View>

      {dial ? (
        <View style={styles.dialStatus} accessibilityLiveRegion="polite">
          <MaterialCommunityIcons
            name={dial.status === 'failed' ? 'alert-circle-outline' : 'phone-outgoing'}
            size={22}
            color={dial.status === 'failed' ? brand.error : brand.blue}
          />
          <Text style={styles.dialText}>
            {dial.status === 'failed'
              ? t('Não foi possível abrir o telefone. Ligue manualmente para {number}.', { number: dial.number })
              : t('Abrindo o telefone para ligar para {number}. Se nada acontecer, disque {number} manualmente.', { number: dial.number })}
          </Text>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>{t('Avisar alguém de confiança')}</Text>
      <Pressable
        onPress={() => onNavigate('/compartilhar-localizacao' as Href)}
        style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}
        accessibilityRole="button"
      >
        <MaterialCommunityIcons name="map-marker-account-outline" size={26} color={brand.blue} />
        <View style={styles.callTexts}>
          <Text style={styles.actionTitle}>{t('Compartilhar minha localização')}</Text>
          <Text style={styles.callWhen}>
            {t('Mande onde você está por WhatsApp, SMS ou outro aplicativo.')}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={22} color={brand.label} />
      </Pressable>

      <Text style={styles.sectionTitle}>{t('Desaparecimento')}</Text>
      <Pressable
        onPress={() => onNavigate('/cadastrar-pessoa')}
        style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}
        accessibilityRole="button"
      >
        <MaterialCommunityIcons name="account-alert-outline" size={26} color={brand.blue} />
        <View style={styles.callTexts}>
          <Text style={styles.actionTitle}>{t('Comunicar um desaparecimento')}</Text>
          <Text style={styles.callWhen}>
            {t('Cadastre a pessoa no app. Faça também o boletim de ocorrência — não é preciso esperar 24 horas.')}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={22} color={brand.label} />
      </Pressable>
      <Pressable
        onPress={() => onNavigate('/pessoas-desaparecidas' as Href)}
        style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}
        accessibilityRole="button"
      >
        <MaterialCommunityIcons name="eye-outline" size={26} color={brand.blue} />
        <View style={styles.callTexts}>
          <Text style={styles.actionTitle}>{t('Vi uma pessoa desaparecida')}</Text>
          <Text style={styles.callWhen}>
            {t('Encontre o caso e informe onde a viu. Se ela estiver em perigo, ligue 190.')}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={22} color={brand.label} />
      </Pressable>

      <Text style={styles.honest}>
        {t('A ligação é feita pelo seu celular. O Encontra-me não avisa a polícia sozinho, e sua localização só chega aos seus contatos quando você envia a mensagem.')}
      </Text>
    </View>
  );
}

function makeSheetStyles(brand: BrandColors) {
  return StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    scrim: {
      ...StyleSheet.absoluteFill,
      backgroundColor: brand.overlay,
    },
    sheet: {
      maxHeight: '92%',
      width: '100%',
      maxWidth: 560,
      alignSelf: 'center',
      borderTopLeftRadius: Radius.xl,
      borderTopRightRadius: Radius.xl,
      backgroundColor: brand.surface,
      paddingHorizontal: 16,
    },
    handle: {
      alignSelf: 'center',
      width: 44,
      height: 5,
      borderRadius: Radius.pill,
      backgroundColor: brand.divider,
      marginTop: 10,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 12,
    },
    headerTexts: {
      flex: 1,
      gap: 2,
    },
    title: {
      fontSize: 24,
      fontWeight: '800',
      color: brand.emergency,
    },
    subtitle: {
      fontSize: 15,
      color: brand.textMuted,
    },
    closeButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      paddingBottom: 8,
    },
  });
}

function makeOptionStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: {
      gap: 10,
    },
    sectionTitle: {
      marginTop: 6,
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: brand.label,
    },
    alertCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      minHeight: 80,
      padding: 12,
      borderRadius: Radius.lg,
      backgroundColor: brand.emergencySoft,
      borderWidth: 2,
      borderColor: brand.emergency,
    },
    alertIcon: {
      width: 52,
      height: 52,
      borderRadius: Radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brand.emergency,
    },
    callCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      minHeight: 72,
      padding: 12,
      borderRadius: Radius.lg,
      backgroundColor: brand.emergencySoft,
      borderWidth: 1,
      borderColor: brand.emergency,
    },
    pressed: {
      opacity: 0.8,
    },
    callNumberWrap: {
      minWidth: 64,
      height: 48,
      paddingHorizontal: 8,
      borderRadius: Radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brand.emergency,
    },
    callNumber: {
      fontSize: 22,
      fontWeight: '900',
      color: brand.onEmergency,
    },
    callTexts: {
      flex: 1,
      gap: 2,
    },
    callName: {
      fontSize: 16,
      fontWeight: '800',
      color: brand.textDark,
    },
    callWhen: {
      fontSize: 14,
      lineHeight: 19,
      color: brand.textMuted,
    },
    secondaryRow: {
      flexDirection: 'row',
      gap: 10,
    },
    secondaryCall: {
      flex: 1,
      minHeight: 56,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: brand.divider,
      backgroundColor: brand.fieldBackground,
    },
    secondaryNumber: {
      fontSize: 18,
      fontWeight: '900',
      color: brand.textDark,
    },
    secondaryName: {
      fontSize: 13,
      color: brand.textMuted,
    },
    dialStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 12,
      borderRadius: Radius.md,
      backgroundColor: brand.fieldBackground,
    },
    dialText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 19,
      color: brand.textDark,
    },
    actionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      minHeight: 72,
      padding: 12,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: brand.divider,
      backgroundColor: brand.surface,
    },
    actionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: brand.textDark,
    },
    honest: {
      marginTop: 6,
      fontSize: 13,
      lineHeight: 18,
      color: brand.textMuted,
    },
  });
}
