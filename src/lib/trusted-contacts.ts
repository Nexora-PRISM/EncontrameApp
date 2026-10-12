import { getLocalItem, setLocalItem } from '@/lib/local-store';
import { onlyDigits } from '@/lib/masks';
import { type ErrorCode, isPhone, textError } from '@/lib/validation';

/**
 * Contatos de confiança: pessoas para quem a gente manda a localização com um toque
 * (WhatsApp ou SMS). Ficam SÓ neste aparelho — no Android/iOS dentro do armazenamento seguro
 * do sistema — e não vão para o servidor.
 */
export interface TrustedContact {
  id: string;
  name: string;
  /** Só dígitos, com DDD (10 ou 11). */
  phone: string;
}

export const MAX_TRUSTED_CONTACTS = 5;
export const CONTACT_NAME_MAX = 40;

const STORAGE_KEY = 'encontrame.trustedContacts';

/** Lê a lista salva, descartando o que estiver corrompido. */
export function parseTrustedContacts(raw: string | null): TrustedContact[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const contacts: TrustedContact[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue;
      const { id, name, phone } = item as Record<string, unknown>;
      if (typeof id !== 'string' || typeof name !== 'string' || typeof phone !== 'string') continue;
      const digits = onlyDigits(phone);
      if (!id || !name.trim() || !isPhone(digits)) continue;
      contacts.push({ id, name: name.trim().slice(0, CONTACT_NAME_MAX), phone: digits });
      if (contacts.length === MAX_TRUSTED_CONTACTS) break;
    }
    return contacts;
  } catch {
    return [];
  }
}

export async function loadTrustedContacts(): Promise<TrustedContact[]> {
  return parseTrustedContacts(await getLocalItem(STORAGE_KEY));
}

export async function saveTrustedContacts(contacts: TrustedContact[]): Promise<void> {
  const clean = contacts.slice(0, MAX_TRUSTED_CONTACTS).map(({ id, name, phone }) => ({
    id,
    name: name.trim().slice(0, CONTACT_NAME_MAX),
    phone: onlyDigits(phone),
  }));
  await setLocalItem(STORAGE_KEY, JSON.stringify(clean));
}

export function newTrustedContactId(): string {
  return `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

/** Erros do formulário "Adicionar contato" (nome e celular). */
export function trustedContactErrors(
  name: string,
  phone: string,
  existing: TrustedContact[],
): { name?: ErrorCode; phone?: ErrorCode } {
  const errors: { name?: ErrorCode; phone?: ErrorCode } = {};
  const nameCode = textError(name, 2);
  if (nameCode) errors.name = nameCode;
  if (!phone.trim()) errors.phone = 'required';
  else if (!isPhone(phone)) errors.phone = 'invalid_format';
  else if (existing.some((contact) => contact.phone === onlyDigits(phone))) {
    errors.phone = 'already_registered';
  }
  return errors;
}
