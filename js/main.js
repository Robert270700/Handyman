// ── Utils ────────────────────────────────────────────────
const qs  = (s, c = document) => c.querySelector(s);
const qsa = (s, c = document) => [...c.querySelectorAll(s)];
const isTouch = () => window.matchMedia('(hover: none)').matches;

// ── Page Transition ──────────────────────────────────────
(function initPageTransition() {
  const overlay = document.createElement('div');
  overlay.className = 'page-overlay';
  document.body.appendChild(overlay);

  // Reveal page: slide overlay off
  requestAnimationFrame(() => requestAnimationFrame(() => {
    overlay.classList.add('is-revealed');
  }));

  // Intercept internal links
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('tel') || href.startsWith('http') || href.startsWith('//')) return;

    e.preventDefault();
    overlay.classList.remove('is-revealed');
    setTimeout(() => { window.location.href = href; }, 720);
  });
})();

// ── Custom Cursor ────────────────────────────────────────
(function initCursor() {
  if (isTouch()) return;

  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.className  = 'cursor-dot';
  ring.className = 'cursor-ring';
  document.body.append(dot, ring);

  let mx = 0, my = 0, rx = 0, ry = 0, visible = false;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;

    dot.style.transform = `translate(${mx}px, ${my}px)`;

    if (!visible) {
      dot.style.opacity = ring.style.opacity = '1';
      rx = mx; ry = my;
      visible = true;
    }
  }, { passive: true });

  // Smooth lagged ring
  (function tick() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(tick);
  })();

  // Hover state on interactive elements
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button, .service-card, [role="button"]')) {
      ring.classList.add('is-hover');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a, button, .service-card, [role="button"]')) {
      ring.classList.remove('is-hover');
    }
  });

  // Dark sections: flip cursor color
  const darkSections = qsa('.section--dark, .footer, .marquee');
  const io = new IntersectionObserver(entries => {
    const anyDark = darkSections.some(s => {
      const r = s.getBoundingClientRect();
      return r.top <= window.innerHeight / 2 && r.bottom >= window.innerHeight / 2;
    });
    ring.classList.toggle('is-dark', anyDark);
    dot.style.background = anyDark ? 'rgba(255,255,255,.8)' : '';
  }, { threshold: [0, 0.5, 1] });
  darkSections.forEach(s => io.observe(s));

  // Hide when leaving window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = ring.style.opacity = '0';
    visible = false;
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = ring.style.opacity = '1';
    visible = true;
  });
})();

