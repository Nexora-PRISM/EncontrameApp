import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandButton } from '@/components/brand-button';
import { BrandEnter } from '@/components/brand-enter';
import { SettingsSegmented } from '@/components/settings-list';
import { Radius, type BrandColors } from '@/constants/brand';
import { PageGutter } from '@/constants/theme';
import type { InicioController } from '@/features/inicio/inicio.controller';
import { TutorialArt } from '@/features/inicio/sections/tutorial-art';
import { TUTORIAL_STEPS } from '@/features/inicio/tutorial-steps';
import { useBrand } from '@/lib/brand-theme';
import { LANGUAGE_SHORT_OPTIONS, useT } from '@/lib/i18n';
import { useWideLayout } from '@/lib/use-wide-layout';

type Props = {
  controller: InicioController;
};

/**
 * Passo a passo de como usar o app. Aparece na primeira abertura e pelo Menu, em "Como usar o app".
 * "Pular" fica sempre visível no alto; texto grande, um assunto por passo e botões largos.
 */
export function InicioOnboardingSection({ controller }: Props) {
  const t = useT();
  const brand = useBrand();
  const { isWide } = useWideLayout();
  const styles = useMemo(() => makeStyles(brand, isWide), [brand, isWide]);
  const step = Math.min(controller.onboardingStep, TUTORIAL_STEPS.length - 1);
  const copy = TUTORIAL_STEPS[step] ?? TUTORIAL_STEPS[0];
  const isFirst = step === 0;
  const isLast = step === TUTORIAL_STEPS.length - 1;

  return (
    <Modal
      visible={controller.onboardingVisible}
      transparent={isWide}
      animationType={isWide ? 'fade' : 'slide'}
      presentationStyle={isWide ? 'overFullScreen' : 'fullScreen'}
      onRequestClose={controller.onboardingRequestClose}
    >
      <View style={styles.shell}>
        <SafeAreaView style={styles.panel} edges={['top', 'bottom']}>
          <View style={styles.topRow}>
            <Text style={styles.progressText}>
              {t('Passo {value} de {count}', { value: step + 1, count: TUTORIAL_STEPS.length })}
            </Text>
            {isLast ? null : (
              <Pressable
                onPress={controller.onboardingSkip}
                hitSlop={12}
                style={({ pressed }) => [styles.skip, pressed && styles.skipPressed]}
                accessibilityRole="button"
                accessibilityLabel={t('Pular')}
                accessibilityHint={t('Fecha o passo a passo. Você pode ver de novo pelo Menu, em "Como usar o app".')}
              >
                <Text style={styles.skipText}>{t('Pular')}</Text>
                <MaterialCommunityIcons name="chevron-double-right" size={20} color={brand.blue} />
              </Pressable>
            )}
          </View>

          <View style={styles.progressBar}>
            {TUTORIAL_STEPS.map((item, index) => (
              <View
                key={item.illustration}
                style={[styles.progressSegment, index <= step && styles.progressSegmentDone]}
              />
            ))}
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
          >
            <BrandEnter key={step} from="fade" style={styles.stepContent}>
              <TutorialArt kind={copy.illustration} />
              <Text style={styles.title} accessibilityRole="header">
                {t(copy.title)}
              </Text>
              <Text style={styles.message}>{t(copy.message)}</Text>
            </BrandEnter>
          </ScrollView>

          <View style={styles.footer}>
            {isFirst ? (
              // Quem não lê português escolhe o idioma logo na primeira tela.
              <View style={styles.languageRow}>
                <MaterialCommunityIcons name="translate" size={20} color={brand.label} />
                <View style={styles.languageSegment}>
                  <SettingsSegmented
                    label={t('Idioma')}
                    options={LANGUAGE_SHORT_OPTIONS}
                    value={controller.languagePreference}
                    onChange={controller.setLanguagePreference}
                  />
                </View>
              </View>
            ) : null}

            {isLast ? (
              <View style={styles.actions}>
                <BrandButton
                  label={t('Avistei uma pessoa — quero reportar')}
                  variant="orange"
                  onPress={controller.onboardingReport}
                  style={styles.tallButton}
                />
                <BrandButton
                  label={t('Quero cadastrar uma pessoa desaparecida')}
                  variant="outline"
                  onPress={controller.onboardingRegister}
                  style={styles.tallButton}
                />
                <BrandButton
                  label={t('Começar a usar')}
                  variant="blue"
                  onPress={controller.onboardingExplore}
                  style={styles.tallButton}
                />
              </View>
            ) : (
              <View style={styles.navRow}>
                {isFirst ? null : (
                  <View style={styles.navBack}>
                    <BrandButton
                      label={t('Voltar')}
                      variant="outline"
                      onPress={controller.onboardingBack}
                      style={styles.tallButton}
                    />
                  </View>
                )}
                <View style={styles.navNext}>
                  <BrandButton
                    label={isFirst ? t('Começar o passo a passo') : t('Próximo')}
                    variant="orange"
                    trailingIcon="arrow-right"
                    onPress={controller.onboardingContinue}
                    style={styles.tallButton}
                  />
                </View>
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function makeStyles(brand: BrandColors, isWide: boolean) {
  return StyleSheet.create({
    shell: {
      flex: 1,
      backgroundColor: isWide ? brand.overlay : brand.white,
      justifyContent: isWide ? 'center' : 'flex-start',
      alignItems: isWide ? 'center' : 'stretch',
      padding: isWide ? PageGutter : 0,
    },
    panel: {
      flex: isWide ? undefined : 1,
      width: '100%',
      maxWidth: isWide ? 520 : undefined,
      maxHeight: isWide ? 760 : undefined,
      backgroundColor: brand.white,
      borderRadius: isWide ? Radius.xl : 0,
      overflow: 'hidden',
      zIndex: 1,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 52,
      paddingHorizontal: PageGutter,
      paddingTop: 8,
    },
    progressText: {
      fontSize: 15,
      fontWeight: '700',
      color: brand.textMuted,
    },
    skip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      minHeight: 44,
      paddingHorizontal: 14,
      borderRadius: Radius.pill,
      borderWidth: 1.5,
      borderColor: brand.blue,
      backgroundColor: brand.surface,
    },
    skipPressed: {
      opacity: 0.8,
    },
    skipText: {
      fontSize: 16,
      fontWeight: '800',
      color: brand.blue,
    },
    progressBar: {
      flexDirection: 'row',
      gap: 6,
      paddingHorizontal: PageGutter,
      paddingTop: 10,
    },
    progressSegment: {
      flex: 1,
      height: 6,
      borderRadius: Radius.pill,
      backgroundColor: brand.divider,
    },
    progressSegmentDone: {
      backgroundColor: brand.orange,
    },
    scroll: {
      flex: isWide ? undefined : 1,
    },
    body: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: PageGutter,
      paddingVertical: 20,
    },
    stepContent: {
      alignItems: 'center',
      gap: 14,
    },
    title: {
      marginTop: 10,
      fontSize: 26,
      lineHeight: 32,
      fontWeight: '800',
      textAlign: 'center',
      color: brand.textDark,
      maxWidth: 420,
    },
    message: {
      fontSize: 18,
      lineHeight: 27,
      textAlign: 'center',
      color: brand.textMuted,
      maxWidth: 420,
    },
    footer: {
      paddingHorizontal: PageGutter,
      paddingBottom: 16,
      paddingTop: 8,
      gap: 14,
    },
    languageRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    languageSegment: {
      flex: 1,
      maxWidth: 320,
    },
    navRow: {
      flexDirection: 'row',
      gap: 12,
    },
    navBack: {
      flex: 1,
    },
    navNext: {
      flex: 2,
    },
    actions: {
      gap: 10,
    },
    tallButton: {
      height: 'auto',
      minHeight: 58,
      paddingVertical: 12,
    },
  });
}
