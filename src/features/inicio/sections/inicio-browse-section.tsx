import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentShell } from '@/components/content-shell';
import { type BrandColors } from '@/constants/brand';
import type { InicioController } from '@/features/inicio/inicio.controller';
import { MAP_PEEK_HEIGHT } from '@/features/inicio/sections/inicio-map-section';
import { InicioTopBarSection } from '@/features/inicio/sections/inicio-top-bar-section';
import { usePessoasDesaparecidasController } from '@/features/pessoas-desaparecidas/pessoas-desaparecidas.controller';
import { PessoasDesaparecidasFiltersSection } from '@/features/pessoas-desaparecidas/sections/pessoas-desaparecidas-filters-section';
import { PessoasDesaparecidasListSection } from '@/features/pessoas-desaparecidas/sections/pessoas-desaparecidas-list-section';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

interface InicioBrowseSectionProps {
  controller: InicioController;
}

/** Busca e lista de pessoas que substituem o carrossel quando o mapa está recolhido. */
export function InicioBrowseSection({ controller }: InicioBrowseSectionProps) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const list = usePessoasDesaparecidasController();

  const header = (
    <View style={styles.header}>
      <InicioTopBarSection
        controller={controller}
        showMenu={false}
        embedded
        browseQuery={list.query}
        onBrowseQueryChange={list.setQuery}
      />
      {list.totalCount > 0 ? (
        <Text style={styles.count}>
          {t(list.totalCount === 1 ? '{count} pessoa' : '{count} pessoas', {
            count: list.totalCount,
          })}
        </Text>
      ) : null}
      <PessoasDesaparecidasFiltersSection controller={list} hideQueryField />
    </View>
  );

  return (
    <SafeAreaView style={styles.fill} edges={['top']}>
      <ContentShell style={styles.fill}>
        <PessoasDesaparecidasListSection
          controller={list}
          header={header}
          style={styles.fill}
          contentContainerStyle={styles.listBottom}
        />
      </ContentShell>
    </SafeAreaView>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    fill: {
      flex: 1,
    },
    header: {
      gap: 8,
      marginBottom: 12,
    },
    count: {
      color: brand.textMuted,
      fontWeight: '600',
    },
    listBottom: {
      paddingBottom: MAP_PEEK_HEIGHT + 24,
    },
  });
}
