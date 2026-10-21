// Execute com `npm run capturar-portfolio`. Requer Chrome e as dependências de desenvolvimento.
// As imagens são capturas da página pública, sem alterar o conteúdo do site fotografado.
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'public', 'portfolio');
const projects = require(path.join(root, 'portfolio-projects.json'));
const devices = [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, isMobile: false, deviceScaleFactor: 1 },
  { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 },
];

async function waitForVisualContent(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const step = Math.max(400, Math.floor(innerHeight * 0.8));
    for (let y = 0; y < Math.min(document.documentElement.scrollHeight, 6000); y += step) {
      scrollTo(0, y);
      await new Promise(resolve => setTimeout(resolve, 90));
    }
    scrollTo(0, 0);
    await Promise.all([...document.images].slice(0, 80).map(img => img.decode().catch(() => {})));
  });
  await page.waitForTimeout(450);
}

async function capture(browser, project, device) {
  const context = await browser.newContext({
    viewport: device.viewport,
    isMobile: device.isMobile,
    hasTouch: !!device.hasTouch,
    deviceScaleFactor: device.deviceScaleFactor,
    reducedMotion: 'reduce',
    locale: 'pt-BR',
    colorScheme: 'light',
    serviceWorkers: 'block',
  });
  const page = await context.newPage();
  try {
    let response;
    let lastError;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        response = await page.goto(project.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        break;
      } catch (error) {
        lastError = error;
        if (attempt < 2) await page.waitForTimeout(1500);
      }
    }
    if (!response) throw lastError || new Error('Sem resposta de navegação');
    if (response.status() >= 400) throw new Error(`HTTP ${response.status()}`);
    await page.waitForLoadState('networkidle', { timeout: 9000 }).catch(() => {});
    await waitForVisualContent(page);
    const facts = await page.evaluate(() => ({
      title: document.title,
      bodyText: document.body?.innerText?.trim().slice(0, 400) || '',
      images: document.images.length,
    }));
    if (!facts.bodyText && !facts.images) throw new Error('Página pública sem conteúdo visível');
    const png = await page.screenshot({ type: 'png', animations: 'disabled', caret: 'hide' });
    const filename = `${project.id}-${device.name}.webp`;
    const target = path.join(output, filename);
    const temp = `${target}.tmp`;
    await sharp(png).webp({ quality: 82, effort: 5 }).toFile(temp);
    const metadata = await sharp(temp).metadata();
    if (metadata.width !== device.viewport.width || metadata.height !== device.viewport.height) {
      throw new Error(`Dimensões inesperadas: ${metadata.width}×${metadata.height}`);
    }
    await fs.rename(temp, target);
    return { ok: true, file: `public/portfolio/${filename}`, bytes: (await fs.stat(target)).size, status: response.status(), finalUrl: page.url(), title: facts.title, bodyText: facts.bodyText };
  } catch (error) {
    return { ok: false, error: String(error?.message || error).slice(0, 500), finalUrl: page.url() };
  } finally {
    await context.close();
  }
}

async function main() {
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const report = { capturedAt: new Date().toISOString(), viewport: { desktop: '1440x900', mobile: '390x844' }, projects: {} };
  try {
    for (const project of projects) {
      report.projects[project.id] = { name: project.name, url: project.url };
      for (const device of devices) {
        const result = await capture(browser, project, device);
        report.projects[project.id][device.name] = result;
        process.stdout.write(`${project.id} ${device.name}: ${result.ok ? 'OK' : result.error}\n`);
      }
    }
  } finally {
    await browser.close();
    await fs.writeFile(path.join(output, 'relatorio.json'), JSON.stringify(report, null, 2) + '\n');
  }
  const failures = Object.values(report.projects).flatMap(project => devices.filter(device => !project[device.name]?.ok));
  process.stdout.write(`Concluído: ${projects.length * devices.length - failures.length}/${projects.length * devices.length} capturas.\n`);
  if (failures.length) process.exitCode = 1;
}

main().catch(error => { console.error(error); process.exitCode = 1; });
