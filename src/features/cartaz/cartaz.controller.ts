import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { buildPersonShareMessage } from '@/features/pessoa-detalhe/person-share';
import {
  buildPosterContent,
  caseUrl,
  DEFAULT_POSTER_OPTIONS,
  type PosterOptions,
  posterAvailability,
} from '@/lib/case-poster-rules';
import { coarseLocation } from '@/lib/case-timeline-rules';
import { env } from '@/lib/env';
import { useT } from '@/lib/i18n';
import { isLocalPersonId } from '@/lib/person-status';
import { canPrintPoster, printPoster } from '@/lib/print-poster';
import { useSafeBack } from '@/lib/safe-back';
import { shareText } from '@/lib/share';
import { usePersonQuery } from '@/services/people/people.service';

export type PosterFormat = 'vertical' | 'square';

/**
 * "/pessoa/[id]/cartaz": cartaz do caso com QR Code para a página pública. O QR aponta sempre para a página do
 * caso, que mostra a situação atual; quando o caso é encerrado, o próprio cartaz deixa de ser gerado.
 */
export function useCartazController() {
  const t = useT();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? (params.id[0] ?? '') : (params.id ?? '');
  const goBack = useSafeBack(`/pessoa/${id}` as Href);
  const personQuery = usePersonQuery(id);
  const person = personQuery.data ?? null;
  const [format, setFormat] = useState<PosterFormat>('vertical');
  const [options, setOptions] = useState<PosterOptions>(DEFAULT_POSTER_OPTIONS);

  const availability = isLocalPersonId(id)
    ? 'pending'
    : posterAvailability(person?.statusId, person?.statusDescription);
  const content = useMemo(() => (person ? buildPosterContent(person, options) : null), [person, options]);
  const place = person
    ? coarseLocation({
        location: person.lastSeen ?? person.location,
        neighborhood: person.neighborhood,
        city: person.city,
        state: person.state,
      })
    : undefined;
  const url = caseUrl(env.webUrl, id);

  return {
    id,
    goBack,
    loading: personQuery.isLoading,
    notFound: !personQuery.isLoading && (personQuery.isError || person == null),
    person,
    availability,
    content,
    place,
    url,
    format,
    setFormat,
    options,
    toggleOption: (key: keyof PosterOptions) => setOptions((current) => ({ ...current, [key]: !current[key] })),
    canPrint: canPrintPoster(),
    print: () => {
      printPoster();
    },
    share: () => {
      if (!person) return;
      void shareText(buildPersonShareMessage(person, env.webUrl, t), t('Pessoa desaparecida'));
    },
    openCase: () => router.push(`/pessoa/${id}` as Href),
  };
}

export type CartazController = ReturnType<typeof useCartazController>;
