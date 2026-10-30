import { useState } from 'react';

import { useT } from '@/lib/i18n';
import { maskDate } from '@/lib/masks';
import {
  formatDateBr,
  formatTimeBr,
  maskTime,
  optionalText,
  parseSeenAt,
  type SeenAtError,
  type SightingTextError,
  type SightingTextField,
  validateSightingTexts,
} from '@/lib/sighting-report-rules';
import { usePhotoPicker } from '@/lib/use-photo-picker';
import type { SightingLocationSource, SightingReportPayload } from '@/services/sightings/sightings.types';

type ReportField = SightingTextField | 'seenDate' | 'seenTime';

/** Onde e como o avistamento foi marcado — vem do formulário de local que já existia. */
export interface SightingLocationInput {
  personId: string;
  location: string;
  city?: string;
  neighborhood?: string;
  latitude: number;
  longitude: number;
  locationSource: SightingLocationSource;
}

/**
 * Campos do relato completo ("Eu vi essa pessoa"): quando, o que viu, roupa, características, direção,
 * ponto de referência, foto opcional e informações complementares. O local continua no controller da página.
 */
export function useSightingReportForm() {
  const t = useT();
  const photo = usePhotoPicker();
  const [seenDate, setSeenDate] = useState(() => formatDateBr(new Date()));
  const [seenTime, setSeenTime] = useState(() => formatTimeBr(new Date()));
  const [timeIsApproximate, setTimeIsApproximate] = useState(true);
  const [description, setDescription] = useState('');
  const [clothes, setClothes] = useState('');
  const [features, setFeatures] = useState('');
  const [direction, setDirection] = useState('');
  const [reference, setReference] = useState('');
  const [details, setDetails] = useState('');
  const [errors, setErrors] = useState<Partial<Record<ReportField, string>>>({});

  const clearError = (field: ReportField) => {
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  };

  const seenAtMessage = (error: SeenAtError): string => {
    switch (error) {
      case 'date_required':
        return t('Informe a data.');
      case 'date_invalid':
        return t('Use o formato dd/mm/aaaa.');
      case 'date_future':
        return t('A data não pode estar no futuro.');
      case 'time_required':
        return t('Informe o horário, mesmo que aproximado.');
      case 'time_invalid':
        return t('Use o formato hh:mm (ex.: 14:30).');
      case 'time_future':
        return t('O horário não pode estar no futuro.');
    }
  };

  const textMessage = (error: SightingTextError): string => {
    if (error === 'required') return t('Conte o que você viu.');
    if (error === 'too_short') return t('Escreva pelo menos 10 letras.');
    return t('Texto muito longo.');
  };

  /** Valida os campos e marca os erros. Devolve o momento do avistamento (ISO) ou null. */
  const validate = (): string | null => {
    const next: Partial<Record<ReportField, string>> = {};
    const seen = parseSeenAt(seenDate, seenTime);
    if (!seen.ok) {
      next[seen.field === 'date' ? 'seenDate' : 'seenTime'] = seenAtMessage(seen.error);
    }
    const textErrors = validateSightingTexts({ description, clothes, features, direction, reference, details });
    for (const [field, error] of Object.entries(textErrors) as [SightingTextField, SightingTextError][]) {
      next[field] = textMessage(error);
    }
    setErrors(next);
    if (!seen.ok || Object.keys(next).length > 0) return null;
    return seen.iso;
  };

  const toPayload = (location: SightingLocationInput, seenAt: string): SightingReportPayload => ({
    ...location,
    referencePoint: optionalText(reference),
    seenAt,
    timeIsApproximate,
    description: description.trim(),
    clothes: optionalText(clothes),
    features: optionalText(features),
    direction: optionalText(direction),
    details: optionalText(details),
    photo: photo.photoBase64 || undefined,
  });

  const reset = () => {
    const now = new Date();
    setSeenDate(formatDateBr(now));
    setSeenTime(formatTimeBr(now));
    setTimeIsApproximate(true);
    setDescription('');
    setClothes('');
    setFeatures('');
    setDirection('');
    setReference('');
    setDetails('');
    setErrors({});
    photo.removePhoto();
  };

  const textSetter = (field: SightingTextField, setter: (value: string) => void) => (value: string) => {
    setter(value);
    clearError(field);
  };

  return {
    seenDate,
    setSeenDate: (value: string) => {
      setSeenDate(maskDate(value));
      clearError('seenDate');
    },
    seenTime,
    setSeenTime: (value: string) => {
      setSeenTime(maskTime(value));
      clearError('seenTime');
    },
    timeIsApproximate,
    toggleTimeIsApproximate: () => setTimeIsApproximate((current) => !current),
    description,
    setDescription: textSetter('description', setDescription),
    clothes,
    setClothes: textSetter('clothes', setClothes),
    features,
    setFeatures: textSetter('features', setFeatures),
    direction,
    setDirection: textSetter('direction', setDirection),
    reference,
    setReference: textSetter('reference', setReference),
    details,
    setDetails: textSetter('details', setDetails),
    photoUri: photo.photoUri,
    pickPhoto: photo.pickPhoto,
    removePhoto: photo.removePhoto,
    errors,
    validate,
    toPayload,
    reset,
  };
}

export type SightingReportForm = ReturnType<typeof useSightingReportForm>;
