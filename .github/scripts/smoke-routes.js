/**
 * Teste de fumaça das telas da evolução no build web de demonstração (dados fictícios).
 * Abre cada rota, espera um texto esperado e registra erros de JavaScript da página.
 * Resultado em anotações do GitHub: ::error para falhas e um ::notice com o resumo.
 *
 * Uso: node .github/scripts/smoke-routes.js http://localhost:4173
 *
 * Não faz parte do app. Não acessa nenhum serviço externo: tudo roda no modo de demonstração.
 */
const { chromium } = require('playwright');

const base = process.argv[2] || 'http://localhost:4173';
const results = [];

/** Rotas abertas (sem conta). */
const PUBLIC_ROUTES = [
  { path: '/vision', expect: 'Cobertura de câmeras participantes' },
  { path: '/central-de-apoio', expect: 'O que reunir' },
  { path: '/quero-ajudar', expect: 'Antes de ajudar' },
  { path: '/pessoa/p1/linha-do-tempo', expect: 'Linha do tempo' },
  { path: '/pessoa/p2/cartaz', expect: 'QR' },
];

/** Rotas que exigem conta (sessão fictícia do modo de demonstração, gravada antes de abrir a página). */
const PRIVATE_ROUTES = [
  { path: '/vision/minhas-cameras', expect: 'Cadastrar uma câmera' },
  { path: '/vision/minhas-cameras/nova', expect: 'Nome da câmera' },
  { path: '/vision/institucional', expect: 'Pedir habilitação institucional' },
  { path: '/meus-relatos', expect: 'relatos' },
];

/** Central de Inteligência: rotas abertas. */
const CENTRAL_PUBLIC_ROUTES = [
  { path: '/pista-confidencial?caso=p2', expect: 'O que você sabe' },
  { path: '/verificar-integridade', expect: '1. Escolher o manifesto' },
];

/** Leitor mínimo de ZIP (diretório central), só para conferir o pacote exportado. */
function readZip(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const end = bytes.length - 22;
  if (view.getUint32(end, true) !== 0x06054b50) throw new Error('ZIP sem fim de diretório');
  const count = view.getUint16(end + 10, true);
  let offset = view.getUint32(end + 16, true);
  const files = {};
  for (let i = 0; i < count; i += 1) {
    const size = view.getUint32(offset + 24, true);
    const nameLength = view.getUint16(offset + 28, true);
    const local = view.getUint32(offset + 42, true);
    const name = Buffer.from(bytes.subarray(offset + 46, offset + 46 + nameLength)).toString('utf8');
    const localNameLength = view.getUint16(local + 26, true);
    files[name] = bytes.subarray(local + 30 + localNameLength, local + 30 + localNameLength + size);
    offset += 46 + nameLength;
  }
  return files;
}

const clean = (text) => String(text).replace(/%/g, '%25').replace(/\r/g, '').replace(/\n/g, ' ').slice(0, 300);

