import {spawn} from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve(import.meta.dirname,'..');
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'studio-colors.js'),'utf8'),context);
const colors=context.window.TR_STUDIO_COLORS;
const assert=(yes,message)=>{if(!yes)throw Error(message);};
assert(colors.signature(Uint8Array.from([137,80,78,71,13,10,26,10]))==='image/png','Assinatura PNG');
assert(colors.signature(Uint8Array.from([255,216,255]))==='image/jpeg','Assinatura JPEG');
assert(colors.signature(Uint8Array.from([1,2,3]))===null,'Arquivo inválido');
assert(colors.extract(Uint8Array.from([255,0,0,0,0,0,255,0,0,255,0,0,0,0,0,0])).primary===colors.FALLBACK.primary,'Transparência');
assert(colors.contrast('#000000','#ffffff')>=21,'Contraste');
const sample=new Uint8Array(64*4);for(let i=0;i<64;i++){sample[i*4]=220;sample[i*4+1]=35;sample[i*4+2]=55;sample[i*4+3]=255;}
assert(colors.extract(sample).primary!==colors.FALLBACK.primary,'Extração de cor');
const grey=new Uint8Array(64*4);for(let i=0;i<64;i++){grey[i*4]=120;grey[i*4+1]=120;grey[i*4+2]=120;grey[i*4+3]=255;}
assert(colors.extract(grey).primary===colors.FALLBACK.primary,'Logo monocromática');
assert(colors.contrast('#161616',colors.onColor('#161616'))>=4.5,'Cor do texto sobre fundo escuro');

