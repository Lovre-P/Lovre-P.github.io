// ===== CONTACT FORM FUNCTIONALITY =====
class ContactForm {
  constructor() {
    this.form = document.getElementById('contactForm');
    this.fields = {};
    this.isSubmitting = false;
    this.validationRules = {
      name: {
        required: true,
        minLength: 2,
        pattern: /^[a-zA-Z\s]+$/
      },
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      },
      message: {
        required: true,
        minLength: 10,
        maxLength: 1000
      }
    };
    
    this.init();
  }
  
  init() {
    if (!this.form) return;
    
    this.setupFormFields();
    this.setupEventListeners();
    this.setupFloatingLabels();
    this.setupRealTimeValidation();
  }
  
  setupFormFields() {
    this.fields = {
      name: this.form.querySelector('#name'),
      email: this.form.querySelector('#email'),
      message: this.form.querySelector('#message')
    };
  }
  
  setupEventListeners() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
    
    // Add input event listeners for real-time validation
    Object.keys(this.fields).forEach(fieldName => {
      const field = this.fields[fieldName];
      if (field) {
        field.addEventListener('input', () => this.validateField(fieldName));
        field.addEventListener('blur', () => this.validateField(fieldName));
        field.addEventListener('focus', () => this.clearFieldError(fieldName));
      }
    });
  }
  
  setupFloatingLabels() {
    Object.values(this.fields).forEach(field => {
      if (field) {
        const label = field.nextElementSibling;
        
        // Check if field has value on load
        if (field.value.trim() !== '') {
          label.classList.add('active');
        }
        
        field.addEventListener('focus', () => {
          label.classList.add('active');
        });
        
        field.addEventListener('blur', () => {
          if (field.value.trim() === '') {
            label.classList.remove('active');
          }
        });
      }
    });
  }
  
  setupRealTimeValidation() {
    // Add visual feedback for validation
    const style = document.createElement('style');
    style.textContent = `
      .form-group.error input,
      .form-group.error textarea {
        border-color: #ef4444;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
      }
      
      .form-group.success input,
      .form-group.success textarea {
        border-color: var(--color-accent-green);
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
      }
      
      .form-error {
        color: #ef4444;
        font-size: 0.8rem;
        margin-top: 0.25rem;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s ease;
      }
      
      .form-error.show {
        opacity: 1;
        transform: translateY(0);
      }
      
      .form-success {
        color: var(--color-accent-green);
        font-size: 0.8rem;
        margin-top: 0.25rem;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s ease;
      }
      
      .form-success.show {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);
  }
  
  validateField(fieldName) {
    const field = this.fields[fieldName];
    const rules = this.validationRules[fieldName];
    const value = field.value.trim();
    const formGroup = field.closest('.form-group');
    
    // Clear previous validation state
    this.clearFieldError(fieldName);
    
    // Required validation
    if (rules.required && !value) {
      this.showFieldError(fieldName, `${this.capitalizeFirst(fieldName)} is required`);
      return false;
    }
    
    // Pattern validation
    if (rules.pattern && value && !rules.pattern.test(value)) {
      let errorMessage = '';
      switch (fieldName) {
        case 'name':
          errorMessage = 'Please enter a valid name (letters only)';
          break;
        case 'email':
          errorMessage = 'Please enter a valid email address';
          break;
        default:
          errorMessage = `Invalid ${fieldName} format`;
      }
      this.showFieldError(fieldName, errorMessage);
      return false;
    }
    
    // Length validation
    if (rules.minLength && value.length < rules.minLength) {
      this.showFieldError(fieldName, `${this.capitalizeFirst(fieldName)} must be at least ${rules.minLength} characters`);
      return false;
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
      this.showFieldError(fieldName, `${this.capitalizeFirst(fieldName)} must be less than ${rules.maxLength} characters`);
      return false;
    }
    
    // If we get here, validation passed
    this.showFieldSuccess(fieldName);
    return true;
  }
  
  showFieldError(fieldName, message) {
    const field = this.fields[fieldName];
    const formGroup = field.closest('.form-group');
    
    formGroup.classList.remove('success');
    formGroup.classList.add('error');
    
    // Remove existing error message
    const existingError = formGroup.querySelector('.form-error');
    if (existingError) {
      existingError.remove();
    }
    
    // Add new error message
    const errorElement = document.createElement('div');
    errorElement.className = 'form-error';
    errorElement.textContent = message;
    formGroup.appendChild(errorElement);
    
    // Trigger animation
    setTimeout(() => {
      errorElement.classList.add('show');
    }, 10);
  }
  
  showFieldSuccess(fieldName) {
    const field = this.fields[fieldName];
    const formGroup = field.closest('.form-group');
    
    formGroup.classList.remove('error');
    formGroup.classList.add('success');
    
    // Remove error message
    const existingError = formGroup.querySelector('.form-error');
    if (existingError) {
      existingError.remove();
    }
  }
  
  clearFieldError(fieldName) {
    const field = this.fields[fieldName];
    const formGroup = field.closest('.form-group');
    
    formGroup.classList.remove('error', 'success');
    
    const errorElement = formGroup.querySelector('.form-error');
    if (errorElement) {
      errorElement.classList.remove('show');
      setTimeout(() => {
        if (errorElement.parentNode) {
          errorElement.remove();
        }
      }, 300);
    }
  }
  
  validateForm() {
    let isValid = true;
    
    Object.keys(this.fields).forEach(fieldName => {
      if (!this.validateField(fieldName)) {
        isValid = false;
      }
    });
    
    return isValid;
  }
  
  async handleSubmit(event) {
    event.preventDefault();
    
    if (this.isSubmitting) return;
    
    // Validate form
    if (!this.validateForm()) {
      this.showFormMessage('Please fix the errors above', 'error');
      return;
    }
    
    this.isSubmitting = true;
    this.showLoadingState();
    
    try {
      // Simulate form submission (replace with actual endpoint)
      await this.submitForm();
      this.showSuccessState();
      this.resetForm();
    } catch (error) {
      this.showErrorState(error.message);
    } finally {
      this.isSubmitting = false;
    }
  }
  
  async submitForm() {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate success/failure
        if (Math.random() > 0.1) { // 90% success rate for demo
          resolve({ success: true });
        } else {
          reject(new Error('Failed to send message. Please try again.'));
        }
      }, 2000);
    });
    
    // In a real application, you would make an actual API call:
    /*
    const formData = new FormData(this.form);
    const response = await fetch('/api/contact', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
    
    return response.json();
    */
  }
  
  showLoadingState() {
    const submitButton = this.form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    submitButton.disabled = true;
    submitButton.innerHTML = `
      <div class="spinner spinner-small"></div>
      <span>Sending...</span>
    `;
    
    // Store original text for restoration
    submitButton.dataset.originalText = originalText;
  }
  
  showSuccessState() {
    this.showFormMessage('Message sent successfully! I\'ll get back to you soon.', 'success');
    this.resetSubmitButton();
    
    // Add success animation
    if (typeof gsap !== 'undefined') {
      gsap.from('.alert-success', {
        scale: 0.8,
        opacity: 0,
        duration: 0.5,
        ease: 'back.out(1.7)'
      });
    }
  }
  
  showErrorState(message) {
    this.showFormMessage(message, 'error');
    this.resetSubmitButton();
  }
  
  resetSubmitButton() {
    const submitButton = this.form.querySelector('button[type="submit"]');
    const originalText = submitButton.dataset.originalText;
    
    submitButton.disabled = false;
    submitButton.innerHTML = originalText || `
      <span class="btn-text">Send Message</span>
      <span class="btn-arrow">→</span>
    `;
  }
  
  showFormMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.form-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageElement = document.createElement('div');
    messageElement.className = `alert alert-${type} form-message`;
    messageElement.textContent = message;
    
    // Insert before form
    this.form.parentNode.insertBefore(messageElement, this.form);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.remove();
      }
    }, 5000);
  }
  
  resetForm() {
    this.form.reset();
    
    // Reset floating labels
    Object.values(this.fields).forEach(field => {
      if (field) {
        const label = field.nextElementSibling;
        label.classList.remove('active');
        
        const formGroup = field.closest('.form-group');
        formGroup.classList.remove('error', 'success');
      }
    });
    
    // Clear any error messages
    const errorMessages = this.form.querySelectorAll('.form-error');
    errorMessages.forEach(msg => msg.remove());
  }
  
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// ===== FORM ENHANCEMENTS =====
class FormEnhancements {
  constructor() {
    this.setupCharacterCounters();
    this.setupFormAnimations();
  }
  
  setupCharacterCounters() {
    const messageField = document.getElementById('message');
    if (messageField) {
      const maxLength = 1000;
      const counter = document.createElement('div');
      counter.className = 'character-counter';
      counter.style.cssText = `
        text-align: right;
        font-size: 0.8rem;
        color: var(--color-text-muted);
        margin-top: 0.25rem;
      `;
      
      messageField.parentNode.appendChild(counter);
      
      const updateCounter = () => {
        const remaining = maxLength - messageField.value.length;
        counter.textContent = `${remaining} characters remaining`;
        
        if (remaining < 50) {
          counter.style.color = '#ef4444';
        } else if (remaining < 100) {
          counter.style.color = '#f59e0b';
        } else {
          counter.style.color = 'var(--color-text-muted)';
        }
      };
      
      messageField.addEventListener('input', updateCounter);
      updateCounter();
    }
  }
  
  setupFormAnimations() {
    const formGroups = document.querySelectorAll('.form-group');
    
    // Animate form groups on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    });
    
    formGroups.forEach((group, index) => {
      group.style.opacity = '0';
      group.style.transform = 'translateY(30px)';
      group.style.transition = `all 0.6s ease ${index * 0.1}s`;
      observer.observe(group);
    });
  }
}

// ===== INITIALIZE CONTACT FORM =====
document.addEventListener('DOMContentLoaded', () => {
  window.contactForm = new ContactForm();
  window.formEnhancements = new FormEnhancements();
});

// ===== EXPORT FOR OTHER MODULES =====
window.ContactForm = ContactForm;
window.FormEnhancements = FormEnhancements;
