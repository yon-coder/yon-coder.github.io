/**
 * script.js — Portfólio Rafael Mastrocinque (yon-coder)
 * Módulos: ThemeManager | TypewriterEffect | ScrollReveal | NavBehavior | ContactForm
 */

'use strict';

/* ═══════════════════════════════════════════════════════════
   1. THEME MANAGER
   Persiste preferência no localStorage; fallback ao sistema.
   ═══════════════════════════════════════════════════════════ */
const ThemeManager = (() => {
  const STORAGE_KEY = 'rafael-portfolio-theme';
  const DARK  = 'dark';
  const LIGHT = 'light';
  const root  = document.documentElement;
  const btn   = document.getElementById('themeToggle');

  const getSystem = () =>
    window.matchMedia('(prefers-color-scheme: light)').matches ? LIGHT : DARK;

  const apply = (theme) => {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  };

  const toggle = () => {
    const current = root.getAttribute('data-theme');
    apply(current === DARK ? LIGHT : DARK);
  };

  const init = () => {
    apply(localStorage.getItem(STORAGE_KEY) ?? getSystem());
    btn?.addEventListener('click', toggle);
  };

  return { init };
})();


/* ═══════════════════════════════════════════════════════════
   2. TYPEWRITER EFFECT
   Digita e apaga frases em loop com velocidades distintas.
   ═══════════════════════════════════════════════════════════ */
const TypewriterEffect = (() => {
  const PHRASES = [
    'Desenvolvedor Full Stack',
    'Python Developer',
    'Aspirante a Cibersegurança',
    'Estudante ENIAC · 3º Técnico',
    'Automação & Scripts',
  ];

  const TYPE_SPEED   = 88;
  const DELETE_SPEED = 48;
  const PAUSE_AFTER  = 1900;
  const PAUSE_BEFORE = 340;

  let phraseIdx = 0;
  let charIdx   = 0;
  let deleting  = false;

  const el = document.getElementById('typewriterText');

  const tick = () => {
    if (!el) return;

    const phrase = PHRASES[phraseIdx];

    if (!deleting) {
      el.textContent = phrase.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === phrase.length) {
        deleting = true;
        setTimeout(tick, PAUSE_AFTER);
        return;
      }
      setTimeout(tick, TYPE_SPEED);
    } else {
      el.textContent = phrase.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting  = false;
        phraseIdx = (phraseIdx + 1) % PHRASES.length;
        setTimeout(tick, PAUSE_BEFORE);
        return;
      }
      setTimeout(tick, DELETE_SPEED);
    }
  };

  const init = () => tick();

  return { init };
})();


/* ═══════════════════════════════════════════════════════════
   3. SCROLL REVEAL
   Intersection Observer com stagger por ordem no pai.
   ═══════════════════════════════════════════════════════════ */
const ScrollReveal = (() => {
  const OPTIONS = {
    root: null,
    rootMargin: '0px 0px -55px 0px',
    threshold: 0.11,
  };

  const onIntersect = (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      // Stagger baseado na posição entre irmãos .reveal
      const siblings = Array.from(
        entry.target.parentElement?.querySelectorAll('.reveal') ?? []
      );
      const idx = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = `${idx * 75}ms`;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  };

  const init = () => {
    const targets = document.querySelectorAll('.reveal');

    // Fallback para browsers sem suporte
    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(onIntersect, OPTIONS);
    targets.forEach((el) => observer.observe(el));
  };

  return { init };
})();


/* ═══════════════════════════════════════════════════════════
   4. NAV BEHAVIOR
   Header glassmorphism ao scroll + menu mobile clip-path.
   ═══════════════════════════════════════════════════════════ */
const NavBehavior = (() => {
  const header  = document.getElementById('header');
  const burger  = document.getElementById('navBurger');
  const navList = document.getElementById('navList');
  const links   = document.querySelectorAll('.nav__link');

  const onScroll = () =>
    header?.classList.toggle('scrolled', window.scrollY > 18);

  const openMenu = () => {
    navList?.classList.add('open');
    burger?.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    navList?.classList.remove('open');
    burger?.classList.remove('open');
    document.body.style.overflow = '';
  };

  const toggleMenu = () =>
    navList?.classList.contains('open') ? closeMenu() : openMenu();

  const init = () => {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // estado inicial

    burger?.addEventListener('click', toggleMenu);
    links.forEach((l) => l.addEventListener('click', closeMenu));
  };

  return { init };
})();


/* ═══════════════════════════════════════════════════════════
   5. CONTACT FORM
   Validação em tempo real + simulação de envio assíncrono.
   ═══════════════════════════════════════════════════════════ */
const ContactForm = (() => {
  /* Regras de validação por campo */
  const RULES = {
    name:    (v) => v.trim().length < 2
                    ? 'Por favor, informe seu nome completo.'
                    : '',
    email:   (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
                    ? ''
                    : 'Insira um endereço de e-mail válido.',
    message: (v) => v.trim().length < 15
                    ? 'Sua mensagem deve ter pelo menos 15 caracteres.'
                    : '',
  };

  const field = (id)  => document.getElementById(id);
  const error = (id)  => document.getElementById(`${id}Error`);

  /* Valida um campo e exibe/limpa a mensagem de erro */
  const validateField = (id) => {
    const el  = field(id);
    const err = error(id);
    if (!el || !err) return true;

    const msg = RULES[id]?.(el.value) ?? '';
    err.textContent = msg;
    el.classList.toggle('error', !!msg);
    return !msg;
  };

  /* Valida todos os campos e retorna true se tudo OK */
  const validateAll = () =>
    ['name', 'email', 'message'].map(validateField).every(Boolean);

  /* Valida ao perder foco e limpa erro ao corrigir */
  const bindLiveValidation = () => {
    ['name', 'email', 'message'].forEach((id) => {
      field(id)?.addEventListener('blur', () => validateField(id));
      field(id)?.addEventListener('input', () => {
        if (field(id)?.classList.contains('error')) validateField(id);
      });
    });
  };

  /* Simula requisição ao servidor (1.4s) */
  const fakeRequest = () =>
    new Promise((resolve) => setTimeout(resolve, 1400));

  const setSuccess = (msg) => {
    const el = document.getElementById('formSuccess');
    if (el) el.textContent = msg;
  };

  const resetForm = (form) => {
    form.reset();
    ['name', 'email', 'message'].forEach((id) => {
      field(id)?.classList.remove('error');
      const err = error(id);
      if (err) err.textContent = '';
    });
  };

  const init = () => {
    const form = document.getElementById('contactForm');
    if (!form) return;

    bindLiveValidation();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      setSuccess('');

      if (!validateAll()) return;

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn?.classList.add('loading');

      try {
        await fakeRequest();
        setSuccess('✓ Mensagem enviada! Rafael entrará em contato em breve.');
        resetForm(form);
      } catch {
        setSuccess('Ops! Algo deu errado. Tente novamente mais tarde.');
      } finally {
        submitBtn?.classList.remove('loading');
      }
    });
  };

  return { init };
})();


/* ═══════════════════════════════════════════════════════════
   BOOTSTRAP — inicializa todos os módulos após o DOM carregar
   ═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  TypewriterEffect.init();
  ScrollReveal.init();
  NavBehavior.init();
  ContactForm.init();
});