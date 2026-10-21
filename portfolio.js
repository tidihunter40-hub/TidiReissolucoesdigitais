(() => {
  const grid = document.getElementById('portfolioGrid');
  const filters = document.getElementById('portfolioFilters');
  const dialog = document.getElementById('portfolioDialog');
  const dialogContent = document.getElementById('portfolioDialogContent');
  if (!grid || !filters || !dialog || !dialogContent) return;

  const labels = { sites: 'SITES', sistemas: 'SISTEMAS', aplicativos: 'APLICATIVOS', lojas: 'LOJAS VIRTUAIS', plataformas: 'PLATAFORMAS' };
  const order = ['sites', 'sistemas', 'aplicativos', 'lojas', 'plataformas'];
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  let projects = [];
  let report = {};
  let active = 'todos';
  let returnFocus = null;

  function asset(project, device) {
    return report[project.id]?.[device]?.ok ? `public/portfolio/${project.id}-${device}.webp` : null;
  }

  function screen(project, device, detailed = false) {
    const file = asset(project, device);
    const cls = device === 'desktop' ? 'portfolio-monitor' : 'portfolio-phone';
    if (!file) return detailed ? `<div class="portfolio-unavailable">Captura ${device === 'desktop' ? 'desktop' : 'mobile'} indisponível</div>` : '';
    return `<div class="${cls}"><img src="${file}" alt="Captura real da versão ${device === 'desktop' ? 'desktop' : 'mobile'} de ${escapeHtml(project.name)}" ${detailed ? '' : 'loading="lazy"'} width="${device === 'desktop' ? 1440 : 390}" height="${device === 'desktop' ? 900 : 844}"></div>`;
  }

  function card(project, index) {
    const desktop = asset(project, 'desktop');
    const mobile = asset(project, 'mobile');
    return `<article class="portfolio-card" data-category="${project.category}">
      <div class="portfolio-card-visual ${desktop ? '' : 'is-unavailable'}">
        <span class="portfolio-card-number">${String(index + 1).padStart(2, '0')} / 12</span>
        ${desktop ? screen(project, 'desktop') : '<div class="portfolio-image-status">Captura pública indisponível</div>'}
        ${mobile ? screen(project, 'mobile') : ''}
      </div>
      <div class="portfolio-card-body"><span class="portfolio-category">${labels[project.category]}</span><h3>${escapeHtml(project.name)}</h3><p>${escapeHtml(project.description)}</p>${report[project.id]?.note ? `<span class="portfolio-note">${escapeHtml(report[project.id].note)}</span>` : ''}
        <div class="portfolio-card-actions"><a href="${escapeHtml(project.url)}" target="_blank" rel="noopener noreferrer" aria-label="Visualizar ${escapeHtml(project.name)} em nova aba">Visualizar projeto <span aria-hidden="true">↗</span></a><button type="button" data-details="${project.id}" aria-label="Detalhes de ${escapeHtml(project.name)}">Detalhes</button></div>
      </div>
    </article>`;
  }

  function render() {
    const visible = active === 'todos' ? projects : projects.filter(project => project.category === active);
    grid.innerHTML = visible.map(project => card(project, projects.indexOf(project))).join('');
    filters.querySelectorAll('button').forEach(button => {
      const selected = button.dataset.filter === active;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  function openDetails(project) {
    returnFocus = document.activeElement;
    dialogContent.innerHTML = `<div class="portfolio-dialog-top"><span class="portfolio-category">${labels[project.category]}</span><button type="button" class="portfolio-close" aria-label="Fechar detalhes">×</button></div>
      <h2 id="portfolioDialogTitle">${escapeHtml(project.name)}</h2><p>${escapeHtml(project.description)}</p>${report[project.id]?.note ? `<p class="portfolio-dialog-note">${escapeHtml(report[project.id].note)}</p>` : ''}
      <div class="portfolio-dialog-screens"><div><span>DESKTOP · 1440 × 900</span>${screen(project, 'desktop', true)}</div><div><span>CELULAR · 390 × 844</span>${screen(project, 'mobile', true)}</div></div>
      <a class="portfolio-dialog-link" href="${escapeHtml(project.url)}" target="_blank" rel="noopener noreferrer">Visualizar projeto <span aria-hidden="true">↗</span></a>`;
    dialog.showModal();
    dialogContent.querySelector('.portfolio-close').focus();
  }

  filters.addEventListener('click', event => {
    const button = event.target.closest('button[data-filter]');
    if (!button) return;
    active = button.dataset.filter;
    render();
  });
  grid.addEventListener('click', event => {
    const button = event.target.closest('button[data-details]');
    if (button) openDetails(projects.find(project => project.id === button.dataset.details));
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog || event.target.closest('.portfolio-close')) dialog.close();
  });
  dialog.addEventListener('close', () => returnFocus?.focus());

  Promise.all([
    fetch('portfolio-projects.json').then(response => { if (!response.ok) throw new Error('Projetos indisponíveis'); return response.json(); }),
    fetch('public/portfolio/relatorio.json').then(response => response.ok ? response.json() : { projects: {} }).catch(() => ({ projects: {} })),
  ]).then(([data, results]) => {
    projects = data;
    report = results.projects || {};
    const available = order.filter(category => projects.some(project => project.category === category));
    filters.innerHTML = ['todos', ...available].map(category => `<button type="button" data-filter="${category}" aria-pressed="${category === 'todos'}" class="${category === 'todos' ? 'is-active' : ''}">${category === 'todos' ? 'TODOS' : labels[category]}</button>`).join('');
    render();
  }).catch(() => { grid.innerHTML = '<p class="portfolio-loading">Não foi possível carregar os projetos.</p>'; });
})();
