/* Free homepage mockup page: live before/after preview + request form (posts JSON to the shared form endpoint). */
(function(){
  var f=document.getElementById('fm');if(!f)return;
  var pv=document.getElementById('fm-pv'),vp=document.getElementById('fm-vp'),rng=document.getElementById('fm-rng'),nw=pv.querySelector('.fm__new');
  var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IND={
    salon:['Cuts · Colour · Shaves','Sharp cuts. Slow service.','Precision cuts and colour from people who listen. Book online in 30 seconds.','Book a chair','Online booking','Open late','Gift cards'],
    cafe:['Fresh every morning','Good coffee. Better mornings.','Seasonal food, slow coffee and a table waiting for you.','Order ahead','Order ahead','Today’s menu','Private events'],
    dental:['New patients welcome','Healthy smiles, zero stress.','Gentle care, clear prices and same-week appointments.','Book a check-up','Same-week visits','Insurance accepted','Clear prices'],
    build:['Licensed · Insured','Built right. On time.','Kitchens, roofs and full renovations with a fixed quote up front.','Free estimate','Fixed quotes','Licensed & insured','Before & after'],
    fit:['First class free','Stronger every week.','Classes, coaching and a crew that keeps you showing up.','Start free','Class schedule','Personal coaching','Member stories'],
    estate:['Homes · Rentals · Advice','Find the one.','Local agents, honest advice and homes you won’t see anywhere else.','Book a viewing','New listings','Free valuation','Area guides'],
    store:['New drop is live','Made to be loved.','Small-batch products, fast shipping and easy returns.','Shop now','Free shipping','Easy returns','Real reviews'],
    detail:['Mobile detailing','Showroom shine. At your door.','Ceramic coating, interior detail and paint correction where you park.','Book a detail','We come to you','Ceramic coating','Before & after'],
    other:['Welcome','Your business, at its best.','A clear headline, the right photo and one easy next step for every visitor.','Get in touch','Fast replies','Clear prices','Real reviews']
  };
    var VIBE={lux:'#d9b36c',bold:'#ff5a36',min:'#1f9d6b',fun:'#ff7ab6'};
  var LBL={lux:'Luxury',bold:'Bold',min:'Minimal',fun:'Playful'};
  function q(n){var x=f.querySelector('input[name='+n+']:checked');return x?x.value:''}
  function set(k,v){pv.querySelectorAll('[data-fm='+k+']').forEach(function(e){e.textContent=v})}
  function lum(h){var c=[1,3,5].map(function(i){var v=parseInt(h.substr(i,2),16)/255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*c[0]+.7152*c[1]+.0722*c[2]}
  function bizName(){return (f.elements.biz.value||'').trim().replace(/\s+/g,' ')}
  var last='';
  function draw(pop){
    var name=bizName()||'Your Business',ind=q('ind')||'other',vibe=q('vibe')||'lux',col=q('col');
    var t=IND[ind],ac=col&&col!=='auto'?col:VIBE[vibe];
    pv.dataset.vibe=vibe;pv.dataset.ind=ind;
    nw.style.setProperty('--ac',ac);nw.style.setProperty('--on',lum(ac)>.36?'#141014':'#fff');
    set('name',name);set('url',(name.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'')||'yourbusiness')+'.com');
    set('ey',t[0]);set('h',t[1]);set('p',t[2]);set('cta',t[3]);set('f1',t[4]);set('f2',t[5]);set('f3',t[6]);
    var im=pv.querySelector('[data-fm=img]'),src='/assets/zta-fm-'+ind+'.webp';
    if(im.getAttribute('src')!==src){im.style.opacity=0;var n=new Image();n.onload=n.onerror=function(){im.src=src;im.style.opacity=1};n.src=src}
    var key=name+ind+vibe;
    if(pop&&key!==last&&!RM){nw.classList.remove('is-pop');void nw.offsetWidth;nw.classList.add('is-pop')}
    last=key;
  }
  f.addEventListener('input',function(e){if(e.target!==rng)draw(e.target.type==='radio')});
  draw(false);
  // preload the other industry photos once the visitor starts choosing
  f.querySelector('#fm-ind').addEventListener('pointerenter',function(){Object.keys(IND).forEach(function(k){(new Image()).src='/assets/zta-fm-'+k+'.webp'})},{once:true});

  /* before/after slider: pointer drag on the frame, arrow keys on the hidden range */
  var X=40;
  function put(x){X=Math.max(0,Math.min(100,x));vp.style.setProperty('--x',X+'%');rng.value=Math.round(X);rng.setAttribute('aria-valuetext',Math.round(100-X)+'% preview shown')}
  var drag=null;
  vp.addEventListener('pointerdown',function(e){if(e.button)return;drag={id:e.pointerId,sx:e.clientX,sy:e.clientY,on:e.pointerType==='mouse'};if(drag.on){vp.setPointerCapture(e.pointerId);move(e)}stopIntro()});
  vp.addEventListener('pointermove',function(e){
    if(!drag||e.pointerId!==drag.id)return;
    if(!drag.on){var dx=Math.abs(e.clientX-drag.sx),dy=Math.abs(e.clientY-drag.sy);if(dy>dx&&dy>6){drag=null;return}if(dx>6){drag.on=true;try{vp.setPointerCapture(e.pointerId)}catch(_){}}}
    if(drag.on)move(e);
  });
  function end(e){if(drag&&!drag.on&&e.type==='pointerup')move(e);drag=null}
  vp.addEventListener('pointerup',end);vp.addEventListener('pointercancel',function(){drag=null});
  function move(e){var r=vp.getBoundingClientRect();put((e.clientX-r.left)/r.width*100)}
  rng.addEventListener('input',function(){stopIntro();put(+rng.value)});
  vp.addEventListener('click',function(){rng.focus({preventScroll:true})});
  put(40);

  /* intro: the handle sweeps once when the preview first comes into view */
  var raf=0;
  function stopIntro(){cancelAnimationFrame(raf);raf=-1}
  if(!RM&&'IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){
      if(!es[0].isIntersecting)return;io.disconnect();if(raf===-1)return;
      var t0=performance.now(),K=[[0,40],[700,12],[1500,80],[2300,40]];
      (function tick(now){
        if(raf===-1)return;var t=now-t0,i=1;while(i<K.length-1&&t>K[i][0])i++;
        var a=K[i-1],b=K[i],u=Math.min(1,Math.max(0,(t-a[0])/(b[0]-a[0]))),e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
        put(a[1]+(b[1]-a[1])*e);if(t<K[K.length-1][0])raf=requestAnimationFrame(tick);
      })(t0);
    },{threshold:.6});
    setTimeout(function(){io.observe(vp)},600);
  }

  /* send */
  var t0=Date.now(),msg=document.getElementById('fm-msg'),btn=f.querySelector('button[type=submit]');
  function say(t,c){msg.textContent=t;msg.className='msg '+(c||'')}
  f.addEventListener('submit',function(e){
    e.preventDefault();
    var g=function(n){return (f.elements[n].value||'').trim()};
    var biz=bizName(),name=g('name'),email=g('email');
    if(biz.length<2){say('Please add your business name.','err');f.elements.biz.focus();return}
    if(name.length<2){say('Please tell us your name.','err');f.elements.name.focus();return}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){say('That email does not look right.','err');f.elements.email.focus();return}
    var ind=f.querySelector('input[name=ind]:checked'),col=q('col');
    var opt=[ind?ind.nextElementSibling.textContent:'',LBL[q('vibe')]||'',col==='auto'?'auto colour':(f.querySelector('input[name=col]:checked').getAttribute('aria-label')+' '+col)].join(' · ');
    var data={name:name,email:email,website:g('site').slice(0,120),services:('Free mockup: '+biz+' · '+opt).slice(0,200),dream:('FREE HOMEPAGE MOCKUP\nBusiness: '+biz+'\nPicked: '+opt+'\n\n'+g('note')).slice(0,900),botcheck:f.elements.botcheck.value,page:location.href.split(/[?#]/)[0],referrer:document.referrer.slice(0,200)};
    if(data.botcheck){done(biz);return}
    btn.disabled=true;say('Sending...');
    var wait=Math.max(0,4100-(Date.now()-t0));
    setTimeout(function(){
      data.t=Date.now()-t0;
      var ac=new AbortController(),to=setTimeout(function(){ac.abort()},25000);
      fetch(f.dataset.endpoint,{method:'POST',body:JSON.stringify(data),signal:ac.signal,redirect:'follow'})
        .then(function(r){return r.json().then(function(j){return{r:r,j:j}},function(){return{r:r,j:{}}})})
        .then(function(x){if(!x.r.ok||!x.j.ok)throw new Error(x.j.error||'fail');done(biz)})
        .catch(function(){btn.disabled=false;say('We could not send that just now. Please try again, or email zentorum1@gmail.com.','err')})
        .then(function(){clearTimeout(to)});
    },wait);
  });
  function done(biz){
    var ok=document.getElementById('fm-ok');ok.querySelector('[data-fm=name]').textContent=biz+'’s';
    f.hidden=true;ok.hidden=false;ok.focus();ok.scrollIntoView({block:'start',behavior:RM?'auto':'smooth'});
  }
})();
