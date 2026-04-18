/**
 * No Tips Ride Share — Main JavaScript
 * Handles:
 *   - AOS (Animate On Scroll) initialization
 *   - Navbar scroll behaviour & mobile hamburger toggle
 *   - FAQ accordion
 *   - Steps Rider / Driver tab toggle
 *   - Hero stats count-up animation
 *   - Footer line in-view trigger
 */

'use strict';

/* ============================================================
   AOS INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  AOS.init({
    duration: 700,        // animation duration in ms
    easing: 'ease-out-cubic',
    once: true,           // animate only once per element
    offset: 80,           // trigger offset from bottom of viewport
    disable: 'phone',     // disable on phones for performance (optional — remove if you want mobile animations)
  });
});


/* ============================================================
   NAVBAR — scroll class + mobile toggle
   ============================================================ */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  if (!navbar || !hamburger || !navLinks) return;

  // Add .scrolled class when page scrolls past 20px
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load in case page starts scrolled

  // Mobile menu toggle
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    // Prevent body scroll while menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
})();


/* ============================================================
   FAQ ACCORDION
   ============================================================ */
(function initAccordion() {
  const triggers = document.querySelectorAll('.accordion__trigger');

  triggers.forEach(trigger => {
    const body = trigger.nextElementSibling;

    // Initialise open state for pre-expanded items
    if (trigger.getAttribute('aria-expanded') === 'true') {
      body.classList.add('open');
    }

    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

      // Close all other items
      triggers.forEach(t => {
        if (t !== trigger) {
          t.setAttribute('aria-expanded', 'false');
          t.nextElementSibling.classList.remove('open');
        }
      });

      // Toggle the clicked item
      const newState = !isExpanded;
      trigger.setAttribute('aria-expanded', newState);
      body.classList.toggle('open', newState);
    });
  });
})();


/* ============================================================
   STEPS — RIDER / DRIVER TAB TOGGLE
   ============================================================ */
(function initStepsTabs() {
  const toggleBtns = document.querySelectorAll('.steps__toggle-btn');
  const riderSteps  = document.getElementById('riderSteps');
  const driverSteps = document.getElementById('driverSteps');

  if (!toggleBtns.length || !riderSteps || !driverSteps) return;

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;

      // Update active button
      toggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Show corresponding list
      if (tab === 'rider') {
        riderSteps.classList.remove('hidden');
        driverSteps.classList.add('hidden');
      } else {
        driverSteps.classList.remove('hidden');
        riderSteps.classList.add('hidden');
      }
    });
  });
})();


/* ============================================================
   HERO STATS — COUNT-UP ANIMATION
   Reads data-target from each .hero__stat-value and counts up
   when the stats bar first enters the viewport.
   ============================================================ */
(function initStatCounters() {
  const statsBar = document.querySelector('.hero__stats');
  if (!statsBar) return;

  // Config: map text content → { end, suffix, prefix }
  const statConfigs = [
    { end: 10,  suffix: 'k+', prefix: '' },  // "10k+"
    { end: 4.9, suffix: '',   prefix: '' },  // "4.9"
    { end: 0,   suffix: '',   prefix: '$' }, // "$0"
  ];

  const valueEls = statsBar.querySelectorAll('.hero__stat-value');
  let fired = false;

  function countUp(el, config) {
    const { end, suffix, prefix } = config;
    const isDecimal = !Number.isInteger(end);
    const duration  = 1400; // ms
    const steps     = 50;
    const interval  = duration / steps;
    let   current   = 0;
    let   step      = 0;

    const timer = setInterval(() => {
      step++;
      current = end * (step / steps);
      const display = isDecimal ? current.toFixed(1) : Math.floor(current);
      el.childNodes[0].nodeValue = prefix + display + suffix;
      if (step >= steps) {
        el.childNodes[0].nodeValue = prefix + end + suffix;
        clearInterval(timer);
      }
    }, interval);
  }

  const observer = new IntersectionObserver((entries) => {
    if (fired) return;
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      fired = true;
      valueEls.forEach((el, i) => {
        if (statConfigs[i]) setTimeout(() => countUp(el, statConfigs[i]), i * 120);
      });
    });
  }, { threshold: 0.5 });

  observer.observe(statsBar);
})();


/* ============================================================
   FOOTER LINE — trigger in-view class when footer scrolls in
   ============================================================ */
