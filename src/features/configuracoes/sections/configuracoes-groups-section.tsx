import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { NexoraSignature } from '@/components/nexora-signature';
import {
  SettingsChoiceList,
  SettingsGroup,
  SettingsRow,
  SettingsSegmented,
} from '@/components/settings-list';
import type { ConfiguracoesController } from '@/features/configuracoes/configuracoes.controller';
import type { NotificationAvailability } from '@/features/configuracoes/use-notification-settings';
import { APPEARANCE_OPTIONS } from '@/lib/brand-theme';
import type { ShortcutAvailability } from '@/lib/emergency-shortcut';
import { useT } from '@/lib/i18n';
import { msg } from '@/lib/i18n-msg';
import { NEARBY_RADIUS_OPTIONS } from '@/lib/notification-prefs';

type Props = { controller: ConfiguracoesController };

const SHORTCUT_UNAVAILABLE_TEXT: Record<ShortcutAvailability, string> = {
  available: '',
  'android-only': msg('Disponível no aplicativo Android.'),
  'needs-update': msg('Atualize o Encontra-me para usar este recurso.'),
  unsupported: msg('Requer Android 7.1 ou mais recente.'),
};

const NOTIFICATION_UNAVAILABLE_TEXT: Record<NotificationAvailability, string> = {
  available: '',
  web: msg('Disponível só no aplicativo de celular.'),
  'needs-update': msg('Atualize o Encontra-me para usar este recurso.'),
};

