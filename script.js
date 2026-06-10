/**
 * portfolio/script.js
 * Módulos: ThemeManager | TypewriterEffect | ScrollReveal | NavBehavior | ContactForm
 */

/* ─── 1. Theme Manager ───────────────────────────────────── */
const ThemeManager = (() => {
  const KEY = 'portfolio-theme';
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');

  const THEMES = { DARK: 'dark', LIGHT: 'light' };

  const getSystemPref = () =>
    window.matchMedia('(prefers-color-scheme: light)').matches
      ? THEMES.LIGHT
      : THEMES.DARK;

  const getSaved = () => localStorage.getItem(KEY);

  const apply = (theme) => {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
  };

  const toggle_ = () => {
    const current = root.getAttribute('data-theme');
    apply(current === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK);
  };

  const init = () => {
    apply(getSaved() || getSystemPref());
    toggle?.addEventListener('click', toggle_);
  };

  return { init };
})();


/* ─── 2. Typewriter Effect ───────────────────────────────── */
const TypewriterEffect = (() => {
  const PHRASES = [
    'Front-End Developer',
    'Estudante de TI',
    'Apaixonado por código',
    'Buscando estágio 🚀',
  ];

  let phraseIdx = 0;
  let charIdx   = 0;
  let deleting  = false;
  const TYPING_SPEED  = 90;
  const DELETE_SPEED  = 50;
  const PAUSE_END     = 1800;
  const PAUSE_START   = 350;

  const el = document.getElementById('typewriterText');

  const tick = () => {
    if (!el) return;

    const phrase = PHRASES[phraseIdx];

    if (!deleting) {
      el.textContent = phrase.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === phrase.length) {
        deleting = true;
        setTimeout(tick, PAUSE_END);
        return;
      }
      setTimeout(tick, TYPING_SPEED);
    } else {
      el.textContent = phrase.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % PHRASES.length;
        setTimeout(tick, PAUSE_START);
        return;
      }
      setTimeout(tick, DELETE_SPEED);
    }
  };

  const init = () => tick();

  return { init };
})();


/* ─── 3. Scroll Reveal (Intersection Observer) ───────────── */
const ScrollReveal = (() => {
  const OPTIONS = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.12,
  };

  const callback = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Stagger children inside the same parent
        const siblings = Array.from(
          entry.target.parentElement?.querySelectorAll('.reveal') ?? []
        );
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${idx * 80}ms`;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  };

  const init = () => {
    const targets = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      // Fallback: show everything immediately
      targets.forEach((el) => el.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver(callback, OPTIONS);
    targets.forEach((el) => observer.observe(el));
  };

  return { init };
})();


/* ─── 4. Nav Behavior ────────────────────────────────────── */
const NavBehavior = (() => {
  const header = document.getElementById('header');
  const burger = document.getElementById('navBurger');
  const navList = document.getElementById('navList');
  const navLinks = document.querySelectorAll('.nav__link');

  const handleScroll = () => {
    header?.classList.toggle('scrolled', window.scrollY > 20);
  };

  const toggleMenu = () => {
    const open = navList?.classList.toggle('open');
    burger?.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  const closeMenu = () => {
    navList?.classList.remove('open');
    burger?.classList.remove('open');
    document.body.style.overflow = '';
  };

  const init = () => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // run once on load
    burger?.addEventListener('click', toggleMenu);
    navLinks.forEach((link) => link.addEventListener('click', closeMenu));
  };

  return { init };
})();


/* ─── 5. Contact Form Validation ─────────────────────────── */
const ContactForm = (() => {
  const VALIDATORS = {
    name: (v) =>
      v.trim().length < 2 ? 'Por favor, insira seu nome completo.' : '',
    email: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
        ? ''
        : 'Insira um e-mail válido.',
    message: (v) =>
      v.trim().length < 15 ? 'Sua mensagem deve ter ao menos 15 caracteres.' : '',
  };

  const getField = (id) => document.getElementById(id);
  const getError = (id) => document.getElementById(`${id}Error`);

  const validate = (id) => {
    const field  = getField(id);
    const error  = getError(id);
    if (!field || !error) return true;

    const msg = VALIDATORS[id]?.(field.value) ?? '';
    error.textContent = msg;
    field.classList.toggle('error', !!msg);
    return !msg;
  };

  const validateAll = () =>
    ['name', 'email', 'message'].map(validate).every(Boolean);

  // Live validation on blur
  const attachLiveValidation = () => {
    ['name', 'email', 'message'].forEach((id) => {
      getField(id)?.addEventListener('blur', () => validate(id));
      getField(id)?.addEventListener('input', () => {
        if (getField(id)?.classList.contains('error')) validate(id);
      });
    });
  };

  const simulateSend = () =>
    new Promise((resolve) => setTimeout(resolve, 1400));

  const showSuccess = (msg) => {
    const el = document.getElementById('formSuccess');
    if (el) el.textContent = msg;
  };

  const init = () => {
    const form = document.getElementById('contactForm');
    if (!form) return;

    attachLiveValidation();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      showSuccess('');

      if (!validateAll()) return;

      const btn = form.querySelector('button[type="submit"]');
      btn?.classList.add('loading');

      try {
        await simulateSend();
        showSuccess('✓ Mensagem enviada com sucesso! Em breve entrarei em contato.');
        form.reset();
        ['name', 'email', 'message'].forEach((id) => {
          getField(id)?.classList.remove('error');
          const err = getError(id);
          if (err) err.textContent = '';
        });
      } catch {
        showSuccess('Ops! Algo deu errado. Tente novamente.');
      } finally {
        btn?.classList.remove('loading');
      }
    });
  };

  return { init };
})();


/* ─── 6. Bootstrap ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  TypewriterEffect.init();
  ScrollReveal.init();
  NavBehavior.init();
  ContactForm.init();
});
