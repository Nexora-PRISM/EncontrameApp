import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandCheckbox } from '@/components/brand-checkbox';
import { BrandField } from '@/components/brand-field';
import { BrandSelect } from '@/components/brand-select';
import { type BrandColors } from '@/constants/brand';
import { makeEquipeStyles } from '@/features/equipe/sections/equipe-styles';
import type { CameraFormController } from '@/features/vision/camera-form.controller';
import { VisionChip, VisionNotice } from '@/features/vision/sections/vision-common';
import { useVisionFormat } from '@/features/vision/vision-format';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { msg } from '@/lib/i18n-msg';
import {
  AUTHORIZATION_LABEL,
  authorizationColor,
  CAMERA_ERROR_LABEL,
  CAMERA_SOURCE_LABEL,
  INTEGRATION_LABEL,
  SHARING_LABEL,
} from '@/lib/vision-labels';
import type { CameraError, CameraShareEvent } from '@/lib/vision-rules';

const HISTORY_LABEL: Readonly<Record<CameraShareEvent['kind'], string>> = {
  registered: msg('Câmera cadastrada'),
  authorized: msg('Verificada: passou a participar'),
  suspended: msg('Participação pausada'),
  revoked: msg('Participação encerrada'),
  reactivated: msg('Pediu para voltar a participar'),
  updated: msg('Dados atualizados'),
  request_received: msg('Pedido de preservação recebido'),
  images_sent: msg('Imagens fornecidas'),
};

/** Formulário da câmera. Nenhum campo pede senha, usuário ou endereço de acesso. */
export function CameraFormSection({ controller: c }: { controller: CameraFormController }) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const error = (key: CameraError) => (c.errors.includes(key) ? t(CAMERA_ERROR_LABEL[key]) : undefined);
  const f = c.fields;

  return (
    <View style={styles.form}>
      <VisionNotice
        tone="attention"
        icon="lock-outline"
        text={t('Nunca escreva aqui senha, usuário, IP ou endereço de acesso da câmera. Se um dia for preciso conectar o equipamento, isso será combinado com você, por um canal próprio.')}
      />
      <BrandField
        label={t('Nome da câmera')}
        value={f.name}
        onChangeText={c.setName}
        placeholder={t('Ex.: Entrada da loja')}
        maxLength={60}
        required
        error={error('name')}
      />
      <BrandSelect
        label={t('Tipo de local')}
        value={f.source}
        options={Object.values(CAMERA_SOURCE_LABEL)}
        onSelect={c.setSource}
      />
      {error('source') ? <Text style={styles.error}>{error('source')}</Text> : null}
      <BrandField label={t('Bairro ou região')} value={f.region} onChangeText={c.setRegion} required error={error('region')} />
      <BrandField label={t('Cidade')} value={f.city} onChangeText={c.setCity} required error={error('city')} />
      <BrandField
        label={t('O que a câmera mostra')}
        value={f.coverage}
        onChangeText={c.setCoverage}
        placeholder={t('Ex.: calçada em frente à loja e parte da rua')}
        maxLength={200}
        multiline
        required
        error={error('coverage')}
      />
      <Text style={styles.hint}>
        {t('Só a região aparece para a comunidade. O nome, o que a câmera mostra e a posição ficam restritos a você e às autoridades habilitadas.')}
      </Text>
      <BrandField
        label={t('Equipamento (opcional)')}
        value={f.equipment}
        onChangeText={c.setEquipment}
        placeholder={t('Ex.: câmera fixa com gravador')}
        maxLength={80}
      />
      <View style={styles.location}>
        <Text style={styles.label}>{t('Posição da câmera (opcional)')}</Text>
        <Text style={styles.hint}>
          {c.location
            ? t('Posição salva. Ela não aparece para a comunidade.')
            : t('Use a localização do aparelho só se você estiver no local da câmera.')}
        </Text>
        <View style={styles.row}>
          <BrandButton
            label={c.location ? t('Atualizar posição') : t('Usar a localização deste aparelho')}
            variant="outline"
            loading={c.locating}
            onPress={c.locateHere}
          />
          {c.location ? <BrandButton label={t('Remover posição')} variant="outline" onPress={c.clearLocation} /> : null}
        </View>
        {c.locationMessage ? <Text style={styles.error}>{c.locationMessage}</Text> : null}
        {error('location') ? <Text style={styles.error}>{error('location')}</Text> : null}
      </View>
      <Text style={styles.label}>{t('Horário em que grava (deixe em branco se grava o dia todo)')}</Text>
      <View style={styles.row}>
        <View style={styles.half}>
          <BrandField label={t('Das')} value={f.hoursStart} onChangeText={c.setHoursStart} placeholder="08:00" keyboardType="number-pad" />
        </View>
        <View style={styles.half}>
          <BrandField label={t('Até')} value={f.hoursEnd} onChangeText={c.setHoursEnd} placeholder="18:00" keyboardType="number-pad" />
        </View>
      </View>
      {error('hours') ? <Text style={styles.error}>{error('hours')}</Text> : null}
      <BrandField
        label={t('Por quantos dias as gravações ficam guardadas')}
        value={f.retention}
        onChangeText={c.setRetention}
        keyboardType="number-pad"
        required
        error={error('retention')}
      />
      <Text style={styles.hint}>
        {t('Muitos equipamentos apagam as gravações sozinhos depois de alguns dias. Esse prazo ajuda a pedir a preservação a tempo.')}
      </Text>
      <BrandSelect
        label={t('Como as imagens podem ser entregues')}
        value={f.integration}
        options={Object.values(INTEGRATION_LABEL)}
        onSelect={c.setIntegration}
      />
      {error('integration') ? <Text style={styles.error}>{error('integration')}</Text> : null}
      <BrandSelect
        label={t('Quando você aceita fornecer gravações')}
        value={f.sharing}
        options={Object.values(SHARING_LABEL)}
        onSelect={c.setSharing}
      />
      {error('sharing') ? <Text style={styles.error}>{error('sharing')}</Text> : null}
      <BrandCheckbox
        checked={f.consent}
        onToggle={c.toggleConsent}
        accessibilityLabel={t('Declaração do responsável')}
        error={error('consent')}
      >
        {t('Sou responsável por esta câmera, ela não filma o interior da casa de outras pessoas, e entendo que participar não libera as imagens: cada pedido passa por mim ou por procedimento legal.')}
      </BrandCheckbox>
      {error('secret') ? <Text style={styles.error}>{error('secret')}</Text> : null}
      {c.message ? <Text style={styles.message}>{c.message}</Text> : null}
      <BrandButton
        label={c.isNew ? t('Cadastrar câmera') : t('Salvar alterações')}
        variant="orange"
        loading={c.saving}
        onPress={c.save}
      />
    </View>
  );
}

