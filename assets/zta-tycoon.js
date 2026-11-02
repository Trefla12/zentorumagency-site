/*! Zentorum Agency - "Grow Your Brand" idle tycoon. Vanilla JS, no dependencies, no network, no cookies.
 *  API: window.ZTATycoon.mount(el, { onCTA }) -> { destroy() }
 *  Storage: localStorage 'zta_tycoon_best' (best winning time in seconds) only. */
(function () {
  'use strict';

  var GOAL = 100000;          // revenue that wins the run
  var LIMIT = 90;             // seconds
  var BEST_KEY = 'zta_tycoon_best';
  var CONV = 0.4;             // $ per real follower per second once the website is live
  var ORGANIC = 0.045;        // SEO compounding: share of followers that bring friends per second
  var SEO_BASE = 8;           // followers per second from SEO
  var TRAP_SPIKE = 5000;
  var TRAP_DELAY = 3;         // seconds until the fake followers vanish
  var TRAP_PENALTY = 10;      // seconds of reduced engagement after the crash
  var DEFAULT_NAME = 'Your Brand';
  var uid = 0;

  var P = {
    brand: 'M12 3l8 6-8 12L4 9zM4 9h16M9 9l3 12 3-12M9 9l3-6 3 6',
    web: 'M3 6.5A2.5 2.5 0 015.5 4h13A2.5 2.5 0 0121 6.5v11a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 17.5zM3 9h18M6.2 6.5h.01M8.7 6.5h.01M8 14l2.5-2.5 2 2L16 10',
    seo: 'M10.5 4.5a6 6 0 100 12 6 6 0 000-12zM15 15l5 5M7.8 12.2l2-2 1.6 1.5 2.2-3',
    blender: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5',
    video: 'M6.5 5h11A2.5 2.5 0 0120 7.5v9a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 014 16.5v-9A2.5 2.5 0 016.5 5zM10 9.2v5.6l4.8-2.8z',
    ads: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zM12 12l7-7M16 5h3v3',
    fake: 'M12 5.5a3.4 3.4 0 100 6.8 3.4 3.4 0 000-6.8zM5 20c0-3.8 3-6 7-6s7 2.2 7 6'
  };

  var UPS = [
    { id: 'brand', name: 'Brand identity', benefit: 'Logo + voice. Every tap is worth ×2.', why: 'People follow brands they recognize in one glance.', cur: 'f', cost: 20, done: 'Brand identity live. Every tap now earns ×2.' },
    { id: 'web', name: 'Website that converts', benefit: 'Followers start turning into customers.', why: 'Attention without a destination is just applause.', cur: 'f', cost: 80, done: 'Website live. Followers now become customers.' },
    { id: 'seo', name: 'SEO', benefit: 'Found on Google: followers arrive by themselves.', why: 'Search brings people who are already looking to buy.', cur: 'm', cost: 60, done: 'Found on Google. Followers now arrive on their own.' },
    { id: 'blender', name: 'Blender & motion', benefit: 'Cinematic 3D animation. Tap value ×3.', why: 'Motion stops the scroll; stills get scrolled past.', cur: 'm', cost: 600, done: 'Motion design live. Every tap now earns ×3.' },
    { id: 'video', name: 'Video editing & Reels', benefit: 'Passive follower growth ×2.', why: 'Short video is the cheapest reach you can buy.', cur: 'm', cost: 5000, done: 'Reels rolling. Organic growth doubled.' },
    { id: 'ads', name: 'Paid ads, scaled', benefit: 'Revenue ×3.', why: 'Ads multiply a funnel that works. They cannot fix one that does not.', cur: 'm', cost: 25000, done: 'Ads on. Revenue ×3.' },
    { id: 'fake', trap: true, name: 'Buy fake followers', benefit: '+5K followers, instantly. Looks great...', why: 'Bots never buy, comment or come back.', cur: 'm', cost: 75 }
  ];

  var MILESTONES = [
    ['f100', function (S) { return S.fTotal >= 100; }, '100 followers. The first real fans.'],
    ['sale', function (S) { return S.tot >= 1; }, 'First sale! A stranger became a customer.'],
    ['f1k', function (S) { return S.fTotal >= 1000; }, '1K followers. It is a community now.'],
    ['r1k', function (S) { return S.tot >= 1000; }, '$1K revenue. This is a real business.'],
    ['f10k', function (S) { return S.fTotal >= 10000; }, '10K followers. People are talking.'],
    ['r10k', function (S) { return S.tot >= 10000; }, '$10K revenue. The flywheel is turning.'],
    ['f100k', function (S) { return S.fTotal >= 100000; }, '100K followers. A recognised name.'],
    ['r50k', function (S) { return S.tot >= 50000; }, '$50K revenue. Almost there.'],
    ['f1m', function (S) { return S.fTotal >= 1000000; }, '1M followers. A household brand.']
  ];

  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function fmt(n) {
    if (!(n > 0)) return '0';
    if (n < 1000) return String(Math.floor(n));
    var units = ['K', 'M', 'B', 'T'], i = -1, v = n;
    while (v >= 1000 && i < 3) { v /= 1000; i++; }
    var s = v < 100 ? v.toFixed(1) : v.toFixed(0);
    if (parseFloat(s) >= 1000 && i < 3) { v /= 1000; i++; s = v.toFixed(1); }
    return s.replace(/\.0$/, '') + units[i];
  }
  function money(n) { return '$' + fmt(n); }
  function clock(sec) { sec = Math.max(0, Math.ceil(sec)); return Math.floor(sec / 60) + ':' + (sec % 60 < 10 ? '0' : '') + (sec % 60); }

  function cleanName(v) {
    var s = String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f<>\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, '').replace(/\s+/g, ' ').trim();
    s = Array.from(s).slice(0, 18).join('').trim();
    return s || DEFAULT_NAME;
  }

  function h(tag, cls, text, attrs) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function icon(path, extra) {
    var s = h('span', 'zta-g__ic' + (extra ? ' ' + extra : ''));
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="' + path + '"/></svg>';
    return s;
  }
  function lsGet() { try { var v = parseFloat(window.localStorage.getItem(BEST_KEY)); return v > 0 ? v : 0; } catch (e) { return 0; } }
  function lsSet(v) { try { window.localStorage.setItem(BEST_KEY, String(v)); } catch (e) { /* ignore */ } }

  /* ---------- animated founder scene (inline SVG, 5 evolution stages) ---------- */
  var STAGE_CAP = [
    'Day zero. Empty pockets.',
    'You got the tools.',
    'Someone is proud of you.',
    'Your name is on the door.',
    'Welcome to the top.'
  ];
  function stageLabel(n, name) {
    return [
      'Stage 1 of 5: a founder with his pockets turned out and no money.',
      'Stage 2 of 5: the founder typing on a glowing laptop.',
      'Stage 3 of 5: the founder at his laptop with his girlfriend waving beside him.',
      'Stage 4 of 5: the founder and his girlfriend in front of a building with ' + name + ' written on it.',
      'Stage 5 of 5: a luxury car, piles of cash, the founder and his girlfriend, a tall tower with ' + name + ' on it and a helicopter landing on the roof.'
    ][n - 1];
  }
  function windows(x0, y0, cols, rows, dx, dy, w, hh, seed) {
    var s = '';
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      var n = (r * 7 + c * 13 + seed) % 9, lit = n % 3 === 0;
      s += '<rect class="zta-g__win' + (lit ? ' lit' : '') + '" x="' + (x0 + c * dx) + '" y="' + (y0 + r * dy) + '" width="' + w + '" height="' + hh + '" rx="1" fill="' + (lit ? '#e6c98c' : 'rgba(214,170,255,.14)') + '"' + (lit ? ' style="animation-delay:-' + (n * 0.7).toFixed(1) + 's"' : '') + '/>';
    }
    return s;
  }
  function pile(x, rows) {
    var s = '';
    for (var i = 0; i < rows; i++) {
      var o = i % 2 ? 1.5 : -1.5, y = 222 - 5 * (i + 1);
      s += '<rect x="' + (x + o) + '" y="' + y + '" width="22" height="4.4" rx="1" fill="#9fc490" stroke="#5f8a55" stroke-width=".7"/><rect x="' + (x + o + 9) + '" y="' + y + '" width="4" height="4.4" fill="#f7ecd6" opacity=".85"/>';
    }
    return s;
  }
  function bills() {
    var s = '', xs = [238, 247, 258, 268, 276, 243];
    for (var i = 0; i < xs.length; i++) s += '<rect class="zta-g__bill" x="' + xs[i] + '" y="120" width="8" height="4" rx=".8" fill="#9fc490" stroke="#5f8a55" stroke-width=".6" style="animation-delay:-' + (i * 0.55).toFixed(2) + 's"/>';
    return s;
  }
  function star(x, y, d) { return '<path class="zta-g__twk" d="M0 -5 L1.3 -1.3 L5 0 L1.3 1.3 L0 5 L-1.3 1.3 L-5 0 L-1.3 -1.3Z" transform="translate(' + x + ' ' + y + ')" fill="#fff6df" style="animation-delay:-' + d + 's"/>'; }

  function buildScene(id, later) {
    var u = 'zg' + id;
    var G = '#e6c98c', SK = '#e8c19a';
    var carBody = 'M2 24 Q2 18 8 16 L20 12 Q28 3 42 3 L56 3 Q66 4 72 12 L77 15 Q80 17 80 23 L80 27 L2 27 Z';
    var svg = '<svg class="zta-g__svg" viewBox="0 0 400 260" role="presentation" focusable="false" preserveAspectRatio="xMidYMax meet">' +
      '<defs>' +
      '<radialGradient id="' + u + 'bg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#d6aaff" stop-opacity=".26"/><stop offset="1" stop-color="#d6aaff" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + u + 'scr" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6df" stop-opacity=".6"/><stop offset="1" stop-color="#d6aaff" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="' + u + 'gnd" x1="0" x2="1"><stop offset="0" stop-color="#e6c98c" stop-opacity="0"/><stop offset=".18" stop-color="#e6c98c" stop-opacity=".5"/><stop offset=".82" stop-color="#e6c98c" stop-opacity=".5"/><stop offset="1" stop-color="#e6c98c" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="' + u + 'car" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#43294f"/><stop offset="1" stop-color="#160c1c"/></linearGradient>' +
      '<linearGradient id="' + u + 'shn" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff6df" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '<clipPath id="' + u + 'clip"><path d="' + carBody + '"/></clipPath>' +
      '</defs>' +
      '<ellipse class="zta-g__glow" cx="190" cy="150" rx="200" ry="110" fill="url(#' + u + 'bg)"/>' +
      '<circle cx="40" cy="40" r="1.1" fill="#f7ecd6" opacity=".5"/><circle cx="92" cy="22" r="1" fill="#f7ecd6" opacity=".35"/><circle cx="170" cy="46" r="1.2" fill="#f7ecd6" opacity=".4"/><circle cx="250" cy="24" r="1" fill="#f7ecd6" opacity=".35"/><circle cx="370" cy="30" r="1.1" fill="#f7ecd6" opacity=".45"/>' +
      '<rect x="0" y="221.4" width="400" height="1.2" fill="url(#' + u + 'gnd)"/>' +

      /* stage 4: mid-rise with his name */
      '<g class="zta-g__p" data-min="4" data-max="4">' +
      '<rect x="250" y="80" width="124" height="142" fill="#160c1c" stroke="' + G + '" stroke-opacity=".45"/>' +
      '<rect x="246" y="76" width="132" height="6" rx="1" fill="#22132b" stroke="' + G + '" stroke-opacity=".45"/>' +
      windows(259, 116, 7, 5, 16, 16, 9, 9, 3) +
      '<rect x="261" y="89" width="100" height="19" rx="2" fill="#0d0610" stroke="' + G + '" stroke-opacity=".8"/>' +
      '<text class="zta-g__sign" data-max="92" data-fs="13" font-size="13" x="311" y="102.6" text-anchor="middle"></text>' +
      '<rect x="302" y="203" width="18" height="19" fill="' + G + '" fill-opacity=".25" stroke="' + G + '" stroke-opacity=".6"/>' +
      '</g>' +

      /* stage 5: tower + helipad */
      '<g class="zta-g__p" data-min="5">' +
      '<rect x="311" y="40" width="70" height="16" fill="#1d1026" stroke="' + G + '" stroke-opacity=".5"/>' +
      '<rect x="300" y="56" width="92" height="166" fill="#160c1c" stroke="' + G + '" stroke-opacity=".5"/>' +
      '<ellipse cx="346" cy="38.4" rx="24" ry="2.2" fill="none" stroke="' + G + '" stroke-opacity=".8"/>' +
      '<circle class="zta-g__bk" cx="314" cy="38" r="1.8" fill="#ff7b9c"/><circle class="zta-g__bk" cx="378" cy="38" r="1.8" fill="#ff7b9c" style="animation-delay:-.7s"/>' +
      windows(308, 100, 6, 8, 14, 13, 8, 8, 5) +
      '<rect x="306" y="68" width="80" height="22" rx="2" fill="#0d0610" stroke="' + G + '" stroke-opacity=".85"/>' +
      '<text class="zta-g__sign zta-g__sign--t" data-max="70" data-fs="15" font-size="15" x="346" y="82.8" text-anchor="middle"></text>' +
      '<rect x="331" y="205" width="30" height="17" fill="' + G + '" fill-opacity=".25" stroke="' + G + '" stroke-opacity=".6"/>' +
      '</g>' +

      /* stage 5: helicopter landing on the roof */
      '<g class="zta-g__p zta-g__fly" data-min="5"><g class="zta-g__hbob">' +
      '<path d="M326 38.3 H368 M332 38.3 V32 M362 38.3 V32" stroke="' + G + '" stroke-width="1.4" stroke-linecap="round" fill="none"/>' +
      '<path d="M356 24 L386 23 L386 26.5 L356 28Z" fill="#2a1a36" stroke="' + G + '" stroke-width=".9"/>' +
      '<path d="M384 25 L390 14 L392.5 25Z" fill="#2a1a36" stroke="' + G + '" stroke-width=".9"/>' +
      '<ellipse cx="344" cy="26" rx="18" ry="9.5" fill="#2a1a36" stroke="' + G + '" stroke-width="1"/>' +
      '<path d="M330 22 Q336 16.5 343 21 L342 29 Q334 31 329 28Z" fill="rgba(214,170,255,.55)" stroke="#fff6df" stroke-opacity=".6" stroke-width=".7"/>' +
      '<rect x="342.6" y="14.6" width="2.4" height="7" fill="' + G + '"/>' +
      '<ellipse class="zta-g__rotor" cx="344" cy="13.6" rx="36" ry="1.6" fill="#f7ecd6" fill-opacity=".85"/>' +
      '<ellipse class="zta-g__rotor zta-g__rotor--t" cx="391" cy="18" rx="1.4" ry="6" fill="#f7ecd6" fill-opacity=".7"/>' +
      '</g></g>' +

      /* stage 5: luxury car */
      '<g class="zta-g__p zta-g__drive" data-min="5"><g transform="translate(6 189)">' +
      '<ellipse cx="41" cy="33" rx="42" ry="2.6" fill="#000" opacity=".4"/>' +
      '<path d="' + carBody + '" fill="url(#' + u + 'car)" stroke="' + G + '" stroke-width="1"/>' +
      '<path d="M27 12.5 Q31 6.2 42 6.2 L55 6.2 Q62 7 66 12.5Z" fill="rgba(214,170,255,.5)" stroke="' + G + '" stroke-opacity=".6" stroke-width=".7"/><path d="M47.5 6.4 V12.4" stroke="' + G + '" stroke-opacity=".6" stroke-width=".8"/>' +
      '<path d="M6 20.5 H76" stroke="' + G + '" stroke-opacity=".8" stroke-width=".8"/>' +
      '<rect x="75.5" y="18.5" width="4.5" height="3.2" rx="1" fill="#fff6df"/><rect x="2" y="18.5" width="3" height="3" rx="1" fill="#ff7b9c" opacity=".8"/>' +
      '<g clip-path="url(#' + u + 'clip)"><g class="zta-g__shine"><rect x="-30" y="0" width="24" height="30" fill="url(#' + u + 'shn)" transform="skewX(-20)"/></g></g>' +
      '<circle cx="18" cy="27" r="7.2" fill="#0d0610" stroke="' + G + '" stroke-width="1"/><circle cx="18" cy="27" r="3.2" fill="none" stroke="' + G + '" stroke-width=".8"/>' +
      '<circle cx="62" cy="27" r="7.2" fill="#0d0610" stroke="' + G + '" stroke-width="1"/><circle cx="62" cy="27" r="3.2" fill="none" stroke="' + G + '" stroke-width=".8"/>' +
      '</g>' + star(78, 200, 0.3) + star(14, 196, 1.2) +
      '</g>' +

      /* the founder */
      '<g class="zta-g__bob">' +
      '<rect x="125" y="196" width="9" height="24" rx="4" fill="#2b2038" stroke="' + G + '" stroke-opacity=".35" stroke-width=".8"/>' +
      '<rect x="138" y="196" width="9" height="24" rx="4" fill="#2b2038" stroke="' + G + '" stroke-opacity=".35" stroke-width=".8"/>' +
      '<ellipse cx="128.5" cy="221" rx="7" ry="2.8" fill="#150b1b" stroke="' + G + '" stroke-opacity=".5" stroke-width=".7"/><ellipse cx="143.5" cy="221" rx="7" ry="2.8" fill="#150b1b" stroke="' + G + '" stroke-opacity=".5" stroke-width=".7"/>' +
      /* arms: shrug (stage 1) */
      '<g class="zta-g__v" data-min="1" data-max="1"><g class="zta-g__shrug">' +
      '<path d="M121 167 L110 187 M151 167 L162 187" stroke="#5b3d7a" stroke-width="8" stroke-linecap="round" fill="none"/>' +
      '<circle cx="109" cy="191" r="4.3" fill="' + SK + '"/><circle cx="163" cy="191" r="4.3" fill="' + SK + '"/>' +
      '<path d="M121 195 L110 198 L112 208 L122 204Z M151 195 L162 198 L160 208 L150 204Z" fill="#f7ecd6" stroke="' + G + '" stroke-opacity=".7" stroke-width=".8"/>' +
      '</g></g>' +
      '<path d="M120 170 Q120 160 130 159 L142 159 Q152 160 152 170 L153 198 L119 198 Z" fill="#5b3d7a" stroke="' + G + '" stroke-opacity=".6"/>' +
      '<path d="M131 159 L136 166 L141 159" fill="none" stroke="#f7ecd6" stroke-width="1.2" stroke-linejoin="round"/>' +
      /* arms: typing (stage 2+) */
      '<g class="zta-g__v" data-min="2"><g class="zta-g__arml"><path d="M121 167 L111 188" stroke="#5b3d7a" stroke-width="8" stroke-linecap="round" fill="none"/><circle cx="110.5" cy="190" r="4.3" fill="' + SK + '"/></g>' +
      '<g class="zta-g__armr"><path d="M151 167 L161 188" stroke="#5b3d7a" stroke-width="8" stroke-linecap="round" fill="none"/><circle cx="161.5" cy="190" r="4.3" fill="' + SK + '"/></g></g>' +
      /* head */
      '<circle cx="121" cy="144" r="3" fill="' + SK + '"/><circle cx="151" cy="144" r="3" fill="' + SK + '"/>' +
      '<circle cx="136" cy="142" r="15.5" fill="' + SK + '" stroke="' + G + '" stroke-opacity=".5" stroke-width=".8"/>' +
      '<path d="M120.5 140 Q120 122 136 122 Q152 122 151.5 140 Q146 131 136 131.5 Q126 131 120.5 140Z" fill="#1d1220"/>' +
      '<circle class="zta-g__eye" cx="130" cy="144" r="1.9" fill="#1d1220"/><circle class="zta-g__eye" cx="142" cy="144" r="1.9" fill="#1d1220"/>' +
      '<g class="zta-g__v" data-min="1" data-max="1"><path d="M125.5 140 L133 136.8 M146.5 140 L139 136.8" stroke="#1d1220" stroke-width="1.3" stroke-linecap="round" fill="none"/><path d="M130.5 153.5 Q136 148.5 141.5 153.5" stroke="#1d1220" stroke-width="1.4" stroke-linecap="round" fill="none"/><path d="M150 132 Q152.5 136 150 138 Q147.5 136 150 132Z" fill="#9fd0ff" opacity=".85"/></g>' +
      '<g class="zta-g__v" data-min="2"><path d="M125.5 138.5 Q129.5 136 133 138.5 M139 138.5 Q142.5 136 146.5 138.5" stroke="#1d1220" stroke-width="1.2" stroke-linecap="round" fill="none"/><path d="M130 150 Q136 156.5 142 150" stroke="#1d1220" stroke-width="1.4" stroke-linecap="round" fill="none"/>' +
      '<ellipse class="zta-g__flick" cx="136" cy="150" rx="19" ry="15" fill="url(#' + u + 'scr)"/></g>' +
      '</g>' +

      /* thought bubble + moth (stage 1) */
      '<g class="zta-g__p" data-min="1" data-max="1"><circle cx="157" cy="122" r="2.2" fill="rgba(255,255,255,.12)" stroke="' + G + '" stroke-opacity=".4" stroke-width=".7"/><circle cx="165" cy="111" r="3.4" fill="rgba(255,255,255,.12)" stroke="' + G + '" stroke-opacity=".4" stroke-width=".7"/>' +
      '<ellipse cx="190" cy="88" rx="26" ry="16" fill="rgba(255,255,255,.08)" stroke="' + G + '" stroke-opacity=".45" stroke-width=".9"/>' +
      '<text x="190" y="94.5" text-anchor="middle" font-family="Corm, \'Cormorant Garamond\', serif" font-weight="600" font-size="19" style="fill:#d6aaff">$0</text></g>' +
      '<g class="zta-g__v" data-min="1" data-max="1"><g transform="translate(112 200)"><g class="zta-g__moth"><ellipse class="zta-g__wing" cx="-3" cy="0" rx="3.6" ry="2" fill="#cdbfa8"/><ellipse class="zta-g__wing" cx="3" cy="0" rx="3.6" ry="2" fill="#cdbfa8"/><ellipse cx="0" cy="0" rx="1" ry="2.4" fill="#6f6252"/></g></g></g>' +

      /* desk + laptop (stage 2+) */
      '<g class="zta-g__p" data-min="2">' +
      '<rect x="118" y="168" width="36" height="24" rx="2.5" fill="#1a0f20" stroke="' + G + '"/>' +
      '<path d="M128 180 H142 M138 176 L143 180 L138 184" stroke="' + G + '" stroke-width="1.1" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<rect x="114" y="191" width="44" height="3.4" rx="1.5" fill="#2a1a36" stroke="' + G + '" stroke-opacity=".7" stroke-width=".8"/>' +
      '<rect class="zta-g__flick" x="116" y="165" width="40" height="3" rx="1.5" fill="' + G + '" opacity=".7"/>' +
      '<rect x="96" y="194" width="80" height="5" rx="1.5" fill="#2a1a36" stroke="' + G + '" stroke-opacity=".8"/>' +
      '<rect x="100" y="199" width="72" height="6" fill="#1d1226" stroke="' + G + '" stroke-opacity=".3"/>' +
      '<rect x="100" y="205" width="4" height="16.5" fill="#2a1a36" stroke="' + G + '" stroke-opacity=".5" stroke-width=".7"/><rect x="168" y="205" width="4" height="16.5" fill="#2a1a36" stroke="' + G + '" stroke-opacity=".5" stroke-width=".7"/>' +
      '</g>' +

      /* girlfriend (stage 3+) */
      '<g class="zta-g__p" data-min="3"><g class="zta-g__bob zta-g__bob2">' +
      '<path d="M185 152 Q183 132 200 132 Q217 132 215 152 L218 186 Q200 192 182 186Z" fill="#4a2230"/>' +
      '<rect x="195" y="200" width="4.6" height="21" rx="2" fill="#efc9a4"/><rect x="202" y="200" width="4.6" height="21" rx="2" fill="#efc9a4"/>' +
      '<ellipse cx="197" cy="221" rx="5" ry="2.4" fill="#150b1b" stroke="' + G + '" stroke-opacity=".5" stroke-width=".7"/><ellipse cx="204.5" cy="221" rx="5" ry="2.4" fill="#150b1b" stroke="' + G + '" stroke-opacity=".5" stroke-width=".7"/>' +
      '<path d="M186 188 L184 192" stroke="#efc9a4" stroke-width="5" stroke-linecap="round"/><path d="M190 168 L186 190" stroke="#efc9a4" stroke-width="5" stroke-linecap="round" fill="none"/>' +
      '<path d="M190 166 Q200 162 210 166 L219 206 Q200 212 181 206Z" fill="#e6c98c" stroke="#fff6df" stroke-opacity=".6" stroke-width=".8"/>' +
      '<path d="M188.5 179 Q200 183.5 211.5 179" stroke="#a77bd0" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<g class="zta-g__wave"><path d="M210 168 L222 153" stroke="#efc9a4" stroke-width="5" stroke-linecap="round" fill="none"/><circle cx="223.5" cy="150" r="3.6" fill="#efc9a4"/></g>' +
      '<circle cx="200" cy="150" r="13" fill="#efc9a4" stroke="' + G + '" stroke-opacity=".5" stroke-width=".8"/>' +
      '<path d="M186.6 150 Q187 135 200 135.5 Q213 135 213.4 150 Q206 142.5 198 143.5 Q191 144.5 186.6 150Z" fill="#4a2230"/>' +
      '<circle class="zta-g__eye" cx="194.4" cy="151.5" r="1.7" fill="#1d1220" style="animation-delay:-1.6s"/><circle class="zta-g__eye" cx="205.6" cy="151.5" r="1.7" fill="#1d1220" style="animation-delay:-1.6s"/>' +
      '<circle cx="190.5" cy="156" r="2.6" fill="#ff9ab8" opacity=".35"/><circle cx="209.5" cy="156" r="2.6" fill="#ff9ab8" opacity=".35"/>' +
      '<path d="M196 157 Q200 161.2 204 157" stroke="#1d1220" stroke-width="1.2" stroke-linecap="round" fill="none"/>' +
      '</g>' +
      '<g transform="translate(169 126)"><path class="zta-g__heart" d="M0 3 C-7 -3 -4 -8 0 -4 C4 -8 7 -3 0 3Z" fill="#ff9ab8"/></g>' +
      '</g>' +

      /* cash piles + falling bills (stage 5) */
      '<g class="zta-g__p" data-min="5">' + pile(232, 6) + pile(256, 3) + pile(270, 4) + bills() + star(246, 190, 0.6) + star(282, 200, 1.7) + '</g>' +
      '</svg>';

    var card = h('div', 'zta-g__scene zta-g__card');
    var cap = h('div', 'zta-g__cap');
    var capN = h('span', 'zta-g__lb', 'Stage 1 / 5');
    var capT = h('span', 'zta-g__cap-t', STAGE_CAP[0]);
    cap.appendChild(capN); cap.appendChild(capT);
    card.appendChild(cap);
    var sv = h('div', 'zta-g__sv');
    sv.setAttribute('role', 'img');
    sv.innerHTML = svg; // static art only, no user text
    card.appendChild(sv);
    var say = h('p', 'zta-g__say', 'GLAD I TRUSTED ZENTORUM AGENCY WITH THE FUTURE OF MY COMPANY.');
    card.appendChild(say);
    var svgEl = sv.firstChild;
    var items = Array.prototype.slice.call(svgEl.querySelectorAll('[data-min]'));
    var signs = Array.prototype.slice.call(svgEl.querySelectorAll('.zta-g__sign'));
    var stage = 0, name = DEFAULT_NAME;

    function fit() {
      signs.forEach(function (t) {
        try {
          t.style.fontSize = '';
          var w = t.getComputedTextLength(), mx = parseFloat(t.getAttribute('data-max')), fs = parseFloat(t.getAttribute('data-fs'));
          if (w > mx) t.style.fontSize = (fs * mx / w).toFixed(2) + 'px';
        } catch (e) { /* not rendered yet */ }
      });
    }
    function burst(cx, cy, n) {
      if (reducedMotion() || !sv.animate) return;
      for (var i = 0; i < n; i++) {
        var p = h('span', 'zta-g__sp');
        p.style.left = (cx / 4) + '%'; p.style.top = (cy / 2.6) + '%';
        sv.appendChild(p);
        var a = Math.random() * 6.283, d = 36 + Math.random() * 54;
        var an = p.animate([
          { transform: 'translate(-50%,-50%) scale(.2) rotate(0deg)', opacity: 1 },
          { transform: 'translate(calc(-50% + ' + (Math.cos(a) * d) + 'px),calc(-50% + ' + (Math.sin(a) * d) + 'px)) scale(1) rotate(180deg)', opacity: 0 }
        ], { duration: 650 + Math.random() * 350, easing: 'cubic-bezier(.2,.7,.3,1)' });
        an.onfinish = an.oncancel = (function (el) { return function () { if (el.parentNode) el.parentNode.removeChild(el); }; })(p);
      }
    }
    var focus = [null, [136, 150], [136, 170], [200, 150], [310, 110], [210, 120]];
    function setStage(n, animate) {
      if (n === stage) return;
      stage = n;
      items.forEach(function (el) {
        var mn = +el.getAttribute('data-min'), mx = +(el.getAttribute('data-max') || 99);
        var on = n >= mn && n <= mx, was = el.classList.contains('is-on');
        if (on && !was) {
          el.classList.add('is-on');
          if (animate && el.classList.contains('zta-g__p')) { el.classList.add('is-new'); later(function () { el.classList.remove('is-new'); }, 3300); }
        } else if (!on && was) { el.classList.remove('is-on', 'is-new'); }
      });
      svgEl.setAttribute('data-stage', String(n));
      card.setAttribute('data-stage', String(n));
      capN.textContent = 'Stage ' + n + ' / 5';
      capT.textContent = STAGE_CAP[n - 1];
      sv.setAttribute('aria-label', stageLabel(n, name));
      fit();
      if (animate && n > 1) burst(focus[n][0], focus[n][1], n === 5 ? 26 : 16);
    }
    function setName(v) {
      name = v;
      var up = String(v).toLocaleUpperCase();
      signs.forEach(function (t) { t.textContent = up; });
      if (stage) sv.setAttribute('aria-label', stageLabel(stage, name));
      fit();
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    setStage(1, false);
    function setSay(on) { card.classList.toggle('has-say', !!on); }
    return { el: card, setSay: setSay, setStage: setStage, setName: setName, fit: fit, burst: burst, stage: function () { return stage; }, reset: function () { stage = 0; setStage(1, false); } };
  }

  function mount(el, opts) {
    if (!el || !el.appendChild) return null;
    if (el._ztaDestroy) el._ztaDestroy();
    opts = opts || {};

    var id = ++uid;
    var timers = [];
    var raf = 0, last = 0, vis = true, destroyed = false;
    var brand = DEFAULT_NAME;
    var S = null;
    var cache = {};

    /* ---------- build DOM ---------- */
    var root = h('div', 'zta-g');
    root.setAttribute('data-state', 'start');
    var wrap = h('div', 'zta-g__wrap');
    root.appendChild(wrap);

    /* start panel */
    var pStart = h('section', 'zta-g__panel zta-g__start zta-g__card');
    pStart.appendChild(h('p', 'zta-g__lb', 'Interactive · 60 seconds'));
    var title = h('h2', 'zta-g__title');
    title.appendChild(document.createTextNode('Grow Your '));
    title.appendChild(h('span', 'zta-g__gt', 'Brand'));
    pStart.appendChild(title);
    pStart.appendChild(h('p', 'zta-g__pitch', 'An idle tycoon in 60 seconds. Do the right things in the right order and watch a brand take off.'));
    var form = h('form', 'zta-g__form');
    form.setAttribute('novalidate', '');
    var inId = 'zta-g-name-' + id;
    form.appendChild(h('label', 'zta-g__lb', 'Name your brand (optional)', { 'for': inId }));
    var input = h('input', 'zta-g__input', null, { id: inId, type: 'text', maxlength: '18', placeholder: DEFAULT_NAME, autocomplete: 'off', autocapitalize: 'words', spellcheck: 'false' });
    form.appendChild(input);
    var startBtn = h('button', 'zta-g__btn', 'Start', { type: 'submit' });
    form.appendChild(startBtn);
    pStart.appendChild(form);
    var order = h('ol', 'zta-g__order');
    order.setAttribute('aria-label', 'The right order');
    ['Brand', 'Website', 'SEO', 'Motion', 'Video', 'Ads'].forEach(function (t) { order.appendChild(h('li', null, t)); });
    pStart.appendChild(order);
    wrap.appendChild(pStart);

    /* play panel */
    var pPlay = h('section', 'zta-g__panel zta-g__play');
    pPlay.hidden = true;
    var tw = h('div', 'zta-g__toastwrap');
    var toasts = h('div', 'zta-g__toasts');
    toasts.setAttribute('aria-hidden', 'true');
    tw.appendChild(toasts);
    pPlay.appendChild(tw);
    var live = h('div', 'zta-g__sr', '', { role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' });
    pPlay.appendChild(live);

    var hud = h('div', 'zta-g__hud zta-g__card');
    var top = h('div', 'zta-g__hudtop');
    var brandEl = h('span', 'zta-g__brand', DEFAULT_NAME);
    top.appendChild(brandEl);
    var goalTx = h('span', 'zta-g__lb', 'Goal: $100K brand');
    top.appendChild(goalTx);
    hud.appendChild(top);
    var barOuter = h('div', 'zta-g__bar', null, { role: 'progressbar', 'aria-label': 'Progress to $100K revenue', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': '0' });
    var barIn = h('span', 'zta-g__barin');
    barOuter.appendChild(barIn);
    hud.appendChild(barOuter);
    var stats = h('div', 'zta-g__stats');
    function stat(label) {
      var s = h('div', 'zta-g__st');
      s.appendChild(h('div', 'zta-g__lb', label));
      var v = h('div', 'zta-g__vl', '0');
      var sb = h('div', 'zta-g__sb', ' ');
      s.appendChild(v); s.appendChild(sb);
      stats.appendChild(s);
      return { box: s, v: v, sb: sb };
    }
    var stF = stat('Followers'), stR = stat('Revenue'), stC = stat('Cash'), stT = stat('Time left');
    hud.appendChild(stats);
    pPlay.appendChild(hud);

    var grid = h('div', 'zta-g__grid');
    var scene = buildScene(id, later);
    grid.appendChild(scene.el);
    var stage = h('div', 'zta-g__stage zta-g__card');
    var tap = h('button', 'zta-g__tap', null, { type: 'button' });
    var comet = h('span', 'zta-g__comet');
    comet.setAttribute('aria-hidden', 'true');
    comet.innerHTML = '<svg viewBox="0 0 120 24" fill="none" stroke="#e6c98c" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M4 12H100" stroke-width="1.4"/><path d="M22 7.5H78M34 16.5H86" stroke-width="1" opacity=".45"/><path d="M92 5l12 7-12 7" stroke-width="1.4"/></svg>';
    tap.appendChild(h('span', 'zta-g__tl', 'Post content'));
    tap.appendChild(comet);
    var tapVal = h('span', 'zta-g__tv', '+1');
    tap.appendChild(tapVal);
    tap.appendChild(h('span', 'zta-g__tu', 'followers per tap'));
    stage.appendChild(tap);
    stage.appendChild(h('p', 'zta-g__hint', 'Tap, click or press Space'));
    grid.appendChild(stage);

    var chartBox = h('div', 'zta-g__chart zta-g__card');
    var chHead = h('div', 'zta-g__chhead');
    chHead.appendChild(h('span', 'zta-g__lb', 'Revenue over time'));
    var chVal = h('span', 'zta-g__chv', '$0');
    chHead.appendChild(chVal);
    chartBox.appendChild(chHead);
    var cv = h('canvas', 'zta-g__cv');
    cv.setAttribute('aria-hidden', 'true');
    chartBox.appendChild(cv);
    grid.appendChild(chartBox);

    var upsBox = h('div', 'zta-g__ups');
    upsBox.appendChild(h('p', 'zta-g__lb zta-g__uph', 'Grow in the right order'));
    var cards = UPS.map(function (u, i) {
      var b = h('button', 'zta-g__up' + (u.trap ? ' is-trap' : ''), null, { type: 'button', 'aria-describedby': 'zta-g-tip-' + id + '-' + i });
      var ic = icon(P[u.id], 'zta-g__up-ic');
      var badge = h('span', 'zta-g__badge');
      badge.setAttribute('aria-hidden', 'true');
      badge.innerHTML = '<svg class="zta-g__b-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="11" width="12" height="9" rx="2"/><path d="M8.5 11V8a3.5 3.5 0 017 0v3"/></svg><svg class="zta-g__b-ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';
      ic.appendChild(badge);
      b.appendChild(ic);
      var tx = h('span', 'zta-g__up-tx');
      tx.appendChild(h('span', 'zta-g__up-nm', u.name));
      tx.appendChild(h('span', 'zta-g__up-bn', u.benefit));
      b.appendChild(tx);
      var co = h('span', 'zta-g__up-co');
      co.appendChild(h('span', 'zta-g__up-cost zta-g__gt', u.cur === 'f' ? fmt(u.cost) : money(u.cost)));
      co.appendChild(h('span', 'zta-g__up-unit', u.cur === 'f' ? 'followers' : 'cash'));
      b.appendChild(co);
      var sr = h('span', 'zta-g__sr', '');
      b.appendChild(sr);
      b.appendChild(h('span', 'zta-g__tip', u.why, { role: 'tooltip', id: 'zta-g-tip-' + id + '-' + i }));
      b.appendChild(h('span', 'zta-g__up-bar'));
      upsBox.appendChild(b);
      return { u: u, el: b, sr: sr, sig: '', p: -1 };
    });
    grid.appendChild(upsBox);
    pPlay.appendChild(grid);
    wrap.appendChild(pPlay);

    /* end panel */
    var pEnd = h('section', 'zta-g__panel zta-g__end zta-g__card');
    pEnd.hidden = true;
    pEnd.appendChild(h('p', 'zta-g__lb', 'Run complete'));
    var endTitle = h('h2', 'zta-g__title zta-g__title--end', null, { tabindex: '-1' });
    var endName = h('span', 'zta-g__gt', DEFAULT_NAME);
    var endTail = document.createTextNode('');
    endTitle.appendChild(endName); endTitle.appendChild(endTail);
    pEnd.appendChild(endTitle);
    var endSlot = h('div', 'zta-g__endscene');
    pEnd.appendChild(endSlot);
    var endSub = h('p', 'zta-g__pitch', '');
    pEnd.appendChild(endSub);
    var ctaSlot = h('div'); pEnd.appendChild(ctaSlot);
    var endStats = h('div', 'zta-g__es');
    function est(label) {
      var s = h('div', 'zta-g__st');
      s.appendChild(h('div', 'zta-g__lb', label));
      var v = h('div', 'zta-g__vl', '-');
      s.appendChild(v); endStats.appendChild(s); return v;
    }
    var eT = est('Time'), eF = est('Followers'), eR = est('Revenue'), eU = est('Upgrades'), eTrap = est('Fake followers avoided');
    pEnd.appendChild(endStats);
    var endBest = h('p', 'zta-g__best', '');
    pEnd.appendChild(endBest);
    var ctaRow = h('div', 'zta-g__cta');
    var ctaBtn = h('button', 'zta-g__btn', 'Start your project →', { type: 'button' });
    var callBtn = h('a', 'zta-g__btn zta-g__btn--ghost', 'Call 512-241-5531', { href: 'tel:+15122415531' });
    var againBtn = h('button', 'zta-g__btn zta-g__btn--ghost', 'Play again', { type: 'button' });
    ctaRow.appendChild(ctaBtn); ctaRow.appendChild(callBtn); ctaRow.appendChild(againBtn);
    pEnd.replaceChild(ctaRow, ctaSlot);
    wrap.appendChild(pEnd);

    wrap.appendChild(h('p', 'zta-g__foot', 'A playful simulation — real growth takes strategy, and that’s our job.'));
    el.appendChild(root);
    var ctx = cv.getContext ? cv.getContext('2d') : null;

    /* ---------- helpers ---------- */
    function later(fn, ms) {
      var t = setTimeout(function () {
        var i = timers.indexOf(t); if (i > -1) timers.splice(i, 1);
        if (!destroyed) fn();
      }, ms);
      timers.push(t); return t;
    }
    function setText(node, key, val) {
      if (cache[key] !== val) { cache[key] = val; node.textContent = val; }
    }
    function show(name) {
      root.setAttribute('data-state', name);
      pStart.hidden = name !== 'start';
      pPlay.hidden = name !== 'play';
      pEnd.hidden = name !== 'end';
    }
    function toast(msg, kind) {
      var t = h('div', 'zta-g__toast' + (kind ? ' is-' + kind : ''), msg);
      toasts.appendChild(t);
      while (toasts.childNodes.length > 3) toasts.removeChild(toasts.firstChild);
      later(function () { t.classList.add('is-out'); }, 2300);
      later(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 2700);
      live.textContent = msg;
    }

    /* ---------- game state ---------- */
    function fresh() {
      return {
        state: 'play', t: 0, F: 0, fake: 0, R: 0, tot: 0, fTotal: 0, taps: 0,
        owned: {}, trapBought: false, crashAt: 0, penaltyUntil: 0, ms: {},
        hist: [], nextSample: 0
      };
    }
    function tapValue() { return (S.owned.brand ? 2 : 1) * (S.owned.blender ? 3 : 1); }
    function passiveF() { return S.owned.seo ? SEO_BASE * (S.owned.video ? 2 : 1) + S.F * ORGANIC : 0; }
    function revRate() {
      if (!S.owned.web) return 0;
      return S.F * CONV * (S.owned.ads ? 3 : 1) * (S.t < S.penaltyUntil ? 0.4 : 1);
    }
    function isUnlocked(i) {
      var u = UPS[i];
      if (u.trap) return !!S.owned.web;
      return i === 0 || !!S.owned[UPS[i - 1].id];
    }
    function nextIndex() {
      for (var i = 0; i < UPS.length; i++) if (!UPS[i].trap && !S.owned[UPS[i].id]) return i;
      return -1;
    }
    function stageNow() {
      var o = S.owned;
      return o.video ? 5 : o.blender ? 4 : o.seo ? 3 : o.brand ? 2 : 1;
    }
    function have(u) { return u.cur === 'f' ? S.F : S.R; }

    function startRun() {
      brand = cleanName(input.value);
      resetRun();
    }
    function resetRun() {
      S = fresh();
      activeParticles = 0;
      cache = {};
      toasts.textContent = '';
      live.textContent = '';
      stage.querySelectorAll('.zta-g__pt').forEach(function (n) { n.parentNode.removeChild(n); });
      tap.classList.remove('is-gold');
      cards.forEach(function (c) { c.sig = ''; c.p = -1; });
      brandEl.textContent = brand;
      scene.setName(brand);
      scene.reset();
      scene.setSay(false);
      if (scene.el.parentNode !== grid) grid.insertBefore(scene.el, grid.firstChild);
      show('play');
      render(true);
      drawChart();
      if (root.getBoundingClientRect) {
        var r = root.getBoundingClientRect();
        if (r.top < 0 || r.top > window.innerHeight * 0.5) scrollRoot();
      }
      try { tap.focus({ preventScroll: true }); } catch (e) { tap.focus(); }
      sync();
    }
    function scrollRoot() {
      try { root.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' }); } catch (e) { /* ignore */ }
    }

    /* ---------- tapping ---------- */
    var activeParticles = 0;
    function particle(x, y, v) {
      if (reducedMotion() || activeParticles >= 22 || !stage.animate) return;
      var p = h('span', 'zta-g__pt', '+' + fmt(v));
      p.style.left = x + 'px'; p.style.top = y + 'px';
      stage.appendChild(p);
      activeParticles++;
      var dx = (Math.random() - 0.5) * 56;
      var a = p.animate([
        { transform: 'translate(-50%,-50%) scale(.8)', opacity: 0 },
        { transform: 'translate(calc(-50% + ' + (dx * 0.4) + 'px),calc(-50% - 26px)) scale(1.1)', opacity: 1, offset: 0.2 },
        { transform: 'translate(calc(-50% + ' + dx + 'px),calc(-50% - 92px)) scale(.9)', opacity: 0 }
      ], { duration: 780, easing: 'cubic-bezier(.2,.7,.3,1)' });
      a.onfinish = a.oncancel = function () { activeParticles = Math.max(0, activeParticles - 1); if (p.parentNode) p.parentNode.removeChild(p); };
    }
    function doTap(x, y) {
      if (!S || S.state !== 'play') return;
      var v = tapValue();
      S.F += v; S.fTotal += v; S.taps++;
      if (!reducedMotion() && tap.animate) {
        tap.animate([{ transform: 'scale(1)' }, { transform: 'scale(.95)' }, { transform: 'scale(1)' }], { duration: 150, easing: 'ease-out' });
      }
      particle(x, y, v);
    }
    var kdTime = 0;
    function onPointerDown(e) {
      if (e.button > 0) return;
      var r = stage.getBoundingClientRect();
      doTap(e.clientX - r.left, e.clientY - r.top);
    }
    function centerTap() {
      var s = stage.getBoundingClientRect(), t = tap.getBoundingClientRect();
      doTap(t.left - s.left + t.width / 2 + (Math.random() - 0.5) * 40, t.top - s.top + t.height * 0.3);
    }
    function onKeyDown(e) {
      if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') { e.preventDefault(); if (e.repeat) return; kdTime = Date.now(); centerTap(); }
    }
    function onKeyUp(e) { if (e.key === ' ' || e.key === 'Spacebar') e.preventDefault(); }
    function onTapClick(e) {
      if (e.detail === 0 && Date.now() - kdTime > 400) centerTap(); // assistive-tech activation
    }
    tap.addEventListener('pointerdown', onPointerDown);
    tap.addEventListener('keydown', onKeyDown);
    tap.addEventListener('keyup', onKeyUp);
    tap.addEventListener('click', onTapClick);

    /* ---------- upgrades ---------- */
    function status(i) {
      var u = UPS[i];
      if (S.owned[u.id]) return 'owned';
      if (!isUnlocked(i)) return 'locked';
      return have(u) >= u.cost ? 'ready' : 'idle';
    }
    function buy(i) {
      if (!S || S.state !== 'play') return;
      var u = UPS[i], st = status(i);
      if (st !== 'ready') {
        if (st !== 'owned') {
          var c = cards[i].el; c.classList.add('is-no');
          later(function () { c.classList.remove('is-no'); }, 450);
        }
        return;
      }
      if (u.cur === 'f') S.F -= u.cost; else S.R -= u.cost;
      S.owned[u.id] = true;
      if (u.trap) {
        S.trapBought = true;
        S.fake = TRAP_SPIKE;
        S.crashAt = S.t + TRAP_DELAY;
        toast('+5,000 followers! Let’s see how real they are...', 'lilac');
      } else {
        toast(u.done);
        scene.setStage(stageNow(), true);
        if (u.id === 'blender') {
          tap.classList.add('is-gold');
          later(function () { tap.classList.remove('is-gold'); }, 2600);
        }
      }
    }
    cards.forEach(function (c, i) {
      c.el.addEventListener('click', function () { buy(i); });
    });

    /* ---------- loop ---------- */
    function step(dt) {
      S.t += dt;
      var pf = passiveF();
      S.F += pf * dt; S.fTotal += pf * dt;
      var r = revRate() * dt;
      S.R += r; S.tot += r;
      if (S.fake > 0 && S.t >= S.crashAt) {
        S.fake = 0;
        S.F *= 0.85;
        S.penaltyUntil = S.t + TRAP_PENALTY;
        toast('Fake followers don’t buy. Real growth does.', 'lilac');
      }
      if (S.t >= S.nextSample) {
        S.hist.push([S.t, S.tot]);
        S.nextSample = S.t + 0.5;
      }
      for (var i = 0; i < MILESTONES.length; i++) {
        var m = MILESTONES[i];
        if (!S.ms[m[0]] && m[1](S)) { S.ms[m[0]] = true; toast(m[2], 'gold'); }
      }
      if (S.tot >= GOAL) finish(true);
      else if (S.t >= LIMIT) finish(false);
    }

    function render(force) {
      if (!S) return;
      var shownF = S.F + S.fake;
      setText(stF.v, 'F', fmt(shownF));
      stF.v.classList.toggle('is-fake', S.fake > 0);
      var pf = passiveF();
      setText(stF.sb, 'Fs', S.fake > 0 ? 'fake. They will not stay' : (pf > 0 ? '+' + fmt(pf) + ' / sec' : 'tap to grow'));
      setText(stR.v, 'R', money(S.tot));
      var down = S.t < S.penaltyUntil;
      var rr = revRate();
      setText(stR.sb, 'Rs', down ? 'engagement down' : (rr > 0 ? money(rr) + ' / sec' : 'needs a website'));
      stR.v.classList.toggle('is-down', down);
      setText(stC.v, 'C', money(S.R));
      setText(stC.sb, 'Cs', 'to invest');
      var left = LIMIT - S.t;
      setText(stT.v, 'T', clock(left));
      stT.v.classList.toggle('is-low', left <= 15);
      setText(stT.sb, 'Ts', 'of 1:30');
      var pct = Math.min(100, S.tot / GOAL * 100);
      var pr = Math.round(pct * 10) / 10;
      if (cache.bar !== pr) { cache.bar = pr; barIn.style.width = pr + '%'; barOuter.setAttribute('aria-valuenow', String(Math.round(pct))); }
      setText(tapVal, 'tv', '+' + fmt(tapValue()));
      setText(chVal, 'cv', money(S.tot));

      var nx = nextIndex();
      cards.forEach(function (c, i) {
        var st = status(i);
        var isNext = i === nx;
        var sig = st + (isNext ? 'n' : '');
        if (sig !== c.sig || force) {
          c.sig = sig;
          var cl = c.el.classList;
          cl.toggle('is-locked', st === 'locked');
          cl.toggle('is-owned', st === 'owned');
          cl.toggle('is-ready', st === 'ready' && !c.u.trap);
          cl.toggle('is-afford', st === 'ready');
          cl.toggle('is-next', isNext);
          c.el.setAttribute('aria-disabled', st === 'ready' ? 'false' : 'true');
          c.sr.textContent = st === 'owned' ? 'Owned' : st === 'locked' ? 'Locked' : st === 'ready' ? 'Ready to buy' : 'Not enough yet';
        }
        var p = st === 'owned' || st === 'locked' ? 0 : Math.round(Math.min(1, have(c.u) / c.u.cost) * 100);
        if (p !== c.p) { c.p = p; c.el.style.setProperty('--p', p + '%'); }
      });
    }

    function sizeCanvas() {
      var w = cv.clientWidth, hh = cv.clientHeight;
      if (!w || !hh) return false;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var tw2 = Math.round(w * dpr), th = Math.round(hh * dpr);
      if (cv.width !== tw2 || cv.height !== th) { cv.width = tw2; cv.height = th; }
      return dpr;
    }
    function drawChart() {
      if (!ctx || !S) return;
      var dpr = sizeCanvas(); if (!dpr) return;
      var w = cv.clientWidth, hh = cv.clientHeight, pad = 6;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, hh);
      var maxT = Math.max(S.t, 30), maxY = Math.max(S.tot, 100);
      var base = hh - pad;
      ctx.strokeStyle = 'rgba(230,201,140,.14)'; ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(0, base + .5); ctx.lineTo(w, base + .5); ctx.stroke(); ctx.setLineDash([]);
      var pts = S.hist.concat([[S.t, S.tot]]);
      if (pts.length < 2 || S.tot <= 0) return;
      var xy = pts.map(function (q) { return [q[0] / maxT * (w - pad * 2) + pad, base - Math.sqrt(q[1] / maxY) * (base - pad)]; });
      var g = ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, '#b8924c'); g.addColorStop(.7, '#e6c98c'); g.addColorStop(1, '#fff6df');
      var fill = ctx.createLinearGradient(0, 0, 0, hh);
      fill.addColorStop(0, 'rgba(230,201,140,.22)'); fill.addColorStop(1, 'rgba(230,201,140,0)');
      ctx.beginPath(); ctx.moveTo(xy[0][0], base);
      xy.forEach(function (q) { ctx.lineTo(q[0], q[1]); });
      ctx.lineTo(xy[xy.length - 1][0], base); ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
      ctx.beginPath();
      xy.forEach(function (q, i) { if (i) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); });
      ctx.strokeStyle = g; ctx.lineWidth = 1.8; ctx.lineJoin = 'round'; ctx.stroke();
      var e = xy[xy.length - 1];
      ctx.beginPath(); ctx.arc(e[0], e[1], 3, 0, 6.2832); ctx.fillStyle = '#fff6df';
      ctx.shadowColor = 'rgba(214,170,255,.8)'; ctx.shadowBlur = 8; ctx.fill(); ctx.shadowBlur = 0;
    }

    var chartAcc = 0;
    function frame(ts) {
      raf = requestAnimationFrame(frame);
      var dt = last ? (ts - last) / 1000 : 0;
      last = ts;
      if (dt > 0.25) dt = 0.25;
      if (!S || S.state !== 'play') return;
      step(dt);
      if (S.state !== 'play') return;
      render();
      chartAcc += dt;
      if (chartAcc >= 0.25) { chartAcc = 0; drawChart(); }
    }
    function sync() {
      var run = !destroyed && S && S.state === 'play' && vis && !document.hidden;
      root.classList.toggle('is-paused', !(vis && !document.hidden));
      if (run && !raf) { last = 0; raf = requestAnimationFrame(frame); }
      else if (!run && raf) { cancelAnimationFrame(raf); raf = 0; }
    }

    /* ---------- end ---------- */
    function finish(won) {
      S.state = 'end';
      sync();
      var upg = UPS.filter(function (u) { return !u.trap && S.owned[u.id]; }).length;
      var t = Math.min(S.t, LIMIT);
      endName.textContent = brand;
      endSlot.appendChild(scene.el);
      if (won) scene.setStage(5, true);
      scene.setSay(scene.stage() === 5);
      endTail.nodeValue = won ? ' is now a $100K brand.' : ' reached ' + money(S.tot) + '.';
      endSub.textContent = won
        ? 'Brand, website, SEO, motion, video, ads: the right things, in the right order. That is exactly how we build yours.'
        : 'A solid start in 90 seconds. Order and speed are what a real strategy gets right.';
      eT.textContent = Math.round(t) + ' s';
      eF.textContent = fmt(S.fTotal);
      eR.textContent = money(S.tot);
      eU.textContent = upg + ' / 6';
      eTrap.textContent = S.trapBought ? '✗' : '✓';
      eTrap.classList.toggle('is-bad', S.trapBought);
      var best = lsGet(), msg;
      if (won) {
        if (!best || t < best) { lsSet(Math.round(t * 10) / 10); msg = best ? 'New best time: ' + Math.round(t) + ' s' : 'Best time: ' + Math.round(t) + ' s'; }
        else msg = 'Best time: ' + Math.round(best) + ' s';
      } else {
        msg = best ? 'Best time: ' + Math.round(best) + ' s' : 'Reach $100K within 90 s to set a best time.';
      }
      endBest.textContent = msg;
      show('end');
      scrollRoot();
      try { endTitle.focus({ preventScroll: true }); } catch (e) { endTitle.focus(); }
    }

    /* ---------- wiring ---------- */
    form.addEventListener('submit', function (e) { e.preventDefault(); startRun(); });
    againBtn.addEventListener('click', function () { resetRun(); });
    ctaBtn.addEventListener('click', function () {
      if (typeof opts.onCTA === 'function') { try { opts.onCTA(); } catch (e) { if (window.console) console.error(e); } }
    });

    var io = null, ro = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (es) { vis = es[es.length - 1].isIntersecting; sync(); }, { threshold: 0.05 });
      io.observe(root);
    }
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(function () { if (S && S.state === 'play') drawChart(); });
      ro.observe(cv);
    }
    function onVis() { sync(); }
    document.addEventListener('visibilitychange', onVis);

    function destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      timers.forEach(clearTimeout); timers = [];
      if (io) io.disconnect();
      if (ro) ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      if (root.parentNode) root.parentNode.removeChild(root);
      delete el._ztaDestroy;
    }
    el._ztaDestroy = destroy;
    return { destroy: destroy };
  }

  window.ZTATycoon = { mount: mount, version: '1.0.0' };
})();
