import { useCallback, useEffect, useState } from 'react';

import { useI18n, useT } from '@/lib/i18n';
import { minutesSince } from '@/lib/trip-rules';

/** Horários e "há quanto tempo" das telas de trajeto, no idioma escolhido. */
export function useTripFormat() {
  const t = useT();
  const { language } = useI18n();

  const parse = (iso: string) => {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  return {
    clock: (iso: string) => {
      const date = parse(iso);
      return date ? new Intl.DateTimeFormat(language, { hour: '2-digit', minute: '2-digit' }).format(date) : iso;
    },
    dateTime: (iso: string) => {
      const date = parse(iso);
      return date ? new Intl.DateTimeFormat(language, { dateStyle: 'short', timeStyle: 'short' }).format(date) : iso;
    },
    ago: (iso: string, now: Date) => {
      const minutes = minutesSince(iso, now);
      if (minutes < 1) return t('agora há pouco');
      if (minutes < 60) return t('há {n} min', { n: minutes });
      return t('há {h} h {m} min', { h: Math.floor(minutes / 60), m: minutes % 60 });
    },
    duration: (ms: number) => {
      const minutes = Math.max(0, Math.round(ms / 60000));
      if (minutes < 60) return t('{n} min', { n: minutes });
      return t('{h} h {m} min', { h: Math.floor(minutes / 60), m: minutes % 60 });
    },
  };
}

/** Relógio da tela (atualiza a cada 15 s), sem `new Date()` solto na renderização. */
export function useTicker(intervalMs = 15000): Date {
  const [now, setNow] = useState(() => new Date());
  const tick = useCallback(() => setNow(new Date()), []);
  useEffect(() => {
    const timer = setInterval(tick, intervalMs);
    return () => clearInterval(timer);
  }, [tick, intervalMs]);
  return now;
}
