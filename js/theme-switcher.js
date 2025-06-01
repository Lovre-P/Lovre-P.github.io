// ===== THEME SWITCHER FUNCTIONALITY =====
class ThemeSwitcher {
  constructor() {
    this.currentTheme = 'dark';
    this.themeToggle = document.getElementById('themeToggle');
    this.prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    this.init();
  }
  
  init() {
    this.loadSavedTheme();
    this.setupEventListeners();
    this.setupSystemThemeListener();
    this.applyTheme(this.currentTheme);
  }
  
  loadSavedTheme() {
    const savedTheme = localStorage.getItem('portfolio-theme');
    
    if (savedTheme) {
      this.currentTheme = savedTheme;
    } else {
      // Use system preference as default
      this.currentTheme = this.prefersDarkScheme.matches ? 'dark' : 'light';
    }
  }
  
  setupEventListeners() {
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => {
        this.toggleTheme();
      });
    }
    
    // Keyboard shortcut (Ctrl/Cmd + Shift + T)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        this.toggleTheme();
      }
    });
  }
  
  setupSystemThemeListener() {
    this.prefersDarkScheme.addEventListener('change', (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem('portfolio-theme')) {
        this.currentTheme = e.matches ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
      }
    });
  }
  
  toggleTheme() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(this.currentTheme);
    this.saveTheme();
    this.animateThemeTransition();
  }
  
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.updateThemeToggleIcon(theme);
    this.updateMetaThemeColor(theme);
    this.updateLogo(theme);

    // Dispatch custom event for other components
    document.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme }
    }));
  }
  
  updateThemeToggleIcon(theme) {
    if (!this.themeToggle) return;
    
    const lightIcon = this.themeToggle.querySelector('.theme-icon-light');
    const darkIcon = this.themeToggle.querySelector('.theme-icon-dark');
    
    if (theme === 'dark') {
      lightIcon.style.transform = 'scale(1)';
      darkIcon.style.transform = 'translate(-50%, -50%) scale(0)';
    } else {
      lightIcon.style.transform = 'scale(0)';
      darkIcon.style.transform = 'translate(-50%, -50%) scale(1)';
    }
  }
  
  updateLogo(theme) {
    const logoDark = document.getElementById('logoDark');
    const logoLight = document.getElementById('logoLight');

    if (!logoDark || !logoLight) return;

    // Add smooth transition animation
    const duration = 300;

    if (theme === 'dark') {
      // Fade out light logo, fade in dark logo
      logoLight.style.transition = `opacity ${duration}ms ease, visibility ${duration}ms ease`;
      logoDark.style.transition = `opacity ${duration}ms ease, visibility ${duration}ms ease`;

      logoLight.style.opacity = '0';
      logoLight.style.visibility = 'hidden';

      setTimeout(() => {
        logoDark.style.opacity = '1';
        logoDark.style.visibility = 'visible';
      }, duration / 2);
    } else {
      // Fade out dark logo, fade in light logo
      logoDark.style.transition = `opacity ${duration}ms ease, visibility ${duration}ms ease`;
      logoLight.style.transition = `opacity ${duration}ms ease, visibility ${duration}ms ease`;

      logoDark.style.opacity = '0';
      logoDark.style.visibility = 'hidden';

      setTimeout(() => {
        logoLight.style.opacity = '1';
        logoLight.style.visibility = 'visible';
      }, duration / 2);
    }
  }

  updateMetaThemeColor(theme) {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }

    metaThemeColor.content = theme === 'dark' ? '#0a0a0a' : '#ffffff';
  }
  
  saveTheme() {
    localStorage.setItem('portfolio-theme', this.currentTheme);
  }
  
  animateThemeTransition() {
    // Create a smooth transition effect
    const transitionOverlay = document.createElement('div');
    transitionOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: ${this.currentTheme === 'dark' ? '#ffffff' : '#0a0a0a'};
      z-index: 10000;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(transitionOverlay);
    
    // Trigger animation
    requestAnimationFrame(() => {
      transitionOverlay.style.opacity = '0.1';
      
      setTimeout(() => {
        transitionOverlay.style.opacity = '0';
        
        setTimeout(() => {
          document.body.removeChild(transitionOverlay);
        }, 300);
      }, 150);
    });
    
    // Add ripple effect to toggle button
    this.createRippleEffect();
  }
  
  createRippleEffect() {
    if (!this.themeToggle) return;
    
    const ripple = document.createElement('div');
    const rect = this.themeToggle.getBoundingClientRect();
    
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: ${this.currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
      left: 50%;
      top: 50%;
      width: 40px;
      height: 40px;
      margin-left: -20px;
      margin-top: -20px;
    `;
    
    // Add ripple animation keyframes if not exists
    if (!document.querySelector('#ripple-keyframes')) {
      const style = document.createElement('style');
      style.id = 'ripple-keyframes';
      style.textContent = `
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    this.themeToggle.style.position = 'relative';
    this.themeToggle.style.overflow = 'hidden';
    this.themeToggle.appendChild(ripple);
    
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  }
  
  // Public method to get current theme
  getCurrentTheme() {
    return this.currentTheme;
  }
  
  // Public method to set theme programmatically
  setTheme(theme) {
    if (theme === 'dark' || theme === 'light') {
      this.currentTheme = theme;
      this.applyTheme(theme);
      this.saveTheme();
    }
  }
}

