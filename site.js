'use strict';
// Navigation works as ordinary links without JavaScript.
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
function closeMenu() {
  nav?.classList.remove('open');
  menu?.setAttribute('aria-expanded', 'false');
}
menu?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menu.focus();
  }
});
window.matchMedia('(min-width: 901px)').addEventListener('change', closeMenu);

// Each explorer is independent, with keyboard-operable tabs.
document.querySelectorAll('.priority-tabs').forEach(tablist => {
  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
  const activate = tab => {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        activate(tabs[next]);
        tabs[next].focus();
      }
    });
  });
});

const carousel = document.querySelector('.inspiration-carousel');
if (carousel) {
  const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
  const dots = Array.from(carousel.querySelectorAll('.carousel-dot'));
  const status = carousel.querySelector('.carousel-status');
  const stage = carousel.querySelector('.carousel-stage');
  let current = 0;
  let swipeStart = null;
  function showSlide(index) {
    current = ((index % slides.length) + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== current; });
    dots.forEach((dot, i) => {
      if (i === current) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    status.textContent = `${current + 1} of ${slides.length}`;
  }
  carousel.querySelector('[data-carousel-prev]').addEventListener('click', () => showSlide(current - 1));
  carousel.querySelector('[data-carousel-next]').addEventListener('click', () => showSlide(current + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => showSlide(i)));
  carousel.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'ArrowLeft') showSlide(current - 1);
    if (event.key === 'ArrowRight') showSlide(current + 1);
    if (event.key === 'Home') showSlide(0);
    if (event.key === 'End') showSlide(slides.length - 1);
  });
  stage.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || !event.target.closest('.carousel-image')) return;
    swipeStart = {x: event.clientX, y: event.clientY, id: event.pointerId};
    stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener('pointerup', event => {
    if (!swipeStart || event.pointerId !== swipeStart.id) return;
    const dx = event.clientX - swipeStart.x;
    const dy = event.clientY - swipeStart.y;
    swipeStart = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) showSlide(current + (dx < 0 ? 1 : -1));
  });
  stage.addEventListener('pointercancel', () => { swipeStart = null; });
  stage.addEventListener('dragstart', event => { if (event.target.tagName === 'IMG') event.preventDefault(); });
}

// Opening the goals link brings the planned actions back into view.
document.querySelectorAll('a[href="priorities.html#goals"]').forEach(link => {
  link.addEventListener('click', () => {
    if (document.getElementById('goals')) {
      document.querySelectorAll('.priority-tabs [role="tab"]:first-child').forEach(tab => tab.click());
    }
  });
});

const form = document.getElementById('participation-form');
if (form) {
  const interestLabels = {
    idea: 'Share an idea',
    'pop-up': 'Get Involved',
    walking: 'Support walking and biking',
    business: 'Support new and existing local businesses'
  };
  const prompts = {
    idea: 'What would you like to see in Pleasanton?',
    'pop-up': 'How would you like to get involved?',
    walking: 'What would make walking or biking downtown easier?',
    business: 'Which businesses or activities would you like downtown?'
  };
  function setInterest(interest) {
    if (!Object.hasOwn(interestLabels, interest)) return;
    const radio = form.querySelector(`input[value="${interest}"]`);
    radio.checked = true;
    document.getElementById('message-label').textContent = prompts[interest];
  }
  const requestedInterest = new URLSearchParams(location.search).get('interest');
  if (requestedInterest) setInterest(requestedInterest);
  form.querySelectorAll('input[name="interest"]').forEach(radio => {
    radio.addEventListener('change', () => setInterest(radio.value));
  });
  document.querySelectorAll('[data-interest-link]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    setInterest(link.dataset.interestLink);
    document.getElementById('join').scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    history.replaceState(null, '', `?interest=${encodeURIComponent(link.dataset.interestLink)}#join`);
    form.querySelector('input[name="interest"]:checked').focus({preventScroll: true});
  }));
  const message = document.getElementById('visitor-message');
  message.addEventListener('input', () => message.setCustomValidity(''));
  form.addEventListener('submit', event => {
    if (!message.value.trim()) {
      event.preventDefault();
      message.setCustomValidity('Please add an idea or tell us how you would like to help.');
      message.reportValidity();
    }
  });
}
