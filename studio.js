(() => {
  'use strict';
  const data=window.TR_STUDIO_DATA, palette=window.TR_STUDIO_COLORS;
  const $=id=>document.getElementById(id);
  const host=$('tidireisStudio');if(!host||!data||!palette)return;
  const frame=$('studioFrame'),stage=$('studioPreviewStage'),welcome=$('studioWelcome');
  const result=$('studioResult'),status=$('studioStatus'),dialog=$('studioDialog');
  const state={step:1,name:'',nameProvided:false,colorsProvided:false,segment:'furniture',style:'modern',logoUrl:null,primary:palette.FALLBACK.primary,accent:palette.FALLBACK.accent,auto:{...palette.FALLBACK},generated:false,device:'desktop',ready:false};
  const safe=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const currentSegment=()=>data.segments.find(x=>x.id===state.segment)||data.segments[0];
  const currentStyle=()=>data.styles.find(x=>x.id===state.style)||data.styles[0];
  const logoInput=$('studioLogo'),error=$('studioError');
  function showError(message){error.textContent=message;error.hidden=!message;}
  function fillChoices(){
    $('studioSegments').innerHTML=data.segments.map(x=>`<button type="button" data-segment="${x.id}" aria-pressed="${x.id===state.segment}"><span aria-hidden="true">${x.icon}</span><strong>${safe(x.name)}</strong><small>${safe(x.hint)}</small></button>`).join('');
    $('studioStyles').innerHTML=data.styles.map(x=>`<button type="button" data-style="${x.id}" aria-pressed="${x.id===state.style}"><span aria-hidden="true">${x.icon}</span><strong>${safe(x.name)}</strong><small>${safe(x.hint)}</small></button>`).join('');
  }
  function renderControls(){
    host.querySelectorAll('.studio-step').forEach(x=>x.hidden=Number(x.dataset.step)!==state.step);
    host.querySelectorAll('[data-studio-step]').forEach(x=>{const selected=Number(x.dataset.studioStep)===state.step;x.setAttribute('aria-current',selected?'step':'false');});
    $('studioBack').hidden=state.step===1;
    $('studioNext').hidden=state.step===3;
    $('studioGenerate').hidden=state.step!==3;
    $('studioProgress').closest('.studio-panel').querySelector('.studio-panel-head small').textContent=`0${state.step} / ${['PERSONALIZE SUA MARCA','ESCOLHA SEU NEGÓCIO','DEFINA SEU ESTILO'][state.step-1]}`;
    host.querySelectorAll('[data-segment]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.segment===state.segment)));
    host.querySelectorAll('[data-style]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.style===state.style)));
    host.querySelectorAll('[data-studio-device]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.studioDevice===state.device)));
    stage.dataset.device=state.device;
    $('studioAddress').textContent=`${(state.name||currentSegment().sample).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'').slice(0,24)||'suaempresa'}.demo.local`;
  }
  function step(number){state.step=Math.max(1,Math.min(3,number));renderControls();}
  function config(){return {name:(state.name||currentSegment().sample).trim(),segment:state.segment,style:state.style,logoUrl:state.logoUrl,primary:state.primary,accent:state.accent};}
  function send(){if(state.generated&&state.ready)frame.contentWindow.postMessage({type:'studio-config',config:config()},location.origin);}
  function update(){renderControls();send();if(state.generated)updateContact();}
  function setDevice(device){state.device=device;renderControls();}
  function updateContact(){
    const configured=document.querySelector('a[data-wa="proposta"]');
    const number=configured?.href.match(/wa\.me\/(\d+)/)?.[1];
    const link=$('studioWhatsApp');
    if(!number){link.href='#orcamento';link.removeAttribute('target');return;}
    const lines=['Olá! Fiz uma simulação no TidiReis Studio e gostaria de conversar sobre a criação do meu site.'];
    if(state.nameProvided&&state.name.trim())lines.push(`Empresa: ${state.name.trim()}`);
    lines.push(`Segmento: ${currentSegment().name}`,`Estilo escolhido: ${currentStyle().name}`);
    if(state.colorsProvided)lines.push(`Cores: ${state.primary} e ${state.accent}`);
    lines.push('Gostaria de receber mais informações e um orçamento.');
    const message=lines.join('\n\n');
    link.href=`https://wa.me/${number}?text=${encodeURIComponent(message)}`;link.target='_blank';
  }
  async function decodeLogo(file){
    if(typeof createImageBitmap==='function')try{return await createImageBitmap(file);}catch{}
    const temporary=URL.createObjectURL(file);
    try{return await new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('Imagem inválida'));image.src=temporary;});}
    finally{URL.revokeObjectURL(temporary);}
  }
  async function handleFile(file){
    showError('');if(!file)return;
    if(file.size>5*1024*1024){showError('A imagem deve ter no máximo 5 MB.');return;}
    let bitmap;
    try{
      const bytes=new Uint8Array(await file.slice(0,16).arrayBuffer());
      const actual=palette.signature(bytes);
      if(!actual||!['image/png','image/jpeg','image/webp'].includes(actual)){showError('Escolha uma imagem PNG, JPG ou WebP válida.');return;}
      bitmap=await decodeLogo(file);
      if(!bitmap.width||!bitmap.height||bitmap.width>12000||bitmap.height>12000)throw Error('Dimensões inválidas');
      const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.clearRect(0,0,64,64);
      const scale=Math.min(64/bitmap.width,64/bitmap.height);
      ctx.drawImage(bitmap,(64-bitmap.width*scale)/2,(64-bitmap.height*scale)/2,bitmap.width*scale,bitmap.height*scale);
      const extracted=palette.extract(ctx.getImageData(0,0,64,64).data);
      if(state.logoUrl)URL.revokeObjectURL(state.logoUrl);
      state.logoUrl=URL.createObjectURL(file);state.auto=extracted;state.primary=extracted.primary;state.accent=extracted.accent;state.colorsProvided=true;
      $('studioPrimary').value=state.primary;$('studioAccent').value=state.accent;
      $('studioLogoThumb').src=state.logoUrl;$('studioLogoSelected').hidden=false;$('studioDrop').hidden=true;
      status.textContent='Logomarca carregada e cores identificadas localmente.';update();
    }catch{showError('Não foi possível abrir essa imagem. Escolha outro arquivo PNG, JPG ou WebP.');}
    finally{bitmap?.close?.();logoInput.value='';}
  }
  function removeLogo(){if(state.logoUrl)URL.revokeObjectURL(state.logoUrl);state.logoUrl=null;state.auto={...palette.FALLBACK};state.primary=state.auto.primary;state.accent=state.auto.accent;state.colorsProvided=false;$('studioPrimary').value=state.primary;$('studioAccent').value=state.accent;$('studioLogoThumb').removeAttribute('src');$('studioLogoSelected').hidden=true;$('studioDrop').hidden=false;showError('');update();$('studioDrop').focus();}
  function generate(){
    state.generated=true;welcome.hidden=true;frame.hidden=false;result.hidden=false;
    if(!frame.getAttribute('src')){status.textContent='Preparando sua identidade e organizando seu segmento…';stage.dataset.loading='true';frame.src='studio-preview.html';}
    else {status.textContent='Aplicando seu estilo e suas cores…';send();}
    if(matchMedia('(max-width:690px)').matches)setDevice('mobile');
    updateContact();$('studioPreviewStage').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'center'});
  }
  function reset(){removeLogo();Object.assign(state,{step:1,name:'',nameProvided:false,colorsProvided:false,segment:'furniture',style:'modern',generated:false,device:'desktop'});$('studioBusinessName').value='';welcome.hidden=false;frame.hidden=true;result.hidden=true;status.textContent='Pronto para criar sua prévia.';renderControls();$('studioDrop').focus();}
  fillChoices();renderControls();
  $('studioStart').addEventListener('click',()=>{$('studioWorkspace').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});$('studioDrop').focus();});
  $('studioProgress').addEventListener('click',event=>{const button=event.target.closest('[data-studio-step]');if(button)step(Number(button.dataset.studioStep));});
  $('studioNext').addEventListener('click',()=>step(state.step+1));$('studioBack').addEventListener('click',()=>step(state.step-1));$('studioGenerate').addEventListener('click',generate);
  logoInput.addEventListener('change',()=>handleFile(logoInput.files?.[0]));
  const drop=$('studioDrop');for(const type of ['dragenter','dragover'])drop.addEventListener(type,event=>{event.preventDefault();drop.classList.add('is-dragging');});for(const type of ['dragleave','drop'])drop.addEventListener(type,event=>{event.preventDefault();drop.classList.remove('is-dragging');});drop.addEventListener('drop',event=>handleFile(event.dataTransfer.files?.[0]));
  drop.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();logoInput.click();}});
  $('studioReplace').addEventListener('click',()=>logoInput.click());$('studioRemove').addEventListener('click',removeLogo);
  $('studioBusinessName').addEventListener('input',event=>{state.name=event.target.value;state.nameProvided=!!state.name.trim();update();});
  $('studioSegments').addEventListener('click',event=>{const button=event.target.closest('[data-segment]');if(button){state.segment=button.dataset.segment;update();}});
  $('studioStyles').addEventListener('click',event=>{const button=event.target.closest('[data-style]');if(button){state.style=button.dataset.style;update();}});
  for(const [id,key] of [['studioPrimary','primary'],['studioAccent','accent']])$(id).addEventListener('input',event=>{state[key]=event.target.value;state.colorsProvided=true;update();});
  $('studioAutoColors').addEventListener('click',()=>{state.primary=state.auto.primary;state.accent=state.auto.accent;state.colorsProvided=!!state.logoUrl;$('studioPrimary').value=state.primary;$('studioAccent').value=state.accent;update();});
  $('studioTryDemo').addEventListener('click',()=>{state.name='Móveis Oliveira';state.nameProvided=false;state.segment='furniture';state.style='luxury';state.step=3;$('studioBusinessName').value=state.name;renderControls();generate();});
  $('studioSurprise').addEventListener('click',()=>{const segment=data.segments[Math.floor(Math.random()*data.segments.length)],style=data.styles[Math.floor(Math.random()*data.styles.length)];state.segment=segment.id;state.style=style.id;if(!state.nameProvided)state.name=segment.sample;state.step=3;$('studioBusinessName').value=state.name;renderControls();generate();});
  host.querySelectorAll('[data-studio-device]').forEach(x=>x.addEventListener('click',()=>setDevice(x.dataset.studioDevice)));
  $('studioResetPreview').addEventListener('click',()=>{if(state.generated&&state.ready)frame.contentWindow.postMessage({type:'studio-reset'},location.origin);else status.textContent='Crie uma simulação para usar a prévia.';});
  const slot=$('studioFullscreenSlot'),preview=$('studioPreviewStage').parentElement;
  $('studioExpand').addEventListener('click',()=>{if(!state.generated){status.textContent='Crie uma simulação para ampliar a prévia.';return;}slot.append(stage);dialog.showModal();$('studioDialogClose').focus();});
  $('studioDialogClose').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{preview.insertBefore(stage,preview.querySelector('.studio-preview-foot'));$('studioExpand').focus();});
  $('studioAnotherStyle').addEventListener('click',()=>{step(3);$('studioStyles').scrollIntoView({behavior:'smooth',block:'center'});});$('studioNew').addEventListener('click',reset);
  frame.addEventListener('load',send);
  window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==frame.contentWindow)return;if(event.data?.type==='studio-ready'){state.ready=true;send();}if(event.data?.type==='studio-rendered'){stage.removeAttribute('data-loading');status.textContent='Seu site está pronto! Explore a prévia e teste outras opções.';}});
  window.addEventListener('beforeunload',()=>{if(state.logoUrl)URL.revokeObjectURL(state.logoUrl);});
})();
