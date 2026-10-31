import { AppInfo } from '@/lib/app-info';
import { NATURE_LABEL, TIP_CHANNEL_LABEL, TIP_STATUS_LABEL, LEGAL_BASIS_LABEL, SENSITIVITY_LABEL } from '@/lib/central-labels';
import {
  buildManifest,
  type ExportItem,
  type ExportSelection,
  HASH_NOTICE,
  type LegalBasis,
  type Manifest,
  manifestText,
  type PackageFile,
  type Recipient,
  redactPersonalData,
} from '@/lib/central-rules';
import { sha256Hex, utf8Bytes } from '@/lib/sha256';
import { buildZip } from '@/lib/zip-writer';
import type { Dossier, WitnessIdentity } from '@/services/central/central.types';

/**
 * Montagem do pacote "Exportar dossiê para autoridades", no aparelho de quem exporta:
 * relatório institucional (HTML pronto para imprimir em PDF), relatório cronológico, de pistas e geográfico,
 * anexos selecionados (originais sem alteração ou cópias com dados ocultados), índice e manifesto SHA-256.
 *
 * Os relatórios saem em português: são documentos oficiais entregues a autoridades brasileiras.
 */

const TEXT_MIMES = ['text/plain', 'text/csv'];

/** Itens que podem entrar na exportação, com a sensibilidade de cada um. */
export function exportItemsFor(dossier: Dossier): ExportItem[] {
  const items: ExportItem[] = [
    { id: 'summary', kind: 'summary', label: 'Identificação e resumo do desaparecimento', sensitivity: 'personal' },
    { id: 'timeline', kind: 'timeline', label: 'Linha do tempo', sensitivity: 'normal' },
    { id: 'actions', kind: 'note', label: 'Histórico de providências e preservações', sensitivity: 'normal' },
  ];
  for (const tip of dossier.tips) {
    items.push({ id: `tip:${tip.id}`, kind: 'tip', label: `Pista ${tip.id}`, sensitivity: 'personal' });
    if (tip.hasIdentity) {
      items.push({
        id: `identity:${tip.id}`,
        kind: 'note',
        label: `Identidade de quem enviou a pista ${tip.id}`,
        sensitivity: 'witness_identity',
      });
    }
  }
  if (dossier.movements.length > 0) {
    items.push({ id: 'movements', kind: 'movement', label: 'Registros de deslocamento obtidos legalmente', sensitivity: 'confidential' });
  }
  items.push({ id: 'geo', kind: 'geo', label: 'Relatório geográfico (pontos aproximados)', sensitivity: 'personal' });
  for (const file of dossier.files) {
    items.push({ id: `file:${file.id}`, kind: 'file', label: file.name, sensitivity: file.sensitivity });
  }
  return items;
}

export function isRedactable(item: ExportItem, dossier: Dossier): boolean {
  if (item.kind === 'file') {
    const file = dossier.files.find((entry) => `file:${entry.id}` === item.id);
    return !!file && TEXT_MIMES.includes(file.mime);
  }
  return item.kind === 'summary' || item.kind === 'tip';
}

export type ExportMeta = {
  purpose: string;
  legalBasis: LegalBasis;
  recipient: Recipient;
  generatedBy: string;
  authorizedBy: string;
  generatedAt: Date;
};

export type BuiltPackage = {
  fileName: string;
  zip: Uint8Array;
  manifest: Manifest;
  manifestSha256: string;
  reportHtml: string;
  fileCount: number;
};

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const csvCell = (value: string | number | undefined) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const brDate = (iso: string | undefined) => {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const stamp = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
};

