import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { tr } from '@/lib/i18n';
import { msg } from '@/lib/i18n-msg';
import { getLocalItem, setLocalItem } from '@/lib/local-store';

import EmergencyShortcut from '../../modules/emergency-shortcut';

/**
 * Atalho "Pedir ajuda" fora do app (tela inicial do Android).
 * Abre direto a rota /pedir-ajuda; ligar continua exigindo um toque no número.
 */
const ENABLED_KEY = 'encontrame.emergency.shortcutEnabled';
const SHORT_LABEL = msg('Pedir ajuda');
const LONG_LABEL = msg('Encontra-me: pedir ajuda');
const DISABLED_MESSAGE = msg('Atalho desativado. Para usar de novo, ative em Configurações no Encontra-me.');
const DEFAULT_SCHEME = 'encontrameapp';
export const EMERGENCY_ROUTE_PATH = 'pedir-ajuda';

export type ShortcutAvailability =
  /** Android com o recurso pronto para uso. */
  | 'available'
  /** Web ou iPhone: o atalho de tela inicial existe só no app Android. */
  | 'android-only'
  /** App instalado sem o módulo nativo (versão antiga ou Expo Go). */
  | 'needs-update'
  /** Android anterior ao 7.1. */
  | 'unsupported';

/**
 * Decide se o atalho pode ser oferecido, sem tocar no módulo nativo.
 * `supported === null` significa que a consulta ao Android falhou.
 */
export function resolveShortcutAvailability(input: {
  os: string;
  modulePresent: boolean;
  supported: boolean | null;
}): ShortcutAvailability {
  if (input.os !== 'android') return 'android-only';
  if (!input.modulePresent || input.supported == null) return 'needs-update';
  return input.supported ? 'available' : 'unsupported';
}

export function emergencyShortcutAvailability(): ShortcutAvailability {
  if (!EmergencyShortcut) {
    return resolveShortcutAvailability({
      os: Platform.OS,
      modulePresent: false,
      supported: false,
    });
  }
  try {
    return resolveShortcutAvailability({
      os: Platform.OS,
      modulePresent: true,
      supported: EmergencyShortcut.isSupported(),
    });
  } catch {
    return resolveShortcutAvailability({
      os: Platform.OS,
      modulePresent: true,
      supported: null,
    });
  }
}

/** O launcher aceita fixar o atalho direto na tela inicial (Android 8+). */
export function canPinEmergencyShortcut(): boolean {
  if (emergencyShortcutAvailability() !== 'available' || !EmergencyShortcut) return false;
  try {
    return EmergencyShortcut.isPinSupported();
  } catch {
    return false;
  }
}

/** Deep link que o atalho abre, a partir do `scheme` do app.json (ex.: encontrameapp://pedir-ajuda). */
export function emergencyShortcutUri(): string {
  const scheme = Constants.expoConfig?.scheme;
  const first = Array.isArray(scheme) ? scheme[0] : scheme;
  return `${first || DEFAULT_SCHEME}://${EMERGENCY_ROUTE_PATH}`;
}

export async function isEmergencyShortcutEnabled(): Promise<boolean> {
  return (await getLocalItem(ENABLED_KEY)) === '1';
}

/** Cria o atalho (menu do ícone) e lembra a escolha neste aparelho. */
export async function enableEmergencyShortcut(): Promise<boolean> {
  if (emergencyShortcutAvailability() !== 'available' || !EmergencyShortcut) return false;
  let ok = false;
  try {
    ok = EmergencyShortcut.enable(tr(SHORT_LABEL), tr(LONG_LABEL), emergencyShortcutUri());
  } catch {
    ok = false;
  }
  if (ok) {
    await setLocalItem(ENABLED_KEY, '1');
  }
  return ok;
}

/**
 * Pede ao Android para fixar o atalho na tela inicial.
 * `true` só quer dizer que o pedido foi aceito pelo sistema: o usuário ainda confirma na janela do Android.
 */
export function requestPinEmergencyShortcut(): boolean {
  if (!canPinEmergencyShortcut() || !EmergencyShortcut) return false;
  try {
    return EmergencyShortcut.requestPin(tr(SHORT_LABEL), tr(LONG_LABEL), emergencyShortcutUri());
  } catch {
    return false;
  }
}

/** Remove o atalho do menu e desativa um atalho já fixado na tela inicial. */
export async function disableEmergencyShortcut(): Promise<boolean> {
  let ok = true;
  if (EmergencyShortcut && Platform.OS === 'android') {
    try {
      ok = EmergencyShortcut.disable(tr(DISABLED_MESSAGE));
    } catch {
      ok = false;
    }
  }
  await setLocalItem(ENABLED_KEY, '0');
  return ok;
}
