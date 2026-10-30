import { getLocalItem, setLocalItem } from '@/lib/local-store';

/**
 * O que a pessoa escolheu receber neste aparelho. Tudo começa desligado: nada é enviado
 * sem a pessoa ligar a opção em Configurações › Notificações (ou tocar em "Acompanhar").
 */
export interface NotificationPrefs {
  /** Lembrete diário de cadastros salvos neste aparelho aguardando envio (local, sem servidor). */
  pendingReminder: boolean;
  /** Novos casos perto da localização aproximada do aparelho. */
  nearbyCases: boolean;
  /** Novos cadastros na cidade/estado do aparelho. */
  regionNewCases: boolean;
  /** Atualizações dos casos que a pessoa acompanha. */
  followedUpdates: boolean;
  /** Distância máxima (km) dos "Casos perto de mim" — rede de busca (evolução). */
  nearbyRadiusKm: number;
}

/** Distâncias que a pessoa pode escolher para os alertas de casos perto. */
export const NEARBY_RADIUS_OPTIONS = [5, 10, 25, 50] as const;
export const DEFAULT_NEARBY_RADIUS_KM = 10;

export type RemoteNotificationPref = Exclude<keyof NotificationPrefs, 'pendingReminder' | 'nearbyRadiusKm'>;

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  pendingReminder: false,
  nearbyCases: false,
  regionNewCases: false,
  followedUpdates: false,
  nearbyRadiusKm: DEFAULT_NEARBY_RADIUS_KM,
};

const STORAGE_KEY = 'encontrame.notificationPrefs';

export function parseNotificationPrefs(raw: string | null): NotificationPrefs {
  if (!raw) return { ...DEFAULT_NOTIFICATION_PREFS };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_NOTIFICATION_PREFS };
    const value = parsed as Record<string, unknown>;
    return {
      pendingReminder: value.pendingReminder === true,
      nearbyCases: value.nearbyCases === true,
      regionNewCases: value.regionNewCases === true,
      followedUpdates: value.followedUpdates === true,
      nearbyRadiusKm: (NEARBY_RADIUS_OPTIONS as readonly unknown[]).includes(value.nearbyRadiusKm)
        ? (value.nearbyRadiusKm as number)
        : DEFAULT_NEARBY_RADIUS_KM,
    };
  } catch {
    return { ...DEFAULT_NOTIFICATION_PREFS };
  }
}

export async function loadNotificationPrefs(): Promise<NotificationPrefs> {
  return parseNotificationPrefs(await getLocalItem(STORAGE_KEY));
}

export async function saveNotificationPrefs(prefs: NotificationPrefs): Promise<void> {
  await setLocalItem(STORAGE_KEY, JSON.stringify(prefs));
}

/** Alguma opção depende do servidor — o aparelho precisa estar registrado na API. */
export function wantsRemoteNotifications(prefs: NotificationPrefs): boolean {
  return prefs.nearbyCases || prefs.regionNewCases || prefs.followedUpdates;
}
