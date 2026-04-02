/**
 * ScrollSequence — Scroll-driven image sequence on canvas
 * Breaks down a video into frames and lets scroll position control playback.
 */
class ScrollSequence {
  constructor(opts) {
    this.canvas = opts.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.section = opts.section;
    this.onReady = opts.onReady || (() => {});
    this.onProgress = opts.onProgress || (() => {});
    this.onFrameChange = opts.onFrameChange || (() => {});

    this.frames = [];
    this.loaded = 0;
    this.totalFrames = opts.frameCount;
    this.currentFrame = 0;
    this.targetFrame = 0;
    this.rafId = null;
    this.isReady = false;
    this.initialBatchSize = 20;

    // Accessibility & network checks
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const conn = navigator.connection;
    const isSaveData = conn?.saveData;
    const isSlowNet = ['slow-2g', '2g'].includes(conn?.effectiveType);

    if (prefersReduced || isSaveData || isSlowNet) {
      this.disabled = true;
      return;
    }
    this.disabled = false;

    // Mobile vs desktop frame set
    this.isMobile = window.innerWidth < 768;
    this.basePath = this.isMobile ? opts.mobilePath : opts.desktopPath;
    this.totalFrames = this.isMobile ? opts.mobileFrameCount : opts.frameCount;

    this.setupCanvas();
    this.preloadFrames();
    this.bindScroll();
    this.bindResize();
  }

  setupCanvas() {
    // Match video aspect ratio 1280:720 = 16:9
    const w = Math.min(window.innerWidth, 1280);
    const h = w * (720 / 1280);
    this.canvas.width = w * (window.devicePixelRatio > 1 ? 2 : 1);
    this.canvas.height = h * (window.devicePixelRatio > 1 ? 2 : 1);
    this.canvas.style.width = '100%';
    this.canvas.style.height = 'auto';
    this.canvas.style.maxHeight = '100vh';
  }

  preloadFrames() {
    for (let i = 0; i < this.totalFrames; i++) {
      const img = new Image();
      const frameNum = String(i + 1).padStart(4, '0');
      img.src = `${this.basePath}/f${frameNum}.webp`;

      if (i < this.initialBatchSize) {
        img.fetchPriority = 'high';
      }

      img.onload = () => {
        this.loaded++;
        const progress = this.loaded / this.totalFrames;
        this.onProgress(progress);

        if (this.loaded === this.initialBatchSize && !this.isReady) {
          this.isReady = true;
          this.drawFrame(0);
          this.onReady();
        }
      };

      img.onerror = () => {
        this.loaded++;
        this.onProgress(this.loaded / this.totalFrames);
      };

      this.frames[i] = img;
    }
  }

  bindScroll() {
    window.addEventListener('scroll', () => {
      if (!this.isReady) return;

      const rect = this.section.getBoundingClientRect();
      const sectionHeight = this.section.offsetHeight;
      const viewHeight = window.innerHeight;

      // Progress: 0 when section top is at viewport top, 1 when section bottom reaches viewport bottom
      const scrolled = -rect.top;
      const total = sectionHeight - viewHeight;
      const progress = Math.max(0, Math.min(1, scrolled / total));

      this.targetFrame = Math.round(progress * (this.totalFrames - 1));

      if (!this.rafId) {
        this.rafId = requestAnimationFrame(() => this.tick());
      }
    }, { passive: true });
  }

  bindResize() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.setupCanvas();
        this.drawFrame(Math.round(this.currentFrame));
      }, 200);
    });
  }

  tick() {
    const diff = Math.abs(this.targetFrame - this.currentFrame);

    if (diff < 0.5) {
      this.currentFrame = this.targetFrame;
      this.rafId = null;
    } else {
      // Lerp for smooth interpolation
      this.currentFrame += (this.targetFrame - this.currentFrame) * 0.1;
      this.rafId = requestAnimationFrame(() => this.tick());
    }

    const frameIndex = Math.round(this.currentFrame);
    this.drawFrame(frameIndex);
    this.onFrameChange(frameIndex, this.totalFrames);
  }

  drawFrame(index) {
    const img = this.frames[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = this.canvas.width;
    const ch = this.canvas.height;

    // Clear and draw centered/covered
    this.ctx.clearRect(0, 0, cw, ch);

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = cw / ch;

    let drawW, drawH, drawX, drawY;
    if (imgRatio > canvasRatio) {
      drawH = ch;
      drawW = ch * imgRatio;
      drawX = (cw - drawW) / 2;
      drawY = 0;
    } else {
      drawW = cw;
      drawH = cw / imgRatio;
      drawX = 0;
      drawY = (ch - drawH) / 2;
    }

    this.ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }

  // Get scroll progress of the hero section (0-1)
  getProgress() {
    if (!this.section) return 0;
    const rect = this.section.getBoundingClientRect();
    const total = this.section.offsetHeight - window.innerHeight;
    return Math.max(0, Math.min(1, -rect.top / total));
  }
}
