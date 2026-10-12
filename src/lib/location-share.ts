import { type Translate, ptTranslate } from '@/lib/i18n';

/**
 * Mensagem e links para mandar a localização atual a um contato (WhatsApp, SMS ou o
 * compartilhamento do sistema). Nada sai sozinho: o app abre o aplicativo escolhido com o texto
 * pronto e a pessoa toca em enviar — por isso a tela nunca diz que a mensagem "foi entregue".
 */

export interface SharedLocation {
  latitude: number;
  longitude: number;
  /** Precisão do GPS em metros. */
  accuracy: number | null;
  /** Quando a posição foi obtida (epoch em ms). */
  capturedAt: number;
}

export type LocationMessageMode = 'emergency' | 'share';

/** Link que abre no Google Maps (e em qualquer navegador) — funciona sem o app instalado. */
export function mapsLink(latitude: number, longitude: number): string {
  return `https://maps.google.com/?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`;
}

const pad = (value: number) => String(value).padStart(2, '0');

/** Hora local no formato 20:31. */
export function formatClock(epochMs: number): string {
  const date = new Date(epochMs);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function describeAccuracy(
  accuracy: number | null,
  t: Translate = ptTranslate,
): string | null {
  if (accuracy == null || !Number.isFinite(accuracy) || accuracy <= 0) return null;
  return t('precisão de cerca de {meters} m', { meters: Math.max(5, Math.round(accuracy)) });
}

/** Mensagem pronta, no idioma do app (`t`). */
export function buildLocationMessage(
  location: SharedLocation | null,
  mode: LocationMessageMode,
  t: Translate = ptTranslate,
): string {
  const lines: string[] = [];
  if (mode === 'emergency') lines.push(t('PRECISO DE AJUDA.'));

  if (location) {
    const details = [
      describeAccuracy(location.accuracy, t),
      t('às {time}', { time: formatClock(location.capturedAt) }),
    ]
      .filter(Boolean)
      .join(', ');
    lines.push(
      t('Minha localização agora: {link} ({details}).', {
        link: mapsLink(location.latitude, location.longitude),
        details,
      }),
    );
  } else {
    lines.push(t('Não consegui pegar minha localização pelo GPS.'));
  }

  if (mode === 'emergency') lines.push(t('Se não conseguir falar comigo, ligue 190.'));
  lines.push(t('Enviado pelo app Encontra-me.'));
  return lines.join('\n');
}

/**
 * Telefone brasileiro em dígitos com o DDI 55 (ex.: 5531999998888), como o WhatsApp e o SMS
 * esperam. Aceita "(31) 99999-8888", "031999998888" e "+55 31 99999-8888". Inválido → null.
 */
export function toBrazilPhoneWithCountry(input: string): string | null {
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.length === 12 && digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);

  const local =
    (digits.length === 12 || digits.length === 13) && digits.startsWith('55')
      ? digits.slice(2)
      : digits;
  if (local.length !== 10 && local.length !== 11) return null;
  if (local[0] === '0' || local[1] === '0') return null;
  return `55${local}`;
}

export function whatsappLink(phoneWithCountry: string, message: string): string {
  return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
}

/** No iOS o texto vai depois de "&"; no Android e no web, depois de "?". */
export function smsLink(phoneWithCountry: string, message: string, os: string): string {
  const separator = os === 'ios' ? '&' : '?';
  return `sms:+${phoneWithCountry}${separator}body=${encodeURIComponent(message)}`;
}
