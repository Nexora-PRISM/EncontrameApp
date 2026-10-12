import { type Href, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { confirmAction, showAlert } from '@/lib/dialog';
import { useT } from '@/lib/i18n';
import { maskPhone, onlyDigits } from '@/lib/masks';
import { useSafeBack } from '@/lib/safe-back';
import {
  MAX_TRUSTED_CONTACTS,
  type TrustedContact,
  loadTrustedContacts,
  newTrustedContactId,
  saveTrustedContacts,
  trustedContactErrors,
} from '@/lib/trusted-contacts';
import { useFieldErrors } from '@/lib/use-field-errors';

/** Lista de contatos de confiança (só neste aparelho): adicionar, remover e salvar. */
export function useContatosConfiancaController() {
  const t = useT();
  const goBack = useSafeBack('/configuracoes' as Href);
  const { setErrors, fieldError } = useFieldErrors();
  const [contacts, setContacts] = useState<TrustedContact[] | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void loadTrustedContacts()
        .then((list) => {
          if (!cancelled) setContacts(list);
        })
        .catch(() => {
          if (!cancelled) setContacts([]);
        });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const list = contacts ?? [];
  const full = list.length >= MAX_TRUSTED_CONTACTS;

  const persist = async (next: TrustedContact[], successMessage: string) => {
    setSaving(true);
    try {
      await saveTrustedContacts(next);
      // Relê o que ficou salvo: a tela mostra só o que está de fato no aparelho.
      setContacts(await loadTrustedContacts());
      showAlert(t('Pronto'), successMessage);
      return true;
    } catch {
      showAlert(t('Não foi possível salvar'), t('Tente novamente em instantes.'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const addContact = () => {
    if (full) return;
    const found = trustedContactErrors(name, phone, list);
    const fields = {
      ...(found.name ? { contactName: found.name } : {}),
      ...(found.phone ? { contactPhone: found.phone } : {}),
    };
    setErrors(fields);
    if (Object.keys(fields).length > 0) return;

    const contact: TrustedContact = {
      id: newTrustedContactId(),
      name: name.trim(),
      phone: onlyDigits(phone),
    };
    void persist([...list, contact], t('{name} foi adicionado(a) aos seus contatos de confiança.', { name: contact.name })).then(
      (ok) => {
        if (ok) {
          setName('');
          setPhone('');
        }
      },
    );
  };

  const removeContact = (contact: TrustedContact) => {
    void (async () => {
      const confirmed = await confirmAction({
        title: t('Remover {name}?', { name: contact.name }),
        message: t('O contato sai só desta lista. Nada é avisado a ele.'),
        confirmLabel: t('Remover'),
      });
      if (!confirmed) return;
      await persist(
        list.filter((item) => item.id !== contact.id),
        t('{name} saiu da lista.', { name: contact.name }),
      );
    })();
  };

  return {
    goBack,
    loading: contacts == null,
    contacts: list,
    full,
    max: MAX_TRUSTED_CONTACTS,
    name,
    setName: (value: string) => setName(value),
    phone,
    setPhone: (value: string) => setPhone(maskPhone(value)),
    fieldError,
    saving,
    addContact,
    removeContact,
  };
}

export type ContatosConfiancaController = ReturnType<typeof useContatosConfiancaController>;
