import { isAxiosError } from 'axios';
import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';

import type { MapFocus } from '@/components/brand-map';
import { confirmAction, showAlert } from '@/lib/dialog';
import { formatDistanceKm, haversineKm } from '@/lib/geo';
import { useT } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';
import {
  containsPersonalData,
  findSimilarSafetyNote,
  safetyNoteCategoryInfo,
  SAFETY_NOTE_REFERENCE_MIN,
  SAFETY_NOTE_VALID_DAYS,
} from '@/lib/safety-notes';
import { useUserLocation } from '@/lib/use-user-location';
import {
  useCreateSafetyNoteMutation,
  useNearbySafetyNotesQuery,
  useVoteSafetyNoteMutation,
} from '@/services/safety-notes/safety-notes.service';
import type {
  SafetyNoteCategory,
  SafetyNotePeriod,
} from '@/services/safety-notes/safety-notes.types';

type Point = { latitude: number; longitude: number };

/** Acima desta distância do GPS, o app pede para conferir o ponto (evita aviso no lugar errado). */
const FAR_FROM_USER_KM = 30;
type FieldKey = 'point' | 'category' | 'reference' | 'note' | 'declaration';

/** Publicar um aviso de segurança sobre um lugar (conta conectada; rota protegida). */
export function useAvisoSegurancaController() {
  const t = useT();
  const router = useRouter();
  const goBack = useSafeBack('/inicio');
  const { location, denied: locationDenied } = useUserLocation();
  const createMutation = useCreateSafetyNoteMutation();
  const voteMutation = useVoteSafetyNoteMutation();
  /** Muda a cada "Usar minha localização": o mapa vai até o ponto (tocar no mapa não move). */
  const [focusCount, setFocusCount] = useState(0);

  const [chosenPoint, setChosenPoint] = useState<Point | null>(null);
  const [category, setCategory] = useState<SafetyNoteCategory | null>(null);
  const [period, setPeriod] = useState<SafetyNotePeriod>('any');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [declared, setDeclared] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});

  /** Sem toque no mapa, o ponto começa onde a pessoa está (ela pode ajustar). */
  const point: Point | null =
    chosenPoint ?? (location ? { latitude: location.latitude, longitude: location.longitude } : null);

  /**
   * Leva o mapa até o ponto: na primeira posição do GPS e a cada "Usar minha localização".
   * Antes o mapa do formulário ficava parado no centro padrão (Belo Horizonte) e quem estava em
   * outra cidade tocava no mapa errado — o aviso era gravado com a coordenada errada.
   */
  const mapFocus: MapFocus | null = point
    ? {
        key: focusCount === 0 ? 'gps' : `minha-localizacao-${focusCount}`,
        latitude: point.latitude,
        longitude: point.longitude,
      }
    : null;
  /** Avisos já publicados perto do ponto marcado (para confirmar em vez de repetir). */
  const nearbyNotes = useNearbySafetyNotesQuery(point, point != null);

  const clearError = (key: FieldKey) =>
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));

  const choosePoint = (latitude: number, longitude: number) => {
    setChosenPoint({ latitude, longitude });
    clearError('point');
  };

  const centerOnMyLocation = () => {
    if (!location) {
      showAlert(
        t('Localização indisponível'),
        t('Permita o acesso à localização ou toque no mapa para marcar o lugar.'),
      );
      return;
    }
    choosePoint(location.latitude, location.longitude);
    setFocusCount((current) => current + 1);
  };

  const validate = (): Partial<Record<FieldKey, string>> => {
    const found: Partial<Record<FieldKey, string>> = {};
    const personalData = t('Não coloque telefone, CPF, e-mail ou perfil. Fale do lugar, não de pessoas.');
    if (!point) found.point = t('Marque o local no mapa.');
    if (!category) found.category = t('Escolha o tipo de aviso.');
    if (reference.trim().length < SAFETY_NOTE_REFERENCE_MIN) {
      found.reference = t('Escreva uma referência do local (rua, praça ou ponto conhecido).');
    } else if (containsPersonalData(reference)) {
      found.reference = personalData;
    }
    if (note.trim() && containsPersonalData(note)) found.note = personalData;
    if (!declared) found.declaration = t('Confirme a declaração para publicar.');
    return found;
  };

  const submit = async () => {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0 || !point || !category) return;

    // Ponto muito longe de onde a pessoa está: confere antes (toque errado no mapa).
    if (location) {
      const km = haversineKm(location.latitude, location.longitude, point.latitude, point.longitude);
      if (km > FAR_FROM_USER_KM) {
        const sure = await confirmAction({
          title: t('O local está longe de você'),
          message: t('O ponto marcado fica a {distance} de onde você está. Confira no mapa se é o lugar certo.', {
            distance: formatDistanceKm(km),
          }),
          confirmLabel: t('O local está certo'),
          cancelLabel: t('Voltar e conferir'),
        });
        if (!sure) return;
      }
    }

    // Mesmo tipo de aviso a poucos metros: confirma o que já existe em vez de duplicar.
    const similar = findSimilarSafetyNote(nearbyNotes.data ?? [], point, category);
    if (similar) {
      if (similar.mine) {
        showAlert(
          t('Você já avisou sobre este lugar'),
          t('Já existe um aviso seu deste tipo aqui. Ele continua no mapa enquanto outras pessoas confirmarem.'),
        );
        return;
      }
      const confirmExisting = await confirmAction({
        title: t('Já existe um aviso igual aqui'),
        message: t('Há um aviso de "{label}" a poucos metros deste ponto. Para não repetir, confirme o aviso que já existe.', {
          label: t(safetyNoteCategoryInfo(category).label),
        }),
        confirmLabel: t('Confirmar o aviso existente'),
        cancelLabel: t('Voltar'),
      });
      if (!confirmExisting) return;
      try {
        await voteMutation.mutateAsync({ id: similar.id, vote: 'confirm' });
        showAlert(
          t('Aviso confirmado'),
          t('Obrigado. Sua confirmação renova o prazo do aviso no mapa.'),
        );
        router.dismissTo('/inicio' as Href);
      } catch (error) {
        if (!isAxiosError(error)) {
          showAlert(t('Não foi possível confirmar'), t('Tente de novo em instantes.'));
        }
      }
      return;
    }

    try {
      await createMutation.mutateAsync({
        category,
        period,
        reference: reference.trim(),
        note: note.trim() || undefined,
        latitude: point.latitude,
        longitude: point.longitude,
        declarationAcceptedAt: new Date().toISOString(),
      });
      showAlert(
        t('Aviso publicado'),
        t('Ele aparece no mapa para quem estiver por perto e fica {days} dias, ou mais se outras pessoas confirmarem.', {
          days: SAFETY_NOTE_VALID_DAYS,
        }),
      );
      router.dismissTo('/inicio' as Href);
    } catch (error) {
      // Erros da API já aparecem no aviso geral de erro; aqui cobre o modo de demonstração.
      if (!isAxiosError(error)) {
        showAlert(t('Não foi possível publicar'), t('Tente de novo em instantes.'));
      }
    }
  };

  return {
    goBack,
    point,
    mapFocus,
    userLocation: location,
    pointChosen: chosenPoint != null,
    locationDenied,
    choosePoint,
    centerOnMyLocation,
    category,
    setCategory: (value: SafetyNoteCategory) => {
      setCategory(value);
      clearError('category');
    },
    period,
    setPeriod,
    reference,
    setReference: (value: string) => {
      setReference(value);
      clearError('reference');
    },
    note,
    setNote: (value: string) => {
      setNote(value);
      clearError('note');
    },
    declared,
    toggleDeclared: () => {
      setDeclared((current) => !current);
      clearError('declaration');
    },
    errors,
    submit: () => void submit(),
    submitting: createMutation.isPending || voteMutation.isPending,
    goToRules: () => router.push('/regras' as Href),
  };
}

export type AvisoSegurancaController = ReturnType<typeof useAvisoSegurancaController>;
