import { usePathname } from 'expo-router';
import Head from 'expo-router/head';
import { Platform } from 'react-native';

import { AppInfo } from '@/lib/app-info';
import { useT } from '@/lib/i18n';
import { pageTitleFor } from '@/lib/page-titles';

/** Título da aba do navegador conforme a rota atual. Só tem efeito no web. */
export function DocumentTitle() {
  const t = useT();
  const pathname = usePathname();

  if (Platform.OS !== 'web') return null;

  const page = pageTitleFor(pathname);
  const title = page ? `${t(page)} — ${AppInfo.name}` : AppInfo.name;

  return (
    <Head>
      <title>{title}</title>
    </Head>
  );
}
