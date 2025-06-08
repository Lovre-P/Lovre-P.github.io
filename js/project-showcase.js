// ===== PROJECT SHOWCASE FUNCTIONALITY =====
class ProjectShowcase {
  constructor() {
    this.projects = [];
    this.currentFilter = 'all';
    this.projectsGrid = document.getElementById('projectsGrid');
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.modal = null;
    
    this.init();
  }
  
  init() {
    this.setupFilterButtons();
    this.createModal();
    this.setupEventListeners();
  }
  
  setupFilterButtons() {
    this.filterButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const filter = e.target.dataset.filter;
        this.setActiveFilter(filter);
        this.filterProjects(filter);
      });
    });
  }
  
  setActiveFilter(filter) {
    this.currentFilter = filter;
    this.filterButtons.forEach(button => {
      button.classList.remove('active');
      if (button.dataset.filter === filter) {
        button.classList.add('active');
      }
    });
  }
  
  loadProjects(projectsData) {
    this.projects = projectsData;
    this.renderProjects(this.projects);
  }
  
  renderProjects(projects) {
    if (!this.projectsGrid) return;
    
    this.projectsGrid.innerHTML = '';
    
    projects.forEach((project, index) => {
      const projectCard = this.createProjectCard(project, index);
      this.projectsGrid.appendChild(projectCard);
    });
    
    // Trigger animation
    setTimeout(() => {
      this.animateProjectCards();
    }, 100);
  }
  
  createProjectCard(project, index) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.dataset.category = project.category;
    card.dataset.index = index;
    
    card.innerHTML = `
      <div class="project-image">
        <img src="${project.image || 'assets/placeholder-project.jpg'}" alt="${project.title}" loading="lazy">
        <div class="project-overlay">
          <a href="${project.link}" class="project-action" target="_blank" rel="noopener">
            <span>View Live</span>
          </a>
          <a href="${project.github}" class="project-action" target="_blank" rel="noopener">
            <span>GitHub</span>
          </a>
        </div>
      </div>
      <div class="project-content">
        <h3 class="project-title">${project.title}</h3>
        <p class="project-description">${project.description}</p>
        <div class="project-technologies">
          ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
        </div>
        <div class="project-links">
          <button class="project-link view-details" data-project-id="${project.id}">
            View Details
          </button>
          <a href="${project.link}" class="project-link" target="_blank" rel="noopener">
            Live Demo
          </a>
        </div>
      </div>
    `;
    
    // Add click event for modal on the entire card
    card.addEventListener('click', (e) => {
      // Prevent opening modal if clicking on links or buttons
      if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('a') || e.target.closest('button')) {
        return;
      }
      this.openProjectModal(project);
    });

    // Add click event for modal on view details button (keep for backwards compatibility)
    const viewDetailsBtn = card.querySelector('.view-details');
    viewDetailsBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent double triggering
      this.openProjectModal(project);
    });

    // Add hover effects
    this.setupCardHoverEffects(card);
    
    return card;
  }
  
  setupCardHoverEffects(card) {
    const image = card.querySelector('.project-image img');
    const overlay = card.querySelector('.project-overlay');
    
    card.addEventListener('mouseenter', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(image, {
          scale: 1.1,
          duration: 0.5,
          ease: 'power2.out'
        });
        
        gsap.to(overlay, {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });
    
    card.addEventListener('mouseleave', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(image, {
          scale: 1,
          duration: 0.5,
          ease: 'power2.out'
        });
        
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });
  }
  
  filterProjects(filter) {
    const filteredProjects = filter === 'all' 
      ? this.projects 
      : this.projects.filter(project => project.category === filter);
    
    // Animate out current projects
    const currentCards = document.querySelectorAll('.project-card');
    
    if (typeof gsap !== 'undefined') {
      gsap.to(currentCards, {
        opacity: 0,
        y: 30,
        duration: 0.3,
        stagger: 0.05,
        ease: 'power2.in',
        onComplete: () => {
          this.renderProjects(filteredProjects);
        }
      });
    } else {
      this.renderProjects(filteredProjects);
    }
  }
  
  animateProjectCards() {
    const cards = document.querySelectorAll('.project-card');

    if (typeof gsap !== 'undefined') {
      // Set initial state
      gsap.set(cards, {
        opacity: 0,
        y: 50,
        scale: 0.9
      });

      // Animate in with scroll trigger
      cards.forEach((card, index) => {
        gsap.to(card, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          delay: index * 0.1,
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            toggleActions: 'play none none none',
            once: true
          }
        });
      });
    } else {
      cards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add('animate');
        }, index * 100);
      });
    }
  }
  
  createModal() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal project-modal';
    this.modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title"></h2>
          <button class="modal-close" aria-label="Close modal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="project-modal-content">
            <div class="project-modal-image">
              <img src="" alt="" loading="lazy">
            </div>
            <div class="project-modal-details">
              <div class="project-modal-description"></div>
              <div class="project-modal-technologies"></div>
              <div class="project-modal-features"></div>
              <div class="project-modal-links"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.modal);
    this.setupModalEvents();
  }
  
  setupModalEvents() {
    const closeBtn = this.modal.querySelector('.modal-close');
    
    closeBtn.addEventListener('click', () => {
      this.closeProjectModal();
    });
    
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeProjectModal();
      }
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.closeProjectModal();
      }
    });
  }
  
  openProjectModal(project) {
    const modalTitle = this.modal.querySelector('.modal-title');
    const modalImage = this.modal.querySelector('.project-modal-image img');
    const modalDescription = this.modal.querySelector('.project-modal-description');
    const modalTechnologies = this.modal.querySelector('.project-modal-technologies');
    const modalFeatures = this.modal.querySelector('.project-modal-features');
    const modalLinks = this.modal.querySelector('.project-modal-links');
    
    // Populate modal content
    modalTitle.textContent = project.title;
    modalImage.src = project.image || 'assets/placeholder-project.jpg';
    modalImage.alt = project.title;
    
    modalDescription.innerHTML = `
      <h3>About This Project</h3>
      <p>${project.description}</p>
      ${project.longDescription ? `<p>${project.longDescription}</p>` : ''}
    `;
    
    modalTechnologies.innerHTML = `
      <h3>Technologies Used</h3>
      <div class="tech-tags-modal">
        ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
      </div>
    `;
    
    if (project.features) {
      modalFeatures.innerHTML = `
        <h3>Key Features</h3>
        <ul class="feature-list">
          ${project.features.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
      `;
    }
    
    modalLinks.innerHTML = `
      <div class="modal-action-buttons">
        <a href="${project.link}" class="btn btn-primary" target="_blank" rel="noopener">
          <span class="btn-text">View Live Demo</span>
          <span class="btn-arrow">→</span>
        </a>
        <a href="${project.github}" class="btn btn-secondary" target="_blank" rel="noopener">
          <span class="btn-text">View Code</span>
        </a>
      </div>
    `;
    
    // Show modal
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Animate modal content
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(this.modal.querySelector('.modal-content'), 
        {
          scale: 0.8,
          opacity: 0
        },
        {
          scale: 1,
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out'
        }
      );
    }
  }
  
  closeProjectModal() {
    if (typeof gsap !== 'undefined') {
      gsap.to(this.modal.querySelector('.modal-content'), {
        scale: 0.8,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          this.modal.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    } else {
      this.modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
  
  setupEventListeners() {
    // Intersection Observer for project cards
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });
    
    // Observe project cards when they're created
    const observeCards = () => {
      const cards = document.querySelectorAll('.project-card');
      cards.forEach(card => observer.observe(card));
    };
    
    // Call initially and after filtering
    setTimeout(observeCards, 100);
  }
}

// ===== ENHANCED PROJECT DATA =====
const enhancedProjectsData = [
  {
    id: 1,
    title: 'E-Commerce Platform',
    description: 'Modern e-commerce solution with only HTML, CSS and JavaScript',
    longDescription: 'A front end template for an e-commerce platform featuring user authentication, product catalog, shopping cart, and payment processing. Built with modern technologies and best practices.',
    image: 'assets/webshop.png',
    technologies: ['HTML5', 'CSS3s', 'JavaScript', 'Service Worker' ],
    category: 'web',
    features: [
      'User authentication and authorization',
      'Product catalog with search and filtering',
      'Shopping cart and checkout process',
      'Payment integration with Stripe',
      'Responsive design for all devices'
    ],
    link: 'https://lovre-p.github.io/webshop-v0.1/',
    github: 'https://github.com/Lovre-P/webshop-v0.1'
  },
  {
    id: 2,
    title: 'Investment Platform Demo',
    description: 'User: admin@megainvest.com Password: adminpassword123',
    longDescription: 'A fully responsive investment platform with a clean and modern design, admin backend with authentication, middleware and JSON Investment API. Production version uses mySQL',
    image: 'assets/mega-invest-demo.png',
    technologies: ['Typescript', 'CSS3', 'JSON', 'CRUD', 'JWT Authentication'],
    category: 'web',
    features: [
      'User authentication and authorization',
      'CRUD operations for managing investments',
      'Real-time data updates with JSON API',
      'Responsive design for all devices',
      'Secure JWT authentication',
      'Admin backend for managing users and investments',
      'Middleware for handling API requests'
    ],
    link: 'https://mega-invest-platform-234003223541.us-west1.run.app',
    github: 'https://github.com/Lovre-P/investment-platform-v3'
  },
  {
    id: 3,
    title: 'Animated circular slider',
    description: 'Animated circular slider with HTML, CSS and JavaScript',
    longDescription: 'A responsive and interactive circular slider built with HTML, CSS, and JavaScript. It features smooth animations, touch support, and customizable options.',
    image: 'assets/circular-slider.png',
    technologies: ['HTML5', 'CSS3', 'JavaScript', 'Anime.js'],
    category: 'design',
    features: [
      'Smooth animations with Anime.js',
      'Touch support for mobile devices',
      'Customizable options for content and styling',
      'Responsive design for all devices',
      'Clean and modern design'
    ],
    link: 'https://lovre-p.github.io/circular-slider-with-anime-js/',
    github: 'https://github.com/Lovre-P/circular-slider-with-anime-js'
  },
  {
    id: 4,
    title: 'Simple Calculator PWA',
    description: 'Simple calculator PWA with HTML, CSS and JavaScript',
    longDescription: 'A simple calculator PWA built with HTML, CSS, and JavaScript. It features a clean and modern design, offline support, and a responsive layout.',
    image: 'assets/calculator.png',
    technologies: ['HTML5', 'CSS3', 'JavaScript', 'Service Worker'],
    category: 'mobile',
    features: [
      'Basic arithmetic operations',
      'Responsive design for all devices',
      'Offline support with service worker',
      'Clean and modern design',
      'Touch support for mobile devices'
    ],
    link: 'https://lovre-p.github.io/kalkulator.html',
    github: 'https://github.com/Lovre-P/Lovre-P.github.io'
  },
  {
    id: 5,
    title: 'AI Voice Contolled UI',
    description: 'AI voice controlled UI with HTML, CSS and JavaScript',
    longDescription: 'A voice controlled UI built with HTML, CSS, JavaScript and Gemini AI. It features a clean and matrix like design, and a responsive layout.',
    image: 'assets/aiui.png',
    technologies: ['HTML5', 'CSS3', 'TypeScript', 'API', 'JSON', 'Gemini AI'],
    category: 'web',
    features: [
      'Voice control with Gemini AI',
      'Responsive design for all devices',
      'Clean and matrix like design',
      'Touch support for mobile devices'
    ],
    link: 'https://ai-interactive-portfolio-234003223541.us-west1.run.app',
    github: 'https://github.com/Lovre-P'
  },
  {
    id: 6,
    title: 'Submit Form Page',
    description: 'A fully responsive submit form with return page.',
    longDescription: 'A fully responsive submit form with return page. Built with HTML, CSS, and JavaScript. It features a clean and modern design, and a responsive layout.',
    image: 'assets/submit-form.png',
    technologies: ['HTML5', 'CSS3', 'Responsive Design', 'JavaScript'],
    category: 'design',
    features: [
      'Fully responsive design',
      'Clean and modern design',
      'Touch support for mobile devices'
    ],
    link: 'https://lovre-p.github.io/submit-form.html',
    github: 'https://github.com/Lovre-P/Lovre-P.github.io'
  },
  {
    id: 7,
    title: 'Oblutak - Flexbox Grid Layout Example',
    description: 'A simple flexbox grid layout example.',
    longDescription: 'A simple modern website showcasing decorative garden stones with a responsive design, using a flexbox grid layout. Built only with HTML and CSS. It features a clean and modern design, and a responsive layout.',
    image: 'assets/oblutak.png',
    technologies: ['HTML5', 'CSS3', 'Responsive Design', 'Flexbox'],
    category: 'design',
    features: [
      'Fully responsive design',
      'Clean and modern design',
      'Touch support for mobile devices'
    ],
    link: 'https://lovre-p.github.io/oblutak/index.html',
    github: 'https://github.com/Lovre-P/Lovre-P.github.io'
  },
  {
    id: 8,
    title: 'PWA AI Summarizer App',
    description: 'Gemini powered AI Summarizer App for shared linkes',
    longDescription: 'Users can share with an app a link of a article or Youtube video, and the app will return a summary of the content transcribable to audio. Built with HTML, CSS, JavaScript and Gemini AI.',
    image: 'assets/summarizer.png',
    technologies: ['HTML5', 'CSS3', 'PWA', 'JavaScript', 'Gemini AI'],
    category: 'mobile',
    features: [
      'Gemini AI integration',
      'PWA with service worker',
      'Responsive design for all devices',
      'Clean and modern design',
      'Touch support for mobile devices'
    ],
    link: 'https://lovre-p.github.io/summarizer-basic',
    github: 'https://github.com/Lovre-P/summarizer-basic'
  },
];

// ===== GLOBAL FUNCTION FOR LOADING PROJECTS =====
window.loadProjects = function(projectsData) {
  if (window.projectShowcase) {
    window.projectShowcase.loadProjects(projectsData || enhancedProjectsData);
  }
};

// ===== INITIALIZE PROJECT SHOWCASE =====
document.addEventListener('DOMContentLoaded', () => {
  window.projectShowcase = new ProjectShowcase();
  
  // Load projects with enhanced data
  window.loadProjects(enhancedProjectsData);
});

// ===== EXPORT FOR OTHER MODULES =====
window.ProjectShowcase = ProjectShowcase;
window.enhancedProjectsData = enhancedProjectsData;
