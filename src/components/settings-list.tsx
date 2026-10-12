import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Radius, type BrandColors } from '@/constants/brand';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { useTimedColor } from '@/lib/use-brand-transition';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

/** Bloco com título e cartão agrupando linhas de configuração. */
export function SettingsGroup({
  title,
  footer,
  children,
}: {
  title: string;
  footer?: string;
  children: ReactNode;
}) {
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle} accessibilityRole="header">
        {title}
      </Text>
      <View style={styles.card}>{children}</View>
      {footer ? <Text style={styles.groupFooter}>{footer}</Text> : null}
    </View>
  );
}

type RowProps = {
  icon: IconName;
  label: string;
  description?: string;
  /** Texto curto à direita (ex.: "Escuro", "1.0.0"). */
  value?: string;
  /** Linha com ação; sem onPress e sem switch a linha é só informativa (não é botão). */
  onPress?: () => void;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  danger?: boolean;
  /** Indica recurso que ainda não existe — mostra o selo "Em breve" e não é tocável. */
  unavailable?: boolean;
  disabled?: boolean;
};

export function SettingsRow({
  icon,
  label,
  description,
  value,
  onPress,
  switchValue,
  onSwitchChange,
  danger,
  unavailable,
  disabled,
}: RowProps) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const [highlighted, setHighlighted] = useState(false);
  const bgStyle = useTimedColor(highlighted, 'transparent', brand.divider, 'backgroundColor');
  const hasSwitch = onSwitchChange != null;
  const pressable = !unavailable && !disabled && onPress != null && !hasSwitch;
  const iconColor = unavailable || disabled ? brand.label : danger ? brand.orangeDark : brand.blue;

  const content = (
    <Animated.View style={[styles.row, pressable && bgStyle]}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
      </View>
      <View style={styles.texts}>
        <Text
          style={[
            styles.label,
            danger && styles.labelDanger,
            (unavailable || disabled) && styles.labelMuted,
          ]}
        >
          {label}
        </Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      {unavailable ? (
        <View style={styles.soonBadge}>
          <Text style={styles.soonText}>{t('Em breve')}</Text>
        </View>
      ) : hasSwitch ? (
        <Switch
          value={Boolean(switchValue)}
          onValueChange={onSwitchChange}
          disabled={disabled}
          trackColor={{ false: brand.fieldBorder, true: brand.blue }}
          thumbColor={brand.surface}
          accessibilityLabel={label}
        />
      ) : value ? (
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {pressable ? (
        <MaterialCommunityIcons name="chevron-right" size={22} color={brand.label} />
      ) : null}
    </Animated.View>
  );

  if (!pressable) {
    return (
      <View
        accessible
        accessibilityLabel={[label, description, unavailable ? t('em breve') : value]
          .filter(Boolean)
          .join(', ')}
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setHighlighted(true)}
      onPressOut={() => setHighlighted(false)}
      onHoverIn={() => setHighlighted(true)}
      onHoverOut={() => setHighlighted(false)}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={description}
    >
      {content}
    </Pressable>
  );
}

/**
 * Seletor de opções lado a lado (ex.: Automático / Claro / Escuro). Os rótulos são traduzidos aqui;
 * `accessibilityLabel` (opcional) é o nome completo lido pelo leitor de tela quando o rótulo é curto.
 */
export function SettingsSegmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string; accessibilityLabel?: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  return (
    <View style={styles.segmentWrap} accessibilityRole="radiogroup" accessibilityLabel={label}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected && styles.segmentSelected]}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={t(option.accessibilityLabel ?? option.label)}
          >
            <Text
              style={[styles.segmentText, selected && styles.segmentTextSelected]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {t(option.label)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * Lista de opções com marcação, uma escolha por vez (ex.: idioma). Os rótulos chegam prontos —
 * não são traduzidos aqui, porque nomes de idioma ficam no próprio idioma.
 */
export function SettingsChoiceList<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string; description?: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [styles.row, pressed && styles.choicePressed]}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={
              option.description ? `${option.label}, ${option.description}` : option.label
            }
          >
            <View style={styles.texts}>
              <Text style={[styles.label, selected && styles.choiceLabelSelected]}>
                {option.label}
              </Text>
              {option.description ? (
                <Text style={styles.description}>{option.description}</Text>
              ) : null}
            </View>
            <MaterialCommunityIcons
              name={selected ? 'radiobox-marked' : 'radiobox-blank'}
              size={22}
              color={selected ? brand.blue : brand.label}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    group: {
      gap: 8,
    },
    groupTitle: {
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: brand.label,
      paddingHorizontal: 4,
    },
    groupFooter: {
      fontSize: 13,
      lineHeight: 18,
      color: brand.textMuted,
      paddingHorizontal: 4,
    },
    card: {
      backgroundColor: brand.surface,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: brand.divider,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      minHeight: 56,
      paddingVertical: 12,
      paddingHorizontal: 14,
    },
    iconWrap: {
      width: 28,
      alignItems: 'center',
    },
    texts: {
      flex: 1,
      gap: 2,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: brand.textDark,
    },
    labelDanger: {
      color: brand.orangeText,
    },
    labelMuted: {
      color: brand.textMuted,
    },
    description: {
      fontSize: 13,
      lineHeight: 18,
      color: brand.textMuted,
    },
    value: {
      maxWidth: 140,
      fontSize: 14,
      fontWeight: '600',
      color: brand.textMuted,
    },
    soonBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: Radius.pill,
      backgroundColor: brand.fieldBackground,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    soonText: {
      fontSize: 12,
      fontWeight: '700',
      color: brand.textMuted,
    },
    segmentWrap: {
      flexDirection: 'row',
      gap: 6,
      padding: 6,
      margin: 10,
      borderRadius: Radius.md,
      backgroundColor: brand.fieldBackground,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    segment: {
      flex: 1,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Radius.sm,
    },
    segmentSelected: {
      backgroundColor: brand.blue,
    },
    segmentText: {
      fontSize: 15,
      fontWeight: '700',
      color: brand.textDark,
    },
    segmentTextSelected: {
      color: brand.onPrimary,
    },
    choicePressed: {
      backgroundColor: brand.divider,
    },
    choiceLabelSelected: {
      fontWeight: '800',
    },
  });
}
