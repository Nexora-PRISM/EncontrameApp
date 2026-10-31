import { useMemo } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandButton } from '@/components/brand-button';
import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { type BrandColors } from '@/constants/brand';
import { useVerificarController } from '@/features/central/verificar.controller';
import { makeEquipeStyles } from '@/features/equipe/sections/equipe-styles';
import { VisionChip, VisionNotice } from '@/features/vision/sections/vision-common';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/** "/verificar-integridade" — confere arquivos de um pacote exportado com o manifesto SHA-256 (no próprio computador). */
export default function VerificarIntegridadePage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  const c = useVerificarController();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Verificar integridade')} onBack={c.goBack} />
          <Text style={s.text}>
            {t('Para quem recebeu um pacote do Encontra-me: confira se cada arquivo continua igual ao registrado no manifesto. O cálculo é feito neste computador; nada é enviado.')}
          </Text>
          <VisionNotice
            icon="information-outline"
            text={t('O SHA-256 permite conferir se cada arquivo continua igual ao que foi registrado. Ele não certifica, sozinho, a autenticidade ou a veracidade do conteúdo.')}
          />
          {!c.web ? (
            <VisionNotice icon="monitor" tone="attention" text={t('A verificação funciona na versão web do app, num computador.')} />
          ) : (
            <>
              <BrandButton label={t('1. Escolher o manifesto (manifesto-integridade.json)')} variant="outline" onPress={c.pickManifest} />
              {c.manifestError ? <Text style={styles.error}>{c.manifestError}</Text> : null}
              {c.manifest ? (
                <Text style={s.muted}>
                  {t('Manifesto do caso {id}, com {count} arquivos.', {
                    id: c.manifest.caseReference,
                    count: String(c.manifest.files.length),
                  })}
                </Text>
              ) : null}
              <BrandButton label={t('2. Escolher os arquivos para conferir')} variant="blue" loading={c.busy} onPress={c.pickToCheck} />
              {c.checked.map((item, index) => (
                <View key={`${item.name}-${index}`} style={s.card}>
                  <Text style={s.cardTitle}>{item.name}</Text>
                  {item.result ? (
                    <VisionChip
                      label={
                        item.result === 'ok'
                          ? t('Confere com o manifesto')
                          : item.result === 'changed'
                            ? t('Diferente do manifesto: o arquivo mudou')
                            : t('Não está no manifesto')
                      }
                      color={item.result === 'ok' ? brand.categoryAdult : brand.orangeText}
                    />
                  ) : (
                    <Text style={s.muted}>{t('Escolha o manifesto para comparar.')}</Text>
                  )}
                  <Text style={styles.hash} selectable>
                    SHA-256: {item.sha256}
                  </Text>
                </View>
              ))}
              {c.checked.length > 0 ? <BrandButton label={t('Limpar')} variant="outline" onPress={c.clear} /> : null}
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
    shell: { gap: 14 },
    error: { fontSize: 14, color: brand.error },
    hash: { fontSize: 12, color: brand.textDark, fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }) },
  });
}
