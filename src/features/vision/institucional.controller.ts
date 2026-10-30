import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';

import { visionErrorText } from '@/features/vision/vision-format';
import { isReceiptConfirmed } from '@/lib/collaboration-rules';
import { env } from '@/lib/env';
import { useT } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';
import { can, isInstitutional, type VisionAction } from '@/lib/vision-rules';
import {
  useOperationsQuery,
  useVisionAccessQuery,
  useVisionActions,
  useVisionDemoRole,
} from '@/services/vision/vision.service';

const ALL_ACTIONS: VisionAction[] = [
  'view_operations',
  'create_operation',
  'change_radius',
  'request_preservation',
  'view_footage',
  'classify_match',
  'rate_information',
  'view_audit',
];

type AccessField = 'institution' | 'position' | 'registration' | 'institutionalEmail' | 'reason';

/** "/vision/institucional": entrada do ambiente institucional (habilitação verificada) e pedido de habilitação. */
export function useInstitucionalController() {
  const t = useT();
  const router = useRouter();
  const goBack = useSafeBack('/vision' as Href);
  const accessQuery = useVisionAccessQuery();
  const access = accessQuery.data ?? null;
  const institutional = isInstitutional(access);
  const operationsQuery = useOperationsQuery(institutional);
  const actions = useVisionActions();
  const setDemoRole = useVisionDemoRole();

  const [form, setForm] = useState<Record<AccessField, string>>({
    institution: '',
    position: '',
    registration: '',
    institutionalEmail: '',
    reason: '',
  });
  const [errors, setErrors] = useState<AccessField[]>([]);
  const [message, setMessage] = useState<string | undefined>();

  const submitAccess = () => {
    const found: AccessField[] = [];
    if (form.institution.trim().length < 3) found.push('institution');
    if (form.position.trim().length < 3) found.push('position');
    if (form.registration.trim().length < 3) found.push('registration');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.institutionalEmail.trim())) found.push('institutionalEmail');
    if (form.reason.trim().length < 20) found.push('reason');
    setErrors(found);
    setMessage(undefined);
    if (found.length > 0) return;
    void (async () => {
      try {
        const receipt = await actions.requestAccess.mutateAsync({
          institution: form.institution.trim(),
          position: form.position.trim(),
          registration: form.registration.trim(),
          institutionalEmail: form.institutionalEmail.trim(),
          reason: form.reason.trim(),
        });
        if (!isReceiptConfirmed(receipt.id, receipt.receivedAt)) {
          setMessage(t('O envio não foi confirmado. Tente de novo em alguns instantes.'));
          return;
        }
        setMessage(
          receipt.simulated
            ? t('Pedido {id} registrado no modo de demonstração (nada foi enviado de verdade). Na versão real, a equipe confere a instituição e a pessoa antes de liberar.', { id: receipt.id ?? '' })
            : t('Pedido {id} recebido. A equipe confere a instituição e a pessoa antes de liberar; a habilitação não é automática.', { id: receipt.id ?? '' }),
        );
      } catch (error) {
        setMessage(t(visionErrorText(error)));
      }
    })();
  };

  return {
    goBack,
    enabled: env.visionEnabled,
    demo: env.useMocks,
    checking: accessQuery.isLoading,
    checkFailed: accessQuery.isError,
    retryAccess: () => {
      void accessQuery.refetch();
    },
    access,
    institutional,
    setDemoRole,
    operations: operationsQuery.data ?? [],
    operationsLoading: operationsQuery.isLoading,
    operationsError: operationsQuery.isError,
    retryOperations: () => {
      void operationsQuery.refetch();
    },
    permissions: ALL_ACTIONS.map((action) => ({ action, allowed: can(access, action) })),
    canCreate: can(access, 'create_operation'),
    canAudit: can(access, 'view_audit'),
    form,
    errors,
    message,
    sending: actions.requestAccess.isPending,
    setField: (key: AccessField, value: string) => {
      setForm((current) => ({ ...current, [key]: value }));
      setErrors((current) => current.filter((item) => item !== key));
    },
    submitAccess,
    openOperation: (id: string) => router.push(`/vision/institucional/operacao/${encodeURIComponent(id)}` as Href),
    newOperation: () => router.push('/vision/institucional/nova-operacao' as Href),
    goToAudit: () => router.push('/vision/institucional/auditoria' as Href),
  };
}

export type InstitucionalController = ReturnType<typeof useInstitucionalController>;
export type { AccessField };
