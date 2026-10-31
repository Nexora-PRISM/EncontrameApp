import { type Href } from 'expo-router';
import { useState } from 'react';

import { checkFileAgainstManifest, type FileCheck, type Manifest } from '@/lib/central-rules';
import { useT } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';
import { sha256Hex } from '@/lib/sha256';
import { canUseWebFiles, pickFiles } from '@/lib/web-file';

type Checked = { name: string; size: number; sha256: string; result: FileCheck | null };

/**
 * "/verificar-integridade": confere arquivos de um pacote com o manifesto SHA-256. Funciona no navegador, sem conta e
 * sem enviar nada pela internet (o cálculo é feito neste computador).
 */
export function useVerificarController() {
  const t = useT();
  const goBack = useSafeBack('/inicio' as Href);
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [manifestError, setManifestError] = useState<string | undefined>();
  const [checked, setChecked] = useState<Checked[]>([]);
  const [busy, setBusy] = useState(false);

  const pickManifest = () => {
    void (async () => {
      const [file] = await pickFiles({ accept: '.json,application/json' });
      if (!file) return;
      try {
        const parsed = JSON.parse(new TextDecoder().decode(file.bytes)) as Manifest;
        if (parsed?.format !== 'encontrame-manifest-1' || !Array.isArray(parsed.files)) throw new Error('format');
        setManifest(parsed);
        setManifestError(undefined);
        setChecked((list) => list.map((item) => ({ ...item, result: checkFileAgainstManifest(parsed, item.name, item.sha256) })));
      } catch {
        setManifest(null);
        setManifestError(t('Este arquivo não é um manifesto do Encontra-me (manifesto-integridade.json).'));
      }
    })();
  };

  const pickToCheck = () => {
    void (async () => {
      const files = await pickFiles({ multiple: true });
      if (files.length === 0) return;
      setBusy(true);
      // Deixa a tela mostrar "calculando" antes do cálculo, que é feito neste aparelho.
      await new Promise((resolve) => setTimeout(resolve, 30));
      const results = files.map((file) => {
        const sha256 = sha256Hex(file.bytes);
        return {
          name: file.name,
          size: file.bytes.length,
          sha256,
          result: manifest ? checkFileAgainstManifest(manifest, file.name, sha256) : null,
        };
      });
      setChecked((list) => [...results, ...list]);
      setBusy(false);
    })();
  };

  return {
    goBack,
    web: canUseWebFiles(),
    manifest,
    manifestError,
    checked,
    busy,
    pickManifest,
    pickToCheck,
    clear: () => setChecked([]),
  };
}

export type VerificarController = ReturnType<typeof useVerificarController>;
