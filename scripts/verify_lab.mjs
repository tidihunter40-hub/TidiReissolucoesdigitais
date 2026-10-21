import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');
const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-lab-qa-'));
const browser = spawn(chrome, ['--headless=new', '--disable-gpu', '--disable-extensions', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=9225', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
let ws, nextId = 0;
const pending = new Map();
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const request = (method, params = {}) => new Promise((resolve, reject) => { const id = ++nextId; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
async function ready() {
  let pages;
  for (let i = 0; i < 50; i++) {
    try { pages = await (await fetch('http://127.0.0.1:9225/json')).json(); if (pages.length) break; } catch {}
    await sleep(100);
  }
  const page = pages?.find(item => item.type === 'page');
  if (!page) throw new Error('Chrome CDP indisponível');
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  ws.onmessage = event => { const data = JSON.parse(event.data); if (!pending.has(data.id)) return; const task = pending.get(data.id); pending.delete(data.id); data.error ? task.reject(new Error(data.error.message)) : task.resolve(data.result); };
  await request('Page.enable');
  await request('Runtime.enable');
}
async function navigate(file, query = '') {
  await request('Page.navigate', { url: pathToFileURL(path.join(root, file)).href + query });
  await sleep(500);
}
async function evaluate(expression) {
  const result = await request('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
}
async function viewport(width, height) { await request('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 700 }); await sleep(150); }
async function shot(file) { const data = await request('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }); fs.writeFileSync(path.join(os.tmpdir(), file), Buffer.from(data.data, 'base64')); }
const check = (truth, message) => { if (!truth) throw new Error(message); };
try {
  await ready();
  await viewport(1440, 900);
  await navigate('index.html');
  await evaluate("document.getElementById('tecnologia').scrollIntoView()");
  await sleep(200);
  await shot('lab-intro-qa.png');
  await evaluate("document.querySelector('[data-group=dashboard]').click()");
  await sleep(250);
  check(await evaluate("document.querySelectorAll('.lab-tile').length") === 3, 'Categorias do showroom');
  await evaluate("document.querySelector('[data-demo=finance]').click()");
  check((await evaluate("document.getElementById('labFrame').src")).includes('finance'), 'Prévia financeira');
  await evaluate("document.querySelector('[data-lab-device=mobile]').click();document.getElementById('labFullscreen').click()");
  check(await evaluate("document.getElementById('labDialog').open && document.getElementById('labFrameStage').dataset.device === 'mobile'"), 'Tela cheia e tamanho mobile');
  check(await evaluate("Math.round(document.getElementById('labFrame').getBoundingClientRect().width) === 390"), 'Largura real mobile');
  await evaluate("document.getElementById('labDialog').close();document.getElementById('labReset').click()");
  await evaluate("document.querySelector('[data-lab-device=tablet]').click()");
  check(await evaluate("Math.round(document.getElementById('labFrame').getBoundingClientRect().width) === 768"), 'Largura real tablet');
  await evaluate("document.querySelector('[data-lab-device=desktop]').click()");
  check(await evaluate("document.getElementById('labFrame').getBoundingClientRect().width >= 1200"), 'Largura real desktop');
  await shot('lab-shell-qa.png');
  const cases = [
    ['business',"document.querySelector('[data-action=page][data-value=Serviços]').click();document.querySelector('h1').textContent.includes('Soluções')"],
    ['store',"document.querySelector('[data-action=store-add]').click();document.querySelector('.bag').textContent.includes('(1)')"],
    ['repair',"document.querySelector('form').requestSubmit();document.querySelector('.demo-status')?.textContent.includes('Resumo')"],
    ['music',"document.querySelector('[data-action=music-schedule]').click();!!document.querySelector('.demo-status')"],
    ['clinic',"document.querySelector('[name=date]').value='2026-12-01';document.querySelector('form').requestSubmit();!!document.querySelector('.demo-status')"],
    ['estate',"document.querySelector('[data-field=estate-price]').value='350000';document.querySelector('[data-field=estate-price]').dispatchEvent(new Event('change',{bubbles:true}));document.querySelectorAll('.estate-grid article').length===1"],
    ['finance',"document.querySelector('[data-action=finance-open]').click();let f=document.querySelector('[data-form=finance]');f.querySelector('[name=name]').value='Teste';f.querySelector('[name=value]').value='100';f.requestSubmit();document.querySelector('.dash-list').textContent.includes('Teste')"],
    ['sales',"let s=document.querySelector('[data-field=order-status]');s.value='Concluído';s.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('.dash-list').textContent.includes('Concluído')"],
    ['management',"document.querySelector('[data-action=record-detail]').click();!!document.querySelector('.demo-panel')"],
    ['studio',"let s=document.querySelector('[data-field=studio-style]');s.value='luxury';s.dispatchEvent(new Event('change',{bubbles:true}));!!document.querySelector('.studio-luxury')"],
    ['delivery',"document.querySelector('[data-action=delivery-add]').click();document.querySelector('[data-action=app-tab][data-value=Carrinho]').click();document.querySelector('.phone-total').textContent.includes('32')"],
    ['transport',"document.querySelector('[data-action=ride-request]').click();document.querySelector('.ride-progress')?.textContent.includes('Corrida')"],
    ['brand',"document.querySelector('[data-action=brand-turn]').click();document.querySelector('.brand-orbit').style.getPropertyValue('--angle').includes('deg')"]
  ];
  for (const [id, expression] of cases) { await navigate('lab-experience.html', `?demo=${id}`); check(await evaluate(expression), `Interação: ${id}`); }
  for (const width of [1920,1440,1024,768,390,360]) {
    await viewport(width, 844);
    await navigate('index.html');
    let measures = await evaluate("({inner:innerWidth,scroll:document.documentElement.scrollWidth})");
    check(measures.scroll <= measures.inner + 1, `Rolagem horizontal no site em ${width}px: ${JSON.stringify(measures)}`);
    for (const [id] of cases) {
      await navigate('lab-experience.html', `?demo=${id}`);
      measures = await evaluate("({inner:innerWidth,scroll:document.documentElement.scrollWidth})");
      check(measures.scroll <= measures.inner + 1, `Rolagem horizontal em ${id}, ${width}px: ${JSON.stringify(measures)}`);
    }
  }
  await viewport(390,844); await navigate('lab-experience.html','?demo=delivery'); await shot('lab-mobile-qa.png');
  console.log('OK: showroom, tela cheia, 13 interações e 78 combinações de demonstração/viewport.');
} finally {
  ws?.close(); browser.kill();
  await sleep(250);
  if (profile.startsWith(os.tmpdir() + path.sep) && path.basename(profile).startsWith('tr-lab-qa-')) fs.rmSync(profile,{recursive:true,force:true});
}
