/* blog.js — Blog-specific JS: nav active state, TOC highlighting, FAQ accordion, sidebar form, modal */

(function () {
  'use strict';

  /* ─── 1. Set Blog nav link active ─────────────────────────────────────────
     script.js's updateActiveLink() clears all .active classes based on visible
     section[id] elements. On blog pages there are no matching section IDs so
     we force the Blog link active on DOMContentLoaded and every scroll.         */

  function setBlogNavActive() {
    document.querySelectorAll('.nav-link').forEach(function (link) {
      link.classList.remove('active');
    });
    var blogLink = document.querySelector('.nav-links a[href="blog.html"]');
    if (blogLink) blogLink.classList.add('active');
  }

  document.addEventListener('DOMContentLoaded', function () {
    setBlogNavActive();
    window.addEventListener('scroll', setBlogNavActive, { passive: true });
  });

  /* ─── 2. Scroll Progress Bar ───────────────────────────────────────────── */
  var progressBar = document.getElementById('scrollProgress');
  if (progressBar) {
    window.addEventListener('scroll', function () {
      var scrolled  = document.documentElement.scrollTop || document.body.scrollTop;
      var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      progressBar.style.width = (docHeight > 0 ? (scrolled / docHeight) * 100 : 0) + '%';
    }, { passive: true });
  }

  /* ─── 3. TOC active section highlighting (new .blog-toc-list selector) ── */
  document.addEventListener('DOMContentLoaded', function () {
    var tocLinks = document.querySelectorAll('.blog-toc-list a');
    if (!tocLinks.length) return;

    var sections = Array.prototype.map.call(tocLinks, function (a) {
      return document.getElementById(a.getAttribute('href').replace('#', ''));
    }).filter(Boolean);

    if (!sections.length) return;

    var activeId = null;

    function setActive(id) {
      if (id === activeId) return;
      activeId = id;
      tocLinks.forEach(function (a) {
        a.classList.toggle('toc-active', a.getAttribute('href') === '#' + id);
      });
    }

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        var visible = entries
          .filter(function (e) { return e.isIntersecting; })
          .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });
        if (visible.length) setActive(visible[0].target.id);
      }, { rootMargin: '-10% 0px -70% 0px', threshold: 0 });

      sections.forEach(function (s) { observer.observe(s); });
    } else {
      window.addEventListener('scroll', function () {
        var scrollY = window.scrollY + window.innerHeight * 0.2;
        var current = sections[0].id;
        sections.forEach(function (s) { if (s.offsetTop <= scrollY) current = s.id; });
        setActive(current);
      }, { passive: true });
    }
  });

  /* ─── 4. Mobile TOC toggle ─────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var toggleBtn = document.getElementById('tocToggle');
    var tocBox    = document.getElementById('tocBox');
    if (!toggleBtn || !tocBox) return;

    toggleBtn.addEventListener('click', function () {
      var expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', String(!expanded));
      tocBox.classList.toggle('toc-open', !expanded);
    });
  });

  /* ─── 5. FAQ accordion ─────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var questions = document.querySelectorAll('.faq-question');
    questions.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item     = btn.closest('.faq-item');
        var answer   = item.querySelector('.faq-answer');
        var expanded = btn.getAttribute('aria-expanded') === 'true';

        document.querySelectorAll('.faq-item').forEach(function (other) {
          if (other !== item) {
            var otherBtn = other.querySelector('.faq-question');
            var otherAns = other.querySelector('.faq-answer');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
            other.classList.remove('faq-open');
            if (otherAns) otherAns.style.maxHeight = '0';
          }
        });

        btn.setAttribute('aria-expanded', String(!expanded));
        item.classList.toggle('faq-open', !expanded);
        if (answer) {
          answer.style.maxHeight = !expanded ? answer.scrollHeight + 'px' : '0';
        }
      });
    });
  });

  /* ─── 6. Thank-you modal helpers ───────────────────────────────────────── */
  function openModal() {
    var modal = document.getElementById('thankYouModal');
    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    var modal = document.getElementById('thankYouModal');
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var closeBtn = document.getElementById('modalCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    var modal = document.getElementById('thankYouModal');
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });
  });

  /* ─── 7. Sidebar contact form — Web3Forms + modal on success ───────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var form      = document.getElementById('sidebarContactForm');
    if (!form) return;

    var nameInput    = document.getElementById('sbName');
    var emailInput   = document.getElementById('sbEmail');
    var phoneInput   = document.getElementById('sbPhone');
    var messageInput = document.getElementById('sbMessage');
    var submitBtn    = document.getElementById('sbSubmitBtn');

    var nameErr    = document.getElementById('sbNameError');
    var emailErr   = document.getElementById('sbEmailError');
    var phoneErr   = document.getElementById('sbPhoneError');
    var messageErr = document.getElementById('sbMessageError');

    function showErr(el, msg) {
      if (!el) return;
      el.textContent = msg || '';
      el.classList.toggle('visible', !!msg);
    }

    function clearErrors() {
      showErr(nameErr, '');
      showErr(emailErr, '');
      showErr(phoneErr, '');
      showErr(messageErr, '');
      [nameInput, emailInput, phoneInput, messageInput].forEach(function (inp) {
        if (inp) inp.classList.remove('has-error');
      });
    }

    function validate() {
      clearErrors();
      var valid = true;

      if (!nameInput || !nameInput.value.trim()) {
        showErr(nameErr, 'Please enter your full name.');
        if (nameInput) nameInput.classList.add('has-error');
        valid = false;
      }

      var email = emailInput ? emailInput.value.trim() : '';
      if (!email) {
        showErr(emailErr, 'Please enter your email address.');
        if (emailInput) emailInput.classList.add('has-error');
        valid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showErr(emailErr, 'Please enter a valid email address.');
        if (emailInput) emailInput.classList.add('has-error');
        valid = false;
      }

      var phone = phoneInput ? phoneInput.value.trim() : '';
      if (!phone) {
        showErr(phoneErr, 'Please enter your phone number.');
        if (phoneInput) phoneInput.classList.add('has-error');
        valid = false;
      } else if (!/^[\d\s+\-()]{7,15}$/.test(phone)) {
        showErr(phoneErr, 'Please enter a valid phone number.');
        if (phoneInput) phoneInput.classList.add('has-error');
        valid = false;
      }

      if (!messageInput || !messageInput.value.trim()) {
        showErr(messageErr, 'Please briefly describe your situation.');
        if (messageInput) messageInput.classList.add('has-error');
        valid = false;
      }

      return valid;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) return;

      submitBtn.disabled    = true;
      submitBtn.textContent = 'Sending…';

      var payload = {
        access_key: '629e0aae-80b8-4000-8382-468d7ce970c2',
        subject:    'New Blog Sidebar Enquiry - MakeMeDebtFree',
        from_name:  'MakeMeDebtFree Blog',
        name:       nameInput ? nameInput.value.trim() : '',
        email:      emailInput ? emailInput.value.trim() : '',
        phone:      phoneInput ? phoneInput.value.trim() : '',
        message:    messageInput ? messageInput.value.trim() : '',
        page:       document.title
      };

      fetch('https://api.web3forms.com/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body:    JSON.stringify(payload)
      })
        .then(function (res) { return res.json(); })
        .then(function (result) {
          if (result.success) {
            form.reset();
            clearErrors();
            openModal();
          } else {
            showErr(emailErr, 'Something went wrong. Please try again.');
          }
          submitBtn.disabled    = false;
          submitBtn.textContent = 'Submit';
        })
        .catch(function () {
          showErr(emailErr, 'Network error. Please check your connection and try again.');
          submitBtn.disabled    = false;
          submitBtn.textContent = 'Submit';
        });
    });
  });

  /* ─── 8. Blog listing page: category filter ─────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var pills   = document.querySelectorAll('.cat-pill');
    var cards   = document.querySelectorAll('#blogGrid .blog-card');
    var noRes   = document.getElementById('noResults');
    if (!pills.length) return;

    function filterCards(cat, query) {
      var visible = 0;
      cards.forEach(function (card) {
        var matchCat   = cat === 'all' || card.getAttribute('data-cat') === cat;
        var matchQuery = !query || (card.getAttribute('data-title') || '').indexOf(query) !== -1;
        var show = matchCat && matchQuery;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      if (noRes) noRes.style.display = visible === 0 ? 'block' : 'none';
    }

    var activeCat = 'all';

    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        pills.forEach(function (p) { p.classList.remove('active'); });
        pill.classList.add('active');
        activeCat = pill.getAttribute('data-cat');
        var q = document.getElementById('blogSearch');
        filterCards(activeCat, q ? q.value.trim().toLowerCase() : '');
      });
    });

    var searchInput = document.getElementById('blogSearch');
    var searchBtn   = document.getElementById('blogSearchBtn');

    function runSearch() {
      var q = searchInput ? searchInput.value.trim().toLowerCase() : '';
      filterCards(activeCat, q);
    }

    if (searchBtn) searchBtn.addEventListener('click', runSearch);
    if (searchInput) {
      searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') runSearch();
      });
    }
  });

  /* ─── 9. Newsletter form ─────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var nForm   = document.getElementById('newsletterForm');
    var nEmail  = document.getElementById('newsletterEmail');
    var nSuccess = document.getElementById('newsletterSuccess');
    if (!nForm) return;

    nForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = nEmail ? nEmail.value.trim() : '';
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (nEmail) { nEmail.style.outline = '2px solid #ef4444'; }
        return;
      }
      if (nEmail) nEmail.style.outline = '';
      nForm.style.display = 'none';
      if (nSuccess) nSuccess.classList.add('show');
    });
  });

})();
