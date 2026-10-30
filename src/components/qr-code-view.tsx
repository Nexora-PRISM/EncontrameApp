import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { BrandPalettes } from '@/constants/brand';
import { encodeQr, qrDarkRuns } from '@/lib/qr-code';

type Props = {
  value: string;
  /** Lado total em pixels, já com a margem branca obrigatória de 4 módulos. */
  size: number;
  accessibilityLabel?: string;
};

const QUIET_ZONE = 4;
/** QR Code sempre preto no branco (tema claro), também no tema escuro: é o que as câmeras leem melhor. */
const INK = BrandPalettes.light.textDark;
const PAPER = BrandPalettes.light.surface;

/** Desenha um QR Code com retângulos (um por trecho escuro de cada linha). Sem dependências. */
export function QrCodeView({ value, size, accessibilityLabel }: Props) {
  const matrix = useMemo(() => encodeQr(value), [value]);
  const runs = useMemo(() => (matrix ? qrDarkRuns(matrix) : []), [matrix]);
  if (!matrix) return null;

  const module = size / (matrix.size + QUIET_ZONE * 2);
  return (
    <View
      style={[styles.paper, { width: size, height: size }]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      {runs.map((run) => (
        <View
          key={`${run.y}-${run.x}`}
          style={[
            styles.ink,
            {
              left: (run.x + QUIET_ZONE) * module,
              top: (run.y + QUIET_ZONE) * module,
              width: run.length * module + 0.5,
              height: module + 0.5,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  paper: {
    position: 'relative',
    backgroundColor: PAPER,
    overflow: 'hidden',
  },
  ink: {
    position: 'absolute',
    backgroundColor: INK,
  },
});
