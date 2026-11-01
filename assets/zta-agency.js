/* Zentorum Agency: zentorumagency.com (GitHub Pages). Loader, smooth scroll, WebGL dream→idea→reality particles, sections, inquiry form. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const body = document.body;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
const MOBILE = () => innerWidth < 900;
const gsap = window.gsap;
const ST = window.ScrollTrigger;
if (gsap && ST) gsap.registerPlugin(ST);
root.classList.add('zta-ok');

/* ---------- smooth scroll ---------- */
let lenis = null;
if (!RM && window.Lenis) {
  lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.stop();
  if (gsap) {
    lenis.on('scroll', () => ST && ST.update());
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
}
function scrollToEl(el) {
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -60, duration: 1.4 });
  else el.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
}
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  const el = id.length > 1 && document.getElementById(id.slice(1));
  if (!el) return;
  e.preventDefault();
  scrollToEl(el);
  if (id === '#contact') setTimeout(() => $('#zta-form input')?.focus({ preventScroll: true }), RM ? 0 : 1300);
});

/* ---------- split headline ---------- */
function split(el) {
  const t = el.textContent;
  el.setAttribute('aria-label', t);
  el.textContent = '';
  for (const c of t) {
    const s = document.createElement('span');
    s.className = 'ch';
    s.setAttribute('aria-hidden', 'true');
    s.textContent = c;
    el.appendChild(s);
  }
}
$$('.split').forEach(split);
// gold words: one gradient spread across the letters (each letter is its own layer, so it needs its own clip)
function goldSpread() {
  $$('.split.gold').forEach(el => {
    const r = el.getBoundingClientRect(); // letters only move vertically, so x positions are stable
    $$('.ch', el).forEach(c => { c.style.setProperty('--gw', r.width + 'px'); c.style.setProperty('--gx', r.left - c.getBoundingClientRect().left + 'px'); });
  });
}
goldSpread();
document.fonts?.ready.then(goldSpread);
addEventListener('resize', goldSpread);

/* ---------- hero comet (Z → A) ---------- */
const comet = $('[data-comet]');
const cPath = $('[data-comet-path]');
const cHead = $('[data-comet-head]');
const cSpark = $('[data-comet-spark]');
function layoutComet() {
  if (!comet) return null;
  const box = comet.getBoundingClientRect();
  const z = $('[data-z] .ch').getBoundingClientRect();
  const a = $('[data-a] .ch').getBoundingClientRect();
  const s = z.height / 260;
  const x0 = z.left - box.left + z.width * 0.42;
  const y0 = z.top - box.top + z.height * 0.86;
  const yA = a.top - box.top + a.height * 0.58;
  const xA = a.left - box.left - 14 * s;
  const mid = x0 + (xA - x0) * 0.55;
  cPath.setAttribute('d', `M${x0},${y0} C${x0 - 20 * s},${yA} ${x0 + (xA - x0) * 0.25},${yA} ${mid},${yA} L${xA},${yA}`);
  cHead.setAttribute('d', `M${xA - 22 * s},${yA - 15 * s} L${xA},${yA} L${xA - 22 * s},${yA + 15 * s}`);
  cSpark.setAttribute('r', Math.max(8, 16 * s * 1.6));
  return { x0, y0, xA, yA };
}
function drawComet(animate) {
  const p = layoutComet();
  if (!p) return;
  const L = cPath.getTotalLength();
  const HL = cHead.getTotalLength();
  cPath.style.strokeDasharray = L;
  cHead.style.strokeDasharray = HL;
  if (!animate || !gsap) {
    cPath.style.strokeDashoffset = 0;
    cHead.style.strokeDashoffset = 0;
    cSpark.setAttribute('cx', p.xA);
    cSpark.setAttribute('cy', p.yA);
    return;
  }
  const st = { v: 0 };
  cPath.style.strokeDashoffset = L;
  cHead.style.strokeDashoffset = HL;
  gsap.to(st, {
    v: 1, duration: 1.5, ease: 'power3.inOut',
    onUpdate() {
      cPath.style.strokeDashoffset = L * (1 - st.v);
      const pt = cPath.getPointAtLength(L * st.v);
      cSpark.setAttribute('cx', pt.x);
      cSpark.setAttribute('cy', pt.y);
    },
    onComplete() {
      gsap.to(cHead, { strokeDashoffset: 0, duration: 0.35, ease: 'power2.out' });
      gsap.fromTo(cSpark, { scale: 1.6, transformOrigin: 'center' }, { scale: 1, duration: 0.8, ease: 'elastic.out(1,.4)' });
      gsap.to(cSpark, { opacity: 0.65, duration: 1.6, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 0.8 });
    }
  });
}

