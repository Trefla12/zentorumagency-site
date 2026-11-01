/* Zentorum Agency · sitewide extras: text-us button, spotlight, "dream" easter egg. No dependencies. */
(function(){
  var d=document,w=window,b=d.body,mm=function(q){return w.matchMedia&&matchMedia(q).matches};
  var calm=mm('(prefers-reduced-motion: reduce)');
  /* 1. Text us (phones only, CSS hides it on desktop) */
  if(!d.querySelector('.zx-sms')){
    var ua=navigator.userAgent,sep=/iPhone|iPad|Mac/.test(ua)?'&':'?';
    var a=d.createElement('a');a.className='zx-sms';
    a.href='sms:+15122415531'+sep+'body='+encodeURIComponent("Hi Zentorum, I have a dream idea: ");
    a.setAttribute('aria-label','Text us at 512-241-5531');
    a.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5z"/><path d="M8 9h8M8 12h5"/></svg><span>Text us</span>';
    b.appendChild(a);
  }
  /* 2. Gold spotlight: follows the cursor on desktop, phone tilt on Android (iOS needs a permission prompt, so it is skipped) */
  if(!calm){
    var s=d.createElement('div');s.className='zx-spot';s.setAttribute('aria-hidden','true');b.appendChild(s);
    var x=50,y=30,raf=0,set=function(){raf=0;s.style.setProperty('--zx-x',x+'%');s.style.setProperty('--zx-y',y+'%')};
    var q=function(){if(!raf)raf=requestAnimationFrame(set)};
    if(mm('(pointer: fine)')){
      w.addEventListener('pointermove',function(e){x=e.clientX/innerWidth*100;y=e.clientY/innerHeight*100;s.classList.add('on');q()},{passive:true});
      d.documentElement.addEventListener('mouseleave',function(){s.classList.remove('on')});
    }else if(w.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission!=='function'){
      w.addEventListener('deviceorientation',function(e){if(e.gamma==null)return;x=50+Math.max(-30,Math.min(30,e.gamma))*1.4;y=35+Math.max(-30,Math.min(30,(e.beta||45)-45))*1.2;s.classList.add('on');q()},{passive:true});
    }
  }
  /* 3. Easter egg: type "dream" anywhere (not in a form field) */
  var buf='',shown=0;
  d.addEventListener('keydown',function(e){
    var t=e.target;if(t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))return;
    if(!e.key||e.key.length!==1)return;
    buf=(buf+e.key.toLowerCase()).slice(-5);
    if(buf==='dream'&&!shown){shown=1;egg()}
  });
  function egg(){
    var last=d.activeElement;
    if(!calm)confetti();
    var m=d.createElement('div');m.className='zx-egg';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-labelledby','zx-egg-h');
    m.innerHTML='<p class="zx-egg__k">You found it</p><h2 id="zx-egg-h">Dreamers get <em style="color:#e6c98c">10% off</em></h2><p class="zx-egg__s">Use this code on your first project. One per client.</p><button class="zx-egg__c" type="button" aria-label="Copy code DREAM">DREAM</button><p class="zx-egg__s" aria-live="polite">Tap the code to copy it.</p><div class="zx-egg__a"><a href="/contact/?code=DREAM">Claim it</a><button type="button" data-x>Close</button></div>';
    b.appendChild(m);requestAnimationFrame(function(){m.classList.add('on')});
    var code=m.querySelector('.zx-egg__c'),msg=m.querySelectorAll('.zx-egg__s')[1];
    code.addEventListener('click',function(){try{navigator.clipboard.writeText('DREAM').then(function(){msg.textContent='Copied. Paste it in your message.'})}catch(_){msg.textContent='Your code: DREAM'}});
    var close=function(){m.classList.remove('on');setTimeout(function(){m.remove();shown=0;if(last&&last.focus)last.focus()},400);d.removeEventListener('keydown',esc)};
    var esc=function(e){if(e.key==='Escape')return close();if(e.key!=='Tab')return;var f=m.querySelectorAll('button,a[href]'),a=f[0],z=f[f.length-1],ae=d.activeElement;if(!m.contains(ae)){e.preventDefault();a.focus()}else if(e.shiftKey&&ae===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&ae===z){e.preventDefault();a.focus()}};
    d.addEventListener('keydown',esc);m.querySelector('[data-x]').addEventListener('click',close);
    code.focus();
    try{sessionStorage.setItem('zta-code','DREAM')}catch(_){}
  }
  function confetti(){
    var c=d.createElement('canvas'),x=c.getContext('2d'),dp=Math.min(2,w.devicePixelRatio||1),W=innerWidth,H=innerHeight;
    c.className='zx-cf';c.width=W*dp;c.height=H*dp;x.scale(dp,dp);b.appendChild(c);
    var cols=['#e6c98c','#fff6df','#c9a565','#b8924c','#F7ECD6'],P=[],i,n=W<700?110:180;
    for(i=0;i<n;i++)P.push({x:W/2+(Math.random()-.5)*80,y:H*.55,vx:(Math.random()-.5)*14,vy:-Math.random()*16-6,r:Math.random()*6+3,a:Math.random()*6.3,va:(Math.random()-.5)*.3,c:cols[i%5],s:Math.random()<.5});
    var t0=performance.now();
    (function f(t){var k=(t-t0)/1000;x.clearRect(0,0,W,H);
      P.forEach(function(p){p.vy+=.38;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.a+=p.va;x.save();x.translate(p.x,p.y);x.rotate(p.a);x.globalAlpha=Math.max(0,1-k/3.2);x.fillStyle=p.c;
        if(p.s)x.fillRect(-p.r,-p.r/3,p.r*2,p.r/1.5);else{x.beginPath();x.arc(0,0,p.r/2,0,6.3);x.fill()}x.restore()});
      if(k<3.2)requestAnimationFrame(f);else c.remove()})(t0);
  }
})();
/* contact form: carry a found code into the message box */
(function(){
  var f=document.getElementById('f-dream');if(!f)return;
  var c=/[?&]code=DREAM\b/i.test(location.search)?'DREAM':'';try{c=c||sessionStorage.getItem('zta-code')||''}catch(_){}
  if(c&&!f.value)f.value='Code '+c+' (10% off). My idea: ';
})();

