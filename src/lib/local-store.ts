import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Preferências simples deste aparelho (não sincronizam com a conta).
 * Android/iOS: SecureStore. Web (ou falha do módulo nativo): localStorage.
 */
export async function getLocalItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return webGet(key);
  }

  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return webGet(key);
  }
}

export async function setLocalItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    webSet(key, value);
    return;
  }

  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    webSet(key, value);
  }
}

function webGet(key: string): string | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function webSet(key: string, value: string): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, value);
  } catch {
    // Sem storage persistente.
  }
}
