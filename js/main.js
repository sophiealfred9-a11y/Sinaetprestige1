/* ========================================
   SINA & PRESTIGE - MAIN JAVASCRIPT
   Production-ready interactive features
   ======================================== */

'use strict';

// Top bar functionality
function initTopBar() {
  const topBar = document.getElementById('topBar');
  if (!topBar) return;

  const closeBtn = topBar.querySelector('.top-bar-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      topBar.classList.add('hidden');
      document.body.classList.remove('has-top-bar');
      // Store preference in localStorage (persists across page reloads)
      localStorage.setItem('topBarVisible', 'false');
    });
  }

  // Top bar is ALWAYS visible by default on page reload
  // Only hide if user explicitly closed it in localStorage
  if (localStorage.getItem('topBarVisible') === 'false') {
    topBar.classList.add('hidden');
    document.body.classList.remove('has-top-bar');
  } else {
    // Default: show top bar
    topBar.classList.remove('hidden');
    document.body.classList.add('has-top-bar');
  }
}

// Form validation
function initFormValidation() {
  const forms = document.querySelectorAll('form');

  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      // Get all required fields
      const requiredFields = this.querySelectorAll('[required]');
      let isValid = true;
      const errors = [];

      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          isValid = false;
          errors.push(`${field.labels[0]?.textContent || 'Field'} est requis`);
          field.setAttribute('aria-invalid', 'true');
        } else {
          field.setAttribute('aria-invalid', 'false');
        }

        // Email validation
        if (field.type === 'email' && field.value.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(field.value)) {
            isValid = false;
            errors.push('Email invalide');
            field.setAttribute('aria-invalid', 'true');
          }
        }
      });

      if (!isValid) {
        e.preventDefault();
        // Show error messages with animation
        const errorContainer = document.createElement('div');
        errorContainer.className = 'form-errors';
        errorContainer.setAttribute('role', 'alert');
        errorContainer.innerHTML = '<strong>Erreurs:</strong><ul><li>' + errors.join('</li><li>') + '</li></ul>';
        errorContainer.style.cssText = `
          background: #fee;
          border: 1px solid #f99;
          color: #c33;
          padding: 1rem;
          margin-bottom: 1rem;
          border-radius: 4px;
          animation: slideDown 0.4s ease-out;
        `;

        const oldErrors = form.querySelectorAll('.form-errors');
        oldErrors.forEach(err => err.remove());

        form.insertBefore(errorContainer, form.firstChild);
        errorContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    // Remove error on input and add smooth transitions
    form.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('change', function() {
        if (this.value.trim()) {
          this.setAttribute('aria-invalid', 'false');
          this.style.animation = 'none';
        }
      });

      // Add focus animation
      field.addEventListener('focus', function() {
        this.style.transform = 'scale(1.01)';
      });

      field.addEventListener('blur', function() {
        this.style.transform = 'scale(1)';
      });
    });
  });
}

// Smooth scroll behavior for anchor links
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Lazy load images with fade-in animation
function initLazyLoading() {
  // Check if IntersectionObserver is supported
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px'
    });

    // Observe all images with loading="lazy" attribute
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

// Mobile menu toggle
function initMobileMenu() {
  const nav = document.querySelector('.site-nav-modern');
  const menu = document.getElementById('siteMenu');
  const toggle = document.querySelector('.site-menu-toggle');
  if (!nav || !menu || !toggle) return;

  const closeMenu = () => {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Ouvrir le menu');
    toggle.classList.remove('is-open');
  };

  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    const open = !menu.classList.contains('is-open');
    menu.classList.toggle('is-open', open);
    toggle.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  });

  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closeMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  const mq = window.matchMedia('(min-width: 981px)');
  const sync = () => { if (mq.matches) closeMenu(); };
  mq.addEventListener?.('change', sync);
}

// Animate elements on scroll
function initScrollAnimations() {
  if ('IntersectionObserver' in window) {
    const animateOnScroll = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const animationType = entry.target.getAttribute('data-animate') || 'fadeIn';
          entry.target.style.animation = `${animationType} 0.8s ease-out forwards`;
          animateOnScroll.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe all sections and cards
    document.querySelectorAll('section, .card, .offer-card, .program-card, .detail-card').forEach(el => {
      el.style.opacity = '0';
      el.style.animation = 'none';
      animateOnScroll.observe(el);
    });

    // Also observe elements with data-animate attribute
    document.querySelectorAll('[data-animate]').forEach(el => {
      animateOnScroll.observe(el);
    });
  }
}

// Add focus indicators for keyboard navigation
function initKeyboardNav() {
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-nav');
    }
  });

  document.addEventListener('click', function() {
    document.body.classList.remove('keyboard-nav');
  });
}

