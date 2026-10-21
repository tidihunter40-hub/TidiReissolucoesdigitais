(() => {
  'use strict';
  const items = window.TR_LAB;
  const groups = [
    ['website','01','WEBSITE','Sites com identidades próprias e ações funcionais'],
    ['dashboard','02','DASHBOARD','Painéis com dados fictícios que respondem às interações'],
    ['studio','03','DESIGN STUDIO','Uma página inteira que muda com suas escolhas'],
    ['app','04','APP & PWA','Fluxos de aplicativo com estados simulados'],
    ['brand','05','TR INTERACTIVE','A logomarca oficial em uma cena interativa']
  ];
  const $ = id => document.getElementById(id);
  const tech = {website:'HTML · CSS · JavaScript',dashboard:'Dados locais · JavaScript',studio:'CSS Variables · JavaScript',app:'Web App · JavaScript',brand:'CSS 3D · Pointer Events'};
  const groupBar = $('labGroups'), selection = $('labSelection'), stage = $('labFrameStage');
  const frame = $('labFrame'), dialog = $('labDialog'), slot = $('labFullscreenSlot');
  const state = { group:'website', id:'business', device:'desktop', loaded:false };
  const resetFrame = () => { frame.src = `lab-experience.html?demo=${encodeURIComponent(state.id)}&reset=${Date.now()}`; state.loaded = true; };
  const select = id => {
    const item = items.find(entry => entry.id === id);
    if (!item) return;
    state.id = id;
    state.group = item.group;
    render();
    resetFrame();
  };
  function render() {
    const group = groups.find(entry => entry[0] === state.group);
    groupBar.innerHTML = groups.map(([id,no,title]) => `<button type="button" data-group="${id}" class="${id === state.group ? 'is-active' : ''}" aria-pressed="${id === state.group}"><small>${no}</small>${title}</button>`).join('');
    $('labGroupNumber').textContent = `${group[1]} / ${group[2]} EXPERIENCE`;
    $('labGroupTitle').textContent = group[3];
    selection.innerHTML = items.filter(item => item.group === state.group).map((item,index) => `<article class="lab-tile ${item.id === state.id ? 'is-active' : ''}"><div class="lab-tile-art lab-art-${item.theme}"><span>${String(index + 1).padStart(2,'0')} / ${item.kind.toUpperCase()}</span><strong>${item.title}</strong><i aria-hidden="true">↗</i></div><div class="lab-tile-body"><small>${item.kind}</small><h4>${item.title}</h4><p>${item.desc}</p><div>${item.tags.map(tag=>`<span>${tag}</span>`).join('')}</div><small class="lab-tech">${tech[item.group]}</small></div><button type="button" data-demo="${item.id}" aria-label="Explorar ${item.title}">Explorar demonstração <span>→</span></button></article>`).join('');
    const current = items.find(item => item.id === state.id);
    $('labActiveKind').textContent = `${current.kind.toUpperCase()} / DEMONSTRAÇÃO CONCEITUAL`;
    $('labActiveTitle').textContent = current.title;
    $('labActiveDesc').textContent = current.desc;
    $('labDialogTitle').textContent = current.title;
    $('labPreviewAddress').textContent = `${current.id}.lab.local · dados fictícios`;
    stage.dataset.device = state.device;
    document.querySelectorAll('[data-lab-device]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.labDevice === state.device)));
  }
  groupBar.addEventListener('click', event => {
    const button = event.target.closest('[data-group]'); if (!button) return;
    state.group = button.dataset.group;
    state.id = items.find(item => item.group === state.group).id;
    render(); resetFrame();
  });
  selection.addEventListener('click', event => {
    const button = event.target.closest('[data-demo]'); if (!button) return;
    select(button.dataset.demo);
    $('labWorkbench').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  });
  document.querySelectorAll('[data-lab-device]').forEach(button => button.addEventListener('click', () => {
    state.device = button.dataset.labDevice; render();
  }));
  $('labReset').addEventListener('click', resetFrame);
  $('labFullscreen').addEventListener('click', () => { slot.append(stage); dialog.showModal(); $('labDialogClose').focus(); });
  $('labDialogClose').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => $('labWorkbench').insertBefore(stage,$('labWorkbench').querySelector('.lab-disclaimer')));
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  window.addEventListener('tr-lab:select', event => {
    const map = {site:'business',dashboard:'finance',studio:'studio',pwa:'delivery','3d':'brand'};
    select(map[event.detail] || 'business');
  });
  render();
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting) && !state.loaded) { resetFrame(); observer.disconnect(); }
  },{rootMargin:'300px'});
  observer.observe($('labWorkbench'));
})();
