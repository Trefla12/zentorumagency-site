/* Zentorum Agency · free tools part 2: logo mockup, website cost calculator, Instagram check, PDF guide. No dependencies. */
(function(){
  var d=document,$=function(i){return d.getElementById(i)},t0=Date.now();
  var EP='https://script.google.com/macros/s/AKfycbzsNUGEs45W60Yx-EF95xi5CX0CcK8MYEizo3FUSoJ8qrPrVDP-tZn1UMdAFfXO486b/exec';
  var okName=function(n){return window.ZTA?ZTA.isName(n):n.trim().length>=2},okMail=function(e){return window.ZTA?ZTA.isEmail(e):/^\S+@\S+\.\S{2,}$/.test(e)};
  function send(data){
    var body=Object.assign({page:location.href.split('?')[0],referrer:d.referrer.slice(0,200),t:Math.max(4100,Date.now()-t0),contact:'Email'},data);
    return fetch(EP,{method:'POST',body:JSON.stringify(body),redirect:'follow'}).then(function(r){return r.json().catch(function(){return{}})}).then(function(j){if(!j.ok)throw new Error(j.error||'send');return j});
  }
  function err(el,msg,fld){el.textContent=msg;el.hidden=!msg;var fm=el.closest('form');if(fm&&window.ZTA&&ZTA.flag)ZTA.flag(fm,msg?fld:null);if(fld&&msg)fld.focus()}
  var SPM={'ø':'o','æ':'ae','œ':'oe','ß':'ss','đ':'d','ð':'d','þ':'th','ł':'l','ı':'i'};
  function slug(v){return String(v).trim().toLowerCase().replace(/[øæœßđðþłı]/g,function(c){return SPM[c]}).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
  var money=function(n){return '$'+Math.round(n).toLocaleString('en-US')};

  /* ---------- 1. Logo mockup ---------- */
  var cv=$('lg-cv');
  if(cv){
    var x=cv.getContext('2d'),W=cv.width,H=cv.height,inp=$('lg-n'),st='serif',col='#e6c98c';
    var SERIF="'Cormorant Garamond','CG Fallback',Georgia,serif",SANS="Inter,system-ui,sans-serif";
    function gfirst(w){if(window.Intl&&Intl.Segmenter){try{var it=new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(w)[Symbol.iterator]().next();if(!it.done)return it.value.segment}catch(e){}}return Array.from(w)[0]||''}
    function rr(px,py,w,h,r){x.beginPath();x.moveTo(px+r,py);x.arcTo(px+w,py,px+w,py+h,r);x.arcTo(px+w,py+h,px,py+h,r);x.arcTo(px,py+h,px,py,r);x.arcTo(px,py,px+w,py,r);x.closePath()}
    function fit(txt,font,max,size){x.font=font.replace('S',size+'px');while(x.measureText(txt).width>max&&size>10){size-=2;x.font=font.replace('S',size+'px')}return size}
    function ink(px,py,w,h){if(col!=='gold')return col;var g=x.createLinearGradient(px,py,px+w,py+h);g.addColorStop(0,'#b8924c');g.addColorStop(.45,'#e6c98c');g.addColorStop(.5,'#fff6df');g.addColorStop(.55,'#e6c98c');g.addColorStop(1,'#c9a565');return g}
    function mark(name,cx,cy,max,big){
      var ini=name.split(/\s+/).filter(Boolean).map(function(w){return gfirst(w)}).slice(0,2).join('').toUpperCase()||'Z';
      x.textAlign='center';x.textBaseline='middle';x.fillStyle=ink(cx-max/2,cy-big,max,big*2);x.strokeStyle=x.fillStyle;
      if(st==='serif'){var s=fit(name,'400 S '+SERIF,max,big);x.fillText(name,cx,cy-s*.12);x.font='500 '+Math.round(s*.2)+'px '+SANS;x.letterSpacing=Math.round(s*.08)+'px';x.fillText('EST. '+new Date().getFullYear(),cx,cy+s*.62);x.letterSpacing='0px'}
      else if(st==='modern'){x.letterSpacing=Math.round(big*.14)+'px';var s2=fit(name.toUpperCase(),'600 S '+SANS,max,Math.round(big*.62));x.fillText(name.toUpperCase(),cx,cy);x.letterSpacing='0px';x.fillRect(cx-s2*.9,cy+s2*.95,s2*1.8,Math.max(2,s2*.08))}
      else{var r=big*.95;x.lineWidth=Math.max(2,big*.05);x.beginPath();x.arc(cx,cy,r,0,6.283);x.stroke();x.beginPath();x.arc(cx,cy,r*.84,0,6.283);x.lineWidth=Math.max(1,big*.02);x.stroke();x.font='400 '+Math.round(r*.95)+'px '+SERIF;x.fillText(ini,cx,cy+r*.04)}
    }
    function draw(){
      var name=(inp.value||'').trim().slice(0,28)||'Your Brand';
      x.clearRect(0,0,W,H);var bg=x.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#1a0c1e');bg.addColorStop(1,'#07030a');x.fillStyle=bg;x.fillRect(0,0,W,H);
      var gl=x.createRadialGradient(W*.35,H*.3,10,W*.35,H*.3,W*.6);gl.addColorStop(0,'rgba(230,201,140,.14)');gl.addColorStop(1,'rgba(230,201,140,0)');x.fillStyle=gl;x.fillRect(0,0,W,H);
      /* business card */
      x.save();x.translate(W*.36,H*.46);x.rotate(-.07);x.shadowColor='rgba(0,0,0,.7)';x.shadowBlur=60;x.shadowOffsetY=30;
      rr(-330,-190,660,380,18);x.fillStyle='#120916';x.fill();x.shadowColor='transparent';x.strokeStyle='rgba(230,201,140,.25)';x.lineWidth=1.5;x.stroke();
      mark(name,0,-6,540,st==='badge'?120:96);x.restore();
      /* phone with profile */
      x.save();x.translate(W*.8,H*.52);x.rotate(.05);x.shadowColor='rgba(0,0,0,.75)';x.shadowBlur=60;x.shadowOffsetY=30;
      rr(-150,-300,300,600,44);x.fillStyle='#0d0710';x.fill();x.shadowColor='transparent';x.strokeStyle='rgba(247,236,214,.18)';x.lineWidth=3;x.stroke();
      rr(-136,-286,272,572,34);x.fillStyle='#16101a';x.fill();
      x.beginPath();x.arc(0,-170,66,0,6.283);x.fillStyle='#1d1022';x.fill();x.lineWidth=4;x.strokeStyle=ink(-66,-236,132,132);x.stroke();
      x.save();x.beginPath();x.arc(0,-170,62,0,6.283);x.clip();
      if(st==='badge'){mark(name,0,-170,110,52)}else{var ini=name.split(/\s+/).filter(Boolean).map(function(w){return w[0]}).join('').slice(0,2).toUpperCase();x.textAlign='center';x.textBaseline='middle';x.fillStyle=ink(-60,-230,120,120);x.font=(st==='serif'?'400 70px '+SERIF:'600 46px '+SANS);x.fillText(ini,0,-166)}
      x.restore();
      x.textAlign='center';x.fillStyle='#F7ECD6';x.font='600 22px '+SANS;fit(name,'600 S '+SANS,240,22);x.fillText(name,0,-70);
      x.fillStyle='#b3a692';x.font='400 15px '+SANS;x.fillText('@'+name.toLowerCase().replace(/[^a-z0-9]+/g,''),0,-42);
      for(var i=0;i<6;i++){rr(-118+(i%3)*80,-6+Math.floor(i/3)*80,74,74,8);x.fillStyle=i%2?'rgba(230,201,140,.10)':'rgba(247,236,214,.06)';x.fill()}
      x.restore();
      x.textAlign='left';x.textBaseline='alphabetic';x.fillStyle='rgba(247,236,214,.45)';x.font='500 16px '+SANS;x.letterSpacing='3px';x.fillText('MOCKUP · ZENTORUMAGENCY.COM',40,H-34);x.letterSpacing='0px';
    }
    var go=function(){(d.fonts&&d.fonts.ready?d.fonts.ready:Promise.resolve()).then(draw)};
    inp.addEventListener('input',go);
    [].forEach.call(d.querySelectorAll('[name=lg-s]'),function(r){r.addEventListener('change',function(){st=r.value;go()})});
    [].forEach.call(d.querySelectorAll('[name=lg-c]'),function(r){r.addEventListener('change',function(){col=r.value;go()})});
    $('lg-dl').addEventListener('click',function(){
      var a=d.createElement('a'),n=slug(inp.value||'brand').replace(/^-|-$/g,'')||'brand';
      a.download=n+'-logo-mockup.png';a.href=cv.toDataURL('image/png');d.body.appendChild(a);a.click();a.remove();
      $('lg-cta').hidden=false;
    });
    col='gold';go();
  }

  /* ---------- 2. Website cost calculator ---------- */
  var cf=$('cc-f');
  if(cf){
    var IND={ 'auto-detailing':['booking','gallery','reviews'],'salons-barbers':['booking','gallery','reviews'],'restaurants-cafes':['menu','reviews','gallery'],'clinics-dental':['booking','forms','reviews'],'real-estate':['listings','forms','gallery'],'fitness-gyms':['booking','gallery','reviews'],'contractors-trades':['gallery','forms','reviews'],'online-stores':['store','reviews','gallery'],'other':['forms']};
    var F={booking:[.06,'Online booking'],gallery:[.03,'Photo gallery'],reviews:[.02,'Reviews section'],menu:[.04,'Menu page'],forms:[.03,'Quote / intake forms'],listings:[.1,'Listings pages'],store:[.35,'Online store'],blog:[.06,'Blog'],anim:[.12,'3D or motion hero'],copy:[.06,'We write the words']};
    var ind=$('cc-i'),pg=$('cc-p'),pgo=$('cc-po');
    function sync(){var on=IND[ind.value]||[];[].forEach.call(cf.querySelectorAll('[name=cc-x]'),function(c){c.checked=on.indexOf(c.value)>-1});calc()}
    function calc(){
      var p=+pg.value;pgo.textContent=p+(p===1?' page':' pages');
      var store=cf.querySelector('[value=store]').checked,big=p>5||store,sc=0,list=[];
      [].forEach.call(cf.querySelectorAll('[name=cc-x]:checked'),function(c){sc+=F[c.value][0];list.push(F[c.value][1])});
      var lo,hi;
      if(!big){lo=1250+(p-1)*60+sc*900;hi=lo+450+sc*500;hi=Math.min(hi,2400)}
      else{lo=2500+Math.max(0,p-6)*90+sc*900;hi=lo+700+sc*600;hi=Math.min(hi,4000);lo=Math.min(lo,3500)}
      var r5=function(n){return Math.round(n/50)*50};
      $('cc-r').textContent=money(r5(lo))+' – '+money(r5(hi));
      $('cc-t').textContent=big?'About 7–11 days':'About 3–7 days';
      $('cc-w').textContent=list.length?'Includes: '+list.join(', ')+'.':'A clean site with your key pages and a contact form.';
      var q=new URLSearchParams({svc:'web',est:r5(lo)+'-'+r5(hi),ind:ind.value,pages:p});$('cc-go').href='/contact/?'+q;
    }
    ind.addEventListener('change',sync);cf.addEventListener('input',calc);cf.addEventListener('change',calc);sync();
  }

  /* ---------- 3. Rate my Instagram ---------- */
  var ig=$('ig-f');
  if(ig){
    ig.addEventListener('submit',function(e){
      e.preventDefault();var h=$('ig-h').value.trim().replace(/^@/,''),em=$('ig-e').value.trim(),nm=$('ig-n').value.trim(),er=$('ig-err');
      if(!/^(?!\.)(?!.*\.\.)(?!.*\.$)[A-Za-z0-9._]{1,30}$/.test(h))return err(er,'Please enter your Instagram handle, like @yourbrand.',$('ig-h'));
      if(!okName(nm))return err(er,'Please add your first name.',$('ig-n'));
      if(!okMail(em))return err(er,'Please check your email address.',$('ig-e'));
      err(er,'');
      var v=function(n){var c=ig.querySelector('[name='+n+']:checked');return c?c.value:''},pf=v('ig1'),rl=v('ig2'),lk=v('ig3'),tips=[];
      if(pf==='0'||pf==='1')tips.push(['Post more often, on a schedule.','Aim for 3 posts a week on fixed days. A steady rhythm beats bursts. Batch-film once a week so it never feels like a chore.']);
      else tips.push(['Keep your rhythm, and add a pinned post.','You already post often. Pin your 3 best posts (what you do, proof, how to book) so new visitors get the story in 5 seconds.']);
      if(rl!=='yes')tips.push(['Make short Reels your main format.','Short vertical video gets shown to people who do not follow you yet. Start with one 7 to 15 second Reel a week: a before and after, or a quick how-to.']);
      else tips.push(['Hook in the first second.','Open each Reel with the result or a bold line on screen, then show how you got there. Add captions: many people watch with the sound off.']);
      if(lk!=='site')tips.push(['Send your bio link to a real page.','Point the link in your bio to a fast page with your offer, prices and a booking button, not just a list of links. That is where followers become customers.']);
      else tips.push(['Make the bio say who, what and where to start.','One line on what you do, one on who it is for, and a clear call to action that matches the first thing people see on your site.']);
      var out=$('ig-out');out.innerHTML='<h3>3 tips for <em class="gold">@'+h.replace(/[<>&"]/g,'')+'</em></h3><ol class="tips tips--n"></ol><p class="note">Based on your answers. We will also look at your profile ourselves and email you within 24 hours.</p>';
      var ol=out.querySelector('ol');tips.forEach(function(t){var li=d.createElement('li');li.innerHTML='<b></b> <span></span>';li.firstChild.textContent=t[0];li.lastChild.textContent=t[1];ol.appendChild(li)});
      out.hidden=false;out.scrollIntoView({behavior:'smooth',block:'nearest'});
      send({name:nm,email:em,brand:'@'+h,services:'Free Instagram review',dream:'Instagram review request for @'+h+'. Posts per week: '+(pf||'?')+'. Uses Reels: '+(rl||'?')+'. Bio link: '+(lk||'?')+'.',botcheck:$('ig-bc').value}).catch(function(){});
    });
  }

  /* ---------- 4. PDF guide gate ---------- */
  var pd=$('pdf-f');
  if(pd){
    pd.addEventListener('submit',function(e){
      e.preventDefault();var nm=$('pdf-n').value.trim(),em=$('pdf-e').value.trim(),er=$('pdf-err'),b=pd.querySelector('button');
      if(!okName(nm))return err(er,'Please add your first name.',$('pdf-n'));
      if(!okMail(em))return err(er,'Please check your email address.',$('pdf-e'));
      err(er,'');b.disabled=true;b.textContent='One moment…';
      var done=function(){pd.hidden=true;$('pdf-ok').hidden=false;$('pdf-ok').querySelector('a').focus()};
      send({name:nm,email:em,services:'Free PDF guide',dream:'Downloaded the guide: 10 things every small business website needs.',botcheck:$('pdf-bc').value}).then(done,done);
    });
  }
})();
