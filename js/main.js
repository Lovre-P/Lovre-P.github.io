// ===== MAIN APPLICATION INITIALIZATION =====
class PortfolioApp {
  constructor() {
    this.isLoaded = false;
    this.currentSection = 'home';
    this.scrollPosition = 0;
    this.isScrolling = false;
    this.isScrollAnimating = false; // Track if smooth scroll is active

    this.init();
  }
  
  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }
  
  setup() {
    this.setupElements();
    this.setupEventListeners();
    this.setupIntersectionObserver();
    this.startLoadingSequence();
    this.setupCodeAnimation();
    this.setupStatCounters();
  }
  
  setupElements() {
    this.elements = {
      loadingScreen: document.getElementById('loadingScreen'),
      navigation: document.getElementById('navigation'),
      navLinks: document.querySelectorAll('.nav-link'),
      navMenu: document.getElementById('navMenu'),
      navToggle: document.getElementById('navToggle'),
      scrollProgress: document.getElementById('scrollProgress'),
      sections: document.querySelectorAll('section'),
      codeAnimation: document.getElementById('codeAnimation'),
      statNumbers: document.querySelectorAll('.stat-number'),
      skillBars: document.querySelectorAll('.skill-progress')
    };

    // Initialize mobile menu state
    this.isMobileMenuOpen = false;
  }
  
  setupEventListeners() {
    // Scroll events with optimized throttling
    window.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 8), { passive: true });

    // Navigation events
    this.elements.navLinks.forEach(link => {
      link.addEventListener('click', this.handleNavClick.bind(this));
    });

    // Mobile menu toggle
    if (this.elements.navToggle) {
      this.elements.navToggle.addEventListener('click', this.toggleMobileMenu.bind(this));
    }

    // Close mobile menu when clicking nav links
    this.elements.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (this.isMobileMenuOpen) {
          this.toggleMobileMenu();
        }
      });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isMobileMenuOpen &&
          !this.elements.navMenu.contains(e.target) &&
          !this.elements.navToggle.contains(e.target)) {
        this.toggleMobileMenu();
      }
    });

    // Resize events
    window.addEventListener('resize', this.throttle(this.handleResize.bind(this), 250));

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', this.handleSmoothScroll.bind(this));
    });
  }
  
  setupIntersectionObserver() {
    const options = {
      threshold: 0.3,
      rootMargin: '-50px 0px'
    };
    
    this.sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.updateActiveSection(entry.target.id);
          entry.target.classList.add('animate');
          
          // Trigger specific animations based on section
          this.triggerSectionAnimations(entry.target);
        }
      });
    }, options);
    
    this.elements.sections.forEach(section => {
      this.sectionObserver.observe(section);
    });
  }
  
  startLoadingSequence() {
    // Simulate loading time
    const loadingBar = document.querySelector('.loading-bar');
    let progress = 0;
    
    const loadingInterval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(loadingInterval);
        setTimeout(() => this.hideLoadingScreen(), 500);
      }
      loadingBar.style.width = `${progress}%`;
    }, 100);
  }
  
  hideLoadingScreen() {
    this.elements.loadingScreen.classList.add('hidden');
    this.isLoaded = true;
    
    // Start hero animations
    setTimeout(() => {
      this.startHeroAnimations();
    }, 500);
  }
  
  startHeroAnimations() {
    // Hero animations are handled by CSS, but we can trigger additional JS animations here
    if (typeof gsap !== 'undefined') {
      gsap.from('.hero-content', {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power3.out'
      });
    }
  }
  
  setupCodeAnimation() {
    const codeLines = [
      'const developer = {',
      '  name: "Creative Developer",',
      '  skills: ["JavaScript", "React", "Node.js"],',
      '  passion: "Creating amazing experiences",',
      '  status: "Available for projects"',
      '};',
      '',
      'developer.createMagic();'
    ];
    
    let lineIndex = 0;
    let charIndex = 0;
    let currentLine = '';
    
    const typeCode = () => {
      if (lineIndex < codeLines.length) {
        if (charIndex < codeLines[lineIndex].length) {
          currentLine += codeLines[lineIndex][charIndex];
          charIndex++;
        } else {
          currentLine += '\n';
          lineIndex++;
          charIndex = 0;
        }
        
        if (this.elements.codeAnimation) {
          this.elements.codeAnimation.textContent = currentLine;
        }
        
        setTimeout(typeCode, Math.random() * 100 + 50);
      } else {
        // Restart animation after delay
        setTimeout(() => {
          lineIndex = 0;
          charIndex = 0;
          currentLine = '';
          typeCode();
        }, 3000);
      }
    };
    
    // Start typing animation after loading
    setTimeout(typeCode, 2000);
  }
  
  setupStatCounters() {
    const animateCounter = (element) => {
      const target = parseInt(element.dataset.target);
      const duration = 2000;
      const step = target / (duration / 16);
      let current = 0;
      
      const counter = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(counter);
        }
        element.textContent = Math.floor(current);
      }, 16);
    };
    
    // Animate counters when they come into view
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    });
    
    this.elements.statNumbers.forEach(stat => {
      counterObserver.observe(stat);
    });
  }
  
  handleScroll() {
    this.scrollPosition = window.pageYOffset;
    this.updateScrollProgress();
    this.updateNavVisibility();
    
    if (!this.isScrolling) {
      this.isScrolling = true;
      requestAnimationFrame(() => {
        this.isScrolling = false;
      });
    }
  }
  
  updateScrollProgress() {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (this.scrollPosition / scrollHeight) * 100;
    this.elements.scrollProgress.style.width = `${Math.min(progress, 100)}%`;
  }
  
  updateNavVisibility() {
    if (this.scrollPosition > 100) {
      this.elements.navigation.classList.remove('hidden');
    } else {
      this.elements.navigation.classList.add('hidden');
    }
  }
  
  updateActiveSection(sectionId) {
    if (this.currentSection !== sectionId) {
      this.currentSection = sectionId;
      
      // Update navigation
      this.elements.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === sectionId) {
          link.classList.add('active');
        }
      });
    }
  }
  
  triggerSectionAnimations(section) {
    const sectionId = section.id;
    
    switch (sectionId) {
      case 'skills':
        this.animateSkillBars();
        break;
      case 'projects':
        this.animateProjectCards();
        break;
    }
  }
  
  animateSkillBars() {
    this.elements.skillBars.forEach((bar, index) => {
      setTimeout(() => {
        const progress = bar.dataset.progress;
        bar.style.width = `${progress}%`;
      }, index * 200);
    });
  }
  
  animateProjectCards() {
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('animate');
      }, index * 150);
    });
  }
  
  handleNavClick(event) {
    event.preventDefault();
    const targetSection = event.target.dataset.section;
    const targetElement = document.getElementById(targetSection);
    
    if (targetElement) {
      this.smoothScrollTo(targetElement);
    }
  }
  
  handleSmoothScroll(event) {
    event.preventDefault();
    const targetId = event.target.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      this.smoothScrollTo(targetElement);
    }
  }
  
  smoothScrollTo(element) {
    // Prevent multiple scroll animations
    if (this.isScrollAnimating) {
      return;
    }

    // Calculate responsive offset based on screen size
    const navHeight = window.innerWidth <= 768 ? 60 : 80;
    const offsetTop = element.offsetTop - navHeight;

    // Kill any existing scroll animations to prevent conflicts
    if (typeof gsap !== 'undefined') {
      gsap.killTweensOf(window);
      this.isScrollAnimating = true;

      // Calculate optimal duration based on scroll distance
      const scrollDistance = Math.abs(offsetTop - this.scrollPosition);
      const duration = Math.min(Math.max(scrollDistance / 1000, 0.5), 1.5);

      gsap.to(window, {
        duration: duration,
        scrollTo: {
          y: offsetTop,
          autoKill: true,
          onAutoKill: () => {
            this.isScrollAnimating = false;
          }
        },
        ease: "power2.inOut",
        onStart: () => {
          // Temporarily pause ScrollTrigger updates during scroll
          if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.getAll().forEach(trigger => {
              trigger.disable();
            });
          }
        },
        onComplete: () => {
          this.isScrollAnimating = false;
          // Re-enable ScrollTrigger after scroll completes
          if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.getAll().forEach(trigger => {
              trigger.enable();
            });
            ScrollTrigger.refresh();
          }
        },
        onInterrupt: () => {
          this.isScrollAnimating = false;
          // Re-enable ScrollTrigger if interrupted
          if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.getAll().forEach(trigger => {
              trigger.enable();
            });
          }
        }
      });
    } else {
      // Fallback to native scrollTo for browsers without GSAP
      try {
        window.scrollTo({
          top: offsetTop,
          behavior: 'auto' // Use auto instead of smooth to avoid conflicts
        });
      } catch (error) {
        // Fallback for older browsers
        window.scrollTo(0, offsetTop);
      }
    }
  }
  
  handleResize() {
    // Handle responsive adjustments
    this.updateScrollProgress();

    // Close mobile menu on resize to desktop
    if (window.innerWidth > 768 && this.isMobileMenuOpen) {
      this.toggleMobileMenu();
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;

    // Toggle menu visibility
    if (this.elements.navMenu) {
      this.elements.navMenu.classList.toggle('active', this.isMobileMenuOpen);
    }

    // Toggle burger animation
    if (this.elements.navToggle) {
      this.elements.navToggle.classList.toggle('active', this.isMobileMenuOpen);
    }

    // Prevent body scroll when menu is open
    document.body.style.overflow = this.isMobileMenuOpen ? 'hidden' : '';
  }

  // Utility function for throttling
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// ===== GSAP ANIMATIONS SETUP =====
function setupGSAPAnimations() {
  if (typeof gsap === 'undefined') return;

  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger);
  if (typeof ScrollToPlugin !== 'undefined') {
    gsap.registerPlugin(ScrollToPlugin);
  }
  
  // Hero parallax effect
  gsap.to('.hero-background', {
    yPercent: -50,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });
  
  // Section reveal animations
  gsap.utils.toArray('section').forEach(section => {
    gsap.from(section.children, {
      y: 60,
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none none'
      }
    });
  });
}