function svgDataUri(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  const base64 =
    typeof btoa === 'function' ? btoa(binary) : '';
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Monta o pacote. `fetchFile` busca os bytes originais; `openIdentity` abre (com registro) a identidade de quem
 * enviou uma pista — só chamado para os itens de identidade marcados.
 */
export async function buildExportPackage(
  dossier: Dossier,
  items: readonly ExportItem[],
  selection: ExportSelection,
  meta: ExportMeta,
  fetchFile: (fileId: string) => Promise<Uint8Array>,
  openIdentity: (tipId: string) => Promise<WitnessIdentity>,
): Promise<BuiltPackage> {
  const chosen = (id: string) => selection[id]?.include === true;
  const redact = (id: string, text: string) => (selection[id]?.redact ? redactPersonalData(text).text : text);
  const files: PackageFile[] = [];
  const generatedAtText = brDate(meta.generatedAt.toISOString());
  const unverifiedNote =
    'Pistas, relatos e correspondências de câmeras são informações NÃO VERIFICADAS, a menos que indicado como fato documentado. Hipóteses da organização automática não são conclusões e não identificam suspeitos.';

  // Anexos selecionados: original intacto, ou cópia controlada com dados ocultados (texto).
  const attachments: { path: string; mime: string; bytes: Uint8Array; label: string }[] = [];
  for (const file of dossier.files) {
    const id = `file:${file.id}`;
    if (!chosen(id)) continue;
    const original = await fetchFile(file.id);
    const originalHash = sha256Hex(original);
    if (selection[id]?.redact && TEXT_MIMES.includes(file.mime)) {
      const text = new TextDecoder().decode(original);
      const copy = utf8Bytes(redactPersonalData(text).text);
      const path = `anexos/copias-controladas/${file.name}`;
      files.push({ path, bytes: copy, origin: file.origin, receivedAt: file.receivedAt, original: false, derivedFromSha256: originalHash });
      attachments.push({ path, mime: file.mime, bytes: copy, label: `${file.name} (cópia com dados ocultados)` });
    } else {
      const path = `anexos/originais/${file.name}`;
      files.push({ path, bytes: original, origin: file.origin, receivedAt: file.receivedAt, original: true });
      attachments.push({ path, mime: file.mime, bytes: original, label: file.name });
    }
  }

  const tips = dossier.tips.filter((tip) => chosen(`tip:${tip.id}`));

  // Relatório cronológico.
  if (chosen('timeline')) {
    const rows = [...dossier.timeline]
      .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
      .map((item) =>
        [csvCell(brDate(item.at)), csvCell(item.title), csvCell(item.detail), csvCell(NATURE_LABEL[item.nature]), csvCell(item.origin)].join(';'),
      );
    files.push({
      path: '02-relatorio-cronologico.csv',
      bytes: utf8Bytes(['"data_hora";"acontecimento";"detalhe";"natureza";"origem"', ...rows].join('\n')),
      origin: 'Gerado na exportação',
      original: false,
    });
  }

  // Relatório de pistas (sem identidade de quem enviou).
  if (tips.length > 0) {
    const rows = tips.map((tip) =>
      [
        csvCell(tip.id),
        csvCell(brDate(tip.receivedAt)),
        csvCell(brDate(tip.happenedAt)),
        csvCell(tip.place),
        csvCell(redact(`tip:${tip.id}`, tip.text)),
        csvCell(TIP_CHANNEL_LABEL[tip.channel]),
        csvCell(TIP_STATUS_LABEL[tip.status]),
        csvCell('Relato não verificado'),
      ].join(';'),
    );
    files.push({
      path: '03-relatorio-pistas.csv',
      bytes: utf8Bytes(
        ['"pista";"recebida_em";"aconteceu_em";"local";"texto";"canal";"situacao";"natureza"', ...rows].join('\n'),
      ),
      origin: 'Gerado na exportação',
      original: false,
    });
  }

  // Relatório geográfico.
  if (chosen('geo')) {
    const features = [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [dossier.longitude, dossier.latitude] },
        properties: { tipo: 'Último local conhecido', natureza: 'Fato documentado', quando: brDate(dossier.lastSeenAt) },
      },
      ...tips
        .filter((tip) => tip.latitude != null && tip.longitude != null)
        .map((tip) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [tip.longitude, tip.latitude] },
          properties: { tipo: `Pista ${tip.id}`, natureza: 'Relato não verificado', quando: brDate(tip.happenedAt) },
        })),
      ...(chosen('movements')
        ? dossier.movements
            .filter((item) => item.latitude != null && item.longitude != null)
            .map((item) => ({
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [item.longitude, item.latitude] },
              properties: { tipo: 'Registro de deslocamento', fonte: item.source, quando: brDate(item.at) },
            }))
        : []),
    ];
    files.push({
      path: '04-relatorio-geografico.geojson',
      bytes: utf8Bytes(JSON.stringify({ type: 'FeatureCollection', features }, null, 1)),
      origin: 'Gerado na exportação',
      original: false,
    });
  }

  // Identidades de testemunhas: arquivo separado, marcado como sigiloso.
  const identityTips = dossier.tips.filter((tip) => chosen(`identity:${tip.id}`));
  if (identityTips.length > 0) {
    const lines = ['IDENTIDADES DE QUEM ENVIOU PISTAS — SIGILOSO', 'Não divulgar. Uso exclusivo da autoridade destinatária.', ''];
    for (const tip of identityTips) {
      const identity = await openIdentity(tip.id);
      lines.push(`Pista ${tip.id}: ${identity.name ?? '(sem nome)'} — contato: ${identity.contact ?? identity.contactPreference}`);
    }
    files.push({ path: 'sigiloso/identidades-testemunhas.txt', bytes: utf8Bytes(lines.join('\n')), origin: 'Cofre de identidades', original: false });
  }

  // Relatório institucional (HTML pronto para imprimir em PDF).
  const section = (title: string, body: string) => `<h2>${escapeHtml(title)}</h2>${body}`;
  const parts: string[] = [];
  if (chosen('summary')) {
    const summaryText = redact(
      'summary',
      `${dossier.person.name}, ${dossier.person.age} anos. ${dossier.person.description} Características: ${dossier.person.characteristics.join('; ')}.`,
    );
    parts.push(
      section(
        'Resumo do desaparecimento',
        `<p>${escapeHtml(summaryText)}</p><p><strong>Último local conhecido:</strong> ${escapeHtml(dossier.lastKnownPlace)}<br><strong>Data e horário:</strong> ${escapeHtml(brDate(dossier.lastSeenAt))}</p>`,
      ),
    );
  }
  if (chosen('timeline')) {
    const rows = [...dossier.timeline]
      .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
      .map(
        (item) =>
          `<tr><td>${escapeHtml(brDate(item.at))}</td><td>${escapeHtml(item.title)}${item.detail ? `<br><small>${escapeHtml(item.detail)}</small>` : ''}</td><td>${escapeHtml(NATURE_LABEL[item.nature])}</td><td>${escapeHtml(item.origin)}</td></tr>`,
      )
      .join('');
    parts.push(section('Linha do tempo', `<table><tr><th>Data e hora</th><th>Acontecimento</th><th>Natureza</th><th>Origem</th></tr>${rows}</table>`));
  }
  if (tips.length > 0) {
    const rows = tips
      .map(
        (tip) =>
          `<tr><td>${escapeHtml(tip.id)}</td><td>${escapeHtml(brDate(tip.happenedAt ?? tip.receivedAt))}</td><td>${escapeHtml(tip.place ?? '—')}</td><td>${escapeHtml(redact(`tip:${tip.id}`, tip.text))}</td><td>${escapeHtml(TIP_STATUS_LABEL[tip.status])}</td></tr>`,
      )
      .join('');
    parts.push(
      section(
        'Pistas e possíveis avistamentos (relatos não verificados)',
        `<table><tr><th>Pista</th><th>Quando</th><th>Local</th><th>Relato</th><th>Situação</th></tr>${rows}</table><p><small>A identidade de quem enviou cada pista não consta deste relatório.</small></p>`,
      ),
    );
  }
  if (chosen('actions')) {
    const actions = dossier.actions.map((item) => `<li>${escapeHtml(brDate(item.at))} — ${escapeHtml(item.text)} (${escapeHtml(item.byName)})</li>`).join('');
    const preservation = dossier.preservation
      .map((item) => `<li>${escapeHtml(item.reference)} — ${escapeHtml(LEGAL_BASIS_LABEL[item.legalBasis])}; escopo: ${escapeHtml(item.scope)}; até ${escapeHtml(brDate(item.until))}</li>`)
      .join('');
    parts.push(section('Providências e preservações', `<ul>${actions}${preservation}</ul>`));
  }
  if (chosen('movements')) {
    const rows = dossier.movements.map((item) => `<li>${escapeHtml(brDate(item.at))} — ${escapeHtml(item.place)} (${escapeHtml(item.source)})</li>`).join('');
    parts.push(section('Registros de deslocamento obtidos legalmente', `<ul>${rows}</ul>`));
  }
  if (attachments.length > 0) {
    const list = attachments
      .map((item) => {
        const preview = item.mime === 'image/svg+xml' ? `<br><img alt="" src="${svgDataUri(item.bytes)}" style="max-width:180px">` : '';
        return `<li>${escapeHtml(item.label)} — <code>${escapeHtml(item.path)}</code>${preview}</li>`;
      })
      .join('');
    parts.push(section('Fotografias e anexos selecionados', `<ul>${list}</ul>`));
  }
  const origins = Array.from(new Set([...dossier.timeline.map((item) => item.origin), ...attachments.map(() => 'Anexo do dossiê')]));
  parts.push(section('Origem dos registros', `<ul>${origins.map((origin) => `<li>${escapeHtml(origin)}</li>`).join('')}</ul>`));
  parts.push(section('Observações sobre informações não verificadas', `<p>${escapeHtml(unverifiedNote)}</p>`));

  const reportHtml = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Dossiê ${escapeHtml(dossier.caseId)} — ${escapeHtml(AppInfo.name)}</title>
