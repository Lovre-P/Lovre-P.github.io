// ===== SCROLL-DRIVEN ANIMATIONS =====
class ScrollEffects {
  constructor() {
    this.scrollPosition = 0;
    this.ticking = false;
    this.parallaxElements = [];
    this.revealElements = [];
    
    this.init();
  }
  
  init() {
    this.setupParallaxElements();
    this.setupRevealElements();
    this.setupScrollListeners();
    this.setupGSAPScrollTriggers();
  }
  
  setupParallaxElements() {
    // Define parallax elements with their speeds
    const parallaxConfig = [
      { selector: '.hero-background', speed: 0.5 },
      { selector: '.hero-particles', speed: 0.3 },
      { selector: '.floating-shapes', speed: 0.7 }
    ];
    
    parallaxConfig.forEach(config => {
      const elements = document.querySelectorAll(config.selector);
      elements.forEach(element => {
        this.parallaxElements.push({
          element,
          speed: config.speed,
          offset: 0
        });
      });
    });
  }
  
  setupRevealElements() {
    // Elements that should be revealed on scroll
    const revealSelectors = [
      '.section-title',
      '.section-subtitle',
      '.project-card',
      '.skill-category',
      '.contact-item',
      '.about-paragraph',
      '.stat-item'
    ];
    
    revealSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element, index) => {
        this.revealElements.push({
          element,
          revealed: false,
          delay: index * 100
        });
        
        // Set initial state
        element.style.opacity = '0';
        element.style.transform = 'translateY(50px)';
        element.style.transition = 'all 0.8s ease';
      });
    });
  }
  
  setupScrollListeners() {
    window.addEventListener('scroll', () => {
      this.scrollPosition = window.pageYOffset;
      
      if (!this.ticking) {
        requestAnimationFrame(() => {
          this.updateParallax();
          this.updateRevealElements();
          this.updateScrollProgress();
          this.ticking = false;
        });
        this.ticking = true;
      }
    });
    
    // Initial check
    this.updateRevealElements();
  }
  
  updateParallax() {
    this.parallaxElements.forEach(item => {
      const { element, speed } = item;
      const yPos = -(this.scrollPosition * speed);
      
      // Use transform3d for better performance
      element.style.transform = `translate3d(0, ${yPos}px, 0)`;
    });
  }
  
  updateRevealElements() {
    this.revealElements.forEach(item => {
      if (!item.revealed) {
        const { element } = item;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = elementTop < window.innerHeight - 100;
        
        if (elementVisible) {
          setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
          }, item.delay);
          
          item.revealed = true;
        }
      }
    });
  }
  
  updateScrollProgress() {
    const scrollProgress = document.getElementById('scrollProgress');
    if (scrollProgress) {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (this.scrollPosition / scrollHeight) * 100;
      scrollProgress.style.width = `${Math.min(progress, 100)}%`;
    }
  }
  
  setupGSAPScrollTriggers() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    // Configure ScrollTrigger for better performance during smooth scrolling
    ScrollTrigger.config({
      autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
      ignoreMobileResize: true
    });

    // Hero section parallax with optimized scrub
    gsap.to('.hero-background', {
      yPercent: -50,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1, // Add slight lag for smoother performance
        invalidateOnRefresh: true
      }
    });
    
    // Section reveals with stagger (excluding project cards)
    gsap.utils.toArray('section').forEach(section => {
      const elements = section.querySelectorAll('.section-title, .section-subtitle, .card:not(.project-card)');

      if (elements.length > 0) {
        gsap.fromTo(elements,
          {
            y: 60,
            opacity: 0
          },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              end: 'bottom 20%',
              toggleActions: 'play none none none',
              fastScrollEnd: true, // Optimize for fast scrolling
              preventOverlaps: true // Prevent animation overlaps
            }
          }
        );
      }
    });

    // Special animation for about section image (no reverse)
    const aboutImage = document.querySelector('.about-image');
    if (aboutImage) {
      gsap.fromTo(aboutImage,
        {
          y: 60,
          opacity: 0,
          scale: 0.9
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: aboutImage,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    }
    
    // Skills progress bars
    gsap.utils.toArray('.skill-progress').forEach(bar => {
      const progress = bar.dataset.progress;

      gsap.fromTo(bar,
        { width: '0%' },
        {
          width: `${progress}%`,
          duration: 1.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: bar,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // Counter animations
    gsap.utils.toArray('.stat-number').forEach(counter => {
      const target = parseInt(counter.dataset.target);

      gsap.fromTo(counter,
        { textContent: 0 },
        {
          textContent: target,
          duration: 2,
          ease: 'power2.out',
          snap: { textContent: 1 },
          scrollTrigger: {
            trigger: counter,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    });
    
    // Floating elements
    gsap.utils.toArray('.floating-shape').forEach((shape, index) => {
      gsap.to(shape, {
        y: 'random(-100, 100)',
        x: 'random(-50, 50)',
        rotation: 'random(-180, 180)',
        duration: 'random(10, 20)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: index * 0.1
      });
    });
    
    // Text animations
    gsap.utils.toArray('.hero-word').forEach((word, index) => {
      gsap.fromTo(word,
        {
          y: 100,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          delay: index * 0.2
        }
      );
    });
    
    // Magnetic hover effects for buttons
    gsap.utils.toArray('.btn').forEach(button => {
      button.addEventListener('mouseenter', () => {
        gsap.to(button, {
          scale: 1.05,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
      
      button.addEventListener('mouseleave', () => {
        gsap.to(button, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    });
  }
}

// ===== SMOOTH SCROLLING =====
// Note: Smooth scrolling is now handled by main.js to prevent conflicts
// This class is kept for potential future enhancements

// ===== SCROLL DIRECTION DETECTION =====
class ScrollDirection {
  constructor() {
    this.lastScrollTop = 0;
    this.scrollDirection = 'down';
    this.nav = document.getElementById('navigation');
    
    this.init();
  }
  
  init() {
    window.addEventListener('scroll', () => {
      this.detectScrollDirection();
      this.updateNavigation();
    });
  }
  
  detectScrollDirection() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > this.lastScrollTop) {
      this.scrollDirection = 'down';
    } else {
      this.scrollDirection = 'up';
    }
    
    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }
  
  updateNavigation() {
    if (!this.nav) return;
    
    const scrollTop = window.pageYOffset;
    
    if (scrollTop > 100) {
      if (this.scrollDirection === 'down') {
        this.nav.style.transform = 'translateY(-100%)';
      } else {
        this.nav.style.transform = 'translateY(0)';
      }
    } else {
      this.nav.style.transform = 'translateY(0)';
    }
  }
}

// ===== INTERSECTION OBSERVER ENHANCEMENTS =====
class IntersectionEnhancements {
  constructor() {
    this.setupLazyLoading();
    this.setupViewportAnimations();
  }
  
  setupLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src || img.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });
      
      images.forEach(img => imageObserver.observe(img));
    }
  }
  
  setupViewportAnimations() {
    const animatedElements = document.querySelectorAll('[data-animate]');
    
    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const animation = element.dataset.animate;
          
          element.classList.add(`animate-${animation}`);
          animationObserver.unobserve(element);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });
    
    animatedElements.forEach(element => {
      animationObserver.observe(element);
    });
  }
}

// ===== PERFORMANCE OPTIMIZATIONS =====
class ScrollPerformance {
  constructor() {
    this.setupPerformanceOptimizations();
  }
  
  setupPerformanceOptimizations() {
    // Throttle scroll events
    let ticking = false;
    
    const optimizedScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Scroll-dependent operations here
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', optimizedScroll, { passive: true });
    
    // Use will-change for elements that will be animated
    const animatedElements = document.querySelectorAll('.hero-background, .parallax-element');
    animatedElements.forEach(element => {
      element.style.willChange = 'transform';
    });
    
    // Remove will-change after animations complete
    setTimeout(() => {
      animatedElements.forEach(element => {
        element.style.willChange = 'auto';
      });
    }, 5000);
  }
}

// ===== INITIALIZE SCROLL EFFECTS =====
document.addEventListener('DOMContentLoaded', () => {
  window.scrollEffects = new ScrollEffects();
  // SmoothScrolling removed - handled by main.js
  window.scrollDirection = new ScrollDirection();
  window.intersectionEnhancements = new IntersectionEnhancements();
  window.scrollPerformance = new ScrollPerformance();
});

// ===== EXPORT FOR OTHER MODULES =====
window.ScrollEffects = ScrollEffects;
window.ScrollDirection = ScrollDirection;
window.IntersectionEnhancements = IntersectionEnhancements;
window.ScrollPerformance = ScrollPerformance;
