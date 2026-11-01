/* Mega menu: hover opens on desktop (short close delay), click/tap toggles, Esc or click outside closes.
   Thumbnails load on first intent; the current section is marked here so the markup stays identical on every page. */
const HOVER = matchMedia('(hover: hover) and (pointer: fine)').matches;
const PATH = location.pathname.replace(/index\.html$/, '');
const dds = [...document.querySelectorAll('.nav__dd')];
const dim = document.createElement('div'); dim.className = 'mm-dim'; document.body.appendChild(dim);
let hyd = false;
const hydrate = () => { if (hyd) return; hyd = true; document.querySelectorAll('.mm img[data-src]').forEach(i => { i.src = i.dataset.src; }); };
const links = document.querySelector('.nav__links');
if (links) { links.addEventListener('pointerenter', hydrate, { once: true }); links.addEventListener('focusin', hydrate, { once: true }); }
const SEC = { svc: /^\/(services|packages)\//, prj: /^\/(projects|playground)\//, ind: /^\/industries\//, res: /^\/(blog|tools|glossary|faq|process)\//, std: /^\/(team|collab|contact)\// };
document.querySelectorAll('.nav__links a[href^="/"]').forEach(a => { if (a.getAttribute('href') === PATH) a.setAttribute('aria-current', 'page'); });
const sync = () => document.documentElement.classList.toggle('mm-on', dds.some(d => d.classList.contains('is-open')));
dds.forEach(d => {
  const b = d.querySelector('.nav__ddb'), p = d.querySelector('.nav__ddp');
  const id = (b.getAttribute('aria-controls') || '').replace('nav-', '');
  if (SEC[id] && SEC[id].test(PATH)) b.setAttribute('data-current', '');
  let t = 0;
  const set = o => {
    clearTimeout(t);
    if (o) { hydrate(); dds.forEach(x => { if (x !== d && x.classList.contains('is-open')) { x.classList.remove('is-open'); x.querySelector('.nav__ddb').setAttribute('aria-expanded', false); } }); }
    d.classList.toggle('is-open', o); b.setAttribute('aria-expanded', o); sync();
  };
  b.addEventListener('click', e => { e.stopPropagation(); set(HOVER && e.detail ? true : !d.classList.contains('is-open')); });
  if (HOVER) {
    d.addEventListener('mouseenter', () => set(true));
    d.addEventListener('mouseleave', () => { clearTimeout(t); t = setTimeout(() => set(false), 160); });
  }
  document.addEventListener('click', e => { if (!d.contains(e.target)) set(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && d.classList.contains('is-open')) { set(false); b.focus(); } });
  b.addEventListener('keydown', e => { if (e.key === 'ArrowDown') { e.preventDefault(); set(true); const f = p.querySelector('a'); if (f) f.focus(); } });
  d.addEventListener('focusout', e => { if (e.relatedTarget && !d.contains(e.relatedTarget)) set(false); });
});

/* Phone menu: a full-screen sheet built once from this list, so every page shares the same menu. */
(() => {
  const burger = document.querySelector('.nav__burger');
  if (!burger) return;
  const home = location.pathname === '/' || location.pathname === '/index.html';
  const at = p => (home && p.startsWith('/#') ? p.slice(1) : p);
  const G = [
    ['Services', /^\/services\//, [['/#services', 'All services'], ['/services/web-design/', 'Web design'], ['/services/seo/', 'SEO'], ['/services/3d/', '3D'], ['/services/video-editing/', 'Video editing'], ['/services/logo-design/', 'Logo design'], ['/services/social-media/', 'Social media']]],
    ['Projects', /^\/(projects|playground)\//, [['/projects/', 'All projects'], ['/projects/#web', 'Websites'], ['/projects/#3d', '3D'], ['/projects/#video', 'Video'], ['/projects/#logo', 'Logo'], ['/projects/#scratch', 'Video from scratch'], ['/projects/sfc-detailing/', 'Case study: SFC Detailing'], ['/playground/', '3D Playground']]],
    ['Industries', /^\/industries\//, [['/industries/', 'All industries'], ['/industries/auto-detailing/', 'Auto detailing'], ['/industries/clinics-dental/', 'Clinics & dental'], ['/industries/contractors-trades/', 'Contractors & trades'], ['/industries/fitness-gyms/', 'Fitness & gyms'], ['/industries/online-stores/', 'Online stores'], ['/industries/real-estate/', 'Real estate'], ['/industries/restaurants-cafes/', 'Restaurants & cafés'], ['/industries/salons-barbers/', 'Salons & barbers']]],
    ['/packages/', 'Prices'],
    ['Resources', /^\/(blog|tools|glossary|faq|process)\//, [['/blog/', 'Blog'], ['/tools/', 'Free tools'], ['/glossary/', 'Glossary'], ['/faq/', 'FAQ'], ['/process/', 'Process']]],
    ['Studio', /^\/(team|collab|contact)\//, [['/team/', 'Team'], ['/contact/', 'Get a quote'], ['/collab/', 'Work with us']]]
  ];
  const RN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
  const here = p => (p === location.pathname ? ' aria-current="page"' : '');
  const link = (p, t, cls = '') => `<a${cls} href="${at(p)}"${here(p)}>${t}</a>`;
  const group = (t, list, n, open) => `<li style="--i:${n}"><details${open ? ' open' : ''}><summary><small>${RN[n]}</small>${t}<i aria-hidden="true"></i></summary><div>${list.map(([p, x]) => link(p, x)).join('')}</div></details></li>`;
  const m = document.createElement('div');
  m.className = 'mnav'; m.id = 'mnav'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', 'Menu'); m.inert = true;
  m.innerHTML = `<div class="mnav__top"><a class="mnav__logo" href="/">Zentorum <em>Agency</em></a><button class="mnav__x" type="button" aria-label="Close menu"><i></i><i></i></button></div>
<nav aria-label="Menu"><ul class="mnav__list">${G.map((g, k) => g.length === 2 ? `<li style="--i:${k}"><a href="${g[0]}"${here(g[0])}><small>${RN[k]}</small>${g[1]}</a></li>` : group(g[0], g[2], k, g[1].test(location.pathname))).join('')}</ul></nav>
<div class="mnav__foot" style="--i:7"><a class="mnav__book" href="https://cal.com/zentorumagency/30min" target="_blank" rel="noopener">Book a call</a><a class="mnav__call" href="tel:+15122415531">Call 512-241-5531</a><a class="mnav__call" href="sms:+15122415531">Text 512-241-5531</a><p>We turn dream ideas into <em>reality</em>. · <a href="https://www.instagram.com/zentorumagency" target="_blank" rel="noopener">@zentorumagency</a></p></div>`;
  document.body.appendChild(m);
  const x = m.querySelector('.mnav__x');
  let open = false;
  const set = o => {
    if (o === open) return; open = o;
    m.inert = !o; m.classList.toggle('is-open', o);
    burger.setAttribute('aria-expanded', o);
    document.documentElement.classList.toggle('mnav-on', o);
    if (window.lenis) o ? window.lenis.stop() : window.lenis.start();
    (o ? x : burger).focus({ preventScroll: true });
  };
  burger.addEventListener('click', () => set(true));
  x.addEventListener('click', () => set(false));
  // same-page links (#contact on the homepage, /projects/#web on /projects/) just close the sheet
  m.addEventListener('click', e => { const a = e.target.closest('a'); if (a && !a.target) set(false); });
  document.addEventListener('keydown', e => {
    if (!open) return;
    if (e.key === 'Escape') return set(false);
    if (e.key !== 'Tab') return;
    const f = [...m.querySelectorAll('a,button,summary')].filter(el => el.offsetParent);
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  matchMedia('(min-width: 901px)').addEventListener('change', e => e.matches && set(false));
})();

/* Site search: ⌘K / Ctrl+K or "/" opens it; the index loads on first open */
(() => {
  const acts = document.querySelector('.nav__acts');
  if (!acts) return;
  const IC = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4"/></svg>';
  const mac = /Mac|iP(hone|ad)/.test(navigator.platform || navigator.userAgent);
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'nav__srch'; btn.setAttribute('aria-label', 'Search the site');
  btn.setAttribute('aria-keyshortcuts', mac ? 'Meta+K' : 'Control+K');
  btn.innerHTML = IC + `<kbd>${mac ? '⌘' : 'Ctrl '}K</kbd>`;
  acts.prepend(btn);
  const POP = [['/tools/#teardown', 'Free website teardown', 'Tool'], ['/packages/', 'Packages & prices', 'Page'], ['https://cal.com/zentorumagency/30min', 'Book a free 30-minute call', 'Action'],
    ['/services/web-design/', 'Web design', 'Service'], ['/industries/', 'Websites for your trade', 'Page'], ['/blog/', 'Blog', 'Page']];
  let d, inp, list, idx, sel = 0, items = [], last;
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ');
  const mark = (s, q) => { let h = esc(s); q.forEach(w => { if (w.length > 1) h = h.replace(new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>'); }); return h; };
  const build = () => {
    d = document.createElement('div');
    d.className = 'srch'; d.hidden = true;
    d.innerHTML = `<div class="srch__bg" data-x></div><div class="srch__box" role="dialog" aria-modal="true" aria-label="Search the site">
<div class="srch__in">${IC}<input type="search" placeholder="Search services, prices, guides…" aria-label="Search" role="combobox" aria-expanded="true" aria-controls="srch-l" aria-autocomplete="list" autocomplete="off" spellcheck="false" enterkeyhint="go"><button type="button" class="srch__x" data-x aria-label="Close search">Esc</button></div>
<ul class="srch__l" id="srch-l" role="listbox" aria-label="Results"></ul>
<p class="srch__ft"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></p></div>`;
    document.body.appendChild(d);
    inp = d.querySelector('input'); list = d.querySelector('.srch__l');
    d.addEventListener('click', e => { if (e.target.closest('[data-x]')) close(); });
    inp.addEventListener('input', run);
    inp.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); pick(sel + (e.key === 'ArrowDown' ? 1 : -1)); }
      else if (e.key === 'Enter' && items[sel]) { e.preventDefault(); list.children[sel].querySelector('a').click(); }
    });
    list.addEventListener('mousemove', e => { const li = e.target.closest('li[data-i]'); if (li && +li.dataset.i !== sel) pick(+li.dataset.i, true); });
    list.addEventListener('click', e => { if (e.target.closest('a')) close(true); });
    d.addEventListener('keydown', e => { if (e.key === 'Tab') { e.preventDefault(); inp.focus(); } });
  };
  const load = () => idx || (idx = fetch('/assets/zta-search.json?v=20261101a').then(r => r.json()).then(a => a.map(x => ({ ...x, n: norm(x.t), hn: norm(x.h), b: norm(x.h + ' ' + x.d + ' ' + x.u) }))).catch(() => (idx = null, [])));
  // every word must match; when nothing does, fall back to results that match most of the words
  const score = (x, q, loose) => {
    let s = 0, miss = 0;
    for (const w of q) {
      const t = x.n.indexOf(w);
      if (t === 0) s += 100; else if (t > 0) s += x.n[t - 1] === ' ' ? 40 : 15;
      else if (x.b.includes(w)) s += x.hn.includes(w) ? 10 : 5;
      else if (loose) miss++; else return 0;
    }
    return miss === q.length ? 0 : s + (x.k === 'Service' || x.k === 'Tool' ? 3 : x.k === 'Page' ? 2 : 0);
  };
  const row = (x, i, q) => {
    const ext = /^https?:/.test(x.u);
    return `<li role="option" id="srch-${i}" data-i="${i}" aria-selected="${i === sel}"><a href="${esc(x.u)}"${ext ? ' target="_blank" rel="noopener"' : ''} tabindex="-1"><span class="srch__k srch__k--${x.k.toLowerCase()}">${x.k}</span><span class="srch__t"><b>${mark(x.t, q)}</b>${x.d ? `<small>${mark(x.d, q)}</small>` : ''}</span><i aria-hidden="true">${ext || /^(tel|sms):/.test(x.u) ? '↗' : '→'}</i></a></li>`;
  };
  async function run() {
    const raw = inp.value.trim(), q = norm(raw).split(/\s+/).filter(Boolean);
    sel = 0;
    if (!q.length) {
      items = POP.map(([u, t, k]) => ({ u, t, k, d: '' }));
      list.innerHTML = '<li class="srch__h" role="presentation">Popular</li>' + items.map((x, i) => row(x, i, [])).join('');
      return pick(0);
    }
    const all = await load();
    if (inp.value.trim() !== raw) return;
    const rank = loose => all.map(x => [score(x, q, loose), x]).filter(a => a[0]).sort((a, b) => b[0] - a[0]).slice(0, 8).map(a => a[1]);
    items = rank(false);
    if (!items.length && q.length > 1) items = rank(true);
    list.innerHTML = items.length ? items.map((x, i) => row(x, i, q)).join('')
      : `<li class="srch__no" role="presentation">No results for “${esc(raw)}”. <a href="/contact/">Ask us directly →</a></li>`;
    pick(0);
  }
  function pick(i, mouse) {
    if (!items.length) return inp.removeAttribute('aria-activedescendant');
    sel = (i + items.length) % items.length;
    [...list.querySelectorAll('li[data-i]')].forEach(li => li.setAttribute('aria-selected', +li.dataset.i === sel));
    inp.setAttribute('aria-activedescendant', 'srch-' + sel);
    if (!mouse) list.querySelector(`[data-i="${sel}"]`)?.scrollIntoView({ block: 'nearest' });
  }
  function open() {
    if (!d) build();
    if (!d.hidden) return;
    last = document.activeElement;
    document.querySelector('.mnav.is-open .mnav__x')?.click();
    d.hidden = false; requestAnimationFrame(() => d.classList.add('is-on'));
    document.documentElement.classList.add('srch-on');
    if (window.lenis) window.lenis.stop();
    inp.value = ''; run(); inp.focus(); load();
  }
  function close(nav) {
    if (!d || d.hidden) return;
    d.classList.remove('is-on'); d.hidden = true;
    document.documentElement.classList.remove('srch-on');
    if (window.lenis) window.lenis.start();
    if (!nav && last) last.focus({ preventScroll: true });
  }
  btn.addEventListener('click', open);
  btn.addEventListener('pointerenter', load, { once: true });
  addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); d && !d.hidden ? close() : open(); return; }
    if (e.key === 'Escape' && d && !d.hidden) { e.stopPropagation(); return close(); }
    const t = e.target;
    if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !(t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) { e.preventDefault(); open(); }
  }, true);
  addEventListener('pageshow', e => e.persisted && close(true));
})();
