(() => {
  'use strict';

  function initialize() {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const header = document.getElementById('site-header');
    const navigation = Array.from(document.querySelectorAll('[data-nav]'))
      .map((link) => ({
        link,
        section: document.getElementById((link.getAttribute('href') || '').slice(1)),
      }))
      .filter(({ section }) => section);
    let framePending = false;

    function updatePageState() {
      framePending = false;
      const headerHeight = header ? header.getBoundingClientRect().height : 0;
      const anchorOffset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const activeThreshold = Math.max(headerHeight + 32, anchorOffset + 4);
      const sectionTops = navigation.map(({ section }) => section.getBoundingClientRect().top);
      const viewportHeight = window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;
      let activeIndex = 0;

      sectionTops.forEach((top, index) => {
        if (top <= activeThreshold) activeIndex = index;
      });
      if (window.scrollY > 0 && window.scrollY + viewportHeight >= pageHeight - 4) {
        activeIndex = navigation.length - 1;
      }

      if (header) header.classList.toggle('is-scrolled', window.scrollY > 16);
      navigation.forEach(({ link }, index) => {
        const isActive = index === activeIndex;
        link.classList.toggle('is-active', isActive);
        if (isActive) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }

    function requestPageUpdate() {
      if (framePending) return;
      framePending = true;
      window.requestAnimationFrame(updatePageState);
    }

    window.addEventListener('scroll', requestPageUpdate, { passive: true });
    window.addEventListener('resize', requestPageUpdate, { passive: true });
    window.addEventListener('pageshow', requestPageUpdate);
    window.addEventListener('hashchange', requestPageUpdate);
    updatePageState();

    const revealElements = Array.from(document.querySelectorAll('[data-reveal]'));
    let revealObserver;

    function revealAll() {
      if (revealObserver) revealObserver.disconnect();
      revealElements.forEach((element) => element.classList.add('is-visible'));
    }

    if (!motionPreference.matches && 'IntersectionObserver' in window) {
      revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });

      revealElements.forEach((element) => {
        if (element.getBoundingClientRect().top < window.innerHeight) {
          element.classList.add('is-visible');
          return;
        }
        element.classList.add('will-reveal');
        revealObserver.observe(element);
      });
    } else {
      revealAll();
    }

    const disclosures = [];

    document.querySelectorAll('details[data-disclosure]').forEach((details) => {
      const summary = details.querySelector('summary');
      const body = details.querySelector('.details-body');
      if (!summary || !body || typeof details.animate !== 'function') return;

      const originalOverflow = details.style.overflow;
      const originalBoxSizing = details.style.boxSizing;
      const state = { details, animation: null, desiredOpen: details.open };

      function restoreStyles() {
        details.style.overflow = originalOverflow;
        details.style.boxSizing = originalBoxSizing;
      }

      function settle() {
        const animation = state.animation;
        state.animation = null;
        details.open = state.desiredOpen;
        if (animation) animation.cancel();
        restoreStyles();
        requestPageUpdate();
      }

      state.settle = settle;
      disclosures.push(state);

      summary.addEventListener('click', (event) => {
        // Keep embedded links, if any, independent of the disclosure control.
        if (event.target instanceof Element && event.target.closest('a, button, input')) return;
        event.preventDefault();
        state.desiredOpen = !state.desiredOpen;

        if (motionPreference.matches) {
          settle();
          return;
        }

        // Measure the current animated position before cancelling, so a rapid
        // second click reverses smoothly instead of jumping to either endpoint.
        const fromHeight = details.getBoundingClientRect().height;
        if (state.animation) state.animation.cancel();
        state.animation = null;
        details.style.boxSizing = 'border-box';
        details.style.overflow = 'hidden';

        details.open = state.desiredOpen;
        const toHeight = details.getBoundingClientRect().height;
        // The content remains available while a closing animation completes.
        details.open = true;

        if (Math.abs(fromHeight - toHeight) < 1) {
          settle();
          return;
        }

        const animation = details.animate(
          [{ height: `${fromHeight}px` }, { height: `${toHeight}px` }],
          { duration: 200, easing: 'cubic-bezier(0.2, 0.65, 0.3, 1)', fill: 'both' },
        );
        state.animation = animation;
        animation.onfinish = () => {
          if (state.animation === animation) settle();
        };
      });

      details.addEventListener('toggle', () => {
        if (!state.animation) state.desiredOpen = details.open;
        else if (!details.open) {
          // Also respect an external or native exclusive-group close.
          state.desiredOpen = false;
          settle();
        }
        requestPageUpdate();
      });
    });

    motionPreference.addEventListener('change', () => {
      if (!motionPreference.matches) return;
      revealAll();
      disclosures.forEach(({ settle }) => settle());
    });

    // A resize changes natural content heights; finish any in-flight disclosure
    // at its intended state rather than retaining a stale pixel measurement.
    window.addEventListener('resize', () => {
      disclosures.forEach((state) => {
        if (state.animation) state.settle();
      });
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
