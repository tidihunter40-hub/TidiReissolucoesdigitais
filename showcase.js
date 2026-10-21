/* Six self-contained, fictional product demonstrations. No data leaves the page. */
(() => {
  'use strict';
  const showcase = document.querySelector('.showcase');
  if (!showcase) return;
  const screen = document.getElementById('demo-screen');
  const panel = document.getElementById('demo-panel');
  const tabs = [...showcase.querySelectorAll('.showcase-tab')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const concepts = [
    { id: 'site', category: 'SITE INSTITUCIONAL', title: 'Sua marca com presença digital.', description: 'Uma experiência editorial que apresenta o valor do negócio, valoriza projetos e transforma interesse em conversa.', features: ['Direção visual exclusiva', 'Experiência responsiva', 'Projetos e serviços em destaque', 'Caminhos claros para contato'], url: 'atelieaurora.conceito' },
    { id: 'loja', category: 'LOJA VIRTUAL', title: 'Uma vitrine pronta para vender.', description: 'Produtos apresentados com fotografia, organização e uma jornada de compra simples em cada detalhe.', features: ['Catálogo organizado por categorias', 'Fotografia que valoriza o produto', 'Sacola demonstrativa interativa', 'Preços e ofertas em destaque'], url: 'novastore.conceito' },
    { id: 'painel', category: 'PAINEL ADMINISTRATIVO', title: 'Clareza para decidir melhor.', description: 'Indicadores, tendências e atividades reunidos em um painel que torna a operação fácil de acompanhar.', features: ['Métricas com contexto', 'Períodos selecionáveis', 'Leitura visual do faturamento', 'Atividades e status em tempo real simulado'], url: 'pulseanalytics.conceito' },
    { id: 'sistema', category: 'SISTEMA PERSONALIZADO', title: 'Seu processo, em uma só plataforma.', description: 'Um fluxo de gestão sob medida para conectar clientes, atendimentos, agenda e execução dos serviços.', features: ['Áreas de trabalho conectadas', 'Filtros e registros navegáveis', 'Detalhes de atendimento', 'Mudança de status demonstrativa'], url: 'flowgestao.conceito' },
    { id: 'app', category: 'APLICATIVO PWA', title: 'Uma experiência que acompanha o cliente.', description: 'Uma interface de serviços pensada para o celular, com navegação intuitiva e uma sensação de aplicativo.', features: ['Instalável quando implementado', 'Interface adaptada ao celular', 'Recursos offline possíveis', 'Notificações quando implementadas'], url: '' },
    { id: 'marca', category: 'IDENTIDADE VISUAL', title: 'Uma marca feita para ser lembrada.', description: 'Da assinatura à aplicação, cada elemento forma um sistema visual coerente e reconhecível.', features: ['Logomarca e assinatura alternativa', 'Paleta e tipografia', 'Papelaria e cartão de visita', 'Aplicações consistentes da marca'], url: '' }
  ];
  const products = [
    { id: 'chair', category: 'Assentos', name: 'Poltrona Aurora', price: 'R$ 2.890', old: 'R$ 3.390', image: 'assets/lab-chair.webp', alt: 'Poltrona de tecido claro em estúdio iluminado', tag: 'DESTAQUE' },
    { id: 'table', category: 'Mesas', name: 'Mesa Nativa', price: 'R$ 1.490', old: '', image: 'assets/nova-side-table.webp', alt: 'Mesa lateral de madeira em fotografia de estúdio', tag: 'NOVA COLEÇÃO' },
    { id: 'lamp', category: 'Iluminação', name: 'Luminária Sólis', price: 'R$ 890', old: 'R$ 1.090', image: 'assets/nova-ceramic-lamp.webp', alt: 'Luminária de cerâmica e tecido em estúdio claro', tag: 'OFERTA' }
  ];
  const dashboardData = {
    '7 dias': { revenue: 'R$ 18.640', orders: '94', clients: '37', growth: '+8,2%', bars: [35, 48, 44, 62, 57, 78, 92], labels: ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'] },
    '30 dias': { revenue: 'R$ 82.430', orders: '412', clients: '126', growth: '+12,8%', bars: [42, 53, 47, 66, 61, 82, 74], labels: ['SEM 1', 'SEM 2', 'SEM 3', 'SEM 4', 'SEM 5', 'SEM 6', 'SEM 7'] },
    '12 meses': { revenue: 'R$ 947.200', orders: '4.836', clients: '1.204', growth: '+19,4%', bars: [28, 39, 43, 52, 49, 67, 88], labels: ['JAN', 'MAR', 'MAI', 'JUL', 'SET', 'NOV', 'DEZ'] }
  };
  const records = [
    { id: 'FG-1042', client: 'Marina Costa', subject: 'Projeto de interiores', area: 'Atendimentos', date: '22 out', status: 'Em andamento' },
    { id: 'FG-1043', client: 'Studio Bossa', subject: 'Reunião de briefing', area: 'Agenda', date: '23 out', status: 'Aguardando' },
    { id: 'FG-1044', client: 'Rafael Almeida', subject: 'Cadastro e proposta', area: 'Clientes', date: '24 out', status: 'Concluído' },
    { id: 'FG-1045', client: 'Casa Brisa', subject: 'Revisão de projeto', area: 'Atendimentos', date: '25 out', status: 'Em andamento' }
  ];
  const state = { current: 0, sitePage: 'Início', category: 'Todos', cart: 0, period: '30 dias', refresh: 0, dashView: 'Visão geral', area: 'Visão geral', filter: 'Todos', modal: null, appPage: 'Início', appNotice: false, appService: '', brandView: 'Sistema visual' };
  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const button = (label, action, value = '', selected = false, extra = '') => `<button type="button" data-action="${action}" data-value="${escapeHtml(value)}" class="${extra}${selected ? ' is-active' : ''}" ${['site-page', 'shop-category', 'dash-period', 'dash-view', 'system-area', 'app-page', 'brand-view'].includes(action) ? `aria-pressed="${selected}"` : ''}>${label}</button>`;

  function siteHTML() {
    const project = state.sitePage === 'Projetos';
    const studio = state.sitePage === 'Estúdio';
    const contact = state.sitePage === 'Contato';
    return `<div class="sc-site"><div class="sc-site-hero" style="background-image:linear-gradient(90deg,rgba(8,9,9,.92),rgba(8,9,9,.45) 55%,rgba(8,9,9,.06)),url('assets/lab-architecture.webp')"><div class="sc-site-nav"><div class="sc-site-logo"><span class="sc-site-logo-mark">A</span><span>ATELIÊ AURORA<small>ARQUITETURA & INTERIORES</small></span></div><nav aria-label="Navegação da demonstração Ateliê Aurora">${['Início', 'Projetos', 'Estúdio', 'Contato'].map(item => button(item, 'site-page', item, state.sitePage === item)).join('')}</nav></div><div class="sc-site-copy"><span class="sc-site-kicker">ARQUITETURA QUE TRANSFORMA</span><h4>${project ? 'Ambientes que<br><em>inspiram.</em>' : studio ? 'Detalhes que<br><em>fazem sentir.</em>' : contact ? 'Vamos criar<br><em>o seu espaço.</em>' : 'Espaços para<br><em>viver melhor.</em>'}</h4><p>${project ? 'Uma seleção de ambientes residenciais que unem forma, luz e bem-estar.' : studio ? 'Um olhar atento ao modo como as pessoas vivem cada ambiente.' : contact ? 'Conte sobre sua ideia e descubra as possibilidades para transformá-la.' : 'Projetos de arquitetura e interiores que unem estética, funcionalidade e bem-estar.'}</p>${button(project ? 'Conheça o estúdio →' : studio ? 'Fale sobre seu projeto →' : contact ? 'Ver projetos →' : 'Explore os projetos →', 'site-page', project ? 'Estúdio' : studio ? 'Contato' : contact ? 'Projetos' : 'Projetos', false, 'sc-site-cta')}</div><span class="sc-site-hero-index">01 — 03 <i></i> RESIDENCIAL</span></div><div class="sc-site-projects"><div><small>PORTFÓLIO SELECIONADO</small><strong>Arquitetura em cada detalhe.</strong></div><div class="sc-site-thumbs"><span style="background-image:url('assets/lab-architecture.webp')">Casa Horizonte</span><span style="background-image:url('assets/compare-building.webp')">Espaço Contemporâneo</span></div></div></div>`;
  }
  function shopHTML() {
    const visible = state.category === 'Todos' ? products : products.filter(product => product.category === state.category);
    return `<div class="sc-shop"><header class="sc-shop-header"><div class="sc-shop-wordmark">NOVA<span>.</span><small>STORE</small></div><span class="sc-shop-header-note">DESIGN PARA VIVER BEM</span><div class="sc-shop-bag" aria-live="polite"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16l-1.5 12h-13L4 8Zm4 1V6a4 4 0 0 1 8 0v3"/></svg> SACOLA <b>${state.cart}</b></div></header><div class="sc-shop-banner"><div><small>COLEÇÃO CASA / 2026</small><h4>Formas que fazem<br>o cotidiano especial.</h4><p>Peças autorais para ambientes que contam histórias.</p></div><span>ATÉ 20% OFF <small>EM PEÇAS SELECIONADAS</small></span></div><div class="sc-shop-toolbar"><strong>Escolhas para a sua casa</strong><div role="group" aria-label="Categorias de produtos">${['Todos', 'Assentos', 'Mesas', 'Iluminação'].map(item => button(item, 'shop-category', item, state.category === item)).join('')}</div></div><div class="sc-shop-grid">${visible.map(product => `<article class="sc-product"><div class="sc-product-image"><img src="${product.image}" alt="${product.alt}" loading="lazy"><span>${product.tag}</span></div><div class="sc-product-info"><small>${product.category.toUpperCase()}</small><h5>${product.name}</h5><div><strong>${product.price}</strong>${product.old ? `<del>${product.old}</del>` : ''}</div>${button('Adicionar à sacola +', 'add-cart', product.id, false, 'sc-add-cart')}</div></article>`).join('')}</div><p class="sc-shop-feedback" role="status" id="shopFeedback">Sacola demonstrativa. Nenhuma compra será realizada.</p></div>`;
  }
  function dashHTML() {
    const data = dashboardData[state.period];
    const view = state.dashView;
    const revenue = 'R$ ' + (Number(data.revenue.replace(/\D/g, '')) + state.refresh * 280).toLocaleString('pt-BR');
    const orders = (Number(data.orders.replace(/\D/g, '')) + state.refresh * 3).toLocaleString('pt-BR');
    const clients = (Number(data.clients.replace(/\D/g, '')) + state.refresh).toLocaleString('pt-BR');
    return `<div class="sc-dashboard"><aside class="sc-dash-side"><div class="sc-dash-logo"><span>◈</span> PULSE<small>ANALYTICS</small></div><span class="sc-dash-side-label">WORKSPACE</span>${['Visão geral', 'Pedidos', 'Clientes'].map((item, i) => button(`<span>${['▦', '▤', '♙'][i]}</span>${item}`, 'dash-view', item, view === item)).join('')}<div class="sc-dash-side-bottom">● &nbsp; Dados fictícios</div></aside><div class="sc-dash-content"><div class="sc-dash-heading"><div><small>PAINEL / ${view.toUpperCase()}</small><h4>${view}</h4><p>Indicadores para acompanhar a operação.</p></div><div class="sc-dash-tools"><div role="group" aria-label="Período do painel">${Object.keys(dashboardData).map(item => button(item, 'dash-period', item, state.period === item)).join('')}</div><button type="button" class="sc-dash-refresh" data-action="dash-refresh" aria-label="Atualizar dados demonstrativos">↻</button></div></div><div class="sc-dash-kpis"><div><small>FATURAMENTO</small><strong>${revenue}</strong><span>${data.growth} em relação ao período anterior</span></div><div><small>PEDIDOS</small><strong>${orders}</strong><span>+6,4% em relação ao período anterior</span></div><div><small>CLIENTES CADASTRADOS</small><strong>${clients}</strong><span>+9,1% em relação ao período anterior</span></div></div><div class="sc-dash-lower"><div class="sc-dash-chart"><div class="sc-dash-card-head"><div><small>DESEMPENHO</small><h5>Faturamento por período</h5></div><span>↑ ${data.growth}</span></div><div class="sc-bars">${data.bars.map((height, i) => `<div><span class="sc-bar" style="height:${Math.min(96, height + state.refresh * 2)}%"></span><small>${data.labels[i]}</small></div>`).join('')}</div></div><div class="sc-dash-activity"><div class="sc-dash-card-head"><div><small>ATUALIZAÇÕES</small><h5>Atividade recente</h5></div></div><ul><li><i class="is-green"></i><span>Pedido #2048<small>Pagamento confirmado</small></span><b>R$ 1.490</b></li><li><i class="is-blue"></i><span>Pedido #2047<small>Em separação</small></span><b>R$ 890</b></li><li><i class="is-gold"></i><span>Novo cadastro<small>Cliente ativo</small></span><b>Hoje</b></li></ul></div></div><p class="sc-dash-foot" role="status">${state.refresh ? 'Dados demonstrativos atualizados nesta sessão.' : 'Valores fictícios para esta demonstração.'}</p></div></div>`;
  }
  function systemHTML() {
    const visible = records.filter(record => (state.area === 'Visão geral' || record.area === state.area) && (state.filter === 'Todos' || record.status === state.filter));
    const active = records.filter(record => record.status === 'Em andamento').length;
    return `<div class="sc-system"><aside class="sc-system-side"><div class="sc-system-logo">FLOW <span>GESTÃO</span></div><span>ESPAÇO DE TRABALHO</span>${['Visão geral', 'Clientes', 'Atendimentos', 'Agenda'].map((item, i) => button(`<span>${['▦', '♙', '◫', '▦'][i]}</span>${item}`, 'system-area', item, state.area === item)).join('')}<small>INTERFACE CONCEITUAL</small></aside><div class="sc-system-main"><div class="sc-system-top"><div><small>OPERAÇÃO / ${state.area.toUpperCase()}</small><h4>${state.area === 'Visão geral' ? 'Sua operação, em movimento.' : state.area}</h4><p>Visibilidade para cada etapa do atendimento.</p></div><span class="sc-system-avatar" aria-label="Usuária fictícia Ana">AN</span></div><div class="sc-system-metrics"><div><small>CLIENTES ATIVOS</small><strong>128</strong><span>↑ 12% este mês</span></div><div><small>EM ANDAMENTO</small><strong>${String(active).padStart(2, '0')}</strong><span>Atendimentos em curso</span></div><div><small>PRÓXIMOS AGENDAMENTOS</small><strong>06</strong><span>Para esta semana</span></div></div><div class="sc-system-records"><div class="sc-system-toolbar"><div><small>ACOMPANHAMENTO</small><h5>Registros recentes</h5></div><label>Filtrar <select id="systemFilter" aria-label="Filtrar registros por status">${['Todos', 'Em andamento', 'Aguardando', 'Concluído'].map(item => `<option ${state.filter === item ? 'selected' : ''}>${item}</option>`).join('')}</select></label></div><div class="sc-system-table-wrap"><table><thead><tr><th>CLIENTE / ASSUNTO</th><th>ÁREA</th><th>DATA</th><th>STATUS</th><th>AÇÕES</th></tr></thead><tbody>${visible.length ? visible.map(record => `<tr><td><strong>${record.client}</strong><small>${record.subject} · ${record.id}</small></td><td>${record.area}</td><td>${record.date}</td><td><span class="sc-status ${record.status === 'Concluído' ? 'done' : record.status === 'Aguardando' ? 'waiting' : ''}">${record.status}</span></td><td>${button('Detalhes', 'system-detail', record.id)}${button('↻', 'system-status', record.id, false, 'sc-status-change')}</td></tr>`).join('') : '<tr><td colspan="5" class="sc-system-empty">Nenhum registro nesta seleção.</td></tr>'}</tbody></table></div><p>↻ altera o status apenas nesta demonstração.</p></div></div>${state.modal ? `<div class="sc-system-overlay"><div class="sc-system-dialog" role="dialog" aria-modal="true" aria-labelledby="systemDialogTitle"><button type="button" data-action="system-close" aria-label="Fechar detalhes">×</button><small>REGISTRO ${state.modal.id}</small><h5 id="systemDialogTitle">${state.modal.client}</h5><p>${state.modal.subject}</p><dl><div><dt>Área</dt><dd>${state.modal.area}</dd></div><div><dt>Data</dt><dd>${state.modal.date}</dd></div><div><dt>Situação</dt><dd>${state.modal.status}</dd></div></dl></div></div>` : ''}</div>`;
  }
  function appHTML() {
    const page = state.appPage;
    const pageContent = page === 'Início' ? `<div class="sc-app-greeting"><small>BOM DIA, CAMILA</small><h4>Como podemos<br>ajudar hoje?</h4><p>Seus serviços em um só lugar.</p></div><div class="sc-app-feature"><span>EM DESTAQUE</span><strong>Um cuidado novo para sua rotina.</strong>${button('Explorar serviços →', 'app-page', 'Serviços')}</div><div class="sc-app-mini-title">Para você <span>02 opções</span></div><div class="sc-app-service"><b>✦</b><span>Consultoria pessoal<small>Encontre o melhor caminho</small></span><span>→</span></div>` : page === 'Serviços' ? `<div class="sc-app-greeting"><small>CATÁLOGO</small><h4>Escolha o serviço<br>ideal para você.</h4></div><div class="sc-app-service-list">${['Consultoria pessoal', 'Planejamento digital', 'Suporte dedicado'].map((service, i) => `<div class="sc-app-service"><b>${['✦', '◈', '◇'][i]}</b><span>${service}<small>${['Atendimento sob medida', 'Da ideia ao plano', 'Ajuda quando precisar'][i]}</small></span>${button('Ver', 'app-service', service)}</div>`).join('')}</div>${state.appService ? `<p class="sc-app-inline" role="status">${escapeHtml(state.appService)}: atendimento demonstrativo selecionado.</p>` : ''}` : page === 'Avisos' ? `<div class="sc-app-greeting"><small>ATUALIZAÇÕES</small><h4>Novidades para<br>você.</h4></div><div class="sc-app-notification"><b>✦</b><div><strong>Novos horários disponíveis</strong><p>Confira as opções de atendimento desta semana.</p><small>Exemplo de aviso dentro do aplicativo.</small></div></div>` : `<div class="sc-app-greeting"><small>MEU PERFIL</small><h4>Olá, Camila.</h4><p>Este é um perfil fictício de demonstração.</p></div><div class="sc-app-profile"><span>CM</span><div><strong>Camila Martins</strong><small>Cliente demonstrativa</small></div></div><div class="sc-app-profile-note">Preferências e histórico poderiam ficar reunidos aqui.</div>`;
    return `<div class="sc-app-stage"><div class="sc-app-benefits"><span>EXPERIÊNCIA MOBILE</span><h4>O seu serviço<br>mais perto.</h4><p>Um aplicativo web com navegação familiar e uma interface criada para acompanhar o cliente em qualquer tela.</p><ul><li>Instalável quando configurado</li><li>Design responsivo</li><li>Possibilidade de recursos offline</li><li>Notificações quando implementadas</li></ul><small>As telas e os avisos ao lado são simulações locais.</small></div><div class="sc-phone"><div class="sc-phone-frame"><div class="sc-phone-status">9:41 <span>●●● ▰</span></div><div class="sc-phone-head"><strong>viva<span>.</span></strong>${button('<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5l-2 3Zm5 3h4"/></svg>', 'app-page', 'Avisos', false, 'sc-phone-bell')}</div><div class="sc-phone-content">${pageContent}</div><nav class="sc-phone-nav" aria-label="Navegação do aplicativo conceitual">${['Início', 'Serviços', 'Avisos', 'Perfil'].map((item, i) => button(`<span>${['⌂', '▦', '♧', '♙'][i]}</span>${item}`, 'app-page', item, page === item)).join('')}</nav></div></div></div>`;
  }
  function brandHTML() {
    const applications = state.brandView === 'Aplicações';
    return `<div class="sc-brand"><div class="sc-brand-top"><div><span>ESTUDO DE IDENTIDADE / 01</span><h4>MAREA <i>studio</i></h4></div><div role="group" aria-label="Vistas do projeto de identidade">${['Sistema visual', 'Aplicações'].map(item => button(item, 'brand-view', item, state.brandView === item)).join('')}</div></div>${applications ? `<div class="sc-brand-applications"><div class="sc-brand-tote"><div class="sc-brand-tote-handle"></div><div class="sc-brand-tote-body"><span class="sc-brand-symbol">◒</span><strong>MAREA</strong><small>studio</small></div><span>EMBALAGEM / CONCEITO</span></div><div class="sc-brand-stationery"><div class="sc-brand-letter"><span>MAREA <i>studio</i></span><small>DESIGN QUE FLUI COM VOCÊ</small><p>Uma identidade criada para comunicar leveza, presença e movimento.</p><span class="sc-brand-letter-line"></span><small>mareastudio.conceito</small></div><div class="sc-brand-envelope">◒ <span>MAREA</span></div><span>PAPELARIA / CONCEITO</span></div></div>` : `<div class="sc-brand-board"><div class="sc-brand-primary"><span>01 / ASSINATURA PRINCIPAL</span><div class="sc-brand-emblem">◒</div><strong>MAREA</strong><small>STUDIO CRIATIVO</small><p>Forma, ritmo e respiro em uma marca que acompanha o movimento.</p></div><div class="sc-brand-right"><div class="sc-brand-alternative"><span>02 / VERSÃO ALTERNATIVA</span><strong>◒ MAREA <i>studio</i></strong></div><div class="sc-brand-cards"><div class="sc-brand-card-front"><span>◒</span><strong>MAREA</strong><small>STUDIO CRIATIVO</small></div><div class="sc-brand-card-back"><strong>Clara Ribeiro</strong><span>Direção criativa</span><small>contato@mareastudio.conceito<br>+55 11 90000 0000</small></div></div></div></div><div class="sc-brand-spec"><div><span>03 / PALETA</span><div class="sc-brand-swatches"><i title="Verde profundo"></i><i title="Areia clara"></i><i title="Terracota"></i><i title="Branco quente"></i></div><small>#183B36 &nbsp; #E5D8BF &nbsp; #B36A4B &nbsp; #F7F3E9</small></div><div><span>04 / TIPOGRAFIA</span><strong>Aa <i>Editorial serif</i></strong><small>Serif para expressão · Sans para informação</small></div></div>`}<div class="sc-brand-footer"><span>MAREA STUDIO — PROJETO CONCEITUAL</span><span>IDENTIDADE, PAPELARIA & APLICAÇÕES</span></div></div>`;
  }
  const renderers = { site: siteHTML, loja: shopHTML, painel: dashHTML, sistema: systemHTML, app: appHTML, marca: brandHTML };
  function render() {
    const concept = concepts[state.current];
    screen.innerHTML = renderers[concept.id]();
    screen.className = `demo-screen demo-screen-${concept.id}`;
    panel.classList.toggle('is-artboard', concept.id === 'app' || concept.id === 'marca');
    document.getElementById('device-bar').hidden = concept.id === 'app' || concept.id === 'marca';
    document.getElementById('device-url').textContent = concept.url;
  }
  function select(index, focus = false) {
    state.current = (index + concepts.length) % concepts.length;
    state.modal = null;
    const concept = concepts[state.current];
    document.getElementById('demo-number').textContent = `${String(state.current + 1).padStart(2, '0')} / 06`;
    document.getElementById('demo-category').textContent = concept.category;
    document.getElementById('demo-title').textContent = concept.title;
    document.getElementById('demo-description').textContent = concept.description;
    document.getElementById('demo-features').innerHTML = concept.features.map(feature => `<li>${feature}</li>`).join('');
    document.getElementById('demo-next-label').textContent = ['Loja virtual', 'Painel', 'Sistema', 'PWA', 'Identidade visual', 'Site institucional'][state.current];
    panel.setAttribute('aria-labelledby', `tab-${concept.id}`);
    tabs.forEach((tab, i) => { const active = i === state.current; tab.classList.toggle('is-selected', active); tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
    screen.classList.remove('sc-enter');
    render();
    if (!reducedMotion.matches) requestAnimationFrame(() => screen.classList.add('sc-enter'));
    if (focus) tabs[state.current].focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(index));
    tab.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft' || event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        select(event.key === 'Home' ? 0 : event.key === 'End' ? concepts.length - 1 : index + (event.key === 'ArrowRight' ? 1 : -1), true);
      }
    });
  });
  document.getElementById('demoNext').addEventListener('click', () => select(state.current + 1));
  screen.addEventListener('change', event => {
    if (event.target.id === 'systemFilter') { state.filter = event.target.value; render(); }
  });
  screen.addEventListener('click', event => {
    const action = event.target.closest('[data-action]');
    if (!action) return;
    const value = action.dataset.value;
    switch (action.dataset.action) {
      case 'site-page': state.sitePage = value; break;
      case 'shop-category': state.category = value; break;
      case 'add-cart': state.cart += 1; break;
      case 'dash-period': state.period = value; break;
      case 'dash-refresh': state.refresh = (state.refresh + 1) % 3; break;
      case 'dash-view': state.dashView = value; break;
      case 'system-area': state.area = value; state.filter = 'Todos'; break;
      case 'system-detail': state.modal = records.find(record => record.id === value); break;
      case 'system-status': { const record = records.find(item => item.id === value); record.status = { 'Aguardando': 'Em andamento', 'Em andamento': 'Concluído', 'Concluído': 'Aguardando' }[record.status]; break; }
      case 'system-close': state.modal = null; break;
      case 'app-page': state.appPage = value; state.appService = ''; break;
      case 'app-service': state.appService = value; break;
      case 'brand-view': state.brandView = value; break;
      default: return;
    }
    render();
    if (action.dataset.action === 'add-cart') { const feedback = document.getElementById('shopFeedback'); if (feedback) feedback.textContent = `${products.find(product => product.id === value).name} adicionada à sacola demonstrativa.`; }
    if (action.dataset.action === 'system-detail') screen.querySelector('[data-action="system-close"]')?.focus();
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && state.modal) { state.modal = null; render(); } });
  select(0);
})();
