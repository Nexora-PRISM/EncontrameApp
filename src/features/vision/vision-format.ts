import { isAxiosError } from 'axios';

import { useI18n, useT } from '@/lib/i18n';
import { msg } from '@/lib/i18n-msg';
import { VisionDeniedError } from '@/services/vision/vision.errors';

/** Datas, horários e distâncias no idioma escolhido. */
export function useVisionFormat() {
  const t = useT();
  const { language } = useI18n();
  const dateTime = new Intl.DateTimeFormat(language, { dateStyle: 'short', timeStyle: 'short' });
  const time = new Intl.DateTimeFormat(language, { hour: '2-digit', minute: '2-digit' });
  const number = new Intl.NumberFormat(language, { maximumFractionDigits: 1 });

  const safe = (iso: string | number | undefined, formatter: Intl.DateTimeFormat) => {
    if (iso == null) return '—';
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? '—' : formatter.format(date);
  };

  return {
    dateTime: (iso: string | number | undefined) => safe(iso, dateTime),
    time: (iso: string | number | undefined) => safe(iso, time),
    /** "350 m" ou "1,2 km". */
    distance: (km: number) =>
      km < 1 ? t('{value} m', { value: String(Math.round((km * 1000) / 10) * 10) }) : t('{value} km', { value: number.format(km) }),
    /** "3 dias e 4 horas", "5 horas" ou "menos de 1 hora". */
    hoursLeft: (hours: number | undefined) => {
      if (hours == null) return '';
      if (hours < 1) return t('menos de 1 hora');
      const days = Math.floor(hours / 24);
      const rest = hours % 24;
      if (days === 0) return t('{hours} h', { hours: String(rest) });
      return rest === 0
        ? t('{days} d', { days: String(days) })
        : t('{days} d e {hours} h', { days: String(days), hours: String(rest) });
    },
    percent: (value: number) => `${Math.round(value)}%`,
  };
}

export type VisionFormat = ReturnType<typeof useVisionFormat>;

const ERROR_TEXT = {
  role: msg('Sua função não permite esta ação. A tentativa ficou registrada na auditoria.'),
  justification: msg('Escreva a justificativa (pelo menos 15 letras).'),
  owner: msg('Esta câmera não é da sua conta.'),
  flow: msg('Este passo não é possível na situação atual.'),
  invalid: msg('Confira os dados e tente de novo.'),
  generic: msg('Não foi possível concluir agora. Tente de novo em alguns instantes.'),
} as const;

/** Mensagem (ainda em português, traduzir com `t`) para uma falha do Vision. */
export function visionErrorText(error: unknown): string {
  if (error instanceof VisionDeniedError) return ERROR_TEXT[error.reason];
  if (isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401 || status === 403) return ERROR_TEXT.role;
    if (status === 400 || status === 422) return ERROR_TEXT.invalid;
    if (status === 409) return ERROR_TEXT.flow;
  }
  return ERROR_TEXT.generic;
}
