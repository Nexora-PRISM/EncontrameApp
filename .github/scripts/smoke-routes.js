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
  { path: '/pessoa/p1/cartaz', expect: 'QR' },
];

/** Rotas que exigem conta (sessão fictícia do modo de demonstração, gravada antes de abrir a página). */
const PRIVATE_ROUTES = [
  { path: '/vision/minhas-cameras', expect: 'Cadastrar uma câmera' },
  { path: '/vision/minhas-cameras/nova', expect: 'Nome da câmera' },
  { path: '/vision/institucional', expect: 'Pedir habilitação institucional' },
  { path: '/meus-relatos', expect: 'relatos' },
];

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
  } catch (error) {
    results.push({ label: 'execução', ok: false, detail: error.message });
  } finally {
    await browser.close();
  }

  const failed = results.filter((item) => !item.ok);
  for (const item of failed.slice(0, 10)) {
    console.log(`::error title=Fumaça ${clean(item.label)}::${clean(item.detail)}`);
  }
  const passed = results.filter((item) => item.ok).map((item) => item.label);
  console.log(`::notice title=Fumaça::${passed.length}/${results.length} ok: ${clean(passed.join(', '))}`);
  for (const item of results) console.log(`${item.ok ? 'ok  ' : 'FALHA'} ${item.label} ${item.detail ?? ''}`);
  process.exit(failed.length > 0 ? 1 : 0);
})();
