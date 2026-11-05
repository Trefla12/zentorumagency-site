// External booking/ticket page: every [data-book] link opens it in a new tab.
var BOOKING_URL='https://www.eventbrite.com/e/luis-gabriel-live-a-night-above-chicago-tickets-2004410465660';
// Doors: 23 Jan 2027, 7 PM Chicago time (CST, UTC-6).
var DOORS=Date.UTC(2027,0,24,1,0,0);
(function(){
  var calm=matchMedia('(prefers-reduced-motion:reduce)').matches;
  var fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  document.querySelectorAll('[data-book]').forEach(function(a){a.href=BOOKING_URL;a.target='_blank';a.rel='noopener';a.setAttribute('aria-label','Book now on Eventbrite (opens in a new tab)');});

  // Headline: split into letters for the blur-in reveal.
  var n=0;
  document.querySelectorAll('h1 .ln').forEach(function(l){
    var t=l.textContent;l.textContent='';l.setAttribute('aria-hidden','true');
    t.split('').forEach(function(c){var s=document.createElement('span');s.className='ch';s.style.setProperty('--i',n++);s.textContent=c;l.appendChild(s);});
  });

  // Countdown to doors.
  var box=document.querySelector('.count');
  if(box){
    var f={};['d','h','m','s'].forEach(function(k){f[k]=box.querySelector('[data-c='+k+']');});
    var p=function(v){return v<10?'0'+v:''+v;};
    var tick=function(){
      var r=DOORS-Date.now();
      if(r<=0){box.hidden=true;clearInterval(id);return;}
      box.hidden=false;
      f.d.textContent=p(Math.floor(r/864e5));f.h.textContent=p(Math.floor(r/36e5)%24);
      f.m.textContent=p(Math.floor(r/6e4)%60);f.s.textContent=p(Math.floor(r/1e3)%60);
    };
    var id=setInterval(tick,1000);tick();
  }

  // Scroll: progress bar and gallery parallax.
  var root=document.documentElement,shots=document.querySelectorAll('[data-par]'),busy=false;
  var bar=document.querySelector('.bar'),heroCta=document.querySelector('.hero .cta');
  var onScroll=function(){
    busy=false;
    root.style.setProperty('--sp',(scrollY/Math.max(1,root.scrollHeight-innerHeight)).toFixed(4));
    // Mobile bar appears once the hero button has scrolled away.
    if(bar&&heroCta)bar.classList.toggle('on',heroCta.getBoundingClientRect().bottom<0);
    if(calm||innerWidth<=820)return;
    shots.forEach(function(s){
      var b=s.getBoundingClientRect(),v=(b.top+b.height/2-innerHeight/2)*parseFloat(s.dataset.par);
      s.style.setProperty('--py',Math.max(-28,Math.min(28,v)).toFixed(1)+'px');
    });
  };
  addEventListener('scroll',function(){if(!busy){busy=true;requestAnimationFrame(onScroll);}},{passive:true});
  onScroll();

  // Pointer effects: tile spotlight, portrait tilt, magnetic buttons.
  if(fine&&!calm){
    document.querySelectorAll('.tile').forEach(function(t){
      t.addEventListener('pointermove',function(e){var b=t.getBoundingClientRect();t.style.setProperty('--mx',(e.clientX-b.left)+'px');t.style.setProperty('--my',(e.clientY-b.top)+'px');});
    });
    var fr=document.querySelector('[data-tilt]');
    if(fr){
      fr.addEventListener('pointermove',function(e){
        var b=fr.getBoundingClientRect(),x=(e.clientX-b.left)/b.width,y=(e.clientY-b.top)/b.height;
        fr.style.setProperty('--ry',((x-.5)*12).toFixed(2)+'deg');fr.style.setProperty('--rx',((.5-y)*12).toFixed(2)+'deg');
        fr.style.setProperty('--px',(x*100)+'%');fr.style.setProperty('--py',(y*100)+'%');
      });
      fr.addEventListener('pointerleave',function(){fr.style.setProperty('--ry','0deg');fr.style.setProperty('--rx','0deg');});
    }
    document.querySelectorAll('[data-magnet]').forEach(function(m){
      m.style.transition='transform .3s ease-out,box-shadow .35s';
      m.addEventListener('pointermove',function(e){var b=m.getBoundingClientRect();m.style.transform='translate('+((e.clientX-b.left-b.width/2)*.18)+'px,'+((e.clientY-b.top-b.height/2)*.3)+'px)';});
      m.addEventListener('pointerleave',function(){m.style.transform='';});
    });
  }

  // Gold dust: drifts upward, pushed gently away from the pointer.
  var cv=document.querySelector('.dust');
  if(cv&&!calm){
    var cx=cv.getContext('2d'),W,H,D=Math.min(devicePixelRatio||1,2),ps=[],mx=-999,my=-999;
    var size=function(){W=innerWidth;H=innerHeight;cv.width=W*D;cv.height=H*D;cx.setTransform(D,0,0,D,0,0);};
    size();addEventListener('resize',function(){if(innerWidth!==W)size();});
    if(fine)addEventListener('pointermove',function(e){mx=e.clientX;my=e.clientY;},{passive:true});
    for(var i=0,c=W<820?34:70;i<c;i++)ps.push({x:Math.random()*W,y:Math.random()*H,r:.5+Math.random()*1.7,v:.12+Math.random()*.4,a:.15+Math.random()*.5,o:Math.random()*6.28});
    var draw=function(){
      if(!document.hidden){
        cx.clearRect(0,0,W,H);
        ps.forEach(function(q){
          q.y-=q.v;q.o+=.01;q.x+=Math.sin(q.o)*.25;
          var dx=q.x-mx,dy=q.y-my,d=dx*dx+dy*dy;
          if(d<14400){q.x+=dx/90;q.y+=dy/90;}
          if(q.y<-6){q.y=H+6;q.x=Math.random()*W;}
          cx.globalAlpha=q.a*(.65+.35*Math.sin(q.o*3));cx.fillStyle='#e6c98a';
          cx.beginPath();cx.arc(q.x,q.y,q.r,0,6.283);cx.fill();
        });
      }
      requestAnimationFrame(draw);
    };
    draw();
  }

  // Reveal on scroll.
  var els=document.querySelectorAll('.rv,.rule');
  if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in');});return;}
  var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}});},{threshold:.15});
  els.forEach(function(e){io.observe(e);});
})();
