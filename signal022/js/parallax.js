/**
 * Parallax — Scroll-driven effects for all content sections
 * Handles: fade reveals, parallax Y offset, filmstrip tracks,
 * yacht Ken Burns, stat counter, nav dots
 */
class ParallaxEngine {
  constructor() {
    this.sections = [];
    this.filmstrips = [];
    this.navDots = [];
    this.rafId = null;
    this.vh = window.innerHeight;

    // iOS 100vh fix
    this.setVH();
    window.addEventListener('resize', () => {
      this.vh = window.innerHeight;
      this.setVH();
    });

    this.initFadeElements();
    this.initServiceCards();
    this.initFilmstrips();
    this.initYachtBg();
    this.initNavDots();
    this.initScrollProgress();

    this.bindScroll();
  }

  setVH() {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  }

  // --- Fade-in on scroll (IntersectionObserver) ---
  initFadeElements() {
    const fadeEls = document.querySelectorAll('[data-parallax-fade]');
    if (!fadeEls.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    fadeEls.forEach(el => observer.observe(el));
  }

  // --- Service cards staggered reveal ---
  initServiceCards() {
    const cards = document.querySelectorAll('.service-card');
    if (!cards.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay || 0) * 100;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    });

    cards.forEach(card => observer.observe(card));
  }

  // --- Filmstrip horizontal scroll ---
  initFilmstrips() {
    this.filmstrips = Array.from(document.querySelectorAll('.filmstrip-track')).map(track => {
      const inner = track.querySelector('.filmstrip-inner');
      const speed = parseFloat(track.dataset.speed) || 1;
      const direction = parseInt(track.dataset.direction) || 1;
      return { track, inner, speed, direction, currentX: 0 };
    });
  }

  updateFilmstrips() {
    const portfolioSection = document.getElementById('portfolio');
    if (!portfolioSection) return;

    const rect = portfolioSection.getBoundingClientRect();
    const sectionTop = rect.top;
    const sectionHeight = rect.height;

    // Only animate when section is in or near viewport
    if (sectionTop > this.vh || sectionTop + sectionHeight < 0) return;

    // Progress through the section
    const progress = Math.max(0, Math.min(1, -sectionTop / (sectionHeight - this.vh)));

    const isMobile = window.innerWidth < 768;

    this.filmstrips.forEach(strip => {
      // Gentler parallax on mobile (user can also swipe)
      const maxTranslate = strip.inner.scrollWidth * (isMobile ? 0.08 : 0.35);
      const targetX = progress * maxTranslate * strip.speed * strip.direction;

      // Lerp for smoothness
      strip.currentX += (targetX - strip.currentX) * 0.08;
      strip.inner.style.transform = `translateX(${-strip.currentX}px)`;
    });
  }

  // --- Yacht background Ken Burns (parallax zoom) ---
  initYachtBg() {
    this.yachtBg = document.querySelector('.yacht-bg img');
    this.yachtSection = document.getElementById('yacht');
  }

  updateYachtBg() {
    if (!this.yachtBg || !this.yachtSection) return;

    const rect = this.yachtSection.getBoundingClientRect();
    if (rect.top > this.vh || rect.bottom < 0) return;

    const progress = Math.max(0, Math.min(1,
      (this.vh - rect.top) / (this.vh + rect.height)
    ));

    // Scale from 1.1 to 1.25, slight pan
    const scale = 1.1 + progress * 0.15;
    const panX = progress * 3; // subtle horizontal drift
    this.yachtBg.style.transform = `scale(${scale}) translateX(${panX}%)`;
  }

  // --- Yacht gallery items parallax scale ---
  initYachtGallery() {
    // Handled via IntersectionObserver in initFadeElements
  }

  // --- Nav dots active state ---
  initNavDots() {
    this.navDots = Array.from(document.querySelectorAll('.nav-dot'));
    this.navSections = this.navDots.map(dot => {
      const sectionId = dot.dataset.section;
      return document.getElementById(sectionId);
    });

    // Click to scroll
    this.navDots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        const section = this.navSections[i];
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  updateNavDots() {
    const scrollY = window.scrollY;
    const halfVh = this.vh / 2;

    let activeIndex = 0;
    this.navSections.forEach((section, i) => {
      if (!section) return;
      const top = section.offsetTop;
      if (scrollY + halfVh >= top) {
        activeIndex = i;
      }
    });

    this.navDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === activeIndex);
    });
  }

  // --- Scroll progress bar ---
  initScrollProgress() {
    this.progressBar = document.getElementById('scrollProgress');
  }

  updateScrollProgress() {
    if (!this.progressBar) return;
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollY / maxScroll) * 100;
    this.progressBar.style.width = `${progress}%`;
  }

  // --- Main scroll loop ---
  bindScroll() {
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateFilmstrips();
          this.updateYachtBg();
          this.updateNavDots();
          this.updateScrollProgress();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Initial update
    this.updateFilmstrips();
    this.updateNavDots();
    this.updateScrollProgress();
  }
}
