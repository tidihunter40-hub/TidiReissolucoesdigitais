(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function selectLab(name) { window.dispatchEvent(new CustomEvent('tr-lab:select', { detail: name })); }

  const compareStage = $('#compareStage');
  const compareRange = $('#compareRange');
  function updateCompare() {
    const value = Math.max(0, Math.min(100, Number(compareRange.value) || 0));
    compareStage.style.setProperty('--compare-position', value + '%');
    compareRange.setAttribute('aria-valuetext', value + '% da versão antiga e ' + (100 - value) + '% da versão nova');
  }
  function moveCompare(event) {
    const bounds = compareStage.getBoundingClientRect();
    if (!bounds.width) return;
    compareRange.value = String(Math.round(Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)) * 100));
    updateCompare();
  }
  let comparePointer = null;
  compareStage.addEventListener('pointerdown', event => {
    if (event.button !== 0 || comparePointer !== null) return;
    comparePointer = event.pointerId;
    compareStage.setPointerCapture(event.pointerId);
    compareRange.focus({ preventScroll: true });
    moveCompare(event);
  });
  compareStage.addEventListener('pointermove', event => {
    if (event.pointerId === comparePointer) moveCompare(event);
  });
  const endCompare = event => {
    if (event.pointerId !== comparePointer) return;
    if (event.type === 'pointerup') moveCompare(event);
    comparePointer = null;
    if (compareStage.hasPointerCapture(event.pointerId)) compareStage.releasePointerCapture(event.pointerId);
  };
  compareStage.addEventListener('pointerup', endCompare);
  compareStage.addEventListener('pointercancel', endCompare);
  compareStage.addEventListener('dragstart', event => event.preventDefault());
  compareRange.addEventListener('input', updateCompare);
  updateCompare();

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
  const quoteForm = $('#quoteForm'); const quoteSteps = $$('.quote-step'); const quoteIdea = $('#projectIdea'); const quoteError = $('#quoteError'); const quoteStatus = $('#quoteStatus'); let quoteStep = 0;
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
  function showQuoteStep(step) { quoteStep = step; quoteSteps.forEach((element, index) => { element.hidden = index !== step; }); $('#quoteBack').hidden = step === 0; $('#quoteNext').hidden = step === 3; $('#quoteSubmit').hidden = step !== 3; $('#quoteProgressLabel').textContent = 'ETAPA ' + (step + 1) + ' DE 4 · ' + ['SERVIÇO', 'RECURSOS', 'SUA IDEIA', 'REVISÃO'][step]; $('#quoteProgressBar').style.width = ((step + 1) * 25) + '%'; $('.quote-progress', quoteForm).setAttribute('aria-valuenow', String(step + 1)); quoteError.hidden = true; quoteStatus.hidden = true; if (step === 3) renderSummary(); }
  $('#quoteNext').addEventListener('click', () => { if (quoteStep === 0 && !selectedService()) { quoteError.textContent = 'Escolha um serviço para continuar.'; quoteError.hidden = false; quoteForm.querySelector('input[name="service"]').focus(); return; } if (quoteStep === 2 && !quoteIdea.value.trim()) { quoteError.textContent = 'Descreva sua ideia para continuar.'; quoteError.hidden = false; quoteIdea.focus(); return; } if (quoteStep === 0) renderFeatures(); showQuoteStep(quoteStep + 1); });
  $('#quoteBack').addEventListener('click', () => showQuoteStep(quoteStep - 1));
  quoteIdea.addEventListener('input', () => { $('#ideaCount').textContent = quoteIdea.value.length + ' / 1200 caracteres'; });
  quoteForm.addEventListener('submit', event => {
    event.preventDefault();
    if (quoteStep !== 3) return;
    const service = selectedService();
    const description = quoteIdea.value.trim();
    if (!service || !description) { showQuoteStep(!service ? 0 : 2); return; }
    const submit = $('#quoteSubmit');
    if (submit.disabled) return;
    const message = 'Olá! Conheci a TidiReis pelo site e gostaria de solicitar um orçamento.\n\nServiço: ' + service + '\nRecursos: ' + (selectedFeatures().join(', ') || 'A definir') + '\nMinha ideia: ' + description;
    const url = 'https://wa.me/5571992417737?text=' + encodeURIComponent(message);
    submit.disabled = true;
    submit.textContent = 'Abrindo WhatsApp…';
    quoteStatus.hidden = false;
    quoteStatus.replaceChildren();
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
      quoteStatus.append('Confira a nova aba do WhatsApp e toque em enviar. Se ela não abriu, ');
      const fallback = document.createElement('a');
      fallback.href = url;
      fallback.target = '_blank';
      fallback.rel = 'noopener noreferrer';
      fallback.textContent = 'abra o WhatsApp por este link';
      quoteStatus.append(fallback, '.');
    } catch (_) {
      quoteStatus.append('Seu navegador bloqueou a nova aba. ');
      const fallback = document.createElement('a');
      fallback.href = url;
      fallback.target = '_blank';
      fallback.rel = 'noopener noreferrer';
      fallback.textContent = 'Abrir WhatsApp manualmente';
      quoteStatus.append(fallback);
    } finally {
      setTimeout(() => { submit.disabled = false; submit.innerHTML = 'Enviar solicitação <span aria-hidden="true">↗</span>'; }, 2500);
    }
  });
  showQuoteStep(0);

  const terminalOutput = $('#terminalOutput'); const terminalInput = $('#terminalInput');
  const terminalHistory = [];
  let terminalHistoryIndex = 0;
  let terminalDraft = '';
  const terminalCommands = new Map([
    ['help', ['Comandos disponíveis:\nhelp · sobre · servicos · sites · sistemas · apps · design · manutencao · contato · clear · home\nUse ↑ e ↓ para recuperar comandos anteriores.']],
    ['sobre', ['A TidiReis Soluções Digitais cria experiências digitais, identidade visual e soluções de informática para negócios que querem evoluir.']],
    ['servicos', ['Nossos serviços:\n• Desenvolvimento de sites\n• Desenvolvimento de sistemas\n• Desenvolvimento de aplicativos\n• Criação de logomarcas\n• Identidade visual\n• Publicidade digital\n• Manutenção de computadores\n• Venda de peças e periféricos', '#servicos', 'Explorar serviços →']],
    ['sites', ['Desenvolvemos sites profissionais, responsivos e modernos para apresentar sua marca e facilitar o contato com clientes.', '#projetos', 'Conhecer projetos →']],
    ['sistemas', ['Criamos sistemas personalizados para organizar processos, apresentar dados e apoiar a rotina do seu negócio.', '#servicos', 'Conhecer soluções →']],
    ['apps', ['Desenvolvemos aplicativos e soluções digitais pensados para diferentes dispositivos e necessidades.', '#servicos', 'Conhecer soluções →']],
    ['design', ['Criamos logomarcas e identidades visuais para dar consistência e personalidade à sua marca.', '#servicos', 'Explorar design →']],
    ['manutencao', ['Oferecemos manutenção de computadores, diagnóstico e orientação sobre peças e periféricos.', '#servicos', 'Ver serviços →']],
    ['contato', ['Fale com a TidiReis pelo WhatsApp: (71) 99241-7737. Os canais de contato estão na seção Contato.', '#contato', 'Ir para contato →']],
    ['projetos', ['Os projetos mostrados no site são conceitos demonstrativos. Explore a vitrine para conhecer as ideias.', '#projetos', 'Ver projetos →']]
  ]);
  const terminalAliases = new Map([['services', 'servicos'], ['projects', 'projetos'], ['contact', 'contato'], ['about', 'sobre']]);
  function addTerminalEntry(command, message, link, linkText) {
    const entry = document.createElement('div'); entry.className = 'terminal-entry';
    const prompt = document.createElement('span'); prompt.className = 'terminal-entry-command'; prompt.textContent = 'tidireis@site:~$ ' + command;
    const response = document.createElement('div'); response.className = 'terminal-entry-response';
    const messageText = document.createElement('span'); messageText.textContent = message; response.append(messageText);
    if (link) { const action = document.createElement('a'); action.href = link; action.textContent = linkText; response.append(action); }
    entry.append(prompt, response); terminalOutput.append(entry);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }
  $('#terminalForm').addEventListener('submit', event => {
    event.preventDefault();
    const typed = terminalInput.value.trim();
    if (!typed) return;
    terminalHistory.push(typed);
    terminalHistoryIndex = terminalHistory.length;
    terminalDraft = '';
    terminalInput.value = '';
    const normalized = typed.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const command = terminalAliases.get(normalized) || normalized;
    if (command === 'clear') terminalOutput.replaceChildren();
    else if (command === 'home') {
      addTerminalEntry(typed, 'Voltando ao início do site...');
      window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    } else {
      const result = terminalCommands.get(command);
      if (result) addTerminalEntry(typed, ...result);
      else addTerminalEntry(typed, 'Comando não reconhecido: ' + typed + '\nDigite help para visualizar os comandos disponíveis.');
    }
    terminalInput.focus({ preventScroll: true });
  });
  terminalInput.addEventListener('keydown', event => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    if (!terminalHistory.length) return;
    event.preventDefault();
    if (event.key === 'ArrowUp') {
      if (terminalHistoryIndex === terminalHistory.length) terminalDraft = terminalInput.value;
      terminalHistoryIndex = Math.max(0, terminalHistoryIndex - 1);
    } else terminalHistoryIndex = Math.min(terminalHistory.length, terminalHistoryIndex + 1);
    terminalInput.value = terminalHistoryIndex === terminalHistory.length ? terminalDraft : terminalHistory[terminalHistoryIndex];
    terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length);
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
