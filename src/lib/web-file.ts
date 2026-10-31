import { Platform } from 'react-native';

import { toArrayBuffer } from '@/lib/encrypted-package';

/**
 * Arquivos no navegador (versão web): baixar, abrir para imprimir e escolher arquivos do computador.
 * No celular estes recursos não existem sem bibliotecas novas; as telas mostram que são da versão web.
 */
export function canUseWebFiles(): boolean {
  return Platform.OS === 'web' && typeof document !== 'undefined' && typeof URL !== 'undefined' && typeof Blob !== 'undefined';
}

export function downloadBytes(bytes: Uint8Array, fileName: string, mime: string): boolean {
  if (!canUseWebFiles()) return false;
  const url = URL.createObjectURL(new Blob([toArrayBuffer(bytes)], { type: mime }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return true;
}

export function downloadText(text: string, fileName: string, mime = 'text/plain;charset=utf-8'): boolean {
  if (!canUseWebFiles()) return false;
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return true;
}

/** Abre o relatório numa janela própria e chama a impressão (o navegador oferece "Salvar como PDF"). */
export function printHtml(html: string): boolean {
  if (!canUseWebFiles()) return false;
  const win = window.open('', '_blank');
  if (!win) return false;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
  return true;
}

export type PickedFile = { name: string; bytes: Uint8Array };

/** Escolher arquivos do computador. Resolve com lista vazia se a pessoa cancelar. */
export function pickFiles(options: { accept?: string; multiple?: boolean } = {}): Promise<PickedFile[]> {
  if (!canUseWebFiles()) return Promise.resolve([]);
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    if (options.accept) input.accept = options.accept;
    input.multiple = options.multiple ?? false;
    input.onchange = async () => {
      const list = Array.from(input.files ?? []);
      const files = await Promise.all(
        list.map(async (file) => ({ name: file.name, bytes: new Uint8Array(await file.arrayBuffer()) })),
      );
      resolve(files);
    };
    input.click();
  });
}