/* ---------- WebGL particles ---------- */
const gl = { ready: false, T: 0, target: 0, explode: 0, explodeTarget: 0, intro: 0, mouse: [0, 0], mouseOn: 0 };
async function initGL() {
  const canvas = $('[data-gl]');
  if (!canvas) return;
  let THREE;
  try { THREE = await import('three'); } catch { canvas.remove(); return; }
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
  } catch { canvas.remove(); return; }
  const N = MOBILE() ? 7000 : 16000;
  const PR = Math.min(devicePixelRatio || 1, 2);
  renderer.setPixelRatio(PR);
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
  cam.position.z = 10;
  const geo = new THREE.BufferGeometry();
  const p0 = new Float32Array(N * 3), p1 = new Float32Array(N * 3), p2 = new Float32Array(N * 3), p3 = new Float32Array(N * 3), rnd = new Float32Array(N * 4);
  for (let i = 0; i < N * 4; i++) rnd[i] = Math.random();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  geo.setAttribute('p0', new THREE.BufferAttribute(p0, 3));
  geo.setAttribute('p1', new THREE.BufferAttribute(p1, 3));
  geo.setAttribute('p2', new THREE.BufferAttribute(p2, 3));
  geo.setAttribute('p3', new THREE.BufferAttribute(p3, 3));
  geo.setAttribute('rnd', new THREE.BufferAttribute(rnd, 4));
  const uni = {
    uT: { value: 0 }, uTime: { value: 0 }, uSize: { value: MOBILE() ? 2.4 : 2.6 }, uPR: { value: PR },
    uMouse: { value: new THREE.Vector2(99, 99) }, uMouseOn: { value: 0 }, uExplode: { value: 0 }, uIntro: { value: 0 }
  };
  const mat = new THREE.ShaderMaterial({
    uniforms: uni, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute vec3 p0; attribute vec3 p1; attribute vec3 p2; attribute vec3 p3; attribute vec4 rnd;
      uniform float uT, uTime, uSize, uPR, uMouseOn, uExplode, uIntro; uniform vec2 uMouse;
      varying vec3 vC; varying float vA;
      float seg(float a){ return smoothstep(0.0, 1.0, clamp((uT - a - rnd.x * 0.35) / 0.65, 0.0, 1.0)); }
      void main(){
        vec3 c = p0;
        float ang = uTime * 0.05 / (0.35 + length(c.xy) * 0.18);
        float cs = cos(ang), sn = sin(ang);
        c.xy = mat2(cs, -sn, sn, cs) * c.xy;
        c *= 0.15 + 0.85 * uIntro;
        float s1 = seg(0.0), s2 = seg(1.0), s3 = seg(2.0);
        vec3 p = mix(c, p1, s1); p = mix(p, p2, s2); p = mix(p, p3, s3);
        float tr = s1 * (1.0 - s1) + s2 * (1.0 - s2) + s3 * (1.0 - s3);
        p.xy += vec2(sin(uTime * 0.7 + rnd.y * 6.28), cos(uTime * 0.6 + rnd.z * 6.28)) * tr * 1.6;
        p.z += sin(rnd.w * 6.28 + uTime) * tr * 2.5;
        float inText = s1;
        p.xy += vec2(sin(uTime * 1.3 + rnd.x * 40.0), cos(uTime * 1.1 + rnd.y * 40.0)) * 0.018 * inText;
        vec3 far = c * vec3(1.7, 1.7, 1.0) + vec3(0.0, 0.0, -2.0);
        p = mix(p, far, uExplode);
        vec2 d = p.xy - uMouse; float dist = length(d);
        float f = smoothstep(1.5, 0.0, dist) * uMouseOn;
        p.xy += normalize(d + 1e-4) * f * 0.9; p.z += f * 0.8;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * uPR * (0.45 + rnd.y * 0.9) * (10.0 / -mv.z) * (1.0 + f * 0.6);
        vec3 lilac = vec3(0.84, 0.68, 1.0), gold = vec3(0.95, 0.79, 0.5), cream = vec3(0.97, 0.93, 0.84), white = vec3(1.0, 0.97, 0.9);
        vec3 cloud = rnd.z > 0.9 ? white : (rnd.z > 0.5 ? gold : lilac);
        vec3 dream = rnd.z > 0.85 ? white : lilac;
        vec3 idea = rnd.z > 0.8 ? gold : cream;
        vec3 real = rnd.z > 0.8 ? white : gold;
        float w0 = 1.0 - s1, w1 = s1 * (1.0 - s2), w2 = s2 * (1.0 - s3), w3 = s3;
        vC = cloud * w0 + dream * w1 + idea * w2 + real * w3;
        vC = mix(vC, cloud, uExplode);
        float tw = 0.55 + 0.45 * sin(uTime * 2.0 + rnd.w * 30.0);
        vA = mix(tw * 0.75, 0.55 + 0.2 * tw, inText * (1.0 - uExplode)) * uIntro;
      }`,
    fragmentShader: `
      varying vec3 vC; varying float vA;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d); a *= a;
        gl_FragColor = vec4(vC, a * vA);
      }`
  });
  scene.add(new THREE.Points(geo, mat));

  const view = () => {
    const h = Math.tan((cam.fov * Math.PI) / 360) * cam.position.z;
    return { hw: h * cam.aspect, hh: h };
  };
  function fillCloud() {
    const { hw, hh } = view();
    const R = Math.max(hw, hh) * 1.15;
    for (let i = 0; i < N; i++) {
      const k = i * 3;
      if (i % 5 === 0) {
        p0[k] = (Math.random() - 0.5) * hw * 2.6;
        p0[k + 1] = (Math.random() - 0.5) * hh * 2.6;
        p0[k + 2] = (Math.random() - 0.5) * 6;
      } else {
        const r = Math.pow(Math.random(), 1.6) * R;
        const arm = (i % 3) * ((Math.PI * 2) / 3);
        const a = arm + r * 0.9 + (Math.random() - 0.5) * 0.7;
        p0[k] = Math.cos(a) * r * 1.25 + (Math.random() - 0.5) * 0.4;
        p0[k + 1] = Math.sin(a) * r * 0.62 + (Math.random() - 0.5) * 0.4;
        p0[k + 2] = (Math.random() - 0.5) * 2.2;
      }
    }
    geo.attributes.p0.needsUpdate = true;
  }
  function sampleWord(word, font, out) {
    const W = 1400, H = 460;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const x = cv.getContext('2d', { willReadFrequently: true });
    x.font = font;
    const m = x.measureText(word).width;
    const fs = Math.min(300 * (W * 0.92) / m, 300);
    x.font = font.replace('300px', fs + 'px');
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#fff';
    x.fillText(word, W / 2, H / 2);
    const d = x.getImageData(0, 0, W, H).data;
    const pts = [];
    let minX = W, maxX = 0, minY = H, maxY = 0;
    for (let y = 0; y < H; y += 2) for (let xx = 0; xx < W; xx += 2) {
      if (d[(y * W + xx) * 4 + 3] > 140) {
        pts.push(xx, y);
        if (xx < minX) minX = xx; if (xx > maxX) maxX = xx; if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
    if (!pts.length) return;
    const { hw, hh } = view();
    const mob = MOBILE();
    const tw = hw * 2 * (mob ? 0.88 : 0.6);
    const sc = Math.min(tw / (maxX - minX), (hh * 2 * 0.34) / (maxY - minY));
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    const yOff = hh * (mob ? 0.22 : 0.12);
    const jit = sc * 1.4;
    for (let i = 0; i < N; i++) {
      const j = ((Math.random() * (pts.length / 2)) | 0) * 2;
      out[i * 3] = (pts[j] - cx) * sc + (Math.random() - 0.5) * jit;
      out[i * 3 + 1] = -(pts[j + 1] - cy) * sc + yOff + (Math.random() - 0.5) * jit;
      out[i * 3 + 2] = (Math.random() - 0.5) * 0.35;
    }
  }
  const FONT = '"Cormorant Garamond", Georgia, serif';
  function fillWords() {
    sampleWord('dream', `italic 500 300px ${FONT}`, p1);
    sampleWord('idea', `500 300px ${FONT}`, p2);
    sampleWord('reality', `600 300px ${FONT}`, p3);
    geo.attributes.p1.needsUpdate = geo.attributes.p2.needsUpdate = geo.attributes.p3.needsUpdate = true;
  }
  let lastW = 0, lastH = 0;
  function resize(force) {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
    if (force || w !== lastW || Math.abs(h - lastH) > lastH * 0.2) {
      lastW = w; lastH = h;
      fillCloud();
      fillWords();
    }
  }
  try {
    await Promise.all([
      document.fonts.load(`italic 500 100px ${FONT}`),
      document.fonts.load(`500 100px ${FONT}`),
      document.fonts.load(`600 100px ${FONT}`)
    ]);
  } catch {}
  resize(true);
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => resize(false), 150); });

  if (FINE) {
    addEventListener('pointermove', e => {
      const { hw, hh } = view();
      gl.mouse = [((e.clientX / innerWidth) * 2 - 1) * hw, (-(e.clientY / innerHeight) * 2 + 1) * hh];
      gl.mouseOn = 1;
    }, { passive: true });
    document.addEventListener('pointerleave', () => { gl.mouseOn = 0; });
  }

  const clock = new THREE.Clock();
  let mOn = 0;
  function frame() {
    if (document.hidden) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const e = 1 - Math.pow(0.001, dt);
    gl.T += (gl.target - gl.T) * (RM ? 1 : e * 0.9);
    gl.explode += (gl.explodeTarget - gl.explode) * (RM ? 1 : e);
    mOn += (gl.mouseOn - mOn) * e;
    uni.uT.value = gl.T;
    uni.uExplode.value = gl.explode;
    uni.uIntro.value = gl.intro;
    uni.uMouseOn.value = mOn;
    uni.uMouse.value.set(gl.mouse[0], gl.mouse[1]);
    if (!RM) uni.uTime.value += dt;
    renderer.render(scene, cam);
  }
  if (gsap) gsap.ticker.add(frame);
  else { const loop = () => { frame(); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
  gl.ready = true;
}

/* ---------- loader ---------- */
const pctEl = $('[data-pct]');
const loaderEl = $('.loader');
const fontsReady = (document.fonts?.ready || Promise.resolve()).catch(() => {});
const glReady = initGL().catch(() => {});
const minTime = new Promise(r => setTimeout(r, RM ? 200 : 1700));
let shown = 0;
const counter = setInterval(() => {
  shown = Math.min(shown + (shown < 80 ? 3 : 1), 99);
  if (pctEl) pctEl.textContent = shown;
}, 30);
Promise.race([Promise.all([fontsReady, glReady, minTime]), new Promise(r => setTimeout(r, 5000))]).then(() => {
  clearInterval(counter);
  if (pctEl) pctEl.textContent = 100;
  setTimeout(start, RM ? 0 : 250);
});

function start() {
  loaderEl?.classList.add('is-out');
  body.classList.remove('is-loading');
  setTimeout(() => loaderEl?.remove(), 1300);
  lenis?.start();
  intro();
  setupScroll();
  ST?.refresh();
}

function intro() {
  const chars = $$('.hero .ch');
  const ups = $$('.hero .reveal-up');
  if (!gsap || RM) {
    chars.forEach(c => (c.style.transform = 'none'));
    ups.forEach(u => { u.style.opacity = 1; u.style.transform = 'none'; });
    gl.intro = 1;
    body.classList.add('is-ready');
    drawComet(false);
    return;
  }
  const tl = gsap.timeline({ delay: 0.25 });
  tl.to(gl, { intro: 1, duration: 2.4, ease: 'expo.out' }, 0)
    .to('[data-z] .ch', { y: 0, duration: 1.2, stagger: 0.045, ease: 'expo.out' }, 0.15)
    .to('[data-a] .ch', { y: 0, duration: 1.2, stagger: 0.05, ease: 'expo.out' }, 0.45)
    .add(() => drawComet(true), 1.1)
    .to(ups, { opacity: 1, y: 0, duration: 1, stagger: 0.12, ease: 'power3.out' }, 1.2)
    .add(() => body.classList.add('is-ready'), 1.2);
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => drawComet(false), 200); });
}

/* ---------- scroll-driven sections ---------- */
function setupScroll() {
  // nav + mobile bar
  const nav = $('[data-nav]');
  const mbar = $('[data-mbar]');
  let contactVisible = false;
  const onScroll = () => {
    const y = scrollY;
    nav?.classList.toggle('is-solid', y > 40);
    mbar?.classList.toggle('is-on', y > innerHeight * 0.6 && !contactVisible);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  const contact = $('#contact');
  if (contact && mbar) new IntersectionObserver(([en]) => { contactVisible = en.isIntersecting; onScroll(); }, { threshold: 0.15 }).observe(contact);

  // generic reveals
  $$('.reveal-up').filter(el => !el.closest('.hero')).forEach(el => {
    if (!gsap || RM) { el.style.opacity = 1; el.style.transform = 'none'; return; }
    gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  if (gsap && ST && !RM) {
    $$('.sec-head .h2, .card, .num, .qf, .ct__side > *').forEach(el => {
      gsap.from(el, { opacity: 0, y: 40, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
    });
  }

  // dream → idea → reality
  const caps = $$('.dream__captions li');
  const bar = $('[data-dream-bar]');
  const keys = [[0, 0], [0.1, 0], [0.3, 1], [0.42, 1], [0.6, 2], [0.72, 2], [0.9, 3], [1, 3]];
  const mapT = p => {
    for (let i = 1; i < keys.length; i++) {
      if (p <= keys[i][0]) {
        const [a, va] = keys[i - 1], [b, vb] = keys[i];
        return va + ((p - a) / (b - a || 1)) * (vb - va);
      }
    }
    return 3;
  };
  let capIdx = 0;
  const setCap = i => {
    if (i === capIdx) return;
    capIdx = i;
    caps.forEach((c, k) => c.classList.toggle('is-on', k === i));
  };
  const canvas = $('[data-gl]');
  if (ST && !RM) {
    ST.create({
      trigger: '#dream', start: 'top top', end: 'bottom bottom',
      onUpdate(self) {
        gl.target = mapT(self.progress);
        if (bar) bar.style.transform = `scaleX(${self.progress})`;
        setCap(gl.target < 0.6 ? 0 : gl.target < 1.6 ? 1 : 2);
      },
      onLeaveBack() { gl.target = 0; setCap(0); }
    });
    ST.create({
      trigger: '#services', start: 'top bottom', end: 'top 25%',
      onUpdate(self) {
        gl.explodeTarget = self.progress;
        if (canvas) canvas.style.opacity = 1 - self.progress * 0.6;
      }
    });
  } else if (!RM) {
    // no GSAP: cheap scroll-based fallback
    const dream = $('#dream');
    addEventListener('scroll', () => {
      if (!dream) return;
      const r = dream.getBoundingClientRect();
      const p = Math.min(Math.max(-r.top / (r.height - innerHeight), 0), 1);
      gl.target = mapT(p);
      setCap(gl.target < 0.6 ? 0 : gl.target < 1.6 ? 1 : 2);
      gl.explodeTarget = r.bottom < innerHeight * 0.5 ? 1 : 0;
    }, { passive: true });
  } else {
    gl.target = 3;
  }

  setupMarquee();
  setupWork();
  setupProcess();
  setupCounters();
}

function setupMarquee() {
  const track = $('[data-marquee]');
  if (!track || RM || !gsap) return;
  track.innerHTML += track.innerHTML;
  const tw = gsap.to(track, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
  if (lenis) {
    lenis.on('scroll', ({ velocity }) => {
      const v = Math.min(Math.abs(velocity) / 12, 4);
      gsap.to(tw, { timeScale: (velocity < 0 ? -1 : 1) * (1 + v), duration: 0.3, overwrite: true });
    });
  }
}

function setupWork() {
  const track = $('[data-work-track]');
  const pin = $('.work__pin');
  if (!track) return;
  // lazy videos
  const vids = $$('video[data-src]');
  const io = new IntersectionObserver(ens => {
    ens.forEach(en => {
      const v = en.target;
      if (en.isIntersecting) {
        if (!v.src) { v.src = v.dataset.webm && v.canPlayType('video/webm; codecs="vp9"') ? v.dataset.webm : v.dataset.src; v.load(); }
        if (!RM) v.play().catch(() => {});
      } else v.pause();
    });
  }, { rootMargin: '200px 200px', threshold: 0.01 });
  vids.forEach(v => io.observe(v));
  $$('.piece').forEach(p => p.addEventListener('click', e => {
    if (e.target.closest('a')) return;
    const v = $('video', p);
    if (!v) return;
    if (!v.src) { v.src = v.dataset.src; }
    v.paused ? v.play().catch(() => {}) : v.pause();
  }));

  if (RM || !gsap || !ST) { if (pin) pin.style.overflowX = 'auto'; return; }
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    // size the media so the whole card, caption included, fits on screen while pinned
    const work = $('.work');
    const fit = () => {
      for (let i = 0; i < 2; i++) { // captions rewrap once widths change, so measure twice
        const top = track.getBoundingClientRect().top - work.getBoundingClientRect().top;
        const cap = Math.max(...$$('.piece figcaption', track).map(c => c.offsetHeight));
        track.style.setProperty('--mh', Math.max(innerHeight - top - cap - 44, 160) + 'px');
      }
    };
    fit(); ST.addEventListener('refreshInit', fit);
    const dist = () => Math.max(track.scrollWidth - innerWidth, 0);
    const tween = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: '.work', pin: true, start: 'top top', end: () => '+=' + dist(), scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 }
    });
    // drag to scroll while pinned
    let down = false, sx = 0;
    const pd = e => { down = true; sx = e.clientX; };
    const pm = e => {
      if (!down) return;
      const dx = e.clientX - sx;
      sx = e.clientX;
      if (lenis) lenis.scrollTo(lenis.scroll - dx * 1.4, { immediate: true });
      else scrollBy(0, -dx * 1.4);
    };
    const pu = () => { down = false; };
    track.addEventListener('pointerdown', pd);
    addEventListener('pointermove', pm);
    addEventListener('pointerup', pu);
    return () => {
      tween.scrollTrigger?.kill(); tween.kill();
      ST.removeEventListener('refreshInit', fit); track.style.removeProperty('--mh');
      track.removeEventListener('pointerdown', pd);
      removeEventListener('pointermove', pm);
      removeEventListener('pointerup', pu);
    };
  });
}


function setupProcess() {
  const steps = $('[data-steps]');
  const rail = $('[data-rail]');
  const head = $('[data-rail-head]');
  if (!steps || !rail) return;
  const items = $$('.step', steps);
  const paint = p => {
    const v = MOBILE();
    rail.style.transform = v ? `scaleY(${p})` : `scaleX(${p})`;
    if (head) { head.style.left = v ? '0' : p * 100 + '%'; head.style.top = v ? p * 100 + '%' : ''; }
    items.forEach((s, i) => (s.style.opacity = p >= i / items.length - 0.02 ? 1 : 0.35));
  };
  if (RM || !ST) { paint(1); return; }
  paint(0);
  ST.create({ trigger: steps, start: 'top 75%', end: 'bottom 55%', scrub: 0.6, onUpdate: s => paint(s.progress) });
}

function setupCounters() {
  const els = $$('[data-count]');
  const io = new IntersectionObserver(ens => ens.forEach(en => {
    if (!en.isIntersecting) return;
    io.unobserve(en.target);
    const to = +en.target.dataset.count;
    if (RM || !gsap) { en.target.textContent = to; return; }
    const o = { v: 0 };
    gsap.to(o, { v: to, duration: 1.8, ease: 'power2.out', onUpdate: () => (en.target.textContent = Math.round(o.v)) });
  }), { threshold: 0.6 });
  els.forEach(el => io.observe(el));
}

/* ---------- cursor, magnetic, tilt ---------- */
if (FINE && !RM) {
  const cur = $('.cursor');
  const dot = $('.cursor__dot');
  const ring = $('.cursor__ring');
  const label = $('[data-cursor-label]');
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  addEventListener('pointermove', e => {
    mx = e.clientX; my = e.clientY;
    if (dot) dot.style.transform = `translate(${mx}px,${my}px)`;
  }, { passive: true });
  const loop = () => {
    rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
    if (ring) ring.style.transform = `translate(${rx}px,${ry}px)`;
    requestAnimationFrame(loop);
  };
  loop();
  document.addEventListener('pointerover', e => {
    const t = e.target.closest('[data-cursor]');
    if (t) { label && (label.textContent = t.dataset.cursor); cur?.classList.add('is-big'); }
  });
  document.addEventListener('pointerout', e => {
    const t = e.target.closest('[data-cursor]');
    if (t && !t.contains(e.relatedTarget)) cur?.classList.remove('is-big');
  });

  $$('.magnetic').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.28;
      const y = (e.clientY - r.top - r.height / 2) * 0.35;
      el.style.transform = `translate(${x}px,${y}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  $$('.tilt').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', px * 100 + '%');
      el.style.setProperty('--my', py * 100 + '%');
      el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 7}deg) rotateY(${(px - 0.5) * 9}deg) translateZ(0)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}


