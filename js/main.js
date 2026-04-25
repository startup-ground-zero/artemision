/* ================================================================
   ARTERMISION — Main JavaScript
   - Navigation scroll behaviour
   - Mobile nav toggle
   - Hero image load + parallax
   - Scroll reveal (IntersectionObserver)
   - Staggered grid animations
   - Smooth anchor scrolling
================================================================ */

(function () {
    'use strict';

    // ============================================================
    // NAV SCROLL BEHAVIOUR
    // ============================================================
    var nav = document.getElementById('nav');

    function onNavScroll() {
        if (window.scrollY > 60) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', onNavScroll, { passive: true });
    onNavScroll(); // run once on load

    // ============================================================
    // MOBILE NAV TOGGLE
    // ============================================================
    var navToggle  = document.getElementById('navToggle');
    var navClose   = document.getElementById('navClose');
    var navMobile  = document.getElementById('navMobile');

    function openMobileNav() {
        navMobile.classList.add('open');
        navMobile.setAttribute('aria-hidden', 'false');
        navToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileNav() {
        navMobile.classList.remove('open');
        navMobile.setAttribute('aria-hidden', 'true');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    navToggle.addEventListener('click', openMobileNav);
    navClose.addEventListener('click', closeMobileNav);

    // Close on any link click inside mobile nav
    navMobile.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', closeMobileNav);
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && navMobile.classList.contains('open')) {
            closeMobileNav();
        }
    });

    // ============================================================
    // HERO — IMAGE LOAD ANIMATION + PARALLAX
    // ============================================================
    var hero    = document.querySelector('.hero');
    var heroMedia = document.querySelector('.hero__media');

    // Parallax: translate hero media on scroll
    function onHeroParallax() {
        var scrollY = window.scrollY;
        if (heroMedia && scrollY < window.innerHeight) {
            heroMedia.style.transform = 'translateY(' + (scrollY * 0.28) + 'px)';
        }
    }

    window.addEventListener('scroll', onHeroParallax, { passive: true });

    // ============================================================
    // SCROLL REVEAL — IntersectionObserver
    // ============================================================
    var revealSelectors = '.reveal, .reveal-left, .reveal-right';
    var revealEls = document.querySelectorAll(revealSelectors);

    if ('IntersectionObserver' in window) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        revealEls.forEach(function (el) {
            revealObserver.observe(el);
        });
    } else {
        // Fallback: show everything immediately
        revealEls.forEach(function (el) {
            el.classList.add('visible');
        });
    }

    // ============================================================
    // STAGGERED ANIMATIONS — Pillar & Suite grid items
    // ============================================================
    function addStaggerDelay(selector, delayMs) {
        document.querySelectorAll(selector).forEach(function (el, index) {
            el.style.transitionDelay = (index * delayMs) + 'ms';
        });
    }

    addStaggerDelay('.pillars__grid .pillar', 120);
    addStaggerDelay('.suites__grid .suite-card', 130);
    addStaggerDelay('.experiences__grid .exp-item', 100);

    // ============================================================
    // EQUALISE ROOM CARD SECTIONS
    // Measures the actual rendered height of type, name, and desc
    // across all cards and sets a shared min-height so they align.
    // ============================================================
    function equalizeCardSections() {
        var selectors = ['.suite-card__type', '.suite-card__name', '.suite-card__desc'];
        selectors.forEach(function (sel) {
            var els = document.querySelectorAll(sel);
            // Reset first so we measure natural height
            els.forEach(function (el) { el.style.minHeight = ''; });
            var maxH = 0;
            els.forEach(function (el) { maxH = Math.max(maxH, el.offsetHeight); });
            els.forEach(function (el) { el.style.minHeight = maxH + 'px'; });
        });
    }

    // Run after fonts/layout settle, and again on resize
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(equalizeCardSections);
    } else {
        window.addEventListener('load', equalizeCardSections);
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(equalizeCardSections, 120);
    });

    // ============================================================
    // SMOOTH ANCHOR SCROLL (accounts for fixed nav height)
    // ============================================================
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var href = this.getAttribute('href');
            if (!href || href === '#') return;

            var target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();

            var navHeight = nav ? nav.offsetHeight : 0;
            var targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

            window.scrollTo({
                top: targetTop,
                behavior: 'smooth'
            });
        });
    });

    // ============================================================
    // ROOM MODALS
    // ============================================================

    var currentModal = null;

    function buildDots(modal) {
        var slides = modal.querySelectorAll('.room-modal__slide');
        var dotsContainer = modal.querySelector('.room-modal__dots');
        dotsContainer.innerHTML = '';
        slides.forEach(function (_, i) {
            var dot = document.createElement('button');
            dot.className = 'room-modal__dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', 'Photo ' + (i + 1));
            dot.addEventListener('click', function () { goToSlide(modal, i); });
            dotsContainer.appendChild(dot);
        });
    }

    function goToSlide(modal, index) {
        var slides = modal.querySelectorAll('.room-modal__slide');
        var dots   = modal.querySelectorAll('.room-modal__dot');
        slides.forEach(function (s, i) { s.classList.toggle('active', i === index); });
        dots.forEach(function (d, i)   { d.classList.toggle('active', i === index); });
        modal.dataset.current = index;
    }

    function activeIndex(modal) {
        return parseInt(modal.dataset.current || '0', 10);
    }

    function prevSlide(modal) {
        var slides = modal.querySelectorAll('.room-modal__slide');
        var idx = (activeIndex(modal) - 1 + slides.length) % slides.length;
        goToSlide(modal, idx);
    }

    function nextSlide(modal) {
        var slides = modal.querySelectorAll('.room-modal__slide');
        var idx = (activeIndex(modal) + 1) % slides.length;
        goToSlide(modal, idx);
    }

    function openModal(id) {
        var modal = document.getElementById('modal-' + id);
        if (!modal) return;

        // Build dots if not already built
        if (!modal.dataset.built) {
            buildDots(modal);
            goToSlide(modal, 0);
            modal.dataset.built = '1';

            modal.querySelector('.room-modal__arrow--prev').addEventListener('click', function () { prevSlide(modal); });
            modal.querySelector('.room-modal__arrow--next').addEventListener('click', function () { nextSlide(modal); });
            modal.querySelector('.room-modal__close').addEventListener('click', function () { closeModal(); });
            modal.querySelector('.room-modal__backdrop').addEventListener('click', function () { closeModal(); });

            // Close modal when Reserve button is clicked (it scrolls to reserve section)
            var reserveBtn = modal.querySelector('.room-modal__reserve');
            if (reserveBtn) {
                reserveBtn.addEventListener('click', function () { closeModal(); });
            }
        }

        currentModal = modal;
        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';

        // Focus close button for accessibility
        setTimeout(function () {
            var closeBtn = modal.querySelector('.room-modal__close');
            if (closeBtn) closeBtn.focus();
        }, 50);
    }

    function closeModal() {
        if (!currentModal) return;
        currentModal.classList.remove('open');
        currentModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        currentModal = null;
    }

    // Wire up cards
    document.querySelectorAll('.suite-card[data-modal]').forEach(function (card) {
        card.addEventListener('click', function () {
            openModal(card.dataset.modal);
        });
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal(card.dataset.modal);
            }
        });
    });

    // Keyboard navigation inside modal
    document.addEventListener('keydown', function (e) {
        if (!currentModal) return;
        if (e.key === 'Escape')      { closeModal(); }
        if (e.key === 'ArrowLeft')   { prevSlide(currentModal); }
        if (e.key === 'ArrowRight')  { nextSlide(currentModal); }
    });

    // ============================================================
    // SPA TREATMENT MODALS
    // ============================================================
    var currentSpaModal = null;

    function openSpaModal(id) {
        var modal = document.getElementById('spa-modal-' + id);
        if (!modal) return;

        if (!modal._wired) {
            modal.querySelector('.spa-modal__close').addEventListener('click', closeSpaModal);
            modal.querySelector('.spa-modal__backdrop').addEventListener('click', closeSpaModal);
            modal._wired = true;
        }

        currentSpaModal = modal;
        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';

        setTimeout(function () {
            var closeBtn = modal.querySelector('.spa-modal__close');
            if (closeBtn) closeBtn.focus();
        }, 50);
    }

    function closeSpaModal() {
        if (!currentSpaModal) return;
        currentSpaModal.classList.remove('open');
        currentSpaModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        currentSpaModal = null;
    }

    document.querySelectorAll('.spa-list__btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            openSpaModal(btn.dataset.spaModal);
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && currentSpaModal) {
            closeSpaModal();
        }
    });

    // ============================================================
    // CONTACT FORM — AJAX SUBMISSION WITH INLINE THANK YOU
    // ============================================================
    var contactForm = document.getElementById('contact-form');
    var contactSuccess = document.getElementById('contact-success');

    if (contactForm && contactSuccess) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var data = new FormData(contactForm);
            fetch(contactForm.action, {
                method: 'POST',
                body: data,
                headers: { 'Accept': 'application/json' }
            }).then(function (response) {
                if (response.ok) {
                    contactForm.style.display = 'none';
                    contactSuccess.style.display = 'block';
                } else {
                    return response.json().then(function (json) {
                        throw new Error(json.error || 'Submission failed');
                    });
                }
            }).catch(function () {
                alert('Something went wrong. Please email us directly at info@hotelartemision.gr');
            });
        });
    }

})();
