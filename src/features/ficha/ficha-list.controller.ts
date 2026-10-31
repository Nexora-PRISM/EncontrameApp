import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';

import { useIdSheetsQuery } from '@/features/ficha/id-sheets.queries';
import { useI18n } from '@/lib/i18n';
import {
  ageFromBirthDate,
  dayPhotoExpiresAt,
  ID_SHEET_LIMIT,
  type IdSheet,
  isDayPhotoValid,
  photoNeedsUpdate,
} from '@/lib/id-sheet-rules';
import { useSafeBack } from '@/lib/safe-back';

/** "/ficha": fichas de identificação guardadas neste aparelho. */
export function useFichaListController() {
  const { language } = useI18n();
  const router = useRouter();
  const goBack = useSafeBack('/inicio' as Href);
  const query = useIdSheetsQuery();
  const sheets = query.data ?? [];
  /** Hora em que a tela abriu: base dos avisos (foto do dia, foto antiga). */
  const [now] = useState(() => new Date());
  const time = (date: Date) => new Intl.DateTimeFormat(language, { hour: '2-digit', minute: '2-digit' }).format(date);

  return {
    goBack,
    loading: query.isLoading,
    error: query.isError,
    items: sheets.map((sheet: IdSheet) => {
      const expires = dayPhotoExpiresAt(sheet);
      return {
        sheet,
        age: ageFromBirthDate(sheet.birthDate, now),
        dayPhotoUntil: isDayPhotoValid(sheet, now) && expires ? time(expires) : null,
        photoNeedsUpdate: photoNeedsUpdate(sheet, now),
      };
    }),
    limitReached: sheets.length >= ID_SHEET_LIMIT,
    limit: ID_SHEET_LIMIT,
    add: () => router.push('/ficha/nova' as Href),
    open: (id: string) => router.push(`/ficha/${encodeURIComponent(id)}` as Href),
  };
}

export type FichaListController = ReturnType<typeof useFichaListController>;
