import { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandEnter } from '@/components/brand-enter';
import { BrandField } from '@/components/brand-field';
import { BrandMap } from '@/components/brand-map';
import { Radius, type BrandColors } from '@/constants/brand';
import type { PessoaDetalheController } from '@/features/pessoa-detalhe/pessoa-detalhe.controller';
import {
  SightingReportFields,
  SightingReportIntro,
  SightingReportReferenceField,
} from '@/features/pessoa-detalhe/sections/pessoa-detalhe-sighting-report-fields';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { useWideLayout } from '@/lib/use-wide-layout';

interface PessoaDetalheSightingSectionProps {
  controller: PessoaDetalheController;
}

export function PessoaDetalheSightingSection({ controller }: PessoaDetalheSightingSectionProps) {
  const t = useT();
  const brand = useBrand();
  const { isWide } = useWideLayout();
  const styles = useMemo(() => makeStyles(brand, isWide), [brand, isWide]);
  const showSighting =
    Boolean(controller.sightingBlockedMessage) ||
    Boolean(controller.formMessage) ||
    controller.formOpen;

  if (!showSighting) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      {controller.sightingBlockedMessage ? (
        <>
          <Text style={styles.message}>{controller.sightingBlockedMessage}</Text>
          {controller.isLocalPerson ? (
            controller.isLoggedIn ? (
              <BrandButton
                label={t('Revisar e enviar')}
                variant="orange"
                onPress={controller.reviewLocalDraft}
                containerStyle={isWide ? styles.actionSlot : styles.actionFull}
                style={isWide ? undefined : styles.actionFull}
              />
            ) : (
              <BrandButton
                label={t('Entrar na conta')}
                variant="blue"
                onPress={controller.goToLogin}
                containerStyle={isWide ? styles.actionSlot : styles.actionFull}
                style={isWide ? undefined : styles.actionFull}
              />
            )
          ) : null}
        </>
      ) : null}

      {controller.formMessage && !(controller.reportEnabled && controller.formOpen) ? (
        <Text style={styles.message}>{controller.formMessage}</Text>
      ) : null}

      {controller.formOpen ? (
        <BrandEnter from="down" withExit>
          <View style={styles.form}>
          {controller.reportEnabled ? <SightingReportIntro controller={controller} /> : null}
          <View>
            <BrandField
              label={t('Onde você viu?')}
              value={controller.address}
              onChangeText={controller.setAddress}
              placeholder={t('Digite para buscar o endereço')}
              autoCapitalize="words"
              autoComplete="off"
              trailingIcon="map-marker-outline"
              error={controller.addressError}
            />
            {controller.suggesting ? (
              <Text style={styles.hint}>{t('Buscando endereços…')}</Text>
            ) : null}
            {controller.suggestions.length > 0 ? (
              <View style={styles.suggestions}>
                {controller.suggestions.map((item) => (
                  <Pressable
                    key={item.id}
                    style={styles.suggestion}
                    onPress={() => controller.pickSuggestion(item)}
                  >
                    <Text style={styles.suggestionLabel}>{item.label}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
          <View style={styles.mapFrame}>
            <BrandMap
              pins={controller.sightingPins}
              userLocation={controller.userLocation}
              rounded
              style={styles.map}
              onMapPress={controller.placeSightingOnMap}
              onPinDragEnd={controller.handlePinDragEnd}
            />
          </View>
          <Text style={styles.hint}>{t('Toque no mapa ou arraste o pin para indicar o local.')}</Text>
          {controller.reportEnabled ? (
            <>
              <BrandButton
                label={t('Usar minha localização')}
                variant="outline"
                loading={controller.locating}
                onPress={controller.useCurrentLocation}
                containerStyle={isWide ? styles.actionSlot : styles.actionFull}
                style={isWide ? undefined : styles.actionFull}
              />
              <SightingReportReferenceField controller={controller} />
              <SightingReportFields controller={controller} />
              {controller.formMessage ? (
                <Text style={styles.formError} accessibilityLiveRegion="polite">
                  {controller.formMessage}
                </Text>
              ) : null}
            </>
          ) : null}
          <View style={styles.actions}>
            {controller.reportEnabled ? null : (
              <BrandButton
                label={t('Usar minha localização')}
                variant="outline"
                loading={controller.locating}
                onPress={controller.useCurrentLocation}
                containerStyle={isWide ? styles.actionSlot : styles.actionFull}
                style={isWide ? undefined : styles.actionFull}
              />
            )}
            <BrandButton
              label={controller.reportEnabled ? t('Enviar relato') : t('Registrar avistamento')}
              variant="orange"
              loading={controller.submitting}
              onPress={controller.submitSighting}
              containerStyle={isWide ? styles.actionSlot : styles.actionFull}
              style={isWide ? undefined : styles.actionFull}
            />
          </View>
        </View>
        </BrandEnter>
      ) : null}
    </View>
  );
}

function makeStyles(brand: BrandColors, isWide: boolean) {
  return StyleSheet.create({
    wrap: {
      gap: 12,
    },
    actions: {
      flexDirection: isWide ? 'row' : 'column',
      flexWrap: isWide ? 'wrap' : 'nowrap',
      alignItems: isWide ? 'center' : 'stretch',
      alignSelf: 'stretch',
      gap: isWide ? 10 : 12,
    },
    actionFull: {
      width: '100%',
      alignSelf: 'stretch',
    },
    actionSlot: {
      alignSelf: 'flex-start',
      flexGrow: 0,
      flexShrink: 1,
      maxWidth: '100%',
    },
    form: {
      gap: 12,
    },
    message: {
      fontSize: 14,
      fontWeight: '600',
      color: brand.textMuted,
    },
    formError: {
      fontSize: 15,
      lineHeight: 21,
      fontWeight: '700',
      color: brand.orangeText,
    },
    hint: {
      marginTop: 8,
      fontSize: 13,
      color: brand.textMuted,
    },
    mapFrame: {
      height: 240,
      width: '100%',
      overflow: Platform.OS === 'android' ? 'visible' : 'hidden',
    },
    map: {
      height: 240,
      width: '100%',
      flexGrow: 0,
      flexShrink: 0,
    },
    suggestions: {
      marginTop: 8,
      borderWidth: 1,
      borderColor: brand.fieldBorder,
      borderRadius: Radius.md,
      backgroundColor: brand.surface,
      overflow: 'hidden',
    },
    suggestion: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: brand.divider,
    },
    suggestionLabel: {
      fontSize: 14,
      color: brand.textDark,
    },
  });
}
