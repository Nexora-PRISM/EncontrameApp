import { Platform } from 'react-native';

import { useWideLayout } from '@/lib/use-wide-layout';

/**
 * Na web em tela larga, o header do Início e a lista de pessoas próximas ficam fixos em todas
 * as páginas (layout raiz). No celular e no app nativo cada tela continua cuidando do seu topo.
 */
export function useWebShell(): boolean {
  const { isWide } = useWideLayout();
  return Platform.OS === 'web' && isWide;
}
