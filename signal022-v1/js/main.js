/* ============================================================
   Signal 022 — Main JavaScript
   Hero slideshow, portfolio filters, lightbox, scroll animations
   ============================================================ */

(function () {
  'use strict';

  // ── Hero Slideshow ──────────────────────────────────────────
  const slides = document.querySelectorAll('.hero-slide');
  const progressBars = document.querySelectorAll('.hero-progress-bar');
  let currentSlide = 0;
  let slideInterval;

  function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    progressBars[currentSlide].classList.remove('active');

    currentSlide = index;
    if (currentSlide >= slides.length) currentSlide = 0;
    if (currentSlide < 0) currentSlide = slides.length - 1;

    slides[currentSlide].classList.add('active');
    progressBars[currentSlide].classList.add('active');
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function startSlideshow() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 5000);
  }

  // Progress bar clicks
  progressBars.forEach(bar => {
    bar.addEventListener('click', () => {
      goToSlide(parseInt(bar.dataset.slide, 10));
      startSlideshow();
    });
  });

  if (slides.length > 0) {
    startSlideshow();
  }

  // ── Sticky Navigation ──────────────────────────────────────
  const nav = document.getElementById('nav');
  const hero = document.getElementById('hero');

  function updateNav() {
    if (!hero) return;
    const scrolled = window.scrollY > hero.offsetHeight * 0.3;
    nav.classList.toggle('scrolled', scrolled);
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // ── Mobile Navigation ──────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ── Portfolio Filters ──────────────────────────────────────
  const filterBtns = document.querySelectorAll('.filter-btn');
  const masonryItems = document.querySelectorAll('.masonry-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter items
      masonryItems.forEach(item => {
        const match = filter === 'all' || item.dataset.category === filter;
        if (match) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  // Service card clicks → filter portfolio
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', () => {
      const filter = card.dataset.filter;
      if (!filter) return;

      // Scroll to portfolio
      const portfolio = document.getElementById('radovi');
      if (portfolio) {
        portfolio.scrollIntoView({ behavior: 'smooth' });

        // Activate filter after scroll
        setTimeout(() => {
          const targetBtn = document.querySelector(`.filter-btn[data-filter="${filter}"]`);
          if (targetBtn) targetBtn.click();
        }, 600);
      }
    });
  });

  // ── Lightbox ───────────────────────────────────────────────
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxLabel = document.getElementById('lightboxLabel');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let lightboxItems = [];
  let lightboxIndex = 0;

  function getVisibleItems() {
    return Array.from(masonryItems).filter(item => !item.classList.contains('hidden'));
  }

  function openLightbox(index) {
    lightboxItems = getVisibleItems();
    lightboxIndex = index;

    const item = lightboxItems[lightboxIndex];
    if (!item) return;

    const img = item.querySelector('img');
    const label = item.querySelector('.masonry-item-label');

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxLabel.textContent = label ? label.textContent : '';

    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    // Small delay to let transition finish before clearing src
    setTimeout(() => {
      if (!lightbox.classList.contains('open')) {
        lightboxImg.src = '';
      }
    }, 400);
  }

  function navigateLightbox(direction) {
    lightboxIndex += direction;
    if (lightboxIndex < 0) lightboxIndex = lightboxItems.length - 1;
    if (lightboxIndex >= lightboxItems.length) lightboxIndex = 0;

    const item = lightboxItems[lightboxIndex];
    const img = item.querySelector('img');
    const label = item.querySelector('.masonry-item-label');

    lightboxImg.style.opacity = '0';
    lightboxImg.style.transform = 'scale(0.95)';

    setTimeout(() => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxLabel.textContent = label ? label.textContent : '';
      lightboxImg.style.opacity = '1';
      lightboxImg.style.transform = 'scale(1)';
    }, 150);
  }

  // Click on masonry items to open lightbox
  masonryItems.forEach(item => {
    item.addEventListener('click', () => {
      const visible = getVisibleItems();
      const index = visible.indexOf(item);
      if (index !== -1) openLightbox(index);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
  if (lightboxNext) lightboxNext.addEventListener('click', () => navigateLightbox(1));

  // Close on background click
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });

  // ── Scroll Reveal Animations ───────────────────────────────
  const revealElements = document.querySelectorAll('.reveal, .reveal-stagger');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealElements.forEach(el => revealObserver.observe(el));

  // ── Lazy load fade-in for masonry images ───────────────────
  const imageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.style.opacity = '1';
          img.style.transform = 'translateY(0)';
          imageObserver.unobserve(img);
        }
      });
    },
    { threshold: 0.05 }
  );

  masonryItems.forEach(item => {
    const img = item.querySelector('img');
    if (img) {
      img.style.opacity = '0';
      img.style.transform = 'translateY(12px)';
      img.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      imageObserver.observe(img);
    }
  });

  // ── Contact Form (Demo) ────────────────────────────────────
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      contactForm.style.opacity = '0.5';
      contactForm.style.pointerEvents = 'none';

      setTimeout(() => {
        contactForm.style.display = 'none';
        formSuccess.classList.add('show');
      }, 800);
    });
  }

  // ── Smooth scroll for anchor links ─────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const offset = nav.offsetHeight + 20;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ── Lightbox image transition styles ───────────────────────
  if (lightboxImg) {
    lightboxImg.style.transition = 'opacity 0.15s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
  }

})();
