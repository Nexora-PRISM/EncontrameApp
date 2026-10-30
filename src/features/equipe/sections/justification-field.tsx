import { BrandField } from '@/components/brand-field';
import type { Justification } from '@/features/equipe/use-justification';
import { useT } from '@/lib/i18n';
import { JUSTIFICATION_MAX } from '@/lib/team-rules';

/** Campo único de justificativa da tela: vale para a próxima decisão tomada. */
export function JustificationField({ justification }: { justification: Justification }) {
  const t = useT();
  return (
    <BrandField
      label={t('Justificativa da decisão')}
      value={justification.text}
      onChangeText={justification.setText}
      placeholder={t('Ex.: família confirmou por telefone que a informação está correta.')}
      maxLength={JUSTIFICATION_MAX}
      multiline
      required
      error={justification.error}
    />
  );
}
