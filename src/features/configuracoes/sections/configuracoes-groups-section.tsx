import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  SettingsChoiceList,
  SettingsGroup,
  SettingsRow,
  SettingsSegmented,
} from '@/components/settings-list';
import { type BrandColors } from '@/constants/brand';
import type { ConfiguracoesController } from '@/features/configuracoes/configuracoes.controller';
import { APPEARANCE_OPTIONS, useBrand } from '@/lib/brand-theme';
import type { ShortcutAvailability } from '@/lib/emergency-shortcut';
import { useT } from '@/lib/i18n';
import { msg } from '@/lib/i18n-msg';

type Props = { controller: ConfiguracoesController };

const SHORTCUT_UNAVAILABLE_TEXT: Record<ShortcutAvailability, string> = {
  available: '',
  'android-only': msg('Disponível no aplicativo Android.'),
  'needs-update': msg('Atualize o Encontra-me para usar este recurso.'),
  unsupported: msg('Requer Android 7.1 ou mais recente.'),
};

export function ConfiguracoesGroupsSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

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
              label={t('Solicitar exclusão da conta')}
              description={t('Abre seu e-mail com o pedido pronto para a equipe.')}
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
        footer={t('O Encontra-me ainda não envia notificações. Quando os alertas regionais forem lançados, você poderá escolher aqui o que receber.')}
      >
        <SettingsRow icon="bell-ring-outline" label={t('Alertas de desaparecimento')} unavailable />
        <SettingsRow icon="map-marker-radius-outline" label={t('Alertas da minha região')} unavailable />
        <SettingsRow icon="update" label={t('Atualizações dos casos que sigo')} unavailable />
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
          label={t('Ver a apresentação novamente')}
          onPress={c.replayTutorial}
        />
      </SettingsGroup>

      <SettingsGroup
        title={t('Premium')}
        footer={t('Busca de pessoas desaparecidas e funções de emergência são sempre grátis.')}
      >
        <SettingsRow
          icon="star-four-points-outline"
          label={t('Conhecer o Premium')}
          description={t('Grátis × Premium, preço e o que já está pronto.')}
          onPress={c.goToPremium}
        />
        <SettingsRow
          icon="star-circle-outline"
          label={t('Minha assinatura')}
          value={c.subscriptionLoading ? '…' : c.subscription.label}
          description={c.subscriptionLoading ? undefined : c.subscription.description}
        />
        {c.petsEnabled ? (
          <SettingsRow
            icon="paw"
            label={t('Pets desaparecidos')}
            description={t('Cadastre e divulgue animais de estimação perdidos.')}
            onPress={c.goToPets}
          />
        ) : (
          <SettingsRow
            icon="paw"
            label={t('Pets desaparecidos')}
            description={t('Cadastrar e divulgar animais de estimação perdidos.')}
            unavailable
          />
        )}
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

      <Text style={styles.company}>{c.companyLine}</Text>
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: {
      gap: 24,
    },
    company: {
      textAlign: 'center',
      fontSize: 13,
      color: brand.textMuted,
    },
  });
}
