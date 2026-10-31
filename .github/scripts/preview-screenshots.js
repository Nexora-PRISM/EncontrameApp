/**
 * Tira prints das telas principais do app web (modo demonstração) num tamanho de celular.
 * Uso (no GitHub Actions): node .github/scripts/preview-screenshots.js <url-base> <pasta-de-saída>
 *
 * Não faz parte do app: serve só para revisar o visual de cada pull request sem instalar nada.
 * Cada passo é opcional — se um botão mudar de nome, o print daquele passo só não sai.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const base = process.argv[2] || 'http://localhost:4173';
const out = process.argv[3] || 'prints';
/** Centro de Belo Horizonte, a região dos dados fictícios. */
const BH = { latitude: -19.9245, longitude: -43.9352 };

fs.mkdirSync(out, { recursive: true });

async function shot(page, name, wait = 900) {
  await page.waitForTimeout(wait);
  await page.screenshot({ path: path.join(out, `${name}.png`) });
  console.log(`print: ${name}`);
}

/** Toca no primeiro botão visível com um dos nomes. */
async function tap(page, names) {
  for (const name of names) {
    const button = page.getByRole('button', { name, exact: true });
    const count = await button.count();
    for (let index = 0; index < count; index += 1) {
      const candidate = button.nth(index);
      if (await candidate.isVisible()) {
        await candidate.click();
        return true;
      }
    }
  }
  return false;
}

async function run(scheme) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 412, height: 892 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    colorScheme: scheme,
    locale: 'pt-BR',
    geolocation: BH,
    permissions: ['geolocation'],
  });
  const page = await context.newPage();
  page.on('pageerror', (error) => console.log(`[${scheme}] erro na página: ${error.message}`));

  try {
    await page.goto(`${base}/inicio`, { waitUntil: 'domcontentloaded' });
    await shot(page, `${scheme}-00-abertura`, 700);
    await page.waitForLoadState('networkidle').catch(() => undefined);
    await shot(page, `${scheme}-01-passo-a-passo`, 2500);

    for (let step = 2; step <= 8; step += 1) {
      if (!(await tap(page, ['Começar o passo a passo', 'Próximo', 'Continuar']))) break;
      await shot(page, `${scheme}-0${step}-passo-a-passo`);
    }

    await tap(page, ['Começar a usar', 'Pular', 'Quero só explorar o mapa']);
    await shot(page, `${scheme}-10-inicio`, 1500);

    if (await tap(page, ['Crianças e adolescentes', 'Crianças'])) {
      await shot(page, `${scheme}-11-filtro-criancas`);
      await tap(page, ['Todos']);
    }

    if (await tap(page, ['Menu'])) {
      await shot(page, `${scheme}-12-menu`);
      await page.keyboard.press('Escape').catch(() => undefined);
      await tap(page, ['Fechar menu']);
    }

    if (await tap(page, ['Pedir ajuda'])) {
      await shot(page, `${scheme}-13-pedir-ajuda`);
    }

    // Novidades: ficha de identificação, chegada segura e B.O. pela internet na Central de Apoio.
    for (const [route, name] of [
      ['/ficha', '23-ficha'],
      ['/ficha/nova', '24-ficha-nova'],
      ['/chegada-segura', '25-chegada-segura'],
      ['/cadastrar-pessoa', '26-cadastro-ponto-no-mapa'],
    ]) {
      await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
      await shot(page, `${scheme}-${name}`, 2000);
    }

    // Nossos apoiadores (empresas fictícias): página completa, seção no Sobre e a grade em tablet e computador.
    await page.goto(`${base}/apoiadores`, { waitUntil: 'domcontentloaded' });
    await shot(page, `${scheme}-20-apoiadores`, 2000);
    await page.goto(`${base}/sobre`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await page.getByText('Conheça nossos apoiadores').first().scrollIntoViewIfNeeded().catch(() => undefined);
    await shot(page, `${scheme}-21-sobre-apoiadores`);
    for (const [width, label] of [
      [820, 'tablet'],
      [1280, 'computador'],
    ]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${base}/apoiadores`, { waitUntil: 'domcontentloaded' });
      await shot(page, `${scheme}-22-apoiadores-${label}`, 2000);
    }
  } catch (error) {
    console.log(`[${scheme}] parou: ${error.message}`);
    await page.screenshot({ path: path.join(out, `${scheme}-99-erro.png`) }).catch(() => undefined);
  } finally {
    await browser.close();
  }
}

(async () => {
  await run('light');
  await run('dark');
})();
