import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { SettingsGroup, SettingsRow } from '@/components/settings-list';
import { makeEquipeStyles } from '@/features/equipe/sections/equipe-styles';
import { VisionChip, VisionNotice, VisionState } from '@/features/vision/sections/vision-common';
import type { VisionHomeController } from '@/features/vision/vision-home.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { COVERAGE_LEVEL_LABEL, coverageColor } from '@/lib/vision-labels';

/** Cobertura por região: só nome da região e um nível. Nada de posição, responsável ou ângulo das câmeras. */
export function VisionCoverageSection({ controller: c }: { controller: VisionHomeController }) {
  const t = useT();
  const brand = useBrand();
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  return (
    <View style={s.section}>
      <Text style={s.title} accessibilityRole="header">
        {t('Cobertura de câmeras participantes')}
      </Text>
      <Text style={s.text}>
        {t('Regiões onde moradores, comércios e instituições cadastraram câmeras para ajudar nas buscas.')}
      </Text>
      <VisionNotice
        icon="eye-off-outline"
        text={t('Aqui ninguém assiste a gravações nem vê onde ficam as câmeras. As imagens só são usadas por autoridades habilitadas, com pedido registrado.')}
      />
      {c.coverageLoading || c.coverageError || c.coverage.length === 0 ? (
        <VisionState
          loading={c.coverageLoading}
          error={c.coverageError ? t('Não foi possível carregar a cobertura.') : undefined}
          empty={t('Ainda não há câmeras participantes.')}
          onRetry={c.retryCoverage}
        />
      ) : (
        c.coverage.map((area) => (
          <View key={`${area.region}|${area.city}`} style={s.card}>
            <Text style={s.cardTitle}>{area.region}</Text>
            <Text style={s.muted}>{area.city}</Text>
            <VisionChip label={t(COVERAGE_LEVEL_LABEL[area.level])} color={coverageColor(brand, area.level)} icon="cctv" />
          </View>
        ))
      )}
      <Text style={s.muted}>
        {t('Pouca cobertura não quer dizer que ninguém viu nada. Se você souber de algo, conte pelo caso da pessoa.')}
      </Text>
    </View>
  );
}

/** Caminhos para participar: avisar pelo caso, cadastrar câmera, ambiente institucional. */
export function VisionPathsSection({ controller: c }: { controller: VisionHomeController }) {
  const t = useT();
  return (
    <>
      <SettingsGroup title={t('Como participar')}>
        <SettingsRow
          icon="account-search-outline"
          label={t('Viu alguém desaparecido?')}
          description={t('Abra o caso da pessoa e toque em "Vi essa pessoa por perto".')}
          onPress={c.goToMissing}
        />
        <SettingsRow
          icon="cctv"
          label={t('Tenho câmera e quero ajudar')}
          description={t('Cadastre sua câmera. Você decide cada pedido e pode sair quando quiser.')}
          onPress={c.goToMyCameras}
        />
        {c.access?.ownsCameras ? (
          <SettingsRow
            icon="file-document-outline"
            label={t('Pedidos de preservação recebidos')}
            onPress={c.goToRequests}
          />
        ) : null}
      </SettingsGroup>
      <SettingsGroup
        title={t('Autoridades e profissionais')}
        footer={t('O acesso institucional é individual, verificado pela equipe e registrado. Dizer que é autoridade não libera nada.')}
      >
        <SettingsRow
          icon="shield-account-outline"
          label={t('Ambiente institucional')}
          description={
            c.institutional
              ? t('Operações de busca, preservação de imagens e trajetos.')
              : t('Só para autoridades e profissionais habilitados.')
          }
          onPress={c.goToInstitutional}
        />
        {c.canSeeTechnical ? (
          <SettingsRow
            icon="server-network"
            label={t('Saúde técnica do Vision')}
            description={t('A equipe técnica vê o funcionamento do sistema, nunca operações ou gravações.')}
            unavailable
          />
        ) : null}
        <SettingsRow icon="help-circle-outline" label={t('Como o Encontra-me Vision funciona')} onPress={c.goToHelp} />
      </SettingsGroup>
    </>
  );
}
