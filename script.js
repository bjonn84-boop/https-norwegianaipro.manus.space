/* NorwegianAI Pro – Main JS */

// Navbar scroll effect
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// FAQ accordion
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll('.faq-q').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      b.nextElementSibling.classList.remove('open');
    });
    if (!expanded) {
      btn.setAttribute('aria-expanded', 'true');
      btn.nextElementSibling.classList.add('open');
    }
  });
});

// Contact form — Formspree
// 1. Gå til https://formspree.io og opprett et gratis skjema
// 2. Bytt ut FORMSPREE_FORM_ID nedenfor med din ID (f.eks. xabcdefg)
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/FORMSPREE_FORM_ID';

const form        = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Sender...';

  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form),
    });

    if (res.ok) {
      form.style.display = 'none';
      formSuccess.style.display = 'block';
    } else {
      const data = await res.json();
      const msg = data?.errors?.map(err => err.message).join(', ') || 'Noe gikk galt.';
      alert(`Feil: ${msg}`);
      btn.disabled = false;
      btn.textContent = 'Book gratis strategisamtale';
    }
  } catch {
    alert('Kunne ikke sende skjemaet. Sjekk internettforbindelsen og prøv igjen.');
    btn.disabled = false;
    btn.textContent = 'Book gratis strategisamtale';
  }
});

// Scroll-triggered fade-in
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(
  '.problem-card, .service-card, .process-step, .case-card, .pricing-card, .why-card, .faq-item'
).forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 60}ms`;
  el.classList.add('fade-target');
  observer.observe(el);
});

// Add fade CSS dynamically (avoids FOUC if CSS loads after JS)
const style = document.createElement('style');
style.textContent = `
  .fade-target { opacity: 0; transform: translateY(20px); transition: opacity .5s ease, transform .5s ease; }
  .fade-target.visible { opacity: 1; transform: none; }
`;
document.head.appendChild(style);
