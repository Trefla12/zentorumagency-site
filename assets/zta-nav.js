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
