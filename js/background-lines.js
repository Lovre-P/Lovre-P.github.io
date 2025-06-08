// ===== SCROLL-RESPONSIVE BACKGROUND LINES =====
class ScrollResponsiveBackground {
  constructor() {
    this.backgroundElement = document.getElementById('animatedBackground');
    this.svgElement = document.getElementById('backgroundSvg');
    this.lines = [];
    this.scrollPosition = 0;
    this.windowHeight = window.innerHeight;
    this.documentHeight = document.documentElement.scrollHeight;
    this.ticking = false;
    
    this.init();
  }
  
  init() {
    if (!this.backgroundElement || !this.svgElement) return;
    
    this.setupLines();
    this.setupScrollListener();
    this.setupResizeListener();
    this.updateBackground();
  }
  
  setupLines() {
    // Get all background lines
    this.lines = Array.from(this.svgElement.querySelectorAll('.bg-line'));
    
    // Store original path data for each line
    this.lines.forEach((line, index) => {
      const originalPath = line.getAttribute('d');
      line.dataset.originalPath = originalPath;
      line.dataset.lineIndex = index;
    });
  }
  
  setupScrollListener() {
    window.addEventListener('scroll', () => {
      this.scrollPosition = window.pageYOffset;
      
      if (!this.ticking) {
        requestAnimationFrame(() => {
          this.updateBackground();
          this.ticking = false;
        });
        this.ticking = true;
      }
    }, { passive: true });
  }
  
  setupResizeListener() {
    window.addEventListener('resize', () => {
      this.windowHeight = window.innerHeight;
      this.documentHeight = document.documentElement.scrollHeight;
      this.updateBackground();
    });
  }
  
  updateBackground() {
    const scrollProgress = Math.min(this.scrollPosition / (this.documentHeight - this.windowHeight), 1);
    
    // Update each line based on scroll progress
    this.lines.forEach((line, index) => {
      this.updateLine(line, index, scrollProgress);
    });
    
    // Update overall background opacity and transform
    this.updateBackgroundTransform(scrollProgress);
  }
  
  updateLine(line, index, scrollProgress) {
    const lineProgress = (scrollProgress + (index * 0.1)) % 1;
    
    // Create dynamic path based on scroll position
    const originalPath = line.dataset.originalPath;
    const newPath = this.morphPath(originalPath, lineProgress, index);
    
    // Update path
    line.setAttribute('d', newPath);
    
    // Update opacity based on scroll and line index
    const baseOpacity = parseFloat(line.style.opacity) || 0.5;
    const scrollOpacity = 0.3 + (Math.sin(lineProgress * Math.PI * 2) * 0.3);
    const finalOpacity = Math.max(0.1, Math.min(0.8, baseOpacity * scrollOpacity));
    
    line.style.opacity = finalOpacity;
    
    // Update stroke-dashoffset for animation effect
    const dashOffset = 1000 - (lineProgress * 1000);
    line.style.strokeDashoffset = dashOffset;
    
    // Add subtle transform based on scroll
    const translateY = Math.sin(lineProgress * Math.PI) * 20;
    line.style.transform = `translateY(${translateY}px)`;
  }
  
  morphPath(originalPath, progress, lineIndex) {
    // Parse the original path to extract control points
    const pathRegex = /M(\d+),(\d+)\s+Q(\d+),(\d+)\s+(\d+),(\d+)\s+T(\d+),(\d+)/;
    const match = originalPath.match(pathRegex);
    
    if (!match) return originalPath;
    
    const [, startX, startY, controlX, controlY, midX, midY, endX, endY] = match.map(Number);
    
    // Create wave-like distortion based on scroll progress
    const waveAmplitude = 30 + (progress * 50);
    const waveFrequency = 0.002 + (lineIndex * 0.0005);
    const scrollOffset = progress * 200;
    
    // Calculate new control points with wave distortion
    const newControlY = controlY + Math.sin((controlX + scrollOffset) * waveFrequency) * waveAmplitude;
    const newMidY = midY + Math.sin((midX + scrollOffset) * waveFrequency * 1.5) * (waveAmplitude * 0.7);
    
    // Add horizontal drift based on scroll
    const horizontalDrift = Math.sin(progress * Math.PI * 2) * 20;
    const newControlX = controlX + horizontalDrift;
    const newMidX = midX - horizontalDrift * 0.5;
    
    return `M${startX},${startY} Q${newControlX},${newControlY} ${newMidX},${newMidY} T${endX},${endY}`;
  }
  
