import { StyleSheet, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandField } from '@/components/brand-field';
import { FormRow } from '@/components/form-row';
import type { CadastrarPessoaController } from '@/features/cadastrar-pessoa/cadastrar-pessoa.controller';
import { CadastrarPessoaResponsibilitySection } from '@/features/cadastrar-pessoa/sections/cadastrar-pessoa-responsibility-section';
import { useT } from '@/lib/i18n';

interface CadastrarPessoaDetailsSectionProps {
  controller: CadastrarPessoaController;
}

export function CadastrarPessoaDetailsSection({ controller }: CadastrarPessoaDetailsSectionProps) {
  const t = useT();
  return (
    <View style={styles.form}>
      <FormRow>
        <BrandField
          label={t('Cabelo')}
          value={controller.hair}
          onChangeText={controller.setHair}
          placeholder={t('Cabelo preto cacheado')}
        />
        <BrandField
          label={t('Olhos')}
          value={controller.eyes}
          onChangeText={controller.setEyes}
          placeholder={t('Olhos castanhos')}
        />
      </FormRow>
      <FormRow>
        <BrandField
          label={t('Tatuagem')}
          value={controller.tattoo}
          onChangeText={controller.setTattoo}
          placeholder={t('Tatuagem de leão no braço esquerdo')}
        />
        <BrandField
          label={t('Acessórios')}
          value={controller.accessories}
          onChangeText={controller.setAccessories}
          placeholder={t('Brincos, colar, pulseiras etc.')}
        />
      </FormRow>
      <BrandField
        label={t('Data em que foi vista pela última vez')}
        value={controller.lastSeen}
        onChangeText={controller.setLastSeen}
        onBlur={controller.blurLastSeen}
        placeholder={t('dd/mm/aaaa')}
        keyboardType="numeric"
        error={controller.fieldError('lastSeen')}
      />

      <CadastrarPessoaResponsibilitySection controller={controller} />

      <BrandButton
        label={controller.reviewingDraft ? t('Enviar cadastro') : t('Cadastrar')}
        variant="orange"
        loading={controller.submitting}
        disabled={!controller.nearFormEnd}
        onPress={controller.handleRegister}
        style={controller.nearFormEnd ? styles.submit : styles.submitHidden}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 18,
  },
  submit: {
    marginTop: 8,
  },
  submitHidden: {
    marginTop: 8,
    opacity: 0,
  },
});
