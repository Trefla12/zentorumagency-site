/* Zentorum Agency · blog extras: TOC active section (IntersectionObserver), phone TOC, share buttons */
(function(){
var links=[].slice.call(document.querySelectorAll('.toc a[href^="#"],.toc-m a[href^="#"]'));
if(links.length&&'IntersectionObserver' in window){
 var map={};links.forEach(function(a){var id=a.getAttribute('href').slice(1);(map[id]=map[id]||[]).push(a)});
 var hs=Object.keys(map).map(function(i){return document.getElementById(i)}).filter(Boolean),vis={};
 var set=function(){var cur=null;hs.forEach(function(h){if(vis[h.id])cur=cur||h.id});
  if(!cur){var best=null;hs.forEach(function(h){if(h.getBoundingClientRect().top<150)best=h.id});cur=best}
  links.forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+cur)})};
 var io=new IntersectionObserver(function(es){es.forEach(function(e){vis[e.target.id]=e.isIntersecting});set()},{rootMargin:'-90px 0px -65% 0px'});
 hs.forEach(function(h){io.observe(h)});set();
}
var m=document.querySelector('.toc-m');
if(m)m.addEventListener('click',function(e){if(e.target.closest('a'))m.open=false});
[].forEach.call(document.querySelectorAll('[data-share]'),function(box){
 var st=box.querySelector('.shr__s'),url=location.origin+location.pathname,t,
 say=function(x){if(st){st.textContent=x;clearTimeout(t);t=setTimeout(function(){st.textContent=''},2200)}},
 nb=box.querySelector('[data-native]'),cb=box.querySelector('[data-copy]');
 if(nb&&navigator.share){nb.hidden=false;nb.addEventListener('click',function(){navigator.share({title:document.title,url:url}).catch(function(){})})}
 if(cb)cb.addEventListener('click',function(){
  var done=function(){say('Copied')},fb=function(){var i=document.createElement('input');i.value=url;i.style.cssText='position:fixed;opacity:0';document.body.appendChild(i);i.select();try{document.execCommand('copy');done()}catch(e){say('Copy failed')}i.remove()};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(url).then(done,fb);else fb()});
});
})();
