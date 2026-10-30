import * as Location from 'expo-location';
import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';

import { visionErrorText } from '@/features/vision/vision-format';
import { isReceiptConfirmed } from '@/lib/collaboration-rules';
import { env } from '@/lib/env';
import { useT } from '@/lib/i18n';
import { maskDate } from '@/lib/masks';
import { useSafeBack } from '@/lib/safe-back';
import { formatDateBr, formatTimeBr, maskTime, parseSeenAt } from '@/lib/sighting-report-rules';
import { can, DEFAULT_RADIUS_KM, type OperationError, validateOperation } from '@/lib/vision-rules';
import { useVisionAccessQuery, useVisionActions } from '@/services/vision/vision.service';

const parseCoord = (value: string) => {
  const number = Number(value.replace(',', '.').trim());
  return value.trim() && Number.isFinite(number) ? number : undefined;
};

/** "/vision/institucional/nova-operacao": abrir uma operação de busca audiovisual (coordenação). */
export function useNovaOperacaoController() {
  const t = useT();
  const router = useRouter();
  const goBack = useSafeBack('/vision/institucional' as Href);
  const accessQuery = useVisionAccessQuery();
  const actions = useVisionActions();
  const allowed = can(accessQuery.data, 'create_operation');

  const [caseId, setCaseId] = useState('');
  const [place, setPlace] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState('');
  const [justification, setJustification] = useState('');
  const [errors, setErrors] = useState<OperationError[]>([]);
  const [timeError, setTimeError] = useState<string | undefined>();
  const [message, setMessage] = useState<string | undefined>();
  const [locating, setLocating] = useState(false);

  const submit = () => {
    const now = new Date();
    const seen = parseSeenAt(date, time, now);
    const lastSeenAt = seen.ok ? Date.parse(seen.iso) : Number.NaN;
    const found = validateOperation(
      {
        caseId,
        lastKnown: { latitude: parseCoord(latitude), longitude: parseCoord(longitude) },
        lastKnownPlace: place,
        lastSeenAt,
        radiusKm,
        scope,
        justification,
      },
      now.getTime(),
    );
    setErrors(found);
    setTimeError(
      seen.ok
        ? undefined
        : seen.error.endsWith('future')
          ? t('A data não pode estar no futuro.')
          : t('Use o formato dd/mm/aaaa e hh:mm.'),
    );
    setMessage(undefined);
    if (found.length > 0 || !seen.ok) return;
    void (async () => {
      try {
        const receipt = await actions.createOperation.mutateAsync({
          caseId: caseId.trim(),
          latitude: parseCoord(latitude)!,
          longitude: parseCoord(longitude)!,
          lastKnownPlace: place.trim(),
          lastSeenAt: seen.iso,
          radiusKm,
          description: description.trim(),
          scope: scope.trim(),
          justification: justification.trim(),
        });
        if (!isReceiptConfirmed(receipt.id, receipt.receivedAt) || !receipt.id) {
          setMessage(t('O envio não foi confirmado. Tente de novo em alguns instantes.'));
          return;
        }
        router.replace(`/vision/institucional/operacao/${encodeURIComponent(receipt.id)}` as Href);
      } catch (error) {
        setMessage(t(visionErrorText(error)));
      }
    })();
  };

  const locateHere = () => {
    void (async () => {
      setLocating(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLatitude(current.coords.latitude.toFixed(5));
        setLongitude(current.coords.longitude.toFixed(5));
        setErrors((list) => list.filter((item) => item !== 'location'));
      } catch {
        setMessage(t('Não foi possível obter sua localização.'));
      } finally {
        setLocating(false);
      }
    })();
  };

  /** Só no modo de demonstração: preenche um exemplo fictício para testar o fluxo. */
  const fillDemo = () => {
    const seen = new Date(Date.now() - 2 * 60 * 60 * 1000);
    setCaseId('TESTE-CASO-03');
    setPlace('Praça de demonstração 3 (fictícia)');
    setLatitude('-19.92200');
    setLongitude('-43.93500');
    setDate(formatDateBr(seen));
    setTime(formatTimeBr(seen));
    setDescription('Jaqueta verde e bolsa marrom (exemplo fictício).');
    setScope('Câmeras participantes no raio, nas duas horas seguintes ao último local conhecido.');
    setJustification('Teste do fluxo no modo de demonstração, sem caso real.');
    setErrors([]);
    setTimeError(undefined);
  };

  const clear = (key: OperationError) => setErrors((current) => current.filter((item) => item !== key));

  return {
    goBack,
    enabled: env.visionEnabled,
    demo: env.useMocks,
    checking: accessQuery.isLoading,
    allowed,
    fields: { caseId, place, latitude, longitude, date, time, radiusKm, description, scope, justification },
    errors,
    timeError,
    message,
    saving: actions.createOperation.isPending,
    locating,
    setCaseId: (value: string) => {
      setCaseId(value);
      clear('case');
    },
    setPlace: (value: string) => {
      setPlace(value);
      clear('place');
    },
    setLatitude: (value: string) => {
      setLatitude(value);
      clear('location');
    },
    setLongitude: (value: string) => {
      setLongitude(value);
      clear('location');
    },
    setDate: (value: string) => {
      setDate(maskDate(value));
      setTimeError(undefined);
    },
    setTime: (value: string) => {
      setTime(maskTime(value));
      setTimeError(undefined);
    },
    setRadiusKm: (value: number) => {
      setRadiusKm(value);
      clear('radius');
    },
    setDescription,
    setScope: (value: string) => {
      setScope(value);
      clear('scope');
    },
    setJustification: (value: string) => {
      setJustification(value);
      clear('justification');
    },
    locateHere,
    fillDemo,
    submit,
  };
}

export type NovaOperacaoController = ReturnType<typeof useNovaOperacaoController>;
