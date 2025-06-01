// ===== MAGNETIC CURSOR EFFECTS =====
class MagneticCursor {
  constructor() {
    this.cursor = document.getElementById('cursor');
    this.cursorInner = document.querySelector('.cursor-inner');
    this.mousePosition = { x: 0, y: 0 };
    this.cursorPosition = { x: 0, y: 0 };
    this.isHovering = false;
    this.magneticElements = [];
    
    this.init();
  }
  
  init() {
    if (!this.cursor) return;
    
    this.setupEventListeners();
    this.setupMagneticElements();
    this.startAnimationLoop();
  }
  
  setupEventListeners() {
    // Mouse move events
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseenter', this.showCursor.bind(this));
    document.addEventListener('mouseleave', this.hideCursor.bind(this));
    
    // Click events
    document.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    
    // Hover events for interactive elements
    this.setupHoverEvents();
  }
  
  setupMagneticElements() {
    // Define elements that should have magnetic effect
    const magneticSelectors = [
      '.btn',
      '.nav-link',
      '.project-card',
      '.skill-item',
      '.contact-item',
      '.theme-toggle',
      '.filter-btn'
    ];
    
    magneticSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        this.magneticElements.push(element);
        this.setupMagneticEffect(element);
      });
    });
  }
  
  setupMagneticEffect(element) {
    element.addEventListener('mouseenter', () => {
      this.isHovering = true;
      this.cursor.classList.add('hover');
      element.classList.add('magnetic-hover');
    });
    
    element.addEventListener('mouseleave', () => {
      this.isHovering = false;
      this.cursor.classList.remove('hover');
      element.classList.remove('magnetic-hover');
      
      // Reset element position
      if (typeof gsap !== 'undefined') {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'power3.out'
        });
      }
    });
    
    element.addEventListener('mousemove', (e) => {
      if (this.isHovering) {
        this.applyMagneticEffect(element, e);
      }
    });
  }
  
  applyMagneticEffect(element, event) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = Math.max(rect.width, rect.height) / 2;
    
    if (distance < maxDistance) {
      const strength = 0.3; // Magnetic strength
      const moveX = deltaX * strength;
      const moveY = deltaY * strength;
      
      if (typeof gsap !== 'undefined') {
        gsap.to(element, {
          x: moveX,
          y: moveY,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    }
  }
  
  setupHoverEvents() {
    // Interactive elements that change cursor appearance
    const hoverSelectors = [
      'a',
      'button',
      '.btn',
      '.nav-link',
      '.project-card',
      '.skill-item',
      'input',
      'textarea',
      '.theme-toggle'
    ];
    
    hoverSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        element.addEventListener('mouseenter', () => {
          this.cursor.classList.add('hover');
          element.style.cursor = 'none';
        });
        
        element.addEventListener('mouseleave', () => {
          this.cursor.classList.remove('hover');
        });
      });
    });
  }
  
  handleMouseMove(event) {
    this.mousePosition.x = event.clientX;
    this.mousePosition.y = event.clientY;
  }
  
  showCursor() {
    this.cursor.style.opacity = '1';
  }
  
  hideCursor() {
    this.cursor.style.opacity = '0';
  }
  
  handleMouseDown() {
    this.cursor.classList.add('click');
    this.cursorInner.style.transform = 'scale(0.8)';
  }
  
  handleMouseUp() {
    this.cursor.classList.remove('click');
    this.cursorInner.style.transform = 'scale(1)';
  }
  
  startAnimationLoop() {
    const animate = () => {
      // Smooth cursor following with easing
      const ease = 0.15;
      this.cursorPosition.x += (this.mousePosition.x - this.cursorPosition.x) * ease;
      this.cursorPosition.y += (this.mousePosition.y - this.cursorPosition.y) * ease;
      
      // Update cursor position
      this.cursor.style.transform = `translate3d(${this.cursorPosition.x - 10}px, ${this.cursorPosition.y - 10}px, 0)`;
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }
}

// ===== CURSOR TRAIL EFFECT =====
class CursorTrail {
  constructor() {
    this.trails = [];
    this.maxTrails = 8;
    this.mousePosition = { x: 0, y: 0 };
    
    this.init();
  }
  
  init() {
    this.createTrailElements();
    this.setupEventListeners();
    this.startAnimation();
  }
  
