import { type Href, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';

import { centralErrorText } from '@/features/central/dossie.controller';
import { buildExportPackage, exportItemsFor, isRedactable } from '@/features/central/export-package';
import { useVisionFormat } from '@/features/vision/vision-format';
import { LEGAL_BASIS_LABEL } from '@/lib/central-labels';
import {
  centralCan,
  defaultSelection,
  type ExportError,
  type ExportSelection,
  LEGAL_BASES,
  type LegalBasis,
  manifestText,
  needsSecondApproval,
  passphraseFromBytes,
  validateExport,
} from '@/lib/central-rules';
import { isReceiptConfirmed } from '@/lib/collaboration-rules';
import { confirmAction, showAlert } from '@/lib/dialog';
import { decryptorHtml, encryptBytes, webCrypto } from '@/lib/encrypted-package';
import { env } from '@/lib/env';
import { tr, useT } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';
import { canUseWebFiles, downloadBytes, downloadText, printHtml } from '@/lib/web-file';
import { DEMO_SECOND_ADMIN } from '@/services/central/central.mock.repository';
import {
  getCentralFileBytes,
  useCentralAccessQuery,
  useCentralActions,
  useDossierQuery,
} from '@/services/central/central.service';
import type { Dossier } from '@/services/central/central.types';

export type Delivery = 'download' | 'encrypted_package' | 'print';

type Result = {
  exportId: string;
  receivedAt: string;
  simulated: boolean;
  fileName: string;
  fileCount: number;
  manifestSha256: string;
  manifestText: string;
  password?: string;
  delivery: Delivery;
};

/** "/institucional/dossie/[id]/exportar": revisão, proteção dos dados e geração do pacote para autoridades. */
export function useExportarController() {
  const t = useT();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? (params.id[0] ?? '') : (params.id ?? '');
  const goBack = useSafeBack(`/institucional/dossie/${id}` as Href);
  const accessQuery = useCentralAccessQuery();
  const access = accessQuery.data ?? null;
  const allowed = centralCan(access, 'export_dossier');
  const query = useDossierQuery(id, centralCan(access, 'view_dossiers'));
  const actions = useCentralActions();
  const format = useVisionFormat();
  const dossier = query.data;
  const items = useMemo(() => (dossier ? exportItemsFor(dossier) : []), [dossier]);

  const [selection, setSelection] = useState<ExportSelection>({});
  const [filledFrom, setFilledFrom] = useState<Dossier | null>(null);
  if (dossier && dossier !== filledFrom) {
    setFilledFrom(dossier);
    // Mantém as escolhas já feitas; itens novos entram com a opção mais protetora.
    setSelection((current) => ({ ...defaultSelection(items), ...current }));
  }

  const [purpose, setPurpose] = useState('');
  const [legalBasis, setLegalBasis] = useState('');
  const [institution, setInstitution] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [email, setEmail] = useState('');
  const [recipientConfirmed, setRecipientConfirmed] = useState(false);
  const [authorizer, setAuthorizer] = useState<'self' | 'second'>('self');
  const [delivery, setDelivery] = useState<Delivery>('encrypted_package');
  const [errors, setErrors] = useState<ExportError[]>([]);
  const [working, setWorking] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const me = access?.userName ?? '';
  const authorizerName = authorizer === 'self' ? me : DEMO_SECOND_ADMIN;
  const basisCode: LegalBasis | '' =
    (Object.entries(LEGAL_BASIS_LABEL) as [LegalBasis, string][]).find(([, label]) => label === legalBasis)?.[0] ?? '';
  const secondNeeded = needsSecondApproval(items, selection);
  const web = canUseWebFiles();

  const generate = () => {
    if (!dossier) return;
    const request = {
      purpose,
      legalBasis: basisCode,
      recipient: { institution, name: recipientName, email },
      recipientConfirmed,
      requesterName: me,
      authorizerName,
      items,
      selection,
    };
    const found = validateExport(request);
    setErrors(found);
    if (found.length > 0 || !basisCode) return;
    if (!web) {
      showAlert(tr('Use o computador'), tr('A geração do pacote funciona na versão web do app, num computador.'));
      return;
    }
    void (async () => {
      const ok = await confirmAction({
        title: tr('Gerar o pacote?'),
        message: tr('A exportação fica registrada com finalidade, fundamento, destinatário e quem autorizou. Nada é enviado automaticamente: você entrega o arquivo pelo canal combinado.'),
        confirmLabel: tr('Gerar'),
      });
      if (!ok) return;
      setWorking(true);
      try {
        const generatedAt = new Date();
        const built = await buildExportPackage(
          dossier,
          items,
          selection,
          { purpose: purpose.trim(), legalBasis: basisCode, recipient: request.recipient, generatedBy: me, authorizedBy: authorizerName, generatedAt },
          (fileId) => getCentralFileBytes(dossier.id, fileId),
          (tipId) => actions.openIdentity.mutateAsync({ dossierId: dossier.id, tipId, justification: purpose.trim() }),
        );
        // Registra antes de entregar: sem registro confirmado, nada é baixado.
        const receipt = await actions.registerExport.mutateAsync({
          dossierId: dossier.id,
          record: {
            authorizedBy: authorizerName,
            recipient: request.recipient,
            purpose: purpose.trim(),
            legalBasis: basisCode,
            manifestSha256: built.manifestSha256,
            files: built.fileCount,
            delivery,
            justification: purpose.trim(),
          },
        });
        if (!isReceiptConfirmed(receipt.id, receipt.receivedAt) || !receipt.id || !receipt.receivedAt) {
          showAlert(tr('Exportação não registrada'), tr('O registro não foi confirmado, por isso o pacote não foi entregue. Tente de novo.'));
          return;
        }
        let password: string | undefined;
        if (delivery === 'download') {
          downloadBytes(built.zip, built.fileName, 'application/zip');
        } else if (delivery === 'encrypted_package') {
          const cryptoImpl = webCrypto();
          if (!cryptoImpl) throw new Error('webcrypto-unavailable');
          password = passphraseFromBytes(cryptoImpl.getRandomValues(new Uint8Array(24)));
          const payload = await encryptBytes(built.zip, password, cryptoImpl);
          const html = decryptorHtml(payload, {
            fileName: built.fileName,
            caseReference: dossier.caseId,
            generatedAt: format.dateTime(generatedAt.toISOString()),
          });
          downloadText(html, built.fileName.replace(/\.zip$/, '-protegido.html'), 'text/html;charset=utf-8');
        } else {
          printHtml(built.reportHtml);
        }
        setResult({
          exportId: receipt.id,
          receivedAt: receipt.receivedAt,
          simulated: receipt.simulated === true,
          fileName: built.fileName,
          fileCount: built.fileCount,
          manifestSha256: built.manifestSha256,
          manifestText: manifestText(built.manifest),
          password,
          delivery,
        });
      } catch (error) {
        showAlert(tr('Não foi possível gerar o pacote'), tr(centralErrorText(error)));
      } finally {
        setWorking(false);
      }
    })();
  };

  const clear = (key: ExportError) => setErrors((list) => list.filter((item) => item !== key));

  return {
    id,
    goBack,
    enabled: env.centralEnabled,
    demo: env.useMocks,
    web,
    format,
    checking: accessQuery.isLoading || query.isLoading,
    allowed,
    mfa: access?.mfa ?? false,
    dossier,
    items,
    selection,
    redactable: (itemId: string) => {
      const item = items.find((entry) => entry.id === itemId);
      return !!item && !!dossier && isRedactable(item, dossier);
    },
    toggleInclude: (itemId: string) => {
      setSelection((current) => ({ ...current, [itemId]: { include: !current[itemId]?.include, redact: current[itemId]?.redact ?? true } }));
      clear('empty');
      clear('second_approval');
    },
    toggleRedact: (itemId: string) =>
      setSelection((current) => ({ ...current, [itemId]: { include: current[itemId]?.include ?? false, redact: !current[itemId]?.redact } })),
    fields: { purpose, legalBasis, institution, recipientName, email, recipientConfirmed, authorizer, delivery },
    legalBasisOptions: LEGAL_BASES.map((basis) => LEGAL_BASIS_LABEL[basis]),
    authorizerOptions: [
      { value: 'self' as const, label: me ? t('Eu ({name})', { name: me }) : t('Eu') },
      ...(env.useMocks ? [{ value: 'second' as const, label: t('{name} (demonstração)', { name: DEMO_SECOND_ADMIN }) }] : []),
    ],
    secondNeeded,
    errors,
    working,
    result,
    setPurpose: (value: string) => {
      setPurpose(value);
      clear('purpose');
    },
    setLegalBasis: (value: string) => {
      setLegalBasis(value);
      clear('legal_basis');
    },
    setInstitution: (value: string) => {
      setInstitution(value);
      clear('recipient');
    },
    setRecipientName: (value: string) => {
      setRecipientName(value);
      clear('recipient');
    },
    setEmail: (value: string) => {
      setEmail(value.trim());
      clear('recipient_email');
    },
    toggleRecipientConfirmed: () => {
      setRecipientConfirmed((value) => !value);
      clear('recipient_confirmed');
    },
    setAuthorizer: (value: 'self' | 'second') => {
      setAuthorizer(value);
      clear('second_approval');
    },
    setDelivery,
    generate,
    downloadManifest: () => {
      if (result) downloadText(result.manifestText, result.fileName.replace(/\.zip$/, '-manifesto.txt'));
    },
    reset: () => setResult(null),
  };
}

export type ExportarController = ReturnType<typeof useExportarController>;
