import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandField } from '@/components/brand-field';
import { SettingsGroup, SettingsRow } from '@/components/settings-list';
import { Radius, type BrandColors } from '@/constants/brand';
import type { TrajetoContatosController } from '@/features/trajeto/trajeto-contatos.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

type Props = { controller: TrajetoContatosController };

export function TrajetoContatosSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  if (!c.enabled) {
    return (
      <SettingsGroup title={t('Contatos e convites')}>
        <SettingsRow icon="account-heart-outline" label={t('Contatos e convites')} unavailable />
      </SettingsGroup>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.box}>
        <Text style={styles.title}>{t('Convidar alguém de confiança')}</Text>
        <Text style={styles.text}>
          {t('Mande o convite por WhatsApp ou SMS. A pessoa aceita no app, com a conta dela, e passa a poder ser escolhida quando você compartilhar um trajeto. Ela não vê nada até você escolher.')}
        </Text>
        <BrandButton label={t('Criar e enviar convite')} variant="blue" trailingIcon="share-variant" loading={c.creatingInvite} onPress={c.createInvite} />
        {c.invite ? (
          <View style={styles.code} accessible accessibilityLabel={t('Código do convite: {code}', { code: c.inviteCode })}>
            <Text style={styles.codeValue} selectable>
              {c.inviteCode}
            </Text>
            <Text style={styles.muted}>{c.inviteExpires}</Text>
            <BrandButton label={t('Enviar de novo')} variant="outline" onPress={c.shareInviteAgain} />
          </View>
        ) : null}
      </View>

      <View style={styles.box}>
        <Text style={styles.title}>{t('Recebeu um código?')}</Text>
        <BrandField label={t('Código do convite')} value={c.code} onChangeText={c.setCode} autoCapitalize="characters" placeholder="XXXX-XXXX-XXXX" error={c.codeError} />
        <BrandButton label={t('Ver convite')} variant="outline" onPress={c.openCode} />
      </View>

      {c.loading ? <ActivityIndicator size="large" color={brand.orange} /> : null}
      {c.error ? (
        <View style={styles.box}>
          <Text style={styles.text}>{t('Não foi possível carregar seus contatos. Confira sua conexão.')}</Text>
          <BrandButton label={t('Tentar de novo')} variant="outline" onPress={c.retry} />
        </View>
      ) : null}

      <SettingsGroup
        title={t('Quem acompanha meus trajetos')}
        footer={t('Você escolhe, a cada trajeto, quem vai acompanhar. Desfazer o vínculo tira o acesso na hora.')}
      >
        {c.watchers.length === 0 ? (
          <SettingsRow icon="account-off-outline" label={t('Ninguém ainda')} />
        ) : (
          c.watchers.map((contact) => (
            <SettingsRow
              key={contact.id}
              icon="account-heart-outline"
              label={contact.name}
              description={c.since(contact)}
              value={t('Desfazer')}
              onPress={() => c.removeWatcher(contact)}
            />
          ))
        )}
      </SettingsGroup>

      <SettingsGroup
        title={t('Quem compartilha comigo')}
        footer={t('Você só vê um trajeto quando a pessoa escolhe você. Pode desfazer o vínculo quando quiser.')}
      >
        {c.sharingWithMe.length === 0 ? (
          <SettingsRow icon="account-off-outline" label={t('Ninguém ainda')} />
        ) : (
          c.sharingWithMe.map((contact) => (
            <SettingsRow
              key={contact.id}
              icon="account-eye-outline"
              label={contact.name}
              description={c.since(contact)}
              value={t('Desfazer')}
              onPress={() => c.removeOwner(contact)}
            />
          ))
        )}
      </SettingsGroup>
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: { gap: 16 },
    box: {
      gap: 10,
      padding: 14,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    title: { fontSize: 17, fontWeight: '900', color: brand.textDark },
    text: { fontSize: 15, lineHeight: 22, color: brand.textDark },
    muted: { fontSize: 14, lineHeight: 20, color: brand.textMuted },
    code: { gap: 6, alignItems: 'center', paddingTop: 6 },
    codeValue: { fontSize: 26, fontWeight: '900', letterSpacing: 2, color: brand.navy, fontVariant: ['tabular-nums'] },
  });
}
