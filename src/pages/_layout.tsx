import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import { type Href, Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BrandSplash } from '@/components/brand-splash';
import type { BrandColors } from '@/constants/brand';
import { WebShellFrame } from '@/features/web-shell/web-shell-frame';
import { ApiErrorModalProvider } from '@/lib/api-error-modal';
import { setSessionExpiredHandler } from '@/lib/auth-events';
import { isProtectedPath } from '@/lib/auth-guard';
import { BrandThemeProvider, useBrand, useBrandColorScheme } from '@/lib/brand-theme';
import { I18nProvider, useI18n } from '@/lib/i18n';
import { queryClient } from '@/lib/query-client';
import { getSessionUser, hydrateSession } from '@/lib/session';
import { markSplashDone, useSplashDone } from '@/lib/splash-state';

// Só no popup do OAuth (tem opener). Completa e deixa o app pai fechar a janela
// antes do Expo Router redirecionar `/` → `/inicio` → `/login`.
if (Platform.OS === 'web' && typeof window !== 'undefined' && window.opener) {
  WebBrowser.maybeCompleteAuthSession({ skipRedirectCheck: true });
}

function RootLayoutInner() {
  const router = useRouter();
  const pathname = usePathname();
  const brand = useBrand();
  const colorScheme = useBrandColorScheme();
  const { ready: languageReady } = useI18n();
  const [sessionReady, setSessionReady] = useState(false);
  const splashDone = useSplashDone();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  const blocked = sessionReady && isProtectedPath(pathname) && getSessionUser() == null;

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      await hydrateSession();
      if (!cancelled) {
        setSessionReady(true);
      }
    })();

    setSessionExpiredHandler(() => {
      router.replace('/login');
    });

    return () => {
      cancelled = true;
      setSessionExpiredHandler(null);
    };
  }, [router]);

  useEffect(() => {
    if (!blocked) return;
    router.replace({ pathname: '/login', params: { returnTo: pathname } } as Href);
  }, [blocked, pathname, router]);

  // Espera o idioma salvo para não abrir a tela num idioma e trocar logo depois.
  const showStack = sessionReady && languageReady && !blocked;

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      {showStack ? (
        <WebShellFrame>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: brand.white },
              animation: 'slide_from_right',
              animationMatchesGesture: true,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="signup-password" />
            <Stack.Screen name="inicio" />
            <Stack.Screen name="cadastrar-pessoa" />
            <Stack.Screen name="pessoas-proximas" />
            <Stack.Screen name="pessoas-desaparecidas" />
            <Stack.Screen name="pessoa/[id]" />
            <Stack.Screen name="chat" />
            <Stack.Screen name="exercises" />
            <Stack.Screen name="grupo-chat" />
            <Stack.Screen name="sofia-welcome" />
            <Stack.Screen name="sofia-theme" />
            <Stack.Screen name="sofia-perfil" />
            <Stack.Screen name="perfil" />
            <Stack.Screen name="configuracoes" />
            <Stack.Screen name="ajuda" />
            <Stack.Screen name="sobre" />
            <Stack.Screen name="pedir-ajuda" />
            <Stack.Screen name="regras" />
            <Stack.Screen name="alerta-emergencia" />
            <Stack.Screen name="compartilhar-localizacao" />
            <Stack.Screen name="contatos-confianca" />
            <Stack.Screen name="aviso-seguranca" />
          </Stack>
        </WebShellFrame>
      ) : (
        <View style={styles.boot} />
      )}
      {/* Abertura com "Um produto da Nexora Prism" no rodapé; some sozinha quando o app está pronto. */}
      {splashDone ? null : <BrandSplash ready={showStack} onDone={markSplashDone} />}
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={rootStyle}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <I18nProvider>
            <BrandThemeProvider>
              <ApiErrorModalProvider>
                <RootLayoutInner />
              </ApiErrorModalProvider>
            </BrandThemeProvider>
          </I18nProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const rootStyle = { flex: 1 } as const;

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    boot: {
      flex: 1,
      backgroundColor: brand.navy,
    },
  });
}