  updateBackgroundTransform(scrollProgress) {
    // Subtle parallax effect for the entire background
    const parallaxY = scrollProgress * 50;
    const rotation = scrollProgress * 2;
    const scale = 1 + (scrollProgress * 0.1);
    
    this.svgElement.style.transform = `translateY(${parallaxY}px) rotate(${rotation}deg) scale(${scale})`;
    
    // Update background opacity based on scroll sections
    const sectionProgress = (scrollProgress * 4) % 1;
    const backgroundOpacity = 0.6 + (Math.sin(sectionProgress * Math.PI) * 0.3);
    this.backgroundElement.style.opacity = backgroundOpacity;
  }
  
  // Method to add new lines dynamically
  addLine(pathData, gradientId, strokeWidth = 1.5, opacity = 0.5) {
    const newLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    newLine.setAttribute('d', pathData);
    newLine.setAttribute('stroke', `url(#${gradientId})`);
    newLine.setAttribute('stroke-width', strokeWidth);
    newLine.setAttribute('fill', 'none');
    newLine.setAttribute('opacity', opacity);
    newLine.classList.add('bg-line', `line-${this.lines.length + 1}`);
    newLine.dataset.originalPath = pathData;
    newLine.dataset.lineIndex = this.lines.length;
    
    this.svgElement.appendChild(newLine);
    this.lines.push(newLine);
  }
  
  // Method to update line colors based on theme
  updateTheme(isDark) {
    this.lines.forEach((line, index) => {
      const lineNumber = (index % 3) + 1;
      if (isDark) {
        // Use original gradients for dark theme
        line.setAttribute('stroke', `url(#goldGradient${lineNumber})`);
      } else {
        // Use light theme gradients
        line.setAttribute('stroke', `url(#goldGradientLight${lineNumber})`);
      }
    });

    // Adjust overall background opacity based on theme
    if (isDark) {
      this.backgroundElement.style.opacity = '0.8';
    } else {
      this.backgroundElement.style.opacity = '0.6';
    }
  }
  
  // Performance optimization: pause animations when not visible
  handleVisibilityChange() {
    if (document.hidden) {
      this.backgroundElement.style.animationPlayState = 'paused';
    } else {
      this.backgroundElement.style.animationPlayState = 'running';
    }
  }
  
  destroy() {
    window.removeEventListener('scroll', this.updateBackground);
    window.removeEventListener('resize', this.updateBackground);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }
}

// ===== PERFORMANCE OPTIMIZATIONS =====
class BackgroundPerformance {
  constructor(backgroundInstance) {
    this.background = backgroundInstance;
    this.setupOptimizations();
  }
  
  setupOptimizations() {
    // Reduce animation frequency on slower devices
    if (this.isSlowDevice()) {
      this.optimizeForSlowDevice();
    }
    
    // Pause animations when page is not visible
    document.addEventListener('visibilitychange', () => {
      this.background.handleVisibilityChange();
    });
    
    // Use Intersection Observer to pause when background is not visible
    this.setupIntersectionObserver();
  }
  
  isSlowDevice() {
    // Simple heuristic to detect slower devices
    return navigator.hardwareConcurrency < 4 || 
           /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  optimizeForSlowDevice() {
    // Reduce the number of lines
    const lines = this.background.lines;
    lines.forEach((line, index) => {
      if (index > 3) {
        line.style.display = 'none';
      }
    });
    
    // Reduce animation complexity
    this.background.lines.forEach(line => {
      line.style.filter = 'none'; // Remove blur
    });
  }
  
  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.background.backgroundElement.style.animationPlayState = 'running';
        } else {
          this.background.backgroundElement.style.animationPlayState = 'paused';
        }
      });
    });
    
    observer.observe(this.background.backgroundElement);
  }
}

// ===== INITIALIZE BACKGROUND SYSTEM =====
document.addEventListener('DOMContentLoaded', () => {
  // Wait for other animations to initialize first
  setTimeout(() => {
    window.scrollBackground = new ScrollResponsiveBackground();
    window.backgroundPerformance = new BackgroundPerformance(window.scrollBackground);
    
    console.log('Scroll-responsive background initialized');
  }, 500);
});

// ===== THEME INTEGRATION =====
document.addEventListener('themeChanged', (event) => {
  if (window.scrollBackground) {
    const isDark = event.detail.theme === 'dark';
    window.scrollBackground.updateTheme(isDark);
  }
});

// ===== EXPORT FOR OTHER MODULES =====
window.ScrollResponsiveBackground = ScrollResponsiveBackground;
window.BackgroundPerformance = BackgroundPerformance;
