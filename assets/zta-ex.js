/* Exploded 3D product view (/services/3d/): scroll pulls the candle apart, numbered dots and the legend explain each part.
   Three.js loads only near the section; the poster image and the text legend work without it. */
(function(){
  var sec=document.getElementById('explode');if(!sec)return;
  var view=document.getElementById('ex-view'),lg=[].slice.call(sec.querySelectorAll('.ex__lg button')),dots=[].slice.call(view.querySelectorAll('.ex__dots span'));
  var tg=sec.querySelector('.ex__tg'),now=sec.querySelector('.ex__now'),RM=matchMedia('(prefers-reduced-motion: reduce)');
  /* parts top to bottom, matching the legend: mesh name, lift when exploded, radial scale, anchor height and radius, stagger order */
  var P=[{n:'Lid',dy:1.42,ay:1,ar:.515,o:0,tilt:.22},{n:'Wick',dy:1.2,ay:.86,ar:.03,o:1},{n:'Wax',dy:1,ay:.45,ar:.445,o:2},
         {n:'Band',dy:0,s:1.32,ay:.4,ar:.503,o:3},{n:'Glass',dy:0,ay:.18,ar:.5,o:5},{n:'Pedestal',dy:-.45,ay:-.1,ar:.97,o:4}];
  var HOLD=.62,p=0,manual=-1,active=-2,stat=false,exT=0,exV=0;
  function clamp(x){return x<0?0:x>1?1:x}
  function ease(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2}
  function isStatic(){return RM.matches||innerHeight<520}
  function mode(){stat=isStatic();sec.classList.toggle('ex--static',stat);if(tg)tg.hidden=!stat;read()}
  function read(){
    if(stat){p=exV*HOLD;return}
    var r=sec.querySelector('.ex__track').getBoundingClientRect(),run=r.height-innerHeight;
    p=run>0?clamp(-r.top/run):0;
  }
  function slot(){return p<HOLD+.01?-1:Math.min(P.length-1,Math.floor((p-HOLD)/(1-HOLD)*P.length))}
  function setActive(i){
    if(i===active)return;active=i;
    lg.forEach(function(b,k){b.setAttribute('aria-current',k===i?'true':'false')});
    dots.forEach(function(d,k){d.classList.toggle('is-on',k===i)});
    if(api)api.dirty();
  }
  function sync(){
    var on=p>.04;sec.classList.toggle('is-open',p>=HOLD-.02);sec.classList.toggle('is-moving',on);
    setActive(manual>-1?manual:slot());
    if(now){var b=lg[active],t=b?b.querySelector('b').textContent+': '+b.querySelector('span').textContent+'.':(p>.04||exT?'Tap a number to see each part.':'Scroll down and it comes apart.');if(now.textContent!==t)now.textContent=t}
  }
  /* legend: in scroll mode jump to the part's spot in the story, in static mode explode and highlight */
  lg.forEach(function(b,i){b.addEventListener('click',function(){
    if(stat){manual=i;if(exT<1)explode(1);sync();return}
    var t=sec.querySelector('.ex__track'),r=t.getBoundingClientRect(),run=r.height-innerHeight;
    var y=scrollY+r.top+(HOLD+(i+.5)/P.length*(1-HOLD))*run;manual=-1;
    if(window.lenis)window.lenis.scrollTo(y,{duration:1.2});else scrollTo({top:y,behavior:'smooth'});
  })});
  function explode(to){exT=to;if(tg){tg.setAttribute('aria-pressed',to?'true':'false');tg.querySelector('span').textContent=to?'Put it back':'Take it apart'}
    if(!to)manual=-1;
    if(RM.matches||!api){exV=to;read();sync();if(api)api.dirty();return}
    api.dirty();}
  if(tg)tg.addEventListener('click',function(){explode(exT?0:1)});
  addEventListener('scroll',function(){if(stat)return;var o=p;read();if(o!==p){if(Math.abs(o-p)>.002&&manual>-1&&slot()!==manual)manual=-1;sync();if(api)api.dirty()}},{passive:true});
  addEventListener('resize',mode);RM.addEventListener&&RM.addEventListener('change',mode);
  mode();sync();

  var api=null,started=false;
  function start(){
    if(started)return;started=true;
    Promise.all([import('three'),import('three/addons/loaders/GLTFLoader.js'),import('three/addons/environments/RoomEnvironment.js')]).then(function(m){
      var T=m[0],GL=m[1].GLTFLoader,RE=m[2].RoomEnvironment;
      var cv=document.createElement('canvas');cv.className='ex__cv';cv.setAttribute('role','img');
      cv.setAttribute('aria-label','3D candle jar. Scroll to take it apart; drag sideways to turn it.');
      var r;try{r=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true,powerPreference:'default'})}catch(e){return}
      var small=Math.min(innerWidth,innerHeight)<700;
      r.setPixelRatio(Math.min(devicePixelRatio||1,small?1.75:2));r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.08;r.setClearColor(0,0);
      var sc=new T.Scene(),pm=new T.PMREMGenerator(r);sc.environment=pm.fromScene(new RE(),.04).texture;
      var cam=new T.PerspectiveCamera(30,1,.1,60);
      var key=new T.DirectionalLight(0xffe6c0,2.3);key.position.set(-3,5,4);sc.add(key);
      var rim=new T.DirectionalLight(0xb48cff,1.5);rim.position.set(3,2,-3);sc.add(rim);
      var grp=new T.Group();sc.add(grp);
      /* soft contact shadow under the stand */
      var sh=document.createElement('canvas');sh.width=sh.height=128;var g2=sh.getContext('2d'),gr=g2.createRadialGradient(64,64,4,64,64,64);
      gr.addColorStop(0,'rgba(0,0,0,.55)');gr.addColorStop(1,'rgba(0,0,0,0)');g2.fillStyle=gr;g2.fillRect(0,0,128,128);
      var shadow=new T.Mesh(new T.PlaneGeometry(2.9,2.9),new T.MeshBasicMaterial({map:new T.CanvasTexture(sh),transparent:true,depthWrite:false}));
      shadow.rotation.x=-Math.PI/2;sc.add(shadow);
      var parts=[],dirty=true,vis=false,rotY=-.55,vel=0,glow=new T.Color(0xe6c98c),t0=performance.now();
      api={dirty:function(){dirty=true;loop()}};
      function size(){var w=view.clientWidth,h=view.clientHeight;if(!w||!h)return;r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();dirty=true}
      new GL().load(view.dataset.model,function(gl){
        P.forEach(function(d){
          var o=gl.scene.getObjectByName(d.n);if(!o)return;
          o.traverse(function(x){if(x.isMesh){x.material=x.material.clone();x.userData.em=x.material.emissive?x.material.emissive.clone():null}});
          grp.add(o);parts.push({d:d,o:o,e:0});
        });
        view.appendChild(cv);size();
        requestAnimationFrame(function(){render();cv.classList.add('on');view.classList.add('is-3d')});
        loop();
      },undefined,function(){started=false});
      /* drag sideways to turn; vertical swipes keep scrolling the page */
      var drag=null;
      cv.addEventListener('pointerdown',function(e){drag={x:e.clientX,y:e.clientY,id:e.pointerId,on:e.pointerType==='mouse'};if(drag.on)cv.setPointerCapture(e.pointerId);vel=0});
      cv.addEventListener('pointermove',function(e){
        if(!drag||e.pointerId!==drag.id)return;var dx=e.clientX-drag.x;
        if(!drag.on){if(Math.abs(e.clientY-drag.y)>Math.abs(dx)&&Math.abs(e.clientY-drag.y)>6){drag=null;return}if(Math.abs(dx)>6){drag.on=true;try{cv.setPointerCapture(e.pointerId)}catch(_){}}else return}
        vel=dx*.012;rotY+=vel;drag.x=e.clientX;view.classList.add('was-dragged');api.dirty();
      });
      ['pointerup','pointercancel'].forEach(function(ev){cv.addEventListener(ev,function(){drag=null;api.dirty()})});
      addEventListener('resize',size);
      new IntersectionObserver(function(es){vis=es[0].isIntersecting;if(vis){size();loop()}}).observe(view);
      document.addEventListener('visibilitychange',function(){if(!document.hidden)loop()});
      var v=new T.Vector3(),right=new T.Vector3(),raf=0;
      function render(){
        if(stat&&exV!==exT){exV+=(exT-exV)*.12;if(Math.abs(exT-exV)<.002)exV=exT;read();sync();dirty=true}
        var k=clamp(p/HOLD),avg=0,now=performance.now();
        if(!drag&&Math.abs(vel)>.0005){vel*=.92;rotY+=vel;dirty=true}
        var spin=RM.matches?0:p*1.5;grp.rotation.y=rotY+spin;
        parts.forEach(function(x,i){
          var e=ease(clamp((k-x.d.o*.07)/.58));x.e=e;avg+=e;
          x.o.position.y=x.d.dy*e;var s=1+((x.d.s||1)-1)*e;x.o.scale.set(s,1,s);
          x.o.rotation.z=(x.d.tilt||0)*e;
          var on=i===active,pulse=on&&!RM.matches?.55+.45*Math.sin((now-t0)/260):on?1:0;
          x.o.traverse(function(m){if(m.isMesh&&m.material.emissive){m.material.emissive.copy(m.userData.em).lerp(glow,on?.18+.12*pulse:0)}});
        });
        avg/=parts.length||1;
        /* frame the whole stack: it grows from 1.3 to 3.2 units tall as it opens */
        var top=1.11,bot=-.2;parts.forEach(function(x){var b=x.d.n==='Lid'?.89:x.d.n==='Wick'?.74:x.d.n==='Wax'?.1:-1;if(b>-1)top=Math.max(top,b+x.d.dy*x.e+(x.d.n==='Lid'?.22:x.d.n==='Wick'?.16:.68));if(x.d.n==='Pedestal')bot=-.2+x.d.dy*x.e});
        var H=top-bot,cy=(top+bot)/2-H*.03,W=2.05,f=2*Math.tan(T.MathUtils.degToRad(cam.fov/2));
        var dist=Math.max(H/f,W/(f*cam.aspect))*(cam.aspect<.8?1.08:1.14),el=.26-.1*avg;
        cam.position.set(0,cy+Math.sin(el)*dist,Math.cos(el)*dist);cam.lookAt(0,cy,0);cam.updateMatrixWorld();
        var ped=parts[parts.length-1];shadow.position.y=(ped?ped.o.position.y:0)-.2-.002;
        r.render(sc,cam);dirty=false;
        /* numbered dots sit on the right edge of each part as the camera sees it */
        right.setFromMatrixColumn(cam.matrixWorld,0);
        var w=view.clientWidth,h=view.clientHeight;
        parts.forEach(function(x,i){
          var d=dots[i];if(!d)return;var s=1+((x.d.s||1)-1)*x.e;
          v.set(0,x.d.ay+x.o.position.y,0).addScaledVector(right,x.d.ar*s+.06).project(cam);
          d.style.transform='translate('+((v.x+1)/2*w).toFixed(1)+'px,'+((1-v.y)/2*h).toFixed(1)+'px)';
          d.style.opacity=x.e>.85?1:0;
        });
        return active>-1&&!RM.matches;
      }
      function loop(){
        if(raf||!vis||document.hidden)return;
        raf=requestAnimationFrame(function t(){
          raf=0;if(!vis||document.hidden)return;
          var keep=(dirty||Math.abs(vel)>.0005||(stat&&exV!==exT))?render():false;
          if(keep||dirty||Math.abs(vel)>.0005||(stat&&exV!==exT)){if(keep)dirty=true;raf=requestAnimationFrame(t)}
        });
      }
    }).catch(function(){started=false});
  }
  /* start only once the section is near AND the visitor has interacted (or 6 s passed), so the heavy WebGL setup never competes with first load */
  var seen=false,go=false;
  function tryStart(){if(seen&&go)start()}
  ['pointerdown','touchstart','scroll','keydown','pointermove'].forEach(function(ev){addEventListener(ev,function(){go=true;tryStart()},{once:true,passive:true})});
  setTimeout(function(){go=true;tryStart()},6000);
  if('IntersectionObserver' in window){var o=new IntersectionObserver(function(es){if(es[0].isIntersecting){o.disconnect();seen=true;tryStart()}},{rootMargin:'700px 0px'});o.observe(sec)}
  else{seen=true;tryStart()}
})();
