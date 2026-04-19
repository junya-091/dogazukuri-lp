/* ==========================================================================
   ドーガづくり LP — Navy × Gold Edition
   - Intersection Observer (scroll reveal)
   - Site nav: scroll-detection / hamburger / smooth anchor with offset
   ========================================================================== */

(function () {
    'use strict';

    // --- Motion preference ---
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ======================================================================
    // 1. Scroll reveal (Intersection Observer)
    // ======================================================================
    const revealTargets = document.querySelectorAll('.scroll-reveal');

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        revealTargets.forEach(function (el) {
            el.classList.add('revealed');
        });
    } else {
        const observerOptions = {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        };

        const observer = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    obs.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealTargets.forEach(function (el) {
            observer.observe(el);
        });
    }

    // ======================================================================
    // 2. Site nav — scroll detection (.site-nav--scrolled)
    // ======================================================================
    const siteNav = document.getElementById('siteNav');
    if (siteNav) {
        const SCROLL_THRESHOLD = 80;
        let ticking = false;

        const updateNavState = function () {
            if (window.scrollY > SCROLL_THRESHOLD) {
                siteNav.classList.add('site-nav--scrolled');
            } else {
                siteNav.classList.remove('site-nav--scrolled');
            }
            ticking = false;
        };

        const onScroll = function () {
            if (!ticking) {
                window.requestAnimationFrame(updateNavState);
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        updateNavState();
    }

    // ======================================================================
    // 3. Mobile hamburger toggle (body.nav-open)
    // ======================================================================
    const navToggle = document.getElementById('siteNavToggle');
    const navLinks = document.getElementById('siteNavLinks');

    if (navToggle && navLinks) {
        const closeNav = function () {
            document.body.classList.remove('nav-open');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-label', 'メニューを開く');
        };

        const openNav = function () {
            document.body.classList.add('nav-open');
            navToggle.setAttribute('aria-expanded', 'true');
            navToggle.setAttribute('aria-label', 'メニューを閉じる');
        };

        navToggle.addEventListener('click', function () {
            if (document.body.classList.contains('nav-open')) {
                closeNav();
            } else {
                openNav();
            }
        });

        // Close when a nav link is clicked
        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                closeNav();
            });
        });

        // Close on Escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
                closeNav();
                navToggle.focus();
            }
        });
    }

    // ======================================================================
    // 4. Smooth scroll with nav-height offset
    // ======================================================================
    const getNavHeight = function () {
        if (!siteNav) return 0;
        return siteNav.getBoundingClientRect().height || 64;
    };

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const href = anchor.getAttribute('href');
            if (!href || href === '#' || href.length < 2) return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();

            const offset = getNavHeight() + 8;
            const targetTop = target.getBoundingClientRect().top + window.scrollY - offset;

            window.scrollTo({
                top: targetTop,
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });

            // Move focus for accessibility (without the visual jump)
            if (target instanceof HTMLElement) {
                const prevTabIndex = target.getAttribute('tabindex');
                target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
                if (prevTabIndex === null) {
                    target.addEventListener('blur', function handler() {
                        target.removeAttribute('tabindex');
                        target.removeEventListener('blur', handler);
                    });
                }
            }
        });
    });
})();
