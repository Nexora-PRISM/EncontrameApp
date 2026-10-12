import { Redirect } from 'expo-router';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandButton } from '@/components/brand-button';
import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { Radius, type BrandColors } from '@/constants/brand';
import { useCadastrarPetController } from '@/features/cadastrar-pet/cadastrar-pet.controller';
import { CadastrarPetFormSection } from '@/features/cadastrar-pet/sections/cadastrar-pet-form-section';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

export default function CadastrarPetPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const controller = useCadastrarPetController();

  if (!controller.enabled) {
    return <Redirect href="/inicio" />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ContentShell>
            <ScreenHeader title={t('Cadastrar pet')} onBack={controller.goBack} />
            <View style={styles.body}>
              {controller.premiumLoading ? (
                <ActivityIndicator color={brand.blue} style={styles.loading} />
              ) : controller.canRegister ? (
                <CadastrarPetFormSection controller={controller} />
              ) : (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>{t('Recurso Premium')}</Text>
                  <Text style={styles.cardBody}>
                    {t('Cadastrar e divulgar pets desaparecidos faz parte do plano Premium, que ainda não está disponível para assinatura.')}
                  </Text>
                  <BrandButton label={t('Conhecer o Premium')} onPress={controller.goToPremium} />
                  <BrandButton label={t('Voltar')} variant="outline" onPress={controller.goBack} />
                </View>
              )}
            </View>
          </ContentShell>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: brand.white,
    },
    flex: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      paddingTop: 8,
      paddingBottom: 32,
    },
    body: {
      marginTop: 16,
    },
    loading: {
      marginTop: 32,
    },
    card: {
      gap: 10,
      padding: 16,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: brand.textDark,
    },
    cardBody: {
      fontSize: 15,
      lineHeight: 22,
      color: brand.textMuted,
    },
  });
}