/* ---------- inquiry form ---------- */
const BUDGETS = ['Under $1K', '$1K – $3K', '$3K – $7K', '$7K – $15K', '$15K+'];
const form = $('#zta-form');
if (form) setupForm(form);

function setupForm(form) {
  const steps = $$('.qf__step', form);
  const bar = $('[data-qf-bar]', form);
  const cometB = $('[data-qf-comet]', form);
  const count = $('[data-qf-count]', form);
  const back = $('[data-qf-back]', form);
  const next = $('[data-qf-next]', form);
  const submit = $('[data-qf-submit]', form);
  const err = $('[data-qf-error]', form);
  const done = $('[data-qf-done]', form);
  const range = form.elements.budget_i;
  const out = $('[data-budget-out]', form);
  const dream = form.elements.dream;
  const dCount = $('[data-dream-count]', form);
  const B = k => $(`[data-b-${k}]`);
  let step = 1;
  const t0 = Date.now();
  const sid = Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  const EMAIL_RE = /^[^\s@,;<>"'()[\]\\]+@[^\s@,;<>"'()[\]\\]+\.[A-Za-z]{2,}$/;

  // first-touch attribution (no personal data)
  const qs = new URLSearchParams(location.search);
  const utm = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(k => { if (qs.get(k)) utm[k] = qs.get(k).slice(0, 80); });
  try {
    if (Object.keys(utm).length) sessionStorage.setItem('zta_utm', JSON.stringify(utm));
    else Object.assign(utm, JSON.parse(sessionStorage.getItem('zta_utm') || '{}'));
  } catch {}

  const val = n => {
    const el = form.elements[n];
    if (!el) return '';
    if (el instanceof RadioNodeList || el.length > 1 && el[0]?.type) {
      const list = [...form.querySelectorAll(`[name="${n}"]`)].filter(i => i.checked).map(i => i.value);
      return list.join(', ');
    }
    return (el.value || '').trim();
  };

  const setErr = (msg, html) => { if (html) err.innerHTML = msg; else err.textContent = msg; };

  function go(n) {
    const dir = n > step ? 1 : -1;
    steps.forEach(s => s.classList.remove('is-on', 'is-back'));
    step = n;
    const cur = steps[n - 1];
    cur.classList.add('is-on');
    if (dir < 0) cur.classList.add('is-back');
    bar.style.transform = `scaleX(${n / 4})`;
    cometB.style.left = (n / 4) * 100 + '%';
    count.textContent = `Step ${n} of 4`;
    back.hidden = n === 1;
    next.hidden = n === 4;
    submit.hidden = n !== 4;
    setErr('');
    const t = $('.qf__title', cur);
    if (t) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
    const top = form.getBoundingClientRect().top;
    if (top < 60 || top > innerHeight * 0.5) scrollToEl(form);
  }

  function check(n) {
    if (n === 1 && !val('services')) return 'Pick at least one thing we can help with.';
    if (n === 2 && !val('stage')) return 'Where is your brand today? Pick one.';
    if (n === 4) {
      const name = val('name'), email = val('email');
      $$('.field', steps[3]).forEach(f => f.classList.remove('is-bad'));
      ['name', 'email'].forEach(k => form.elements[k].removeAttribute('aria-invalid'));
      if (name.length < 2) return bad('name', 'What should we call you?');
      if (email.length > 254 || !EMAIL_RE.test(email)) return bad('email', 'That email doesn\'t look right.');
    }
    return '';
  }

  function bad(k, msg) {
    const el = form.elements[k];
    el.closest('.field').classList.add('is-bad');
    el.setAttribute('aria-invalid', 'true');
    el.setAttribute('aria-describedby', err.id);
    el.focus();
    return msg;
  }

  next.addEventListener('click', () => {
    const m = check(step);
    if (m) { setErr(m); shake(); return; }
    go(step + 1);
  });
  back.addEventListener('click', () => go(step - 1));
  form.addEventListener('keydown', e => {
    if (e.key === 'Enter' && step < 4 && e.target.matches('input:not([type=radio]):not([type=checkbox])')) { e.preventDefault(); next.click(); }
  });

  function shake() {
    if (RM || !gsap) return;
    gsap.fromTo(steps[step - 1], { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1,.3)' });
  }

  // live brief
  function setB(k, v, fallback) {
    const el = B(k);
    if (!el) return;
    const nv = v || fallback;
    if (el.textContent !== nv) {
      el.textContent = nv;
      el.classList.toggle('is-set', !!v);
      if (v) { el.classList.remove('is-set'); void el.offsetWidth; el.classList.add('is-set'); }
    }
  }
  function brief() {
    const bi = +range.value;
    out.textContent = BUDGETS[bi];
    range.setAttribute('aria-valuetext', BUDGETS[bi].replace('–', 'to'));
    range.style.setProperty('--v', (bi / 4) * 100 + '%');
    setB('brand', val('brand'), 'Your brand');
    setB('services', val('services'), '—');
    setB('stage', val('stage'), '—');
    setB('budget', BUDGETS[bi], BUDGETS[bi]);
    setB('time', val('timeline'), '—');
    const filled = ['services', 'stage', 'timeline', 'brand', 'dream', 'name', 'email'].filter(k => val(k)).length;
    const pct = Math.round((filled / 7) * 100);
    const meter = B('meter');
    if (meter) meter.style.width = pct + '%';
    const note = B('note');
    if (note) note.textContent = pct < 30 ? 'Every great brand starts with a few words.' : pct < 60 ? 'It\'s taking shape…' : pct < 100 ? 'This is going to be good.' : 'Ready to become real.';
    if (dCount) dCount.textContent = `${dream.value.length} / 1500`;
  }
  form.addEventListener('input', brief);
  form.addEventListener('change', brief);
  brief();

  $$('[data-spark]', form).forEach(b => b.addEventListener('click', () => {
    const t = b.dataset.spark;
    if (dream.value.includes(t)) return;
    dream.value = (dream.value ? dream.value.trim() + ' ' : '') + t;
    dream.value = dream.value.slice(0, 1500);
    dream.dispatchEvent(new Event('input', { bubbles: true }));
    dream.focus();
  }));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (step < 4) { next.click(); return; }
    const m = check(4);
    if (m) { setErr(m); shake(); return; }
    const data = {
      services: (val('services') + (form.elements.wall?.checked ? '; Dream wall: OK' : '')).replace(/^; /, ''), stage: val('stage'), budget: BUDGETS[+range.value], timeline: val('timeline'),
      brand: val('brand'), website: val('website'), dream: val('dream'),
      name: val('name'), email: val('email'), phone: val('phone'), contact: val('contact'),
      botcheck: form.elements.botcheck.value, page: location.href.split('?')[0], referrer: document.referrer.slice(0, 200), sid, t: Date.now() - t0, ...utm
    };
    if (data.botcheck) { success(data.name); return; }
    const endpoint = form.dataset.endpoint;
    if (!endpoint) { fail(); return; }
    form.classList.add('is-sending');
    submit.disabled = true;
    setErr('');
    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), 25000);
    try {
      const res = await fetch(endpoint, { method: 'POST', body: JSON.stringify(data), signal: ac.signal, redirect: 'follow' });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.ok) throw new Error(j.error || 'send failed');
      try { window.Shopify?.analytics?.publish?.('zta_inquiry_submitted', { services: data.services, stage: data.stage, budget: data.budget }); } catch {}
      success(data.name);
    } catch (ex) {
      const code = ex && ex.message;
      if (code === 'name' || code === 'email') { go(4); setErr(bad(code, code === 'name' ? 'What should we call you?' : 'That email doesn\'t look right.')); return; }
      fail(code === 'rate' ? 'You\'ve already sent a few inquiries. We\'ll be in touch soon, or call ' : null);
    } finally {
      clearTimeout(to);
      form.classList.remove('is-sending');
      submit.disabled = false;
    }
  });

  function fail(prefix) {
    setErr(`${prefix || 'We couldn\'t send that just now. Please try again, or call us at '}<a class="link" href="tel:+15122415531">512-241-5531</a>.`, true);
  }

  function success(name) {
    const first = (name || '').split(/\s+/)[0];
    const dn = $('[data-done-name]', form);
    if (dn && first) dn.textContent = ', ' + first;
    const fly = document.createElement('i');
    fly.className = 'comet-fly';
    form.appendChild(fly);
    setTimeout(() => fly.remove(), 1200);
    setTimeout(() => {
      form.classList.add('is-sent');
      done.hidden = false;
      done.focus({ preventScroll: true });
      burst(form);
      scrollToEl(form);
      try { sessionStorage.setItem('zta_sent', '1'); } catch {}
      // offer /thank-you/ and auto-redirect after ~4 s, only if that page exists (else stay on the inline success)
      fetch('/thank-you/', { method: 'HEAD' }).then(r => { if (r.ok) setTimeout(() => { location.href = '/thank-you/'; }, 4000); }).catch(() => {});
    }, RM ? 0 : 500);
  }
}

