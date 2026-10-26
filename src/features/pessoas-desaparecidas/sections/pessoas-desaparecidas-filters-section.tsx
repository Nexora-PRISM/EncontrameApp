import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandEnter } from '@/components/brand-enter';
import { BrandField } from '@/components/brand-field';
import { BrandSelect } from '@/components/brand-select';
import { FormRow } from '@/components/form-row';
import { Radius, type BrandColors } from '@/constants/brand';
import {
  ADDRESS_SCOPE_OPTIONS,
  STATUS_FILTER_OPTIONS,
  type PessoasDesaparecidasController,
} from '@/features/pessoas-desaparecidas/pessoas-desaparecidas.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { useWideLayout } from '@/lib/use-wide-layout';

interface PessoasDesaparecidasFiltersSectionProps {
  controller: PessoasDesaparecidasController;
  /** Na home recolhida a busca fica na barra Encontra-me. */
  hideQueryField?: boolean;
}

export function PessoasDesaparecidasFiltersSection({
  controller,
  hideQueryField = false,
}: PessoasDesaparecidasFiltersSectionProps) {
  const t = useT();
  const brand = useBrand();
  const { isWide } = useWideLayout();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const statusLabel =
    STATUS_FILTER_OPTIONS.find((option) => option.id === controller.statusId)?.label ?? 'Todos';
  const scopeLabel =
    ADDRESS_SCOPE_OPTIONS.find((option) => option.id === controller.addressScope)?.label ??
    'Última vez vista';
  const filtersButton = (
    <BrandButton
      label={
        controller.filtersOpen
          ? t('Ocultar filtros')
          : controller.hasActiveFilters
            ? t('Filtros (ativos)')
            : t('Filtros')
      }
      variant="outline"
      trailingIcon="filter-outline"
      onPress={controller.toggleFilters}
      style={isWide ? styles.filtersButtonWide : undefined}
    />
  );

  return (
    <View style={styles.wrapper}>
      {hideQueryField ? null : (
        <BrandField
          label={t('Pesquisar')}
          value={controller.query}
          onChangeText={controller.setQuery}
          placeholder={t('Nome ou apelido')}
          trailingIcon="magnify"
        />
      )}

      <View style={isWide ? styles.toolbar : styles.stack}>
        {isWide ? null : filtersButton}

        <View style={styles.quickRow} accessibilityRole="radiogroup" accessibilityLabel={t('Faixa de idade')}>
          {[
            { on: false, label: t('Todas as idades') },
            { on: true, label: t('Crianças e adolescentes') },
          ].map((option) => {
            const selected = controller.childrenOnly === option.on;
            return (
              <Pressable
                key={option.label}
                onPress={() => controller.setChildrenOnly(option.on)}
                style={[styles.quickChip, selected && styles.quickChipSelected]}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
              >
                <Text style={[styles.quickChipText, selected && styles.quickChipTextSelected]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {isWide ? filtersButton : null}
      </View>

      {controller.filtersOpen ? (
        <BrandEnter from="down" withExit>
          <View style={styles.panel}>
          <BrandSelect
            label={t('Status')}
            value={statusLabel}
            options={STATUS_FILTER_OPTIONS.map((option) => option.label)}
            onSelect={(label) => {
              const option = STATUS_FILTER_OPTIONS.find((item) => item.label === label);
              controller.setStatusId(option?.id ?? '');
            }}
          />
          <FormRow>
            <BrandField
              label={t('Idade mínima')}
              value={controller.ageMin}
              onChangeText={controller.setAgeMin}
              placeholder="18"
              keyboardType="number-pad"
            />
            <BrandField
              label={t('Idade máxima')}
              value={controller.ageMax}
              onChangeText={controller.setAgeMax}
              placeholder="60"
              keyboardType="number-pad"
            />
          </FormRow>
          <BrandSelect
            label={t('Endereço considerado')}
            value={scopeLabel}
            options={ADDRESS_SCOPE_OPTIONS.map((option) => option.label)}
            onSelect={(label) => {
              const option = ADDRESS_SCOPE_OPTIONS.find((item) => item.label === label);
              controller.setAddressScope(option?.id ?? 'lastSeen');
            }}
          />
          <FormRow>
            <BrandField
              label={t('Cidade')}
              value={controller.city}
              onChangeText={controller.setCity}
              placeholder={t('Belo Horizonte')}
              autoCapitalize="words"
            />
            <BrandField
              label={t('Estado')}
              value={controller.state}
              onChangeText={controller.setState}
              placeholder={t('MG')}
              autoCapitalize="characters"
            />
          </FormRow>
          <FormRow>
            <BrandField
              label={t('Bairro')}
              value={controller.neighborhood}
              onChangeText={controller.setNeighborhood}
              placeholder={t('Savassi')}
              autoCapitalize="words"
            />
            <BrandField
              label={t('País')}
              value={controller.country}
              onChangeText={controller.setCountry}
              placeholder={t('Brasil')}
              autoCapitalize="words"
            />
          </FormRow>
        </View>
        </BrandEnter>
      ) : null}
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrapper: {
      gap: 10,
    },
    toolbar: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 28,
    },
    stack: {
      gap: 16,
    },
    filtersButtonWide: {
      alignSelf: 'flex-start',
      paddingHorizontal: 16,
    },
    quickRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    quickChip: {
      minHeight: 40,
      justifyContent: 'center',
      paddingHorizontal: 14,
      borderRadius: Radius.pill,
      borderWidth: 1,
      borderColor: brand.fieldBorder,
      backgroundColor: brand.fieldBackground,
    },
    quickChipSelected: {
      backgroundColor: brand.blue,
      borderColor: brand.blue,
    },
    quickChipText: {
      fontSize: 14,
      fontWeight: '700',
      color: brand.textDark,
    },
    quickChipTextSelected: {
      color: brand.onPrimary,
    },
    panel: {
      gap: 14,
      padding: 14,
      borderRadius: Radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: brand.divider,
      backgroundColor: brand.surface,
    },
  });
}