// ===== THEME-AWARE COMPONENTS =====
class ThemeAwareParticles {
  constructor() {
    this.setupThemeListener();
  }
  
  setupThemeListener() {
    document.addEventListener('themeChanged', (e) => {
      this.updateParticleColors(e.detail.theme);
    });
  }
  
  updateParticleColors(theme) {
    // Update Three.js particle colors based on theme
    if (window.particleSystem && window.particleSystem.particles) {
      const colors = theme === 'dark' 
        ? [0x00d4ff, 0x8b5cf6, 0x10b981, 0xffffff]
        : [0x0066cc, 0x6b46c1, 0x059669, 0x374151];
      
      // Update particle system colors
      // This would require modifying the particle system to support dynamic color updates
    }
    
    // Update CSS custom properties for particles
    document.documentElement.style.setProperty(
      '--particle-color-primary',
      theme === 'dark' ? '#00d4ff' : '#0066cc'
    );
  }
}

// ===== THEME PERSISTENCE =====
class ThemePersistence {
  constructor() {
    this.storageKey = 'portfolio-theme-settings';
    this.settings = this.loadSettings();
  }
  
  loadSettings() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : this.getDefaultSettings();
    } catch (error) {
      console.warn('Failed to load theme settings:', error);
      return this.getDefaultSettings();
    }
  }
  
  getDefaultSettings() {
    return {
      theme: 'dark',
      autoSwitch: true,
      animations: true,
      reducedMotion: false
    };
  }
  
  saveSettings() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
    } catch (error) {
      console.warn('Failed to save theme settings:', error);
    }
  }
  
  updateSetting(key, value) {
    this.settings[key] = value;
    this.saveSettings();
    
    // Apply setting immediately
    this.applySetting(key, value);
  }
  
  applySetting(key, value) {
    switch (key) {
      case 'animations':
        document.documentElement.style.setProperty(
          '--animation-duration',
          value ? '0.3s' : '0.01ms'
        );
        break;
      case 'reducedMotion':
        if (value) {
          document.documentElement.classList.add('reduce-motion');
        } else {
          document.documentElement.classList.remove('reduce-motion');
        }
        break;
    }
  }
  
  getSetting(key) {
    return this.settings[key];
  }
}

// ===== ACCESSIBILITY ENHANCEMENTS =====
class ThemeAccessibility {
  constructor() {
    this.setupAccessibilityFeatures();
  }
  
  setupAccessibilityFeatures() {
    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.handleReducedMotion(prefersReducedMotion.matches);
    
    prefersReducedMotion.addEventListener('change', (e) => {
      this.handleReducedMotion(e.matches);
    });
    
    // High contrast mode detection
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
    this.handleHighContrast(prefersHighContrast.matches);
    
    prefersHighContrast.addEventListener('change', (e) => {
      this.handleHighContrast(e.matches);
    });
  }
  
  handleReducedMotion(enabled) {
    if (enabled) {
      document.documentElement.classList.add('reduce-motion');
      // Disable particle systems and complex animations
      if (window.particleSystem) {
        window.particleSystem.destroy();
      }
      if (window.floatingShapes) {
        window.floatingShapes.destroy();
      }
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }
  
  handleHighContrast(enabled) {
    if (enabled) {
      document.documentElement.classList.add('high-contrast');
      // Increase contrast ratios
      document.documentElement.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.1)');
      document.documentElement.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.3)');
    } else {
      document.documentElement.classList.remove('high-contrast');
      // Reset to normal contrast
      document.documentElement.style.removeProperty('--glass-bg');
      document.documentElement.style.removeProperty('--glass-border');
    }
  }
}

// ===== INITIALIZE THEME SYSTEM =====
document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme switcher
  window.themeSwitcher = new ThemeSwitcher();
  
  // Initialize theme-aware components
  window.themeAwareParticles = new ThemeAwareParticles();
  
  // Initialize theme persistence
  window.themePersistence = new ThemePersistence();
  
  // Initialize accessibility features
  window.themeAccessibility = new ThemeAccessibility();
});

// ===== EXPORT FOR OTHER MODULES =====
window.ThemeSwitcher = ThemeSwitcher;
window.ThemeAwareParticles = ThemeAwareParticles;
window.ThemePersistence = ThemePersistence;
window.ThemeAccessibility = ThemeAccessibility;
