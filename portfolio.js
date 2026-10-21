(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const grid = $('portfolioGrid'), filters = $('portfolioFilters'), search = $('portfolioSearch');
  const count = $('portfolioResultCount'), clear = $('portfolioClear'), stats = $('portfolioStats');
  const dialog = $('portfolioDialog'), content = $('portfolioDialogContent');
  if (![grid,filters,search,count,clear,stats,dialog,content].every(Boolean)) return;
  const labels = {sites:'SITES',sistemas:'SISTEMAS',aplicativos:'APLICATIVOS',lojas:'LOJAS VIRTUAIS',plataformas:'PLATAFORMAS'};
  const categories = ['todos','sites','sistemas','aplicativos','lojas','plataformas'];
  const symbols = {todos:'▦',sites:'▣',sistemas:'▤',aplicativos:'▯',lojas:'◇',plataformas:'◎'};
  const safe = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fold = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
  let projects=[], report={}, active='todos', returnFocus=null;
  const asset = (project,device) => report[project.id]?.[device]?.ok ? `public/portfolio/${project.id}-${device}.webp` : null;
  function monitor(project,large=false){
    const path=asset(project,'desktop');
    return path?`<div class="portfolio-monitor"><div class="portfolio-monitor-top"><i></i><i></i><i></i><span>${safe(new URL(project.url).hostname)}</span></div><img src="${path}" alt="Captura real de ${safe(project.name)} no computador" ${large?'':'loading="lazy"'} decoding="async" width="1440" height="900"></div>`:'<div class="portfolio-unavailable">Captura pública indisponível.</div>';
  }
  function phone(project,large=false){
    const path=asset(project,'mobile');
    return path?`<div class="portfolio-phone"><span aria-hidden="true"></span><img src="${path}" alt="Captura real de ${safe(project.name)} no celular" ${large?'':'loading="lazy"'} decoding="async" width="390" height="844"></div>`:large?'<div class="portfolio-unavailable">Captura mobile indisponível para este projeto.</div>':'';
  }
  const tags = project => project.features?.length?`<div class="portfolio-features">${project.features.slice(0,3).map(x=>`<span>${safe(x)}</span>`).join('')}</div>`:'';
  function card(project,index){
    return `<article class="portfolio-card" style="--card-order:${Math.min(index,7)}"><div class="portfolio-card-visual ${asset(project,'mobile')?'has-mobile':''}"><span class="portfolio-image-badge">${safe(labels[project.category])}</span><span class="portfolio-card-number">${String(project.order||index+1).padStart(2,'0')} / ${String(projects.length).padStart(2,'0')}</span><div class="portfolio-screens">${monitor(project)}${phone(project)}</div><span class="portfolio-image-foot">CAPTURA REAL DO PROJETO</span></div><div class="portfolio-card-body"><span class="portfolio-card-eyebrow">PROJETO PUBLICADO</span><h3>${safe(project.name)}</h3><p>${safe(project.description)}</p>${tags(project)}${report[project.id]?.note?`<span class="portfolio-note">${safe(report[project.id].note)}</span>`:''}<div class="portfolio-card-actions"><a href="${safe(project.url)}" target="_blank" rel="noopener noreferrer" aria-label="Visitar ${safe(project.name)} em nova aba">Visitar projeto <span aria-hidden="true">↗</span></a><button type="button" data-details="${safe(project.id)}" aria-label="Ver detalhes de ${safe(project.name)}">Detalhes <span aria-hidden="true">⌕</span></button></div></div></article>`;
  }
  function renderStats(){
    const n=key=>String(projects.filter(project=>project.category===key).length).padStart(2,'0');
    stats.innerHTML=`<div><strong>${String(projects.length).padStart(2,'0')}</strong><span>PROJETOS REAIS</span></div><div><strong>${String(new Set(projects.map(x=>x.category)).size).padStart(2,'0')}</strong><span>CATEGORIAS</span></div><div class="portfolio-stats-mix"><strong>${n('sites')} <i>/</i> ${n('sistemas')} <i>/</i> ${n('aplicativos')}</strong><span>SITES · SISTEMAS · APPS</span></div>`;
  }
  function renderFilters(){filters.innerHTML=categories.map(category=>`<button type="button" data-filter="${category}" class="${category===active?'is-active':''}" aria-pressed="${category===active}"><span class="portfolio-filter-icon" aria-hidden="true">${symbols[category]}</span><span>${category==='todos'?'TODOS':labels[category]}</span></button>`).join('');}
  function render(){
    const query=fold(search.value.trim());
    const visible=projects.filter(project=>(active==='todos'||project.category===active)&&(!query||fold([project.name,labels[project.category],project.description,project.descriptionLong,project.objective,...(project.features||[]),...(project.technologies||[])].join(' ')).includes(query)));
    count.textContent=`${visible.length} ${visible.length===1?'projeto encontrado':'projetos encontrados'}${active==='todos'?'':` em ${labels[active].toLowerCase()}`}`;
    clear.hidden=active==='todos'&&!search.value;
    filters.querySelectorAll('[data-filter]').forEach(button=>{const on=button.dataset.filter===active;button.classList.toggle('is-active',on);button.setAttribute('aria-pressed',String(on));});
    grid.innerHTML=visible.length?visible.map(card).join(''):'<div class="portfolio-empty"><span aria-hidden="true">⌕</span><h3>Nenhum projeto encontrado.</h3><p>Tente outro nome, característica ou categoria.</p><button type="button" data-clear>Limpar filtros</button></div>';
  }
  function openDetails(project,trigger){
    if(!project)return;
    returnFocus=trigger;
    const features=project.features?.length?`<section><h3>Características confirmadas</h3><div class="portfolio-dialog-tags">${project.features.map(x=>`<span>${safe(x)}</span>`).join('')}</div></section>`:'';
    const technologies=project.technologies?.length?`<section><h3>Tecnologias utilizadas</h3><div class="portfolio-dialog-tags">${project.technologies.map(x=>`<span>${safe(x)}</span>`).join('')}</div></section>`:'';
    content.innerHTML=`<div class="portfolio-dialog-top"><span class="portfolio-dialog-kicker">PROJETO REAL / ${safe(labels[project.category])}</span><button type="button" class="portfolio-close" aria-label="Fechar detalhes">×</button></div><div class="portfolio-dialog-heading"><div><span>${String(project.order||projects.indexOf(project)+1).padStart(2,'0')} / ${String(projects.length).padStart(2,'0')}</span><h2 id="portfolioDialogTitle">${safe(project.name)}</h2><p>${safe(project.descriptionLong||project.description)}</p>${report[project.id]?.note?`<p class="portfolio-dialog-note">${safe(report[project.id].note)}</p>`:''}</div><a class="portfolio-dialog-link" href="${safe(project.url)}" target="_blank" rel="noopener noreferrer">Visitar projeto ↗</a></div><div class="portfolio-dialog-screens"><div><span>DESKTOP · CAPTURA REAL</span>${monitor(project,true)}</div><div><span>CELULAR · CAPTURA REAL</span>${phone(project,true)}</div></div><div class="portfolio-dialog-details">${project.objective?`<section><h3>Objetivo</h3><p>${safe(project.objective)}</p></section>`:''}${features}${technologies}</div>`;
    dialog.showModal();content.querySelector('.portfolio-close').focus();
  }
  filters.addEventListener('click',event=>{const button=event.target.closest('[data-filter]');if(button){active=button.dataset.filter;render();}});
  search.addEventListener('input',render);
  clear.addEventListener('click',()=>{active='todos';search.value='';render();search.focus();});
  grid.addEventListener('click',event=>{const detail=event.target.closest('[data-details]');if(detail){openDetails(projects.find(x=>x.id===detail.dataset.details),detail);return;}if(event.target.closest('[data-clear]')){active='todos';search.value='';render();search.focus();}});
  dialog.addEventListener('click',event=>{if(event.target===dialog||event.target.closest('.portfolio-close'))dialog.close();});
  dialog.addEventListener('keydown',event=>{
    if(event.key!=='Tab')return;
    const controls=[...content.querySelectorAll('a[href],button:not([disabled])')];
    if(!controls.length)return;
    const first=controls[0],last=controls[controls.length-1];
    if(event.shiftKey&&(document.activeElement===first||!dialog.contains(document.activeElement))){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&(document.activeElement===last||!dialog.contains(document.activeElement))){event.preventDefault();first.focus();}
  });
  dialog.addEventListener('close',()=>{returnFocus?.focus();returnFocus=null;});
  const section=$('projetos');
  if ('IntersectionObserver' in window) {
    const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){section.classList.add('portfolio-inview');observer.disconnect();}},{threshold:.07});
    observer.observe(section);
  } else section.classList.add('portfolio-inview');
  Promise.all([fetch('portfolio-projects.json').then(r=>{if(!r.ok)throw Error('Projetos indisponíveis');return r.json();}),fetch('public/portfolio/relatorio.json').then(r=>r.ok?r.json():{projects:{}}).catch(()=>({projects:{}}))]).then(([data,result])=>{projects=data.sort((a,b)=>(a.order||0)-(b.order||0));report=result.projects||{};renderStats();renderFilters();render();}).catch(()=>{grid.innerHTML='<p class="portfolio-loading">Não foi possível carregar os projetos.</p>';count.textContent='Projetos indisponíveis';stats.textContent='Indicadores indisponíveis';});
})();
