/* Zentorum Agency · /playground/ car configurator. Three.js + the Draco GLB load only when the stage is in view and
   the visitor has interacted (or after 6 s). The poster and the buttons work without it. */
(function(){
  var stage=document.getElementById('car-stage');if(!stage)return;
  var ui=document.querySelector('[data-car-ui]');
  var calm=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var save=navigator.connection&&navigator.connection.saveData;
  var FIN={gloss:{r:.3,m:.25,cc:1,ccr:.03},satin:{r:.48,m:.25,cc:.4,ccr:.3},matte:{r:.78,m:.1,cc:0,ccr:1}};
  var state={paint:'#9a0b14',finish:'gloss',rim:'#ffffff',spin:!calm};
  var api=null,started=false;
  var bar=stage.querySelector('.car__load i'),load=stage.querySelector('.car__load'),btn=stage.querySelector('.car__go');

  function press(group,el){group.querySelectorAll('button').forEach(function(b){b.setAttribute('aria-pressed',b===el?'true':'false')})}
  ui.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b)return;
    var g=b.closest('[data-g]'),k=g&&g.dataset.g;
    if(k==='paint'){state.paint=b.dataset.v;press(g,b);var nm=document.querySelector('[data-car-name]');if(nm)nm.textContent=b.getAttribute('aria-label')}
    else if(k==='finish'){state.finish=b.dataset.v;press(g,b)}
    else if(k==='rim'){state.rim=b.dataset.v;press(g,b)}
    else if(b.dataset.a==='spin'){state.spin=!state.spin;b.setAttribute('aria-pressed',state.spin)}
    else if(b.dataset.a==='reset'&&api){api.reset()}
    if(api)api.apply();else{go=true;tryStart()}
  });

  function start(){
    if(started)return;started=true;
    if(btn)btn.hidden=true;load.hidden=false;
    var A='three/addons/';
    Promise.all([import('three'),import(A+'controls/OrbitControls.js'),import(A+'loaders/GLTFLoader.js'),import(A+'loaders/DRACOLoader.js'),import(A+'environments/RoomEnvironment.js')]).then(function(m){
      var T=m[0],OC=m[1].OrbitControls,GL=m[2].GLTFLoader,DL=m[3].DRACOLoader,RE=m[4].RoomEnvironment;
      var cv=document.createElement('canvas');cv.className='car__cv';
      cv.tabIndex=0;cv.setAttribute('role','application');cv.setAttribute('aria-roledescription','3D viewer');cv.setAttribute('aria-label','Interactive 3D sports car. Drag or use the arrow keys to rotate, pinch, scroll or press plus and minus to zoom. Use the buttons to change paint, finish and wheels.');
      var r=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true,powerPreference:'high-performance'});
      r.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<700?1.75:2));r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=.92;
      var sc=new T.Scene(),pm=new T.PMREMGenerator(r);sc.environment=pm.fromScene(new RE(),.04).texture;sc.environmentIntensity=.55;
      var key=new T.DirectionalLight(0xfff0dc,2);key.position.set(4,6,3);sc.add(key);
      var rim=new T.DirectionalLight(0xc8a8ff,.7);rim.position.set(-5,3,-4);sc.add(rim);
      // soft contact shadow
      var sh=document.createElement('canvas');sh.width=sh.height=256;var x=sh.getContext('2d'),gr=x.createRadialGradient(128,128,10,128,128,128);
      gr.addColorStop(0,'rgba(0,0,0,.85)');gr.addColorStop(.55,'rgba(0,0,0,.45)');gr.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gr;x.fillRect(0,0,256,256);
      var shadow=new T.Mesh(new T.PlaneGeometry(5.6,2.9),new T.MeshBasicMaterial({map:new T.CanvasTexture(sh),transparent:true,depthWrite:false}));
      shadow.rotation.x=-Math.PI/2;shadow.position.y=.002;sc.add(shadow);
      var glow=new T.Mesh(new T.CircleGeometry(4.2,64),new T.MeshBasicMaterial({color:0xe6c98c,transparent:true,opacity:.03,depthWrite:false}));
      glow.rotation.x=-Math.PI/2;sc.add(glow);
      var cam=new T.PerspectiveCamera(30,1,.1,60);
      var ctl=new OC(cam,cv);ctl.enableDamping=!calm;ctl.dampingFactor=.07;ctl.enablePan=false;
      ctl.minPolarAngle=.45;ctl.maxPolarAngle=1.5;ctl.target.set(.2,.55,0);ctl.autoRotateSpeed=.9;
      var home=new T.Vector3(),dist=9;
      function fit(){var a=Math.min(cam.aspect,1.9);dist=(a<1.25?2.05:2.5)/(Math.tan(cam.fov*Math.PI/360)*a);ctl.minDistance=dist*.55;ctl.maxDistance=dist*1.45}
      function reset(){fit();home.set(.64,.22,.74).normalize().multiplyScalar(dist);cam.position.copy(home).add(ctl.target);ctl.update();dirty=true}
      var vis=true,dirty=true,paint=null,rims=[],cur=new T.Color(),want=new T.Color(),fin={};
      function size(){var w=stage.clientWidth,h=stage.clientHeight;r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();fit();dirty=true}
      function apply(){
        want.set(state.paint);var f=FIN[state.finish];fin={r:f.r,m:f.m,cc:f.cc,ccr:f.ccr};
        rims.forEach(function(mm){mm.color.set(state.rim);mm.metalness=state.rim==='#2a2a2e'?.6:1;mm.roughness=state.rim==='#2a2a2e'?.45:.25});
        ctl.autoRotate=state.spin&&!calm;if(calm&&paint){paint.color.copy(want);step(1)}
        dirty=true;loop();
      }
      function step(k){
        if(!paint)return false;var moving=false;
        if(Math.abs(cur.r-want.r)+Math.abs(cur.g-want.g)+Math.abs(cur.b-want.b)>.002){cur.lerp(want,k);paint.color.copy(cur);moving=true}else paint.color.copy(want);
        ['r','m','cc','ccr'].forEach(function(p){var map={r:'roughness',m:'metalness',cc:'clearcoat',ccr:'clearcoatRoughness'}[p],v=paint[map];if(Math.abs(v-fin[p])>.002){paint[map]=v+(fin[p]-v)*k;moving=true}else paint[map]=fin[p]});
        return moving;
      }
      var dl=new DL();dl.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/draco/gltf/');
      var gl=new GL();gl.setDRACOLoader(dl);
      function fail(){r.dispose();ctl.dispose();removeEventListener('resize',size);io.disconnect();vis=false;cv.remove();started=false;load.hidden=true;if(btn)btn.hidden=false}
      gl.load(stage.dataset.model,function(g){try{
        g.scene.traverse(function(o){
          if(!o.isMesh)return;var mm=o.material;
          if(mm.name==='ZPaint')paint=mm;
          if(mm.name==='ZRim'&&rims.indexOf(mm)<0)rims.push(mm);
          if(mm.name==='ZGlass'){mm.depthWrite=false;o.renderOrder=2}
        });
        if(paint){cur.set(state.paint);paint.color.copy(cur)}
        sc.add(g.scene);stage.appendChild(cv);size();reset();
        requestAnimationFrame(function(){cv.classList.add('on');load.hidden=true;stage.classList.add('is-3d')});
        api={apply:apply,reset:reset};apply();
        dl.dispose();
      }catch(err){fail()}},function(e){if(e.total)bar.style.transform='scaleX('+(e.loaded/e.total)+')'},fail);
      ctl.addEventListener('change',function(){dirty=true});
      ctl.addEventListener('start',function(){stage.classList.add('touched')});
      addEventListener('resize',size);
      var io=new IntersectionObserver(function(es){vis=es[0].isIntersecting;if(vis)loop()});io.observe(stage);
      cv.addEventListener('keydown',function(e){
        var k=e.key,s=new T.Spherical().setFromVector3(cam.position.clone().sub(ctl.target));
        if(k==='ArrowLeft')s.theta-=.2;else if(k==='ArrowRight')s.theta+=.2;
        else if(k==='ArrowUp')s.phi=Math.max(ctl.minPolarAngle,s.phi-.12);else if(k==='ArrowDown')s.phi=Math.min(ctl.maxPolarAngle,s.phi+.12);
        else if(k==='+'||k==='=')s.radius=Math.max(ctl.minDistance,s.radius*.9);else if(k==='-')s.radius=Math.min(ctl.maxDistance,s.radius*1.1);
        else return;
        e.preventDefault();cam.position.setFromSpherical(s).add(ctl.target);ctl.update();stage.classList.add('touched');dirty=true;loop();
      });
      document.addEventListener('visibilitychange',function(){if(!document.hidden)loop()});
      var raf=0;
      function loop(){
        if(raf||!vis||document.hidden)return;
        raf=requestAnimationFrame(function t(){
          raf=0;if(!vis||document.hidden)return;
          ctl.update();if(step(.09))dirty=true;
          if(dirty||ctl.autoRotate){r.render(sc,cam);dirty=false}
          raf=requestAnimationFrame(t);
        });
      }
    }).catch(function(){started=false;load.hidden=true;if(btn)btn.hidden=false});
  }
  var seen=false,go=false;
  function tryStart(){if(seen&&go&&!save)start()}
  if(btn)btn.addEventListener('click',function(){save=false;go=true;seen=true;start()});
  if(save&&btn)btn.hidden=false;
  ['pointerdown','touchstart','scroll','keydown'].forEach(function(ev){addEventListener(ev,function(){go=true;tryStart()},{once:true,passive:true})});
  stage.addEventListener('pointerenter',function(){go=true;tryStart()},{once:true});
  setTimeout(function(){go=true;tryStart()},4000);
  if('IntersectionObserver' in window){var o=new IntersectionObserver(function(es){if(es[0].isIntersecting){o.disconnect();seen=true;tryStart()}},{rootMargin:'200px'});o.observe(stage)}
  else{seen=true;tryStart()}
})();
