/* ============================================================
   SmartCampus Research — script.js
   Vanilla JS only. Handles: smooth scroll, active nav + sliding
   indicator, scroll progress bar, fade/stagger-in on scroll,
   animated stat counters, hero parallax orbs, card tilt + shine,
   button ripple, timeline progress, back-to-top with progress
   ring, mobile menu.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
     Mobile hamburger menu
     ---------------------------------------------------------- */
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navMenu.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ----------------------------------------------------------
     Smooth scroll for in-page nav links
     ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });

      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  /* ----------------------------------------------------------
     Stagger delay: give each item inside a grid/list its own
     --i index so the CSS fade-in transition-delay cascades.
     ---------------------------------------------------------- */
  const staggerContainers = document.querySelectorAll(
    '.findings-grid, .recommend-grid, .team-grid, .about-grid, .analysis-columns, .conclusion-grid, .ref-columns, .hero-stats'
  );

  staggerContainers.forEach((container) => {
    Array.from(container.children).forEach((child, index) => {
      child.style.setProperty('--i', index);
    });
  });

  /* ----------------------------------------------------------
     Active nav link highlighting + sliding indicator
     ---------------------------------------------------------- */
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const navIndicator = document.getElementById('nav-indicator');

  const moveIndicator = (link) => {
    if (!navIndicator || !link || !navMenu) return;
    const menuRect = navMenu.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    navIndicator.style.width = `${linkRect.width}px`;
    navIndicator.style.transform = `translateX(${linkRect.left - menuRect.left}px)`;
    navIndicator.classList.add('is-active');
  };

  const setActiveLink = (id) => {
    let activeLink = null;
    navLinks.forEach((link) => {
      const match = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('active', match);
      if (match) activeLink = link;
    });
    if (activeLink) moveIndicator(activeLink);
  };

  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveLink(visible[0].target.id);
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    sections.forEach((section) => navObserver.observe(section));
  }

  window.addEventListener('resize', () => {
    const current = navLinks.find((l) => l.classList.contains('active'));
    if (current) moveIndicator(current);
  });

  /* ----------------------------------------------------------
     Fade-in / stagger-in on scroll
     ---------------------------------------------------------- */
  const fadeEls = document.querySelectorAll('.fade-in');

  if (fadeEls.length && 'IntersectionObserver' in window) {
    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    fadeEls.forEach((el) => fadeObserver.observe(el));
  } else {
    fadeEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ----------------------------------------------------------
     Animated stat counters (hero)
     ---------------------------------------------------------- */
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');

  const animateCount = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    const suffix = el.getAttribute('data-suffix') || '';

    if (prefersReducedMotion) {
      el.textContent = target + suffix;
      return;
    }

    const duration = 1300;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      const value = Math.round(eased * target);
      el.textContent = value + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target + suffix;
      }
    };

    requestAnimationFrame(tick);
  };

  if (statNumbers.length && 'IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );

    statNumbers.forEach((el) => countObserver.observe(el));
  } else {
    statNumbers.forEach((el) => animateCount(el));
  }

  /* ----------------------------------------------------------
     Hero orb parallax (subtle, follows cursor within hero)
     ---------------------------------------------------------- */
  const hero = document.getElementById('hero');
  const heroOrbs = document.getElementById('hero-orbs');

  if (hero && heroOrbs && !prefersReducedMotion) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      heroOrbs.style.transform = `translate(${relX * -24}px, ${relY * -24}px)`;
    });

    hero.addEventListener('mouseleave', () => {
      heroOrbs.style.transform = 'translate(0, 0)';
    });
  }

  /* ----------------------------------------------------------
     Card tilt effect (finding + recommendation cards)
     ---------------------------------------------------------- */
  const tiltCards = document.querySelectorAll('.finding-card, .recommend-card');

  if (!prefersReducedMotion) {
    tiltCards.forEach((card) => {
      const maxTilt = 6;

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        const relY = (e.clientY - rect.top) / rect.height - 0.5;
        const rotateY = relX * maxTilt * 2;
        const rotateX = relY * -maxTilt * 2;
        card.style.transform =
          `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
      });
    });
  }

  /* ----------------------------------------------------------
     Button ripple effect
     ---------------------------------------------------------- */
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if (prefersReducedMotion) return;

      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement('span');

      ripple.className = 'btn-ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  /* ----------------------------------------------------------
     Chart embeds: reveal iframe only once a real data-src is
     provided (keeps the placeholder showing until then).
     ---------------------------------------------------------- */
  document.querySelectorAll('.chart-embed').forEach((wrap) => {
    const iframe = wrap.querySelector('iframe[data-src]');
    if (!iframe) return;

    const src = iframe.getAttribute('data-src');
    if (src && src.trim() !== '') {
      iframe.setAttribute('src', src.trim());
      wrap.classList.add('has-chart');
    }
  });

  /* ----------------------------------------------------------
     Timeline fill progress (as the section scrolls by)
     ---------------------------------------------------------- */
  const timeline = document.getElementById('timeline');
  const timelineProgress = document.getElementById('timeline-progress');

  const updateTimelineProgress = () => {
    if (!timeline || !timelineProgress) return;

    const rect = timeline.getBoundingClientRect();
    const viewportCenter = window.innerHeight * 0.75;

    let ratio = (viewportCenter - rect.top) / rect.height;
    ratio = Math.max(0, Math.min(1, ratio));

    timelineProgress.style.height = `${ratio * 100}%`;
  };

  /* ----------------------------------------------------------
     Scroll progress bar (header) + back-to-top ring + button
     ---------------------------------------------------------- */
  const backToTop = document.getElementById('back-to-top');
  const progressBar = document.getElementById('progress-bar');
  const bttProgress = document.getElementById('btt-progress');
  const RING_CIRCUMFERENCE = 2 * Math.PI * 19; // r = 19

  if (bttProgress) {
    bttProgress.style.strokeDasharray = `${RING_CIRCUMFERENCE}`;
    bttProgress.style.strokeDashoffset = `${RING_CIRCUMFERENCE}`;
  }

  const header = document.getElementById('site-header');

  let ticking = false;

  const onScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollRatio = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;

    if (progressBar) {
      progressBar.style.width = `${scrollRatio * 100}%`;
    }

    if (bttProgress) {
      bttProgress.style.strokeDashoffset = `${RING_CIRCUMFERENCE * (1 - scrollRatio)}`;
    }

    if (backToTop) {
      backToTop.classList.toggle('is-visible', scrollTop > 480);
    }

    if (header) {
      header.style.boxShadow = scrollTop > 8
        ? '0 6px 20px rgba(30, 58, 138, 0.08)'
        : 'none';
    }

    updateTimelineProgress();

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

});