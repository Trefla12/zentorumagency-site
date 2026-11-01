/* Zentorum Agency: chat launcher + instant answers (automated) + exit-intent offer. No dependencies. */
(() => {
  'use strict';
  const EP = 'https://script.google.com/macros/s/AKfycbzsNUGEs45W60Yx-EF95xi5CX0CcK8MYEizo3FUSoJ8qrPrVDP-tZn1UMdAFfXO486b/exec'; // same endpoint as the homepage form
  const BOOK = 'https://cal.com/zentorumagency/30min'; // the ONE place to change the booking link
  const PH = '512-241-5531';
  const d = document;
  const ss = (k, v) => { try { return v === undefined ? sessionStorage.getItem(k) : sessionStorage.setItem(k, v); } catch (e) {} };
  const h = (t, c, x) => { const e = d.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  const EMAIL = /^[^\s@,;<>"'()[\]\\]+@[^\s@,;<>"'()[\]\\]+\.[A-Za-z]{2,}$/;
  const t0 = Date.now();
  const utm = {};
  try {
    const q = new URLSearchParams(location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(k => { if (q.get(k)) utm[k] = q.get(k).slice(0, 80); });
    if (Object.keys(utm).length) ss('zta_utm', JSON.stringify(utm)); else Object.assign(utm, JSON.parse(ss('zta_utm') || '{}'));
  } catch (e) {}

  // Shared sender. The endpoint drops anything sent <4 s after form start, so wait instead of faking it.
  function post(data, start) {
    start = start || t0;
    const ep = d.getElementById('zta-form')?.dataset.endpoint || EP;
    return new Promise(r => setTimeout(r, Math.max(0, 4300 - (Date.now() - start)))).then(() => {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 25000);
      const body = Object.assign({ page: location.href.split('?')[0], referrer: d.referrer.slice(0, 200), t: Date.now() - start }, utm, data);
      return fetch(ep, { method: 'POST', body: JSON.stringify(body), signal: ac.signal, redirect: 'follow' })
        .then(r => r.json().catch(() => ({})))
        .then(j => { if (!j.ok) throw new Error(j.error || 'send'); ss('zta_sent', '1'); return j; })
        .finally(() => clearTimeout(to));
    });
  }
  window.ZTA = { post, EMAIL, BOOK };
  d.querySelectorAll('a[data-book]').forEach(a => { a.href = BOOK; });

  // Small form builder used by the chat message form and the exit offer.
  function mkForm(fields, btn, build, okText) {
    const f = h('form', 'zc-f');
    f.noValidate = true;
    let st = 0;
    fields.forEach(([n, l, type, ac]) => {
      const w = h('label', 'zc-l', l);
      const i = h(type === 'textarea' ? 'textarea' : 'input');
      i.name = n; i.maxLength = n === 'msg' ? 1500 : 120;
      if (type !== 'textarea') i.type = type;
      if (ac) i.autocomplete = ac;
      w.append(i); f.append(w);
    });
    const hp = h('input', 'zc-hp'); hp.name = 'botcheck'; hp.tabIndex = -1; hp.autocomplete = 'off'; hp.setAttribute('aria-hidden', 'true');
    const s = h('p', 'zc-s'); s.setAttribute('role', 'status');
    const b = h('button', 'zc-b', btn); b.type = 'submit';
    f.append(hp, b, s);
    f.addEventListener('focusin', () => { st = st || Date.now(); });
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const v = Object.fromEntries(new FormData(f));
      const bad = !v.name || v.name.trim().length < 2 ? 'Please add your first name.' : !EMAIL.test(v.email || '') ? 'That email doesn\'t look right.'
        : 'website' in v && !v.website.trim() ? 'Please add your website link.' : 'msg' in v && !v.msg.trim() ? 'Please write a short message.' : '';
      if (bad) { s.textContent = bad; return; }
      if (v.botcheck) { s.textContent = okText; return; }
      b.disabled = true; s.textContent = 'Sending…';
      try { await post(build(v), st || t0); f.reset(); s.textContent = okText; }
      catch (x) { s.textContent = ''; s.append('We couldn\'t send that. Please call or text ', Object.assign(h('a', '', PH), { href: 'tel:+15122415531' }), '.'); }
      b.disabled = false;
    });
    return f;
  }

  // ---------- chat ----------
  const root = h('div', 'zc');
  if (d.querySelector('.mbar')) root.classList.add('has-mbar');
  const L = h('button', 'zc-launch');
  L.type = 'button';
  L.setAttribute('aria-haspopup', 'dialog');
  L.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>';
  L.append('Chat with us');
  root.append(L);
  d.body.append(root);

  const A = {
    cost: ['A website with 1–5 pages is about $1,250–$2,500. 6–15 pages or a store: $2,500–$4,000. Estimates only: your final quote comes after a quick call.', ['Build your quote', '/#quote']],
    prices: ['Logos start at $300, websites at $1,250, video at $75. Use the quote builder for your range.', ['Build your quote', '/#quote']],
    time: ['Logos 1–4 days, 1–5 page websites 3–7 days, bigger sites or stores 7–11 days.'],
    process: ['1. You tell us your idea (the form takes about 2 minutes). 2. We reply by email or phone within 6 hours. 3. We agree the plan and price on a short call. 4. We build it, and you approve before launch.'],
    contact: ['Call or text ' + PH + ', or leave a message below.'],
    book: ['30 minutes, no pressure. Pick a time that suits you.', ['Book a call', BOOK, 1]]
  };
  const CHIPS = [['How much does a website cost?', 'cost'], ['How long does it take?', 'time'], ['Book a call', 'book'], ['Prices', 'prices'], ['Timing', 'time'], ['Process', 'process'], ['Contact', 'contact']];
  let panel = null, log = null, isOpen = false;

  function say(t, who, link) {
    const m = h('div', 'zc-m' + (who ? ' u' : ''), t);
    if (link) { const a = h('a', '', link[0]); a.href = link[1]; if (link[2]) { a.target = '_blank'; a.rel = 'noopener'; } m.append(' ', a); }
    log.append(m);
    log.parentNode.scrollTop = log.parentNode.scrollHeight;
  }
  function build() {
    panel = h('div', 'zc-p');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Chat with Zentorum Agency');
    panel.hidden = true;
    const hd = h('div', 'zc-hd', null);
    const x = h('button', 'zc-x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Close chat');
    hd.append(h('b', '', 'Zentorum Agency'), x);
    const bd = h('div', 'zc-bd');
    log = h('div', 'zc-log'); log.setAttribute('aria-live', 'polite');
    const ch = h('div', 'zc-ch');
    CHIPS.forEach(([t, k]) => { const b = h('button', '', t); b.type = 'button'; b.onclick = () => { say(t, 1); say(A[k][0], 0, A[k][1]); }; ch.append(b); });
    const act = h('div', 'zc-act');
    const call = h('a', '', 'Call'); call.href = 'tel:+15122415531';
    const txt = h('a', '', 'Text'); txt.href = 'sms:+15122415531';
    act.append(call, txt);
    bd.append(h('span', 'zc-tag', 'Instant answers (automated)'), log, ch, h('p', 'zc-h', 'Talk to a person'), act,
      h('p', 'zc-h', 'We\'re away. Leave your email and we\'ll reply soon.'),
      mkForm([['name', 'First name', 'text', 'given-name'], ['email', 'Email', 'email', 'email'], ['msg', 'Message', 'textarea']], 'Send message',
        v => ({ name: v.name.trim(), email: v.email.trim(), services: 'Chat message', dream: v.msg.trim().slice(0, 1500), botcheck: v.botcheck }),
        'Got it. We\'ll reply by email.'));
    if (window.ZXOnline) window.ZXOnline(bd, 'side', 'first');
    panel.append(hd, bd);
    root.append(panel);
    say('Hi! Tell us your dream idea, or ask about prices.', 0);
    x.onclick = close;
    panel.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }
  function open() {
    if (!panel) build();
    isOpen = true; panel.hidden = false; L.hidden = true; L.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => { panel.classList.add('is-in'); panel.querySelector('.zc-x').focus(); });
  }
  function close() {
    isOpen = false; panel.classList.remove('is-in'); panel.hidden = true; L.hidden = false; L.setAttribute('aria-expanded', 'false'); L.focus();
  }
  L.onclick = open;
  d.addEventListener('click', e => { if (e.target.closest('[data-chat-open]')) { e.preventDefault(); open(); } });

  // ---------- exit-intent offer (desktop, once per visit) ----------
  function showExit() {
    const prev = d.activeElement;
    const ov = h('div', 'zc-ov');
    const dlg = h('div', 'zc-dlg');
    dlg.setAttribute('role', 'dialog'); dlg.setAttribute('aria-modal', 'true'); dlg.setAttribute('aria-labelledby', 'zc-xt');
    const t = h('h2', '', 'Before you go: a free website check.'); t.id = 'zc-xt';
    const no = h('button', 'zc-no', 'No thanks'); no.type = 'button';
    dlg.append(t, h('p', '', 'Send us your link and we\'ll tell you the top 3 things to fix.'),
      mkForm([['name', 'First name', 'text', 'given-name'], ['website', 'Your website link', 'text', 'url'], ['email', 'Email', 'email', 'email']], 'Yes, check my site',
        v => ({ name: v.name.trim(), email: v.email.trim(), website: v.website.trim().slice(0, 120), services: 'Exit offer: site check', dream: 'Free website check requested for ' + v.website.trim().slice(0, 200), botcheck: v.botcheck }),
        'Got it. We\'ll email you the top 3 things to fix.'), no);
    ov.append(dlg); root.append(ov);
    requestAnimationFrame(() => { ov.classList.add('is-in'); dlg.querySelector('input').focus(); });
    const end = () => { ov.remove(); d.removeEventListener('keydown', key, true); if (prev && prev.focus) prev.focus(); };
    const key = e => {
      if (e.key === 'Escape') { e.preventDefault(); end(); return; }
      if (e.key !== 'Tab') return;
      const f = [...dlg.querySelectorAll('input:not(.zc-hp),button:not([disabled]),a[href]')];
      const i = f.indexOf(d.activeElement);
      e.preventDefault(); // manual cycle: Safari skips buttons/links with Tab by default
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    };
    d.addEventListener('keydown', key, true);
    no.onclick = end;
    ov.addEventListener('mousedown', e => { if (e.target === ov) end(); });
  }
  if (matchMedia('(pointer:fine)').matches && innerWidth > 900 && !ss('zta_exit')) {
    d.addEventListener('mouseout', e => {
      if (e.relatedTarget || e.clientY > 0 || isOpen || Date.now() - t0 < 8000 || ss('zta_sent') || ss('zta_exit')) return;
      ss('zta_exit', '1');
      showExit();
    });
  }
})();
