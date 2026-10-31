import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandButton } from '@/components/brand-button';
import { BrandCheckbox } from '@/components/brand-checkbox';
import { BrandField } from '@/components/brand-field';
import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { SettingsChoiceList, SettingsGroup } from '@/components/settings-list';
import { Radius, type BrandColors } from '@/constants/brand';
import { usePistaConfidencialController } from '@/features/central/pista-confidencial.controller';
import { VisionNotice as Notice, VisionState } from '@/features/vision/sections/vision-common';
import { useBrand } from '@/lib/brand-theme';
import { TIP_ERROR_LABEL } from '@/lib/central-labels';
import type { TipContactPreference, TipError } from '@/lib/central-rules';
import { useT } from '@/lib/i18n';

/** "/pista-confidencial" — informação confidencial: a identidade fica separada da pista e nunca aparece em público. */
export default function PistaConfidencialPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const c = usePistaConfidencialController();
  const f = c.fields;
  const error = (key: TipError) => (c.errors.includes(key) ? t(TIP_ERROR_LABEL[key]) : undefined);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Informação confidencial')} onBack={c.goBack} />
          {!c.enabled ? (
            <VisionState empty={t('O envio de informação confidencial ainda não está disponível. Em caso de emergência, ligue 190.')} />
          ) : c.receipt ? (
            <View style={styles.receipt} accessibilityRole="summary">
              <Text style={styles.receiptTitle}>{t('Informação recebida')}</Text>
              <Text style={styles.text}>
                {t('Número de protocolo: {id}', { id: c.receipt.id })}
              </Text>
              <Text style={styles.text}>
                {c.receipt.simulated
                  ? t('Modo de demonstração: nada foi enviado de verdade.')
                  : t('A equipe analisa antes de qualquer uso. Guarde o número de protocolo.')}
              </Text>
              <Text style={styles.muted}>
                {t('O app não avisa a polícia sozinho. Se houver risco agora, ligue 190.')}
              </Text>
              <BrandButton label={t('Enviar outra informação')} variant="outline" onPress={c.sendAnother} />
              <BrandButton label={t('Voltar')} variant="blue" onPress={c.goBack} />
            </View>
          ) : (
            <>
              <Notice
                icon="shield-lock-outline"
                tone="attention"
                text={t('Sua identidade nunca aparece na área pública e fica guardada separada da informação. Só pessoas autorizadas podem abri-la, e cada acesso fica registrado. Não é anonimato absoluto: o servidor guarda dados técnicos de acesso exigidos por lei, e a Justiça pode pedir esses dados.')}
              />
              {c.caseId ? <Text style={styles.muted}>{t('Sobre o caso {id}', { id: c.caseId })}</Text> : null}
              <BrandField
                label={t('O que você sabe')}
                value={f.text}
                onChangeText={c.setText}
                placeholder={t('Ex.: vi uma pessoa parecida perto do ponto de ônibus, por volta das 18h.')}
                maxLength={2000}
                multiline
                required
                error={error('text_short') ?? error('text_long')}
              />
              {c.personalDataInText ? (
                <Notice
                  icon="alert-outline"
                  text={t('Parece que o texto tem telefone, e-mail ou documento. Para sua proteção, use o campo de contato abaixo e tire esses dados do texto.')}
                />
              ) : null}
              <BrandField label={t('Quando aconteceu (opcional)')} value={f.when} onChangeText={c.setWhen} placeholder={t('Ex.: ontem, por volta das 18h')} maxLength={80} />
              <BrandField label={t('Onde (opcional)')} value={f.place} onChangeText={c.setPlace} placeholder={t('Ex.: praça perto da padaria')} maxLength={120} />
              <SettingsGroup title={t('A equipe pode falar com você?')}>
                <SettingsChoiceList<TipContactPreference>
                  label={t('A equipe pode falar com você?')}
                  value={f.preference}
                  onChange={c.setPreference}
                  options={c.preferenceOptions}
                />
              </SettingsGroup>
              {f.preference === 'phone' || f.preference === 'email' ? (
                <BrandField
                  label={f.preference === 'phone' ? t('Telefone') : t('E-mail')}
                  value={f.contact}
                  onChangeText={c.setContact}
                  keyboardType={f.preference === 'phone' ? 'phone-pad' : 'email-address'}
                  autoCapitalize="none"
                  required
                  error={error('contact')}
                />
              ) : null}
              {f.preference !== 'none' ? (
                <BrandField label={t('Como podemos chamar você (opcional)')} value={f.name} onChangeText={c.setName} maxLength={80} />
              ) : null}
              <BrandCheckbox
                checked={f.understood}
                onToggle={c.toggleUnderstood}
                accessibilityLabel={t('Li como funciona a confidencialidade')}
                error={error('understood')}
              >
                {t('Li como funciona a confidencialidade e entendo que informação falsa atrapalha a busca.')}
              </BrandCheckbox>
              {c.message ? <Text style={styles.message}>{c.message}</Text> : null}
              <BrandButton label={t('Enviar informação')} variant="orange" loading={c.sending} onPress={c.submit} />
              <Text style={styles.muted}>
                {t('Não vá atrás da pessoa nem de suspeitos. Se houver risco agora, ligue 190.')}
              </Text>
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
    text: { fontSize: 16, lineHeight: 23, color: brand.textDark },
    muted: { fontSize: 14, lineHeight: 20, color: brand.textMuted },
    message: { fontSize: 15, lineHeight: 21, color: brand.textDark },
    receipt: {
      gap: 12,
      padding: 16,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: brand.divider,
      backgroundColor: brand.surface,
    },
    receiptTitle: { fontSize: 20, fontWeight: '800', color: brand.textDark },
  });
}