(function initFooterLine() {
  const footer = document.querySelector('.footer');
  if (!footer) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        footer.classList.add('in-view');
        observer.disconnect();
      }
    });
  }, { threshold: 0.1 });

  observer.observe(footer);
})();


/* ============================================================
   EARNINGS CALCULATOR — Tab toggle + Slider interaction
   ============================================================ */
(function initCalculator() {
  const tabs   = document.querySelectorAll('.calculator__tab');
  const panels = {
    rider:  document.getElementById('calcRider'),
    driver: document.getElementById('calcDriver'),
  };

  if (!tabs.length || !panels.rider) return;

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const calc = tab.dataset.calc;
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      Object.values(panels).forEach(p => p.classList.add('hidden'));
      panels[calc].classList.remove('hidden');
    });
  });

  // Helper: update slider filled-track CSS variable
  function setSliderFill(slider) {
    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 100;
    const pct = ((parseFloat(slider.value) - min) / (max - min)) * 100;
    slider.style.setProperty('--fill', pct.toFixed(1) + '%');
  }

  // Rider sliders
  const riderSlider     = document.getElementById('riderSlider');
  const riderFareSlider = document.getElementById('riderFareSlider');
  const riderRidesVal   = document.getElementById('riderRides');
  const riderFareVal    = document.getElementById('riderFare');
  const riderResult     = document.getElementById('riderResult');

  function updateRider() {
    const rides = parseInt(riderSlider.value);
    const fare  = parseInt(riderFareSlider.value);
    riderRidesVal.textContent = rides;
    riderFareVal.textContent  = '$' + fare;
    setSliderFill(riderSlider);
    setSliderFill(riderFareSlider);
    const saving = Math.round(fare * 0.18 * rides * 4.3);
    riderResult.textContent = '$' + saving;
  }

  if (riderSlider && riderFareSlider) {
    riderSlider.addEventListener('input', updateRider);
    riderFareSlider.addEventListener('input', updateRider);
    updateRider();
  }

  // Driver sliders
  const driverSlider     = document.getElementById('driverSlider');
  const driverFareSlider = document.getElementById('driverFareSlider');
  const driverHoursVal   = document.getElementById('driverHours');
  const driverFareVal    = document.getElementById('driverFare');
  const driverResult     = document.getElementById('driverResult');
  const bigAppsResult    = document.getElementById('bigAppsResult');
  const bigappsBar       = document.getElementById('bigappsBar');

  function updateDriver() {
    const hours = parseInt(driverSlider.value);
    const fare  = parseInt(driverFareSlider.value);
    driverHoursVal.textContent = hours;
    driverFareVal.textContent  = '$' + fare;
    setSliderFill(driverSlider);
    setSliderFill(driverFareSlider);
    // ~2.5 rides/hr × hours/wk × 4.3 weeks × 70% share
    const earning = Math.round(fare * 2.5 * hours * 4.3 * 0.70);
    driverResult.textContent = '$' + earning.toLocaleString();
    // Big Apps payout = Totali × 0.695 (43% payout vs Totali's 70%)
    const bigApps = Math.round(earning * 0.695);
    if (bigAppsResult) bigAppsResult.textContent = '$' + bigApps.toLocaleString();
    // Update comparison bar (BigApps bar = 69.5% of Totali width)
    if (bigappsBar) bigappsBar.style.width = '69.5%';
  }

  if (driverSlider && driverFareSlider) {
    driverSlider.addEventListener('input', updateDriver);
    driverFareSlider.addEventListener('input', updateDriver);
    updateDriver();
  }
})();


/* ============================================================
   WAITLIST FORM — Role toggle + Submit
   ============================================================ */
(function initWaitlist() {
  const roleBtns = document.querySelectorAll('.waitlist__role-btn');
  const form     = document.getElementById('waitlistForm');

  if (!roleBtns.length) return;

  roleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      roleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input  = form.querySelector('.waitlist__input');
    const submit = form.querySelector('.waitlist__submit');

    if (!input.value || !input.value.includes('@')) {
      input.focus();
      input.style.borderColor = 'rgba(255,80,80,0.5)';
      setTimeout(() => { input.style.borderColor = ''; }, 2000);
      return;
    }

    submit.textContent  = "You're on the list!";
    submit.style.background = '#22c55e';
    input.disabled  = true;
    submit.disabled = true;
  });
})();


/* ============================================================
   SMOOTH SCROLL — for anchor links (fallback for older browsers)
   ============================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navHeight = document.getElementById('navbar')?.offsetHeight ?? 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
