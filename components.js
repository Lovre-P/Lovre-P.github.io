/**
 * Component Loading and Path Detection
 * This script handles dynamic component loading and path correction for navigation
 */

// Detect if the current page is in a subdirectory
const isInSubdirectory = window.location.pathname.split('/').filter(Boolean).length > 1;
const basePath = isInSubdirectory ? '../' : './';

/**
 * Load a component via fetch and insert it into the specified element
 * @param {string} componentPath - Path to the component HTML file
 * @param {string} targetElementId - ID of the element to insert the component into
 * @param {Function} callback - Optional callback function to run after component is loaded
 */
function loadComponent(componentPath, targetElementId, callback = null) {
    const fullPath = `${basePath}${componentPath}`;
    
    fetch(fullPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load component: ${fullPath}`);
            }
            return response.text();
        })
        .then(html => {
            document.getElementById(targetElementId).innerHTML = html;
            if (callback && typeof callback === 'function') {
                callback();
            }
        })
        .catch(error => {
            console.error('Error loading component:', error);
        });
}

/**
 * Fix navigation links based on page location
 */
function fixLinks() {
    // Fix home link
    const homeLink = document.getElementById('home-link');
    if (homeLink) {
        homeLink.setAttribute('href', isInSubdirectory ? '../index.html' : 'index.html');
    }
    
    // Fix portfolio link
    const portfolioLink = document.getElementById('portfolio-link');
    if (portfolioLink) {
        portfolioLink.setAttribute('href', isInSubdirectory ? '../portfolio.html' : 'portfolio.html');
    }
    
    // Fix about link
    const aboutLink = document.getElementById('about-link');
    if (aboutLink) {
        aboutLink.setAttribute('href', isInSubdirectory ? '../index.html#about' : 'index.html#about');
    }
    
    // Fix contact link
    const contactLink = document.getElementById('contact-link');
    if (contactLink) {
        contactLink.setAttribute('href', isInSubdirectory ? '../index.html#contact' : 'index.html#contact');
    }
    
    // Fix submit form link
    const submitFormLink = document.getElementById('submit-form-link');
    if (submitFormLink) {
        submitFormLink.setAttribute('href', isInSubdirectory ? '../submit-form.html' : 'submit-form.html');
    }
    
    // Fix oblutak link
    const oblutakLink = document.getElementById('oblutak-link');
    if (oblutakLink) {
        oblutakLink.setAttribute('href', isInSubdirectory ? '../oblutak/index.html' : 'oblutak/index.html');
    }
}

/**
 * Load all components and fix links
 */
function initComponents() {
    // Example: Load header component
    // loadComponent('components/header.html', 'header-container', fixLinks);
    
    // Since we don't have components yet, just fix the links
    fixLinks();
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initComponents);
