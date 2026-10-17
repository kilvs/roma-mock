// ROMA Overseas homepage mock: theme toggle, header, menu, jobs row, nav highlight, process route.
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var header = document.getElementById('site-header');

  // Theme: light by default, the saved choice is remembered on this device.
  var themeBtn = document.querySelector('[data-theme-toggle]');
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme, animate) {
    if (animate && !reduceMotion.matches) {
      root.classList.add('theme-anim');
      window.setTimeout(function () { root.classList.remove('theme-anim'); }, 420);
    }
    if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    var label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    themeBtn.setAttribute('aria-label', label);
    themeBtn.setAttribute('title', label);
    if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#173524' : '#1D4A30');
    try { localStorage.setItem('roma-theme', theme); } catch (e) {}
  }

  if (themeBtn) {
    applyTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light', false);
    themeBtn.addEventListener('click', function () {
      applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
    });
  }

  // Menu: burger dropdown on tablet and phone.
  var menuBtn = document.querySelector('[data-menu-toggle]');
  var menu = document.getElementById('mobile-menu');

  function setMenu(open) {
    if (!menu || !menuBtn) return;
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) header.classList.remove('is-hidden');
  }

  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () { setMenu(menu.hidden); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (!menu.hidden && !header.contains(e.target)) setMenu(false);
    });
    window.matchMedia('(min-width: 1025px)').addEventListener('change', function (e) {
      if (e.matches) setMenu(false);
    });
  }

  // Header: sticky; hides on scroll down, returns on scroll up or when anything in it gets focus.
  var lastY = window.scrollY;
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-scrolled', header.getBoundingClientRect().top <= 0 && y > 0);
    if (menu && !menu.hidden) header.classList.remove('is-hidden');
    else if (y > lastY + 6 && y > 320) header.classList.add('is-hidden');
    else if (y < lastY - 6 || y <= 320) header.classList.remove('is-hidden');
    lastY = y;
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  header.addEventListener('focusin', function () { header.classList.remove('is-hidden'); });
  onScroll();

  // Jobs row: arrows page through the cards, the status line says what is in view.
  var track = document.getElementById('jobs-track');
  if (track) {
    var prev = document.querySelector('[data-carousel-prev]');
    var next = document.querySelector('[data-carousel-next]');
    var status = document.getElementById('jobs-status');
    var slides = track.children;

    var stepSize = function () {
      var first = slides[0];
      if (!first) return 0;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return first.getBoundingClientRect().width + gap;
    };
    var perView = function () {
      var w = stepSize() || 1;
      var cs = getComputedStyle(track);
      var inner = track.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
      var gap = parseFloat(cs.columnGap) || 0;
      return Math.max(1, Math.floor((inner + gap + 2) / w));
    };

    var sync = function () {
      var w = stepSize() || 1;
      var firstIndex = Math.round(track.scrollLeft / w);
      var atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      prev.disabled = track.scrollLeft < 4;
      next.disabled = atEnd;
      var count = slides.length;
      var shown = perView();
      var from = atEnd ? Math.max(1, count - shown + 1) : firstIndex + 1;
      var to = Math.min(count, from + shown - 1);
      var text = from === to ? 'Showing ' + from + ' of ' + count : 'Showing ' + from + ' to ' + to + ' of ' + count;
      if (status && status.textContent !== text) status.textContent = text;
    };

    var page = function (dir) {
      track.scrollBy({ left: dir * stepSize() * perView(), behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    };

    prev.addEventListener('click', function () { page(-1); });
    next.addEventListener('click', function () { page(1); });

    var scrollTick = false;
    track.addEventListener('scroll', function () {
      if (!scrollTick) { window.requestAnimationFrame(function () { sync(); scrollTick = false; }); scrollTick = true; }
    }, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  }

  // Nav highlight: the link for the section in the middle of the screen gets aria-current.
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav a[href^="#"]'));
  if ('IntersectionObserver' in window && navLinks.length) {
    var byId = {};
    var visible = {};
    navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting; });
      var current = null;
      Object.keys(byId).forEach(function (id) { if (visible[id]) current = id; });
      navLinks.forEach(function (a) {
        if (current && a === byId[current]) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  }

  // Process route: the line draws from Apply to Fly once, when it scrolls into view.
  var route = document.querySelector('[data-route]');
  if (route && 'IntersectionObserver' in window && !reduceMotion.matches) {
    var box = route.getBoundingClientRect();
    if (box.top > window.innerHeight) {
      route.classList.add('is-pending');
      var drawn = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          route.classList.remove('is-pending');
          drawn.disconnect();
        }
      }, { threshold: 0.4 });
      drawn.observe(route);
    }
  }
})();