async function waitForText(page, text, timeout = 12000) {
  try {
    await page.getByText(text, { exact: false }).first().waitFor({ state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

async function tap(page, name) {
  const button = page.getByRole('button', { name, exact: true });
  const count = await button.count();
  for (let index = 0; index < count; index += 1) {
    if (await button.nth(index).isVisible()) {
      await button.nth(index).click();
      return true;
    }
  }
  const radio = page.getByRole('radio', { name, exact: true });
  if ((await radio.count()) > 0) {
    await radio.first().click();
    return true;
  }
  const tab = page.getByRole('tab', { name, exact: true });
  if ((await tab.count()) > 0) {
    await tab.first().click();
    return true;
  }
  const text = page.getByText(name, { exact: true });
  if ((await text.count()) > 0) {
    await text.first().click();
    return true;
  }
  return false;
}

async function check(page, errors, label, route, expect) {
  const before = errors.length;
  if (route) await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
  const ok = await waitForText(page, expect);
  const pageErrors = errors.slice(before);
  let detail = pageErrors.join(' | ');
  if (!ok) {
    // Diagnóstico: endereço final e começo do texto da tela.
    const body = await page.evaluate(() => document.body.innerText).catch(() => '');
    detail = `texto "${expect}" não apareceu em ${page.url()} — tela: ${String(body).slice(0, 160)} ${detail}`;
  }
  results.push({ label, ok: ok && pageErrors.length === 0, detail });
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 412, height: 892 },
    locale: 'pt-BR',
    geolocation: { latitude: -19.9245, longitude: -43.9352 },
    permissions: ['geolocation'],
  });
  // Sessão fictícia do modo de demonstração (o mesmo que o login de teste grava no navegador).
  await context.addInitScript(() => {
    if (!sessionStorage.getItem('smoke-session')) {
      sessionStorage.setItem('smoke-session', '1');
      localStorage.setItem('encontrame.auth.accessToken', 'mock-access-token-login');
      localStorage.setItem('encontrame.auth.refreshToken', 'mock-refresh-token-login');
      localStorage.setItem(
        'encontrame.auth.user',
        JSON.stringify({ id: 'mock-user-1', name: 'Usuário Mock', email: 'demo@encontra.me' }),
      );
    }
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));

  try {
    for (const route of PUBLIC_ROUTES) await check(page, errors, route.path, route.path, route.expect);

    for (const route of PRIVATE_ROUTES) await check(page, errors, route.path, route.path, route.expect);

    // Vision: troca para o perfil de coordenação e percorre a operação de demonstração.
    await page.goto(`${base}/vision/institucional`, { waitUntil: 'domcontentloaded' });
    await waitForText(page, 'Demonstração: ver o Vision como');
    await tap(page, 'Coordenação institucional');
    await check(page, errors, 'vision coordenação', null, 'Operações de busca');
    await check(page, errors, 'vision operação', '/vision/institucional/operacao/OP-TESTE-0001', 'Raio da busca');
    for (const [tab, expect] of [
      ['Câmeras', 'Câmeras participantes no raio'],
      ['Preservação', 'Pedidos de preservação de imagens'],
      ['Correspondências', 'Possíveis correspondências'],
      ['Trajeto', 'Direção geral provável'],
      ['Outras fontes', 'Informações de outras fontes'],
      ['Histórico', 'Auditoria desta operação'],
    ]) {
      await tap(page, tab);
      await check(page, errors, `operação › ${tab}`, null, expect);
    }
    await check(page, errors, 'operação sem evidência', '/vision/institucional/operacao/OP-TESTE-0002', 'Raio da busca');
    await tap(page, 'Trajeto');
    await check(page, errors, 'operação sem evidência › Trajeto', null, 'Evidências insuficientes');
    await check(page, errors, 'vision auditoria', '/vision/institucional/auditoria', 'Tentativas negadas');
    await check(page, errors, 'vision nova operação', '/vision/institucional/nova-operacao', 'Abrir operação');

    // Central de Inteligência: telas abertas, troca de perfil, dossiê e as 8 abas.
    for (const route of CENTRAL_PUBLIC_ROUTES) await check(page, errors, route.path, route.path, route.expect);
    await check(page, errors, 'central (público)', '/institucional', 'Demonstração: ver a Central como');
    await tap(page, 'Administração institucional');
    await check(page, errors, 'central (administração)', null, 'Dossiês');
    await check(page, errors, 'dossiê', '/institucional/dossie/D-TESTE-01', 'Ligações com outros módulos');
    for (const [tab, expect] of [
      ['Cronologia', 'Fato documentado'],
      ['Pistas', 'Organização automática'],
      ['Arquivos', 'SHA-256'],
      ['Preservação', 'Preservação de informações'],
      ['Mobilização', 'Mobilização geográfica'],
      ['Encerramento', 'Protocolo de encerramento'],
      ['Histórico', 'Exportações'],
    ]) {
      await tap(page, tab);
      await check(page, errors, `dossiê › ${tab}`, null, expect);
    }
    await check(page, errors, 'central auditoria', '/institucional/auditoria', 'Corrente íntegra');

    // Exportação de ponta a ponta: pacote criptografado → abrir com a senha → conferir o manifesto SHA-256.
    try {
      page.on('dialog', (dialog) => void dialog.accept());
      await check(page, errors, 'exportar (revisão)', '/institucional/dossie/D-TESTE-01/exportar', '1. O que vai no pacote');
      await page.getByLabel('Finalidade, obrigatório').fill('Instrução do inquérito do caso de demonstração');
      await page.getByText('Escolher', { exact: true }).first().click();
      await page.getByText('Requisição de autoridade competente', { exact: true }).last().click();
      await page.getByLabel('Instituição destinatária, obrigatório').fill('Delegacia fictícia');
      await page.getByLabel('Nome de quem recebe, obrigatório').fill('Delegada fictícia');
      await page.getByLabel('E-mail institucional de quem recebe, obrigatório').fill('delegacia@exemplo.mg.gov.br');
      await page.getByRole('checkbox', { name: 'Destinatário confirmado por canal oficial' }).click();
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 30000 }),
        tap(page, 'Gerar e registrar a exportação'),
      ]);
      const htmlPath = require('path').join(require('os').tmpdir(), 'pacote-protegido.html');
      await download.saveAs(htmlPath);
      await check(page, errors, 'exportar (resultado)', null, 'Pacote gerado e exportação registrada');
      const body = await page.evaluate(() => document.body.innerText);
      const password = (body.match(/[A-Z2-9]{4}(?:-[A-Z2-9]{4}){5}/) || [])[0];
      if (!password) throw new Error('senha do pacote não apareceu');

      const opener = await page.context().newPage();
      await opener.goto(`file://${htmlPath}`);
      await opener.fill('#pw', password);
      const [zipDownload] = await Promise.all([opener.waitForEvent('download', { timeout: 30000 }), opener.click('#go')]);
      const zipBytes = new Uint8Array(require('fs').readFileSync(await zipDownload.path()));
      await opener.close();
      const files = readZip(zipBytes);
      const manifest = JSON.parse(Buffer.from(files['manifesto-integridade.json']).toString('utf8'));
      const crypto = require('crypto');
      const wrong = manifest.files.filter(
        (file) => !files[file.path] || crypto.createHash('sha256').update(files[file.path]).digest('hex') !== file.sha256,
      );
      const hasWitness = Object.keys(files).some((name) => name.startsWith('sigiloso/'));
      const tips = files['03-relatorio-pistas.csv'] ? Buffer.from(files['03-relatorio-pistas.csv']).toString('utf8') : '';
      results.push({
        label: `pacote: ${manifest.files.length} arquivos no manifesto, hashes conferidos`,
        ok: wrong.length === 0 && manifest.files.length > 3 && !hasWitness && !tips.includes('Testemunha'),
        detail: wrong.length ? `hash diferente: ${wrong.map((file) => file.path).join(', ')}` : hasWitness ? 'identidade de testemunha saiu sem autorização' : '',
      });

      // Verificação de integridade pela tela pública, com o manifesto e um arquivo do pacote.
      const tmp = require('os').tmpdir();
      const manifestPath = require('path').join(tmp, 'manifesto-integridade.json');
      const reportPath = require('path').join(tmp, '01-relatorio-institucional.html');
      require('fs').writeFileSync(manifestPath, files['manifesto-integridade.json']);
      require('fs').writeFileSync(reportPath, files['01-relatorio-institucional.html']);
      await check(page, errors, 'verificar (tela)', '/verificar-integridade', '1. Escolher o manifesto');
      const [manifestChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        tap(page, '1. Escolher o manifesto (manifesto-integridade.json)'),
      ]);
      await manifestChooser.setFiles(manifestPath);
      await waitForText(page, 'Manifesto do caso');
      const [fileChooser] = await Promise.all([page.waitForEvent('filechooser'), tap(page, '2. Escolher os arquivos para conferir')]);
      await fileChooser.setFiles(reportPath);
      await check(page, errors, 'verificar (arquivo confere)', null, 'Confere com o manifesto');
    } catch (error) {
      results.push({ label: 'exportação de ponta a ponta', ok: false, detail: error.message });
    }
  } catch (error) {
    results.push({ label: 'execução', ok: false, detail: error.message });
  } finally {
    await browser.close();
  }

  const failed = results.filter((item) => !item.ok);
  for (const item of failed.slice(0, 9)) {
    console.log(`::error title=Fumaça ${clean(item.label)}::${clean(item.detail)}`);
  }
  const passed = results.filter((item) => item.ok).map((item) => item.label);
  console.log(`::notice title=Fumaça::${passed.length}/${results.length} ok: ${clean(passed.join(', '))}`);
  for (const item of results) console.log(`${item.ok ? 'ok  ' : 'FALHA'} ${item.label} ${item.detail ?? ''}`);
  process.exit(failed.length > 0 ? 1 : 0);
})();
