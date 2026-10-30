import * as Location from 'expo-location';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { visionErrorText } from '@/features/vision/vision-format';
import { isReceiptConfirmed } from '@/lib/collaboration-rules';
import { confirmAction, showAlert } from '@/lib/dialog';
import { env } from '@/lib/env';
import { tr, useT } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';
import { maskTime } from '@/lib/sighting-report-rules';
import { CAMERA_SOURCE_LABEL, INTEGRATION_LABEL, SHARING_LABEL } from '@/lib/vision-labels';
import {
  type Camera,
  type CameraAuthorization,
  type CameraError,
  type CameraInput,
  ownerCanSetAuthorization,
  validateCamera,
} from '@/lib/vision-rules';
import { useMyCamerasQuery, useVisionActions } from '@/services/vision/vision.service';

/** Código a partir do texto escolhido no seletor (o seletor mostra os textos em português, traduzidos na tela). */
function codeFor<T extends string>(labels: Readonly<Record<T, string>>, label: string): T | '' {
  const entry = (Object.entries(labels) as [T, string][]).find(([, value]) => value === label);
  return entry ? entry[0] : '';
}

/** "/vision/minhas-cameras/[id]" ("nova" para cadastrar): dados da câmera e controle da participação. */
export function useCameraFormController() {
  const t = useT();
  const router = useRouter();
  const goBack = useSafeBack('/vision/minhas-cameras' as Href);
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? (params.id[0] ?? '') : (params.id ?? '');
  const isNew = id === 'nova';
  const camerasQuery = useMyCamerasQuery(!isNew);
  const actions = useVisionActions();
  const camera = isNew ? null : ((camerasQuery.data ?? []).find((item) => item.id === id) ?? null);

  const [name, setName] = useState('');
  const [source, setSource] = useState('');
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [coverage, setCoverage] = useState('');
  const [equipment, setEquipment] = useState('');
  const [hoursStart, setHoursStart] = useState('');
  const [hoursEnd, setHoursEnd] = useState('');
  const [retention, setRetention] = useState('7');
  const [integration, setIntegration] = useState('');
  const [sharing, setSharing] = useState('');
  const [consent, setConsent] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | undefined>();
  const [errors, setErrors] = useState<CameraError[]>([]);
  const [message, setMessage] = useState<string | undefined>();

  // Preenche o formulário quando a câmera chega (ajuste durante a renderização, sem efeito).
  const [filledFrom, setFilledFrom] = useState<Camera | null>(null);
  if (camera && camera !== filledFrom) {
    setFilledFrom(camera);
    setName(camera.name);
    setSource(CAMERA_SOURCE_LABEL[camera.source]);
    setRegion(camera.region);
    setCity(camera.city);
    setCoverage(camera.coverage);
    setEquipment(camera.equipment);
    setHoursStart(camera.hoursStart ?? '');
    setHoursEnd(camera.hoursEnd ?? '');
    setRetention(String(camera.retentionDays));
    setIntegration(INTEGRATION_LABEL[camera.integration]);
    setSharing(SHARING_LABEL[camera.sharing]);
    setLocation({ latitude: camera.latitude, longitude: camera.longitude });
    setConsent(true);
  }

  const clear = (key: CameraError) => {
    setErrors((current) => current.filter((item) => item !== key && item !== 'secret'));
    setMessage(undefined);
  };

  const input = (): CameraInput => ({
    name,
    source: codeFor(CAMERA_SOURCE_LABEL, source),
    region,
    city,
    coverage,
    equipment,
    latitude: location?.latitude,
    longitude: location?.longitude,
    hoursStart: hoursStart.trim() || undefined,
    hoursEnd: hoursEnd.trim() || undefined,
    retentionDays: Number(retention),
    integration: codeFor(INTEGRATION_LABEL, integration),
    sharing: codeFor(SHARING_LABEL, sharing),
    consent,
  });

  const save = () => {
    const value = input();
    const found = validateCamera(value);
    setErrors(found);
    setMessage(undefined);
    if (found.length > 0 || !value.consent) return;
    void (async () => {
      try {
        const receipt = await actions.saveCamera.mutateAsync({ id: isNew ? null : id, camera: { ...value, consent: true } });
        if (!isReceiptConfirmed(receipt.id, receipt.receivedAt)) {
          setMessage(t('O envio não foi confirmado. Tente de novo em alguns instantes.'));
          return;
        }
        showAlert(
          isNew ? tr('Câmera cadastrada') : tr('Alterações salvas'),
          isNew
            ? tr('A câmera fica "Aguardando verificação" até a equipe conferir os dados. Ela só participa depois disso.')
            : receipt.simulated
              ? tr('Modo de demonstração: nada foi enviado de verdade.')
              : undefined,
        );
        if (isNew) router.replace('/vision/minhas-cameras' as Href);
      } catch (error) {
        setMessage(t(visionErrorText(error)));
      }
    })();
  };

  const locateHere = () => {
    void (async () => {
      setLocating(true);
      setLocationMessage(undefined);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationMessage(t('Permita o acesso à localização para usar este recurso.'));
          return;
        }
        const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocation({
          latitude: Math.round(current.coords.latitude * 1e5) / 1e5,
          longitude: Math.round(current.coords.longitude * 1e5) / 1e5,
        });
        setErrors((list) => list.filter((item) => item !== 'location'));
      } catch {
        setLocationMessage(t('Não foi possível obter sua localização.'));
      } finally {
        setLocating(false);
      }
    })();
  };

  const setParticipation = (next: 'suspended' | 'revoked' | 'pending') => {
    if (!camera) return;
    const texts = {
      suspended: {
        title: tr('Pausar a participação?'),
        body: tr('A câmera deixa de aparecer nas buscas até você pedir para voltar.'),
        ok: tr('Pausar'),
      },
      revoked: {
        title: tr('Encerrar a participação?'),
        body: tr('A câmera sai da rede. Os pedidos já registrados continuam no histórico.'),
        ok: tr('Encerrar'),
      },
      pending: {
        title: tr('Pedir para voltar?'),
        body: tr('A câmera passa de novo pela verificação da equipe antes de participar.'),
        ok: tr('Pedir para voltar'),
      },
    };
    void (async () => {
      const text = texts[next];
      const ok = await confirmAction({ title: text.title, message: text.body, confirmLabel: text.ok });
      if (!ok) return;
      try {
        await actions.setParticipation.mutateAsync({ id: camera.id, next });
      } catch (error) {
        showAlert(tr('Não foi possível concluir'), tr(visionErrorText(error)));
      }
    })();
  };

  const can = (next: CameraAuthorization) => (camera ? ownerCanSetAuthorization(camera.authorization, next) : false);

  return {
    goBack,
    enabled: env.visionEnabled,
    demo: env.useMocks,
    isNew,
    camera,
    loading: !isNew && camerasQuery.isLoading,
    notFound: !isNew && !camerasQuery.isLoading && !camera,
    saving: actions.saveCamera.isPending,
    changing: actions.setParticipation.isPending,
    errors,
    message,
    fields: {
      name,
      source,
      region,
      city,
      coverage,
      equipment,
      hoursStart,
      hoursEnd,
      retention,
      integration,
      sharing,
      consent,
    },
    location,
    locating,
    locationMessage,
    setName: (value: string) => {
      setName(value);
      clear('name');
    },
    setSource: (value: string) => {
      setSource(value);
      clear('source');
    },
    setRegion: (value: string) => {
      setRegion(value);
      clear('region');
    },
    setCity: (value: string) => {
      setCity(value);
      clear('city');
    },
    setCoverage: (value: string) => {
      setCoverage(value);
      clear('coverage');
    },
    setEquipment: (value: string) => {
      setEquipment(value);
      clear('secret');
    },
    setHoursStart: (value: string) => {
      setHoursStart(maskTime(value));
      clear('hours');
    },
    setHoursEnd: (value: string) => {
      setHoursEnd(maskTime(value));
      clear('hours');
    },
    setRetention: (value: string) => {
      setRetention(value.replace(/\D/g, '').slice(0, 2));
      clear('retention');
    },
    setIntegration: (value: string) => {
      setIntegration(value);
      clear('integration');
    },
    setSharing: (value: string) => {
      setSharing(value);
      clear('sharing');
    },
    toggleConsent: () => {
      setConsent((value) => !value);
      clear('consent');
    },
    locateHere,
    clearLocation: () => setLocation(null),
    save,
    canPause: can('suspended'),
    canRevoke: can('revoked'),
    canReturn: can('pending'),
    pause: () => setParticipation('suspended'),
    revoke: () => setParticipation('revoked'),
    askReturn: () => setParticipation('pending'),
  };
}

export type CameraFormController = ReturnType<typeof useCameraFormController>;
