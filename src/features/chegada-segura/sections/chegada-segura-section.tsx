import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandField } from '@/components/brand-field';
import { SettingsSegmented } from '@/components/settings-list';
import { Radius, type BrandColors } from '@/constants/brand';
import type { ChegadaSeguraController } from '@/features/chegada-segura/chegada-segura.controller';
import { LocationShareSection } from '@/features/compartilhar-localizacao/sections/location-share-section';
import { useLocationShare } from '@/features/compartilhar-localizacao/use-location-share';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

type Props = { controller: ChegadaSeguraController };

export function ChegadaSeguraSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  if (!c.loaded) return <ActivityIndicator size="large" color={brand.orange} />;

  return (
    <View style={styles.wrap}>
      <View style={styles.notice} accessible accessibilityRole="summary">
        <MaterialCommunityIcons name="shield-check-outline" size={24} color={brand.blue} />
        <Text style={styles.noticeText}>
          {t('O Encontra-me não acompanha você pelo mapa e não avisa ninguém sozinho. No horário, o app pergunta se você chegou. Se não chegou, você escolhe mandar a sua localização daquele momento.')}
        </Text>
      </View>

      {c.phase === 'none' ? <StartBlock controller={c} styles={styles} /> : null}
      {c.phase === 'running' ? <RunningBlock controller={c} styles={styles} /> : null}
      {c.phase === 'overdue' ? <OverdueBlock controller={c} styles={styles} /> : null}
    </View>
  );
}

function StartBlock({ controller: c, styles }: { controller: ChegadaSeguraController; styles: ReturnType<typeof makeStyles> }) {
  const t = useT();
  return (
    <View style={styles.block}>
      <BrandField
        label={t('Para onde você vai? (opcional)')}
        value={c.destination}
        onChangeText={c.setDestination}
        placeholder={t('Ex.: casa, faculdade, trabalho')}
        maxLength={c.destinationMax}
      />
      <Text style={styles.label}>{t('Em quanto tempo você espera chegar?')}</Text>
      <SettingsSegmented label={t('Em quanto tempo você espera chegar?')} options={c.durationOptions} value={c.minutes} onChange={c.setMinutes} />
      <Text style={styles.muted}>
        {c.contacts.length > 0
          ? t('Seus contatos de confiança: {names}.', { names: c.contacts.map((contact) => contact.name).join(', ') })
          : t('Você ainda não tem contatos de confiança. Cadastre alguém para avisar mais rápido, se precisar.')}
      </Text>
      <BrandButton label={t('Contatos de confiança')} variant="outline" onPress={c.goToContacts} />
      <Text style={styles.muted}>{t('Dica: combine com alguém antes de sair e diga que vai usar a chegada segura.')}</Text>
      <BrandButton label={t('Começar')} variant="blue" loading={c.busy} onPress={c.start} />
    </View>
  );
}

function RunningBlock({ controller: c, styles }: { controller: ChegadaSeguraController; styles: ReturnType<typeof makeStyles> }) {
  const t = useT();
  return (
    <View style={styles.block}>
      <View style={styles.timer} accessible accessibilityLabel={t('Faltam {time}. Chegada combinada para {clock}.', { time: c.remaining, clock: c.deadlineClock })}>
        <Text style={styles.timerLabel}>{t('Faltam')}</Text>
        <Text style={styles.timerValue}>{c.remaining}</Text>
        <Text style={styles.muted}>
          {c.check?.destination
            ? t('Chegada em {place} combinada para {clock}', { place: c.check.destination, clock: c.deadlineClock })
            : t('Chegada combinada para {clock}', { clock: c.deadlineClock })}
        </Text>
      </View>
      {c.reminder === 'scheduled' ? (
        <Text style={styles.muted}>{t('Às {clock}, uma notificação pergunta se você chegou.', { clock: c.deadlineClock })}</Text>
      ) : c.reminder === 'denied' || c.reminder === 'unsupported' ? (
        <Text style={styles.warn}>{t('Sem notificação neste aparelho: volte ao app no horário combinado.')}</Text>
      ) : null}
      <BrandButton label={t('Cheguei bem')} variant="blue" loading={c.busy} onPress={c.arrived} />
      {c.canExtend ? <BrandButton label={t('Preciso de mais 15 minutos')} variant="outline" onPress={c.extend} /> : null}
      <BrandButton label={t('Pedir ajuda')} variant="outline" trailingIcon="phone-alert" onPress={c.goToHelp} />
      <BrandButton label={t('Encerrar')} variant="outline" onPress={c.stop} />
    </View>
  );
}

function OverdueBlock({ controller: c, styles }: { controller: ChegadaSeguraController; styles: ReturnType<typeof makeStyles> }) {
  const t = useT();
  return (
    <View style={styles.block}>
      <Text style={styles.title} accessibilityRole="header">
        {t('Você ainda não confirmou que chegou')}
      </Text>
      <Text style={styles.text}>{t('Se está tudo bem, toque em "Cheguei bem". Se precisar, avise alguém de confiança ou ligue 190.')}</Text>
      <BrandButton label={t('Cheguei bem')} variant="blue" loading={c.busy} onPress={c.arrived} />
      {c.canExtend ? <BrandButton label={t('Preciso de mais 15 minutos')} variant="outline" onPress={c.extend} /> : null}
      <BrandButton label={t('Ligar 190')} variant="outline" trailingIcon="phone" onPress={c.call190} />
      <ArrivalShareBlock />
    </View>
  );
}

/** Só aqui a posição é lida: no momento em que o horário passou e a tela está aberta. */
function ArrivalShareBlock() {
  const t = useT();
  const share = useLocationShare({ mode: 'arrival' });
  return <LocationShareSection share={share} title={t('Avisar alguém de confiança')} />;
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: { gap: 18 },
    notice: {
      flexDirection: 'row',
      gap: 12,
      padding: 14,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    noticeText: { flex: 1, fontSize: 14, lineHeight: 20, color: brand.textMuted },
    block: { gap: 12 },
    label: { fontSize: 14, fontWeight: '700', color: brand.label },
    muted: { fontSize: 14, lineHeight: 20, color: brand.textMuted },
    warn: { fontSize: 14, lineHeight: 20, fontWeight: '700', color: brand.orangeText },
    title: { fontSize: 20, fontWeight: '900', color: brand.textDark },
    text: { fontSize: 16, lineHeight: 23, color: brand.textDark },
    timer: {
      alignItems: 'center',
      gap: 4,
      paddingVertical: 22,
      borderRadius: Radius.xl,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    timerLabel: { fontSize: 15, fontWeight: '700', color: brand.textMuted },
    timerValue: { fontSize: 48, fontWeight: '900', color: brand.navy, fontVariant: ['tabular-nums'] },
  });
}