// ===== PROJECT DATA =====
const projectsData = [
  {
    id: 1,
    title: 'E-Commerce Platform',
    description: 'Modern e-commerce solution with React and Node.js',
    image: 'assets/project1.jpg',
    technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    category: 'web',
    link: '#',
    github: '#'
  },
  {
    id: 2,
    title: 'Mobile Banking App',
    description: 'Secure mobile banking application with biometric authentication',
    image: 'assets/project2.jpg',
    technologies: ['React Native', 'Firebase', 'Redux'],
    category: 'mobile',
    link: '#',
    github: '#'
  },
  {
    id: 3,
    title: 'Brand Identity Design',
    description: 'Complete brand identity and visual design system',
    image: 'assets/project3.jpg',
    technologies: ['Figma', 'Adobe Creative Suite'],
    category: 'design',
    link: '#',
    github: '#'
  }
];

// ===== INITIALIZE APPLICATION =====
document.addEventListener('DOMContentLoaded', () => {
  // Initialize main app
  window.portfolioApp = new PortfolioApp();
  
  // Setup GSAP animations
  setupGSAPAnimations();
  
  // Load projects
  if (typeof loadProjects === 'function') {
    loadProjects(projectsData);
  }
});

// ===== EXPORT FOR OTHER MODULES =====
window.PortfolioApp = PortfolioApp;
window.projectsData = projectsData;
