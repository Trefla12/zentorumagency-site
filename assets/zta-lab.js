/* Zentorum Agency · /playground/: sketch-to-site slider and services orbit. No libraries. */
(function(){
  var calm=matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- sketch → site ---------- */
  var sk=document.querySelector('[data-skm]');
  if(sk){
    var view=sk.querySelector('.skm__view'),rng=sk.querySelector('.skm__r'),tagS=sk.querySelector('.skm__tag--s'),tagF=sk.querySelector('.skm__tag--f');
    var x=100,anim=0;
    sk.querySelectorAll('.skm__p > *').forEach(function(p,i){p.style.setProperty('--d',Math.round(i*22))});
    function set(v){
      x=Math.max(0,Math.min(100,v));sk.style.setProperty('--x',x+'%');
      rng.value=Math.round(x);rng.setAttribute('aria-valuetext',Math.round(x)+'% sketch, '+(100-Math.round(x))+'% finished site');
      tagS.style.opacity=x>12?1:0;tagF.style.opacity=x<88?1:0;
    }
    function tween(to,ms){
      cancelAnimationFrame(anim);
      if(calm){set(to);return}
      var from=x,t0=performance.now();
      (function step(t){var k=Math.min((t-t0)/ms,1);k=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;set(from+(to-from)*k);if(k<1)anim=requestAnimationFrame(step)})(t0);
    }
    set(100);
    var played=false;
    new IntersectionObserver(function(es,o){
      if(!es[0].isIntersecting||played)return;played=true;o.disconnect();
      sk.classList.add('is-in');
      setTimeout(function(){tween(38,1800)},calm?0:2100);
    },{threshold:.45}).observe(sk);
    var drag=false;
    function at(e){var r=view.getBoundingClientRect();return(e.clientX-r.left)/r.width*100}
    view.addEventListener('pointerdown',function(e){drag=true;played=true;sk.classList.add('is-in');cancelAnimationFrame(anim);view.setPointerCapture(e.pointerId);set(at(e))});
    view.addEventListener('pointermove',function(e){if(drag)set(at(e))});
    ['pointerup','pointercancel'].forEach(function(n){view.addEventListener(n,function(){drag=false})});
    rng.addEventListener('input',function(){played=true;sk.classList.add('is-in');cancelAnimationFrame(anim);set(+rng.value)});
  }

  /* ---------- services orbit ---------- */
  var orb=document.querySelector('[data-orb]');
  if(orb){
    var cards=[].slice.call(orb.querySelectorAll('.orb__c')),n=cards.length;
    var info=document.querySelector('[data-orb-info]'),say=document.querySelector('[data-orb-say]');
    var base=0,vel=0,R=340,KY=.34,running=false,hover=false,dragO=false,lastX=0,moved=0,front=-1,target=null,raf=0,visible=false;
    function size(){var m=innerWidth<700;KY=m?.5:.34;R=Math.min(orb.clientWidth*(m?.37:.38),380);orb.style.setProperty('--R',R+'px');orb.style.setProperty('--ky',KY)}
    function show(i){
      if(i===front)return;front=i;
      cards.forEach(function(c,k){c.classList.toggle('is-front',k===i)});
      var c=cards[i];
      info.innerHTML='<h3>'+c.dataset.n+'</h3><p>'+c.dataset.d+'</p><a class="link" href="'+c.getAttribute('href')+'">See prices and details →</a>';
    }
    function layout(){
      var best=-2,bi=0,m=innerWidth<700;
      for(var i=0;i<n;i++){
        var a=base+i*Math.PI*2/n,s=Math.sin(a),c=Math.cos(a);
        var d=(c+1)/2,sc=.62+.38*d;
        cards[i].style.transform='translate3d('+(s*R).toFixed(1)+'px,'+(c*R*KY+(m?26:30)-(1-d)*14).toFixed(1)+'px,0) scale('+sc.toFixed(3)+')';
        cards[i].style.opacity=(.38+.62*d).toFixed(3);
        cards[i].style.zIndex=c>0?60+Math.round(d*40):Math.round(d*40);
        if(c>best){best=c;bi=i}
      }
      show(bi);
    }
    function tick(){
      raf=0;
      if(target!==null){
        var diff=target-base;base+=diff*.12;if(Math.abs(diff)<.001){base=target;target=null}
      }else if(!dragO){
        vel*=.94;base+=vel;
        if(!calm&&!hover&&Math.abs(vel)<.002)base+=.0026;
      }
      layout();
      if(visible&&(target!==null||dragO||!calm&&!hover||Math.abs(vel)>.0005))raf=requestAnimationFrame(tick);
    }
    function wake(){if(!raf&&visible)raf=requestAnimationFrame(tick)}
    function focusCard(i){
      if(say)say.textContent=cards[i].dataset.n+': '+cards[i].dataset.d;
      var want=-i*Math.PI*2/n,k=Math.round((base-want)/(Math.PI*2));target=want+k*Math.PI*2;vel=0;wake();
    }
    size();layout();
    addEventListener('resize',function(){size();layout()});
    new IntersectionObserver(function(es){visible=es[0].isIntersecting;if(visible)wake()}).observe(orb);
    orb.addEventListener('pointerdown',function(e){dragO=true;moved=0;lastX=e.clientX;vel=0;target=null;orb.classList.add('is-drag');wake()});
    addEventListener('pointermove',function(e){if(!dragO)return;var dx=e.clientX-lastX;lastX=e.clientX;moved+=Math.abs(dx);vel=dx/R*.9;base+=vel});
    addEventListener('pointerup',function(){if(!dragO)return;dragO=false;orb.classList.remove('is-drag');wake()});
    cards.forEach(function(c,i){
      c.addEventListener('click',function(e){
        if(moved>6&&e.detail!==0){e.preventDefault();return}
        if(i!==front){e.preventDefault();focusCard(i)}
      });
      c.addEventListener('focus',function(){focusCard(i)});
      c.addEventListener('dragstart',function(e){e.preventDefault()});
    });
    orb.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse'){hover=true}});
    orb.addEventListener('pointerleave',function(){hover=false;wake()});
  }
})();
