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