/** Situação da participação e histórico. O responsável pode pausar, encerrar ou pedir para voltar. */
export function CameraParticipationSection({ controller: c }: { controller: CameraFormController }) {
  const t = useT();
  const brand = useBrand();
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  const format = useVisionFormat();
  const camera = c.camera;
  if (!camera) return null;
  return (
    <View style={s.section}>
      <Text style={s.title} accessibilityRole="header">
        {t('Participação')}
      </Text>
      <VisionChip label={t(AUTHORIZATION_LABEL[camera.authorization])} color={authorizationColor(brand, camera.authorization)} />
      <View style={s.row}>
        {c.canPause ? <BrandButton label={t('Pausar')} variant="outline" loading={c.changing} onPress={c.pause} /> : null}
        {c.canReturn ? (
          <BrandButton label={t('Pedir para voltar')} variant="outline" loading={c.changing} onPress={c.askReturn} />
        ) : null}
        {c.canRevoke ? (
          <BrandButton label={t('Encerrar participação')} variant="outline" loading={c.changing} onPress={c.revoke} />
        ) : null}
      </View>
      <Text style={s.title} accessibilityRole="header">
        {t('Histórico')}
      </Text>
      {[...camera.history].reverse().map((event, index) => (
        <Text key={`${event.at}-${index}`} style={s.muted}>
          {format.dateTime(event.at)} — {t(HISTORY_LABEL[event.kind])}
        </Text>
      ))}
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    form: { gap: 14 },
    label: { fontSize: 15, fontWeight: '700', color: brand.label },
    hint: { fontSize: 14, lineHeight: 20, color: brand.textMuted },
    error: { fontSize: 14, color: brand.error },
    message: { fontSize: 15, lineHeight: 21, color: brand.textDark },
    location: { gap: 8 },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    half: { flexGrow: 1, flexBasis: 120 },
  });
}
