import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandField } from '@/components/brand-field';
import { SettingsGroup, SettingsRow } from '@/components/settings-list';
import { makeEquipeStyles } from '@/features/equipe/sections/equipe-styles';
import type { InstitucionalController } from '@/features/vision/institucional.controller';
import { VisionChip, VisionNotice, VisionState } from '@/features/vision/sections/vision-common';
import { useVisionFormat } from '@/features/vision/vision-format';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { ACTION_LABEL, ROLE_LABEL } from '@/lib/vision-labels';

/** Sem habilitação: explica por quê e permite pedir. Nunca libera nada sozinho. */
export function InstitutionalAccessRequestSection({ controller: c }: { controller: InstitucionalController }) {
  const t = useT();
  const brand = useBrand();
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  const format = useVisionFormat();
  const has = (key: Parameters<InstitucionalController['setField']>[0]) => c.errors.includes(key);

  if (c.access?.role === 'technical') {
    return (
      <VisionNotice
        icon="server-network"
        text={t('A equipe técnica cuida do funcionamento do sistema e não tem acesso a operações, gravações ou dados dos casos. Um acesso excepcional precisa de autorização, justificativa e registro.')}
      />
    );
  }

  return (
    <View style={s.section}>
      <VisionNotice
        icon="shield-lock-outline"
        tone="attention"
        text={t('Esta área é só para autoridades e profissionais habilitados. Cada acesso é individual, limitado à função e registrado.')}
      />
      {c.access?.pendingRequest ? (
        <VisionNotice
          icon="progress-clock"
          text={t('Seu pedido de habilitação {id} está em análise desde {date}. A equipe confere a instituição e a pessoa antes de liberar.', {
            id: c.access.pendingRequest.id,
            date: format.dateTime(c.access.pendingRequest.requestedAt),
          })}
        />
      ) : (
        <>
          <Text style={s.title} accessibilityRole="header">
            {t('Pedir habilitação institucional')}
          </Text>
          <Text style={s.muted}>
            {t('Use os dados da sua instituição. A equipe confirma por canal oficial antes de liberar qualquer acesso.')}
          </Text>
          <BrandField
            label={t('Instituição ou órgão')}
            value={c.form.institution}
            onChangeText={(value) => c.setField('institution', value)}
            required
            error={has('institution') ? t('Informe a instituição.') : undefined}
          />
          <BrandField
            label={t('Cargo ou função')}
            value={c.form.position}
            onChangeText={(value) => c.setField('position', value)}
            required
            error={has('position') ? t('Informe o cargo.') : undefined}
          />
          <BrandField
            label={t('Matrícula ou identificação funcional')}
            value={c.form.registration}
            onChangeText={(value) => c.setField('registration', value)}
            autoCapitalize="none"
            required
            error={has('registration') ? t('Informe a matrícula.') : undefined}
          />
          <BrandField
            label={t('E-mail institucional')}
            value={c.form.institutionalEmail}
            onChangeText={(value) => c.setField('institutionalEmail', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            required
            error={has('institutionalEmail') ? t('Informe um e-mail válido.') : undefined}
          />
          <BrandField
            label={t('Para que você precisa do acesso')}
            value={c.form.reason}
            onChangeText={(value) => c.setField('reason', value)}
            maxLength={500}
            multiline
            required
            error={has('reason') ? t('Explique em pelo menos 20 letras.') : undefined}
          />
          {c.message ? <Text style={s.text}>{c.message}</Text> : null}
          <BrandButton label={t('Enviar pedido de habilitação')} variant="blue" loading={c.sending} onPress={c.submitAccess} />
        </>
      )}
    </View>
  );
}

/** Operações de busca audiovisual (cada uma com caso, justificativa, escopo, responsáveis e histórico). */
export function InstitutionalOperationsSection({ controller: c }: { controller: InstitucionalController }) {
  const t = useT();
  const brand = useBrand();
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  const format = useVisionFormat();
  return (
    <View style={s.section}>
      <Text style={s.title} accessibilityRole="header">
        {t('Operações de busca')}
      </Text>
      {c.canCreate ? <BrandButton label={t('Abrir operação de busca')} variant="blue" onPress={c.newOperation} /> : null}
      {c.operationsLoading || c.operationsError || c.operations.length === 0 ? (
        <VisionState
          loading={c.operationsLoading}
          error={c.operationsError ? t('Não foi possível carregar as operações.') : undefined}
          empty={t('Nenhuma operação aberta.')}
          onRetry={c.retryOperations}
        />
      ) : (
        c.operations.map((operation) => (
          <Pressable
            key={operation.id}
            onPress={() => c.openOperation(operation.id)}
            style={({ pressed }) => [s.card, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel={`${operation.id}, ${operation.caseLabel}`}
          >
            <Text style={s.cardTitle}>
              {operation.id} · {operation.caseLabel}
            </Text>
            <Text style={s.muted}>
              {t('Último local conhecido: {place}', { place: operation.lastKnownPlace })}
            </Text>
            <Text style={s.muted}>
              {t('Em {date} · raio de {radius}', {
                date: format.dateTime(operation.lastSeenAt),
                radius: format.distance(operation.radiusKm),
              })}
            </Text>
            <View style={s.row}>
              <VisionChip
                label={operation.status === 'open' ? t('Aberta') : t('Encerrada')}
                color={operation.status === 'open' ? brand.blue : brand.textMuted}
              />
              {operation.openRequests > 0 ? (
                <VisionChip
                  label={t('{count} pedidos em andamento', { count: String(operation.openRequests) })}
                  color={brand.orangeText}
                  icon="file-clock-outline"
                />
              ) : null}
              {operation.matchesToReview > 0 ? (
                <VisionChip
                  label={t('{count} correspondências para revisar', { count: String(operation.matchesToReview) })}
                  color={brand.categoryElder}
                  icon="account-search-outline"
                />
              ) : null}
            </View>
          </Pressable>
        ))
      )}
    </View>
  );
}

/** O que a função permite, auditoria e integrações (todas dependem de convênio). */
export function InstitutionalGovernanceSection({ controller: c }: { controller: InstitucionalController }) {
  const t = useT();
  const brand = useBrand();
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  const role = c.access?.role;
  return (
    <>
      <View style={s.section}>
        <Text style={s.title} accessibilityRole="header">
          {t('Sua função')}
        </Text>
        <Text style={s.text}>
          {role ? t(ROLE_LABEL[role]) : '—'}
          {c.access?.institution ? ` · ${c.access.institution}` : ''}
        </Text>
        {c.permissions.map((item) => (
          <View key={item.action} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MaterialCommunityIcons
              name={item.allowed ? 'check-circle-outline' : 'close-circle-outline'}
              size={20}
              color={item.allowed ? brand.categoryAdult : brand.textMuted}
            />
            <Text style={item.allowed ? s.text : s.muted}>{t(ACTION_LABEL[item.action])}</Text>
          </View>
        ))}
        <Text style={s.muted}>
          {t('A liberação de funções para outras pessoas é feita pela equipe, com registro (gerenciamento de permissões).')}
        </Text>
      </View>
      <SettingsGroup title={t('Controle')}>
        {c.canAudit ? (
          <SettingsRow icon="clipboard-text-clock-outline" label={t('Auditoria de acessos e decisões')} onPress={c.goToAudit} />
        ) : (
          <SettingsRow icon="clipboard-text-clock-outline" label={t('Auditoria de acessos e decisões')} disabled />
        )}
        <SettingsRow icon="account-key-outline" label={t('Gerenciar permissões da equipe')} unavailable />
      </SettingsGroup>
      <SettingsGroup
        title={t('Integrações institucionais')}
        footer={t('Nenhuma integração real está ligada. Cada uma depende de convênio, autorização do responsável e avaliação técnica e jurídica.')}
      >
        <SettingsRow icon="cctv" label={t('Câmeras IP e RTSP autorizadas')} unavailable />
        <SettingsRow icon="monitor-dashboard" label={t('Sistemas de videomonitoramento')} unavailable />
        <SettingsRow icon="cloud-outline" label={t('Armazenamento de gravações')} unavailable />
        <SettingsRow icon="robot-outline" label={t('Análise visual por IA (sem reconhecimento facial)')} unavailable />
        <SettingsRow icon="bank-outline" label={t('Sistemas de órgãos públicos')} unavailable />
      </SettingsGroup>
    </>
  );
}
