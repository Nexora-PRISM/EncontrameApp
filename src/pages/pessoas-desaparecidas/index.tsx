import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomBar } from '@/components/bottom-bar';
import { RegisterFab } from '@/components/register-fab';
import { ScreenHeader } from '@/components/screen-header';
import { Radius, type BrandColors } from '@/constants/brand';
import { contentGutter } from '@/constants/theme';
import { usePessoasDesaparecidasController } from '@/features/pessoas-desaparecidas/pessoas-desaparecidas.controller';
import { PessoasDesaparecidasFiltersSection } from '@/features/pessoas-desaparecidas/sections/pessoas-desaparecidas-filters-section';
import { PessoasDesaparecidasListSection } from '@/features/pessoas-desaparecidas/sections/pessoas-desaparecidas-list-section';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { useWideLayout } from '@/lib/use-wide-layout';

export default function PessoasDesaparecidasPage() {
  const t = useT();
  const brand = useBrand();
  const { width } = useWideLayout();
  const gutter = contentGutter(width);
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const controller = usePessoasDesaparecidasController();

  const countLabel = controller.countReady
    ? controller.totalCount === 1
      ? t('{count} pessoa', { count: controller.totalCount })
      : t('{count} pessoas', { count: controller.totalCount })
    : null;

  const listHeader = (
    <View style={styles.header}>
      <ScreenHeader title={t('Pessoas desaparecidas')} />
      <PessoasDesaparecidasFiltersSection controller={controller} />
      <View style={styles.results}>
        <Text style={styles.count} accessibilityLiveRegion="polite">
          {countLabel ?? ' '}
        </Text>
        <View style={styles.toggle}>
          <Pressable
            onPress={() => controller.setView('photo')}
            hitSlop={4}
            style={[styles.toggleBtn, controller.view === 'photo' && styles.toggleBtnOn]}
            accessibilityRole="button"
            accessibilityLabel={t('Ver só as fotos')}
            accessibilityState={{ selected: controller.view === 'photo' }}
          >
            <MaterialCommunityIcons
              name="view-grid-outline"
              size={20}
              color={controller.view === 'photo' ? brand.orange : brand.textMuted}
            />
          </Pressable>
          <Pressable
            onPress={() => controller.setView('card')}
            hitSlop={4}
            style={[styles.toggleBtn, controller.view === 'card' && styles.toggleBtnOn]}
            accessibilityRole="button"
            accessibilityLabel={t('Ver cartões com detalhes')}
            accessibilityState={{ selected: controller.view === 'card' }}
          >
            <MaterialCommunityIcons
              name="card-text-outline"
              size={20}
              color={controller.view === 'card' ? brand.orange : brand.textMuted}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PessoasDesaparecidasListSection
        controller={controller}
        header={listHeader}
        style={styles.list}
        contentContainerStyle={{ paddingHorizontal: gutter, paddingTop: 8 }}
      />
      <BottomBar />
      <RegisterFab always />
    </SafeAreaView>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: brand.white,
    },
    list: {
      flex: 1,
      width: '100%',
      alignSelf: 'stretch',
    },
    header: {
      gap: 8,
      marginBottom: 4,
    },
    results: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      minHeight: 36,
    },
    count: {
      flex: 1,
      color: brand.textDark,
      fontSize: 15,
      fontWeight: '700',
    },
    toggle: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 2,
      borderRadius: Radius.pill,
      backgroundColor: brand.fieldBackground,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    toggleBtn: {
      width: 34,
      height: 30,
      borderRadius: Radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    toggleBtnOn: {
      backgroundColor: brand.surface,
    },
  });
}
