(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  // The lab is an interactive concept showcase. No external customer data is used.
  const labTabs = $$('.lab-tab');
  const labPreview = $('#labPreview');
  const labControls = $('#labControls');
  const labState = { current: 'site', device: 'desktop', template: 'institutional', siteDetail: false, cartCount: 0, period: 'semana', dashView: 'chart', color: '#04c8ff', glow: 55, theme: 'dark', buttonStyle: 'solid', cardStyle: 'outline', font: 'sans', layout: 'columns', pwaPage: 'home', pwaSaved: false, pwaOffline: false, pwaInstalled: false, pwaNotice: false, rx: -13, ry: 24, zoom: 1, finish: 'chrome', light: 'soft' };
  const labMeta = {
    site: ['01 / SITES NA PRÁTICA', 'Quatro ideias, quatro experiências.', 'Escolha um exemplo e alterne entre desktop, tablet e celular.'],
    dashboard: ['02 / DASHBOARD', 'Dados que viram decisões.', 'Alterne o período e acompanhe a mudança dos gráficos e indicadores.'],
    studio: ['03 / DESIGN STUDIO', 'Sua marca, seu estilo.', 'Ajuste cor, tema e brilho para criar outra direção visual.'],
    pwa: ['04 / APP EXPERIENCE', 'A web com cara de app.', 'Navegue por telas, salve um item e observe o estado mudar. Simulação de interface PWA.'],
    '3d': ['05 / TR EM 3D', 'O símbolo em movimento.', 'Arraste, use as setas ou ajuste o zoom para explorar o monograma em CSS 3D.']
  };
  const labControlsMarkup = {
    site: '<div class="lab-control-group"><span>ESCOLHA UM EXEMPLO</span><div class="lab-control-list"><button type="button" class="lab-control" data-template="institutional">Arquitetura</button><button type="button" class="lab-control" data-template="landing">Lançamento</button><button type="button" class="lab-control" data-template="store">Loja</button><button type="button" class="lab-control" data-template="services">Assistência</button></div></div><div class="lab-control-group"><span>VEJA EM OUTRA TELA</span><div class="lab-control-list"><button type="button" class="lab-control" data-device="desktop">Desktop</button><button type="button" class="lab-control" data-device="tablet">Tablet</button><button type="button" class="lab-control" data-device="mobile">Celular</button></div></div>',
    dashboard: '<button type="button" class="lab-control" data-period="semana">Semana</button><button type="button" class="lab-control" data-period="mes">Mês</button><button type="button" class="lab-control" data-period="ano">Ano</button><button type="button" class="lab-control" data-dash-view="chart">Gráfico</button><button type="button" class="lab-control" data-dash-view="table">Tabela</button>',
    studio: '<label class="studio-label">Cor <input id="studioColor" type="color" value="#04c8ff" aria-label="Cor de destaque" /></label><label class="studio-label">Neon <input id="studioGlow" type="range" min="0" max="100" value="55" aria-label="Intensidade do neon" /></label><button type="button" class="lab-control" data-theme="dark">Escuro</button><button type="button" class="lab-control" data-theme="light">Claro</button><button type="button" class="lab-control" data-button-style="outline">Botão contorno</button><button type="button" class="lab-control" data-button-style="solid">Botão sólido</button><button type="button" class="lab-control" data-card-style="filled">Cards cheios</button><button type="button" class="lab-control" data-card-style="outline">Cards contorno</button><button type="button" class="lab-control" data-font="sans">Fonte moderna</button><button type="button" class="lab-control" data-font="serif">Fonte clássica</button><button type="button" class="lab-control" data-layout="columns">Colunas</button><button type="button" class="lab-control" data-layout="stack">Empilhado</button>',
    pwa: '<button type="button" class="lab-control" data-pwa-page="home">Início</button><button type="button" class="lab-control" data-pwa-page="saved">Salvos</button><button type="button" class="lab-control" data-pwa-page="profile">Perfil</button><button type="button" class="lab-control" data-pwa-action="install">Simular instalação</button><button type="button" class="lab-control" data-pwa-action="offline">Simular offline</button><button type="button" class="lab-control" data-pwa-action="notice">Prévia de aviso</button>',
    '3d': '<button type="button" class="lab-control" data-rotate="left" aria-label="Girar à esquerda">←</button><button type="button" class="lab-control" data-rotate="right" aria-label="Girar à direita">→</button><label class="studio-label">Zoom <input id="labZoom" type="range" min="65" max="145" value="100" aria-label="Zoom do símbolo" /></label><button type="button" class="lab-control" data-finish="chrome">Cromo</button><button type="button" class="lab-control" data-finish="blue">Azul</button><button type="button" class="lab-control" data-light="soft">Luz suave</button><button type="button" class="lab-control" data-light="bright">Luz intensa</button><button type="button" class="lab-control" data-rotate="reset">Redefinir</button>'
  };
  const siteExamples = {
    institutional: ['Site de arquitetura', 'Uma marca editorial, com fotografia ampla, portfólio e convite para explorar projetos.'],
    landing: ['Página de lançamento', 'Uma oferta em destaque, benefícios claros e um caminho direto para conhecer o conteúdo.'],
    store: ['Loja virtual', 'Vitrine de produto com imagem, detalhes e sacola interativa nesta simulação.'],
    services: ['Site de assistência', 'Serviços bem organizados e um convite simples para solicitar avaliação.']
  };
  const siteHTML = () => {
    const content = {
      institutional: `<img class="lab-example-photo" src="assets/lab-architecture.webp" alt="Ambiente contemporâneo usado no exemplo conceitual de arquitetura" loading="lazy"><div class="lab-site-nav"><b>ALTO<span> / ARQUITETURA</span></b><span>PROJETOS &nbsp; ESTÚDIO &nbsp; CONTATO</span></div><div class="lab-site-hero"><small>ARQUITETURA COM PROPÓSITO</small><strong>Espaços para<br>viver melhor.</strong><p>Ambientes pensados para novas histórias.</p><button type="button" data-lab-action="site-detail">Ver projetos <span aria-hidden="true">↗</span></button></div><div class="lab-site-foot"><span>01 / RESIDENCIAL</span><span>EXEMPLO CONCEITUAL</span></div>`,
      landing: `<div class="lab-landing-orbit" aria-hidden="true"><span>01</span><span>02</span><span>03</span></div><div class="lab-site-nav"><b>NOVA<span> / ACADEMY</span></b><span>PROGRAMA &nbsp; CONTEÚDO &nbsp; SOBRE</span></div><div class="lab-site-hero"><small>APRENDA • CRIE • EVOLUA</small><strong>Seu próximo<br>passo começa aqui.</strong><p>Uma página de lançamento com mensagem direta e conteúdo em foco.</p><button type="button" data-lab-action="site-detail">Explorar conteúdo <span aria-hidden="true">↗</span></button></div><div class="lab-landing-chips"><span>Aulas</span><span>Projetos</span><span>Comunidade</span></div>`,
      store: `<div class="lab-site-nav"><b>CASA<span> / OBJETO</span></b><span>COLEÇÃO &nbsp; AMBIENTES &nbsp; <b class="lab-cart">SACOLA ${labState.cartCount}</b></span></div><div class="lab-store-layout"><div class="lab-store-copy"><small>COLEÇÃO / FORMAS</small><strong>Poltrona<br>Aurora</strong><p>Conforto e textura em uma peça de destaque.</p><button type="button" data-lab-action="site-cart">Adicionar à sacola <span aria-hidden="true">＋</span></button><em id="siteFeedback" aria-live="polite">${labState.cartCount ? `${labState.cartCount} ${labState.cartCount === 1 ? 'item adicionado' : 'itens adicionados'} nesta demonstração.` : 'Produto fictício para demonstração.'}</em></div><div class="lab-store-image"><img src="assets/lab-chair.webp" alt="Poltrona clara usada no exemplo conceitual de loja" loading="lazy"></div></div><div class="lab-store-foot">DESIGN PARA O DIA A DIA <span>01 / 03</span></div>`,
      services: `<img class="lab-example-photo" src="assets/lab-repair.webp" alt="Bancada de manutenção de computadores usada no exemplo conceitual de assistência" loading="lazy"><div class="lab-site-nav"><b>BYTE<span> / SUPORTE</span></b><span>SERVIÇOS &nbsp; COMO FUNCIONA &nbsp; CONTATO</span></div><div class="lab-site-hero"><small>ASSISTÊNCIA EM INFORMÁTICA</small><strong>Tecnologia em<br>boas mãos.</strong><p>Diagnóstico, manutenção e suporte apresentados com clareza.</p><button type="button" data-lab-action="site-detail">Solicitar avaliação <span aria-hidden="true">↗</span></button></div><div class="lab-service-chips"><span>Diagnóstico</span><span>Manutenção</span><span>Suporte</span></div>`
    }[labState.template];
    const detail = {
      institutional: ['PROJETOS', 'Residencial · Interiores · Comercial', 'Uma amostra de como um portfólio pode organizar áreas de atuação.'],
      landing: ['O PROGRAMA', 'Aulas · Projetos · Comunidade', 'Uma amostra de conteúdo que poderia aparecer nesta landing page.'],
      services: ['AVALIAÇÃO', 'Conte o que aconteceu com seu equipamento.', 'Neste conceito, o próximo passo seria um formulário de contato.']
    }[labState.template];
    return `<div class="lab-site-frame lab-device-${labState.device} lab-template-${labState.template}"><div class="lab-browser-bar"><span aria-hidden="true">● ● ●</span><span>${labState.template === 'store' ? 'casaobjeto.exemplo' : labState.template === 'landing' ? 'nova.exemplo' : labState.template === 'services' ? 'bytesuporte.exemplo' : 'alto.exemplo'}</span><span>↗</span></div><div class="lab-site-page">${content}${labState.siteDetail && detail ? `<div class="lab-site-detail" role="status"><button type="button" data-lab-action="site-close" aria-label="Fechar detalhes">×</button><small>${detail[0]}</small><strong>${detail[1]}</strong><p>${detail[2]}</p></div>` : ''}</div></div>`;
  };
  const dashboardHTML = () => {
    const points = { semana: [42, 65, 51, 77, 61, 84, 72], mes: [28, 49, 58, 45, 71, 80, 91], ano: [23, 36, 43, 59, 68, 78, 96] }[labState.period];
    const labels = { semana: ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'], mes: ['01', '05', '10', '15', '20', '25', '30'], ano: ['JAN', 'MAR', 'MAI', 'JUL', 'SET', 'NOV', 'DEZ'] }[labState.period];
    const chart = '<div class="lab-chart" aria-label="Gráfico ilustrativo de ' + labState.period + '">' + points.map((point, i) => '<div><span style="height:' + point + '%"></span><small>' + labels[i] + '</small></div>').join('') + '</div>';
    const table = '<div class="lab-dash-table"><div><b>CANAL</b><b>VISITAS</b><b>CONTATOS</b></div><div><span>Busca</span><span>' + ({ semana: '530', mes: '2.450', ano: '28.100' })[labState.period] + '</span><span>42%</span></div><div><span>Direto</span><span>' + ({ semana: '410', mes: '1.940', ano: '22.600' })[labState.period] + '</span><span>33%</span></div><div><span>Social</span><span>' + ({ semana: '344', mes: '1.552', ano: '17.710' })[labState.period] + '</span><span>25%</span></div></div>';
    return '<div class="lab-dashboard"><div class="lab-dash-head"><b>TR / ANALYTICS</b><span>PAINEL CONCEITUAL</span></div><div class="lab-dash-layout"><div class="lab-dash-side"><span>◉</span><span>▤</span><span>▥</span><span>⚙</span></div><div class="lab-dash-main"><div class="lab-kpis"><div><small>VISITAS</small><strong>' + ({ semana: '1.284', mes: '5.942', ano: '68.410' })[labState.period] + '</strong></div><div><small>CONTATOS</small><strong>' + ({ semana: '84', mes: '321', ano: '4.108' })[labState.period] + '</strong></div><div><small>CONVERSÃO</small><strong>' + ({ semana: '6,5%', mes: '5,4%', ano: '6,0%' })[labState.period] + '</strong></div></div>' + (labState.dashView === 'chart' ? chart : table) + '</div></div><p>Dados fictícios usados apenas nesta demonstração.</p></div>';
  };
  const studioHTML = () => '<div class="lab-studio ' + (labState.theme === 'light' ? 'studio-light' : '') + ' studio-button-' + labState.buttonStyle + ' studio-cards-' + labState.cardStyle + ' studio-font-' + labState.font + ' studio-layout-' + labState.layout + '" style="--studio-accent:' + labState.color + ';--studio-glow:' + (labState.glow / 28) + 'rem"><div class="studio-nav"><b>FORMA / STUDIO</b><span>MENU ☰</span></div><div class="studio-hero"><small>DESIGN QUE COMUNICA</small><strong>Uma ideia.<br>Infinitas possibilidades.</strong><p>Identidade, interface e experiência em uma só direção.</p><button type="button" data-lab-action="studio-cta">Explorar conceito →</button><em id="studioFeedback" aria-live="polite"></em></div><div class="studio-cards"><span>01 / Estratégia</span><span>02 / Identidade</span><span>03 / Digital</span></div></div>';
  const pwaHTML = () => '<div class="lab-phone"><div class="phone-top"><span>9:41</span><span>' + (labState.pwaOffline ? 'OFFLINE' : '●●● ▰') + '</span></div><div class="phone-app"><div class="phone-app-head"><b>TR / POCKET</b><span>◉</span></div><div class="phone-status">' + (labState.pwaInstalled ? 'Atalho simulado na tela inicial' : 'Prévia no navegador') + (labState.pwaOffline ? ' · Conteúdo local disponível' : '') + '</div>' + (labState.pwaNotice ? '<div class="phone-notice" role="status">Prévia local: nova ideia em destaque. Nenhuma notificação foi enviada.</div>' : '') + (labState.pwaPage === 'home' ? '<small>OLÁ, VISITANTE</small><h4>Descubra novas ideias.</h4><div class="phone-feature"><span>DESTAQUE</span><strong>Design que transforma negócios.</strong><button type="button" data-lab-action="save">' + (labState.pwaSaved ? '✓ Salvo' : '☆ Salvar') + '</button></div><p>Explore soluções digitais em qualquer tela.</p>' : labState.pwaPage === 'saved' ? '<small>SUA COLEÇÃO</small><h4>Itens salvos</h4><div class="phone-feature"><strong>' + (labState.pwaSaved ? 'Design que transforma negócios.' : 'Nada salvo por enquanto.') + '</strong></div>' : '<small>SEU ESPAÇO</small><h4>Perfil demonstrativo</h4><div class="phone-profile">TR</div><p>Esta é uma simulação local. Nenhuma conta foi criada.</p>') + '<div class="phone-nav"><button type="button" data-pwa-page="home">⌂</button><button type="button" data-pwa-page="saved">☆</button><button type="button" data-pwa-page="profile">◉</button></div></div></div>';
  const cubeHTML = () => '<div class="lab-3d finish-' + labState.finish + ' light-' + labState.light + '" id="lab3d"><div class="cube-scene"><div class="tr-object" id="trObject" style="transform:rotateX(' + labState.rx + 'deg) rotateY(' + labState.ry + 'deg) scale(' + labState.zoom + ')"><div class="tr-face front"><img src="assets/logo-symbol-transparent.png" alt="Monograma TR em 3D" draggable="false" /></div><div class="tr-face back"><img src="assets/logo-symbol-transparent.png" alt="" draggable="false" /></div><div class="tr-face edge edge-one"></div><div class="tr-face edge edge-two"></div></div></div><span>ARRASTE PARA GIRAR · USE OS CONTROLES PARA ZOOM</span></div>';
  const labViews = { site: siteHTML, dashboard: dashboardHTML, studio: studioHTML, pwa: pwaHTML, '3d': cubeHTML };
  function syncLabControls() {
    $$('.lab-control', labControls).forEach(button => {
      const data = button.dataset;
      const active = data.device === labState.device && labState.current === 'site' || data.template === labState.template && labState.current === 'site' || data.period === labState.period && labState.current === 'dashboard' || data.dashView === labState.dashView && labState.current === 'dashboard' || data.theme === labState.theme && labState.current === 'studio' || data.buttonStyle === labState.buttonStyle && labState.current === 'studio' || data.cardStyle === labState.cardStyle && labState.current === 'studio' || data.font === labState.font && labState.current === 'studio' || data.layout === labState.layout && labState.current === 'studio' || data.pwaPage === labState.pwaPage && labState.current === 'pwa' || data.pwaAction === 'offline' && labState.pwaOffline || data.pwaAction === 'install' && labState.pwaInstalled || data.pwaAction === 'notice' && labState.pwaNotice || data.finish === labState.finish && labState.current === '3d' || data.light === labState.light && labState.current === '3d';
      button.classList.toggle('is-active', Boolean(active));
    });
    if ($('#studioColor')) $('#studioColor').value = labState.color;
    if ($('#studioGlow')) $('#studioGlow').value = labState.glow;
    if ($('#labZoom')) $('#labZoom').value = Math.round(labState.zoom * 100);
  }
  function renderLab() { labPreview.innerHTML = labViews[labState.current](); if (labState.current === 'site') { $('#labTitle').textContent = siteExamples[labState.template][0]; $('#labDescription').textContent = siteExamples[labState.template][1]; } syncLabControls(); if (labState.current === '3d') attach3D(); }
  function selectLab(name, focus = false) {
    if (!labMeta[name]) return;
    labState.current = name;
    const [index, title, description] = labMeta[name];
    $('#labIndex').textContent = index; $('#labTitle').textContent = title; $('#labDescription').textContent = description;
    labControls.innerHTML = labControlsMarkup[name];
    labTabs.forEach(tab => { const active = tab.dataset.lab === name; tab.classList.toggle('is-active', active); tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
    labPreview.setAttribute('aria-labelledby', 'lab-tab-' + name);
    renderLab();
    if (focus) $('#lab-tab-' + name).focus();
  }
  labTabs.forEach((tab, index) => { tab.addEventListener('click', () => selectLab(tab.dataset.lab)); tab.addEventListener('keydown', event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + labTabs.length) % labTabs.length; selectLab(labTabs[next].dataset.lab, true); } }); });
  $('#openLab3d').addEventListener('click', () => selectLab('3d', true));
  labControls.addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button) return;
    if (button.dataset.device) labState.device = button.dataset.device;
    if (button.dataset.template) { labState.template = button.dataset.template; labState.siteDetail = false; }
    if (button.dataset.period) labState.period = button.dataset.period;
    if (button.dataset.dashView) labState.dashView = button.dataset.dashView;
    if (button.dataset.theme) labState.theme = button.dataset.theme;
    if (button.dataset.buttonStyle) labState.buttonStyle = button.dataset.buttonStyle;
    if (button.dataset.cardStyle) labState.cardStyle = button.dataset.cardStyle;
    if (button.dataset.font) labState.font = button.dataset.font;
    if (button.dataset.layout) labState.layout = button.dataset.layout;
    if (button.dataset.pwaPage) labState.pwaPage = button.dataset.pwaPage;
    if (button.dataset.pwaAction === 'offline') labState.pwaOffline = !labState.pwaOffline;
    if (button.dataset.pwaAction === 'install') labState.pwaInstalled = !labState.pwaInstalled;
    if (button.dataset.pwaAction === 'notice') labState.pwaNotice = !labState.pwaNotice;
    if (button.dataset.finish) labState.finish = button.dataset.finish;
    if (button.dataset.light) labState.light = button.dataset.light;
    if (button.dataset.rotate) { if (button.dataset.rotate === 'reset') { labState.rx = -13; labState.ry = 24; labState.zoom = 1; const zoom = $('#labZoom'); if (zoom) zoom.value = 100; } else labState.ry += button.dataset.rotate === 'left' ? -25 : 25; }
    renderLab();
  });
  labControls.addEventListener('input', event => {
    if (event.target.id === 'studioColor') { labState.color = event.target.value; $('.lab-studio').style.setProperty('--studio-accent', labState.color); }
    if (event.target.id === 'studioGlow') { labState.glow = Number(event.target.value); $('.lab-studio').style.setProperty('--studio-glow', (labState.glow / 28) + 'rem'); }
    if (event.target.id === 'labZoom') { labState.zoom = Number(event.target.value) / 100; update3D(); }
  });
  labPreview.addEventListener('click', event => {
    const action = event.target.closest('[data-lab-action], [data-pwa-page]'); if (!action) return;
    if (action.dataset.pwaPage) { labState.pwaPage = action.dataset.pwaPage; renderLab(); return; }
    if (action.dataset.labAction === 'save') { labState.pwaSaved = !labState.pwaSaved; renderLab(); }
    if (action.dataset.labAction === 'site-detail') { labState.siteDetail = true; renderLab(); }
    if (action.dataset.labAction === 'site-close') { labState.siteDetail = false; renderLab(); }
    if (action.dataset.labAction === 'site-cart') { labState.cartCount += 1; renderLab(); }
    if (action.dataset.labAction === 'studio-cta') $('#studioFeedback').textContent = 'Direção visual selecionada nesta prévia.';
  });
  function update3D() { const object = $('#trObject'); if (object) object.style.transform = 'rotateX(' + labState.rx + 'deg) rotateY(' + labState.ry + 'deg) scale(' + labState.zoom + ')'; }
  function attach3D() {
    const stage = $('#lab3d'); let point = null;
    stage.addEventListener('pointerdown', event => { point = { x: event.clientX, y: event.clientY }; stage.setPointerCapture(event.pointerId); });
    stage.addEventListener('pointermove', event => { if (!point) return; labState.ry += (event.clientX - point.x) * .45; labState.rx -= (event.clientY - point.y) * .45; point = { x: event.clientX, y: event.clientY }; update3D(); });
    stage.addEventListener('pointerup', () => { point = null; });
    stage.addEventListener('pointercancel', () => { point = null; });
  }
  selectLab('site');

  const compareRange = $('#compareRange');
  function updateCompare() { const value = Number(compareRange.value); $('#compareAfter').style.clipPath = 'inset(0 0 0 ' + value + '%)'; $('#compareDivider').style.left = value + '%'; compareRange.setAttribute('aria-valuetext', value + '% da versão básica e ' + (100 - value) + '% da versão profissional'); }
  compareRange.addEventListener('input', updateCompare); updateCompare();

  // Service details reuse the copy and commercial link already present in each card.
  const serviceDialog = $('#serviceDialog');
  $$('.service-card').forEach(card => {
    const detail = document.createElement('button'); detail.type = 'button'; detail.className = 'service-detail-button'; detail.textContent = 'Ver detalhes →'; detail.setAttribute('aria-label', 'Ver detalhes: ' + $('h3', card).textContent);
    card.insertBefore(detail, $('.service-link', card));
    function openService() { $('#serviceDialogCode').textContent = $('.card-no', card).textContent; $('#serviceDialogTitle').textContent = $('h3', card).textContent; $('#serviceDialogDescription').textContent = $('p', card).textContent; const tags = $('#serviceDialogTags'); tags.replaceChildren(); $$('.tags span', card).forEach(item => { const tag = document.createElement('span'); tag.textContent = item.textContent; tags.append(tag); }); $('#serviceDialogCta').href = $('.service-link', card).href; serviceDialog.showModal(); }
    detail.addEventListener('click', openService);
    card.addEventListener('click', event => { if (!event.target.closest('a,button')) openService(); });
    if (matchMedia('(hover:hover) and (pointer:fine)').matches) card.addEventListener('pointermove', event => { const rect = card.getBoundingClientRect(); card.style.setProperty('--card-x', (event.clientX - rect.left) + 'px'); card.style.setProperty('--card-y', (event.clientY - rect.top) + 'px'); }, { passive: true });
  });
  $('#serviceDialogClose').addEventListener('click', () => serviceDialog.close());

  // A short, fixed command list is safer and easier to navigate than arbitrary commands.
  const commandDialog = $('#commandDialog'); const commandInput = $('#commandInput'); const commandResults = $('#commandResults');
  const commands = [
    ['Início', '#inicio'], ['Serviços', '#servicos'], ['TR Lab', '#tecnologia'], ['Projetos conceituais', '#projetos'], ['Comparador', '#comparativo'], ['Sobre', '#sobre'], ['Orçamento', '#orcamento'], ['Contato', '#contato'],
    ['Abrir Website no TR Lab', 'lab:site'], ['Abrir Dashboard no TR Lab', 'lab:dashboard'], ['Abrir Design Studio no TR Lab', 'lab:studio'], ['Abrir PWA no TR Lab', 'lab:pwa'], ['Abrir TR 3D no TR Lab', 'lab:3d']
  ];
  let selectedCommand = 0; let visibleCommands = commands;
  function renderCommands() {
    const query = commandInput.value.trim().toLocaleLowerCase('pt-BR');
    visibleCommands = commands.filter(([label]) => label.toLocaleLowerCase('pt-BR').includes(query)); selectedCommand = 0;
    commandResults.replaceChildren();
    if (!visibleCommands.length) { const empty = document.createElement('p'); empty.textContent = 'Nenhum resultado.'; commandResults.append(empty); return; }
    visibleCommands.forEach(([label, target], index) => { const button = document.createElement('button'); button.type = 'button'; button.className = 'command-result' + (index === selectedCommand ? ' is-selected' : ''); button.dataset.target = target; button.innerHTML = '<span>⌁</span><strong></strong><small>↵</small>'; $('strong', button).textContent = label; commandResults.append(button); });
  }
  function openCommands() { commandInput.value = ''; renderCommands(); commandDialog.showModal(); commandInput.focus(); }
  function runCommand(target) { commandDialog.close(); if (target.startsWith('lab:')) { selectLab(target.slice(4)); $('#tecnologia').scrollIntoView({ behavior: 'smooth' }); } else { location.hash = target; } }
  $('#commandOpen').addEventListener('click', openCommands);
  $('#mobileCommand').addEventListener('click', () => { $('#mobileNav').hidden = true; $('#menuToggle').setAttribute('aria-expanded', 'false'); openCommands(); });
  $('#commandClose').addEventListener('click', () => commandDialog.close());
  commandInput.addEventListener('input', renderCommands);
  commandInput.addEventListener('keydown', event => { if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && visibleCommands.length) { event.preventDefault(); selectedCommand = (selectedCommand + (event.key === 'ArrowDown' ? 1 : -1) + visibleCommands.length) % visibleCommands.length; $$('.command-result', commandResults).forEach((button, index) => button.classList.toggle('is-selected', index === selectedCommand)); } if (event.key === 'Enter' && visibleCommands[selectedCommand]) { event.preventDefault(); runCommand(visibleCommands[selectedCommand][1]); } });
  commandResults.addEventListener('click', event => { const button = event.target.closest('[data-target]'); if (button) runCommand(button.dataset.target); });
  document.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); commandDialog.open ? commandDialog.close() : openCommands(); } });

  // Budget: choices stay in this browser; only a user click opens the final WhatsApp URL.
  const quoteForm = $('#quoteForm'); const quoteSteps = $$('.quote-step'); const quoteIdea = $('#projectIdea'); const quoteError = $('#quoteError'); let quoteStep = 0;
  const features = {
    Site: ['Formulário de contato', 'WhatsApp', 'Blog', 'Agendamento', 'Animações'],
    'Loja virtual': ['Catálogo', 'Carrinho', 'Pagamento', 'Gestão de pedidos', 'Cupons'],
    Sistema: ['Painel administrativo', 'Relatórios', 'Automações', 'Login', 'Integrações'],
    Aplicativo: ['PWA', 'Notificações', 'Login', 'Catálogo', 'Área do cliente'],
    Logomarca: ['Pesquisa de marca', 'Manual visual', 'Variações da logo', 'Aplicações'],
    Propaganda: ['Redes sociais', 'Banners', 'Campanha', 'Vídeo curto'],
    'Manutenção de computador': ['Diagnóstico', 'Limpeza', 'Troca de peça', 'Otimização'],
    'Peças de informática': ['Orçamento de peça', 'Upgrade', 'Compatibilidade']
  };
  function selectedService() { return quoteForm.querySelector('input[name="service"]:checked')?.value || ''; }
  function renderFeatures() { const box = $('#featureOptions'); box.replaceChildren(); (features[selectedService()] || []).forEach(name => { const label = document.createElement('label'); const input = document.createElement('input'); input.type = 'checkbox'; input.name = 'feature'; input.value = name; const span = document.createElement('span'); span.textContent = name; label.append(input, span); box.append(label); }); }
  function selectedFeatures() { return $$('input[name="feature"]:checked', quoteForm).map(input => input.value); }
  function renderSummary() { const box = $('#quoteSummary'); box.replaceChildren(); [['Serviço', selectedService()], ['Recursos', selectedFeatures().join(', ') || 'A definir'], ['Ideia', quoteIdea.value.trim()]].forEach(([title, value]) => { const row = document.createElement('div'); const name = document.createElement('strong'); const text = document.createElement('span'); name.textContent = title; text.textContent = value; row.append(name, text); box.append(row); }); }
  function showQuoteStep(step) { quoteStep = step; quoteSteps.forEach((element, index) => { element.hidden = index !== step; }); $('#quoteBack').hidden = step === 0; $('#quoteNext').hidden = step === 3; $('#quoteSubmit').hidden = step !== 3; $('#quoteProgressLabel').textContent = 'ETAPA ' + (step + 1) + ' DE 4 · ' + ['SERVIÇO', 'RECURSOS', 'SUA IDEIA', 'REVISÃO'][step]; $('#quoteProgressBar').style.width = ((step + 1) * 25) + '%'; quoteError.hidden = true; if (step === 3) renderSummary(); }
  $('#quoteNext').addEventListener('click', () => { if (quoteStep === 0 && !selectedService()) { quoteError.textContent = 'Escolha um serviço para continuar.'; quoteError.hidden = false; quoteForm.querySelector('input[name="service"]').focus(); return; } if (quoteStep === 2 && !quoteIdea.value.trim()) { quoteError.textContent = 'Descreva sua ideia para continuar.'; quoteError.hidden = false; quoteIdea.focus(); return; } if (quoteStep === 0) renderFeatures(); showQuoteStep(quoteStep + 1); });
  $('#quoteBack').addEventListener('click', () => showQuoteStep(quoteStep - 1));
  quoteIdea.addEventListener('input', () => { $('#ideaCount').textContent = quoteIdea.value.length + ' / 1200 caracteres'; });
  quoteForm.addEventListener('submit', event => { event.preventDefault(); if (quoteStep !== 3) return; const service = selectedService(); const description = quoteIdea.value.trim(); if (!service || !description) { showQuoteStep(!service ? 0 : 2); return; } const message = 'Olá! Conheci a TidiReis pelo site e gostaria de solicitar um orçamento.\n\nServiço: ' + service + '\nRecursos: ' + (selectedFeatures().join(', ') || 'A definir') + '\nMinha ideia: ' + description; window.open('https://wa.me/5571992417737?text=' + encodeURIComponent(message), '_blank', 'noopener,noreferrer'); });
  showQuoteStep(0);

  const terminalOutput = $('#terminalOutput'); const terminalInput = $('#terminalInput');
  const terminalResponses = {
    help: 'Comandos: help, services, projects, contact, about, clear.',
    services: 'Sites, lojas virtuais, sistemas, aplicativos, identidade visual, propagandas e informática. Veja a seção Serviços.',
    projects: 'Os projetos apresentados são conceitos demonstrativos. Veja a seção Projetos.',
    contact: 'Fale com a TidiReis pelo WhatsApp: (71) 99241-7737. Veja a seção Contato.',
    about: 'TidiReis Soluções Digitais · Tiago Silva dos Reis LTDA · CNPJ 69.340.664/0001-04.'
  };
  $('#terminalForm').addEventListener('submit', event => {
    event.preventDefault(); const command = terminalInput.value.trim().toLowerCase(); if (!command) return;
    if (command === 'clear') { terminalOutput.replaceChildren(); terminalInput.value = ''; return; }
    const entry = document.createElement('p'); const prompt = document.createElement('strong'); prompt.textContent = 'tidireis@site:~$ ' + command; const response = document.createElement('span'); response.textContent = terminalResponses[command] || 'Comando não reconhecido. Digite help.'; entry.append(prompt, response); terminalOutput.append(entry); terminalOutput.scrollTop = terminalOutput.scrollHeight; terminalInput.value = '';
  });

  if (location.protocol === 'https:' || location.hostname === 'localhost') {
    const shareButton = document.createElement('button'); shareButton.type = 'button'; shareButton.className = 'install-link'; shareButton.textContent = 'Compartilhar site';
    const shareStatus = document.createElement('small'); shareStatus.className = 'share-status'; shareStatus.setAttribute('role', 'status');
    $('.footer-company').append(shareButton, shareStatus);
    shareButton.addEventListener('click', async () => {
      const url = location.href.split('#')[0];
      try {
        if (navigator.share) { await navigator.share({ title: 'TidiReis Soluções Digitais', text: 'Conheça nossas soluções digitais.', url }); shareStatus.textContent = ''; }
        else if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(url); shareStatus.textContent = 'Link copiado.'; }
        else { shareStatus.textContent = 'Compartilhamento indisponível neste navegador.'; }
      } catch (error) { if (error.name !== 'AbortError') shareStatus.textContent = 'Não foi possível compartilhar agora.'; }
    });
  }

  // Respect reduced motion and data saving. Visitors can choose a lighter experience.
  const modeButton = $('#experienceMode'); const mediaMotion = matchMedia('(prefers-reduced-motion: reduce)'); const saveData = navigator.connection?.saveData;
  let lightMode = mediaMotion.matches || Boolean(saveData);
  function setMode(enabled) { lightMode = enabled; document.documentElement.classList.toggle('mode-light', enabled); modeButton.setAttribute('aria-pressed', String(enabled)); $('span', modeButton).textContent = enabled ? 'Modo: Performance' : 'Modo: Cinematic'; }
  modeButton.addEventListener('click', () => setMode(!lightMode)); setMode(lightMode);
  const aboutScene = $('#aboutScene');
  if (aboutScene) {
    if ('IntersectionObserver' in window) {
      const aboutObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => aboutScene.classList.toggle('is-scene-active', entry.isIntersecting));
      }, { threshold: .08 });
      aboutObserver.observe(aboutScene);
    } else aboutScene.classList.add('is-scene-active');
    let aboutFrame = 0;
    aboutScene.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse' || lightMode || mediaMotion.matches || aboutFrame) return;
      const bounds = aboutScene.getBoundingClientRect();
      const x = Math.max(-8, Math.min(8, (event.clientX - bounds.left - bounds.width / 2) / bounds.width * 16));
      const y = Math.max(-8, Math.min(8, (event.clientY - bounds.top - bounds.height / 2) / bounds.height * 16));
      aboutFrame = requestAnimationFrame(() => { aboutScene.style.setProperty('--about-x', x + 'px'); aboutScene.style.setProperty('--about-y', y + 'px'); aboutFrame = 0; });
    }, { passive: true });
    aboutScene.addEventListener('pointerleave', () => { aboutScene.style.setProperty('--about-x', '0px'); aboutScene.style.setProperty('--about-y', '0px'); });
  }
  const heroLogo = $('.hero-logo-frame'); let parallaxFrame = 0;
  function updateHeroDepth() {
    if (parallaxFrame) return;
    parallaxFrame = requestAnimationFrame(() => {
      const offset = !lightMode && !mediaMotion.matches ? Math.min(20, Math.max(0, scrollY * .035)) : 0;
      heroLogo.style.setProperty('--hero-shift', offset + 'px');
      parallaxFrame = 0;
    });
  }
  addEventListener('scroll', updateHeroDepth, { passive: true });
  updateHeroDepth();
})();
