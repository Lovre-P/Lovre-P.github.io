# Advanced Portfolio Website

A cutting-edge web development portfolio featuring modern design, advanced animations, and interactive elements.

## 🚀 Features

### Design & Visual
- **Ultra-Modern Dark Theme** with glassmorphism effects
- **Neon Accent System** with electric blue, purple, and green highlights
- **Responsive Design** optimized for all devices
- **Custom Cursor Effects** with magnetic interactions
- **Particle Systems** powered by Three.js
- **Smooth Animations** using GSAP

### Interactive Elements
- **Magnetic Cursor** that responds to interactive elements
- **Scroll-Driven Animations** with parallax effects
- **Project Showcase** with filtering and modal views
- **Contact Form** with real-time validation
- **Theme Switcher** with smooth transitions
- **Loading Animations** and micro-interactions

### Performance & Accessibility
- **Core Web Vitals** optimization
- **Lazy Loading** for images and content
- **Service Worker** for caching (when deployed)
- **Accessibility Features** with ARIA labels and keyboard navigation
- **SEO Optimized** with proper meta tags and structured data

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with custom properties
- **JavaScript ES6+** - Modern JavaScript features
- **GSAP** - Professional animations
- **Three.js** - 3D graphics and particle systems
- **Intersection Observer API** - Performance-optimized scroll effects

## 📁 Project Structure

```
portfolio/
├── index.html              # Main HTML file
├── css/
│   ├── main.css            # Core styles and variables
│   ├── animations.css      # Animation definitions
│   ├── components.css      # Reusable components
│   └── responsive.css      # Responsive design
├── js/
│   ├── main.js             # Core application logic
│   ├── animations.js       # GSAP animations
│   ├── cursor.js           # Cursor effects
│   ├── particles.js        # Three.js particle system
│   ├── scroll-effects.js   # Scroll-driven animations
│   ├── theme-switcher.js   # Theme management
│   ├── project-showcase.js # Project filtering and modals
│   ├── contact-form.js     # Form validation and submission
│   └── performance.js      # Performance optimizations
├── assets/
│   ├── images/             # Project images and photos
│   ├── favicon.svg         # Site favicon
│   └── icons/              # UI icons
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser with ES6+ support
- Local web server (for development)

### Installation

1. **Clone or download** this repository
2. **Replace placeholder content** with your own:
   - Update personal information in `index.html`
   - Replace project data in `js/project-showcase.js`
   - Add your profile image to `assets/profile.jpg`
   - Add project screenshots to `assets/`

3. **Customize styling** (optional):
   - Modify color scheme in `css/main.css` (CSS custom properties)
   - Adjust animations in `css/animations.css`
   - Update responsive breakpoints in `css/responsive.css`

4. **Serve locally** for development:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

5. **Deploy to GitHub Pages**:
   - Push to a GitHub repository
   - Enable GitHub Pages in repository settings
   - Select source branch (usually `main` or `gh-pages`)

## 🎨 Customization

### Colors
Update the CSS custom properties in `css/main.css`:
```css
:root {
  --color-accent-blue: #00d4ff;
  --color-accent-purple: #8b5cf6;
  --color-accent-green: #10b981;
}
```

### Content
1. **Personal Information**: Update `index.html`
2. **Projects**: Modify `enhancedProjectsData` in `js/project-showcase.js`
3. **Skills**: Update skill categories in `index.html`
4. **Contact**: Update contact information and form endpoint

### Animations
- **GSAP Animations**: Modify `js/animations.js`
- **CSS Animations**: Update `css/animations.css`
- **Particle Effects**: Customize `js/particles.js`

## 📱 Browser Support

- **Chrome** 80+
- **Firefox** 75+
- **Safari** 13+
- **Edge** 80+

## 🔧 Performance Tips

1. **Optimize Images**: Use WebP format and appropriate sizes
2. **Minimize JavaScript**: Remove unused features if needed
3. **CDN Resources**: Ensure CDN links are working
4. **Caching**: Implement proper cache headers when deploying

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Feel free to fork this project and customize it for your own portfolio. If you make improvements that could benefit others, pull requests are welcome!

## 📞 Support

If you have questions or need help customizing this portfolio:
- Check the code comments for guidance
- Review the browser console for any errors
- Ensure all CDN resources are loading properly

---

**Built with ❤️ for modern web development**