// ── Magnetic Buttons ─────────────────────────────────────
(function initMagnetic() {
  if (isTouch()) return;

  qsa('.btn--primary, .btn--outline, .btn--accent').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width  / 2) * 0.3;
      const y = (e.clientY - r.top  - r.height / 2) * 0.38;
      btn.style.transition = 'transform 0.1s linear, box-shadow 0.2s, background 0.2s, border-color 0.2s';
      btn.style.transform  = `translate(${x}px, ${y}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform 0.55s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.2s, background 0.2s, border-color 0.2s';
      btn.style.transform  = 'translate(0, 0)';
    });
  });
})();

// ── Hero Parallax — Scroll + Maus, kombiniert flüssig ────
(function initHeroParallax() {
  const visual = qs('.hero-stage__visual');
  const stage  = qs('.hero-stage');
  if (!visual || !stage) return;

  let mouseX = 0, mouseY = 0;
  let scrollCur = 0, scrollTarget = 0;

  // Maus-Tracking (nur Desktop)
  if (!isTouch()) {
    document.addEventListener('mousemove', e => {
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 16;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 12;
    }, { passive: true });
  }

  // Scroll-Tracking
  window.addEventListener('scroll', () => {
    const stageH = stage.offsetHeight;
    // Nur solange Hero sichtbar
    if (window.scrollY <= stageH + 100) {
      scrollTarget = window.scrollY * 0.26;
    }
  }, { passive: true });

  // Kombinierter Lerp-Loop — gibt den "floating" Effekt
  (function tick() {
    scrollCur += (scrollTarget - scrollCur) * 0.09;

    const x = isTouch() ? 0 : mouseX;
    const y = (isTouch() ? 0 : mouseY) + scrollCur;

    visual.style.transform = `translate(${x}px, ${y}px)`;
    requestAnimationFrame(tick);
  })();
})();

// ── Marquee Injection ────────────────────────────────────
(function initMarquee() {
  const hero = qs('.hero');
  if (!hero) return;

  const items = ['München', 'Umzugshilfe', 'Möbelmontage', 'Entrümpelung', 'Wandmontage', 'Haus & Garten', 'Schnell', 'Zuverlässig', 'Faire Preise'];

  const buildItems = () => items.map(t =>
    `<div class="marquee__item"><span>${t}</span><span class="sep">·</span></div>`
  ).join('');

  // Double for seamless loop
  const inner = buildItems() + buildItems();

  const marquee = document.createElement('div');
  marquee.className = 'marquee';
  marquee.setAttribute('aria-hidden', 'true');
  marquee.innerHTML = `<div class="marquee__track">${inner}</div>`;

  hero.after(marquee);
})();

// ── Scroll Reveal ─────────────────────────────────────────
(function initScrollReveal() {
  // Hero-Content-Elemente bekommen Reveal + CSS-Stagger (via --stagger in CSS)
  qsa('.hero__label, .hero__headline, .hero__sub, .hero__actions, .hero__trust').forEach(el => {
    el.classList.add('reveal');
    io.observe(el);
  });

  const targets = [
    '.service-card',
    '.feature',
    '.step',
    '.testimonial',
    '.team-card',
    '.section-header',
    '.contact-form',
    '.contact-info',
    '.content-block',
    '.aside-card',
    '.faq-list',
    '.cta-banner__inner',
    '.page-hero__icon',
    '.legal-content',
  ];

  // Stagger siblings in grids
  qsa('.services-grid > *, .features-grid > *, .steps-grid > *, .testimonials-grid > *, .team-grid > *').forEach((el, i) => {
    el.style.setProperty('--stagger', i);
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

  qsa(targets.join(', ')).forEach(el => {
    el.classList.add('reveal');
    io.observe(el);
  });
})();

// ── Split Text Reveal ────────────────────────────────────
(function initTextSplit() {
  // Only apply to section headers (not hero which has <em> and <br>)
  qsa('.section-header h2, .page-hero h1').forEach(el => {
    // Skip if contains HTML tags
    if (/<[^>]+>/.test(el.innerHTML)) return;

    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((w, i) =>
      `<span class="anim-wrap"><span class="anim-word" style="transition-delay:${0.07 * i}s">${w}</span></span>`
    ).join(' ');

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          qsa('.anim-word', e.target).forEach(w => w.classList.add('is-visible'));
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });

    io.observe(el);
  });
})();

// ── Navigation (Fullscreen Overlay) ──────────────────────
(function initNav() {
  const nav     = qs('#nav');
  const toggle  = qs('#navToggle');
  const overlay = qs('#navOverlay');

  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  function openMenu() {
    overlay?.classList.add('open');
    nav?.classList.add('overlay-open');
    toggle?.classList.add('active');
    document.body.style.overflow = 'hidden';
    overlay?.setAttribute('aria-hidden', 'false');
  }

  function closeMenu() {
    overlay?.classList.remove('open');
    nav?.classList.remove('overlay-open');
    toggle?.classList.remove('active');
    document.body.style.overflow = '';
    overlay?.setAttribute('aria-hidden', 'true');
  }

  toggle?.addEventListener('click', () => {
    overlay?.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Close on overlay link click
  qsa('a', overlay).forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
})();


// ── FAQ Accordion ────────────────────────────────────────
(function initFAQ() {
  qsa('.faq-item__q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      qsa('.faq-item.open').forEach(el => el.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
})();

// ── Service card — subtle tilt on hover ──────────────────
(function initCardTilt() {
  if (isTouch()) return;

  qsa('.service-item').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  - 0.5) * 8;
      const y = ((e.clientY - r.top)  / r.height - 0.5) * 6;
      card.style.transform = `translateY(-4px) rotateX(${-y}deg) rotateY(${x}deg)`;
      card.style.transition = 'transform 0.08s linear, box-shadow 0.25s, border-color 0.25s, background 0.25s';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'all 0.45s var(--ease)';
    });
  });
})();
