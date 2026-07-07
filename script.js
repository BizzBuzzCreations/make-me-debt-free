/* ===================================
   MakeMeDebtFree – script.js
   =================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================
     SCROLL PROGRESS BAR
     ========================================== */
  const progressBar = document.getElementById('scrollProgress');

  function updateScrollProgress() {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  /* ==========================================
     STICKY NAVBAR + ACTIVE LINK HIGHLIGHT
     ========================================== */
  const navbar   = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function updateNavbar() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  function updateActiveLink() {
    let currentSection = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 100;
      if (window.scrollY >= top) {
        currentSection = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + currentSection) {
        link.classList.add('active');
      }
    });
  }

  /* ==========================================
     HAMBURGER / MOBILE MENU
     ========================================== */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close on link click
  mobileMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  /* ==========================================
     SMOOTH SCROLL for anchor links
     ========================================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ==========================================
     SCROLL REVEAL ANIMATION
     ========================================== */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings in the same parent grid/flex
        const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal:not(.visible)'));
        const idx      = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, idx * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ==========================================
     ANIMATED COUNTERS
     ========================================== */
  const counters = document.querySelectorAll('.trust-number[data-target]');

  function animateCounter(el) {
    const target  = parseInt(el.dataset.target, 10);
    const prefix  = el.dataset.prefix  || '';
    const suffix  = el.dataset.suffix  || '';
    const duration = 2000;
    const step     = 16;
    const steps    = duration / step;
    let   current  = 0;

    const timer = setInterval(() => {
      current += target / steps;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
    }, step);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  /* ==========================================
     TESTIMONIALS CAROUSEL
     ========================================== */
  const track      = document.getElementById('testimonialsTrack');
  const cards      = track ? Array.from(track.children) : [];
  const dotsWrap   = document.getElementById('carouselDots');
  const prevBtn    = document.getElementById('prevBtn');
  const nextBtn    = document.getElementById('nextBtn');

  if (track && cards.length) {
    let current   = 0;
    let perView   = getPerView();
    let maxIndex  = Math.max(0, cards.length - perView);
    let autoTimer = null;

    function getPerView() {
      if (window.innerWidth <= 768)  return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    function buildDots() {
      dotsWrap.innerHTML = '';
      const count = maxIndex + 1;
      for (let i = 0; i < count; i++) {
        const dot = document.createElement('button');
        dot.className = 'dot' + (i === current ? ' active' : '');
        dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
      }
    }

    function updateDots() {
      dotsWrap.querySelectorAll('.dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }

    function getCardWidth() {
      if (!cards[0]) return 0;
      const style  = window.getComputedStyle(track);
      const gap    = parseFloat(style.gap) || 24;
      const total  = track.parentElement.offsetWidth;
      return (total - gap * (perView - 1)) / perView;
    }

    function goTo(idx) {
      current = Math.max(0, Math.min(idx, maxIndex));
      const cw    = getCardWidth();
      const gap   = parseFloat(window.getComputedStyle(track).gap) || 0;
      const shift = current * (cw + gap);
      track.style.transform = `translateX(-${shift}px)`;
      updateDots();
    }

    function next() { goTo(current >= maxIndex ? 0 : current + 1); }
    function prev() { goTo(current <= 0 ? maxIndex : current - 1); }

    function startAuto() {
      stopAuto();
      autoTimer = setInterval(next, 4500);
    }

    function stopAuto() {
      clearInterval(autoTimer);
    }

    prevBtn.addEventListener('click', () => { prev(); startAuto(); });
    nextBtn.addEventListener('click', () => { next(); startAuto(); });

    track.addEventListener('mouseenter', stopAuto);
    track.addEventListener('mouseleave', startAuto);

    // Touch / swipe support
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        diff > 0 ? next() : prev();
        startAuto();
      }
    });

    function recalc() {
      perView  = getPerView();
      maxIndex = Math.max(0, cards.length - perView);
      current  = Math.min(current, maxIndex);
      buildDots();
      goTo(current);
    }

    window.addEventListener('resize', recalc);

    recalc();
    startAuto();
  }

  /* ==========================================
     FAQ ACCORDION
     ========================================== */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const btn    = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all others
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current
      item.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', !isOpen);
    });
  });

  /* ==========================================
     CONTACT FORM VALIDATION
     ========================================== */
  const form       = document.getElementById('contactForm');
  const submitBtn  = document.getElementById('submitBtn');
  const formSuccess = document.getElementById('formSuccess');

  function setError(fieldId, errId, msg) {
    const field = document.getElementById(fieldId);
    const err   = document.getElementById(errId);
    if (msg) {
      field && field.classList.add('error');
      if (err) err.textContent = msg;
    } else {
      field && field.classList.remove('error');
      if (err) err.textContent = '';
    }
  }

  function validateEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function validatePhone(v) {
    return /^[\d\s\+\-\(\)]{7,15}$/.test(v.trim());
  }

  function validateForm() {
    let valid = true;

    const name      = document.getElementById('name').value.trim();
    const email     = document.getElementById('email').value.trim();
    const phone     = document.getElementById('phone').value.trim();
    const debt      = document.getElementById('debtAmount').value;
    const consent   = document.getElementById('consent').checked;

    if (!name || name.length < 2) {
      setError('name', 'nameError', 'Please enter your full name.');
      valid = false;
    } else {
      setError('name', 'nameError', '');
    }

    if (!email || !validateEmail(email)) {
      setError('email', 'emailError', 'Please enter a valid email address.');
      valid = false;
    } else {
      setError('email', 'emailError', '');
    }

    if (!phone || !validatePhone(phone)) {
      setError('phone', 'phoneError', 'Please enter a valid phone number.');
      valid = false;
    } else {
      setError('phone', 'phoneError', '');
    }

    if (!debt) {
      setError('debtAmount', 'debtError', 'Please select your total debt amount.');
      valid = false;
    } else {
      setError('debtAmount', 'debtError', '');
    }

    if (!consent) {
      document.getElementById('consentError').textContent = 'You must agree to be contacted.';
      valid = false;
    } else {
      document.getElementById('consentError').textContent = '';
    }

    return valid;
  }

  // Live validation on blur
  ['name', 'email', 'phone', 'debtAmount'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('blur', validateForm);
      el.addEventListener('input', () => {
        el.classList.remove('error');
        const errEl = document.getElementById(id + 'Error') || document.getElementById(id.charAt(0).toUpperCase() + id.slice(1) + 'Error');
        if (errEl) errEl.textContent = '';
      });
    }
  });

  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!validateForm()) return;

      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      try {
        const formData = new FormData(form);
        const payload = {
          name:              formData.get('name'),
          email:             formData.get('email'),
          phone:             formData.get('phone'),
          'Total Debt Amount': formData.get('debtAmount'),
          message:           formData.get('message') || '(no message provided)',
          _subject:          'New Debt Help Enquiry - MakeMeDebtFree',
          _template:         'table',
          _captcha:          'false'
        };

        const response = await fetch('https://formsubmit.co/ajax/advisor@makemedebtfree.co.uk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept':       'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;

        if (result.success) {
          submitBtn.style.display = 'none';
          formSuccess.classList.add('show');
          form.reset();
          setTimeout(() => {
            formSuccess.classList.remove('show');
            submitBtn.style.display = '';
          }, 6000);
        } else {
          throw new Error('Submission failed');
        }
      } catch (err) {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        alert('Something went wrong. Please email us directly at advisor@makemedebtfree.co.uk');
      }
    });
  }

  /* ==========================================
     POPUP FORM (shows after 5 seconds)
     ========================================== */
  const popupOverlay   = document.getElementById('popupOverlay');
  const popupClose     = document.getElementById('popupClose');
  const popupForm      = document.getElementById('popupForm');
  const popupSubmitBtn = document.getElementById('popupSubmitBtn');
  const popupSuccess   = document.getElementById('popupSuccess');

  function openPopup() {
    if (sessionStorage.getItem('popupShown')) return;
    popupOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closePopup() {
    popupOverlay.classList.remove('active');
    document.body.style.overflow = '';
    sessionStorage.setItem('popupShown', '1');
  }

  setTimeout(openPopup, 5000);

  if (popupClose) popupClose.addEventListener('click', closePopup);

  popupOverlay.addEventListener('click', e => {
    if (e.target === popupOverlay) closePopup();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closePopup();
  });

  function popupSetError(inputId, errorId, msg) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    if (msg) {
      input && input.classList.add('popup-input-error');
      if (error) error.textContent = msg;
    } else {
      input && input.classList.remove('popup-input-error');
      if (error) error.textContent = '';
    }
  }

  function validatePopupForm() {
    let valid = true;
    const name    = document.getElementById('popupName').value.trim();
    const phone   = document.getElementById('popupPhone').value.trim();
    const email   = document.getElementById('popupEmail').value.trim();
    const consent = document.getElementById('popupConsent').checked;

    if (!name || name.length < 2) {
      popupSetError('popupName', 'popupNameError', 'Please enter your full name.');
      valid = false;
    } else {
      popupSetError('popupName', 'popupNameError', '');
    }

    if (!phone || !validatePhone(phone)) {
      popupSetError('popupPhone', 'popupPhoneError', 'Please enter a valid mobile number.');
      valid = false;
    } else {
      popupSetError('popupPhone', 'popupPhoneError', '');
    }

    if (!email || !validateEmail(email)) {
      popupSetError('popupEmail', 'popupEmailError', 'Please enter a valid email address.');
      valid = false;
    } else {
      popupSetError('popupEmail', 'popupEmailError', '');
    }

    if (!consent) {
      document.getElementById('popupConsentError').textContent = 'You must agree to be contacted.';
      valid = false;
    } else {
      document.getElementById('popupConsentError').textContent = '';
    }

    return valid;
  }

  if (popupForm) {
    popupForm.addEventListener('submit', async e => {
      e.preventDefault();
      if (!validatePopupForm()) return;

      popupSubmitBtn.classList.add('loading');
      popupSubmitBtn.disabled = true;

      try {
        const payload = {
          name:     document.getElementById('popupName').value.trim(),
          phone:    document.getElementById('popupPhone').value.trim(),
          email:    document.getElementById('popupEmail').value.trim(),
          _subject: 'New Popup Enquiry - MakeMeDebtFree',
          _template: 'table',
          _captcha: 'false'
        };

        const response = await fetch('https://formsubmit.co/ajax/advisor@makemedebtfree.co.uk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        popupSubmitBtn.classList.remove('loading');
        popupSubmitBtn.disabled = false;

        if (result.success) {
          popupSubmitBtn.style.display = 'none';
          popupSuccess.classList.add('show');
          popupForm.reset();
          setTimeout(closePopup, 3000);
        } else {
          throw new Error('Submission failed');
        }
      } catch (err) {
        popupSubmitBtn.classList.remove('loading');
        popupSubmitBtn.disabled = false;
        alert('Something went wrong. Please email us directly at advisor@makemedebtfree.co.uk');
      }
    });
  }

  /* ==========================================
     BACK TO TOP BUTTON
     ========================================== */
  const backToTop = document.getElementById('backToTop');

  function updateBackToTop() {
    if (window.scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ==========================================
     UNIFIED SCROLL HANDLER
     ========================================== */
  function onScroll() {
    updateScrollProgress();
    updateNavbar();
    updateActiveLink();
    updateBackToTop();
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Run once on load
  onScroll();

  /* ==========================================
     HERO SHAPE PARALLAX (subtle)
     ========================================== */
  const heroShapes = document.querySelectorAll('.shape');

  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    heroShapes.forEach((shape, i) => {
      const speed = 0.08 + i * 0.04;
      shape.style.transform = `translateY(${sy * speed}px)`;
    });
  }, { passive: true });

  /* ==========================================
     CARD TILT EFFECT (desktop only)
     ========================================== */
  if (window.innerWidth > 768) {
    document.querySelectorAll('.solution-card, .why-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect  = card.getBoundingClientRect();
        const x     = (e.clientX - rect.left) / rect.width  - 0.5;
        const y     = (e.clientY - rect.top)  / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-6px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ==========================================
     NUMBER FORMAT HELPER for counter reset
     ========================================== */
  counters.forEach(el => {
    if (!el.dataset.target) return;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    el.textContent = prefix + '0' + suffix;
  });

});
