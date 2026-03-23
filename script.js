(function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');

  if (!revealElements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // animate once, not on re-enter
        }
      });
    },
    {
      threshold: 0.12,           // trigger when 12% of element is visible
      rootMargin: '0px 0px -40px 0px', // offset so it fires slightly before bottom edge
    }
  );

  revealElements.forEach((el) => observer.observe(el));
})();

/* 
  NAV SHADOW ON SCROLL
 */

(function initNavShadow() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const SCROLL_THRESHOLD = 40;

  window.addEventListener(
    'scroll',
    () => {
      nav.classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
    },
    { passive: true } // `passive` improves scroll performance
  );
})();


/* 
   MOBILE MENU TOGGLE
 */

(function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  const icon = hamburger.querySelector('i');

  function openMenu() {
    mobileMenu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    if (icon) icon.className = 'fa-solid fa-xmark text-lg';
  }

  function closeMenu() {
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    if (icon) icon.className = 'fa-solid fa-bars text-lg';
  }

  // Toggle on hamburger click
  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  // Auto-close when any nav link is clicked
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMenu();
      hamburger.focus();
    }
  });
})();


/* 
  SMOOTH SCROLLING
 */

(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetSelector = anchor.getAttribute('href');
      if (targetSelector === '#') return; // skip bare "#" links

      const target = document.querySelector(targetSelector);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();


/* 
  CONTACT FORM
 */

(function initContactForm() {
  const form       = document.getElementById('contact-form');
  const submitBtn  = document.getElementById('submit-btn');
  const successMsg = document.getElementById('form-success');
  const errorMsg   = document.getElementById('form-error');

  if (!form) return; // guard: don't run if element missing

  // Helpers

  function showMessage(el) {
    successMsg.classList.add('hidden');
    errorMsg.classList.add('hidden');
    el.classList.remove('hidden');
    // Scroll the message into view on mobile
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function setSubmitting(isSubmitting) {
    submitBtn.disabled = isSubmitting;
    submitBtn.innerHTML = isSubmitting
      ? '<i class="fa-solid fa-spinner fa-spin text-xs"></i> Sending…'
      : '<i class="fa-regular fa-paper-plane text-xs"></i> Send Message';
  }

  // Validation

  function validate() {
    const name    = form.elements['name'].value.trim();
    const email   = form.elements['email'].value.trim();
    const message = form.elements['message'].value.trim();

    if (!name || !email || !message) {
      errorMsg.textContent = '⚠ Please fill in your name, email, and message.';
      showMessage(errorMsg);
      return false;
    }

    // Basic email format check
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      errorMsg.textContent = '⚠ Please enter a valid email address.';
      showMessage(errorMsg);
      return false;
    }

    return true;
  }

  // Submit handler

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear old messages first
    successMsg.classList.add('hidden');
    errorMsg.classList.add('hidden');

    if (!validate()) return;

    setSubmitting(true);

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        form.reset();
        showMessage(successMsg);
      } else {
        // Formspree returns error details in JSON — log for debugging
        const data = await response.json().catch(() => ({}));
        console.warn('Formspree error:', data);
        throw new Error('Server returned an error');
      }
    } catch (err) {
      console.error('Form submission failed:', err);
      errorMsg.textContent = '⚠ Something went wrong. Please email me directly.';
      showMessage(errorMsg);
    } finally {
      setSubmitting(false);
    }
  });
})();
