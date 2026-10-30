import { useState } from 'react';

import { useT } from '@/lib/i18n';
import { justificationError } from '@/lib/team-rules';

/** Justificativa obrigatória das decisões da equipe (uma por tela, limpa depois de cada decisão). */
export function useJustification() {
  const t = useT();
  const [text, setText] = useState('');
  const [error, setError] = useState<string | undefined>();

  /** Devolve o texto pronto ou null (e marca o erro) se ainda não estiver bom. */
  const take = (): string | null => {
    const problem = justificationError(text);
    if (problem === 'required') setError(t('Escreva a justificativa antes de decidir.'));
    else if (problem === 'too_short') setError(t('Escreva pelo menos 10 letras.'));
    else if (problem === 'too_long') setError(t('Texto muito longo.'));
    else {
      setError(undefined);
      return text.trim();
    }
    return null;
  };

  return {
    text,
    error,
    setText: (value: string) => {
      setText(value);
      if (error) setError(undefined);
    },
    take,
    clear: () => {
      setText('');
      setError(undefined);
    },
  };
}

export type Justification = ReturnType<typeof useJustification>;
