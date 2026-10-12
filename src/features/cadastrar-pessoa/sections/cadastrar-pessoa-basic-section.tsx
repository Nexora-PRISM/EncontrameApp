import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandField } from '@/components/brand-field';
import { BrandSelect } from '@/components/brand-select';
import { FormRow } from '@/components/form-row';
import { Radius, type BrandColors } from '@/constants/brand';
import {
  BUILD_OPTIONS,
  type CadastrarPessoaController,
  ETHNICITY_OPTIONS,
} from '@/features/cadastrar-pessoa/cadastrar-pessoa.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

interface CadastrarPessoaBasicSectionProps {
  controller: CadastrarPessoaController;
}

export function CadastrarPessoaBasicSection({ controller }: CadastrarPessoaBasicSectionProps) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  return (
    <View style={styles.form}>
      {controller.reviewingDraft ? (
        <View style={styles.notice} accessible accessibilityRole="summary">
          <MaterialCommunityIcons name="cloud-upload-outline" size={24} color={brand.blue} />
          <View style={styles.noticeTexts}>
            <Text style={styles.noticeTitle}>{t('Cadastro feito neste aparelho')}</Text>
            <Text style={styles.noticeBody}>
              {controller.draftLoading
                ? t('Carregando o cadastro…')
                : t('Confira os dados, complete o que faltar e confirme a declaração no fim. Ao enviar, o caso fica ligado à sua conta.')}
            </Text>
          </View>
        </View>
      ) : null}
      <View style={styles.notice} accessible accessibilityRole="summary">
        <MaterialCommunityIcons name="shield-account-outline" size={24} color={brand.blue} />
        <View style={styles.noticeTexts}>
          <Text style={styles.noticeTitle}>{t('Proteja quem você procura')}</Text>
          <Text style={styles.noticeBody}>
            {t('Não informe endereço de casa, escola, rotina nem documentos — principalmente de crianças e de mulheres em situação de risco. Faça também o boletim de ocorrência: não é preciso esperar 24 horas.')}
          </Text>
        </View>
      </View>
      <BrandField
        label={t('Nome completo')}
        value={controller.fullName}
        onChangeText={controller.setFullName}
        onBlur={controller.blurFullName}
        placeholder={t('Fulano Beltrano da Silva')}
        autoCapitalize="words"
        required
        error={controller.fieldError('fullName')}
      />
      <View style={styles.fieldWithHint}>
        <BrandField
          label={t('Localidade')}
          value={controller.location}
          onChangeText={controller.setLocation}
          onBlur={controller.blurLocation}
          placeholder={t('Ex.: Savassi, Belo Horizonte - MG')}
          autoCapitalize="words"
          required
          error={controller.fieldError('localidade')}
        />
        <Text style={styles.hint}>
          {t('Onde a pessoa foi vista pela última vez: bairro ou ponto de referência e cidade.')}
        </Text>
      </View>

      <Text style={styles.groupLabel} accessibilityRole="header">
        {t('De onde a pessoa é (opcional)')}
      </Text>
      <FormRow>
        <BrandField
          label={t('Cidade')}
          value={controller.originCity}
          onChangeText={controller.setOriginCity}
          placeholder={t('Ex.: Belo Horizonte')}
          autoCapitalize="words"
        />
        <BrandField
          label={t('Estado')}
          value={controller.originState}
          onChangeText={controller.setOriginState}
          placeholder={t('Ex.: MG')}
          autoCapitalize="characters"
        />
      </FormRow>
      <FormRow>
        <BrandField
          label={t('País')}
          value={controller.originCountry}
          onChangeText={controller.setOriginCountry}
          placeholder={t('Ex.: Brasil')}
          autoCapitalize="words"
        />
        <BrandField
          label={t('Bairro')}
          value={controller.originNeighborhood}
          onChangeText={controller.setOriginNeighborhood}
          placeholder={t('Ex.: Savassi')}
          autoCapitalize="words"
        />
      </FormRow>

      <View style={styles.fieldWithHint}>
        <BrandField
          label={t('Telefone')}
          value={controller.phone}
          onChangeText={controller.setPhone}
          onBlur={controller.blurPhone}
          placeholder="(31) 99999-9999"
          keyboardType="phone-pad"
          required
          error={controller.fieldError('phone')}
        />
        <Text style={styles.hint}>
          {t('Da família ou de quem cadastra, para receber informações sobre a pessoa.')}
        </Text>
      </View>

      <View style={styles.photoWrapper}>
        <Text style={styles.photoLabel}>{t('Foto')}</Text>
        {controller.photoUri ? (
          <View style={styles.photoPreviewCard}>
            <Image
              source={{ uri: controller.photoUri }}
              style={styles.photoImage}
              resizeMode="cover"
              accessibilityLabel={t('Foto escolhida')}
            />
            <Pressable
              style={styles.removeBadge}
              onPress={controller.handleRemovePhoto}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('Remover foto')}
            >
              <MaterialCommunityIcons name="close" size={14} color={brand.onPrimary} />
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={styles.photoBox}
            onPress={controller.handlePickPhoto}
            accessibilityRole="button"
            accessibilityLabel={t('Adicionar foto')}
          >
            <MaterialCommunityIcons name="camera" size={28} color={brand.blue} />
            <Text style={styles.photoBoxText}>{t('Adicionar foto')}</Text>
          </Pressable>
        )}
        <Text style={styles.hint}>
          {t('Recente e nítida, de preferência só do rosto. PNG ou JPG, até 2 MB.')}
        </Text>
      </View>

      <FormRow>
        <BrandField
          label={t('Apelido')}
          value={controller.nickname}
          onChangeText={controller.setNickname}
          placeholder={t('Fulano')}
          autoCapitalize="words"
        />
        <BrandField
          label={t('Idade')}
          value={controller.age}
          onChangeText={controller.setAge}
          onBlur={controller.blurAge}
          placeholder="36"
          keyboardType="number-pad"
          required
          error={controller.fieldError('age')}
        />
      </FormRow>

      <FormRow>
        <BrandSelect
          label={t('Porte físico')}
          value={controller.build}
          options={BUILD_OPTIONS}
          onSelect={controller.setBuild}
        />
        <BrandField
          label={t('Altura')}
          value={controller.heightCm}
          onChangeText={controller.setHeightCm}
          onBlur={controller.blurHeightCm}
          placeholder={t('180 cm')}
          keyboardType="numeric"
          error={controller.fieldError('heightCm')}
        />
      </FormRow>

      <BrandSelect
        label={t('Cor/Etnia')}
        value={controller.ethnicity}
        options={ETHNICITY_OPTIONS}
        onSelect={controller.setEthnicity}
      />

      <BrandField
        label={t('Roupas')}
        value={controller.clothes}
        onChangeText={controller.setClothes}
        placeholder={t('Camisa branca, calça jeans etc.')}
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
    noticeTexts: {
      flex: 1,
      gap: 4,
    },
    noticeTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: brand.textDark,
    },
    noticeBody: {
      fontSize: 14,
      lineHeight: 20,
      color: brand.textMuted,
    },
    fieldWithHint: {
      gap: 6,
    },
    hint: {
      fontSize: 13,
      lineHeight: 18,
      color: brand.textMuted,
    },
    groupLabel: {
      marginTop: 2,
      fontSize: 15,
      fontWeight: '800',
      color: brand.textDark,
    },
    photoWrapper: {
      gap: 8,
    },
    photoLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: brand.label,
    },
    photoBox: {
      minHeight: 64,
      flexDirection: 'row',
      gap: 10,
      borderRadius: Radius.md,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: brand.fieldBorder,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      backgroundColor: brand.fieldBackground,
    },
    photoBoxText: {
      fontSize: 15,
      fontWeight: '700',
      color: brand.blue,
    },
    photoPreviewCard: {
      width: 96,
      height: 96,
      borderRadius: Radius.md,
      overflow: 'hidden',
      backgroundColor: brand.avatarBackground,
      borderWidth: 1,
      borderColor: brand.fieldBorder,
    },
    photoImage: {
      width: '100%',
      height: '100%',
    },
    removeBadge: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 22,
      height: 22,
      borderRadius: Radius.pill,
      backgroundColor: brand.pin,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
