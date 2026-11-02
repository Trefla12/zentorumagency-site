/* Homepage features: quote estimator, brand preview, before/after slider, roast form. Plain ES module, no deps. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const money = n => '$' + n.toLocaleString('en-US');
const span = (a, b, f = money) => (a === b ? f(a) : `${f(a)}–${f(b)}`);

// Fill the main inquiry form (the form's own listeners pick up the events)
function prefill({ services, budget, dream, brand, append }) {
  const f = $('#zta-form');
  if (!f) return;
  if (services) $$('input[name="services"]', f).forEach(i => { i.checked = services.includes(i.value); i.dispatchEvent(new Event('change', { bubbles: true })); });
  if (budget != null) { f.elements.budget_i.value = budget; f.elements.budget_i.dispatchEvent(new Event('input', { bubbles: true })); }
  if (brand != null && brand) { f.elements.brand.value = brand.slice(0, 60); f.elements.brand.dispatchEvent(new Event('input', { bubbles: true })); }
  if (dream) {
    const t = f.elements.dream;
    t.value = (append && t.value && !t.value.includes(dream) ? t.value.trim() + ' ' : '') + dream;
    t.value = t.value.slice(0, 1500);
    t.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

// ---------- A. quote estimator ----------
function quote(root) {
  const inputs = $$('.qs input', root);
  const layers = $$('.ph-l', root);
  const phone = $('[data-phone]', root);
  const out = { range: $('[data-q-range]', root), mo: $('[data-q-mo]', root), time: $('[data-q-time]', root), ok: $('[data-q-ok]', root) };
  let state = null;
  const num = (i, k) => +i.dataset[k];
  function calc() {
    const on = inputs.filter(i => i.checked);
    const one = on.filter(i => !i.dataset.mo), mo = on.filter(i => i.dataset.mo);
    const sum = (l, k) => l.reduce((a, i) => a + num(i, k), 0);
    const lo = sum(one, 'lo'), hi = sum(one, 'hi');
    const longest = one.filter(i => i.dataset.d2).sort((a, b) => num(b, 'd2') - num(a, 'd2') || num(b, 'd1') - num(a, 'd1'))[0];
    const days = longest ? `${span(num(longest, 'd1'), num(longest, 'd2'), String)} days` : mo.length ? 'ongoing' : '-';
    const mlo = sum(mo, 'lo'), mhi = sum(mo, 'hi');
    state = { on, lo, hi, mlo, mhi, days, one: one.length, mo: mo.length };
    out.range.textContent = !on.length ? 'Pick a service' : one.length ? span(lo, hi) : 'Monthly services only';
    out.mo.hidden = !mo.length;
    out.mo.textContent = mo.length ? `+ ${span(mlo, mhi)}/month` : '';
    out.time.textContent = days;
    out.ok.textContent = '';
    const keys = new Set(on.map(i => i.value));
    layers.forEach(l => l.classList.toggle('is-on', l.dataset.ly.split(' ').some(k => keys.has(k))));
    phone.classList.toggle('is-motion', keys.has('motion'));
    return state;
  }
  root.addEventListener('change', e => {
    const i = e.target;
    if (i.dataset.grp) inputs.forEach(o => { if (o !== i && o.dataset.grp === i.dataset.grp && i.checked) o.checked = false; });
    calc();
  });
  calc();
  if (!RM && 'IntersectionObserver' in window) new IntersectionObserver(([en]) => phone.classList.toggle('is-live', en.isIntersecting), { threshold: 0.2 }).observe(phone);
  $('[data-q-lock]', root).addEventListener('click', e => {
    const s = calc();
    if (!s.on.length) { e.preventDefault(); out.ok.textContent = 'Pick at least one service first.'; return; }
    const names = s.on.map(i => $('b', i.closest('.qs')).textContent);
    const mid = s.one ? (s.lo + s.hi) / 2 : (s.mlo + s.mhi) * 1.5;
    const idx = mid < 1000 ? 0 : mid < 3000 ? 1 : mid < 7000 ? 2 : mid < 15000 ? 3 : 4;
    const bits = [`Quote from the estimator: ${names.join(', ')}.`];
    if (s.one) bits.push(`Estimated ${span(s.lo, s.hi)} one-time.`);
    if (s.mo) bits.push(`Plus ${span(s.mlo, s.mhi)}/month.`);
    if (s.days !== '-') bits.push(`Estimated time: ${s.days}.`);
    prefill({ services: [...new Set(s.on.map(i => i.dataset.chip))], budget: idx, dream: bits.join(' ') });
    out.ok.textContent = 'Quote ready. Finish the form below and send it, and we\'ll reply within 24 hours.';
  });
}

// ---------- B. brand in 10 seconds ----------
function brand(root) {
  const card = $('[data-bcard]', root), nameEl = $('[data-b-name]', card), init = $('[data-b-init]', card), font = $('[data-b-font]', card), ring = $('[data-b-ring]', card);
  const input = $('#br-name', root);
  const FONTS = { luxury: 'Serif · gold foil · monogram seal', bold: 'Heavy sans, black on bright yellow', playful: 'Rounded and friendly, pink and mint' };
  let vibe = 'luxury';
  function draw(bump) {
    const n = input.value.trim().replace(/\s+/g, ' ') || 'Moonlight Candles';
    nameEl.textContent = n;
    init.textContent = n.charAt(0).toUpperCase();
    card.style.setProperty('--k', Math.max(0.5, Math.min(1, 13 / n.length)).toFixed(2));
    card.dataset.vibe = vibe;
    font.textContent = FONTS[vibe];
    if (ring) { const N = n.slice(0, 18).toUpperCase(); let r = `${N} · MAISON · MMXXVI · `; while (r.length < 34) r += `${N} · `; ring.textContent = r; }
    if (bump && !RM) { card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop'); }
  }
  input.addEventListener('input', () => draw(false));
  $$('input[name="vibe"]', root).forEach(r => r.addEventListener('change', () => { vibe = r.value; draw(true); }));
  $('[data-brand-cta]', root).addEventListener('click', () => {
    const n = input.value.trim();
    prefill({ brand: n, dream: `Brand sketch vibe: ${vibe}.`, append: true });
  });
  draw(false);
}

// ---------- D. before / after ----------
function ba(root) {
  const range = $('.bas__range', root);
  const set = () => {
    root.style.setProperty('--p', range.value + '%');
    const v = +range.value;
    range.setAttribute('aria-valuetext', v < 8 ? 'Showing the new website' : v > 92 ? 'Showing the old website' : `${100 - v} percent new website, ${v} percent old website`);
  };
  range.addEventListener('input', set);
  set();
  // gentle one-time hint when it first scrolls into view
  if (!RM && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      if (range.matches(':active') || document.activeElement === range) return;
      root.classList.add('is-hint');
      setTimeout(() => root.classList.remove('is-hint'), 1400);
    }, { threshold: 0.6 });
    io.observe(root);
  }
}

// ---------- E. site roast ----------
function roast(form) {
  const msg = $('[data-roast-msg]', form);
  let started = 0;
  form.addEventListener('focusin', () => { started = started || Date.now(); });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const z = window.ZTA, f = form.elements, btn = $('button', form);
    const name = f.name.value.trim(), site = f.website.value.trim(), mail = f.email.value.trim();
    msg.classList.remove('is-ok');
    const fl = el => { z && z.flag && z.flag(form, el); el.focus(); };
    z && z.flag && z.flag(form);
    if (z ? !z.isName(name) : name.length < 2) { msg.textContent = 'Please add your first name.'; fl(f.name); return; }
    if (!site) { msg.textContent = 'Please add your website link.'; fl(f.website); return; }
    if (!z || !z.EMAIL.test(mail)) { msg.textContent = z ? 'That email doesn\'t look right.' : 'Chat is still loading. Please try again in a moment.'; if (z) fl(f.email); return; }
    if (f.botcheck.value) { msg.textContent = 'Got it. Your video is coming by email.'; msg.classList.add('is-ok'); return; }
    btn.disabled = true; msg.textContent = 'Sending…';
    try {
      await z.post({ name, email: mail, website: site.slice(0, 120), services: 'Site roast', dream: 'Free website roast requested for ' + site.slice(0, 200) }, started || undefined);
      form.reset();
      msg.textContent = 'Got it. Your video is coming by email.';
      msg.classList.add('is-ok');
    } catch {
      msg.textContent = '';
      const a = Object.assign(document.createElement('a'), { href: 'tel:+15122415531', className: 'link', textContent: '512-241-5531' });
      msg.append('We couldn\'t send that just now. Please try again, or call ', a, '.');
    }
    btn.disabled = false;
  });
}

// Pre-fill handed over by the quizzes (sessionStorage), same fields the quote estimator fills
try {
  const raw = sessionStorage.getItem('zta-prefill');
  if (raw && $('#zta-form')) {
    const p = JSON.parse(raw);
    prefill(p);
    if (p.timeline) $$('input[name="timeline"]').forEach(i => { if (i.value === p.timeline) { i.checked = true; i.dispatchEvent(new Event('change', { bubbles: true })); } });
    sessionStorage.removeItem('zta-prefill');
  }
} catch {}

const q = $('[data-quote]'); if (q) quote(q);
const b = $('[data-brand]'); if (b) brand(b);
const s = $('[data-ba]'); if (s) ba(s);
const r = $('[data-roast]'); if (r) roast(r);
// Dream wall: duplicate the line list once for a seamless loop (copy is aria-hidden)
const wall = $('[data-wall] .wall__row');
if (wall && !RM) { const c = wall.cloneNode(true); c.setAttribute('aria-hidden', 'true'); wall.parentNode.append(c); wall.parentNode.classList.add('is-run'); }
