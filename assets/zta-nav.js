/* Services dropdown in the main nav: click/tap toggles, hover opens on desktop, Esc or click outside closes. */
const HOVER = matchMedia('(hover: hover) and (pointer: fine)').matches;
document.querySelectorAll('.nav__dd').forEach(d => {
  const b = d.querySelector('.nav__ddb');
  const set = o => { d.classList.toggle('is-open', o); b.setAttribute('aria-expanded', o); };
  b.addEventListener('click', e => { e.stopPropagation(); set(HOVER && e.detail ? true : !d.classList.contains('is-open')); });
  if (HOVER) { d.addEventListener('mouseenter', () => set(true)); d.addEventListener('mouseleave', () => set(false)); }
  document.addEventListener('click', e => { if (!d.contains(e.target)) set(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && d.classList.contains('is-open')) { set(false); b.focus(); } });
  d.addEventListener('focusout', e => { if (e.relatedTarget && !d.contains(e.relatedTarget)) set(false); });
});

/* Phone menu: a full-screen sheet built once from this list, so every page shares the same menu. */
(() => {
  const burger = document.querySelector('.nav__burger');
  if (!burger) return;
  const home = location.pathname === '/' || location.pathname === '/index.html';
  const at = p => (home && p.startsWith('/#') ? p.slice(1) : p);
  const SVC = [['/#services', 'All services'], ['/services/web-design/', 'Web design'], ['/services/seo/', 'SEO'], ['/services/3d/', '3D'], ['/services/video-editing/', 'Video editing'], ['/services/logo-design/', 'Logo design'], ['/services/social-media/', 'Social media']];
  const PRJ = [['/projects/', 'All projects'], ['/projects/#web', 'Web'], ['/projects/#3d', '3D'], ['/projects/#video', 'Video'], ['/projects/#logo', 'Logo'], ['/projects/#scratch', 'Video from scratch']];
  const TOP = [['/process/', 'Process'], ['/packages/', 'Prices'], ['/faq/', 'FAQ'], ['/tools/', 'Free tools'], ['/collab/', 'Work with us'], ['/contact/', 'Contact']];
  const RN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
  const here = p => (p === location.pathname ? ' aria-current="page"' : '');
  const link = (p, t, cls = '') => `<a${cls} href="${at(p)}"${here(p)}>${t}</a>`;
  const group = (t, list, n, open) => `<li style="--i:${n}"><details${open ? ' open' : ''}><summary><small>${RN[n]}</small>${t}<i aria-hidden="true"></i></summary><div>${list.map(([p, x]) => link(p, x)).join('')}</div></details></li>`;
  const inSvc = location.pathname.startsWith('/services/'), inPrj = location.pathname.startsWith('/projects/');
  const m = document.createElement('div');
  m.className = 'mnav'; m.id = 'mnav'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', 'Menu'); m.inert = true;
  m.innerHTML = `<div class="mnav__top"><a class="mnav__logo" href="/">Zentorum <em>Agency</em></a><button class="mnav__x" type="button" aria-label="Close menu"><i></i><i></i></button></div>
<nav aria-label="Menu"><ul class="mnav__list">${group('Services', SVC, 0, inSvc)}${group('Projects', PRJ, 1, inPrj)}${TOP.map(([p, t], k) => `<li style="--i:${k + 2}"><a href="${at(p)}"${here(p)}><small>${RN[k + 2]}</small>${t}</a></li>`).join('')}</ul></nav>
<div class="mnav__foot" style="--i:9"><a class="mnav__book" href="https://cal.com/zentorumagency/30min" target="_blank" rel="noopener">Book a call</a><a class="mnav__call" href="tel:+15122415531">Call 512-241-5531</a><p>We turn dream ideas into <em>reality</em>. · <a href="https://www.instagram.com/zentorumagency" target="_blank" rel="noopener">@zentorumagency</a></p></div>`;
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
