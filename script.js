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

// ── AI Chat Widget ──────────────────────────────────────────────
// Bytt ut med din n8n webhook-URL når du har satt opp workflowen
const N8N_WEBHOOK = 'N8N_WEBHOOK_URL';

const chatToggle  = document.getElementById('chat-toggle');
const chatBox     = document.getElementById('chat-box');
const chatInput   = document.getElementById('chat-input');
const chatSend    = document.getElementById('chat-send');
const chatMsgs    = document.getElementById('chat-messages');
const iconOpen    = document.getElementById('chat-icon-open');
const iconClose   = document.getElementById('chat-icon-close');
const chatBadge   = document.getElementById('chat-badge');

let chatOpen = false;
let badgeShown = false;

// Show badge after 8s to grab attention
setTimeout(() => {
  if (!chatOpen && !badgeShown) {
    chatBadge.textContent = '1';
    chatBadge.style.display = 'flex';
    badgeShown = true;
  }
}, 8000);

chatToggle.addEventListener('click', () => {
  chatOpen = !chatOpen;
  chatBox.classList.toggle('chat-box--open', chatOpen);
  iconOpen.style.display  = chatOpen ? 'none'  : 'block';
  iconClose.style.display = chatOpen ? 'block' : 'none';
  chatBadge.style.display = 'none';
  if (chatOpen) chatInput.focus();
});

function appendMsg(text, role) {
  const div = document.createElement('div');
  div.className = `chat-msg chat-msg--${role}`;
  div.innerHTML = text.replace(/\n/g, '<br/>');
  chatMsgs.appendChild(div);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
  return div;
}

function appendTyping() {
  const div = document.createElement('div');
  div.className = 'chat-msg chat-msg--bot chat-typing';
  div.innerHTML = '<span></span><span></span><span></span>';
  chatMsgs.appendChild(div);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
  return div;
}

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = '';
  chatSend.disabled = true;

  appendMsg(text, 'user');
  const typing = appendTyping();

  try {
    const res = await fetch(N8N_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });
    const data = await res.json();
    typing.remove();
    appendMsg(data.reply || data.message || data.output || 'Takk for meldingen! Vi tar kontakt snart.', 'bot');
  } catch {
    typing.remove();
    appendMsg('Beklager, noe gikk galt. Ring oss eller send e-post til hei@norwegianaipro.no', 'bot');
  }

  chatSend.disabled = false;
  chatInput.focus();
}

chatSend.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});
