import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandField } from '@/components/brand-field';
import { Radius, type BrandColors } from '@/constants/brand';
import { EMERGENCY_LINES } from '@/constants/emergency';
import type { PossivelDesaparecimentoController } from '@/features/possivel-desaparecimento/possivel-desaparecimento.controller';
import {
  POSSIBLE_MISSING_DETAILS_MAX,
  POSSIBLE_MISSING_PLACE_MAX,
  POSSIBLE_MISSING_SITUATIONS,
  POSSIBLE_MISSING_STEPS,
} from '@/features/possivel-desaparecimento/possible-missing';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

interface Props {
  controller: PossivelDesaparecimentoController;
}

/** Ligar primeiro; depois a situação, o que fazer e o aviso à equipe (nada é publicado daqui). */
export function PossivelDesaparecimentoSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const lines = c.calls
    .map((number) => EMERGENCY_LINES.find((line) => line.number === number))
    .filter((line): line is (typeof EMERGENCY_LINES)[number] => line != null);

  return (
    <View style={styles.wrap}>
      <View style={styles.urgent}>
        <Text style={styles.urgentTitle} accessibilityRole="header">
          {t('Ligue agora')}
        </Text>
        <Text style={styles.body}>
          {t('Não espere o app: a polícia e o SAMU chegam mais rápido. A ligação é feita pelo seu celular.')}
        </Text>
        <View style={styles.calls}>
          {lines.map((line) => (
            <Pressable
              key={line.number}
              onPress={() => c.call(line.number)}
              style={({ pressed }) => [styles.call, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={t('Ligar {number}, {name}', { number: line.number, name: t(line.name) })}
            >
              <Text style={styles.callNumber}>{line.number}</Text>
              <Text style={styles.callName}>{t(line.name)}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Text style={styles.heading} accessibilityRole="header">
        {t('Qual é a situação?')}
      </Text>
      <View style={styles.options} accessibilityRole="radiogroup">
        {POSSIBLE_MISSING_SITUATIONS.map((item) => {
          const active = c.situation === item.value;
          return (
            <Pressable
              key={item.value}
              onPress={() => c.chooseSituation(item.value)}
              style={({ pressed }) => [styles.option, active && styles.optionActive, pressed && styles.pressed]}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
            >
              <MaterialCommunityIcons
                name={active ? 'radiobox-marked' : 'radiobox-blank'}
                size={22}
                color={active ? brand.blue : brand.textMuted}
              />
              <Text style={styles.optionText}>{t(item.label)}</Text>
            </Pressable>
          );
        })}
      </View>
      {c.error ? <Text style={styles.error}>{c.error}</Text> : null}

      <Text style={styles.heading} accessibilityRole="header">
        {t('O que fazer agora')}
      </Text>
      <View style={styles.steps}>
        {POSSIBLE_MISSING_STEPS.map((step, index) => (
          <View key={step} style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{t(step)}</Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={c.goToSearch}
        style={({ pressed }) => [styles.searchCard, pressed && styles.pressed]}
        accessibilityRole="button"
      >
        <MaterialCommunityIcons name="account-search-outline" size={24} color={brand.blue} />
        <View style={styles.flex}>
          <Text style={styles.searchTitle}>{t('Veja se a pessoa já está cadastrada')}</Text>
          <Text style={styles.body}>
            {t('A família pode já estar procurando. Se achar o caso, informe o avistamento nele.')}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={22} color={brand.label} />
      </Pressable>

      <Text style={styles.heading} accessibilityRole="header">
        {t('Avisar a equipe do Encontra-me')}
      </Text>
      <BrandField
        label={t('Onde a pessoa está (referência, opcional)')}
        value={c.place}
        onChangeText={c.setPlace}
        placeholder={t('Ex.: Praça da Estação, perto do ponto de ônibus')}
        maxLength={POSSIBLE_MISSING_PLACE_MAX}
      />
      <TextInput
        value={c.details}
        onChangeText={c.setDetails}
        placeholder={t('Como a pessoa está, o que está vestindo e o que conseguiu dizer.')}
        placeholderTextColor={brand.placeholder}
        multiline
        maxLength={POSSIBLE_MISSING_DETAILS_MAX}
        style={styles.textArea}
        accessibilityLabel={t('Detalhes (opcional)')}
      />
      <View style={styles.privacy}>
        <MaterialCommunityIcons name="eye-off-outline" size={18} color={brand.blue} />
        <Text style={styles.privacyText}>
          {t('Nada é publicado no mapa a partir daqui. A equipe analisa com prioridade e só divulga depois de validar a situação — sem expor fotos ou dados da pessoa antes disso.')}
        </Text>
      </View>
      <BrandButton
        label={t('Avisar a equipe')}
        variant="blue"
        trailingIcon="send-outline"
        onPress={c.submit}
        loading={c.sending}
        disabled={c.sending}
      />
      {c.emailResult === 'opened' ? (
        <Text style={styles.result} accessibilityLiveRegion="polite">
          {t('Seu app de e-mail abriu com a mensagem pronta. Toque em enviar: só então ela chega à equipe.')}
        </Text>
      ) : c.emailResult === 'failed' ? (
        <Text style={styles.result} accessibilityLiveRegion="polite">
          {t('O app de e-mail não abriu. Escreva para {email} com o assunto "Alerta de possível desaparecimento".', {
            email: c.supportEmail,
          })}
        </Text>
      ) : (
        <Text style={styles.note}>
          {t('O aviso à equipe não substitui a polícia. O Encontra-me não aciona as autoridades sozinho.')}
        </Text>
      )}
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: {
      gap: 12,
    },
    flex: {
      flex: 1,
      gap: 2,
    },
    urgent: {
      gap: 10,
      padding: 14,
      borderRadius: Radius.lg,
      backgroundColor: brand.attentionSoft,
      borderWidth: 1,
      borderColor: brand.attentionBorder,
    },
    urgentTitle: {
      fontSize: 18,
      fontWeight: '900',
      color: brand.textDark,
    },
    body: {
      fontSize: 14,
      lineHeight: 20,
      color: brand.textMuted,
    },
    calls: {
      flexDirection: 'row',
      gap: 8,
    },
    call: {
      flex: 1,
      minHeight: 68,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      padding: 8,
      borderRadius: Radius.md,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.attentionBorder,
    },
    callNumber: {
      fontSize: 24,
      fontWeight: '900',
      color: brand.textDark,
    },
    callName: {
      fontSize: 12,
      fontWeight: '700',
      textAlign: 'center',
      color: brand.textMuted,
    },
    heading: {
      marginTop: 6,
      fontSize: 17,
      fontWeight: '800',
      color: brand.textDark,
    },
    options: {
      gap: 8,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      minHeight: 52,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: brand.divider,
      backgroundColor: brand.surface,
    },
    optionActive: {
      borderColor: brand.blue,
    },
    optionText: {
      flex: 1,
      fontSize: 15,
      lineHeight: 21,
      fontWeight: '600',
      color: brand.textDark,
    },
    error: {
      fontSize: 13,
      color: brand.error,
    },
    steps: {
      gap: 10,
    },
    step: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    stepNumber: {
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brand.blue,
    },
    stepNumberText: {
      fontSize: 13,
      fontWeight: '900',
      color: brand.onPrimary,
    },
    stepText: {
      flex: 1,
      fontSize: 15,
      lineHeight: 21,
      color: brand.textDark,
    },
    searchCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: brand.divider,
      backgroundColor: brand.surface,
    },
    searchTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: brand.textDark,
    },
    textArea: {
      minHeight: 100,
      padding: 12,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: brand.fieldBorder,
      backgroundColor: brand.fieldBackground,
      color: brand.textDark,
      fontSize: 15,
      textAlignVertical: 'top',
    },
    privacy: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      padding: 12,
      borderRadius: Radius.md,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    privacyText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
      color: brand.textDark,
    },
    result: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '700',
      color: brand.blue,
    },
    note: {
      fontSize: 13,
      lineHeight: 18,
      color: brand.textMuted,
    },
    pressed: {
      opacity: 0.85,
    },
  });
}
