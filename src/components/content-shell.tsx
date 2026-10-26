import { View, type StyleProp, type ViewStyle } from 'react-native';

import { contentGutter } from '@/constants/theme';
import { useWideLayout } from '@/lib/use-wide-layout';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Quando true, não aplica a margem horizontal (útil se o padding vier das sections). */
  noGutter?: boolean;
  /**
   * Largura máxima opcional. Sem isso o bloco ocupa a tela inteira e a margem fica só no
   * padding — o scroll do pai, quando existe, permanece na borda da janela.
   */
  maxWidth?: number;
};

/** Margem horizontal pequena, que acompanha a largura da janela. */
export function ContentShell({ children, style, noGutter = false, maxWidth }: Props) {
  const { width } = useWideLayout();
  const gutter = contentGutter(width);

  return (
    <View
      style={[
        { width: '100%', alignSelf: 'center' },
        maxWidth != null ? { maxWidth } : null,
        !noGutter && { paddingHorizontal: gutter },
        style,
      ]}
    >
      {children}
    </View>
  );
}
