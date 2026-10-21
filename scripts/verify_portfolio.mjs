import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'tr-portfolio-qa-'));
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('Not found');return;}
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port;
const chrome='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browser=spawn(chrome,['--headless=new','--disable-gpu','--disable-extensions','--no-first-run','--no-default-browser-check','--remote-debugging-port=9226',`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore'});
let ws,id=0;const pending=new Map(),errors=[];
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const check=(yes,message)=>{if(!yes)throw new Error(message);};
const request=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject});ws.send(JSON.stringify({id:key,method,params}));});
async function connect(){
  let pages;
  for(let i=0;i<50;i++){try{pages=await(await fetch('http://127.0.0.1:9226/json')).json();if(pages.some(x=>x.type==='page'))break;}catch{}await sleep(100);}
  const page=pages?.find(x=>x.type==='page');if(!page)throw Error('Chrome CDP indisponível');
  ws=new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
  ws.onmessage=event=>{const message=JSON.parse(event.data);if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);if(!pending.has(message.id))return;const task=pending.get(message.id);pending.delete(message.id);message.error?task.reject(Error(message.error.message)):task.resolve(message.result);};
  await request('Page.enable');await request('Runtime.enable');
}
async function evaluate(expression){const result=await request('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result.value;}
async function viewport(width,height=900){await request('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<700});await sleep(80);}
async function shot(name){const result=await request('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(os.tmpdir(),name),Buffer.from(result.data,'base64'));}
async function waitFor(expression){for(let i=0;i<60;i++){if(await evaluate(expression))return;await sleep(100);}throw Error(`Tempo esgotado: ${expression}`);}
try{
  await connect();await viewport(1440);
  await request('Page.navigate',{url:`http://127.0.0.1:${port}/index.html#projetos`});
  await waitFor("document.querySelectorAll('.portfolio-card').length===12");
  check(await evaluate("document.getElementById('portfolioStats').innerText.includes('12')&&document.getElementById('portfolioStats').innerText.includes('05')"),'Indicadores calculados');
  check(await evaluate("[...document.querySelectorAll('.portfolio-card-actions a')].length===12&&[...document.querySelectorAll('.portfolio-card-actions a')].every(a=>a.target==='_blank'&&a.rel.includes('noopener')&&a.rel.includes('noreferrer'))"),'Links externos');
  await evaluate("document.querySelector('[data-filter=sistemas]').click();document.getElementById('portfolioSearch').value='Godoy';document.getElementById('portfolioSearch').dispatchEvent(new Event('input',{bubbles:true}))");
  check(await evaluate("document.querySelectorAll('.portfolio-card').length===1&&document.querySelector('.portfolio-card h3').textContent.includes('Godoy')"),'Filtro e pesquisa combinados');
  await evaluate("document.getElementById('portfolioClear').click()");
  check(await evaluate("document.querySelectorAll('.portfolio-card').length===12"),'Limpar filtros');
  await evaluate("document.getElementById('portfolioSearch').value='ponto facial';document.getElementById('portfolioSearch').dispatchEvent(new Event('input',{bubbles:true}))");
  check(await evaluate("document.querySelector('.portfolio-card h3')?.textContent.includes('Correia')"),'Busca pela descrição');
  await evaluate("document.getElementById('portfolioSearch').value='inexistente';document.getElementById('portfolioSearch').dispatchEvent(new Event('input',{bubbles:true}))");
  check(await evaluate("document.querySelector('.portfolio-empty h3')?.textContent==='Nenhum projeto encontrado.'"),'Estado vazio');
  await evaluate("document.querySelector('[data-clear]').click();document.querySelector('[data-details=godoy]').click()");
  check(await evaluate("document.getElementById('portfolioDialog').open&&document.activeElement.classList.contains('portfolio-close')&&document.getElementById('portfolioDialogContent').innerText.includes('Acesso restrito')"),'Modal e foco inicial');
  await request('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  await request('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  await sleep(100);
  check(await evaluate("!document.getElementById('portfolioDialog').open&&document.activeElement.dataset.details==='godoy'"),'ESC e restauração do foco');
  await evaluate("document.querySelector('[data-details=godoy]').click()");
  for(let i=0;i<5;i++){
    await request('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
    await request('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
    check(await evaluate("document.getElementById('portfolioDialog').contains(document.activeElement)"),`Foco escapou do modal: ${await evaluate("document.activeElement?.outerHTML.slice(0,200)")}`);
  }
  await evaluate("document.querySelector('.portfolio-close').click()");
  check(await evaluate("!document.getElementById('portfolioDialog').open&&document.activeElement.dataset.details==='godoy'"),'Botão fechar e restauração do foco');
  const assets=JSON.parse(fs.readFileSync(path.join(root,'public/portfolio/relatorio.json'),'utf8')).projects;
  for(const [project,entry] of Object.entries(assets))for(const device of ['desktop','mobile'])if(entry[device].ok){const response=await fetch(`http://127.0.0.1:${port}/public/portfolio/${project}-${device}.webp`);check(response.ok&&response.headers.get('content-type')==='image/webp',`Imagem ${project}-${device}`);}
  for(const width of [320,360,375,390,430,768,1024,1280,1440,1920]){
    await viewport(width,900);
    await evaluate("document.getElementById('projetos').scrollIntoView({block:'start'})");
    const size=await evaluate("({inner:innerWidth,scroll:document.documentElement.scrollWidth,columns:getComputedStyle(document.getElementById('portfolioGrid')).gridTemplateColumns.split(' ').length})");
    check(size.scroll<=size.inner+1,`Rolagem horizontal em ${width}px: ${JSON.stringify(size)}`);
    check(size.columns===(width<690?1:width<980?2:width<1200?3:4),`Colunas em ${width}px: ${JSON.stringify(size)}`);
    if(width===390||width===1440)await shot(`portfolio-${width}-qa.png`);
    if(width===320){
      await evaluate("document.querySelector('.portfolio-card').scrollIntoView({block:'start'})");
      await shot('portfolio-card-320-qa.png');
    }
    if(width===390){
      await evaluate("document.querySelector('.portfolio-card').scrollIntoView({block:'start'})");
      await shot('portfolio-card-390-qa.png');
      await evaluate("document.querySelector('[data-details=correia]').click()");
      await shot('portfolio-modal-390-qa.png');
      await evaluate("document.getElementById('portfolioDialog').close()");
    }
  }
  check(!errors.length,`Erros de JavaScript: ${errors.join(' | ')}`);
  console.log('OK: 12 projetos, filtros + busca, modal/ESC/ciclo de foco, 23 imagens, links e 10 larguras.');
}finally{ws?.close();browser.kill();server.close();await sleep(250);if(profile.startsWith(os.tmpdir()+path.sep)&&path.basename(profile).startsWith('tr-portfolio-qa-'))fs.rmSync(profile,{recursive:true,force:true});}
