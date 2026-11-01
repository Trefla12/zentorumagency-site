/* Service hero visuals: run CSS loops only in view, lazy-load hero videos, count up stats. */
(()=>{
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
const els=document.querySelectorAll('.sv');if(!els.length)return;
document.documentElement.classList.add('sv-js');
const load=v=>{if(v.dataset.ok)return;v.dataset.ok=1;
 if(v.dataset.webm&&v.canPlayType('video/webm; codecs="vp9"')){v.src=v.dataset.webm}else{v.src=v.dataset.src}
 v.addEventListener('playing',()=>v.classList.add('is-play'),{once:true})};
const count=el=>{if(el.dataset.done)return;el.dataset.done=1;const t=+el.dataset.count,k=el.hasAttribute('data-k'),
 fmt=n=>k?n.toFixed(1)+'k':Math.round(n).toLocaleString('en-US');
 if(rm){el.textContent=fmt(t);return}const t0=performance.now(),d=1600;
 const f=now=>{const p=Math.min(1,(now-t0)/d);el.textContent=fmt(t*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)};requestAnimationFrame(f)};
const io=new IntersectionObserver(es=>es.forEach(e=>{const sv=e.target,on=e.isIntersecting;sv.classList.toggle('is-on',on);
 sv.querySelectorAll('video').forEach(v=>{if(on&&!rm){load(v);v.play().catch(()=>{})}else v.pause()});
 if(on)sv.querySelectorAll('[data-count]').forEach(count)}),{threshold:.15});
els.forEach(el=>io.observe(el));
})();
