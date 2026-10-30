import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandButton } from '@/components/brand-button';
import { BrandCheckbox } from '@/components/brand-checkbox';
import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { Radius, type BrandColors } from '@/constants/brand';
import { useCentralApoioController } from '@/features/central-apoio/central-apoio.controller';
import { SUPPORT_CHECKLIST, SUPPORT_SECTIONS } from '@/features/central-apoio/support-content';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/** "/central-de-apoio" — Central de Apoio às Famílias (sem login, conteúdo no próprio app). */
export default function CentralApoioPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const c = useCentralApoioController();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Central de Apoio às Famílias')} onBack={c.goBack} />
          <Text style={styles.lead}>
            {t('Um passo de cada vez. Aqui está o que fazer, o que reunir e onde encontrar apoio.')}
          </Text>
          <BrandButton label={t('Cadastrar uma pessoa')} variant="orange" onPress={c.goToRegister} />

          {SUPPORT_SECTIONS.slice(0, 2).map((section) => (
            <View key={section.key} style={styles.card}>
              <View style={styles.cardHead}>
                <MaterialCommunityIcons name={section.icon} size={24} color={brand.blue} />
                <Text style={styles.cardTitle} accessibilityRole="header">
                  {t(section.title)}
                </Text>
              </View>
              {section.items.map((item) => (
                <Text key={item} style={styles.item}>
                  • {t(item)}
                </Text>
              ))}
            </View>
          ))}

          <View style={styles.card}>
            <View style={styles.cardHead}>
              <MaterialCommunityIcons name="clipboard-check-outline" size={24} color={brand.blue} />
              <Text style={styles.cardTitle} accessibilityRole="header">
                {t('O que reunir')}
              </Text>
            </View>
            {SUPPORT_CHECKLIST.map((item) => (
              <BrandCheckbox key={item.key} checked={c.checked.includes(item.key)} onToggle={() => c.toggle(item.key)} accessibilityLabel={t(item.label)}>
                {t(item.label)}
              </BrandCheckbox>
            ))}
            <Text style={styles.muted}>{t('As marcações ficam salvas só neste aparelho.')}</Text>
          </View>

          {SUPPORT_SECTIONS.slice(2).map((section) => (
            <View key={section.key} style={styles.card}>
              <View style={styles.cardHead}>
                <MaterialCommunityIcons name={section.icon} size={24} color={brand.blue} />
                <Text style={styles.cardTitle} accessibilityRole="header">
                  {t(section.title)}
                </Text>
              </View>
              {section.items.map((item) => (
                <Text key={item} style={styles.item}>
                  • {t(item)}
                </Text>
              ))}
            </View>
          ))}

          <View style={styles.card}>
            <View style={styles.cardHead}>
              <MaterialCommunityIcons name="heart-outline" size={24} color={brand.blue} />
              <Text style={styles.cardTitle} accessibilityRole="header">
                {t('Cuide de você')}
              </Text>
            </View>
            <Text style={styles.item}>{t('Você não precisa passar por isso sozinho. A Sofia conversa a qualquer hora (ela não substitui profissionais), e o grupo de apoio reúne pessoas que passam pela mesma situação.')}</Text>
            <BrandButton label={t('Falar com a Sofia')} variant="outline" onPress={c.goToSofia} />
            <BrandButton label={t('Grupo de apoio')} variant="outline" onPress={c.goToGroup} />
            <BrandButton label={t('Ligar para o CVV (188)')} variant="outline" trailingIcon="phone-outline" onPress={c.callCvv} />
            <Text style={styles.muted}>{t('O CVV atende 24 horas, de graça, para apoio emocional.')}</Text>
          </View>
        </ContentShell>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: brand.white },
    content: { flexGrow: 1, paddingTop: 8, paddingBottom: 32 },
    shell: { gap: 18 },
    lead: { fontSize: 17, lineHeight: 24, color: brand.textDark },
    card: { gap: 10, padding: 16, borderRadius: Radius.lg, borderWidth: 1, borderColor: brand.divider, backgroundColor: brand.surface },
    cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    cardTitle: { flex: 1, fontSize: 19, fontWeight: '800', color: brand.textDark },
    item: { fontSize: 16, lineHeight: 23, color: brand.textDark },
    muted: { fontSize: 14, lineHeight: 20, color: brand.textMuted },
  });
}