// Track analytics events (placeholder for actual implementation)
function initAnalytics() {
  // Add data attributes to track clicks
  document.querySelectorAll('a[href*="contact"]').forEach(link => {
    link.addEventListener('click', function() {
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'click_contact',
          link: this.href
        });
      }
    });
  });

  // Track form submissions
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function() {
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'form_submit',
          form_name: this.name || this.id
        });
      }
    });
  });
}

// Robot chatbot widget
function initRobotWidget() {
  // Create robot widget HTML
  const robotHTML = `
    <div id="robot-widget" class="robot-widget" aria-label="Robot assistant">
      <button id="robot-toggle" class="robot-toggle" aria-label="Open robot assistant" title="Besoin d'aide?">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="9" x2="15" y2="9"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
      </button>

      <div id="robot-chat" class="robot-chat" style="display: none;">
        <div class="robot-header">
          <h3>Sina & Prestige Bot</h3>
          <button id="robot-close" class="robot-close" aria-label="Close chat">&times;</button>
        </div>
        <div class="robot-messages">
          <div class="robot-message bot">
            <p>Bonjour! 👋 Besoin d'aide pour trouver une formation ou en savoir plus sur nos services?</p>
          </div>
        </div>
        <div class="robot-input">
          <input type="text" id="robot-text" placeholder="Posez votre question..." />
          <button id="robot-send" aria-label="Send message">↓</button>
        </div>
      </div>
    </div>
  `;

  // Insert robot widget before closing body tag
  if (document.body) {
    document.body.insertAdjacentHTML('beforeend', robotHTML);
  }

  // Add event listeners
  const toggle = document.getElementById('robot-toggle');
  const closeBtn = document.getElementById('robot-close');
  const chatBox = document.getElementById('robot-chat');
  const sendBtn = document.getElementById('robot-send');
  const input = document.getElementById('robot-text');
  const messagesDiv = document.querySelector('.robot-messages');

  if (toggle) {
    toggle.addEventListener('click', function() {
      chatBox.style.display = chatBox.style.display === 'none' ? 'flex' : 'none';
      if (chatBox.style.display === 'flex') {
        input.focus();
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      chatBox.style.display = 'none';
    });
  }

  if (sendBtn && input && messagesDiv) {
    sendBtn.addEventListener('click', function() {
      const text = input.value.trim();
      if (text) {
        // Add user message
        const userMsg = document.createElement('div');
        userMsg.className = 'robot-message user';
        userMsg.innerHTML = `<p>${text}</p>`;
        messagesDiv.appendChild(userMsg);

        // Clear input
        input.value = '';

        // Simulate bot response
        setTimeout(() => {
          const botMsg = document.createElement('div');
          botMsg.className = 'robot-message bot';

          // Simple responses
          const responses = {
            'formation': 'Découvrez nos 8 formations certifiées Qualiopi: Gestion de Projet, RH, IA, Data, IT, Cloud, Commerce et Employabilité!',
            'prix': 'Nos formations commencent à partir de 450€ HT en groupe. Contactez-nous pour un devis personnalisé!',
            'contact': 'Vous pouvez nous contacter à contact@sinaetprestige.fr ou via notre formulaire de contact.',
            'recrutement': 'Nous recrutons des profils IT, IA, commerciaux, formateurs et alternants. Consultez notre page Recrutement!',
            'rh': 'Nos services RH incluent: diagnostic RH, qualité formation, appels d\'offres et pilotage KPI.',
            'default': 'Merci de votre question! Pour plus d\'informations, visitez nos pages ou contactez notre équipe.'
          };

          let response = responses.default;
          const lowText = text.toLowerCase();
          for (let key in responses) {
            if (lowText.includes(key)) {
              response = responses[key];
              break;
            }
          }

          botMsg.innerHTML = `<p>${response}</p>`;
          messagesDiv.appendChild(botMsg);

          // Scroll to bottom
          messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }, 500);
      }
    });

    // Allow Enter key to send
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendBtn.click();
      }
    });
  }
}

// Initialize all features
document.addEventListener('DOMContentLoaded', function() {
  initTopBar();
  initFormValidation();
  initSmoothScroll();
  initLazyLoading();
  initScrollAnimations();
  initKeyboardNav();
  initAnalytics();
  initMobileMenu();
  // initRobotWidget(); // DISABLED - AI chat removed
});

// Utility function: Add animation to element
function animateElement(element, animation = 'fadeIn', duration = 600) {
  element.style.animation = `${animation} ${duration}ms ease-out forwards`;
}

// Utility function: Detect if element is in viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Export for use in other scripts
window.SinaPrestige = {
  animateElement,
  isInViewport
};
