import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandCheckbox } from '@/components/brand-checkbox';
import { BrandField } from '@/components/brand-field';
import { SettingsGroup, SettingsRow } from '@/components/settings-list';
import { type BrandColors } from '@/constants/brand';
import type { QueroAjudarController } from '@/features/quero-ajudar/quero-ajudar.controller';
import { useBrand } from '@/lib/brand-theme';
import { VOLUNTEER_WAYS, type VolunteerWay } from '@/lib/collaboration-rules';
import { useT } from '@/lib/i18n';
import { msg } from '@/lib/i18n-msg';

const WAY_LABEL: Record<VolunteerWay, string> = {
  share_posters: msg('Compartilhar cartazes oficiais'),
  share_campaigns: msg('Divulgar campanhas autorizadas'),
  report_sightings: msg('Informar avistamentos'),
  regional_alerts: msg('Receber alertas da minha região'),
  distribute_info: msg('Ajudar a distribuir informações'),
  support_actions: msg('Participar de ações de apoio autorizadas'),
  suggest_connections: msg('Sugerir regiões e conexões relevantes'),
};

/** Cadastro mínimo: região, formas de colaborar, disponibilidade (opcional) e alertas. */
export function QueroAjudarFormSection({ controller: c }: { controller: QueroAjudarController }) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  if (!c.enabled) {
    return (
      <SettingsGroup title={t('Cadastro de voluntário')}>
        <SettingsRow icon="hand-heart-outline" label={t('Cadastro de voluntário')} unavailable />
      </SettingsGroup>
    );
  }
  if (!c.loggedIn) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.text}>{t('Para se cadastrar como voluntário, entre na sua conta.')}</Text>
        <BrandButton label={t('Entrar na conta')} variant="blue" onPress={c.goToLogin} />
      </View>
    );
  }
  if (c.loading) return <ActivityIndicator size="large" color={brand.orange} />;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title} accessibilityRole="header">
        {c.isVolunteer ? t('Seu cadastro de voluntário') : t('Quero me cadastrar')}
      </Text>
      <BrandField
        label={t('Cidade ou bairro onde pode ajudar')}
        value={c.region}
        onChangeText={c.setRegion}
        placeholder={t('Ex.: Contagem')}
        required
        maxLength={80}
        error={c.errors.includes('region') ? t('Informe a cidade ou o bairro.') : undefined}
      />
      <Text style={styles.label}>{t('Como você quer ajudar?')}</Text>
      {VOLUNTEER_WAYS.map((way) => (
        <BrandCheckbox key={way} checked={c.ways.includes(way)} onToggle={() => c.toggleWay(way)} accessibilityLabel={t(WAY_LABEL[way])}>
          {t(WAY_LABEL[way])}
        </BrandCheckbox>
      ))}
      {c.errors.includes('ways') ? <Text style={styles.error}>{t('Escolha pelo menos uma forma de ajudar.')}</Text> : null}
      <BrandField
        label={t('Quando você costuma ter tempo (opcional)')}
        value={c.availability}
        onChangeText={c.setAvailability}
        placeholder={t('Ex.: fins de semana')}
        maxLength={80}
      />
      <SettingsGroup title={t('Avisos')}>
        <SettingsRow
          icon="bell-outline"
          label={t('Receber pedidos de ajuda da minha região')}
          switchValue={c.alerts}
          onSwitchChange={c.setAlerts}
        />
      </SettingsGroup>
      <BrandCheckbox
        checked={c.accepted}
        onToggle={c.toggleAccepted}
        error={c.errors.includes('guidelines') ? t('Confirme que vai seguir as orientações.') : undefined}
        accessibilityLabel={t('Li e vou seguir as orientações de segurança')}
      >
        {t('Li e vou seguir as orientações de segurança')}
      </BrandCheckbox>
      {c.message ? <Text style={styles.message}>{c.message}</Text> : null}
      <BrandButton label={c.isVolunteer ? t('Salvar alterações') : t('Quero ajudar')} variant="orange" loading={c.saving} onPress={c.save} />
      {c.isVolunteer ? <BrandButton label={t('Sair do voluntariado')} variant="outline" onPress={c.leave} /> : null}
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: { gap: 14 },
    title: { fontSize: 19, fontWeight: '800', color: brand.textDark },
    label: { fontSize: 16, fontWeight: '700', color: brand.textDark },
    text: { fontSize: 16, lineHeight: 23, color: brand.textMuted },
    error: { fontSize: 14, fontWeight: '600', color: brand.error },
    message: { fontSize: 16, lineHeight: 23, fontWeight: '700', color: brand.navy },
  });
}
