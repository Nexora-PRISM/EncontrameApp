import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandButton } from '@/components/brand-button';
import { BrandField } from '@/components/brand-field';
import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { SettingsGroup, SettingsRow } from '@/components/settings-list';
import { type BrandColors } from '@/constants/brand';
import { useSugerirRegiaoController } from '@/features/sugerir-regiao/sugerir-regiao.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/** "/pessoa/[id]/sugerir-regiao" — sugerir uma região para divulgar o caso (rede de busca). */
export default function SugerirRegiaoPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const c = useSugerirRegiaoController();
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Sugerir onde divulgar')} onBack={c.goBack} />
          {!c.enabled ? (
            <SettingsGroup title={t('Sugerir onde divulgar')}>
              <SettingsRow icon="map-marker-plus-outline" label={t('Sugerir onde divulgar')} unavailable />
            </SettingsGroup>
          ) : (
            <>
              {c.name ? <Text style={styles.caseLine}>{t('Caso: {name} · nº {id}', { name: c.name, id: c.id })}</Text> : null}
              <Text style={styles.lead}>
                {t('Conhece um lugar onde vale divulgar este caso? Conte qual e por quê. A equipe analisa antes de ampliar a divulgação.')}
              </Text>
              <BrandField
                label={t('Cidade ou bairro')}
                value={c.place}
                onChangeText={c.setPlace}
                placeholder={t('Ex.: Betim')}
                required
                maxLength={80}
                error={c.errors.includes('place') ? t('Informe a cidade ou o bairro.') : undefined}
              />
              <BrandField
                label={t('Por que essa região?')}
                value={c.reason}
                onChangeText={c.setReason}
                placeholder={t('Ex.: ela tem parentes lá e costumava visitar.')}
                required
                multiline
                maxLength={300}
                error={c.errors.includes('reason') ? t('Escreva pelo menos 10 letras.') : undefined}
              />
              <Text style={styles.muted}>{t('Não informe endereço de casa nem dados de outras pessoas.')}</Text>
              {c.message ? <Text style={styles.message}>{c.message}</Text> : null}
              {c.done ? (
                <BrandButton label={t('Voltar para o caso')} variant="outline" onPress={c.backToCase} />
              ) : (
                <BrandButton label={t('Enviar sugestão')} variant="orange" loading={c.sending} onPress={c.submit} />
              )}
            </>
          )}
        </ContentShell>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: brand.white },
    content: { flexGrow: 1, paddingTop: 8, paddingBottom: 32 },
    shell: { gap: 16 },
    caseLine: { fontSize: 16, fontWeight: '700', color: brand.textDark },
    lead: { fontSize: 16, lineHeight: 23, color: brand.textDark },
    muted: { fontSize: 14, lineHeight: 20, color: brand.textMuted },
    message: { fontSize: 16, lineHeight: 23, fontWeight: '700', color: brand.navy },
  });
}
