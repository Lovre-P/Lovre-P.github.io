// ===== PERFORMANCE OPTIMIZATION =====
class PerformanceOptimizer {
  constructor() {
    this.metrics = {
      loadTime: 0,
      domContentLoaded: 0,
      firstPaint: 0,
      firstContentfulPaint: 0
    };
    
    this.init();
  }
  
  init() {
    this.measurePerformance();
    this.optimizeImages();
    this.setupResourceHints();
    this.setupServiceWorker();
    this.optimizeAnimations();
    this.setupErrorHandling();
  }
  
  measurePerformance() {
    // Measure page load performance
    window.addEventListener('load', () => {
      this.metrics.loadTime = performance.now();
      this.reportMetrics();
    });
    
    document.addEventListener('DOMContentLoaded', () => {
      this.metrics.domContentLoaded = performance.now();
    });
    
    // Measure paint metrics
    if ('PerformanceObserver' in window) {
      const paintObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (entry.name === 'first-paint') {
            this.metrics.firstPaint = entry.startTime;
          } else if (entry.name === 'first-contentful-paint') {
            this.metrics.firstContentfulPaint = entry.startTime;
          }
        });
      });
      
      paintObserver.observe({ entryTypes: ['paint'] });
    }
  }
  
  reportMetrics() {
    // Log performance metrics (in production, send to analytics)
    console.log('Performance Metrics:', this.metrics);
    
    // Check Core Web Vitals
    this.measureCoreWebVitals();
  }
  
  measureCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
      });
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      
      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          console.log('FID:', entry.processingStart - entry.startTime);
        });
      });
      
      fidObserver.observe({ entryTypes: ['first-input'] });
      
      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        console.log('CLS:', clsValue);
      });
      
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }
  
  optimizeImages() {
    // Lazy load images
    const images = document.querySelectorAll('img');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            
            // Load high-quality image
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            
            // Add fade-in effect
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';
            
            img.onload = () => {
              img.style.opacity = '1';
            };
            
            imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px'
      });
      
      images.forEach(img => {
        // Set placeholder while loading
        if (!img.src && img.dataset.src) {
          img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PC9zdmc+';
        }
        
        imageObserver.observe(img);
      });
    }
  }
  
  setupResourceHints() {
    // DNS prefetch for external domains (don't preload fonts as they're already linked)
    const externalDomains = [
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'cdnjs.cloudflare.com'
    ];
    
    externalDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      document.head.appendChild(link);
    });
  }
  
  setupServiceWorker() {
    // Only register service worker in production (not for file:// protocol)
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }
  
  optimizeAnimations() {
    // Use requestAnimationFrame for smooth animations
    const animatedElements = document.querySelectorAll('[data-animate]');
    
    animatedElements.forEach(element => {
      // Use transform instead of changing layout properties
      element.style.willChange = 'transform, opacity';
      
      // Remove will-change after animation
      element.addEventListener('animationend', () => {
        element.style.willChange = 'auto';
      });
    });
    
    // Throttle scroll events
    let scrollTicking = false;
    
    window.addEventListener('scroll', () => {
      if (!scrollTicking) {
        requestAnimationFrame(() => {
          // Scroll-dependent operations
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    }, { passive: true });
    
    // Debounce resize events
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Resize-dependent operations
        this.handleResize();
      }, 250);
    });
  }
  
  handleResize() {
    // Update viewport-dependent calculations
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  
  setupErrorHandling() {
    // Global error handling
    window.addEventListener('error', (event) => {
      console.error('JavaScript error:', event.error);
      // In production, send to error tracking service
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      // In production, send to error tracking service
    });
    
    // Resource loading error handling
    document.addEventListener('error', (event) => {
      if (event.target.tagName === 'IMG') {
        // Handle image loading errors with inline SVG placeholder
        const placeholderSvg = 'data:image/svg+xml;base64,' + btoa(`
          <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#1a1a1a"/>
            <rect x="20" y="20" width="360" height="260" fill="none" stroke="#333" stroke-width="2" stroke-dasharray="5,5"/>
            <text x="200" y="140" text-anchor="middle" fill="#666" font-family="Arial, sans-serif" font-size="16">Image not found</text>
            <text x="200" y="170" text-anchor="middle" fill="#444" font-family="Arial, sans-serif" font-size="12">Failed to load image</text>
          </svg>
        `);

        event.target.src = placeholderSvg;
        event.target.alt = 'Image not found';
        console.warn('Image failed to load, using placeholder:', event.target.dataset.originalSrc || 'unknown');
      }
    }, true);
  }
}

