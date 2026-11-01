/* Zentorum Agency · /work/: filters + lazy video (one plays at a time) + showreel. */
(function(){
  var calm=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saver=navigator.connection&&navigator.connection.saveData;
  var cards=[].slice.call(document.querySelectorAll('.pc'));
  var bar=document.getElementById('filters');
  if(bar){
    bar.hidden=false;
    bar.addEventListener('click',function(e){
      var b=e.target.closest('button');if(!b)return;
      [].forEach.call(bar.querySelectorAll('button'),function(x){x.setAttribute('aria-pressed',x===b)});
      var f=b.dataset.f;
      cards.forEach(function(c){c.hidden=!(f==='all'||c.dataset.cat===f)});
      pick();
    });
  }
  var items=[]; /* {el, vid, ratio} */
  function mk(el,vid,srcs){var it={el:el,vid:vid,srcs:srcs,ratio:0,loaded:false};items.push(it);return it}
  cards.forEach(function(c){var v=c.querySelector('video');if(v)mk(c.querySelector('.pc__m'),v,[[v.dataset.src,'video/mp4']])});
  var reel=document.getElementById('reel-v');
  if(reel)mk(reel.parentNode,reel,[[reel.dataset.webm,'video/webm; codecs="vp9"'],[reel.dataset.mp4,'video/mp4']]);
  var cur=null;
  function stop(it){if(it&&it.vid){it.vid.pause();it.vid.classList.remove('on')}}
  function play(it){
    if(cur===it)return;stop(cur);cur=it;
    var v=it.vid;
    if(!it.loaded){it.loaded=true;it.srcs.forEach(function(s){var e=document.createElement('source');e.src=s[0];e.type=s[1];v.appendChild(e)});v.load()}
    var p=v.play();v.classList.add('on');
    if(p&&p.catch)p.catch(function(){v.classList.remove('on')});
  }
  function pick(){
    var best=null;
    items.forEach(function(it){if(it.ratio>=.55&&!it.el.closest('[hidden]')&&(!best||it.ratio>best.ratio))best=it});
    if(best)play(best);else{stop(cur);cur=null}
  }
  if(calm||saver||!('IntersectionObserver' in window))return;
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){items.forEach(function(it){if(it.el===e.target)it.ratio=e.isIntersecting?e.intersectionRatio:0})});pick();
  },{threshold:[0,.25,.55,.75,1]});
  items.forEach(function(it){io.observe(it.el)});
  document.addEventListener('visibilitychange',function(){if(document.hidden){stop(cur);cur=null}else pick()});
})();
