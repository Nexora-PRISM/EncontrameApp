import * as Linking from 'expo-linking';
import { type Href, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { useIdSheetQuery } from '@/features/ficha/id-sheets.queries';
import { showAlert } from '@/lib/dialog';
import { tr, useI18n } from '@/lib/i18n';
import { ageFromBirthDate, dayPhotoExpiresAt, isDayPhotoValid } from '@/lib/id-sheet-rules';
import { canPrintPoster, printPoster } from '@/lib/print-poster';
import { useSafeBack } from '@/lib/safe-back';

/** "/ficha/[id]/mostrar": a ficha em tela cheia para mostrar à polícia (e imprimir, na versão web). */
export function useFichaShowController() {
  const { language } = useI18n();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === 'string' ? params.id : null;
  const goBack = useSafeBack((id ? `/ficha/${encodeURIComponent(id)}` : '/ficha') as Href);
  const query = useIdSheetQuery(id);
  const sheet = query.data ?? null;
  /** Hora em que a tela abriu: a foto do dia só aparece se ainda vale. */
  const [now] = useState(() => new Date());
  const date = (iso: string | null) =>
    iso ? new Intl.DateTimeFormat(language, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso)) : '';
  const dayValid = sheet ? isDayPhotoValid(sheet, now) : false;
  const dayExpires = sheet && dayValid ? dayPhotoExpiresAt(sheet) : null;

  return {
    goBack,
    loading: query.isLoading,
    notFound: !query.isLoading && sheet === null,
    sheet,
    age: sheet ? ageFromBirthDate(sheet.birthDate, now) : null,
    dayValid,
    dayTaken: dayValid && sheet ? date(sheet.dayPhotoAt) : '',
    dayUntil: dayExpires ? date(dayExpires.toISOString()) : '',
    updated: sheet ? date(sheet.updatedAt) : '',
    photoTaken: sheet ? date(sheet.photoAt) : '',
    canPrint: canPrintPoster(),
    print: () => {
      printPoster();
    },
    call190: async () => {
      try {
        await Linking.openURL('tel:190');
      } catch {
        showAlert(tr('Não foi possível abrir o telefone'), tr('Ligue 190 pelo telefone do aparelho.'));
      }
    },
  };
}

export type FichaShowController = ReturnType<typeof useFichaShowController>;
