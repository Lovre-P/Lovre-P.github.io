// ===== SMOOTH FOLLOWER CURSOR =====
class SmoothFollowerCursor {
  constructor() {
    this.mousePosition = { x: 0, y: 0 };
    this.dotPosition = { x: 0, y: 0 };
    this.borderDotPosition = { x: 0, y: 0 };
    this.isHovering = false;
    this.animationId = null;

    // Smoothness factors
    this.DOT_SMOOTHNESS = 0.2;
    this.BORDER_DOT_SMOOTHNESS = 0.1;

    this.init();
  }

  init() {
    this.createCursorElements();
    this.setupEventListeners();
    this.startAnimationLoop();
  }
  
  createCursorElements() {
    // Remove existing cursor if present
    const existingCursor = document.getElementById('cursor');
    if (existingCursor) {
      existingCursor.remove();
    }

    // Create cursor container
    this.cursorContainer = document.createElement('div');
    this.cursorContainer.id = 'smooth-cursor';
    this.cursorContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: var(--z-cursor);
    `;

    // Create inner dot
    this.dotElement = document.createElement('div');
    this.dotElement.className = 'cursor-dot';
    this.dotElement.style.cssText = `
      position: absolute;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: none;
    `;

    // Create border dot
    this.borderElement = document.createElement('div');
    this.borderElement.className = 'cursor-border';
    this.borderElement.style.cssText = `
      position: absolute;
      width: 28px;
      height: 28px;
      border: 1px solid;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: width 0.3s ease, height 0.3s ease;
    `;

    // Apply theme-based colors
    this.updateCursorColors();

    this.cursorContainer.appendChild(this.dotElement);
    this.cursorContainer.appendChild(this.borderElement);
    document.body.appendChild(this.cursorContainer);
  }

  updateCursorColors() {
    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';

    if (isDarkTheme) {
      // Bright colors for dark theme
      this.dotElement.style.backgroundColor = '#ffffff';
      this.borderElement.style.borderColor = '#ffffff';
    } else {
      // Dark colors for light theme
      this.dotElement.style.backgroundColor = '#000000';
      this.borderElement.style.borderColor = '#000000';
    }
  }

  setupEventListeners() {
    // Mouse move events
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));

    // Mouse enter/leave for visibility
    document.addEventListener('mouseenter', this.showCursor.bind(this));
    document.addEventListener('mouseleave', this.hideCursor.bind(this));

    // Hover events for interactive elements
    this.setupHoverEvents();

    // Theme change events
    document.addEventListener('themeChanged', this.updateCursorColors.bind(this));

    // Observe theme changes via mutation observer as fallback
    const observer = new MutationObserver(() => {
      this.updateCursorColors();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }

  showCursor() {
    if (this.cursorContainer) {
      this.cursorContainer.style.opacity = '1';
    }
  }

  hideCursor() {
    if (this.cursorContainer) {
      this.cursorContainer.style.opacity = '0';
    }
  }
  
  setupHoverEvents() {
    // Use event delegation for better performance and dynamic content support
    const interactiveSelector = 'a, button, .btn, .nav-link, .project-card, .skill-item, .contact-item, .theme-toggle, input, textarea, select, img';

    document.addEventListener('mouseover', (e) => {
      if (e.target.matches(interactiveSelector) || e.target.closest(interactiveSelector)) {
        this.handleMouseEnter();
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.matches(interactiveSelector) || e.target.closest(interactiveSelector)) {
        this.handleMouseLeave();
      }
    });
  }
  
  handleMouseEnter() {
    this.isHovering = true;
    this.borderElement.style.width = '44px';
    this.borderElement.style.height = '44px';
  }

  handleMouseLeave() {
    this.isHovering = false;
    this.borderElement.style.width = '28px';
    this.borderElement.style.height = '28px';
  }

  handleMouseMove(event) {
    this.mousePosition.x = event.clientX;
    this.mousePosition.y = event.clientY;
  }
  
  lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  startAnimationLoop() {
    const animate = () => {
      // Update dot position with smooth following
      this.dotPosition.x = this.lerp(this.dotPosition.x, this.mousePosition.x, this.DOT_SMOOTHNESS);
      this.dotPosition.y = this.lerp(this.dotPosition.y, this.mousePosition.y, this.DOT_SMOOTHNESS);

      // Update border dot position with slower following
      this.borderDotPosition.x = this.lerp(this.borderDotPosition.x, this.mousePosition.x, this.BORDER_DOT_SMOOTHNESS);
      this.borderDotPosition.y = this.lerp(this.borderDotPosition.y, this.mousePosition.y, this.BORDER_DOT_SMOOTHNESS);

      // Apply positions
      this.dotElement.style.left = `${this.dotPosition.x}px`;
      this.dotElement.style.top = `${this.dotPosition.y}px`;
      this.borderElement.style.left = `${this.borderDotPosition.x}px`;
      this.borderElement.style.top = `${this.borderDotPosition.y}px`;

      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.cursorContainer) {
      this.cursorContainer.remove();
    }
  }
}
  
// ===== CURSOR PERFORMANCE OPTIMIZATION =====
class CursorPerformance {
  constructor() {
    this.isVisible = true;
    this.init();
  }

  init() {
    // Hide cursor when scrolling for better performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (this.isVisible) {
        this.hideCursor();
      }

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.showCursor();
      }, 150);
    }, { passive: true });

    // Hide cursor when page is not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.hideCursor();
      } else {
        this.showCursor();
      }
    });
  }

  hideCursor() {
    const cursor = document.getElementById('smooth-cursor');
    if (cursor) {
      cursor.style.opacity = '0';
      this.isVisible = false;
    }
  }

  showCursor() {
    const cursor = document.getElementById('smooth-cursor');
    if (cursor) {
      cursor.style.opacity = '1';
      this.isVisible = true;
    }
  }
}

// ===== INITIALIZE CURSOR EFFECTS =====
document.addEventListener('DOMContentLoaded', () => {
  // Check if device supports hover (not touch device)
  if (window.matchMedia('(hover: hover)').matches) {
    // Initialize smooth follower cursor
    window.smoothCursor = new SmoothFollowerCursor();
    window.cursorPerformance = new CursorPerformance();

    // Disable default cursor
    document.body.style.cursor = 'none';

    console.log('Smooth follower cursor initialized');
  } else {
    // Enable normal cursor for touch devices
    document.body.style.cursor = 'auto';
    console.log('Touch device detected - using default cursor');
  }
});

// ===== EXPORT FOR OTHER MODULES =====
window.SmoothFollowerCursor = SmoothFollowerCursor;
window.CursorPerformance = CursorPerformance;


