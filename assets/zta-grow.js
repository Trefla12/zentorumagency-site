/* Zentorum Agency · /simulategrowth/: mounts the brand growth game */
(() => {
  const el = document.querySelector('[data-game]');
  if (!el) return;
  if (window.ZTATycoon?.mount) {
    el.innerHTML = '';
    window.ZTATycoon.mount(el, { onCTA: () => { location.href = '/contact/'; } });
  } else {
    const f = el.querySelector('.play__fallback');
    if (f) f.innerHTML = 'The game is taking a break. <a class="link" href="/contact/">Start your project instead</a>.';
  }
})();
