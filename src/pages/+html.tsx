import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * HTML raiz da versão web (só roda na geração estática, sem acesso ao DOM).
 * Não é uma rota: o Expo Router ignora o `+html.tsx` do topo de `src/pages`.
 *
 * É o mesmo HTML padrão do Expo SDK 57 (`@expo/router-server/src/static/html.tsx`), só que com
 * `lang="pt-BR"`. O padrão declara `en`: o navegador então oferece "traduzir do inglês" e a
 * tradução automática embaralha os rótulos em português do app.
 */
export default function Root({ children }: PropsWithChildren) {
  const { bodyAttributes, bodyNodes, htmlAttributes, headNodes } = useServerDocumentContext();

  return (
    <html lang="pt-BR" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}
