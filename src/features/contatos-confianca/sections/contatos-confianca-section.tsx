import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandField } from '@/components/brand-field';
import { Radius, type BrandColors } from '@/constants/brand';
import type { ContatosConfiancaController } from '@/features/contatos-confianca/contatos-confianca.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { maskPhone } from '@/lib/masks';

type Props = { controller: ContatosConfiancaController };

export function ContatosConfiancaSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.intro}>
        {t('Pessoas para quem você manda sua localização com um toque, por WhatsApp ou SMS — no alerta de emergência ou em "Compartilhar localização". A lista fica salva só neste aparelho e o app não envia nada sozinho.')}
      </Text>

      {c.loading ? (
        <ActivityIndicator color={brand.blue} />
      ) : c.contacts.length === 0 ? (
        <View style={styles.emptyCard}>
          <MaterialCommunityIcons name="account-heart-outline" size={26} color={brand.blue} />
          <Text style={styles.emptyText}>{t('Nenhum contato ainda. Adicione até {max} pessoas.', { max: c.max })}</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {c.contacts.map((contact) => (
            <View key={contact.id} style={styles.contactRow}>
              <MaterialCommunityIcons name="account-heart-outline" size={24} color={brand.blue} />
              <View style={styles.contactTexts}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactPhone}>{maskPhone(contact.phone)}</Text>
              </View>
              <Pressable
                onPress={() => c.removeContact(contact)}
                style={styles.removeButton}
                accessibilityRole="button"
                accessibilityLabel={t('Remover {name}', { name: contact.name })}
                disabled={c.saving}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={22} color={brand.orangeText} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {c.full ? (
        <Text style={styles.note}>
          {t('Você chegou ao limite de {max} contatos. Remova um para adicionar outro.', { max: c.max })}
        </Text>
      ) : (
        <View style={styles.form}>
          <Text style={styles.formTitle} accessibilityRole="header">
            {t('Adicionar contato')}
          </Text>
          <BrandField
            label={t('Nome')}
            value={c.name}
            onChangeText={c.setName}
            placeholder={t('Ex.: Mãe')}
            autoCapitalize="words"
            maxLength={40}
            required
            error={c.fieldError('contactName')}
          />
          <BrandField
            label={t('Celular com DDD')}
            value={c.phone}
            onChangeText={c.setPhone}
            placeholder="(31) 99999-9999"
            keyboardType="phone-pad"
            required
            error={c.fieldError('contactPhone')}
          />
          <BrandButton
            label={t('Adicionar contato')}
            variant="blue"
            loading={c.saving}
            onPress={c.addContact}
          />
        </View>
      )}

      <Text style={styles.note}>
        {t('Combine antes com essas pessoas o que fazer ao receber um pedido de ajuda — por exemplo, ligar para você e, se não atender, ligar para o 190.')}
      </Text>
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: {
      gap: 16,
    },
    intro: {
      fontSize: 15,
      lineHeight: 22,
      color: brand.textMuted,
    },
    emptyCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    emptyText: {
      flex: 1,
      fontSize: 15,
      color: brand.textDark,
    },
    list: {
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
      overflow: 'hidden',
    },
    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      minHeight: 64,
      paddingHorizontal: 14,
      borderBottomWidth: 1,
      borderBottomColor: brand.divider,
    },
    contactTexts: {
      flex: 1,
      gap: 2,
    },
    contactName: {
      fontSize: 16,
      fontWeight: '700',
      color: brand.textDark,
    },
    contactPhone: {
      fontSize: 14,
      color: brand.textMuted,
    },
    removeButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    form: {
      gap: 14,
      padding: 14,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    formTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: brand.textDark,
    },
    note: {
      fontSize: 13,
      lineHeight: 18,
      color: brand.textMuted,
    },
  });
}
