import { Image } from 'expo-image';
import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandField } from '@/components/brand-field';
import { SettingsChoiceList, SettingsGroup, SettingsRow } from '@/components/settings-list';
import { Radius, type BrandColors } from '@/constants/brand';
import type { ApoiadorFormController } from '@/features/equipe/apoiador-form.controller';
import { makeEquipeStyles } from '@/features/equipe/sections/equipe-styles';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { SUPPORTER_CATEGORY_HINT, SUPPORTER_CATEGORY_LABEL } from '@/lib/supporter-labels';
import { SUPPORTER_CATEGORIES, SUPPORTER_NAME_MAX, SUPPORTER_NOTE_MAX } from '@/lib/supporter-rules';

type Props = { controller: ApoiadorFormController };

/** Formulário da equipe para cadastrar ou editar um apoiador. */
export function ApoiadorFormSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const shared = useMemo(() => makeEquipeStyles(brand), [brand]);
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const { form, errors } = c;

  if (!c.enabled) {
    return <Text style={shared.muted}>{t('Nossos apoiadores está desligado neste ambiente (EXPO_PUBLIC_ENABLE_SUPPORTERS).')}</Text>;
  }
  if (c.loading) return <ActivityIndicator size="large" color={brand.orange} />;
  if (c.notFound) return <Text style={shared.muted}>{t('Apoiador não encontrado.')}</Text>;

  const categoryOptions = SUPPORTER_CATEGORIES.map((category) => ({
    value: category as string,
    label: t(SUPPORTER_CATEGORY_LABEL[category]),
    description: t(SUPPORTER_CATEGORY_HINT[category]),
  }));

  return (
    <View style={styles.wrap}>
      <BrandField
        label={t('Nome da empresa ou organização')}
        value={form.name}
        onChangeText={c.setName}
        required
        maxLength={SUPPORTER_NAME_MAX}
        error={errors.name}
      />
      <BrandField
        label={t('Site oficial')}
        value={form.websiteUrl}
        onChangeText={c.setWebsite}
        placeholder="https://"
        keyboardType="url"
        autoCapitalize="none"
        maxLength={300}
        error={errors.websiteUrl}
      />

      <SettingsGroup title={t('Categoria')} footer={t('Serve só para organizar o reconhecimento. Não depende de valores.')}>
        <SettingsChoiceList label={t('Categoria')} options={categoryOptions} value={form.category} onChange={c.setCategory} />
      </SettingsGroup>
      {errors.category ? <Text style={styles.error}>{errors.category}</Text> : null}

      <View style={shared.section}>
        <Text style={shared.title} accessibilityRole="header">
          {t('Logotipo')}
        </Text>
        <View style={styles.logoRow}>
          <View style={styles.logoTile}>
            {c.logoLoading ? (
              <ActivityIndicator color={brand.orange} />
            ) : c.logoPreview ? (
              <Image
                source={{ uri: c.logoPreview }}
                style={styles.logo}
                contentFit="contain"
                accessibilityLabel={t('Logotipo de {name}', { name: form.name || t('Apoiador') })}
              />
            ) : (
              <Text style={styles.logoEmpty}>{t('Sem logotipo')}</Text>
            )}
          </View>
          <View style={styles.logoActions}>
            <BrandButton label={c.hasLogo ? t('Trocar logotipo') : t('Escolher logotipo')} variant="outline" onPress={c.pickLogo} />
            {c.hasLogo ? <BrandButton label={t('Remover logotipo')} variant="outline" onPress={c.removeLogo} /> : null}
          </View>
        </View>
        <Text style={shared.muted}>
          {t('PNG, JPG ou WebP, até 300 KB. Fundo transparente ou branco funciona melhor. Sem logotipo, o nome aparece no lugar.')}
        </Text>
        {errors.logo ? <Text style={styles.error}>{errors.logo}</Text> : null}
      </View>

      <SettingsGroup
        title={t('Autorização de uso da marca')}
        footer={t('Marque só com autorização por escrito da empresa para mostrar o nome e o logotipo no Encontra-me. Sem ela, a marca não é publicada.')}
      >
        <SettingsRow
          icon="file-sign"
          label={t('Autorização confirmada')}
          switchValue={form.authorizationConfirmed}
          onSwitchChange={c.setAuthorization}
        />
      </SettingsGroup>
      {errors.authorizationConfirmed ? <Text style={styles.error}>{errors.authorizationConfirmed}</Text> : null}
      <BrandField
        label={t('Onde está a autorização')}
        value={form.authorizationNote}
        onChangeText={c.setNote}
        placeholder={t('Ex.: contrato assinado, e-mail do responsável')}
        maxLength={SUPPORTER_NOTE_MAX}
        error={errors.authorizationNote}
      />

      <SettingsGroup title={t('Exibição')}>
        <SettingsRow
          icon="eye-outline"
          label={t('Publicar no app')}
          description={t('Aparece na página Nossos apoiadores.')}
          switchValue={form.isActive}
          onSwitchChange={c.setActive}
        />
        <SettingsRow
          icon="home-outline"
          label={t('Mostrar no Início e no Sobre')}
          description={t('Também aparece na seção resumida, no fim da lista do Início.')}
          switchValue={form.showOnHome}
          onSwitchChange={c.setShowOnHome}
          disabled={!form.isActive}
        />
      </SettingsGroup>

      <BrandButton label={c.isNew ? t('Cadastrar apoiador') : t('Salvar alterações')} variant="blue" loading={c.saving} onPress={c.save} />
      {!c.isNew ? (
        <BrandButton label={t('Excluir apoiador')} variant="outline" loading={c.deleting} onPress={c.remove} />
      ) : null}
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: { gap: 18 },
    error: { fontSize: 14, lineHeight: 20, color: brand.error },
    logoRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 14 },
    logoTile: {
      width: 180,
      aspectRatio: 3 / 2,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: brand.divider,
      backgroundColor: brand.logoTile,
      overflow: 'hidden',
    },
    logo: { width: '100%', height: '100%' },
    logoEmpty: { fontSize: 14, color: brand.onLogoTile },
    logoActions: { flexGrow: 1, gap: 10, minWidth: 180 },
  });
}