/* 7. Gold cursor on every page (same look as the homepage). Home + contact run it from zta-agency.js. */
(function(){
  var d=document,w=window,r=d.documentElement;
  if(!w.matchMedia||!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
  var cur=d.querySelector('.cursor');
  if(!cur){cur=d.createElement('div');cur.className='cursor';cur.setAttribute('aria-hidden','true');cur.innerHTML='<span class="cursor__dot"></span><span class="cursor__ring"><em data-cursor-label></em></span>';d.body.appendChild(cur)}
  r.classList.add('zx-cur');
  r.addEventListener('mouseleave',function(){cur.classList.add('is-out')});
  r.addEventListener('mouseenter',function(){cur.classList.remove('is-out')});
  if(d.querySelector('script[src*="zta-agency.js"]'))return;
  var dot=cur.querySelector('.cursor__dot'),ring=cur.querySelector('.cursor__ring'),lab=cur.querySelector('[data-cursor-label]');
  var calm=matchMedia('(prefers-reduced-motion: reduce)').matches,mx=-99,my=-99,rx=mx,ry=my,on=0;
  var tick=function(){rx+=(mx-rx)*.18;ry+=(my-ry)*.18;ring.style.transform='translate('+rx+'px,'+ry+'px)';if(Math.abs(mx-rx)+Math.abs(my-ry)>.2)requestAnimationFrame(tick);else on=0};
  addEventListener('pointermove',function(e){if(e.pointerType&&e.pointerType!=='mouse')return;mx=e.clientX;my=e.clientY;dot.style.transform='translate('+mx+'px,'+my+'px)';if(calm){rx=mx;ry=my;ring.style.transform=dot.style.transform}else if(!on){on=1;requestAnimationFrame(tick)}},{passive:true});
  d.addEventListener('pointerover',function(e){var t=e.target.closest&&e.target.closest('[data-cursor]');if(t){lab.textContent=t.getAttribute('data-cursor');cur.classList.add('is-big')}});
  d.addEventListener('pointerout',function(e){var t=e.target.closest&&e.target.closest('[data-cursor]');if(t&&!t.contains(e.relatedTarget))cur.classList.remove('is-big')});
})();
