import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { Radius, type BrandColors } from '@/constants/brand';
import type { AjudaController } from '@/features/ajuda/ajuda.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { SUPPORT_TOPIC_LABELS, type SupportTopic } from '@/lib/support';

type Props = { controller: AjudaController };

const TOPICS = Object.keys(SUPPORT_TOPIC_LABELS) as SupportTopic[];

/**
 * Contato com o suporte. Ainda não há API de chamados: o formulário abre o app de
 * e-mail com a mensagem pronta e deixa claro que nada foi enviado até a pessoa enviar.
 */
export function AjudaContactSection({ controller }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  if (!controller.contactOpen) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.title} accessibilityRole="header">
          {t('Ainda precisa de ajuda?')}
        </Text>
        <View style={styles.actions}>
          <ContactShortcut
            icon="bug-outline"
            label={t('Relatar um problema')}
            onPress={() => controller.openContact('problema')}
            styles={styles}
            color={brand.blue}
          />
          <ContactShortcut
            icon="email-outline"
            label={t('Falar com o suporte')}
            onPress={() => controller.openContact('duvida')}
            styles={styles}
            color={brand.blue}
          />
          <ContactShortcut
            icon="flag-outline"
            label={t('Denunciar conteúdo ou golpe')}
            onPress={() => controller.openContact('denuncia')}
            styles={styles}
            color={brand.blue}
          />
        </View>
      </View>
    );
  }

  if (controller.contactResult === 'opened') {
    return (
      <View style={[styles.wrap, styles.card]}>
        <MaterialCommunityIcons name="email-fast-outline" size={32} color={brand.blue} />
        <Text style={styles.title}>{t('Mensagem pronta no seu e-mail')}</Text>
        <Text style={styles.body}>
          {t('Abrimos seu app de e-mail com a mensagem preenchida. Ela só chega até nós quando você tocar em enviar. Você recebe a resposta no seu e-mail.')}
        </Text>
        <Text style={styles.note}>
          {t('Ainda não geramos número de protocolo pelo app. Guarde o e-mail enviado como comprovante.')}
        </Text>
        <BrandButton label={t('Fechar')} variant="outline" onPress={controller.closeContact} />
      </View>
    );
  }

  return (
    <View style={[styles.wrap, styles.card]}>
      <View style={styles.headerRow}>
        <Text style={styles.title} accessibilityRole="header">
          {t('Falar com o suporte')}
        </Text>
        <Pressable
          onPress={controller.closeContact}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={t('Fechar formulário')}
        >
          <MaterialCommunityIcons name="close" size={24} color={brand.label} />
        </Pressable>
      </View>

      <Text style={styles.label}>{t('Assunto')}</Text>
      <View style={styles.chips} accessibilityRole="radiogroup">
        {TOPICS.map((topic) => {
          const selected = controller.topic === topic;
          return (
            <Pressable
              key={topic}
              onPress={() => controller.setTopic(topic)}
              style={[styles.chip, selected && styles.chipSelected]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {t(SUPPORT_TOPIC_LABELS[topic])}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>{t('Mensagem')}</Text>
      <TextInput
        style={[styles.message, controller.messageError ? styles.messageError : null]}
        value={controller.message}
        onChangeText={controller.setMessage}
        placeholder={t('Conte o que aconteceu. Não escreva sua senha.')}
        placeholderTextColor={brand.placeholder}
        multiline
        textAlignVertical="top"
        maxLength={controller.messageMax}
        accessibilityLabel={t('Mensagem para o suporte')}
      />
      {controller.messageError ? (
        <Text style={styles.error}>{controller.messageError}</Text>
      ) : null}

      {controller.contactResult === 'no-mail-app' ? (
        <Text style={styles.error}>
          {t('Não encontramos um app de e-mail neste aparelho. Escreva para {supportEmail} a partir de qualquer e-mail.', { supportEmail: controller.supportEmail })}
        </Text>
      ) : null}

      <Text style={styles.note}>
        {t('Ao continuar, seu app de e-mail abre com a mensagem para {supportEmail}. A mensagem só é enviada quando você confirmar no e-mail.', { supportEmail: controller.supportEmail })}
      </Text>

      <BrandButton
        label={t('Continuar no e-mail')}
        trailingIcon="email-outline"
        onPress={controller.submitContact}
        loading={controller.sending}
      />
    </View>
  );
}

function ContactShortcut({
  icon,
  label,
  onPress,
  styles,
  color,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
  styles: ReturnType<typeof makeStyles>;
  color: string;
}) {
  return (
    <Pressable onPress={onPress} style={styles.shortcut} accessibilityRole="button">
      <MaterialCommunityIcons name={icon} size={22} color={color} />
      <Text style={styles.shortcutText}>{label}</Text>
      <MaterialCommunityIcons name="chevron-right" size={22} color={color} />
    </Pressable>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: {
      gap: 12,
    },
    card: {
      padding: 16,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: brand.textDark,
    },
    body: {
      fontSize: 15,
      lineHeight: 22,
      color: brand.textDark,
    },
    note: {
      fontSize: 13,
      lineHeight: 19,
      color: brand.textMuted,
    },
    actions: {
      gap: 8,
    },
    shortcut: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      minHeight: 56,
      paddingHorizontal: 14,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    shortcutText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: brand.textDark,
    },
    label: {
      fontSize: 14,
      fontWeight: '700',
      color: brand.label,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      minHeight: 40,
      justifyContent: 'center',
      paddingHorizontal: 14,
      borderRadius: Radius.pill,
      borderWidth: 1,
      borderColor: brand.fieldBorder,
      backgroundColor: brand.fieldBackground,
    },
    chipSelected: {
      backgroundColor: brand.blue,
      borderColor: brand.blue,
    },
    chipText: {
      fontSize: 14,
      fontWeight: '600',
      color: brand.textDark,
    },
    chipTextSelected: {
      color: brand.onPrimary,
    },
    message: {
      minHeight: 130,
      padding: 14,
      fontSize: 16,
      lineHeight: 22,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: brand.fieldBorder,
      backgroundColor: brand.fieldBackground,
      color: brand.textDark,
    },
    messageError: {
      borderColor: brand.error,
    },
    error: {
      fontSize: 14,
      color: brand.error,
    },
  });
}
