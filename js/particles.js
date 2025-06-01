// ===== THREE.JS PARTICLE SYSTEM =====
class ParticleSystem {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particles = null;
    this.particleCount = 1000;
    this.mousePosition = { x: 0, y: 0 };
    this.windowHalf = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    
    this.init();
  }
  
  init() {
    if (typeof THREE === 'undefined') {
      console.warn('Three.js not loaded, skipping particle system');
      return;
    }
    
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupParticles();
    this.setupEventListeners();
    this.startAnimation();
  }
  
  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x0a0a0a, 1, 3000);
  }
  
  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      3000
    );
    this.camera.position.z = 1000;
  }
  
  setupRenderer() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true
    });
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);
  }
  
  setupParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    const colors = new Float32Array(this.particleCount * 3);
    const sizes = new Float32Array(this.particleCount);
    
    // Define color palette
    const colorPalette = [
      new THREE.Color(0x00d4ff), // Blue
      new THREE.Color(0x8b5cf6), // Purple
      new THREE.Color(0x10b981), // Green
      new THREE.Color(0xffffff)  // White
    ];
    
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      
      // Position
      positions[i3] = (Math.random() - 0.5) * 2000;
      positions[i3 + 1] = (Math.random() - 0.5) * 2000;
      positions[i3 + 2] = (Math.random() - 0.5) * 2000;
      
      // Color
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      
      // Size
      sizes[i] = Math.random() * 3 + 1;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Shader material for custom particle rendering
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        mouse: { value: new THREE.Vector2() }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        uniform vec2 mouse;
        
        void main() {
          vColor = color;
          
          vec3 pos = position;
          
          // Wave animation
          pos.y += sin(time * 0.001 + position.x * 0.01) * 10.0;
          pos.x += cos(time * 0.001 + position.y * 0.01) * 10.0;
          
          // Mouse interaction
          vec2 mouseInfluence = mouse * 0.1;
          pos.xy += mouseInfluence;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
          float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
          
          gl_FragColor = vec4(vColor, alpha * 0.8);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }
  
  setupEventListeners() {
    window.addEventListener('resize', this.handleResize.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
  }
  
  handleResize() {
    this.windowHalf.x = window.innerWidth / 2;
    this.windowHalf.y = window.innerHeight / 2;
    
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  handleMouseMove(event) {
    this.mousePosition.x = (event.clientX - this.windowHalf.x) / this.windowHalf.x;
    this.mousePosition.y = -(event.clientY - this.windowHalf.y) / this.windowHalf.y;
  }
  
  startAnimation() {
    const animate = () => {
      requestAnimationFrame(animate);
      this.updateParticles();
      this.render();
    };
    
    animate();
  }
  
  updateParticles() {
    if (!this.particles) return;
    
    const time = Date.now();
    
    // Update shader uniforms
    this.particles.material.uniforms.time.value = time;
    this.particles.material.uniforms.mouse.value.set(
      this.mousePosition.x * 100,
      this.mousePosition.y * 100
    );
    
    // Rotate particle system
    this.particles.rotation.x += 0.0005;
    this.particles.rotation.y += 0.001;
    
    // Camera movement based on mouse
    this.camera.position.x += (this.mousePosition.x * 100 - this.camera.position.x) * 0.05;
    this.camera.position.y += (-this.mousePosition.y * 100 - this.camera.position.y) * 0.05;
    this.camera.lookAt(this.scene.position);
  }
  
  render() {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
  
  destroy() {
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.particles) {
      this.scene.remove(this.particles);
      this.particles.geometry.dispose();
      this.particles.material.dispose();
    }
  }
}

// ===== FLOATING GEOMETRIC SHAPES =====
class FloatingShapes {
  constructor() {
    this.shapes = [];
    this.container = null;
    this.maxShapes = 20;
    
    this.init();
  }
  
  init() {
    this.createContainer();
    this.createShapes();
    this.startAnimation();
  }
  
  createContainer() {
    this.container = document.createElement('div');
    this.container.className = 'floating-shapes';
    this.container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    `;
    
    const heroParticles = document.getElementById('heroParticles');
    if (heroParticles) {
      heroParticles.appendChild(this.container);
    }
  }
  
  createShapes() {
    const shapeTypes = ['circle', 'triangle', 'square', 'hexagon'];
    const colors = ['var(--color-accent-blue)', 'var(--color-accent-purple)', 'var(--color-accent-green)'];
    
    for (let i = 0; i < this.maxShapes; i++) {
      const shape = document.createElement('div');
      const shapeType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 40 + 20;
      
      shape.className = `floating-shape floating-shape-${shapeType}`;
      shape.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        opacity: ${Math.random() * 0.3 + 0.1};
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: float${i} ${Math.random() * 20 + 10}s linear infinite;
      `;
      
      // Apply shape-specific styles
      this.applyShapeStyles(shape, shapeType);
      
      // Create unique animation
      this.createFloatAnimation(shape, i);
      
      this.container.appendChild(shape);
      this.shapes.push({
        element: shape,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 2
      });
    }
  }
  
  applyShapeStyles(shape, shapeType) {
    switch (shapeType) {
      case 'circle':
        shape.style.borderRadius = '50%';
        break;
      case 'triangle':
        shape.style.background = 'transparent';
        shape.style.borderLeft = `${parseInt(shape.style.width) / 2}px solid transparent`;
        shape.style.borderRight = `${parseInt(shape.style.width) / 2}px solid transparent`;
        shape.style.borderBottom = `${parseInt(shape.style.height)}px solid ${shape.style.background}`;
        shape.style.width = '0';
        shape.style.height = '0';
        break;
      case 'square':
        // Default square shape
        break;
      case 'hexagon':
        shape.style.borderRadius = '10%';
        shape.style.transform = 'rotate(45deg)';
        break;
    }
  }
  
  createFloatAnimation(shape, index) {
    const keyframes = `
      @keyframes float${index} {
        0% {
          transform: translate(0, 0) rotate(0deg);
        }
        25% {
          transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(90deg);
        }
        50% {
          transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(180deg);
        }
        75% {
          transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(270deg);
        }
        100% {
          transform: translate(0, 0) rotate(360deg);
        }
      }
    `;
    
    const style = document.createElement('style');
    style.textContent = keyframes;
    document.head.appendChild(style);
  }
  
  startAnimation() {
    const animate = () => {
      this.updateShapes();
      requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  updateShapes() {
    this.shapes.forEach(shape => {
      shape.x += shape.vx;
      shape.y += shape.vy;
      shape.rotation += shape.rotationSpeed;
      
      // Boundary checking
      if (shape.x < 0 || shape.x > window.innerWidth) shape.vx *= -1;
      if (shape.y < 0 || shape.y > window.innerHeight) shape.vy *= -1;
      
      // Apply transform
      shape.element.style.transform = `translate(${shape.x}px, ${shape.y}px) rotate(${shape.rotation}deg)`;
    });
  }
  
  destroy() {
    if (this.container) {
      this.container.remove();
    }
  }
}

// ===== INITIALIZE PARTICLE SYSTEMS =====
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Three.js particle system
  setTimeout(() => {
    window.particleSystem = new ParticleSystem();
  }, 1000);
  
  // Initialize floating shapes
  window.floatingShapes = new FloatingShapes();
});

// ===== EXPORT FOR OTHER MODULES =====
window.ParticleSystem = ParticleSystem;
window.FloatingShapes = FloatingShapes;