function burst(host) {
  if (RM) return;
  const c = document.createElement('canvas');
  c.className = 'zta-burst';
  host.appendChild(c);
  const r = host.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio || 1, 2);
  c.width = r.width * dpr; c.height = r.height * dpr;
  const x = c.getContext('2d');
  x.scale(dpr, dpr);
  const cols = ['#fff6df', '#e6c98c', '#c9a565', '#d6aaff'];
  const ps = Array.from({ length: 110 }, () => {
    const a = Math.random() * Math.PI * 2, s = 3 + Math.random() * 7;
    return { x: r.width / 2, y: r.height * 0.3, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 3, r: 1 + Math.random() * 2.6, c: cols[(Math.random() * 4) | 0], l: 1 };
  });
  const t0 = performance.now();
  const tick = t => {
    x.clearRect(0, 0, r.width, r.height);
    ps.forEach(p => {
      p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.16; p.x += p.vx; p.y += p.vy; p.l -= 0.011;
      if (p.l <= 0) return;
      x.globalAlpha = p.l;
      x.fillStyle = p.c;
      x.shadowColor = p.c; x.shadowBlur = 8;
      x.beginPath(); x.arc(p.x, p.y, p.r, 0, 7); x.fill();
    });
    if (t - t0 < 2200) requestAnimationFrame(tick);
    else c.remove();
  };
  requestAnimationFrame(tick);
}

/* ---------- misc ---------- */
$$('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()));
document.addEventListener('visibilitychange', () => {
  $$('.work video').forEach(v => { if (document.hidden) v.pause(); });
});
