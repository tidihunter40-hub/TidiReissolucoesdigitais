import {spawn} from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve(import.meta.dirname,'..');
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'studio-colors.js'),'utf8'),context);
vm.runInNewContext(fs.readFileSync(path.join(root,'studio-data.js'),'utf8'),context);
const colors=context.window.TR_STUDIO_COLORS,data=context.window.TR_STUDIO_DATA;
const assert=(condition,message)=>{if(!condition)throw Error(message);};
const sample=(a,b,transparent=false)=>{const pixels=new Uint8Array(64*64*4);for(let i=0;i<4096;i++)pixels.set(i%5===0?b:a,i*4);if(transparent)for(let i=0;i<256;i++)pixels[i*4+3]=0;return colors.extract(pixels);};
assert(colors.signature(Uint8Array.from([137,80,78,71,13,10,26,10]))==='image/png','Assinatura PNG');
assert(colors.signature(Uint8Array.from([255,216,255]))==='image/jpeg','Assinatura JPEG');
assert(colors.signature(Uint8Array.from([1,2,3]))===null,'Arquivo inválido');
assert(sample([255,210,0,255],[0,0,0,255]).secondary==='#000000','Amarelo e preto');
assert(sample([225,20,50,255],[255,255,255,255]).secondary==='#ffffff','Vermelho e branco');
assert(sample([20,130,75,255],[255,255,255,255]).secondary==='#ffffff','Verde e branco');
assert(sample([0,0,0,255],[0,0,0,255]).primary==='#000000','Logo monocromática');
assert(sample([255,210,0,255],[0,0,0,255],true).primary==='#ffd200','Transparência');
assert(colors.contrast('#ffd200',colors.onColor('#ffd200'))>=4.5,'Contraste AA');
assert(data.segments.filter(s=>s.active).every(s=>data.templates.filter(t=>t.segment===s.id&&t.active).length===4),'Quatro modelos por segmento ativo');
assert(data.templates.every(t=>data.segments.some(s=>s.id===t.segment)),'Sem modelo órfão');
const rendererSource=fs.readFileSync(path.join(root,'studio-preview.js'),'utf8');
for(const segment of data.segments.filter(s=>s.active)){
  assert(fs.existsSync(path.join(root,'assets','studio',segment.image+'-1.webp')),'Foto de '+segment.id);
}
assert(['split','immersive','editorial','catalog'].every(layout=>fs.readFileSync(path.join(root,'studio-preview.css'),'utf8').includes('.template-'+layout)),'CSS dos quatro modelos');
const previewRoot={style:{values:{},setProperty(key,value){this.values[key]=value;}},querySelector(){return {append(){},set textContent(value){}};},addEventListener(){},innerHTML:'',className:''};
const parent={postMessage(){}},listeners={};
context.document={title:'',getElementById:id=>id==='studioSite'?previewRoot:{addEventListener(){},hidden:true}};
context.location={origin:'http://localhost'};
Object.assign(context.window,{parent,addEventListener:(type,callback)=>{listeners[type]=callback;}});
vm.runInNewContext(rendererSource,context);
const expectedSections={performer:'performer-agenda',dj:'dj-events',producer:'producer-services',podcast:'podcast-player','music-school':'music-courses','radio-broadcast':'broadcast-player','music-teacher':'teacher-lessons',venue:'venue-agenda','event-producer':'event-services','sound-company':'sound-solutions'};
for(const segment of data.segments.filter(s=>s.active)){
  for(const model of data.templates.filter(t=>t.segment===segment.id&&t.active)){
    listeners.message({origin:'http://localhost',source:parent,data:{type:'studio-config',config:{name:'Marca Teste',segment:segment.id,template:model.id,style:'modern',primary:'#f1c500',secondary:'#111111'}}});
    assert(previewRoot.className.includes('segment-'+segment.id)&&previewRoot.className.includes('template-'+model.layout),'Seleção de '+model.id);
    assert(previewRoot.innerHTML.includes(segment.hero)&&previewRoot.innerHTML.includes('Marca Teste'),'Conteúdo de '+model.id);
    if(expectedSections[segment.family])assert(previewRoot.innerHTML.includes(expectedSections[segment.family]),'Estrutura de '+model.id);
    if(segment.category==='Música')assert(!previewRoot.innerHTML.includes('Veículos')&&!previewRoot.innerHTML.includes('Ração para cães'),'Sem misturar negócios em '+model.id);
    assert(previewRoot.style.values['--brand']==='#f1c500'&&previewRoot.style.values['--brand-dark']==='#111111','Tokens de '+model.id);
    assert(colors.contrast(previewRoot.style.values['--dark-accent'],previewRoot.style.values['--brand-dark'])>=4.5,'Destaque AA de '+model.id);
  }
}
listeners.message({origin:'http://localhost',source:parent,data:{type:'studio-config',config:{segment:'missing',template:'band-split'}}});
assert(previewRoot.innerHTML.includes('Escolha um segmento'),'Segmento inválido sem fallback');
if(!process.argv.includes('--browser')){
  console.log('OK: paletas, contraste, catálogo, renderização dos '+data.templates.filter(t=>t.active).length+' modelos, tokens e imagens locais. Use --browser para testar a interface.');
  process.exit(0);
}
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'tr-studio-qa-'));
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg'};
const server=http.createServer((req,res)=>{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+pathname);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('Not found');return;}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.setHeader('X-Frame-Options','SAMEORIGIN');fs.createReadStream(file).pipe(res);});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless=new','--disable-gpu','--disable-extensions','--no-first-run','--remote-debugging-port=9227',`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore'});
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
  await request('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/index.html#tecnologia`});
  await waitFor("document.querySelectorAll('[data-segment]').length===32&&document.querySelectorAll('[data-studio-step]').length===5");
  assert(await evaluate("document.getElementById('studioWelcome').hidden===false&&document.getElementById('studioFrame').hidden"),'Prévia neutra inicial');
  await evaluate("document.querySelector('[data-studio-step=2]').click();document.querySelector('[data-segment=band]').click()");
  await waitFor("document.getElementById('studioFrame').contentDocument?.querySelector('.segment-band .music-agenda')");
  assert(await evaluate("!document.getElementById('studioFrame').contentDocument.body.textContent.includes('Veículos')"),'Sem conteúdo de veículos na banda');
  assert(await evaluate("document.querySelectorAll('[data-template]').length===4"),'Modelos do segmento');
  await evaluate("document.querySelector('[data-studio-step=3]').click();document.querySelector('[data-template=band-immersive]').click()");
  await waitFor("document.getElementById('studioFrame').contentDocument.querySelector('.template-immersive.segment-band')");
  await evaluate("document.getElementById('studioBusinessName').value='Banda Solar';document.getElementById('studioBusinessName').dispatchEvent(new Event('input',{bubbles:true}))");
  await waitFor("document.getElementById('studioFrame').contentDocument.querySelector('.sample-brand strong')?.textContent==='Banda Solar'");
  await evaluate("document.querySelector('[data-studio-step=4]').click();document.getElementById('studioPrimary').value='#f1c500';document.getElementById('studioPrimary').dispatchEvent(new Event('input',{bubbles:true}));document.getElementById('studioSecondary').value='#111111';document.getElementById('studioSecondary').dispatchEvent(new Event('input',{bubbles:true}))");
  assert(await evaluate("document.getElementById('studioFrame').contentDocument.querySelector('.sample-site').style.getPropertyValue('--brand')==='#f1c500'"),'Paleta aplicada');
  await evaluate("document.querySelector('[data-studio-step=2]').click();document.querySelector('[data-segment=radio]').click()");
  await waitFor("document.getElementById('studioFrame').contentDocument.querySelector('.segment-radio .radio-player')");
  assert(await evaluate("document.getElementById('studioFrame').contentDocument.querySelector('.sample-brand strong').textContent==='Banda Solar'"),'Nome preservado');
  assert(await evaluate("document.getElementById('studioFrame').contentDocument.querySelector('.sample-site').style.getPropertyValue('--brand')==='#f1c500'"),'Paleta preservada');
  assert(await evaluate("!document.getElementById('studioFrame').contentDocument.body.textContent.includes('Próximos shows')"),'Sem conteúdo de banda na rádio');
  await evaluate("document.querySelector('[data-segment=feed]').click()");
  await waitFor("document.getElementById('studioFrame').contentDocument.querySelector('.segment-feed .feed-catalog')");
  assert(await evaluate("document.getElementById('studioFrame').contentDocument.body.textContent.includes('Ração para cães')"),'Conteúdo de ração');
  await evaluate("document.querySelector('[data-studio-step=3]').click();document.querySelector('[data-template=feed-catalog]').click()");
  await waitFor("document.getElementById('studioFrame').contentDocument.querySelector('.template-catalog.segment-feed')");
  await evaluate("document.querySelector('[data-studio-step=4]').click();document.getElementById('studioGenerate').click()");
  assert(await evaluate("!document.getElementById('studioResult').hidden"),'Etapa final');
  for(const device of ['tablet','mobile','desktop']){await evaluate(`document.querySelector('[data-studio-device="${device}"]').click()`);assert(await evaluate(`document.getElementById('studioPreviewStage').dataset.device==='${device}'`),'Dispositivo '+device);}
  await viewport(390);await evaluate("document.querySelector('[data-studio-device=mobile]').click()");await sleep(200);
  const size=await evaluate("({scroll:document.documentElement.scrollWidth,inner:innerWidth,frameScroll:document.getElementById('studioFrame').contentDocument.documentElement.scrollWidth,frameInner:document.getElementById('studioFrame').contentWindow.innerWidth})");
  assert(size.scroll<=size.inner+1&&size.frameScroll<=size.frameInner+1,'Sem rolagem horizontal no celular: '+JSON.stringify(size));
  await shot('studio-v2-mobile.png');await viewport(1440);await shot('studio-v2-desktop.png');
  assert(!errors.length,'Erros JS: '+errors.join(' | '));
  console.log('OK: paletas, 32 segmentos, 128 modelos, troca banda/rádio/ração, estado preservado e prévia responsiva.');
}finally{ws?.close();browser.kill();server.close();await sleep(250);if(profile.startsWith(os.tmpdir()+path.sep)&&path.basename(profile).startsWith('tr-studio-qa-'))fs.rmSync(profile,{recursive:true,force:true});}
