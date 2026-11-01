/* Zentorum Agency · /projects/: filters + lazy video (one plays at a time) + showreel. */
(function(){
  var calm=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saver=navigator.connection&&navigator.connection.saveData;
  var cards=[].slice.call(document.querySelectorAll('.pc'));
  var bar=document.getElementById('filters');
  var dd=null,ddFor=null;
  function apply(f){
    [].forEach.call(bar.querySelectorAll('button'),function(x){x.setAttribute('aria-pressed',x.dataset.f===f)});
    cards.forEach(function(c){c.hidden=!(f==='all'||c.dataset.cat===f)});
    pick();
  }
  /* each category chip is also a dropdown listing that category's projects; picking one scrolls to it */
  function closeDD(){if(!dd||dd.hidden)return;dd.hidden=true;if(ddFor)ddFor.setAttribute('aria-expanded','false');ddFor=null}
  function openDD(b){
    var f=b.dataset.f,list=cards.filter(function(c){return c.dataset.cat===f});
    dd.innerHTML='<p class="fdd__h">'+b.textContent+' · '+list.length+' project'+(list.length===1?'':'s')+'</p>'+list.map(function(c){
      var t=c.querySelector('.pc__t').textContent,e=c.querySelector('.eyebrow');
      return '<a href="#'+c.id+'">'+t+(e?'<span>'+e.textContent+'</span>':'')+'</a>'}).join('');
    dd.hidden=false;ddFor=b;b.setAttribute('aria-expanded','true');
    var x=Math.min(b.offsetLeft,bar.clientWidth-dd.offsetWidth);dd.style.left=Math.max(0,x)+'px';
  }
  if(bar){
    bar.hidden=false;
    var used={};
    cards.forEach(function(c){var id='p-'+c.dataset.cat+'-'+c.querySelector('.pc__t').textContent.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');while(used[id])id+='-2';used[id]=1;c.id=id});
    dd=document.createElement('div');dd.className='fdd';dd.id='fdd';dd.hidden=true;bar.appendChild(dd);
    [].forEach.call(bar.querySelectorAll('button[data-f]:not([data-f="all"])'),function(b){
      b.setAttribute('aria-expanded','false');b.setAttribute('aria-controls','fdd');
      b.insertAdjacentHTML('beforeend','<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4l4 4 4-4"/></svg>');
    });
    bar.addEventListener('click',function(e){
      var a=e.target.closest('.fdd a');
      if(a){e.preventDefault();var c=document.getElementById(a.getAttribute('href').slice(1));closeDD();
        c.scrollIntoView({behavior:calm?'auto':'smooth',block:'center'});c.classList.remove('pc--hi');void c.offsetWidth;c.classList.add('pc--hi');return}
      var b=e.target.closest('button');if(!b)return;
      var f=b.dataset.f,again=ddFor===b;
      closeDD();apply(f);
      history.replaceState(null,'',f==='all'?location.pathname:'#'+f);
      if(f!=='all'&&!again)openDD(b);
    });
    document.addEventListener('click',function(e){if(!bar.contains(e.target))closeDD()});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&ddFor){var b=ddFor;closeDD();b.focus()}});
    var fromHash=function(){var f=location.hash.slice(1);if(/^(web|3d|video|logo|scratch)$/.test(f)){apply(f);bar.scrollIntoView({block:'start'})}else if(/^p-/.test(f)){var c=document.getElementById(f);if(c){apply('all');c.scrollIntoView({block:'center'})}}};
    addEventListener('hashchange',fromHash);
    if(location.hash)setTimeout(fromHash,0);
  }
  var items=[]; /* {el, vid, ratio} */
  function mk(el,vid,srcs){var it={el:el,vid:vid,srcs:srcs,ratio:0,loaded:false};items.push(it);return it}
  cards.forEach(function(c){var v=c.querySelector('video');if(v)mk(c.querySelector('.pc__m'),v,(v.dataset.webm?[[v.dataset.webm,'video/webm; codecs="vp9"']]:[]).concat([[v.dataset.src,'video/mp4']]))});
  var reel=document.getElementById('reel-v');
  if(reel)mk(reel.parentNode,reel,[[reel.dataset.webm,'video/webm; codecs="vp9"'],[reel.dataset.mp4,'video/mp4']]);
  /* every card in view loops like a gif; off-screen or filtered-out cards pause. Only one reel can have sound. */
  var loud=null;
  function snd(it,on){it.vid.muted=!on;var b=it.el.querySelector('.pc__snd');if(b)b.setAttribute('aria-pressed',on);if(on){if(loud&&loud!==it)snd(loud,false);loud=it}else if(loud===it)loud=null}
  function stop(it){if(!it.vid.paused)it.vid.pause();it.vid.classList.remove('on');if(loud===it)snd(it,false)}
  function play(it){
    var v=it.vid;
    if(!it.loaded){it.loaded=true;it.srcs.forEach(function(s){var e=document.createElement('source');e.src=s[0];e.type=s[1];v.appendChild(e)});v.load()}
    v.classList.add('on');if(!v.paused)return;
    var p=v.play();if(p&&p.catch)p.catch(function(){v.classList.remove('on')});
  }
  function pick(){items.forEach(function(it){var hid=!!it.el.closest('[hidden]');if(!auto||hid||it.ratio<.15){if(hid||it.ratio===0||auto)stop(it)}else play(it)})}
  var auto=!(calm||saver);
  /* sound toggle on reels with a voiceover: a tap plays that card (even with reduced motion) and turns its sound on or off */
  document.addEventListener('click',function(e){
    var b=e.target.closest('.pc__snd');if(!b)return;
    var it=items.filter(function(x){return x.el===b.parentNode})[0];if(!it)return;
    var on=it.vid.muted;play(it);snd(it,on);
  });
  if(!('IntersectionObserver' in window)){if(auto)items.forEach(play);return}
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){items.forEach(function(it){if(it.el===e.target)it.ratio=e.isIntersecting?e.intersectionRatio:0})});pick();
  },{threshold:[0,.15,.5,1]});
  items.forEach(function(it){io.observe(it.el)});
  document.addEventListener('visibilitychange',function(){if(document.hidden)items.forEach(stop);else pick()});
})();
