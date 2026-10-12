import { requireOptionalNativeModule } from 'expo';

/**
 * Módulo nativo local (só Android) do atalho "Pedir ajuda".
 * Código nativo em ./android — ligado automaticamente pelo autolinking do Expo
 * (pasta `modules/` na raiz do projeto). No web, no iOS e no Expo Go o módulo
 * não existe e o valor exportado é `null`.
 */
export type EmergencyShortcutNativeModule = {
  /** Android 7.1+ com ShortcutManager disponível. */
  isSupported(): boolean;
  /** O launcher aceita fixar atalhos na tela inicial (Android 8+). */
  isPinSupported(): boolean;
  /** Cria/atualiza o atalho no menu do ícone e reativa um atalho fixado. */
  enable(shortLabel: string, longLabel: string, uri: string): boolean;
  /** Pede ao Android para fixar o atalho na tela inicial (o sistema confirma com o usuário). */
  requestPin(shortLabel: string, longLabel: string, uri: string): boolean;
  /** Remove do menu e desativa um atalho já fixado, que passa a mostrar a mensagem. */
  disable(disabledMessage: string): boolean;
};

const EmergencyShortcut =
  requireOptionalNativeModule<EmergencyShortcutNativeModule>('EmergencyShortcut');

export default EmergencyShortcut;