const profile=fs.mkdtempSync(path.join(os.tmpdir(),'tr-studio-qa-'));
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+pathname);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('Not found');return;}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.setHeader('X-Frame-Options','SAMEORIGIN');fs.createReadStream(file).pipe(res);});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port;
const browser=spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless=new','--disable-gpu','--disable-extensions','--no-first-run','--no-default-browser-check','--remote-debugging-port=9227',`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore'});
let ws,id=0;const pending=new Map(),errors=[];
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const request=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject});ws.send(JSON.stringify({id:key,method,params}));});
async function connect(){let pages;for(let i=0;i<50;i++){try{pages=await(await fetch('http://127.0.0.1:9227/json')).json();if(pages.some(x=>x.type==='page'))break;}catch{}await sleep(100);}const page=pages?.find(x=>x.type==='page');if(!page)throw Error('Chrome CDP indisponível');ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});ws.onmessage=event=>{const message=JSON.parse(event.data);if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);if(!pending.has(message.id))return;const task=pending.get(message.id);pending.delete(message.id);message.error?task.reject(Error(message.error.message)):task.resolve(message.result);};await request('Page.enable');await request('Runtime.enable');}
async function evaluate(expression){const result=await request('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result.value;}
async function waitFor(expression){for(let i=0;i<100;i++){if(await evaluate(expression))return;await sleep(100);}throw Error(`Tempo esgotado: ${expression}`);}
async function viewport(width,height=900){await request('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<700});await sleep(80);}
async function shot(name){const result=await request('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(os.tmpdir(),name),Buffer.from(result.data,'base64'));}
try{
  await connect();await viewport(1440);
  await request('Page.navigate',{url:`http://127.0.0.1:${port}/index.html#tecnologia`});
  await waitFor("document.querySelectorAll('[data-segment]').length===10&&document.querySelectorAll('[data-style]').length===4");
  assert(await evaluate("!document.getElementById('studioWelcome').hidden&&document.getElementById('studioResult').hidden"),'Estado inicial');
  await evaluate("document.getElementById('studioTryDemo').click()");
  await waitFor("document.getElementById('studioFrame').contentDocument?.querySelector('.sample-site')?.textContent.includes('Móveis Oliveira')");
  assert(await evaluate("document.getElementById('studioFrame').contentDocument.querySelector('.sample-site').classList.contains('style-luxury')"),'Empresa fictícia');
  assert(await evaluate("!decodeURIComponent(document.getElementById('studioWhatsApp').href).includes('Empresa: Móveis Oliveira')"),'Nome fictício fora da mensagem comercial');
  const unique={furniture:'.furniture-categories',fashion:'.fashion-ribbon',restaurant:'.restaurant-menu',barbershop:'.barber-services',beauty:'.beauty-intro',automotive:'.auto-inventory',clinic:'.clinic-welcome',technology:'.tech-solutions',fitness:'.fitness-programs',services:'.services-offer'};
  const combos=await evaluate(`(async()=>{const checks=[];const unique=${JSON.stringify(unique)};for(const [segment,selector] of Object.entries(unique)){document.querySelector('[data-segment="'+segment+'"]').click();for(const style of ['modern','luxury','minimal','tech']){document.querySelector('[data-style="'+style+'"]').click();await new Promise(r=>setTimeout(r,25));const root=document.getElementById('studioFrame').contentDocument.querySelector('.sample-site');checks.push(root.classList.contains('segment-'+segment)&&root.classList.contains('style-'+style)&&!!root.querySelector(selector)&&root.querySelectorAll('section').length>=5);}}return checks;})()`);
  assert(combos.length===40&&combos.every(Boolean),'40 combinações e estruturas específicas');
  await evaluate("document.querySelector('[data-segment=restaurant]').click();document.querySelector('[data-style=modern]').click();document.getElementById('studioPreviewStage').scrollIntoView({block:'start'})");await sleep(70);await shot('studio-restaurant-qa.png');
  await evaluate("document.querySelector('[data-segment=technology]').click();document.querySelector('[data-style=tech]').click()");await sleep(70);await shot('studio-technology-qa.png');
  await evaluate("document.querySelector('[data-segment=furniture]').click();document.querySelector('[data-style=luxury]').click();document.getElementById('studioBusinessName').value='Móveis Oliveira';document.getElementById('studioBusinessName').dispatchEvent(new Event('input',{bubbles:true}));document.getElementById('studioPrimary').value='#734152';document.getElementById('studioPrimary').dispatchEvent(new Event('input',{bubbles:true}))");
  await waitFor("document.getElementById('studioFrame').contentDocument.querySelector('.sample-brand strong')?.textContent==='Móveis Oliveira'");
  assert(await evaluate("document.getElementById('studioFrame').contentDocument.querySelector('.sample-site').style.getPropertyValue('--brand')==='#734152'"),'Nome e cor em tempo real');
  assert(await evaluate("decodeURIComponent(document.getElementById('studioWhatsApp').href).includes('Móveis Oliveira')&&document.getElementById('studioWhatsApp').href.includes('wa.me/5571992417737')"),'WhatsApp configurado');
  await evaluate("document.getElementById('studioWorkspace').scrollIntoView({block:'start'})");await shot('studio-generated-1440-qa.png');
  for(const device of ['tablet','mobile','desktop']){await evaluate(`document.querySelector('[data-studio-device=${device}]').click()`);await sleep(50);assert(await evaluate(`document.getElementById('studioPreviewStage').dataset.device==='${device}'`),`Dispositivo ${device}`);const size=await evaluate("({scroll:document.getElementById('studioFrame').contentDocument.documentElement.scrollWidth,inner:document.getElementById('studioFrame').contentWindow.innerWidth})");assert(size.scroll<=size.inner+1,`Rolagem interna ${device}: ${JSON.stringify(size)}`);}
  await viewport(390);await evaluate("document.querySelector('[data-studio-device=mobile]').click();document.getElementById('studioPreviewStage').scrollIntoView({block:'start'})");await sleep(80);const mobileSize=await evaluate("({scroll:document.getElementById('studioFrame').contentDocument.documentElement.scrollWidth,inner:document.getElementById('studioFrame').contentWindow.innerWidth})");assert(mobileSize.scroll<=mobileSize.inner+1,`Rolagem da prévia no celular: ${JSON.stringify(mobileSize)}`);await shot('studio-generated-390-qa.png');await viewport(1440);
  await evaluate("document.getElementById('studioFrame').contentDocument.querySelector('[data-demo-action]').click()");
  assert(await evaluate("!document.getElementById('studioFrame').contentDocument.getElementById('demoToast').hidden"),'Ação demonstrativa');
  await evaluate("document.getElementById('studioResetPreview').click()");
  await evaluate("document.getElementById('studioExpand').click()");assert(await evaluate("document.getElementById('studioDialog').open"),'Ampliar');await evaluate("document.getElementById('studioDialogClose').click()");assert(await evaluate("!document.getElementById('studioDialog').open"),'Fechar ampliação');
  await evaluate("document.querySelector('[data-studio-step=\"1\"]').click();document.getElementById('studioAnotherStyle').click()");
  assert(await evaluate("!document.querySelector('.studio-step[data-step=\"3\"]').hidden"),'Testar outro estilo');
  const upload=async(file,name,type)=>evaluate(`(async()=>{const blob=await fetch('${file}').then(r=>r.blob());const dt=new DataTransfer();dt.items.add(new File([blob],'${name}',{type:'${type}'}));const input=document.getElementById('studioLogo');input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));})()`);
  for(const [file,name,type] of [['assets/logo-symbol-transparent.png','marca.png','image/png'],['assets/og-image.jpg','marca.jpg','image/jpeg'],['assets/studio/furniture-1.webp','marca.webp','image/webp']]){
    await upload(file,name,type);await waitFor("!document.getElementById('studioLogoSelected').hidden");assert(await evaluate("document.getElementById('studioLogoThumb').naturalWidth>0"),`Upload ${type}`);await waitFor("document.getElementById('studioFrame').contentDocument.querySelector('.client-logo img')?.naturalWidth>0");assert(await evaluate("getComputedStyle(document.getElementById('studioFrame').contentDocument.querySelector('.client-logo img')).objectFit==='contain'"),`Proporção ${type}`);await evaluate("document.getElementById('studioRemove').click()");assert(await evaluate("document.getElementById('studioLogoSelected').hidden"),`Remover ${type}`);
  }
  await evaluate("(()=>{const dt=new DataTransfer();dt.items.add(new File(['invalid'],'bad.png',{type:'image/png'}));const input=document.getElementById('studioLogo');input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));})()");await waitFor("!document.getElementById('studioError').hidden");
  assert(await evaluate("document.getElementById('studioError').textContent.includes('válida')"),'Arquivo inválido');
  await evaluate("(()=>{const dt=new DataTransfer();dt.items.add(new File([new Uint8Array(5*1024*1024+1)],'huge.png',{type:'image/png'}));const input=document.getElementById('studioLogo');input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));})()");await waitFor("document.getElementById('studioError').textContent.includes('5 MB')");
  await evaluate("document.getElementById('studioNew').click()");assert(await evaluate("!document.getElementById('studioWelcome').hidden&&document.getElementById('studioResult').hidden"),'Nova simulação');
  await evaluate("document.getElementById('studioStart').click()");assert(await evaluate("document.activeElement.id==='studioDrop'"),'Início e foco no upload');
  await evaluate("document.getElementById('studioNext').click()");assert(await evaluate("!document.querySelector('.studio-step[data-step=\"2\"]').hidden"),'Avançar etapa');
  await evaluate("document.getElementById('studioBack').click()");assert(await evaluate("!document.querySelector('.studio-step[data-step=\"1\"]').hidden"),'Voltar etapa');
  await evaluate("document.querySelector('[data-studio-step=\"3\"]').click();document.getElementById('studioPrimary').value='#bb3344';document.getElementById('studioPrimary').dispatchEvent(new Event('input',{bubbles:true}));document.getElementById('studioAutoColors').click()");
  assert(await evaluate("document.getElementById('studioPrimary').value==='#173a63'"),'Restaurar cores automáticas');
  await evaluate("document.getElementById('studioSurprise').click()");await waitFor("!document.getElementById('studioResult').hidden");
  assert(await evaluate("document.getElementById('studioFrame').contentDocument.querySelector('.sample-site')!==null"),'Surpreenda-me');
  await evaluate("document.getElementById('studioNew').click()");
  for(const width of [320,390,768,1024,1440,1920]){await viewport(width);await evaluate("document.getElementById('tidireisStudio').scrollIntoView({block:'start'})");const metrics=await evaluate("({scroll:document.documentElement.scrollWidth,inner:innerWidth})");assert(metrics.scroll<=metrics.inner+1,`Rolagem horizontal ${width}: ${JSON.stringify(metrics)}`);if(width===390||width===1440)await shot(`studio-${width}-qa.png`);}
  const images=fs.readdirSync(path.join(root,'assets/studio')).filter(x=>x.endsWith('.webp'));assert(images.length===20,'20 fotos locais');
  assert(!errors.length,`Erros JS: ${errors.join(' | ')}`);
  console.log('OK: upload PNG/JPG/WebP e erros, paleta, 40 combinações, nome/cores, WhatsApp, prévia, modal e 6 larguras.');
}finally{ws?.close();browser.kill();server.close();await sleep(250);if(profile.startsWith(os.tmpdir()+path.sep)&&path.basename(profile).startsWith('tr-studio-qa-'))fs.rmSync(profile,{recursive:true,force:true});}
