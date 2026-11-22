import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { Radius, type BrandColors } from '@/constants/brand';
import type { ProtecaoController } from '@/features/protecao/protecao.controller';
import {
  PROTECTION_DETAILS_MAX,
  PROTECTION_SITUATIONS,
  type ProtectionMode,
} from '@/features/protecao/protecao-request';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

interface Props {
  controller: ProtecaoController;
}

const MODES: { value: ProtectionMode; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { value: 'sou-eu', icon: 'account-check-outline' },
  { value: 'perseguicao', icon: 'shield-account-outline' },
];

/** Escolha do caso, situações, detalhes (sem endereço) e envio. */
export function ProtecaoFormSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  return (
    <View style={styles.wrap}>
      <View style={styles.modes} accessibilityRole="radiogroup">
        {MODES.map((item) => {
          const active = c.mode === item.value;
          return (
            <Pressable
              key={item.value}
              onPress={() => c.setMode(item.value)}
              style={({ pressed }) => [styles.mode, active && styles.modeActive, pressed && styles.pressed]}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={22}
                color={active ? brand.onPrimary : brand.blue}
              />
              <Text style={[styles.modeText, active && styles.modeTextActive]}>
                {item.value === 'sou-eu' ? t('Sou a pessoa procurada') : t('Estou sofrendo perseguição')}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.question} accessibilityRole="header">
        {c.mode === 'sou-eu'
          ? t('Você está vendo um alerta sobre o seu próprio desaparecimento e não está desaparecido(a)?')
          : t('Alguém está usando o Encontra-me contra você?')}
      </Text>
      <Text style={styles.body}>{t('Marque o que está acontecendo (pode marcar mais de uma opção).')}</Text>

      <View style={styles.options}>
        {PROTECTION_SITUATIONS[c.mode].map((item) => {
          const checked = c.situations.includes(item.value);
          return (
            <Pressable
              key={item.value}
              onPress={() => c.toggleSituation(item.value)}
              style={({ pressed }) => [styles.option, checked && styles.optionChecked, pressed && styles.pressed]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
            >
              <MaterialCommunityIcons
                name={checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={24}
                color={checked ? brand.blue : brand.textMuted}
              />
              <Text style={styles.optionText}>{t(item.label)}</Text>
            </Pressable>
          );
        })}
      </View>
      {c.error ? <Text style={styles.error}>{c.error}</Text> : null}

      <Text style={styles.label}>{t('Quer contar mais? (opcional)')}</Text>
      <TextInput
        value={c.details}
        onChangeText={c.setDetails}
        placeholder={t('Conte o que for importante para a análise. Não escreva onde você está.')}
        placeholderTextColor={brand.placeholder}
        multiline
        maxLength={PROTECTION_DETAILS_MAX}
        style={styles.textArea}
        accessibilityLabel={t('Detalhes do pedido (opcional)')}
      />
      <Text style={styles.counter}>
        {c.details.length}/{PROTECTION_DETAILS_MAX}
      </Text>

      <View style={styles.privacy}>
        {[
          t('Não pedimos sua localização e não precisamos saber onde você está.'),
          t('Quem criou o alerta não recebe seus dados, sua foto nem este pedido.'),
          t('Se a equipe precisar confirmar que é você, ela responde por e-mail. Uma foto atual, se pedida, serve só para essa verificação: nunca é publicada.'),
          t('O pedido não encerra o alerta sozinho: a equipe analisa. Em caso de risco, a divulgação pode ser suspensa enquanto isso.'),
        ].map((line) => (
          <View key={line} style={styles.privacyRow}>
            <MaterialCommunityIcons name="lock-outline" size={16} color={brand.blue} />
            <Text style={styles.privacyText}>{line}</Text>
          </View>
        ))}
      </View>

      {!c.loggedIn && c.hasPublishedCase ? (
        <Text style={styles.note}>
          {t('Sem conta, o pedido vai por e-mail. Com a conta conectada, ele também entra na fila da equipe pelo app.')}{' '}
          <Text style={styles.link} onPress={c.goToLogin} accessibilityRole="link">
            {t('Entrar')}
          </Text>
        </Text>
      ) : null}

      <BrandButton
        label={t('Enviar pedido à equipe')}
        variant="blue"
        trailingIcon="send-outline"
        onPress={c.submit}
        loading={c.sending}
        disabled={c.sending}
      />
      <Text style={styles.note}>
        {t('Seu app de e-mail abre com a mensagem pronta. O pedido só chega à equipe quando você tocar em enviar.')}
      </Text>
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: {
      gap: 12,
    },
    modes: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    mode: {
      flexGrow: 1,
      flexBasis: 150,
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: Radius.md,
      borderWidth: 1.5,
      borderColor: brand.blue,
      backgroundColor: brand.surface,
    },
    modeActive: {
      backgroundColor: brand.blue,
    },
    modeText: {
      flexShrink: 1,
      fontSize: 15,
      fontWeight: '800',
      color: brand.blue,
    },
    modeTextActive: {
      color: brand.onPrimary,
    },
    question: {
      marginTop: 6,
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '800',
      color: brand.textDark,
    },
    body: {
      fontSize: 15,
      lineHeight: 21,
      color: brand.textMuted,
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
    optionChecked: {
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
    label: {
      marginTop: 4,
      fontSize: 15,
      fontWeight: '700',
      color: brand.label,
    },
    textArea: {
      minHeight: 110,
      padding: 12,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: brand.fieldBorder,
      backgroundColor: brand.fieldBackground,
      color: brand.textDark,
      fontSize: 15,
      textAlignVertical: 'top',
    },
    counter: {
      marginTop: -6,
      alignSelf: 'flex-end',
      fontSize: 12,
      color: brand.textMuted,
    },
    privacy: {
      gap: 8,
      padding: 12,
      borderRadius: Radius.md,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    privacyRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
    },
    privacyText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
      color: brand.textDark,
    },
    note: {
      fontSize: 13,
      lineHeight: 18,
      color: brand.textMuted,
    },
    link: {
      color: brand.blue,
      fontWeight: '700',
      textDecorationLine: 'underline',
    },
    pressed: {
      opacity: 0.85,
    },
  });
}
