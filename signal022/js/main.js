/**
 * Main — Initializes all components, handles preloader,
 * hero text phases, stat counters, contact form
 */
(function() {
  'use strict';

  // --- Preloader & ScrollSequence init ---
  const canvas = document.getElementById('scrollCanvas');
  const heroSection = document.getElementById('hero');
  const preloader = document.getElementById('preloader');
  const preloaderFill = document.getElementById('preloaderFill');
  const preloaderPercent = document.getElementById('preloaderPercent');

  // Check for reduced motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    // Show static fallback, hide hero, remove preloader
    preloader.classList.add('hidden');
    document.getElementById('staticFallback').style.display = 'block';
    heroSection.style.display = 'none';
    new ParallaxEngine();
    initStatCounters();
    initContactForm();
    return;
  }

  // Initialize scroll sequence
  const sequence = new ScrollSequence({
    canvas: canvas,
    section: heroSection,
    frameCount: 121,
    mobileFrameCount: 61,
    desktopPath: 'frames/desktop',
    mobilePath: 'frames/mobile',

    onProgress: (progress) => {
      const pct = Math.round(progress * 100);
      preloaderFill.style.width = pct + '%';
      preloaderPercent.textContent = pct + '%';
    },

    onReady: () => {
      // Small delay for polish
      setTimeout(() => {
        preloader.classList.add('hidden');
      }, 300);

      // Show initial text phase immediately
      setTimeout(() => {
        updateHeroTextPhases(0, sequence.totalFrames);
      }, 400);

      // Init parallax engine after preloader done
      setTimeout(() => {
        new ParallaxEngine();
        initStatCounters();
        initContactForm();
      }, 500);
    },

    onFrameChange: (frame, total) => {
      updateHeroTextPhases(frame, total);
    }
  });

  // If sequence is disabled (reduced motion / slow connection)
  if (sequence.disabled) {
    preloader.classList.add('hidden');
    document.getElementById('staticFallback').style.display = 'block';
    heroSection.style.display = 'none';
    new ParallaxEngine();
    initStatCounters();
    initContactForm();
  }

  // --- Hero text phase controller ---
  const heroPhases = document.querySelectorAll('.hero-text');
  const heroOverlay = document.querySelector('.hero-overlay');
  const heroBacking = document.getElementById('heroTextBacking');
  let lastHeroVisible = true;

  function updateHeroTextPhases(frame, total) {
    // Calculate which phase to show based on frame progress
    const progress = frame / (total - 1);

    // Animate the text backing — fade out + shrink toward center + blur
    if (heroBacking) {
      // Backing fully visible at 0%, gone by 25% scroll
      const backingFade = Math.max(0, 1 - progress / 0.25);
      const scale = 1 - (1 - backingFade) * 0.4; // shrinks to 60%
      const blur = (1 - backingFade) * 15; // blurs up to 15px
      heroBacking.style.opacity = backingFade;
      heroBacking.style.transform = `translateX(-50%) scale(${scale})`;
      heroBacking.style.filter = `blur(${blur}px)`;
    }

    // Phase ranges (overlap for smooth transitions)
    const phases = [
      { el: heroPhases[0], start: -0.01, peak: 0.05, end: 0.22 },  // SIGNAL 022 (visible from start)
      { el: heroPhases[1], start: 0.20,  peak: 0.32, end: 0.48 },  // Vizualna komunikacija
      { el: heroPhases[2], start: 0.45,  peak: 0.55, end: 0.70 },  // koja se pamti
      { el: heroPhases[3], start: 0.72,  peak: 0.82, end: 1.01 },  // Scroll to explore (stays)
    ];

    phases.forEach(phase => {
      if (!phase.el) return;

      let opacity = 0;
      if (progress >= phase.start && progress <= phase.end) {
        const fadeInRange = phase.peak - phase.start;
        const fadeOutRange = phase.end - phase.peak;

        if (fadeInRange > 0 && progress <= phase.peak) {
          opacity = (progress - phase.start) / fadeInRange;
        } else if (fadeOutRange > 0 && progress > phase.peak) {
          opacity = 1 - (progress - phase.peak) / fadeOutRange;
        } else {
          opacity = 1;
        }
      }

      phase.el.style.opacity = Math.max(0, Math.min(1, opacity));
    });

    // Hide hero overlay once we scroll past hero section
    const heroRect = heroSection.getBoundingClientRect();
    const pastHero = heroRect.bottom < window.innerHeight * 0.5;

    if (pastHero && lastHeroVisible) {
      heroOverlay.style.opacity = '0';
      heroOverlay.style.visibility = 'hidden';
      lastHeroVisible = false;
    } else if (!pastHero && !lastHeroVisible) {
      heroOverlay.style.opacity = '';
      heroOverlay.style.visibility = '';
      lastHeroVisible = true;
    }
  }

  // --- Stat counter animation ---
  function initStatCounters() {
    const statNumbers = document.querySelectorAll('[data-count]');
    if (!statNumbers.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => observer.observe(el));
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.count);
    const duration = 2000; // ms
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(tick);
  }

  // --- Contact form (basic client-side for demo) ---
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn = form.querySelector('.btn-submit');
      const originalText = btn.textContent;
      btn.textContent = 'Šaljemo...';
      btn.disabled = true;

      // Simulate send for demo
      setTimeout(() => {
        btn.textContent = 'Poslano!';
        btn.style.background = '#4CAF50';

        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.disabled = false;
          form.reset();
        }, 2500);
      }, 1000);
    });
  }

})();
