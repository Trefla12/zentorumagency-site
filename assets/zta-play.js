/* Zentorum Agency · /playground/: Three.js loads only when the stage scrolls into view. Poster stays as fallback. */
(function(){
  var stage=document.getElementById('stage');if(!stage)return;
  var calm=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var started=false;
  function start(){
    if(started)return;started=true;
    Promise.all([import('three'),import('three/addons/controls/OrbitControls.js'),import('three/addons/loaders/GLTFLoader.js'),import('three/addons/environments/RoomEnvironment.js')]).then(function(m){
      var T=m[0],OC=m[1].OrbitControls,GL=m[2].GLTFLoader,RE=m[3].RoomEnvironment;
      var cv=document.createElement('canvas');cv.setAttribute('aria-label','Interactive 3D candle jar. Drag to rotate, pinch or scroll to zoom.');cv.setAttribute('role','img');
      var r=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:false,powerPreference:'default'});
      r.setPixelRatio(Math.min(devicePixelRatio||1,2));r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.05;
      r.setClearColor(0x120716);
      var sc=new T.Scene(),pm=new T.PMREMGenerator(r);sc.environment=pm.fromScene(new RE(),.04).texture;
      var cam=new T.PerspectiveCamera(32,1,.1,50);cam.position.set(3.1,1.9,4.1);
      var key=new T.DirectionalLight(0xffe6c0,2.2);key.position.set(-3,4,3);sc.add(key);
      var rim=new T.DirectionalLight(0xb48cff,1.4);rim.position.set(3,2,-3);sc.add(rim);
      var ctl=new OC(cam,cv);ctl.enableDamping=!calm;ctl.dampingFactor=.07;ctl.enablePan=false;
      ctl.minDistance=3.2;ctl.maxDistance=8;ctl.minPolarAngle=.35;ctl.maxPolarAngle=1.62;
      ctl.target.set(0,.45,0);ctl.autoRotate=!calm;ctl.autoRotateSpeed=1.2;ctl.update();
      var vis=true,dirty=true;
      function size(){var w=stage.clientWidth,h=stage.clientHeight;r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();dirty=true}
      new GL().load(stage.dataset.model,function(g){
        sc.add(g.scene);stage.appendChild(cv);size();cv.classList.add('on');dirty=true;
        var hint=document.getElementById('hint');if(hint)hint.hidden=false;
        loop();
      },undefined,function(){started=false});
      ctl.addEventListener('change',function(){dirty=true});
      var lost=false;
      cv.addEventListener('webglcontextlost',function(e){e.preventDefault();lost=true;cv.classList.remove('on');var h=document.getElementById('hint');if(h)h.hidden=true});
      cv.addEventListener('webglcontextrestored',function(){lost=false;cv.classList.add('on');var h=document.getElementById('hint');if(h)h.hidden=false;dirty=true;size();loop()});
      addEventListener('resize',size);
      new IntersectionObserver(function(es){vis=es[0].isIntersecting;if(vis)loop()}).observe(stage);
      document.addEventListener('visibilitychange',function(){if(!document.hidden)loop()});
      var raf=0;
      function loop(){
        if(raf||!vis||document.hidden)return;
        raf=requestAnimationFrame(function t(){
          raf=0;if(!vis||document.hidden)return;
          if(lost){raf=requestAnimationFrame(t);return}
          ctl.update();
          if(!calm||dirty){r.render(sc,cam);dirty=false}
          raf=requestAnimationFrame(t);
        });
      }
    }).catch(function(){started=false});
  }
  /* Load 3D only when the stage is in view AND the visitor has interacted (or after a calm 6 s), so the page itself stays fast. */
  var seen=false,go=false;
  function tryStart(){if(seen&&go)start()}
  ['pointerdown','touchstart','scroll','keydown'].forEach(function(ev){addEventListener(ev,function(){go=true;tryStart()},{once:true,passive:true})});
  stage.addEventListener('pointerenter',function(){go=true;tryStart()},{once:true});
  setTimeout(function(){go=true;tryStart()},6000);
  if('IntersectionObserver' in window){var o=new IntersectionObserver(function(es){if(es[0].isIntersecting){o.disconnect();seen=true;tryStart()}},{rootMargin:'200px'});o.observe(stage)}
  else{seen=true;tryStart()}
})();
