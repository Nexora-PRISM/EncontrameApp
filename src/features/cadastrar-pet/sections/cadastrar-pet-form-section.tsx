import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandField } from '@/components/brand-field';
import { BrandSelect } from '@/components/brand-select';
import { FormRow } from '@/components/form-row';
import { Radius, type BrandColors } from '@/constants/brand';
import {
  type CadastrarPetController,
  PET_SIZE_OPTIONS,
  PET_SPECIES_OPTIONS,
} from '@/features/cadastrar-pet/cadastrar-pet.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

type Props = { controller: CadastrarPetController };

export function CadastrarPetFormSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const speciesError = c.fieldError('species');

  return (
    <View style={styles.form}>
      <View style={styles.notice} accessible>
        <MaterialCommunityIcons name="shield-home-outline" size={24} color={brand.blue} />
        <Text style={styles.noticeText}>
          {t('Não publique seu endereço completo. Informe só a cidade e o bairro onde o pet sumiu.')}
        </Text>
      </View>

      {c.photoUri ? (
        <View style={styles.photoRow}>
          <Image source={{ uri: c.photoUri }} style={styles.photo} resizeMode="cover" />
          <View style={styles.photoActions}>
            <BrandButton label={t('Trocar foto')} variant="outline" onPress={c.pickPhoto} />
            <Pressable onPress={c.removePhoto} accessibilityRole="button" style={styles.removePhoto}>
              <Text style={styles.removePhotoText}>{t('Remover foto')}</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable onPress={c.pickPhoto} style={styles.photoEmpty} accessibilityRole="button">
          <MaterialCommunityIcons name="camera-outline" size={30} color={brand.blue} />
          <Text style={styles.photoEmptyTitle}>{t('Adicionar foto do pet')}</Text>
          <Text style={styles.photoEmptyHint}>{t('PNG ou JPG, até 2 MB')}</Text>
        </Pressable>
      )}

      <BrandField
        label={t('Nome do pet')}
        value={c.petName}
        onChangeText={c.setPetName}
        onBlur={c.blurPetName}
        placeholder={t('Ex.: Thor')}
        autoCapitalize="words"
        required
        error={c.fieldError('petName')}
      />
      <View style={styles.selectWrap}>
        <BrandSelect
          label={t('Espécie *')}
          value={c.species}
          options={PET_SPECIES_OPTIONS}
          onSelect={c.setSpecies}
          placeholder={t('Escolha')}
        />
        {speciesError ? <Text style={styles.error}>{speciesError}</Text> : null}
      </View>
      <FormRow>
        <BrandField
          label={t('Raça')}
          value={c.breed}
          onChangeText={c.setBreed}
          placeholder={t('Ex.: Sem raça definida')}
        />
        <BrandField
          label={t('Cor ou pelagem')}
          value={c.color}
          onChangeText={c.setColor}
          placeholder={t('Ex.: Caramelo')}
        />
      </FormRow>
      <BrandSelect
        label={t('Porte')}
        value={c.size}
        options={PET_SIZE_OPTIONS}
        onSelect={c.setSize}
        placeholder={t('Escolha')}
      />
      <BrandField
        label={t('Sinais particulares')}
        value={c.marks}
        onChangeText={c.setMarks}
        placeholder={t('Coleira, manchas, cicatriz…')}
      />
      <FormRow>
        <BrandField
          label={t('Cidade onde sumiu')}
          value={c.city}
          onChangeText={c.setCity}
          onBlur={c.blurCity}
          placeholder={t('Ex.: Belo Horizonte - MG')}
          autoCapitalize="words"
          required
          error={c.fieldError('city')}
        />
        <BrandField
          label={t('Bairro')}
          value={c.neighborhood}
          onChangeText={c.setNeighborhood}
          placeholder={t('Ex.: Savassi')}
          autoCapitalize="words"
        />
      </FormRow>
      <FormRow>
        <BrandField
          label={t('Visto pela última vez em')}
          value={c.lastSeen}
          onChangeText={c.setLastSeen}
          onBlur={c.blurLastSeen}
          placeholder={t('dd/mm/aaaa')}
          keyboardType="numeric"
          error={c.fieldError('lastSeen')}
        />
        <BrandField
          label={t('Telefone do tutor')}
          value={c.contactPhone}
          onChangeText={c.setContactPhone}
          onBlur={c.blurContactPhone}
          placeholder="(31) 99999-9999"
          keyboardType="phone-pad"
          required
          error={c.fieldError('contactPhone')}
        />
      </FormRow>
      <Text style={styles.hint}>
        {t('O telefone aparece no anúncio para quem encontrar o pet poder avisar você.')}
      </Text>

      <BrandButton
        label={t('Publicar')}
        variant="orange"
        loading={c.submitting}
        onPress={c.handleSubmit}
      />
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    form: {
      gap: 18,
    },
    notice: {
      flexDirection: 'row',
      gap: 12,
      padding: 14,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    noticeText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
      color: brand.textMuted,
    },
    photoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    photo: {
      width: 120,
      height: 120,
      borderRadius: Radius.lg,
      backgroundColor: brand.avatarBackground,
    },
    photoActions: {
      flex: 1,
      gap: 8,
    },
    removePhoto: {
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    removePhotoText: {
      color: brand.orangeText,
      fontWeight: '700',
    },
    photoEmpty: {
      height: 120,
      borderRadius: Radius.lg,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: brand.fieldBorder,
      backgroundColor: brand.surface,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    photoEmptyTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: brand.blue,
    },
    photoEmptyHint: {
      fontSize: 13,
      color: brand.textMuted,
    },
    selectWrap: {
      gap: 6,
    },
    error: {
      fontSize: 13,
      color: brand.error,
    },
    hint: {
      marginTop: -8,
      fontSize: 13,
      lineHeight: 18,
      color: brand.textMuted,
    },
  });
}
