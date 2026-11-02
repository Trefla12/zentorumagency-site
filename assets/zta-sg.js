/* Style guide: reads the live CSS custom properties and computed styles, never hard-coded values. */
(function () {
  var root = document.documentElement, cs = getComputedStyle(root);
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var el = function (t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  var probe = el('div'); probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none'; document.body.appendChild(probe);
  var toastEl = $('#sg-toast'), tt;
  function toast(m) { toastEl.textContent = m; toastEl.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { toastEl.classList.remove('on'); }, 1800); }
  function copy(txt) {
    var done = function () { toast('Copied ' + txt); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, function () { fb(); });
    else fb();
    function fb() { var t = el('textarea'); t.value = txt; t.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e) {} t.remove(); done(); }
  }
  function hex(n) { return ('0' + Math.round(n).toString(16)).slice(-2); }
  function toHex(rgb) {
    var m = rgb.match(/[\d.]+/g); if (!m) return rgb; var r = '#' + hex(m[0]) + hex(m[1]) + hex(m[2]);
    if (m.length > 3 && +m[3] < 1) r += hex(m[3] * 255); return r.toUpperCase();
  }
  function px(v) { return Math.round(parseFloat(v) * 100) / 100 + 'px'; }

  /* colours */
  var colors = [['--bg', 'Background', 'Page base'], ['--bg2', 'Background 2', 'Raised surfaces'], ['--plum', 'Plum', 'Deep accent'], ['--cream', 'Cream', 'Text and headings'], ['--muted', 'Muted', 'Secondary text'], ['--gold', 'Gold', 'Brand accent'], ['--gold2', 'Gold 2', 'Gold, darker'], ['--line', 'Line', 'Borders and dividers']];
  var sw = $('#sg-sw');
  colors.forEach(function (c) {
    var raw = cs.getPropertyValue(c[0]).trim(); if (!raw) return;
    probe.style.background = 'var(' + c[0] + ')'; var h = toHex(getComputedStyle(probe).backgroundColor);
    var b = el('button', 'sg-sw__b'); b.type = 'button'; b.setAttribute('aria-label', 'Copy ' + c[1] + ' ' + h);
    b.innerHTML = '<span class="sg-sw__c"><i style="background:var(' + c[0] + ')"></i></span><span class="sg-sw__m"><b>' + c[1] + '</b><code>' + h + '</code><code>var(' + c[0] + ')</code><small>' + c[2] + ' · tap to copy</small></span>';
    b.addEventListener('click', function () { copy(h); b.classList.add('is-c'); setTimeout(function () { b.classList.remove('is-c'); }, 1200); });
    sw.appendChild(b);
  });
  var g = cs.getPropertyValue('--goldg').trim();
  if (g) {
    var gb = el('button', 'sg-sw__b'); gb.type = 'button'; gb.setAttribute('aria-label', 'Copy gold gradient');
    gb.innerHTML = '<span class="sg-sw__c"><i style="background:var(--goldg)"></i></span><span class="sg-sw__m"><b>Gold gradient</b><code>var(--goldg)</code><small>Buttons and highlights · tap to copy</small></span>';
    gb.addEventListener('click', function () { copy(g); }); sw.appendChild(gb);
  }

  /* type */
  var fs = $('#sg-fam');
  [['--serif', 'Display serif', 'Aa', 'big'], ['--sans', 'Body sans', 'Aa', 'big']].forEach(function (f) {
    var raw = cs.getPropertyValue(f[0]).trim(), first = raw.split(',')[0].replace(/['"]/g, '').trim();
    var c = el('div', 'card'); c.innerHTML = '<p class="from">' + f[1] + '</p><p class="big" style="font-family:var(' + f[0] + ')' + (f[0] === '--sans' ? ';font-weight:300' : '') + '">' + f[2] + '</p><p><b>' + first + '</b></p><p class="note"><code>' + f[0] + '</code> · ' + raw.replace(/</g, '&lt;') + '</p>';
    fs.appendChild(c);
  });
  var specimens = [['h1', 'Heading 1', 'We turn dream ideas into reality'], ['h2', 'Heading 2', 'Websites that bring in customers'], ['h3', 'Heading 3', 'Fast, phone-first, yours to keep'], ['p.lede', 'Lede', 'A short, plain sentence that explains the page.'], ['p', 'Body', 'Body copy is Inter Light, comfortable to read on a phone and calm next to the serif.'], ['p.eyebrow', 'Eyebrow', 'Section label'], ['p.note', 'Note', 'Small print and helper text in the muted colour.']];
  var ty = $('#sg-ty');
  specimens.forEach(function (s) {
    var parts = s[0].split('.'), e = el(parts[0]); if (parts[1]) e.className = parts[1]; e.textContent = s[2]; e.className += ' sg-ty__s';
    probe.appendChild(e); var c = getComputedStyle(e);
    var heading = /^h[1-6]$/.test(parts[0]), look = heading ? ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'margin'].map(function (k) { return k.replace(/[A-Z]/g, function (m) { return '-' + m.toLowerCase(); }) + ':' + c[k]; }).join(';') : '';
    var meta = c.fontFamily.split(',')[0].replace(/['"]/g, '') + ' · ' + px(c.fontSize) + ' / ' + (c.lineHeight === 'normal' ? 'normal' : px(c.lineHeight)) + ' · ' + c.fontWeight + (parseFloat(c.letterSpacing) ? ' · ' + px(c.letterSpacing) + ' tracking' : '');
    probe.removeChild(e);
    var row = el('div', 'sg-ty__r'), k = el('div', 'sg-ty__k', '<b>' + s[1] + '</b>' + meta);
    /* specimens must not be real headings: the page keeps a single h1 and a clean outline */
    var live = el(heading ? 'div' : parts[0]); if (heading) live.style.cssText = look; if (parts[1]) live.className = parts[1]; live.className += ' sg-ty__s'; live.textContent = s[2];
    row.appendChild(k); row.appendChild(live); ty.appendChild(row);
  });

  /* spacing / radii / shadows read from real components */
  function sample(cls, tag, style) { var e = el(tag || 'div', cls); if (style) e.style.cssText = style; probe.appendChild(e); var c = getComputedStyle(e); return { e: e, c: c }; }
  var sp = $('#sg-sp');
  var rows = [];
  rows.push(['Page gutter', '--pad', cs.getPropertyValue('--pad').trim() ? (function () { probe.style.paddingLeft = 'var(--pad)'; var v = getComputedStyle(probe).paddingLeft; probe.style.paddingLeft = ''; return v; })() : '0px']);
  var s1 = sample('sec'); rows.push(['Section padding', '.sec', s1.c.paddingTop]);
  var s2 = sample('grid'); rows.push(['Grid gap', '.grid', s2.c.rowGap]);
  var s3 = sample('card'); rows.push(['Card padding', '.card', s3.c.paddingTop]);
  var s4 = sample('panel'); rows.push(['Panel padding', '.panel', s4.c.paddingTop]);
  var s5 = sample('btn btn--gold'); rows.push(['Button height', '.btn', s5.c.minHeight], ['Button padding', '.btn', s5.c.paddingLeft]);
  var s6 = sample('in-t', 'input'); rows.push(['Field height', '.in-t', s6.c.minHeight]);
  var max = Math.max.apply(null, rows.map(function (r) { return parseFloat(r[2]); }));
  rows.forEach(function (r) {
    var w = Math.max(2, parseFloat(r[2]) / max * 100);
    sp.appendChild(el('div', 'sg-sp__r', '<span><b>' + r[0] + '</b><br><code>' + r[1] + ' · ' + px(r[2]) + '</code></span><i style="width:' + w + '%"></i>'));
  });
  var rs = $('#sg-rs');
  [['Pill', s5.c.borderRadius, 'Buttons, chips, tags', 'btn'], ['Field', s6.c.borderRadius, 'Inputs and tips', 'in-t'], ['Card', s3.c.borderRadius, 'Cards and tiles', 'card'], ['Panel', s4.c.borderRadius, 'Forms and big blocks', 'panel']].forEach(function (r) {
    var br = parseFloat(r[1]) > 200 ? '999px' : r[1];
    rs.appendChild(el('figure', '', '<div class="box" style="border-radius:' + br + '"></div><figcaption><b>' + r[0] + '</b>border-radius: ' + (parseFloat(r[1]) > 200 ? '999px' : px(r[1])) + '<br>' + r[2] + '</figcaption>'));
  });
  var sh = $('#sg-sh');
  sh.appendChild(el('figure', '', '<div class="box" style="border-radius:22px;box-shadow:' + s5.c.boxShadow + ';background:var(--goldg);border:0"></div><figcaption><b>Gold glow</b>box-shadow: ' + s5.c.boxShadow + '</figcaption>'));
  var hv = '0 14px 50px -8px rgba(230,201,140,.75)';
  sh.appendChild(el('figure', '', '<div class="box" style="border-radius:22px;box-shadow:' + hv + ';background:var(--goldg);border:0"></div><figcaption><b>Gold glow, hover</b>box-shadow: ' + hv + '</figcaption>'));
  var ring = '0 0 0 3px rgba(230,201,140,.18)';
  sh.appendChild(el('figure', '', '<div class="box" style="border-radius:14px;border-color:var(--gold);box-shadow:' + ring + '"></div><figcaption><b>Focus ring</b>box-shadow: ' + ring + '</figcaption>'));
  probe.innerHTML = '';

  /* icons used on the site: pulled from the nav menu */
  var icons = $('#sg-ic'), seen = {};
  document.querySelectorAll('.mm__i').forEach(function (a) {
    var s = a.querySelector('svg.mm__ic'), b = a.querySelector('b'); if (!s || !b) return;
    var d = s.innerHTML; if (seen[d]) return; seen[d] = 1;
    icons.appendChild(el('div', 'sg-ic__i', '<svg viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg><span>' + b.textContent + '</span>'));
  });
  var cnt = $('#sg-ic-n'); if (cnt) cnt.textContent = icons.children.length;

  /* motion */
  var mo = $('#sg-mo'), reduce = matchMedia('(prefers-reduced-motion:reduce)');
  var ease = cs.getPropertyValue('--ease').trim();
  var motions = [['Hover, tap', '.35s', ease, 'Buttons and lifts'], ['Menus, chips', '.5s', ease, 'Panels and chips'], ['Reveal on scroll', '.8s', ease, 'Sections fade up'], ['Linear (for contrast)', '.8s', 'linear', 'No easing, feels flat']];
  motions.forEach(function (m) {
    var c = el('div', 'card sg-mo__c', '<p class="from">' + m[0] + '</p><div class="sg-mo__t"><i style="transition:transform ' + m[1] + ' ' + m[2] + '"></i></div><p class="note">' + m[3] + '</p><code>' + m[1] + ' ' + m[2].replace(/</g, '&lt;') + '</code>');
    mo.appendChild(c);
  });
  var rp = $('#sg-replay'), note = $('#sg-rm');
  function track() { var t = mo.querySelector('.sg-mo__t'); return t ? t.clientWidth - 22 : 100; }
  function run() {
    mo.style.setProperty('--run', track() + 'px');
    if (reduce.matches) { mo.classList.add('is-run'); return; }
    mo.classList.remove('is-run'); void mo.offsetWidth; requestAnimationFrame(function () { requestAnimationFrame(function () { mo.classList.add('is-run'); }); });
  }
  function syncRm() { note.textContent = reduce.matches ? 'Reduce motion is on in your settings, so these samples show the end state and stay still. The whole site does the same.' : 'Tap Replay to see each duration and easing. With reduce motion on, these stay still.'; if (reduce.matches) { mo.style.setProperty('--run', track() + 'px'); mo.classList.add('is-run'); } }
  rp.addEventListener('click', run);
  if (reduce.addEventListener) reduce.addEventListener('change', syncRm);
  syncRm();
  if ('IntersectionObserver' in window && !reduce.matches) { var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { io.disconnect(); run(); } }, { threshold: .4 }); io.observe(mo); }

  /* chips demo: forms are display-only */
  document.querySelectorAll('.sg-demo').forEach(function (f) { f.addEventListener('submit', function (e) { e.preventDefault(); }); });
})();
