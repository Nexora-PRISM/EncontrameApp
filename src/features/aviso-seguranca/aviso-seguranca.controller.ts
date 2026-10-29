import { isAxiosError } from 'axios';
import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';

import { showAlert } from '@/lib/dialog';
import { useT } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';
import {
  containsPersonalData,
  SAFETY_NOTE_REFERENCE_MIN,
  SAFETY_NOTE_VALID_DAYS,
} from '@/lib/safety-notes';
import { useUserLocation } from '@/lib/use-user-location';
import { useCreateSafetyNoteMutation } from '@/services/safety-notes/safety-notes.service';
import type {
  SafetyNoteCategory,
  SafetyNotePeriod,
} from '@/services/safety-notes/safety-notes.types';

type Point = { latitude: number; longitude: number };
type FieldKey = 'point' | 'category' | 'reference' | 'note' | 'declaration';

/** Publicar um aviso de segurança sobre um lugar (conta conectada; rota protegida). */
export function useAvisoSegurancaController() {
  const t = useT();
  const router = useRouter();
  const goBack = useSafeBack('/inicio');
  const { location, denied: locationDenied } = useUserLocation();
  const createMutation = useCreateSafetyNoteMutation();

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
    submitting: createMutation.isPending,
    goToRules: () => router.push('/regras' as Href),
  };
}

export type AvisoSegurancaController = ReturnType<typeof useAvisoSegurancaController>;
