/**
 * Config Expo com suporte a env (API key do Google Maps no build nativo).
 * Mantém o conteúdo de app.json e acrescenta o plugin do react-native-maps.
 */
const fs = require('fs');
const path = require('path');

const appJson = require('./app.json');

/** Preenche process.env a partir de arquivos locais sem sobrescrever o ambiente da máquina. */
function applyEnvFile(fileName) {
  const file = path.join(__dirname, fileName);
  if (!fs.existsSync(file)) {
    return;
  }

  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const eq = line.indexOf('=');
    if (eq <= 0) {
      continue;
    }

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined || process.env[key] === '') {
      process.env[key] = value;
    }
  }
}

applyEnvFile('.env');
applyEnvFile('.env.local');

/**
 * Firebase (push no Android). No EAS, use a variável de arquivo GOOGLE_SERVICES_JSON;
 * localmente, o google-services.json na raiz. Sem nenhum dos dois, o build sai sem push remoto.
 */
const googleServicesFile =
  process.env.GOOGLE_SERVICES_JSON ||
  (fs.existsSync(path.join(__dirname, 'google-services.json')) ? './google-services.json' : undefined);

/**
 * Trajeto compartilhado com a tela desligada (evolução). Desligado por padrão: o build continua só com a localização
 * "com o app aberto". Com TRIP_BACKGROUND_LOCATION=true, o build declara a localização em segundo plano (Android:
 * ACCESS_BACKGROUND_LOCATION e serviço em primeiro plano com aviso fixo; iOS: "Sempre" e modo de fundo "location").
 * Antes de publicar um build assim: declaração de localização em segundo plano no Google Play Console (com vídeo) e
 * justificativa na revisão da App Store. Detalhes em docs/evolucao/TRAJETO.md.
 */
const tripBackgroundLocation = process.env.TRIP_BACKGROUND_LOCATION === 'true';

const ALWAYS_TEXT = {
  pt: 'O Encontra-me usa sua localização com a tela desligada só enquanto você compartilha um trajeto com contatos que escolheu. O envio para quando você chega ou encerra.',
  en: 'Encontra-me uses your location with the screen off only while you share a trip with contacts you chose. It stops when you arrive or end sharing.',
  es: 'Encontra-me usa tu ubicación con la pantalla apagada solo mientras compartes un trayecto con contactos que elegiste. Se detiene cuando llegas o terminas.',
};

function withTripBackgroundLocation(plugins) {
  if (!tripBackgroundLocation) return plugins;
  return plugins.map((plugin) =>
    Array.isArray(plugin) && plugin[0] === 'expo-location'
      ? [
          'expo-location',
          {
            ...plugin[1],
            locationAlwaysAndWhenInUsePermission: ALWAYS_TEXT.pt,
            isAndroidBackgroundLocationEnabled: true,
            isAndroidForegroundServiceEnabled: true,
            isIosBackgroundLocationEnabled: true,
          },
        ]
      : plugin,
  );
}

/** Textos do iOS por idioma: com o segundo plano ligado, acrescenta o da permissão "Sempre". */
function tripLocales(locales) {
  if (!tripBackgroundLocation || !locales) return locales;
  return Object.fromEntries(
    Object.entries(locales).map(([language, file]) => {
      const content = JSON.parse(fs.readFileSync(path.join(__dirname, file), 'utf8'));
      const text = ALWAYS_TEXT[language] ?? ALWAYS_TEXT.pt;
      return [language, { ...content, ios: { ...content.ios, NSLocationAlwaysAndWhenInUseUsageDescription: text } }];
    }),
  );
}

/** @type {import('expo/config').ExpoConfig} */
const config = {
  ...appJson.expo,
  locales: tripLocales(appJson.expo.locales),
  android: {
    ...appJson.expo.android,
    ...(googleServicesFile ? { googleServicesFile } : {}),
  },
  ios: {
    ...appJson.expo.ios,
    infoPlist: {
      ...appJson.expo.ios?.infoPlist,
      ...(tripBackgroundLocation ? { NSLocationAlwaysAndWhenInUseUsageDescription: ALWAYS_TEXT.pt } : {}),
    },
  },
  plugins: [
    ...withTripBackgroundLocation(appJson.expo.plugins ?? []),
    [
      'react-native-maps',
      {
        androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? '',
      },
    ],
    'expo-sqlite',
  ],
  extra: {
    ...appJson.expo.extra,
    /** O app só oferece o envio com a tela desligada quando o build declarou a permissão. */
    tripBackgroundLocation,
    eas: {
      ...appJson.expo.extra?.eas,
      projectId: '27a85005-d936-4e6e-b952-8ddaebea8da1',
    },
  },
};

module.exports = { expo: config };
