/* Services dropdown in the main nav: click/tap toggles, hover opens on desktop, Esc or click outside closes. */
document.querySelectorAll('.nav__dd').forEach(d => {
  const b = d.querySelector('.nav__ddb');
  const set = o => { d.classList.toggle('is-open', o); b.setAttribute('aria-expanded', o); };
  b.addEventListener('click', e => { e.stopPropagation(); set(!d.classList.contains('is-open')); });
  document.addEventListener('click', e => { if (!d.contains(e.target)) set(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && d.classList.contains('is-open')) { set(false); b.focus(); } });
  d.addEventListener('focusout', e => { if (!d.contains(e.relatedTarget)) set(false); });
});
