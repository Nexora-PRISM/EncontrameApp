import { useSafeBack } from '@/lib/safe-back';
import { openSupportEmail } from '@/lib/support';

export function useSegurancaInfantilController() {
  const goBack = useSafeBack('/');
  const openEmail = () => {
    void openSupportEmail({
      topic: 'denuncia',
      message: 'Denúncia relacionada à segurança infantil. Descreva o ocorrido e onde aparece no app, sem anexar nem reenviar material ilegal.',
    });
  };
  return { goBack, openSupportEmail: openEmail };
}

export type SegurancaInfantilController = ReturnType<typeof useSegurancaInfantilController>;
