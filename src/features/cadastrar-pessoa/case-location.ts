import * as Location from 'expo-location';
import { useCallback, useState } from 'react';

import { type CasePoint, canSearchCaseLocation, roundCasePoint } from '@/lib/case-location-rules';
import { geocodeAddress } from '@/lib/geocode';
import { tr } from '@/lib/i18n';

export type CasePointSource = 'address' | 'gps' | 'map' | 'draft';

/**
 * Ponto no mapa do cadastro (opcional): pelo texto do "Localidade", pela localização atual de quem cadastra
 * ou tocando no mapa. Sempre arredondado (cerca de 110 m) antes de guardar ou enviar.
 */
export function useCaseLocation() {
  const [point, setPoint] = useState<CasePoint | null>(null);
  const [source, setSource] = useState<CasePointSource | null>(null);
  const [busy, setBusy] = useState<'address' | 'gps' | null>(null);
  const [error, setError] = useState<string | undefined>();

  const apply = useCallback((next: { latitude: number; longitude: number }, nextSource: CasePointSource) => {
    const rounded = roundCasePoint(next);
    if (!rounded) {
      setError(tr('Não foi possível usar esse ponto. Tente de novo.'));
      return;
    }
    setPoint(rounded);
    setSource(nextSource);
    setError(undefined);
  }, []);

  const markFromText = async (text: string) => {
    if (!canSearchCaseLocation(text)) {
      setError(tr('Escreva primeiro o local (bairro ou ponto de referência e cidade).'));
      return;
    }
    setBusy('address');
    setError(undefined);
    try {
      const found = await geocodeAddress(text.trim());
      if (!found) {
        setError(tr('Não encontramos esse local no mapa. Ajuste o texto ou use a sua localização.'));
        return;
      }
      apply(found, 'address');
    } catch {
      setError(tr('Não foi possível procurar o local agora.'));
    } finally {
      setBusy(null);
    }
  };

  const markCurrentPosition = async () => {
    setBusy('gps');
    setError(undefined);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError(tr('Permita o acesso à localização para usar este recurso.'));
        return;
      }
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      apply(current.coords, 'gps');
    } catch {
      setError(tr('Não foi possível obter sua localização.'));
    } finally {
      setBusy(null);
    }
  };

  /** Rascunho salvo no aparelho: volta com o ponto que já tinha. */
  const restore = useCallback(
    (saved: { latitude?: number | null; longitude?: number | null } | null) => {
      if (saved?.latitude != null && saved.longitude != null) {
        apply({ latitude: saved.latitude, longitude: saved.longitude }, 'draft');
      }
    },
    [apply],
  );

  return {
    point,
    source,
    busy,
    error,
    markFromText: (text: string) => void markFromText(text),
    markCurrentPosition: () => void markCurrentPosition(),
    moveTo: (latitude: number, longitude: number) => apply({ latitude, longitude }, 'map'),
    clear: () => {
      setPoint(null);
      setSource(null);
      setError(undefined);
    },
    restore,
  };
}

export type CaseLocation = ReturnType<typeof useCaseLocation>;