// ===== MEMORY MANAGEMENT =====
class MemoryManager {
  constructor() {
    this.observers = [];
    this.intervals = [];
    this.timeouts = [];
    
    this.init();
  }
  
  init() {
    this.setupCleanup();
    this.monitorMemoryUsage();
  }
  
  setupCleanup() {
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
    
    // Clean up observers when elements are removed
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.removedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.cleanupElement(node);
          }
        });
      });
    });
    
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  cleanupElement(element) {
    // Remove event listeners and observers for removed elements
    const events = ['click', 'scroll', 'resize', 'mousemove'];
    events.forEach(event => {
      element.removeEventListener(event, () => {});
    });
  }
  
  cleanup() {
    // Clear all intervals and timeouts
    this.intervals.forEach(id => clearInterval(id));
    this.timeouts.forEach(id => clearTimeout(id));
    
    // Disconnect all observers
    this.observers.forEach(observer => {
      if (observer.disconnect) {
        observer.disconnect();
      }
    });
    
    // Clear arrays
    this.intervals = [];
    this.timeouts = [];
    this.observers = [];
  }
  
  monitorMemoryUsage() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        const usage = {
          used: Math.round(memory.usedJSHeapSize / 1048576),
          total: Math.round(memory.totalJSHeapSize / 1048576),
          limit: Math.round(memory.jsHeapSizeLimit / 1048576)
        };
        
        // Log memory usage (in production, send to monitoring service)
        if (usage.used > usage.limit * 0.8) {
          console.warn('High memory usage detected:', usage);
        }
      }, 30000); // Check every 30 seconds
    }
  }
  
  addObserver(observer) {
    this.observers.push(observer);
  }
  
  addInterval(id) {
    this.intervals.push(id);
  }
  
  addTimeout(id) {
    this.timeouts.push(id);
  }
}

// ===== NETWORK OPTIMIZATION =====
class NetworkOptimizer {
  constructor() {
    this.connectionType = this.getConnectionType();
    this.init();
  }
  
  init() {
    this.adaptToConnection();
    this.setupConnectionListener();
  }
  
  getConnectionType() {
    if ('connection' in navigator) {
      return navigator.connection.effectiveType;
    }
    return 'unknown';
  }
  
  adaptToConnection() {
    const connection = navigator.connection;
    
    if (connection) {
      // Adapt based on connection speed
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        this.enableDataSaver();
      } else if (connection.effectiveType === '3g') {
        this.enableReducedAnimations();
      }
      
      // Adapt based on data saver
      if (connection.saveData) {
        this.enableDataSaver();
      }
    }
  }
  
  enableDataSaver() {
    // Disable non-essential animations
    document.documentElement.classList.add('data-saver');
    
    // Reduce image quality
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.dataset.lowQuality) {
        img.src = img.dataset.lowQuality;
      }
    });
    
    // Disable particle systems
    if (window.particleSystem) {
      window.particleSystem.destroy();
    }
  }
  
  enableReducedAnimations() {
    document.documentElement.classList.add('reduced-animations');
  }
  
  setupConnectionListener() {
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', () => {
        this.connectionType = this.getConnectionType();
        this.adaptToConnection();
      });
    }
  }
}

// ===== INITIALIZE PERFORMANCE OPTIMIZATIONS =====
document.addEventListener('DOMContentLoaded', () => {
  window.performanceOptimizer = new PerformanceOptimizer();
  window.memoryManager = new MemoryManager();
  window.networkOptimizer = new NetworkOptimizer();
});

// ===== EXPORT FOR OTHER MODULES =====
window.PerformanceOptimizer = PerformanceOptimizer;
window.MemoryManager = MemoryManager;
window.NetworkOptimizer = NetworkOptimizer;
