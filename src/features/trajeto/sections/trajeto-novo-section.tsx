import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandCheckbox } from '@/components/brand-checkbox';
import { BrandField } from '@/components/brand-field';
import { BrandMap } from '@/components/brand-map';
import { SettingsGroup, SettingsRow, SettingsSegmented } from '@/components/settings-list';
import { Radius, type BrandColors } from '@/constants/brand';
import type { TrajetoNovoController } from '@/features/trajeto/trajeto-novo.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

type Props = { controller: TrajetoNovoController };

export function TrajetoNovoSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  if (!c.enabled) {
    return (
      <SettingsGroup title={t('Compartilhar meu trajeto')}>
        <SettingsRow icon="map-marker-path" label={t('Compartilhar meu trajeto')} unavailable />
      </SettingsGroup>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.block}>
        <BrandField
          label={t('De onde você sai?')}
          value={c.originLabel}
          onChangeText={c.setOriginLabel}
          placeholder={t('Ex.: trabalho, faculdade, casa de uma amiga')}
          maxLength={c.labelMax}
          error={c.errors.originLabel}
        />
        <BrandButton
          label={c.originMarked ? t('Localização atual marcada como partida') : t('Usar minha localização atual')}
          variant="outline"
          trailingIcon="crosshairs-gps"
          loading={c.locating === 'origin'}
          onPress={c.markCurrentLocation}
        />
      </View>

      <View style={styles.block}>
        <BrandField
          label={t('Para onde você vai?')}
          value={c.destinationLabel}
          onChangeText={c.setDestinationLabel}
          placeholder={t('Ex.: casa, ou um ponto de referência')}
          maxLength={c.labelMax}
          error={c.errors.destinationLabel}
        />
        <Text style={styles.hint}>{t('Não precisa do endereço completo. Um ponto de referência já ajuda seus contatos.')}</Text>
        {c.destination ? (
          <>
            <View style={styles.mapBox}>
              <BrandMap pins={[{ id: 'destination', latitude: c.destination.latitude, longitude: c.destination.longitude }]} rounded style={styles.map} />
            </View>
            <BrandButton label={t('Tirar o destino do mapa')} variant="outline" onPress={c.clearDestination} />
          </>
        ) : (
          <BrandButton
            label={t('Mostrar o destino no mapa (opcional)')}
            variant="outline"
            trailingIcon="map-search-outline"
            loading={c.locating === 'destination'}
            disabled={!c.canFindDestination}
            onPress={c.findDestination}
          />
        )}
      </View>

      <View style={styles.block}>
        <Text style={styles.label}>{t('Em quanto tempo você espera chegar?')}</Text>
        <SettingsSegmented label={t('Em quanto tempo você espera chegar?')} options={c.arrivalOptions} value={c.arrivalMinutes} onChange={c.setArrivalMinutes} />
        <Text style={styles.label}>{t('Tolerância antes de avisar seus contatos')}</Text>
        <SettingsSegmented label={t('Tolerância antes de avisar seus contatos')} options={c.toleranceOptions} value={c.toleranceMinutes} onChange={c.setToleranceMinutes} />
        <Text style={styles.hint}>
          {t('No horário previsto, o app pergunta se você chegou. Se você não confirmar até o fim da tolerância, seus contatos recebem um aviso de atraso com sua última localização.')}
        </Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.label}>{t('Quem vai acompanhar (até 5)')}</Text>
        {c.loadingContacts ? (
          <ActivityIndicator color={brand.orange} />
        ) : c.watchers.length === 0 ? (
          <>
            <Text style={styles.hint}>
              {t('Você ainda não tem contatos para acompanhar seus trajetos. Mande um convite: a pessoa aceita no app, com a conta dela.')}
            </Text>
            <BrandButton label={t('Convidar contatos')} variant="blue" trailingIcon="account-plus-outline" onPress={c.goToContacts} />
          </>
        ) : (
          <>
            {c.watchers.map((contact) => (
              <BrandCheckbox
                key={contact.id}
                checked={c.contactIds.includes(contact.id)}
                onToggle={() => c.toggleContact(contact.id)}
                accessibilityLabel={t('Compartilhar com {name}', { name: contact.name })}
              >
                <Text style={styles.option}>{contact.name}</Text>
              </BrandCheckbox>
            ))}
            {c.errors.contactIds ? <Text style={styles.error}>{c.errors.contactIds}</Text> : null}
            <BrandButton label={t('Convidar mais pessoas')} variant="outline" onPress={c.goToContacts} />
          </>
        )}
        {c.contactsError ? <Text style={styles.error}>{t('Não foi possível carregar seus contatos.')}</Text> : null}
      </View>

      <View style={styles.consent} accessible accessibilityRole="summary">
        <View style={styles.consentTop}>
          <MaterialCommunityIcons name="shield-check-outline" size={22} color={brand.blue} />
          <Text style={styles.consentTitle}>{t('Antes de começar')}</Text>
        </View>
        <Text style={styles.consentItem}>{t('• Só as pessoas marcadas acima veem sua localização, até você chegar, encerrar ou passar 12 horas.')}</Text>
        <Text style={styles.consentItem}>{t('• Sua localização nunca aparece para o público nem no mapa do Encontra-me.')}</Text>
        <Text style={styles.consentItem}>{t('• Se você não confirmar a chegada, elas recebem um aviso de atraso e podem acionar o Sinal de Alerta, que vai para a equipe do Encontra-me analisar. O app não chama a polícia sozinho.')}</Text>
        <Text style={styles.consentItem}>{t('• As posições são apagadas 24 horas depois do fim do trajeto. Se houver Sinal de Alerta, ficam guardadas por até 90 dias para a análise.')}</Text>
        <Text style={styles.consentItem}>{t('• Você pode encerrar a qualquer momento, e a localização para na hora.')}</Text>
        <BrandCheckbox
          checked={c.consent}
          onToggle={c.toggleConsent}
          accessibilityLabel={t('Entendi e quero compartilhar este trajeto')}
          error={c.errors.consent}
        >
          <Text style={styles.option}>{t('Entendi e quero compartilhar este trajeto')}</Text>
        </BrandCheckbox>
      </View>

      <BrandButton label={t('Começar a compartilhar')} variant="blue" trailingIcon="map-marker-path" loading={c.submitting} onPress={c.submit} />
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: { gap: 22 },
    block: { gap: 10 },
    label: { fontSize: 15, fontWeight: '800', color: brand.label },
    hint: { fontSize: 14, lineHeight: 20, color: brand.textMuted },
    option: { fontSize: 16, color: brand.textDark },
    error: { fontSize: 14, fontWeight: '700', color: brand.error },
    mapBox: { borderRadius: Radius.lg, overflow: 'hidden' },
    map: { height: 180 },
    consent: {
      gap: 8,
      padding: 14,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    consentTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    consentTitle: { fontSize: 17, fontWeight: '900', color: brand.textDark },
    consentItem: { fontSize: 14, lineHeight: 21, color: brand.textDark },
  });
}
