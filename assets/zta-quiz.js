/* Quizzes: "Which package fits you?" and "How outdated is my website?". One engine, two configs.
   Answers live in the URL hash (#r=1.0.2) so results are shareable. No data leaves the browser. */
(function () {
  var root = document.querySelector('[data-quiz]');
  if (!root) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var BOOK = 'https://cal.com/zentorumagency/30min';
  var usd = function (n) { return '$' + n.toLocaleString('en-US'); };
  var el = function (tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

  /* ---------- config A: which package (prices copied from /packages/) ---------- */
  var PK = {
    launch:  { name: 'Launch',  href: '/packages/#launch',  chip: 'Logo & motion', min: 300, time: '1–4 days',  blurb: 'A logo and mini brand kit so a new business looks established from day one.' },
    website: { name: 'Website', href: '/packages/#website', chip: 'Website / store', min: 1250, time: '3–11 days', blurb: 'A fast, polished site that turns visitors into calls, bookings and sales.' },
    grow:    { name: 'Grow',    href: '/packages/#grow',    chip: 'SEO', min: 200, time: 'ongoing, monthly', blurb: 'SEO and social media every month so more people find you.' },
    create:  { name: 'Create',  href: '/packages/#create',  chip: 'Video editing', min: 75, time: '2–5 days', blurb: 'Video edits, 3D renders and motion logos made to order.' }
  };
  var KEYS = ['launch', 'website', 'grow', 'create'];
  var CEIL = [300, 1250, 2500, Infinity];
  var BUDGET_IDX = [0, 0, 1, 2];
  var TIMES = ['ASAP', 'Within a month', '2–3 months', 'Flexible'];
  var NEED = ['a logo and brand', 'a website or online store', 'more people finding you each month', 'video, 3D or motion content', 'help choosing'];
  var PKG = {
    id: 'pkg', hashLen: 6,
    qs: [
      { q: 'What do you need most right now?', o: ['A logo and brand look', 'A website or online store', 'More visitors, calls or followers every month', 'Video, 3D or motion content', 'Not sure yet'] },
      { q: 'Do you have a website today?', o: ['No website yet', 'Yes, but it is outdated or not working for me', 'Yes, and it works fine'] },
      { q: 'How big should the site be?', hint: 'Only matters if you need a website. Skip with "Not sure".', o: ['Small: 1–5 pages', 'Bigger: 6–15 pages or an online store', 'Not sure'] },
      { q: 'When do you want it done?', o: TIMES },
      { q: 'What budget range feels right?', hint: 'A range is fine. Your final quote always comes after a quick call.', o: ['Under $300', '$300–$1,250', '$1,250–$2,500', '$2,500 or more'] },
      { q: 'Any extras you want?', hint: 'Pick all that apply, then continue.', multi: true, o: ['3D product visuals', 'Video editing', 'Logo or brand kit', 'SEO', 'Social media posts and reels', 'None of these'] }
    ],
    valid: function (a) { return a.length === 6 && a[0] < 5 && a[1] < 3 && a[2] < 3 && a[3] < 4 && a[4] < 4 && a[5] < 32; },
    calc: function (a) {
      var s = { launch: 0, website: 0, grow: 0, create: 0 }, x = a[5];
      var has3d = x & 1, hasVid = x & 2, hasLogo = x & 4, hasSeo = x & 8, hasSoc = x & 16;
      if (a[0] < 4) s[KEYS[a[0]]] += 6;
      if (a[1] === 0) s.website += 2; else if (a[1] === 1) s.website += 3; else { s.grow += 2; s.create += 1; if (a[0] !== 1) s.website -= 1; }
      if (a[4] === 0) { s.create += 3; s.website -= 4; s.launch -= 1; s.grow -= 1; }
      else if (a[4] === 1) { s.launch += 2; s.create += 2; s.grow += 1; s.website -= 3; }
      else if (a[4] === 2) s.website += 2; else { s.website += 2; s.grow += 1; }
      if (has3d) s.create += 2; if (hasVid) s.create += 2; if (hasLogo) s.launch += 2; if (hasSeo) s.grow += 2; if (hasSoc) s.grow += 2;
      var order = KEYS.slice().sort(function (p, q) { return s[q] - s[p] || (p === 'website' ? -1 : q === 'website' ? 1 : 0); });
      return { top: order[0], alt: order[1], x: x, a: a };
    },
    price: function (k, a) {
      var x = a[5], p = PK[k];
      if (k === 'launch') return { min: 300, line: 'From $300 one-time (range $300–$500)', time: p.time };
      if (k === 'website') {
        if (a[2] === 1) return { min: 2500, line: 'From $2,500 one-time for 6–15 pages or a store (range up to $4,000)', time: '7–11 days' };
        if (a[2] === 0) return { min: 1250, line: 'From $1,250 one-time for 1–5 pages', time: '3–7 days' };
        return { min: 1250, line: 'From $1,250 one-time for 1–5 pages, from $2,500 for 6–15 pages or a store', time: '3–11 days' };
      }
      if (k === 'grow') {
        var soc = x & 16, seo = x & 8;
        if (soc && !seo) return { min: 500, line: 'Social media from $500 per month (range $500–$1,500)', time: p.time };
        if (soc && seo) return { min: 200, line: 'SEO from $200 per month (2-month minimum) and social media from $500 per month', time: p.time };
        return { min: 200, line: 'SEO from $200 per month (range $200–$1,200, 2-month minimum)', time: p.time };
      }
      var d3 = x & 1, vid = x & 2;
      if (d3 && !vid) return { min: 200, line: '3D renders and animation from $200 per project (range $200–$800)', time: '3–5 days' };
      if (d3 && vid) return { min: 75, line: 'Video edits from $75 and 3D from $200 per project', time: '2–5 days' };
      return { min: 75, line: 'Video edits from $75 per project (range $75–$300); 3D from $200', time: '2–5 days' };
    },
    render: function (box, r, ctx) {
      var a = r.a, top = r.top, p = PK[top], pr = this.price(top, a), alt = PK[r.alt], ap = this.price(r.alt, a);
      var card = el('div', 'qz__card');
      card.append(el('p', 'qz__k', 'Your best fit'));
      var h = el('h2', 'qz__big', p.name); h.tabIndex = -1; h.id = 'qz-res'; card.append(h);
      card.append(el('p', 'qz__price', pr.line + ' · ' + pr.time));
      var why = [];
      if (a[0] < 4) why.push('You said you mainly need ' + NEED[a[0]] + ', which is what ' + p.name + ' covers.');
      else why.push('You were not sure what to pick, so we matched on your other answers.');
      if (a[1] === 0) why.push('You have no website yet' + (top === 'website' ? ', so a new build is the natural first step.' : '.'));
      else if (a[1] === 1) why.push('Your current site is not working for you' + (top === 'website' ? ', so a rebuild beats patching it.' : '.'));
      else why.push('Your site already works, so the money is better spent on ' + (top === 'website' ? 'improving it.' : 'growth and content.'));
      if (CEIL[a[4]] >= pr.min) why.push('Your budget range covers the starting price of ' + usd(pr.min) + '.');
      if (a[3] < 3 && top !== 'grow') why.push('Timeline: ' + TIMES[a[3]].toLowerCase() + '. Typical delivery for ' + p.name + ' is ' + pr.time + '.');
      var ul = el('ul', 'qz__why'); why.slice(0, 3).forEach(function (t) { ul.append(el('li', '', t)); }); card.append(ul);
      if (CEIL[a[4]] < pr.min) card.append(el('p', 'qz__flag', 'Your budget range is below the starting price of ' + usd(pr.min) + '. Tell us your real number on a call and we will say honestly what fits first.'));
      box.append(card);
      var run = el('div', 'qz__run');
      var b = el('b'); var l = el('a', 'gold', alt.name + ' (from ' + usd(ap.min) + (r.alt === 'grow' ? '/mo' : '') + ')'); l.href = alt.href; b.append('Runner-up: ', l); run.append(b, el('p', '', alt.blurb));
      box.append(run);
      var acts = el('div', 'qz__acts');
      var lock = el('a', 'btn btn--gold'); lock.href = '/contact/'; lock.append(el('span', '', 'Lock this quote'));
      lock.addEventListener('click', function () {
        var parts = ['Quote from the package quiz: ' + p.name + '. ' + pr.line + '.'];
        if (a[1] < 3) parts.push('Website today: ' + ['none', 'yes, outdated', 'yes, works fine'][a[1]] + '.');
        parts.push('Budget range: ' + ['under $300', '$300–$1,250', '$1,250–$2,500', '$2,500 or more'][a[4]] + '. Timeline: ' + TIMES[a[3]] + '.');
        var ex = ['3D visuals', 'video editing', 'logo/brand kit', 'SEO', 'social media'].filter(function (_, i) { return a[5] & (1 << i); });
        if (ex.length) parts.push('Extras: ' + ex.join(', ') + '.');
        var chips = [p.chip];
        if (top === 'grow') chips = (a[5] & 16 ? ['Social media'] : []).concat(a[5] & 8 || !(a[5] & 16) ? ['SEO'] : []);
        if (top === 'create') chips = (a[5] & 1 ? ['Blender 3D'] : []).concat(a[5] & 2 || !(a[5] & 1) ? ['Video editing'] : []);
        if (top === 'website' && a[5] & 4) chips.push('Logo & motion');
        try { sessionStorage.setItem('zta-prefill', JSON.stringify({ services: chips, budget: BUDGET_IDX[a[4]], dream: parts.join(' '), timeline: TIMES[a[3]] })); } catch (e) {}
      });
      var bk = el('a', 'btn btn--ghost'); bk.href = BOOK; bk.target = '_blank'; bk.rel = 'noopener'; bk.setAttribute('data-book', ''); bk.append(el('span', '', 'Book a call'));
      acts.append(lock, bk); box.append(acts);
      box.append(el('p', 'qz__small', 'Prices are starting prices from our packages page. Your final quote comes after a quick call.'));
    }
  };

  /* ---------- config B: how outdated (yes = good; weights sum to 100) ---------- */
  var OUT_Q = [
    { q: 'Does your site look and work well on a phone, with no pinching or zooming?', w: 14, t: 'Make it work on phones', f: 'Most visitors arrive on a phone. A site that needs pinching or zooming loses them in seconds.', g: ['/blog/mobile-first/', 'Mobile-first design guide'] },
    { q: 'Does your homepage show up in about 3 seconds on mobile data?', w: 14, t: 'Speed it up', f: 'Slow pages lose visitors before they read a word. Big images and heavy scripts are the usual cause.', g: ['/blog/why-is-my-website-slow/', 'Why is my website slow?'] },
    { q: 'Does the address start with https:// and show a padlock, with no "Not secure" warning?', w: 8, t: 'Fix the security warning', f: 'A "Not secure" label scares customers off. It is usually a quick fix on your host, plus regular upkeep.', g: ['/blog/website-maintenance-checklist/', 'Website maintenance checklist'] },
    { q: 'Can a new visitor see what to do next (call, book, buy) without scrolling?', w: 14, t: 'Add one clear next step', f: 'Every page needs one obvious action. If visitors must hunt for it, most will leave.', g: ['/blog/homepage-that-sells/', 'How to write a homepage that sells'] },
    { q: 'Have your hours, prices or photos been updated in the last 6 months?', w: 10, t: 'Refresh stale content', f: 'Old hours, prices or photos make a business look closed or careless.', g: ['/blog/website-maintenance-checklist/', 'Website maintenance checklist'] },
    { q: 'Do you show real customer reviews or results on the site?', w: 10, t: 'Show real reviews', f: 'People trust other customers more than your own words. Show real reviews near the call to action.', g: ['/blog/more-google-reviews/', 'How to get more Google reviews'] },
    { q: 'Can customers book, message or call you in one tap?', w: 10, t: 'Make contact one tap', f: 'Click-to-call, a short form or online booking turn interest into customers while it is fresh.', g: ['/blog/website-must-haves/', 'Website must-haves'] },
    { q: 'Would you be happy to show it next to your competitors’ sites?', w: 10, t: 'Update the look', f: 'Dated design makes good businesses look behind. Clean type, space and real photos go a long way.', g: ['/blog/landing-page-anatomy/', 'Anatomy of a landing page'] },
    { q: 'Do you have a claimed Google Business Profile with current info?', w: 10, t: 'Claim your Google Business Profile', f: 'It is free, and it is often the first thing local customers see. Keep hours, photos and links current.', g: ['/blog/google-business-profile/', 'Google Business Profile guide'] }
  ];
  var TIERS = [
    [25, 'Fresh', 'Your site is in good shape. A light check now and then keeps it that way.'],
    [50, 'Needs a tune-up', 'The basics are there, but a few fixes would make a real difference.'],
    [75, 'Showing its age', 'Visitors are probably noticing. Several fixes would pay off, and some may add up to a rebuild.'],
    [101, 'Time for a rebuild', 'Patching will cost more than it gains. A fresh build is likely the better use of money.']
  ];
  var OUT = {
    id: 'out', hashLen: OUT_Q.length,
    qs: OUT_Q.map(function (d) { return { q: d.q, o: ['Yes', 'Not sure', 'No'], yn: true }; }),
    valid: function (a) { return a.length === OUT_Q.length && a.every(function (v) { return v < 3; }); },
    calc: function (a) {
      var pen = a.map(function (v, i) { return OUT_Q[i].w * (v === 2 ? 1 : v === 1 ? 0.5 : 0); });
      var score = Math.round(pen.reduce(function (s, v) { return s + v; }, 0));
      var idx = pen.map(function (v, i) { return i; }).filter(function (i) { return pen[i] > 0; }).sort(function (p, q) { return pen[q] - pen[p] || p - q; });
      return { score: score, fixes: idx.slice(0, 3), a: a };
    },
    render: function (box, r) {
      var tier = TIERS.filter(function (t) { return r.score < t[0]; })[0];
      var card = el('div', 'qz__card');
      card.append(el('p', 'qz__k', 'Your result'));
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 240 150'); svg.setAttribute('class', 'qz__gauge'); svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', 'Outdated score ' + r.score + ' out of 100');
      svg.innerHTML = '<defs><linearGradient id="qz-g" x1="0" x2="1"><stop offset="0" stop-color="#e6c98c"/><stop offset=".6" stop-color="#e8a56b"/><stop offset="1" stop-color="#e9806f"/></linearGradient></defs>' +
        '<path class="tr" d="M20 120A100 100 0 0 1 220 120" pathLength="100"/>' +
        '<path class="fl" d="M20 120A100 100 0 0 1 220 120" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/>' +
        '<text x="120" y="112" aria-hidden="true">0</text><text class="sm" x="120" y="140" aria-hidden="true">OUTDATED SCORE, 0 TO 100</text>';
      card.append(svg);
      var h = el('h2', 'qz__big', tier[1]); h.tabIndex = -1; h.id = 'qz-res'; h.style.textAlign = 'center'; card.append(h);
      var d = el('p', 'qz__price', tier[2]); d.style.textAlign = 'center'; card.append(d);
      box.append(card);
      var fl = svg.querySelector('.fl'), num = svg.querySelector('text');
      if (RM) { fl.setAttribute('stroke-dashoffset', 100 - r.score); num.textContent = r.score; }
      else {
        var t0 = null, dur = 1300;
        var tick = function (t) {
          if (t0 === null) t0 = t;
          var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
          fl.setAttribute('stroke-dashoffset', 100 - r.score * e); num.textContent = Math.round(r.score * e);
          if (k < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
      if (r.fixes.length) {
        box.append(el('h3', 'qz__k', 'Your ' + (r.fixes.length === 1 ? 'top fix' : r.fixes.length + ' most important fixes')));
        var ol = el('ol', 'qz__fixes');
        r.fixes.forEach(function (i, n) {
          var f = OUT_Q[i], li = el('li', 'qz__fix');
          li.append(el('b', '', (n + 1) + '. ' + f.t), el('p', '', f.f));
          var a = el('a', 'gold', 'Read: ' + f.g[1] + ' →'); a.href = f.g[0]; li.append(a); ol.append(li);
        });
        box.append(ol);
      } else box.append(el('p', 'qz__flag', 'Nothing urgent from your answers. Keep an eye on it every few months.'));
      var acts = el('div', 'qz__acts');
      var m = el('a', 'btn btn--gold'); m.href = '/free-mockup/'; m.append(el('span', '', 'Get a free homepage mockup'));
      var ro = el('a', 'btn btn--ghost'); ro.href = '/#roast'; ro.append(el('span', '', 'Roast my site (free)'));
      acts.append(m, ro); box.append(acts);
      var bk = el('p', 'qz__small'); var bl = el('a', 'gold', 'book a free call'); bl.href = BOOK; bl.target = '_blank'; bl.rel = 'noopener'; bl.setAttribute('data-book', '');
      bk.append('Prefer to talk it through? You can also ', bl, '. This is a quick self-check from your own answers, not a full audit.'); box.append(bk);
    }
  };

  var C = root.getAttribute('data-quiz') === 'out' ? OUT : PKG;
  var n = C.qs.length, ans = [], step = 0;
  var stage = $('.qz__stage', root), res = $('.qz__res', root), bar = $('.qz__bar i', root), barBox = $('.qz__bar', root), cnt = $('.qz__n', root), back = $('.qz__back', root), top = $('.qz__top', root);

  function setBar(v, label) { bar.style.width = (v * 100) + '%'; barBox.setAttribute('aria-valuenow', Math.round(v * 100)); cnt.textContent = label; }
  function show(i, focus) {
    step = i; root.classList.add('qz--on'); stage.hidden = false; res.hidden = true; top.hidden = false; stage.textContent = '';
    var d = C.qs[i];
    setBar(i / n, 'Question ' + (i + 1) + ' of ' + n);
    back.hidden = i === 0;
    var h = el('h2', 'qz__q', d.q); h.tabIndex = -1; stage.append(h);
    if (d.hint) stage.append(el('p', 'qz__hint', d.hint));
    var ul = el('ul', 'qz__opts'); ul.setAttribute('role', d.multi ? 'group' : 'radiogroup'); ul.setAttribute('aria-label', d.q);
    var pre = ans[i];
    d.o.forEach(function (t, k) {
      var li = el('li'), b = el('button', 'qz__o'); li.setAttribute('role', 'presentation'); b.type = 'button';
      b.append(el('kbd', '', String(k + 1)), el('span', '', t));
      if (d.multi) {
        b.setAttribute('aria-pressed', pre != null && (k === d.o.length - 1 ? pre === 0 : (pre & (1 << k)) > 0) ? 'true' : 'false');
        b.addEventListener('click', function () { toggle(ul, b, k, d); });
      } else {
        b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', pre === k ? 'true' : 'false');
        b.addEventListener('click', function () { pick(i, k, b); });
      }
      li.append(b); ul.append(li);
    });
    stage.append(ul);
    if (d.multi) { var nx = el('button', 'btn btn--gold qz__next'); nx.type = 'button'; nx.append(el('span', '', 'See my result')); nx.addEventListener('click', function () { var v = 0; $$(ul).forEach(function (b, k) { if (b.getAttribute('aria-pressed') === 'true' && k < d.o.length - 1) v |= 1 << k; }); ans[i] = v; finish(true); }); stage.append(nx); }
    if (focus) h.focus({ preventScroll: true });
  }
  function $$(ul) { return [].slice.call(ul.querySelectorAll('.qz__o')); }
  function toggle(ul, b, k, d) {
    var none = k === d.o.length - 1, bs = $$(ul), on = b.getAttribute('aria-pressed') !== 'true';
    bs.forEach(function (x, j) { if (none ? j !== k : j === d.o.length - 1) x.setAttribute('aria-pressed', 'false'); });
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  function pick(i, k, b) {
    ans[i] = k; b.parentNode.parentNode.querySelectorAll('.qz__o').forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); });
    setTimeout(function () { if (i === n - 1) finish(true); else show(i + 1, true); }, RM ? 0 : 160);
  }
  function finish(focus) {
    var r = C.calc(ans);
    history.replaceState(null, '', '#r=' + ans.join('.'));
    stage.hidden = true; res.hidden = false; top.hidden = true; res.textContent = '';
    setBar(1, ''); C.render(res, r);
    var acts = el('div', 'qz__acts');
    var sh = el('button', 'btn btn--ghost'); sh.type = 'button'; sh.append(el('span', '', 'Copy link to my result'));
    var msg = el('p', 'qz__msg'); msg.setAttribute('role', 'status');
    sh.addEventListener('click', function () {
      var u = location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(function () { msg.textContent = 'Link copied.'; }, function () { msg.textContent = 'Copy the address bar to share.'; });
      else if (navigator.share) navigator.share({ url: u }).catch(function () {});
      else msg.textContent = 'Copy the address bar to share.';
    });
    var ed = el('button', 'btn btn--ghost'); ed.type = 'button'; ed.append(el('span', '', 'Change my answers'));
    ed.addEventListener('click', function () { show(n - 1, true); history.replaceState(null, '', location.pathname + location.search); });
    var rs = el('button', 'btn btn--ghost'); rs.type = 'button'; rs.append(el('span', '', 'Start over'));
    rs.addEventListener('click', function () { ans = []; history.replaceState(null, '', location.pathname + location.search); show(0, true); });
    acts.append(sh, ed, rs); res.append(acts, msg);
    var h = $('#qz-res', res); if (focus && h) { h.focus({ preventScroll: true }); res.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' }); }
  }
  back.addEventListener('click', function () { if (step > 0) show(step - 1, true); });
  document.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey || stage.hidden || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable || e.target.closest('[role=dialog],dialog')) return;
    var k = parseInt(e.key, 10);
    if (k >= 1 && k <= C.qs[step].o.length) { var b = stage.querySelectorAll('.qz__o')[k - 1]; if (b) { e.preventDefault(); b.click(); } }
    else if (e.key === 'Backspace' && step > 0) { e.preventDefault(); back.click(); }
  });

  function fromHash() {
    var m = /^#r=(\d+(?:\.\d+)*)$/.exec(location.hash), start = m && m[1].split('.').map(Number);
    if (start && C.valid(start)) { ans = start; finish(false); return true; }
    return false;
  }
  window.addEventListener('hashchange', function () { if (location.hash !== '#r=' + ans.join('.')) { if (!fromHash() && !location.hash) { ans = []; show(0, false); } } });
  if (!fromHash()) show(0, false);
})();
