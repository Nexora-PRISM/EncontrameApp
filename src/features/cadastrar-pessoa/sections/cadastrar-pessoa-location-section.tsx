import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandMap } from '@/components/brand-map';
import { Radius, type BrandColors } from '@/constants/brand';
import type { CadastrarPessoaController } from '@/features/cadastrar-pessoa/cadastrar-pessoa.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

type Props = { controller: CadastrarPessoaController };

/** Ponto no mapa (opcional), logo abaixo do "Localidade". Sem ele, o caso não aparece no mapa nem na busca por perto. */
export function CadastrarPessoaLocationSection({ controller }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const place = controller.casePoint;

  return (
    <View style={styles.box}>
      <Text style={styles.title} accessibilityRole="header">
        {t('Ponto no mapa (opcional)')}
      </Text>
      <Text style={styles.hint}>
        {t('Ajuda a avisar quem está perto. Marque onde a pessoa foi vista, nunca o endereço de casa. O ponto fica com precisão de cerca de 100 metros e aparece no mapa do app.')}
      </Text>

      {place.point ? (
        <>
          <View style={styles.mapWrap}>
            <BrandMap
              pins={[{ id: 'case-point', latitude: place.point.latitude, longitude: place.point.longitude, draggable: true }]}
              rounded
              style={styles.map}
              onMapPress={place.moveTo}
              onPinDragEnd={(_id, latitude, longitude) => place.moveTo(latitude, longitude)}
            />
          </View>
          <Text style={styles.hint}>{t('Toque no mapa ou arraste o pin para indicar o local.')}</Text>
          {place.source === 'gps' ? (
            <Text style={styles.hint}>{t('Ponto marcado com a sua localização atual. Confira se é mesmo onde a pessoa foi vista.')}</Text>
          ) : null}
          <BrandButton label={t('Tirar o ponto do mapa')} variant="outline" onPress={place.clear} />
        </>
      ) : (
        <View style={styles.actions}>
          <BrandButton
            label={t('Marcar o local digitado')}
            variant="outline"
            trailingIcon="map-search-outline"
            loading={place.busy === 'address'}
            disabled={place.busy !== null}
            onPress={() => place.markFromText(controller.location)}
          />
          <BrandButton
            label={t('Estou nesse local agora')}
            variant="outline"
            trailingIcon="crosshairs-gps"
            loading={place.busy === 'gps'}
            disabled={place.busy !== null}
            onPress={place.markCurrentPosition}
          />
        </View>
      )}
      {place.error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {place.error}
        </Text>
      ) : null}
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    box: {
      gap: 10,
      padding: 14,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: brand.divider,
      backgroundColor: brand.surface,
    },
    title: { fontSize: 15, fontWeight: '800', color: brand.textDark },
    hint: { fontSize: 13, lineHeight: 18, color: brand.textMuted },
    actions: { gap: 10 },
    mapWrap: { borderRadius: Radius.md, overflow: 'hidden' },
    map: { height: 220, width: '100%' },
    error: { fontSize: 14, lineHeight: 20, color: brand.error },
  });
}
