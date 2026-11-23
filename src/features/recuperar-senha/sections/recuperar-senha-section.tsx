import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandField } from '@/components/brand-field';
import { Radius, type BrandColors } from '@/constants/brand';
import type { RecuperarSenhaController } from '@/features/recuperar-senha/recuperar-senha.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

interface Props {
  controller: RecuperarSenhaController;
}

export function RecuperarSenhaSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  if (c.loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={brand.orange} />
      </View>
    );
  }

  if (!c.available) {
    return (
      <View style={styles.form}>
        <Text style={styles.text}>
          {t('Recuperar a senha pelo app ainda não está disponível. A Central de Ajuda explica como pedir à equipe.')}
        </Text>
        <BrandButton label={t('Abrir a Central de Ajuda')} variant="outline" onPress={c.goToHelp} />
      </View>
    );
  }

  if (c.step === 'done') {
    return (
      <View style={styles.form}>
        <View style={styles.okRow}>
          <MaterialCommunityIcons name="check-circle-outline" size={28} color={brand.blue} />
          <Text style={styles.title}>{t('Senha nova criada')}</Text>
        </View>
        <Text style={styles.text}>
          {t('Por segurança, todos os aparelhos foram desconectados. Entre de novo com a senha nova.')}
        </Text>
        <BrandButton label={t('Entrar')} variant="orange" onPress={c.goToLogin} />
      </View>
    );
  }

  if (c.step === 'email') {
    return (
      <View style={styles.form}>
        <Text style={styles.text}>
          {t('Digite o e-mail da sua conta. Se ele estiver cadastrado, mandamos um código para criar uma senha nova.')}
        </Text>
        <BrandField
          label={t('E-mail')}
          value={c.email}
          onChangeText={c.setEmail}
          onBlur={c.blurEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          placeholder={t('exemplo@email.com')}
          required
          error={c.fieldError('email')}
        />
        {c.formError ? <Text style={styles.error}>{c.formError}</Text> : null}
        <BrandButton label={t('Mandar código')} variant="orange" loading={c.sending} onPress={c.sendCode} />
      </View>
    );
  }

  const eye = c.show ? 'eye-off-outline' : 'eye-outline';

  return (
    <View style={styles.form}>
      <View style={styles.box}>
        <Text style={styles.text}>
          {t('Se existir uma conta com {email}, o código chega em alguns minutos. Confira também a caixa de spam. Ele vale por 15 minutos.', {
            email: c.email.trim(),
          })}
        </Text>
        {c.resent ? <Text style={styles.hint}>{t('Pedimos outro código. Use o mais recente.')}</Text> : null}
      </View>
      <BrandField
        label={t('Código do e-mail')}
        value={c.code}
        onChangeText={c.setCode}
        onBlur={c.blurCode}
        autoCapitalize="characters"
        autoComplete="one-time-code"
        placeholder="ABCD-EFGH"
        maxLength={9}
        required
        error={c.fieldError('code')}
      />
      <BrandField
        label={t('Senha nova')}
        value={c.newPassword}
        onChangeText={c.setNewPassword}
        onBlur={c.blurNewPassword}
        secureTextEntry={!c.show}
        trailingIcon={eye}
        onTrailingPress={c.toggleShow}
        trailingAccessibilityLabel={c.show ? t('Ocultar senha') : t('Mostrar senha')}
        autoComplete="new-password"
        required
        error={c.fieldError('newPassword')}
      />
      <BrandField
        label={t('Repita a senha nova')}
        value={c.confirmPassword}
        onChangeText={c.setConfirmPassword}
        onBlur={c.blurConfirmPassword}
        secureTextEntry={!c.show}
        autoComplete="new-password"
        required
        error={c.fieldError('confirmPassword')}
      />
      <Text style={styles.hint}>{t('Pelo menos 8 caracteres, com letras e números.')}</Text>
      {c.formError ? <Text style={styles.error}>{c.formError}</Text> : null}
      <BrandButton label={t('Criar senha nova')} variant="orange" loading={c.saving} onPress={c.submitNewPassword} />
      <View style={styles.links}>
        <Pressable onPress={c.resendCode} disabled={c.sending} hitSlop={10} accessibilityRole="button">
          <Text style={styles.link}>{c.sending ? t('Enviando…') : t('Mandar outro código')}</Text>
        </Pressable>
        <Pressable onPress={c.changeEmail} hitSlop={10} accessibilityRole="button">
          <Text style={styles.link}>{t('Trocar o e-mail')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    center: {
      paddingVertical: 48,
      alignItems: 'center',
    },
    form: {
      gap: 18,
    },
    box: {
      gap: 6,
      padding: 12,
      borderRadius: Radius.md,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    okRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: brand.textDark,
    },
    text: {
      fontSize: 15,
      lineHeight: 22,
      color: brand.textDark,
    },
    hint: {
      fontSize: 13,
      color: brand.textMuted,
    },
    error: {
      fontSize: 13,
      fontWeight: '600',
      color: brand.error,
    },
    links: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12,
    },
    link: {
      fontSize: 14,
      fontWeight: '700',
      color: brand.blue,
    },
  });
}
