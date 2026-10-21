(() => {
  'use strict';
  const data=window.TR_STUDIO_DATA,colors=window.TR_STUDIO_COLORS,$=id=>document.getElementById(id);
  const host=$('tidireisStudio');if(!host||!data||!colors)return;
  const frame=$('studioFrame'),stage=$('studioPreviewStage'),welcome=$('studioWelcome'),result=$('studioResult'),status=$('studioStatus'),dialog=$('studioDialog');
  const state={step:1,name:'',nameProvided:false,segment:null,template:null,style:'modern',logoUrl:null,
    auto:{...colors.FALLBACK},primary:colors.FALLBACK.primary,secondary:colors.FALLBACK.secondary,
    mode:'auto',device:'desktop',deviceChosen:false,ready:false,previewing:false,category:'Todos',query:''};
  let uploadSerial=0;
  const safe=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const segment=()=>data.segments.find(x=>x.id===state.segment);
  const template=()=>data.templates.find(x=>x.id===state.template);
  const templates=()=>data.templates.filter(x=>x.segment===state.segment&&x.active);
  const logoInput=$('studioLogo'),error=$('studioError');
  let templateSignature='';
  function showError(message){error.textContent=message;error.hidden=!message;}
  function buildUI(){
    const progress=$('studioProgress');
    progress.innerHTML=['Marca','Negócio','Modelo','Personalize','Seu site'].map((label,i)=>`<button type="button" data-studio-step="${i+1}">0${i+1} <span>${label}</span></button>`).join('');
    const business=host.querySelector('.studio-step[data-step="2"]');
    business.querySelector('p').textContent='Pesquise e selecione o tipo de negócio. A prévia mostrará apenas conteúdo desse segmento.';
    business.insertAdjacentHTML('beforeend','<label class="studio-field studio-search" for="studioSearch">QUAL É O SEU TIPO DE NEGÓCIO?<input id="studioSearch" type="search" placeholder="Pesquise por banda, rádio, loja de ração, móveis..."></label><div class="studio-categories" id="studioCategories" role="group" aria-label="Categorias"></div><p class="studio-search-count" id="studioSearchCount"></p><p class="studio-error" id="studioBusinessError" role="alert" hidden></p>');
    business.append($('studioSegments'));
    const model=document.createElement('div');model.className='studio-step';model.dataset.step='3';model.hidden=true;
    model.innerHTML='<h3>Experimente sua marca em outros modelos.</h3><p>Quatro composições reais para o seu negócio. As miniaturas já usam as cores da sua marca.</p><div class="studio-templates" id="studioTemplates" role="group" aria-label="Modelos disponíveis"></div>';
    business.after(model);
    // The original third step contains the style and colour controls.
    const original=[...host.querySelectorAll('.studio-step')].find(x=>x!==model&&x.querySelector('#studioStyles'));
    original.dataset.step='4';original.querySelector('h3').textContent='Dê o acabamento final.';
    original.querySelector('p').textContent='O estilo altera tipografia e acabamento. A composição continua sendo a do modelo escolhido.';
    original.querySelector('.studio-color-head').innerHTML='<strong>Cores da sua marca</strong><span class="studio-color-mode"><button type="button" id="studioAutoColors" aria-pressed="true">USAR CORES DA MINHA LOGO</button><button type="button" id="studioManualColors" aria-pressed="false">PERSONALIZAR MANUALMENTE</button></span>';
    original.querySelector('.studio-colors').innerHTML='<label>Cor principal<input id="studioPrimary" type="color"></label><label>Cor secundária<input id="studioSecondary" type="color"></label>';
    const finish=document.createElement('div');finish.className='studio-step';finish.dataset.step='5';finish.hidden=true;
    finish.innerHTML='<h3>Seu site ganhou a sua identidade.</h3><p>Explore a prévia, troque de dispositivo ou volte para testar outro modelo. Todas as ações são demonstrativas.</p><button type="button" class="studio-finish-models" id="studioOtherModels">EXPERIMENTE SUA MARCA EM OUTROS MODELOS →</button>';
    original.after(finish);
    host.querySelector('.studio-heading-art p').textContent=`${data.segments.filter(s=>s.active).length} segmentos · ${data.templates.filter(t=>t.active).length} modelos · sua identidade`;
    $('studioAutoColors').addEventListener('click',()=>setColorMode('auto'));
    $('studioManualColors').addEventListener('click',()=>setColorMode('manual'));
    $('studioPrimary').addEventListener('input',event=>{state.primary=event.target.value;state.mode='manual';update();});
    $('studioSecondary').addEventListener('input',event=>{state.secondary=event.target.value;state.mode='manual';update();});
    $('studioOtherModels').addEventListener('click',()=>step(3));
    $('studioSearch').addEventListener('input',event=>{state.query=event.target.value;if(state.query.trim())state.category='Todos';renderSegments();});
  }
  function setColorMode(mode){state.mode=mode;if(mode==='auto'){state.primary=state.auto.primary;state.secondary=state.auto.secondary;}update();}
  function visibleSegments(){
    const q=state.query.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    return data.segments.filter(s=>s.active&&(state.category==='Todos'||s.category===state.category)&&s.name.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(q));
  }
  function showBusinessError(message){const businessError=$('studioBusinessError');businessError.textContent=message;businessError.hidden=!message;}
  function renderSegments(){
    const filtered=visibleSegments();
    showBusinessError('');
    $('studioCategories').innerHTML=data.categories.map(c=>`<button type="button" data-category="${safe(c)}" aria-pressed="${state.category===c}">${safe(c)}</button>`).join('');
    $('studioSegments').innerHTML=filtered.map(s=>`<button type="button" data-segment="${s.id}" aria-pressed="${s.id===state.segment}"><span aria-hidden="true">${s.icon}</span><strong>${safe(s.name)}</strong><small>${safe(s.hint)}</small></button>`).join('');
    $('studioSearchCount').textContent=filtered.length?`${filtered.length} ${filtered.length===1?'segmento disponível':'segmentos disponíveis'}`:'Nenhum segmento disponível para esta busca.';
  }
  function renderTemplates(){
    const signature=[state.segment,state.primary,state.secondary].join('|');
    if(signature===templateSignature)return;
    templateSignature=signature;
    $('studioTemplates').innerHTML=templates().map(t=>`<button type="button" class="studio-template-card layout-${t.layout}" data-template="${t.id}" aria-pressed="${t.id===state.template}" style="--tile-primary:${state.primary};--tile-secondary:${state.secondary};--tile-on:${colors.onColor(state.primary)}"><span class="studio-template-art"><img src="${t.thumbnail}" alt="" loading="lazy"><i></i><b></b><em></em></span><strong>${safe(t.name)}</strong><small>${safe(t.description)}</small></button>`).join('');
  }
  function renderControls(){
    host.querySelectorAll('.studio-step').forEach(x=>x.hidden=Number(x.dataset.step)!==state.step);
    host.querySelectorAll('[data-studio-step]').forEach(x=>x.setAttribute('aria-current',Number(x.dataset.studioStep)===state.step?'step':'false'));
    $('studioBack').hidden=state.step===1;
    $('studioNext').hidden=state.step>=4;
    $('studioGenerate').hidden=state.step!==4;
    $('studioGenerate').textContent='VER MEU SITE →';
    host.querySelector('.studio-panel-head small').textContent=`0${state.step} / ${['SUA MARCA','SEU NEGÓCIO','ESCOLHA SEU MODELO','PERSONALIZE','VEJA SEU SITE'][state.step-1]}`;
    host.querySelectorAll('[data-segment]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.segment===state.segment)));
    host.querySelectorAll('[data-template]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.template===state.template)));
    host.querySelectorAll('[data-style]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.style===state.style)));
    host.querySelectorAll('[data-studio-device]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.studioDevice===state.device)));
    $('studioAutoColors').setAttribute('aria-pressed',String(state.mode==='auto'));
    $('studioManualColors').setAttribute('aria-pressed',String(state.mode==='manual'));
    $('studioPrimary').value=state.primary;$('studioSecondary').value=state.secondary;
    stage.dataset.device=state.device;
    const slug=(state.name||segment()?.sample||'suaempresa').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'').slice(0,24)||'suaempresa';
    $('studioAddress').textContent=slug+'.demo.local';
    welcome.style.setProperty('--welcome-primary',state.primary);
    welcome.style.setProperty('--welcome-secondary',state.secondary);
    welcome.querySelector('h3').textContent='Seu próximo site começa aqui.';
  }
  function step(number){
    const target=Math.max(1,Math.min(5,number));
    if(target>2&&(!state.segment||(state.step===2&&!visibleSegments().some(x=>x.id===state.segment)))){
      const choices=state.step===2?visibleSegments():[];
      if(choices.length===1)selectSegment(choices[0].id);
      else{
        state.step=2;
        showBusinessError(choices.length?'Selecione um tipo de negócio para continuar.':'Nenhum negócio encontrado. Tente outra busca ou categoria.');
        status.textContent='Escolha primeiro o seu tipo de negócio.';
        renderControls();
        $('studioSegments').querySelector('button')?.focus();
        return;
      }
    }
    state.step=target;
    renderControls();
    result.hidden=state.step!==5;
    if(state.step===5)updateContact();
  }
  function config(){return {name:(state.name||segment()?.sample||'Sua empresa').trim(),segment:state.segment,template:state.template,style:state.style,logoUrl:state.logoUrl,primary:state.primary,secondary:state.secondary};}
  function send(){if(state.previewing&&state.ready)frame.contentWindow.postMessage({type:'studio-config',config:config()},location.origin);}
  function startPreview(){
    if(!state.segment)return;
    if(!state.deviceChosen&&matchMedia('(max-width:690px)').matches){state.device='mobile';renderControls();}
    state.previewing=true;welcome.hidden=true;frame.hidden=false;
    if(!frame.getAttribute('src')){stage.dataset.loading='true';frame.src='studio-preview.html';}
    else send();
  }
  function update(){renderControls();renderTemplates();send();if(state.step===5)updateContact();}
  function selectSegment(id){
    const chosen=data.segments.find(x=>x.id===id&&x.active);
    if(!chosen)return;
    showBusinessError('');
    state.segment=id;state.template=data.templates.find(x=>x.segment===id&&x.active)?.id||null;
    if(!state.nameProvided){state.name=chosen.sample;$('studioBusinessName').value=state.name;}
    update();startPreview();status.textContent='Prévia atualizada para '+segment().name+'.';
  }
  function setDevice(device){state.device=device;state.deviceChosen=true;renderControls();}
  function updateContact(){
    const number=document.querySelector('a[data-wa="proposta"]')?.href.match(/wa\.me\/(\d+)/)?.[1];
    const link=$('studioWhatsApp');if(!number){link.href='#orcamento';link.removeAttribute('target');return;}
    const lines=['Olá! Fiz uma simulação no TidiReis Studio e gostaria de conversar sobre a criação do meu site.'];
    if(state.nameProvided&&state.name.trim())lines.push('Empresa: '+state.name.trim());
    lines.push('Segmento: '+segment().name,'Modelo: '+template().name,'Estilo: '+data.styles.find(x=>x.id===state.style).name);
    if(state.logoUrl||state.mode==='manual')lines.push('Cores: '+state.primary+' e '+state.secondary);
    lines.push('Gostaria de receber mais informações e um orçamento.');
    link.href='https://wa.me/'+number+'?text='+encodeURIComponent(lines.join('\n\n'));link.target='_blank';
  }
  async function decodeLogo(file){
    if(typeof createImageBitmap==='function')try{return await createImageBitmap(file);}catch{}
    const url=URL.createObjectURL(file);
    try{return await new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('Imagem inválida'));image.src=url;});}
    finally{URL.revokeObjectURL(url);}
  }
  async function handleFile(file){
    showError('');if(!file)return;const serial=++uploadSerial;
    if(file.size>5*1024*1024){showError('A imagem deve ter no máximo 5 MB.');return;}
    let bitmap;
    try{
      const actual=colors.signature(new Uint8Array(await file.slice(0,16).arrayBuffer()));
      if(!actual||!['image/png','image/jpeg','image/webp'].includes(actual)){showError('Escolha uma imagem PNG, JPG ou WebP válida.');return;}
      bitmap=await decodeLogo(file);
      if(!bitmap.width||!bitmap.height||bitmap.width>12000||bitmap.height>12000)throw Error('Dimensões inválidas');
      const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw Error('Canvas indisponível');
      const scale=Math.min(64/bitmap.width,64/bitmap.height);
      ctx.drawImage(bitmap,(64-bitmap.width*scale)/2,(64-bitmap.height*scale)/2,bitmap.width*scale,bitmap.height*scale);
      const extracted=colors.extract(ctx.getImageData(0,0,64,64).data,64,64);
      if(serial!==uploadSerial)return;
      const old=state.logoUrl;state.logoUrl=URL.createObjectURL(file);if(old)URL.revokeObjectURL(old);
      state.auto=extracted;state.mode='auto';state.primary=extracted.primary;state.secondary=extracted.secondary;
      $('studioLogoThumb').src=state.logoUrl;$('studioLogoSelected').hidden=false;$('studioDrop').hidden=true;
      status.textContent='Logomarca carregada e paleta aplicada automaticamente.';update();
    }catch{if(serial===uploadSerial)showError('Não foi possível abrir essa imagem. Escolha outro arquivo PNG, JPG ou WebP.');}
    finally{bitmap?.close?.();logoInput.value='';}
  }
  function removeLogo(){
    uploadSerial++;if(state.logoUrl)URL.revokeObjectURL(state.logoUrl);
    state.logoUrl=null;state.auto={...colors.FALLBACK};state.mode='auto';state.primary=state.auto.primary;state.secondary=state.auto.secondary;
    $('studioLogoThumb').removeAttribute('src');$('studioLogoSelected').hidden=true;$('studioDrop').hidden=false;showError('');update();$('studioDrop').focus();
  }
  function reset(){
    removeLogo();Object.assign(state,{step:1,name:'',nameProvided:false,segment:null,template:null,style:'modern',device:'desktop',deviceChosen:false,previewing:false,ready:false,category:'Todos',query:''});
    $('studioBusinessName').value='';$('studioSearch').value='';welcome.hidden=false;frame.hidden=true;frame.removeAttribute('src');result.hidden=true;templateSignature='';
    status.textContent='Pronto para criar sua prévia.';renderSegments();renderControls();$('studioDrop').focus();
  }
  buildUI();
  $('studioStyles').innerHTML=data.styles.map(x=>`<button type="button" data-style="${x.id}" aria-pressed="false"><span aria-hidden="true">${x.icon}</span><strong>${safe(x.name)}</strong><small>${safe(x.hint)}</small></button>`).join('');
  renderSegments();renderControls();
  $('studioStart').addEventListener('click',()=>{$('studioWorkspace').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});$('studioDrop').focus();});
  $('studioProgress').addEventListener('click',event=>{const button=event.target.closest('[data-studio-step]');if(button)step(Number(button.dataset.studioStep));});
  $('studioNext').addEventListener('click',()=>step(state.step+1));$('studioBack').addEventListener('click',()=>step(state.step-1));$('studioGenerate').addEventListener('click',()=>{step(5);$('studioPreviewStage').scrollIntoView({behavior:'smooth',block:'center'});});
  logoInput.addEventListener('change',()=>handleFile(logoInput.files?.[0]));
  const drop=$('studioDrop');for(const type of ['dragenter','dragover'])drop.addEventListener(type,event=>{event.preventDefault();drop.classList.add('is-dragging');});
  for(const type of ['dragleave','drop'])drop.addEventListener(type,event=>{event.preventDefault();drop.classList.remove('is-dragging');});
  drop.addEventListener('drop',event=>handleFile(event.dataTransfer.files?.[0]));
  drop.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();logoInput.click();}});
  $('studioReplace').addEventListener('click',()=>logoInput.click());$('studioRemove').addEventListener('click',removeLogo);
  $('studioBusinessName').addEventListener('input',event=>{state.name=event.target.value;state.nameProvided=!!state.name.trim();update();});
  $('studioCategories').addEventListener('click',event=>{const button=event.target.closest('[data-category]');if(button){state.category=button.dataset.category;renderSegments();const choices=visibleSegments();if(choices.length===1)selectSegment(choices[0].id);}});
  $('studioSegments').addEventListener('click',event=>{const button=event.target.closest('[data-segment]');if(button)selectSegment(button.dataset.segment);});
  $('studioTemplates').addEventListener('click',event=>{const button=event.target.closest('[data-template]');if(button){state.template=button.dataset.template;update();}});
  $('studioStyles').addEventListener('click',event=>{const button=event.target.closest('[data-style]');if(button){state.style=button.dataset.style;update();}});
  $('studioTryDemo').addEventListener('click',()=>{state.name='Móveis Oliveira';state.nameProvided=false;$('studioBusinessName').value=state.name;selectSegment('furniture');step(3);});
  $('studioSurprise').addEventListener('click',()=>{const available=data.segments.filter(x=>x.active),chosen=available[Math.floor(Math.random()*available.length)];if(!state.nameProvided){state.name=chosen.sample;$('studioBusinessName').value=state.name;}selectSegment(chosen.id);step(3);});
  host.querySelectorAll('[data-studio-device]').forEach(x=>x.addEventListener('click',()=>setDevice(x.dataset.studioDevice)));
  $('studioResetPreview').addEventListener('click',()=>{if(state.previewing&&state.ready)frame.contentWindow.postMessage({type:'studio-reset'},location.origin);else status.textContent='Escolha um negócio para visualizar a prévia.';});
  const slot=$('studioFullscreenSlot'),preview=stage.parentElement;
  $('studioExpand').addEventListener('click',()=>{if(!state.previewing){status.textContent='Escolha um negócio para ampliar a prévia.';return;}slot.append(stage);dialog.showModal();$('studioDialogClose').focus();});
  $('studioDialogClose').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{preview.insertBefore(stage,preview.querySelector('.studio-preview-foot'));$('studioExpand').focus();});
  $('studioAnotherStyle').addEventListener('click',()=>step(3));$('studioNew').addEventListener('click',reset);
  frame.addEventListener('load',send);
  window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==frame.contentWindow)return;if(event.data?.type==='studio-ready'){state.ready=true;send();}if(event.data?.type==='studio-rendered'){stage.removeAttribute('data-loading');status.textContent='Seu site está pronto. Explore e teste outros modelos.';}});
  window.addEventListener('beforeunload',()=>{if(state.logoUrl)URL.revokeObjectURL(state.logoUrl);});
})();
