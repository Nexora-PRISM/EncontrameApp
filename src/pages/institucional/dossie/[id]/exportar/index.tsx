import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandButton } from '@/components/brand-button';
import { BrandCheckbox } from '@/components/brand-checkbox';
import { BrandField } from '@/components/brand-field';
import { BrandSelect } from '@/components/brand-select';
import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { SettingsChoiceList, SettingsGroup } from '@/components/settings-list';
import { Radius, type BrandColors } from '@/constants/brand';
import { type Delivery, useExportarController } from '@/features/central/exportar.controller';
import { DemoBanner } from '@/features/equipe/sections/equipe-access-section';
import { makeEquipeStyles } from '@/features/equipe/sections/equipe-styles';
import { VisionChip, VisionNotice, VisionState } from '@/features/vision/sections/vision-common';
import { useBrand } from '@/lib/brand-theme';
import { EXPORT_ERROR_LABEL, SENSITIVITY_LABEL } from '@/lib/central-labels';
import type { ExportError } from '@/lib/central-rules';
import { useT } from '@/lib/i18n';

/** "/institucional/dossie/[id]/exportar" — EXPORTAR DOSSIÊ PARA AUTORIDADES (revisão, proteção e entrega). */
export default function ExportarPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  const c = useExportarController();
  const f = c.fields;
  const error = (key: ExportError) => (c.errors.includes(key) ? t(EXPORT_ERROR_LABEL[key]) : undefined);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Exportar dossiê para autoridades')} onBack={c.goBack} />
          {!c.enabled ? (
            <VisionState empty={t('A Central de Inteligência ainda não está disponível.')} />
          ) : c.checking ? (
            <VisionState loading />
          ) : !c.allowed || !c.dossier ? (
            <VisionState empty={t('Só a administração institucional exporta dossiês.')} />
          ) : c.result ? (
            <View style={styles.result} accessibilityRole="summary">
              <Text style={s.title}>{t('Pacote gerado e exportação registrada')}</Text>
              <Text style={s.text}>{t('Registro: {id} em {date}', { id: c.result.exportId, date: c.format.dateTime(c.result.receivedAt) })}</Text>
              {c.result.simulated ? <Text style={s.muted}>{t('Modo de demonstração: o registro é fictício e fica só neste aparelho.')}</Text> : null}
              <Text style={s.text}>{t('Arquivo: {name} ({count} arquivos dentro)', { name: c.result.fileName, count: String(c.result.fileCount) })}</Text>
              <Text style={styles.hash} selectable>
                {t('SHA-256 do manifesto: {hash}', { hash: c.result.manifestSha256 })}
              </Text>
              {c.result.password ? (
                <View style={styles.password}>
                  <Text style={s.cardTitle}>{t('Senha do pacote (mostrada só agora)')}</Text>
                  <Text style={styles.passwordText} selectable>
                    {c.result.password}
                  </Text>
                  <Text style={s.text}>
                    {t('Envie a senha por outro canal (telefone ou mensagem separada), nunca junto com o arquivo. O destinatário abre o arquivo .html no navegador e digita a senha.')}
                  </Text>
                </View>
              ) : null}
              {c.result.delivery === 'print' ? (
                <Text style={s.text}>{t('O relatório abriu numa nova janela: escolha "Salvar como PDF" na impressão.')}</Text>
              ) : null}
              <VisionNotice icon="send-lock-outline" text={t('Nada foi enviado automaticamente. Entregue o arquivo pelo canal combinado com a autoridade.')} />
              <Text style={s.muted}>
                {t('O SHA-256 permite conferir se cada arquivo continua igual ao que foi registrado. Ele não certifica, sozinho, a autenticidade ou a veracidade do conteúdo.')}
              </Text>
              <BrandButton label={t('Baixar o manifesto (texto)')} variant="outline" onPress={c.downloadManifest} />
              <BrandButton label={t('Gerar outro pacote')} variant="outline" onPress={c.reset} />
              <BrandButton label={t('Voltar ao dossiê')} variant="blue" onPress={c.goBack} />
            </View>
          ) : (
            <>
              {c.demo ? <DemoBanner /> : null}
              {!c.mfa ? (
                <VisionNotice icon="two-factor-authentication" tone="attention" text={t('Exportar exige o segundo fator confirmado nesta sessão.')} />
              ) : null}
              {!c.web ? (
                <VisionNotice icon="monitor" tone="attention" text={t('A geração do pacote funciona na versão web do app, num computador. Aqui dá para revisar a seleção.')} />
              ) : null}
              <Text style={s.title} accessibilityRole="header">
                {t('1. O que vai no pacote')}
              </Text>
              <Text style={s.muted}>
                {t('Começa com a opção mais protetora: identidade de testemunhas e documentos sigilosos ficam de fora, e dados pessoais (CPF, telefone, e-mail, CEP, placa) são ocultados nos textos. Nomes não são detectados: revise.')}
              </Text>
              {c.items.map((item) => {
                const choice = c.selection[item.id];
                const sensitive = item.sensitivity === 'witness_identity' || item.sensitivity === 'confidential';
                return (
                  <View key={item.id} style={s.card}>
                    <BrandCheckbox checked={!!choice?.include} onToggle={() => c.toggleInclude(item.id)} accessibilityLabel={item.label}>
                      {item.label}
                    </BrandCheckbox>
                    <View style={s.row}>
                      <VisionChip label={t(SENSITIVITY_LABEL[item.sensitivity])} color={sensitive ? brand.orangeText : brand.textMuted} />
                    </View>
                    {choice?.include && c.redactable(item.id) ? (
                      <BrandCheckbox
                        checked={!!choice.redact}
                        onToggle={() => c.toggleRedact(item.id)}
                        accessibilityLabel={t('Ocultar dados pessoais')}
                      >
                        {t('Ocultar dados pessoais (gera cópia controlada; o original não muda)')}
                      </BrandCheckbox>
                    ) : null}
                  </View>
                );
              })}
              {error('empty') ? <Text style={styles.error}>{error('empty')}</Text> : null}

              <Text style={s.title} accessibilityRole="header">
                {t('2. Para quem e por quê')}
              </Text>
              <BrandField label={t('Finalidade')} value={f.purpose} onChangeText={c.setPurpose} maxLength={500} multiline required error={error('purpose')} />
              <BrandSelect label={t('Fundamento')} value={f.legalBasis} options={c.legalBasisOptions} onSelect={c.setLegalBasis} />
              {error('legal_basis') ? <Text style={styles.error}>{error('legal_basis')}</Text> : null}
              <BrandField label={t('Instituição destinatária')} value={f.institution} onChangeText={c.setInstitution} required />
              <BrandField label={t('Nome de quem recebe')} value={f.recipientName} onChangeText={c.setRecipientName} required error={error('recipient')} />
              <BrandField
                label={t('E-mail institucional de quem recebe')}
                value={f.email}
                onChangeText={c.setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                required
                error={error('recipient_email')}
              />
              <BrandCheckbox
                checked={f.recipientConfirmed}
                onToggle={c.toggleRecipientConfirmed}
                accessibilityLabel={t('Destinatário confirmado por canal oficial')}
                error={error('recipient_confirmed')}
              >
                {t('Confirmei o destinatário por canal oficial (telefone do órgão, ofício ou sistema da instituição).')}
              </BrandCheckbox>

              <Text style={s.title} accessibilityRole="header">
                {t('3. Quem autoriza')}
              </Text>
              {c.secondNeeded ? (
                <VisionNotice
                  icon="account-multiple-check-outline"
                  tone="attention"
                  text={t('Você incluiu identidade de testemunha ou documento sigiloso: a exportação precisa da autorização de outra pessoa da administração.')}
                />
              ) : null}
              <SettingsGroup title={t('Autorizado por')}>
                <SettingsChoiceList<'self' | 'second'>
                  label={t('Autorizado por')}
                  value={f.authorizer}
                  onChange={c.setAuthorizer}
                  options={c.authorizerOptions}
                />
              </SettingsGroup>
              {error('second_approval') ? <Text style={styles.error}>{error('second_approval')}</Text> : null}
              {error('authorizer') ? <Text style={styles.error}>{error('authorizer')}</Text> : null}

              <Text style={s.title} accessibilityRole="header">
                {t('4. Como entregar')}
              </Text>
              <SettingsGroup title={t('Formato da entrega')}>
                <SettingsChoiceList<Delivery>
                  label={t('Formato da entrega')}
                  value={f.delivery}
                  onChange={c.setDelivery}
                  options={[
                    {
                      value: 'encrypted_package',
                      label: t('Pacote criptografado (recomendado)'),
                      description: t('Arquivo .html protegido por senha (AES-256). A senha aparece uma vez e vai por outro canal.'),
                    },
                    {
                      value: 'download',
                      label: t('Baixar o ZIP sem senha'),
                      description: t('Relatórios, anexos, índice e manifesto SHA-256. Use só em canal seguro.'),
                    },
                    {
                      value: 'print',
                      label: t('Relatório institucional em PDF'),
                      description: t('Abre o relatório para imprimir ou salvar em PDF.'),
                    },
                  ]}
                />
              </SettingsGroup>
              <Text style={s.muted}>
                {t('Link seguro com prazo, autenticação e revogação: depois de registrar, no histórico do dossiê (precisa da API).')}
              </Text>
              <BrandButton label={t('Gerar e registrar a exportação')} variant="blue" loading={c.working} onPress={c.generate} />
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
    result: {
      gap: 12,
      padding: 16,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: brand.divider,
      backgroundColor: brand.surface,
    },
    hash: { fontSize: 13, color: brand.textDark },
    password: { gap: 8, padding: 12, borderRadius: Radius.md, backgroundColor: brand.attentionSoft },
    passwordText: { fontSize: 24, fontWeight: '900', letterSpacing: 1, color: brand.navy },
  });
}