  createTrailElements() {
    for (let i = 0; i < this.maxTrails; i++) {
      const trail = document.createElement('div');
      trail.className = 'cursor-trail';
      trail.style.cssText = `
        position: fixed;
        width: ${20 - i * 2}px;
        height: ${20 - i * 2}px;
        background: var(--color-accent-blue);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9998;
        opacity: ${1 - i * 0.15};
        transform: translate3d(-50%, -50%, 0);
        mix-blend-mode: screen;
      `;
      
      document.body.appendChild(trail);
      this.trails.push({
        element: trail,
        x: 0,
        y: 0,
        delay: i * 0.05
      });
    }
  }
  
  setupEventListeners() {
    document.addEventListener('mousemove', (e) => {
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
    });
  }
  
  startAnimation() {
    const animate = () => {
      this.trails.forEach((trail, index) => {
        const ease = 0.2 - index * 0.02;
        trail.x += (this.mousePosition.x - trail.x) * ease;
        trail.y += (this.mousePosition.y - trail.y) * ease;
        
        trail.element.style.left = `${trail.x}px`;
        trail.element.style.top = `${trail.y}px`;
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  destroy() {
    this.trails.forEach(trail => {
      trail.element.remove();
    });
  }
}

// ===== CURSOR PARTICLES =====
class CursorParticles {
  constructor() {
    this.particles = [];
    this.maxParticles = 15;
    this.mousePosition = { x: 0, y: 0 };
    this.lastMousePosition = { x: 0, y: 0 };
    this.isMoving = false;
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.startAnimation();
  }
  
  setupEventListeners() {
    document.addEventListener('mousemove', (e) => {
      this.lastMousePosition = { ...this.mousePosition };
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
      this.isMoving = true;
      
      // Create particles on movement
      if (Math.random() < 0.3) {
        this.createParticle();
      }
    });
    
    document.addEventListener('click', () => {
      // Create burst of particles on click
      for (let i = 0; i < 5; i++) {
        setTimeout(() => this.createParticle(), i * 50);
      }
    });
  }
  
  createParticle() {
    if (this.particles.length >= this.maxParticles) {
      this.removeParticle(0);
    }
    
    const particle = document.createElement('div');
    particle.className = 'cursor-particle';
    
    const size = Math.random() * 6 + 2;
    const colors = ['var(--color-accent-blue)', 'var(--color-accent-purple)', 'var(--color-accent-green)'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    particle.style.cssText = `
      position: fixed;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      pointer-events: none;
      z-index: 9997;
      left: ${this.mousePosition.x}px;
      top: ${this.mousePosition.y}px;
      transform: translate3d(-50%, -50%, 0);
    `;
    
    document.body.appendChild(particle);
    
    const particleData = {
      element: particle,
      x: this.mousePosition.x,
      y: this.mousePosition.y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 1,
      decay: Math.random() * 0.02 + 0.01
    };
    
    this.particles.push(particleData);
  }
  
  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= particle.decay;
      particle.vy += 0.1; // Gravity
      
      particle.element.style.left = `${particle.x}px`;
      particle.element.style.top = `${particle.y}px`;
      particle.element.style.opacity = particle.life;
      particle.element.style.transform = `translate3d(-50%, -50%, 0) scale(${particle.life})`;
      
      if (particle.life <= 0) {
        this.removeParticle(i);
      }
    }
  }
  
  removeParticle(index) {
    if (this.particles[index]) {
      this.particles[index].element.remove();
      this.particles.splice(index, 1);
    }
  }
  
  startAnimation() {
    const animate = () => {
      this.updateParticles();
      requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  destroy() {
    this.particles.forEach(particle => {
      particle.element.remove();
    });
    this.particles = [];
  }
}

// ===== INITIALIZE CURSOR EFFECTS =====
document.addEventListener('DOMContentLoaded', () => {
  // Check if device supports hover (not touch device)
  if (window.matchMedia('(hover: hover)').matches) {
    window.magneticCursor = new MagneticCursor();
    
    // Optional: Enable cursor trail and particles
    // window.cursorTrail = new CursorTrail();
    // window.cursorParticles = new CursorParticles();
  } else {
    // Hide custom cursor on touch devices
    const cursor = document.getElementById('cursor');
    if (cursor) {
      cursor.style.display = 'none';
    }
    
    // Enable normal cursor for touch devices
    document.body.style.cursor = 'auto';
  }
});

// ===== EXPORT FOR OTHER MODULES =====
window.MagneticCursor = MagneticCursor;
window.CursorTrail = CursorTrail;
window.CursorParticles = CursorParticles;
