/* TidiReis — progressive enhancements without external dependencies. */
(() => {
  'use strict';
  const company = Object.freeze({ phone: '5571992417737', name: 'TidiReis Soluções Digitais' });
  const whatsapp = message => 'https://wa.me/' + company.phone + '?text=' + encodeURIComponent(message);
  const messages = {
    proposta: 'Olá! Conheci a TidiReis pelo site e gostaria de solicitar um orçamento.',
    duvida: 'Olá! Conheci a TidiReis pelo site e tenho uma dúvida sobre os serviços.'
  };
  document.querySelectorAll('[data-wa]').forEach(link => {
    link.href = whatsapp(messages[link.dataset.wa] || messages.proposta);
  });
  document.querySelectorAll('[data-wa-service]').forEach(link => {
    link.href = whatsapp('Olá! Conheci a TidiReis pelo site e gostaria de um orçamento para ' + link.dataset.waService + '.');
  });

  const header = document.querySelector('.site-header');
  const progress = document.getElementById('scrollLine');
  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...document.querySelectorAll('.nav-link')];
  const backTop = document.getElementById('backTop');
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 20);
      backTop.hidden = y < 800;
      progress.style.width = Math.min(100, y / Math.max(1, document.documentElement.scrollHeight - window.innerHeight) * 100) + '%';
      let current = 'inicio';
      sections.forEach(section => { if (section.getBoundingClientRect().top <= window.innerHeight * .34) current = section.id; });
      navLinks.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === '#' + current));
      ticking = false;
    });
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));

  const heroVisual = document.querySelector('.hero');
  if (matchMedia('(hover:hover) and (pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let glowFrame = 0;
    heroVisual.addEventListener('pointermove', event => {
      if (glowFrame) return;
      glowFrame = requestAnimationFrame(() => {
        const bounds = heroVisual.getBoundingClientRect();
        heroVisual.style.setProperty('--pointer-x', (event.clientX - bounds.left) + 'px');
        heroVisual.style.setProperty('--pointer-y', (event.clientY - bounds.top) + 'px');
        glowFrame = 0;
      });
    }, { passive: true });
  }

  const toggle = document.getElementById('menuToggle');
  const mobile = document.getElementById('mobileNav');
  const setOpen = open => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    mobile.hidden = !open;
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  mobile.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') setOpen(false); });
  document.addEventListener('click', event => { if (!header.contains(event.target)) setOpen(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 920) setOpen(false); }, { passive: true });

  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -35px 0px', threshold: .08 });
    reveals.forEach(element => observer.observe(element));
  } else reveals.forEach(element => element.classList.add('is-visible'));
  document.getElementById('year').textContent = new Date().getFullYear();

  const installButton = document.getElementById('installButton');
  const installDialog = document.getElementById('installDialog');
  const isStandalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let deferredInstall = null;
  if (isIOS && !isStandalone) installButton.hidden = false;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstall = event;
    if (!isStandalone) installButton.hidden = false;
  });
  installButton.addEventListener('click', async () => {
    if (deferredInstall) {
      deferredInstall.prompt();
      await deferredInstall.userChoice;
      deferredInstall = null;
      installButton.hidden = true;
    } else if (isIOS) installDialog.showModal();
  });
  document.getElementById('closeInstall').addEventListener('click', () => installDialog.close());
  window.addEventListener('appinstalled', () => { installButton.hidden = true; });
  const updateToast = document.getElementById('updateToast');
  let waitingWorker = null;
  document.getElementById('dismissUpdate').addEventListener('click', () => { updateToast.hidden = true; });
  document.getElementById('updateButton').addEventListener('click', () => {
    if (waitingWorker) waitingWorker.postMessage({ type: 'SKIP_WAITING' });
  });
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('./sw.js');
        const showUpdate = () => {
          if (registration.waiting && navigator.serviceWorker.controller) {
            waitingWorker = registration.waiting;
            updateToast.hidden = false;
          }
        };
        showUpdate();
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          if (worker) worker.addEventListener('statechange', showUpdate);
        });
        let refreshed = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!refreshed) { refreshed = true; location.reload(); }
        });
      } catch (error) {
        console.warn('PWA indisponível:', error);
      }
    });
  }
})();
