/* Zentorum Agency · content pages: blog filter, reading progress, TOC, glossary search */
(function(){
var c=document.querySelector('.chips'),g=document.getElementById('bgrid');
if(c&&g){c.addEventListener('click',function(ev){var b=ev.target.closest('button');if(!b)return;var f=b.getAttribute('data-f');
 c.querySelectorAll('button').forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});
 g.querySelectorAll('.bc').forEach(function(a){a.hidden=!!f&&a.getAttribute('data-cat')!==f;a.classList.add('in');a.classList.toggle('bc--feat',!f&&a===g.firstElementChild)})})}
var p=document.querySelector('.prog'),art=document.querySelector('.prose');
if(p&&art){var links=[].slice.call(document.querySelectorAll('.toc a')),hs=links.map(function(a){return document.getElementById(a.getAttribute('href').slice(1))});
 var tick=0,u=function(){tick=0;var r=art.getBoundingClientRect(),t=Math.min(1,Math.max(0,-r.top/(r.height-innerHeight*.6)));p.style.transform='scaleX('+t+')';
  var on=-1;hs.forEach(function(h,i){if(h&&h.getBoundingClientRect().top<140)on=i});links.forEach(function(a,i){a.classList.toggle('on',i===on)})};
 addEventListener('scroll',function(){if(!tick){tick=1;requestAnimationFrame(u)}},{passive:true});u()}
var q=document.getElementById('gl-q'),gl=document.getElementById('gl');
if(q&&gl){var none=document.getElementById('gl-none'),ds=[].slice.call(gl.children);
 q.addEventListener('input',function(){var v=q.value.trim().toLowerCase(),n=0;ds.forEach(function(d){var m=!v||d.textContent.toLowerCase().indexOf(v)>-1;d.hidden=!m;if(m)n++});none.hidden=n>0})}
})();
/* industry concept videos: load on first view, loop while visible, pause off-screen; posters only with reduced motion or data saver */
(function(){
 var vs=[].slice.call(document.querySelectorAll('.mkv video[data-src]'));if(!vs.length||!('IntersectionObserver' in window))return;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches||(navigator.connection&&navigator.connection.saveData))return;
 function go(v){
  if(!v.dataset.ld){v.dataset.ld=1;(v.dataset.webm?[[v.dataset.webm,'video/webm; codecs="vp9"']]:[]).concat([[v.dataset.src,'video/mp4']]).forEach(function(s){var e=document.createElement('source');e.src=s[0];e.type=s[1];v.appendChild(e)});v.load()}
  var p=v.play();if(p&&p.then)p.then(function(){v.classList.add('on')},function(){});else v.classList.add('on');
 }
 var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting)go(x.target);else if(!x.target.paused)x.target.pause()})},{threshold:.2});
 vs.forEach(function(v){io.observe(v)});
 document.addEventListener('visibilitychange',function(){vs.forEach(function(v){if(document.hidden)v.pause()})});
})();
