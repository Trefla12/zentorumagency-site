/* Zentorum Agency · shared sub-page JS: reveal-on-scroll + year. No dependencies. */
(function(){
  var d=document,els=[].slice.call(d.querySelectorAll('.rv'));
  [].forEach.call(d.querySelectorAll('[data-year]'),function(e){e.textContent=new Date().getFullYear()});
  var calm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!('IntersectionObserver' in window)||calm||!els.length)return;
  d.documentElement.classList.add('js-ok');
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -6% 0px',threshold:.05});
  els.forEach(function(e){io.observe(e)});
  setTimeout(function(){els.forEach(function(e){e.classList.add('in')})},4000);
})();
