import { Platform } from 'react-native';

/** `nativeID` do cartaz: no web vira o `id` do elemento, usado pelo CSS de impressão. */
export const POSTER_PRINT_ID = 'encontrame-cartaz';
const STYLE_ID = 'encontrame-cartaz-print';

/** Impressão (e "Salvar como PDF" do navegador) só existe na versão web. */
export function canPrintPoster(): boolean {
  return Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.print === 'function';
}

/** Abre a impressão do navegador mostrando só o cartaz. Devolve false fora do web. */
export function printPoster(): boolean {
  if (!canPrintPoster() || typeof document === 'undefined') return false;
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `@media print {
  body * { visibility: hidden !important; }
  #${POSTER_PRINT_ID}, #${POSTER_PRINT_ID} * {
    visibility: visible !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  #${POSTER_PRINT_ID} { position: fixed !important; left: 0 !important; top: 0 !important; }
  @page { margin: 10mm; }
}`;
    document.head.appendChild(style);
  }
  window.print();
  return true;
}
