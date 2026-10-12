'use strict';
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const progress = document.querySelector('.reading-progress');
  const landscape = document.querySelector('.landscape');
  const hero = document.querySelector('.hero');
  const links = [...document.querySelectorAll('nav a')];
  const sections = links.map(link => document.querySelector(link.getAttribute('href')));
  document.querySelector('#year').textContent = new Date().getFullYear();

  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const reveals = [...document.querySelectorAll('.reveal')];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
    reveals.forEach(element => observer.observe(element));
    document.documentElement.classList.add('motion-ready');
  }

  let framePending = false;
  function updateScroll() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0})`;
    if (!reduceMotion.matches && hero.getBoundingClientRect().bottom > 0) {
      landscape.style.transform = `translateY(${Math.min(window.scrollY * 0.12, 55)}px)`;
    } else if (reduceMotion.matches) {
      landscape.style.transform = '';
    }
    let active = -1;
    sections.forEach((section, index) => {
      if (section.getBoundingClientRect().top <= window.innerHeight * 0.4) active = index;
    });
    links.forEach((link, index) => {
      if (index === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    framePending = false;
  }
  function requestUpdate() {
    if (!framePending) {
      framePending = true;
      window.requestAnimationFrame(updateScroll);
    }
  }
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  reduceMotion.addEventListener('change', () => {
    if (reduceMotion.matches) document.documentElement.classList.remove('motion-ready');
    requestUpdate();
  });
  updateScroll();
})();
