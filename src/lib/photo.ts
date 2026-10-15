import type { ErrorCode } from '@/lib/validation';

/** Tamanho máximo da foto enviada no cadastro (pessoa ou pet). */
export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

const ALLOWED_WEB_MIME = new Set(['image/png', 'image/jpeg', 'image/jpg']);

/** Remove o prefixo `data:image/...;base64,` quando a foto chega como data URL. */
export function stripDataUrlPrefix(value: string): string {
  const trimmed = value.trim();
  const comma = trimmed.indexOf(',');
  if (trimmed.startsWith('data:') && comma >= 0) {
    return trimmed.slice(comma + 1);
  }
  return trimmed;
}

/** Tamanho aproximado, em bytes, de um payload base64. */
export function estimateBase64Bytes(base64: string): number {
  if (!base64) return 0;
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

/** PNG ou JPG, pelo tipo MIME ou pela extensão do arquivo. */
export function isAllowedPhotoFile(type: string, name: string): boolean {
  return ALLOWED_WEB_MIME.has(type) || /\.(png|jpe?g)$/i.test(name);
}

/**
 * Foto pronta para envio: base64 não vazio e dentro do limite.
 * Aceita o payload puro ou uma data URL.
 */
export function photoSizeError(
  base64OrDataUrl: string,
  maxBytes = MAX_PHOTO_BYTES,
): Extract<ErrorCode, 'photo_empty' | 'photo_too_large'> | undefined {
  const size = estimateBase64Bytes(stripDataUrlPrefix(base64OrDataUrl));
  if (size <= 0) return 'photo_empty';
  if (size > maxBytes) return 'photo_too_large';
  return undefined;
}
