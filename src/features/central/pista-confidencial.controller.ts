import { type Href, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { CONTACT_PREFERENCE_LABEL } from '@/lib/central-labels';
import {
  containsPersonalData,
  splitTip,
  TIP_CONTACT_PREFERENCES,
  type TipContactPreference,
  type TipError,
  validateConfidentialTip,
} from '@/lib/central-rules';
import { isReceiptConfirmed } from '@/lib/collaboration-rules';
import { env } from '@/lib/env';
import { useT } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';
import { useSessionUser } from '@/lib/use-session-user';
import { useConfidentialTipMutation } from '@/services/central/central.service';

type Receipt = { id: string; receivedAt: string; simulated: boolean };

/** "/pista-confidencial": enviar uma informação sem expor a identidade publicamente. Não exige conta. */
export function usePistaConfidencialController() {
  const t = useT();
  const params = useLocalSearchParams<{ caso?: string | string[] }>();
  const caseId = (Array.isArray(params.caso) ? params.caso[0] : params.caso) ?? '';
  const goBack = useSafeBack((caseId ? `/pessoa/${caseId}` : '/inicio') as Href);
  const user = useSessionUser();
  const mutation = useConfidentialTipMutation();

  const [text, setText] = useState('');
  const [when, setWhen] = useState('');
  const [place, setPlace] = useState('');
  const [preference, setPreference] = useState<TipContactPreference>('none');
  const [contact, setContact] = useState('');
  const [name, setName] = useState('');
  const [understood, setUnderstood] = useState(false);
  const [errors, setErrors] = useState<TipError[]>([]);
  const [message, setMessage] = useState<string | undefined>();
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const preferences = TIP_CONTACT_PREFERENCES.filter((value) => value !== 'in_app' || user != null);

  const submit = () => {
    const input = {
      caseId,
      text,
      when,
      place,
      contactPreference: preference,
      contact,
      name: preference === 'none' ? '' : name,
      understood,
    };
    const found = validateConfidentialTip(input);
    setErrors(found);
    setMessage(undefined);
    if (found.length > 0) return;
    void (async () => {
      try {
        const result = await mutation.mutateAsync(splitTip(input));
        if (!isReceiptConfirmed(result.id, result.receivedAt) || !result.id || !result.receivedAt) {
          setMessage(t('O envio não foi confirmado. Tente de novo em alguns instantes.'));
          return;
        }
        setReceipt({ id: result.id, receivedAt: result.receivedAt, simulated: result.simulated === true });
      } catch {
        setMessage(t('O envio não foi confirmado. Tente de novo em alguns instantes.'));
      }
    })();
  };

  return {
    goBack,
    enabled: env.confidentialTipsEnabled,
    caseId,
    loggedIn: user != null,
    fields: { text, when, place, preference, contact, name, understood },
    preferenceOptions: preferences.map((value) => ({ value, label: t(CONTACT_PREFERENCE_LABEL[value]) })),
    personalDataInText: containsPersonalData(text),
    errors,
    message,
    sending: mutation.isPending,
    receipt,
    setText: (value: string) => {
      setText(value);
      setErrors((list) => list.filter((item) => item !== 'text_short' && item !== 'text_long'));
    },
    setWhen,
    setPlace,
    setPreference: (value: TipContactPreference) => {
      setPreference(value);
      setErrors((list) => list.filter((item) => item !== 'contact'));
    },
    setContact: (value: string) => {
      setContact(value);
      setErrors((list) => list.filter((item) => item !== 'contact'));
    },
    setName,
    toggleUnderstood: () => {
      setUnderstood((value) => !value);
      setErrors((list) => list.filter((item) => item !== 'understood'));
    },
    submit,
    sendAnother: () => {
      setReceipt(null);
      setText('');
      setWhen('');
      setPlace('');
      setContact('');
      setName('');
      setUnderstood(false);
    },
  };
}

export type PistaConfidencialController = ReturnType<typeof usePistaConfidencialController>;