type RemoteNotificationRowProps = {
  controller: ConfiguracoesController;
  icon: ComponentProps<typeof SettingsRow>['icon'];
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

/** Aviso que depende do servidor: "Em breve" sem a flag, login antes de ligar. */
function RemoteNotificationRow({ controller: c, icon, label, description, value, onChange }: RemoteNotificationRowProps) {
  const t = useT();

  if (!c.pushEnabled) {
    return <SettingsRow icon={icon} label={label} unavailable />;
  }
  if (c.notificationAvailability !== 'available') {
    return (
      <SettingsRow
        icon={icon}
        label={label}
        description={t(NOTIFICATION_UNAVAILABLE_TEXT[c.notificationAvailability])}
        disabled
      />
    );
  }
  if (!c.loggedIn) {
    return (
      <SettingsRow icon={icon} label={label} description={t('Entre na sua conta para ativar.')} onPress={c.goToLogin} />
    );
  }
  return (
    <SettingsRow
      icon={icon}
      label={label}
      description={description}
      switchValue={value}
      onSwitchChange={onChange}
      disabled={c.notificationPrefs == null || c.notificationBusy}
    />
  );
}

export function ConfiguracoesGroupsSection({ controller: c }: Props) {
  const t = useT();

  return (
    <View style={styles.wrap}>
      <SettingsGroup title={t('Minha conta')}>
        {c.loggedIn && c.user ? (
          <>
            <SettingsRow
              icon="account-circle-outline"
              label={c.user.name}
              description={c.user.email}
              onPress={c.goToProfile}
            />
            <SettingsRow
              icon="account-edit-outline"
              label={t('Editar perfil e foto')}
              description={t('Depende de atualização da API.')}
              unavailable
            />
            <SettingsRow
              icon="lock-reset"
              label={t('Alterar ou recuperar senha')}
              description={t('Enquanto não está no app, peça pela Central de Ajuda.')}
              unavailable
            />
            <SettingsRow
              icon="logout"
              label={c.signingOut ? t('Saindo…') : t('Sair da conta')}
              onPress={c.logout}
              disabled={c.signingOut}
              danger
            />
            <SettingsRow
              icon="account-remove-outline"
              label={t('Excluir minha conta')}
              description={t('Apaga a conta e os dados pessoais ligados a ela.')}
              onPress={c.requestAccountDeletion}
              danger
            />
          </>
        ) : (
          <SettingsRow
            icon="login"
            label={t('Entrar ou criar conta')}
            description={t('Necessário para enviar cadastros e avistamentos.')}
            onPress={c.goToLogin}
          />
        )}
      </SettingsGroup>

      <SettingsGroup
        title={t('Emergência')}
        footer={t('O atalho abre direto a tela "Pedir ajuda". Nada liga ou é enviado sozinho: você toca no número ou confirma o envio da mensagem. Ligar para 190, 180 ou 100 e mandar sua localização nunca exigem login.')}
      >
        <SettingsRow
          icon="alarm-light"
          label={t('Alerta de emergência')}
          description={t('Contagem de 10 segundos para cancelar; depois abre o 190.')}
          onPress={c.goToEmergencyAlert}
        />
        <SettingsRow
          icon="account-multiple-check-outline"
          label={t('Contatos de confiança')}
          description={
            c.trustedContactsCount == null
              ? t('Para quem mandar sua localização com um toque.')
              : c.trustedContactsCount === 0
                ? t('Nenhum contato ainda. Cadastre até 5.')
                : c.trustedContactsCount === 1
                  ? t('1 contato salvo neste aparelho.')
                  : t('{count} contatos salvos neste aparelho.', { count: c.trustedContactsCount })
          }
          onPress={c.goToTrustedContacts}
        />
        <SettingsRow
          icon="map-marker-account-outline"
          label={t('Compartilhar minha localização')}
          description={t('Por WhatsApp, SMS ou outro aplicativo.')}
          onPress={c.goToShareLocation}
        />
        {c.shortcutAvailability !== 'available' ? (
          <SettingsRow
            icon="alarm-light-outline"
            label={t('Atalho na tela inicial')}
            description={t(SHORTCUT_UNAVAILABLE_TEXT[c.shortcutAvailability])}
            disabled
          />
        ) : c.loggedIn || c.shortcutEnabled ? (
          <SettingsRow
            icon="alarm-light-outline"
            label={t('Atalho na tela inicial')}
            description={
              c.shortcutEnabled
                ? t('Ativado neste celular.')
                : t('Peça ajuda sem precisar abrir o app.')
            }
            switchValue={c.shortcutEnabled}
            onSwitchChange={c.toggleEmergencyShortcut}
            disabled={c.shortcutBusy}
          />
        ) : (
          <SettingsRow
            icon="alarm-light-outline"
            label={t('Atalho na tela inicial')}
            description={t('Entre na sua conta para ativar.')}
            onPress={c.goToLogin}
          />
        )}
        {c.shortcutAvailability === 'available' && c.shortcutEnabled && c.shortcutPinSupported ? (
          <SettingsRow
            icon="cellphone-arrow-down"
            label={t('Adicionar à tela inicial')}
            description={t('Coloca o ícone vermelho "Pedir ajuda" ao lado dos seus apps.')}
            onPress={c.pinEmergencyShortcut}
          />
        ) : null}
        <SettingsRow icon="help-circle-outline" label={t('Como funciona')} onPress={c.goToEmergencyHelp} />
      </SettingsGroup>

      <SettingsGroup
        title={t('Notificações')}
        footer={
          c.pushEnabled
            ? t('Os avisos são um apoio e podem atrasar ou não chegar. O Encontra-me não avisa a polícia: em emergência, ligue 190. Na tela bloqueada, a notificação não mostra nome nem foto.')
            : t('Por enquanto, o Encontra-me só envia o lembrete de cadastros salvos neste aparelho. Os avisos de casos ainda não foram lançados.')
        }
      >
        {c.notificationsBlocked ? (
          <SettingsRow
            icon="bell-off-outline"
            label={t('Notificações bloqueadas no celular')}
            description={t('Toque para abrir os ajustes e permitir.')}
            onPress={c.openDeviceSettings}
          />
        ) : null}
        <SettingsRow
          icon="file-clock-outline"
          label={t('Lembrete de cadastros salvos')}
          description={
            c.notificationAvailability === 'available'
              ? t('Uma vez por dia, às 19h, enquanto houver cadastro feito neste aparelho aguardando envio.')
              : t(NOTIFICATION_UNAVAILABLE_TEXT[c.notificationAvailability])
          }
          switchValue={c.notificationPrefs?.pendingReminder ?? false}
          onSwitchChange={c.togglePendingReminder}
          disabled={c.notificationAvailability !== 'available' || c.notificationPrefs == null || c.notificationBusy}
        />
        <RemoteNotificationRow
          controller={c}
          icon="map-marker-radius-outline"
          label={t('Casos perto de mim')}
          description={t('Novos casos perto da sua região aproximada. Usa a localização só se você já permitiu.')}
          value={c.notificationPrefs?.nearbyCases ?? false}
          onChange={c.toggleNearbyCases}
        />
        {c.nearbyRadiusEnabled && c.notificationPrefs?.nearbyCases ? (
          <View style={styles.radius}>
            <SettingsSegmented
              label={t('Distância dos avisos de casos perto')}
              options={NEARBY_RADIUS_OPTIONS.map((km) => ({ value: String(km), label: `${km} km` }))}
              value={String(c.notificationPrefs.nearbyRadiusKm)}
              onChange={(value) => c.setNearbyRadius(Number(value))}
            />
          </View>
        ) : null}
        <RemoteNotificationRow
          controller={c}
          icon="bell-ring-outline"
          label={t('Novos cadastros da minha região')}
          description={t('Pessoas desaparecidas recém-cadastradas na sua cidade e estado.')}
          value={c.notificationPrefs?.regionNewCases ?? false}
          onChange={c.toggleRegionNewCases}
        />
        <RemoteNotificationRow
          controller={c}
          icon="update"
          label={t('Atualizações dos casos que acompanho')}
          description={t('Quando um caso que você acompanha muda de situação ou recebe avistamento.')}
          value={c.notificationPrefs?.followedUpdates ?? false}
          onChange={c.toggleFollowedUpdates}
        />
        <SettingsRow icon="map-marker-path" label={t('Rotas e círculo familiar')} unavailable />
      </SettingsGroup>

      <SettingsGroup
        title={t('Privacidade e localização')}
        footer={t('O app usa sua localização só enquanto está aberto, para mostrar casos próximos, marcar avistamentos e, quando você pede, mandar sua localização a um contato.')}
      >
        <SettingsRow
          icon="crosshairs-gps"
          label={t('Permissão de localização')}
          value={c.isWeb ? t('No navegador') : c.locationStatusLabel}
          description={
            c.isWeb
              ? t('No navegador, a permissão é controlada nas configurações do site.')
              : undefined
          }
        />
        {!c.isWeb ? (
          <SettingsRow
            icon="cellphone-cog"
            label={t('Abrir ajustes do aparelho')}
            description={t('Ligue ou desligue localização, câmera e fotos.')}
            onPress={c.openDeviceSettings}
          />
        ) : null}
        <SettingsRow
          icon="database-remove-outline"
          label={t('Cadastros salvos neste aparelho')}
          description={
            c.localPendingCount == null
              ? t('Não foi possível verificar.')
              : c.localPendingCount === 0
                ? t('Nenhum cadastro aguardando envio.')
                : t('{localPendingCount} aguardando envio. Toque para apagar.', { localPendingCount: c.localPendingCount })
          }
          onPress={c.localPendingCount ? c.deleteLocalPeople : undefined}
          danger={Boolean(c.localPendingCount)}
        />
        <SettingsRow
          icon="shield-account-outline"
          label={t('Como usamos seus dados')}
          description={t('Resumo no app. A política completa está no site.')}
          onPress={c.goToRules}
        />
        <SettingsRow
          icon="file-document-outline"
          label={t('Política de privacidade')}
          description={t('Texto completo, publicado no site.')}
          onPress={c.openPrivacyPolicy}
        />
      </SettingsGroup>

      <SettingsGroup title={t('Segurança')}>
        {c.biometricAvailable ? (
          <SettingsRow
            icon="fingerprint"
            label={c.biometricLabel}
            description={t('Pede sua digital ou rosto para abrir a conta neste celular.')}
            switchValue={c.biometricOn}
            onSwitchChange={c.toggleBiometric}
            disabled={c.biometricBusy || !c.loggedIn}
          />
        ) : (
          <SettingsRow
            icon="fingerprint"
            label={t('Entrar com biometria')}
            description={
              c.isWeb
                ? t('Disponível só no aplicativo de celular.')
                : t('Este aparelho não tem biometria cadastrada.')
            }
            disabled
          />
        )}
        <SettingsRow
          icon="alert-octagon-outline"
          label={t('Dicas contra golpes')}
          onPress={c.goToScamTips}
        />
        <SettingsRow icon="devices" label={t('Sessões ativas')} unavailable />
      </SettingsGroup>

      <SettingsGroup
        title={t('Idioma')}
        footer={t('Não são traduzidos: o que as pessoas escrevem nos casos e nas conversas e as respostas da Sofia. Os números de emergência continuam os do Brasil.')}
      >
        <SettingsChoiceList
          label={t('Idioma do app')}
          options={c.languageOptions}
          value={c.languagePreference}
          onChange={c.setLanguagePreference}
        />
      </SettingsGroup>

      <SettingsGroup
        title={t('Aparência e acessibilidade')}
        footer={t('Tema: Automático segue o modo claro ou escuro do celular. O tamanho do texto acompanha a configuração de fonte do aparelho.')}
      >
        <SettingsSegmented
          label={t('Tema')}
          options={APPEARANCE_OPTIONS}
          value={c.appearance}
          onChange={c.setAppearance}
        />
        <SettingsRow
          icon="palette-outline"
          label={t('Cores do chat da Sofia')}
          onPress={c.goToSofiaTheme}
        />
        <SettingsRow
          icon="school-outline"
          label={t('Ver o passo a passo de novo')}
          onPress={c.replayTutorial}
        />
      </SettingsGroup>

      <SettingsGroup title={t('Ajuda e informações')}>
        <SettingsRow icon="help-circle-outline" label={t('Ajuda e suporte')} onPress={c.goToHelp} />
        <SettingsRow
          icon="information-outline"
          label={t('Sobre o Encontra-me')}
          value={`v${c.version}`}
          onPress={c.goToSobre}
        />
        <SettingsRow
          icon="file-document-outline"
          label={t('Regras de uso e privacidade')}
          onPress={c.goToRules}
        />
      </SettingsGroup>

      <NexoraSignature style={styles.company} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 24,
  },
  company: {
    paddingTop: 4,
    paddingBottom: 8,
  },
  radius: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
});