<style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:32px;color:black}h1{font-size:22px;margin:0}h2{font-size:17px;margin-top:24px;border-bottom:1px solid gray}table{border-collapse:collapse;width:100%;font-size:13px}td,th{border:1px solid silver;padding:4px;vertical-align:top;text-align:left}small,.muted{color:dimgray}@media print{a{color:black}}</style></head><body>
<p class="muted">${escapeHtml(AppInfo.name)} — ${escapeHtml(AppInfo.companyLine)} · Documento gerado para autoridade competente</p>
<h1>Dossiê do caso ${escapeHtml(dossier.caseId)}</h1>
<p><strong>Gerado em:</strong> ${escapeHtml(generatedAtText)} por ${escapeHtml(meta.generatedBy)}<br>
<strong>Autorizado por:</strong> ${escapeHtml(meta.authorizedBy)}<br>
<strong>Destinatário:</strong> ${escapeHtml(meta.recipient.name)} — ${escapeHtml(meta.recipient.institution)} &lt;${escapeHtml(meta.recipient.email)}&gt;<br>
<strong>Finalidade:</strong> ${escapeHtml(meta.purpose)}<br>
<strong>Fundamento:</strong> ${escapeHtml(LEGAL_BASIS_LABEL[meta.legalBasis])}</p>
${parts.join('\n')}
<p class="muted">${escapeHtml(HASH_NOTICE)}</p>
</body></html>`;
  files.unshift({ path: '01-relatorio-institucional.html', bytes: utf8Bytes(reportHtml), origin: 'Gerado na exportação', original: false });

  const readme = [
    `PACOTE DE EXPORTAÇÃO — ${AppInfo.name}`,
    `Caso: ${dossier.caseId}`,
    `Gerado em: ${generatedAtText}`,
    `Destinatário: ${meta.recipient.name} — ${meta.recipient.institution}`,
    '',
    'Conteúdo:',
    '- 01-relatorio-institucional.html: abra no navegador e use "Imprimir > Salvar como PDF".',
    '- 02/03/04: relatórios cronológico, de pistas e geográfico (quando selecionados).',
    '- anexos/originais: arquivos como foram recebidos (nunca alterados).',
    '- anexos/copias-controladas: cópias com dados pessoais ocultados; o manifesto traz o hash do original.',
    '- sigiloso/: só aparece se a identidade de testemunhas foi autorizada; não divulgar.',
    '- manifesto-integridade.json/.txt: SHA-256 de cada arquivo.',
    '',
    unverifiedNote,
    HASH_NOTICE,
    'Se este pacote veio protegido por senha, a senha deve ter chegado por outro canal.',
  ].join('\n');
  files.unshift({ path: '00-LEIA-ME.txt', bytes: utf8Bytes(readme), origin: 'Gerado na exportação', original: false });

  const index = [
    'ÍNDICE DOS ARQUIVOS',
    ...files.map((file) => `${file.path} — ${file.original ? 'original' : 'gerado/cópia controlada'} — origem: ${file.origin}`),
    'manifesto-integridade.json — manifesto',
    'manifesto-integridade.txt — manifesto (texto)',
  ].join('\n');
  files.push({ path: '05-indice.txt', bytes: utf8Bytes(index), origin: 'Gerado na exportação', original: false });

  const manifest = buildManifest(
    files,
    {
      caseReference: dossier.caseId,
      generatedAt: meta.generatedAt.toISOString(),
      generatedBy: meta.generatedBy,
      authorizedBy: meta.authorizedBy,
      purpose: meta.purpose,
      legalBasis: meta.legalBasis,
      recipient: meta.recipient,
    },
    sha256Hex,
  );
  const manifestJson = utf8Bytes(JSON.stringify(manifest, null, 2));
  const zip = buildZip(
    [
      ...files.map((file) => ({ name: file.path, data: file.bytes })),
      { name: 'manifesto-integridade.json', data: manifestJson },
      { name: 'manifesto-integridade.txt', data: utf8Bytes(manifestText(manifest)) },
    ],
    meta.generatedAt,
  );

  return {
    fileName: `encontrame-${dossier.caseId}-${stamp(meta.generatedAt)}.zip`,
    zip,
    manifest,
    manifestSha256: sha256Hex(manifestJson),
    reportHtml,
    fileCount: files.length + 2,
  };
}

/** Rótulo curto de sensibilidade (já em português, traduzir na tela). */
export const sensitivityLabel = (item: ExportItem) => SENSITIVITY_LABEL[item.sensitivity];
