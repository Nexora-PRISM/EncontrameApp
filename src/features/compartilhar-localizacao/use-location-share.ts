import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { showAlert } from '@/lib/dialog';
import { useT } from '@/lib/i18n';
import {
  type LocationMessageMode,
  type SharedLocation,
  buildLocationMessage,
  smsLink,
  toBrazilPhoneWithCountry,
  whatsappLink,
} from '@/lib/location-share';
import { shareText } from '@/lib/share';
import { type TrustedContact, loadTrustedContacts } from '@/lib/trusted-contacts';

export type LocationStatus = 'idle' | 'locating' | 'ready' | 'denied' | 'unavailable';

const LOCATION_TIMEOUT_MS = 12000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

type ReadResult = { location: SharedLocation | null; denied: boolean };

/**
 * Pede a permissão (só com o app aberto) e lê a posição; sem GPS, usa a última posição conhecida.
 * `onAsking` avisa enquanto a janela de permissão do sistema pode estar aberta — o alerta de
 * emergência pausa a contagem nesse intervalo, para a janela não esconder o "Cancelar".
 */
async function readCurrentLocation(onAsking?: (asking: boolean) => void): Promise<ReadResult> {
  const current = await Location.getForegroundPermissionsAsync();
  let granted = current.status === 'granted';
  if (!granted && current.canAskAgain !== false) {
    onAsking?.(true);
    try {
      granted = (await Location.requestForegroundPermissionsAsync()).status === 'granted';
    } finally {
      onAsking?.(false);
    }
  }
  if (!granted) return { location: null, denied: true };

  let position: Location.LocationObject | null = null;
  try {
    position = await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
      LOCATION_TIMEOUT_MS,
    );
  } catch {
    try {
      position = await Location.getLastKnownPositionAsync();
    } catch {
      position = null;
    }
  }
  if (!position) return { location: null, denied: false };

  return {
    location: {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy ?? null,
      capturedAt: position.timestamp || Date.now(),
    },
    denied: false,
  };
}

/**
 * Localização atual + contatos de confiança + atalhos para mandar a mensagem por WhatsApp,
 * SMS ou pelo compartilhamento do celular. Usado na tela "Compartilhar localização" e no
 * resultado do alerta de emergência.
 */
export function useLocationShare({ mode }: { mode: LocationMessageMode }) {
  const t = useT();
  const router = useRouter();
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [status, setStatus] = useState<LocationStatus>('locating');
  const [location, setLocation] = useState<SharedLocation | null>(null);
  /** O que foi aberto por último (ex.: "o WhatsApp com a mensagem para Ana"). */
  const [opened, setOpened] = useState<string | null>(null);
  /** A janela de permissão de localização do sistema pode estar aberta. */
  const [asking, setAsking] = useState(false);
  const locationRef = useRef<SharedLocation | null>(null);

  const applyResult = useCallback(({ location: next, denied }: ReadResult) => {
    locationRef.current = next;
    setLocation(next);
    setStatus(next ? 'ready' : denied ? 'denied' : 'unavailable');
  }, []);

  // Começa a buscar a posição assim que a tela abre.
  useEffect(() => {
    let cancelled = false;
    void readCurrentLocation((value) => {
      if (!cancelled) setAsking(value);
    })
      .then((result) => {
        if (!cancelled) applyResult(result);
      })
      .catch(() => {
        if (!cancelled) setStatus('unavailable');
      });
    return () => {
      cancelled = true;
    };
  }, [applyResult]);

  // Recarrega os contatos ao voltar da tela "Contatos de confiança".
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void loadTrustedContacts()
        .then((list) => {
          if (!cancelled) setContacts(list);
        })
        .catch(() => undefined);
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const retryLocation = () => {
    setStatus('locating');
    void readCurrentLocation(setAsking)
      .then(applyResult)
      .catch(() => setStatus('unavailable'));
  };

  const message = buildLocationMessage(location, mode, t);

  const openApp = async (url: string, what: string) => {
    try {
      await Linking.openURL(url);
      setOpened(what);
    } catch {
      showAlert(t('Não foi possível abrir'), t('Tente outra opção ou toque em "Escolher no celular".'));
    }
  };

  const phoneFor = (contact: TrustedContact) => {
    const phone = toBrazilPhoneWithCountry(contact.phone);
    if (!phone) {
      showAlert(t('Número inválido'), t('Confira o celular de {name} em Contatos de confiança.', { name: contact.name }));
    }
    return phone;
  };

  return {
    contacts,
    status,
    location,
    message,
    opened,
    asking,
    /** Posição já obtida, sem esperar (para o envio do alerta ao fim da contagem). */
    currentLocation: () => locationRef.current,
    retryLocation,
    openLocationSettings: () => {
      void Linking.openSettings().catch(() => {
        showAlert(t('Não foi possível abrir'), t('Abra os ajustes do celular e permita a localização.'));
      });
    },
    sendWhatsApp: (contact: TrustedContact) => {
      const phone = phoneFor(contact);
      if (phone) {
        void openApp(
          whatsappLink(phone, message),
          t('o WhatsApp com a mensagem para {name}', { name: contact.name }),
        );
      }
    },
    sendSms: (contact: TrustedContact) => {
      const phone = phoneFor(contact);
      if (phone) {
        void openApp(
          smsLink(phone, message, Platform.OS),
          t('o SMS com a mensagem para {name}', { name: contact.name }),
        );
      }
    },
    shareWithSystem: () => {
      void shareText(message, t('Minha localização')).then((ok) => {
        if (ok) setOpened(t('o compartilhamento do celular'));
      });
    },
    goToContacts: () => router.push('/contatos-confianca' as Href),
  };
}

export type LocationShareController = ReturnType<typeof useLocationShare>;
