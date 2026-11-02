/* Zentorum Agency tools, part 3: website teardown (Google PageSpeed + 8 questions). No dependencies. */
(function(){
  var d=document,$=function(i){return d.getElementById(i)},t0=Date.now();
  var EP='https://script.google.com/macros/s/AKfycbzsNUGEs45W60Yx-EF95xi5CX0CcK8MYEizo3FUSoJ8qrPrVDP-tZn1UMdAFfXO486b/exec';
  var PSI_KEY=''; // optional free Google API key (PageSpeed Insights API, restricted to zentorumagency.com); without it Google's shared quota is often used up
  var okName=function(n){return window.ZTA?ZTA.isName(n):n.trim().length>=2},okMail=function(e){return window.ZTA?ZTA.isEmail(e):/^\S+@\S+\.\S{2,}$/.test(e)};
  function send(data){
    var body=Object.assign({page:location.href.split('?')[0],referrer:d.referrer.slice(0,200),t:Math.max(4100,Date.now()-t0),contact:'Email'},data);
    return fetch(EP,{method:'POST',body:JSON.stringify(body),redirect:'follow'}).then(function(r){return r.json().catch(function(){return{}})}).then(function(j){if(!j.ok)throw new Error(j.error||'send');return j});
  }
  function err(el,msg,fld){el.textContent=msg;el.hidden=!msg;var fm=el.closest('form');if(fm&&window.ZTA&&ZTA.flag)ZTA.flag(fm,msg?fld:null);if(fld&&msg)fld.focus()}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

  var f=$('td-f');if(!f)return;
  /* Questions: weight = how much a "No" costs; fix = what we tell them. */
  var Q=[
    [14,'Your visitors can’t tell what you do in 5 seconds','Make the headline say what you do, for whom and where, e.g. “Mobile car detailing in Austin”. Move clever slogans below it.'],
    [14,'There is no clear main button at the top','Put one bold button above the fold (Book, Call, Get a quote) and repeat it after every section.'],
    [14,'The site isn’t built for phones','Most visitors are on a phone. Bigger text, thumb-size buttons and a sticky Call or Book button fix most of it.'],
    [12,'No reviews on the homepage','Show 3 real reviews with names and a star rating near the top. It is the cheapest trust boost there is.'],
    [10,'Prices are hidden','Show “from” prices or packages. People who see a price are far more likely to get in touch than people who have to ask.'],
    [10,'Contact takes more than one tap','Add a tap-to-call number and a short form (3–4 fields). Every extra step loses people.'],
    [12,'People can’t find you on Google','Claim your Google Business Profile, put your city in titles and headings, and give each service its own page.'],
    [8,'The site looks out of date','Fresh photos of your real work and a modern layout signal that the business is active and cared for.']
  ];
  /* Google audits we translate into plain words (id, weight, fix). */
  var A={
    'largest-contentful-paint':[16,'Your main content is slow to appear on phones','Compress the hero image (WebP or AVIF), size it for phones and load it first. Aim for under 2.5 seconds.'],
    'render-blocking-resources':[10,'Code blocks the page from showing','Load fonts, CSS and scripts so they don’t hold back the first paint (defer scripts, inline critical CSS).'],
    'uses-optimized-images':[10,'Images are heavier than they need to be','Re-export photos as WebP at the size they are shown. Many sites drop 70% of their weight this way.'],
    'modern-image-formats':[9,'Images use old formats','Serve WebP or AVIF instead of JPG or PNG. Same look, a fraction of the size.'],
    'uses-responsive-images':[8,'Phones download desktop-size images','Give each image phone and desktop sizes (srcset) so phones download small files.'],
    'offscreen-images':[7,'Hidden images load straight away','Lazy-load images further down the page so the top shows faster.'],
    'unused-javascript':[9,'Too much unused code','Remove apps and scripts you no longer use. Each one slows every page.'],
    'server-response-time':[9,'The server is slow to answer','Faster hosting or caching (a CDN) cuts the wait before anything shows.'],
    'cumulative-layout-shift':[8,'The page jumps around while loading','Set image sizes and reserve space for banners so content doesn’t move under people’s thumbs.'],
    'total-blocking-time':[8,'The page freezes when people tap','Heavy scripts block taps and scrolling. Trim third-party widgets and split up big scripts.'],
    'meta-description':[7,'No Google description','Write a 150-character description for each page; it is the text people read on Google before they click.'],
    'document-title':[8,'Missing page title','Every page needs a title with your service and city.'],
    'image-alt':[5,'Images have no descriptions','Add short alt text to images. It helps Google and visitors who use screen readers.'],
    'color-contrast':[5,'Some text is hard to read','Darken light-gray text or lighten the background so everyone can read it outdoors on a phone.'],
    'target-size':[5,'Buttons are too small to tap','Make buttons and links at least 44px tall with space between them.'],
    'viewport':[12,'The site isn’t set up for phones','Add a mobile viewport tag and a responsive layout.']
  };
  var CAT=[['performance','Speed'],['seo','SEO'],['accessibility','Accessibility'],['best-practices','Best practice']];

  var url='',psi=null,psiDone=false,logT=0;
  var run=$('td-run'),out=$('td-out'),go=$('td-go'),log=$('td-log');
  var LOG=['Opening the site on a mid-range phone','Measuring how fast the first content shows','Checking image sizes and formats','Looking for code that slows the page','Reading titles and Google tags','Checking text contrast and tap sizes'];

  function norm(v){
    v=v.trim();if(!v||/\s/.test(v))return '';
    if(!/^https?:\/\//i.test(v))v='https://'+v;
    try{var u=new URL(v);if(!/\.[a-z]{2,}$/i.test(u.hostname))return '';return u.origin+u.pathname}catch(e){return ''}
  }
  function line(t,cls){var li=d.createElement('li');li.textContent=t;if(cls)li.className=cls;log.appendChild(li);while(log.children.length>4)log.removeChild(log.firstChild)}

  f.addEventListener('submit',function(e){
    e.preventDefault();
    url=norm($('td-u').value);
    if(!url)return err($('td-err'),'Please enter a website address, e.g. yourbusiness.com',$('td-u'));
    err($('td-err'),'');psi=null;psiDone=false;out.hidden=true;log.innerHTML='';
    $('td-dom').textContent=url.replace(/^https?:\/\//,'').replace(/\/$/,'');
    run.hidden=false;run.classList.add('is-on');
    run.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
    var k=0;line(LOG[k++]+'…');clearInterval(logT);
    logT=setInterval(function(){if(psiDone){clearInterval(logT);return}line(LOG[k%LOG.length]+'…');k++},2600);
    var ac=new AbortController(),to=setTimeout(function(){ac.abort()},75000);
    var q='https://www.googleapis.com/pagespeedonline/v5/runPagespeed?strategy=mobile&url='+encodeURIComponent(url)+CAT.map(function(c){return '&category='+c[0]}).join('')+(PSI_KEY?'&key='+PSI_KEY:'');
    fetch(q,{signal:ac.signal}).then(function(r){return r.json()}).then(function(j){
      if(!j.lighthouseResult)throw new Error((j.error&&j.error.code)||'psi');
      psi=j.lighthouseResult;line('✓ Google test finished','ok');
    }).catch(function(){psi=null;line('Google’s free test is busy right now, so we’ll score your answers','warn')})
      .then(function(){clearTimeout(to);psiDone=true;clearInterval(logT);run.classList.remove('is-on');if(go.dataset.wait)show()});
  });

  go.addEventListener('click',function(){
    var miss=Q.some(function(_,i){return !d.querySelector('input[name="td'+i+'"]:checked')});
    if(miss)return err($('td-qerr'),'Please answer all 8 questions (“Not sure” is fine).');
    err($('td-qerr'),'');
    if(!psiDone){go.dataset.wait=1;go.disabled=true;go.querySelector('span').textContent='Waiting for Google…';return}
    show();
  });

  function ring(v,size,label){
    var r=size/2-6,c=2*Math.PI*r,col=v>=90?'#8fd6a8':v>=50?'#e6c98c':'#f2917f';
    return '<div class="tdx__ring" style="--c:'+col+';width:'+size+'px"><svg viewBox="0 0 '+size+' '+size+'" aria-hidden="true"><circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'"/><circle class="v" cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" style="stroke-dasharray:'+c+';--o:'+(c*(1-v/100))+';--f:'+c+'"/></svg><b>'+v+'</b>'+(label?'<small>'+label+'</small>':'')+'</div>';
  }

  function show(){
    delete go.dataset.wait;go.disabled=false;go.querySelector('span').textContent='Show my score';
    var fixes=[],ans=[],qs=0,qmax=0;
    Q.forEach(function(q,i){
      var v=d.querySelector('input[name="td'+i+'"]:checked').value;ans.push(v);
      qmax+=q[0];qs+=v==='y'?q[0]:v==='s'?q[0]/2:0;
      if(v!=='y')fixes.push({w:v==='n'?q[0]:q[0]/2,t:q[1],f:q[2]});
    });
    var check=Math.round(qs/qmax*100),g='',total=check,gs=[];
    if(psi){
      gs=CAT.map(function(c){var s=psi.categories[c[0]];return s&&s.score!=null?Math.round(s.score*100):null});
      var ok=gs.filter(function(x){return x!=null});
      var gavg=ok.length?(2*(gs[0]||0)+ok.reduce(function(a,b){return a+b},0))/(ok.length+2):check;
      total=Math.round(check*.5+gavg*.5);
      var au=psi.audits||{},lcp=au['largest-contentful-paint'];
      Object.keys(A).forEach(function(id){var a=au[id];if(a&&a.score!=null&&a.score<.9){var m=A[id],sev=1-a.score;
        fixes.push({w:m[0]*(.5+sev),t:m[1]+(a.displayValue&&/paint|blocking|layout/.test(id)?' ('+a.displayValue.replace(/\s+/g,' ')+')':''),f:m[2]})}});
      g='<div class="tdx__gg">'+CAT.map(function(c,i){return gs[i]==null?'':ring(gs[i],92,c[1])}).join('')+'</div>'
        +(lcp?'<p class="note">Main content appears in <b>'+esc(lcp.displayValue||'?')+'</b> on a mid-range phone (Google aims for under 2.5 s).</p>':'');
    }else{
      g='<p class="note tdx__busy">Google’s free speed test was busy, so this score uses your answers only. <a class="gold" href="https://pagespeed.web.dev/analysis?url='+encodeURIComponent(url)+'&form_factor=mobile" target="_blank" rel="noopener">Run Google’s full test</a> and we’ll add it to your teardown.</p>';
    }
    fixes.sort(function(a,b){return b.w-a.w});
    var top=fixes.slice(0,3);
    if(!top.length)top=[{t:'Strong foundations',f:'You answered yes to everything. Next step: test new headlines and offers to lift bookings further.'}];
    $('td-s').innerHTML=ring(total,168,'');
    $('td-verdict').textContent=total>=85?'Strong. A few tweaks and it sells even better.':total>=65?'Decent, but it is leaving customers on the table.':total>=45?'It is costing you customers every week.':'Visitors are likely leaving before they contact you.';
    $('td-g').innerHTML=g;
    $('td-fix').innerHTML=top.map(function(x){return '<li><b>'+esc(x.t)+'</b><span>'+esc(x.f)+'</span></li>'}).join('');
    out.hidden=false;$('td-m').hidden=false;$('td-ok').hidden=true;
    out.focus({preventScroll:true});out.scrollIntoView({behavior:'smooth',block:'start'});
    out.dataset.sum='Teardown score '+total+'/100 (answers '+check+(psi?', Google '+CAT.map(function(c,i){return c[1]+' '+(gs[i]==null?'?':gs[i])}).join(', '):', Google test busy')+'). Answers: '+ans.join('')+'. Top fixes: '+top.map(function(x){return x.t}).join('; ')+'.';
  }

  var m=$('td-m');
  m.addEventListener('submit',function(e){
    e.preventDefault();var nm=$('td-n').value.trim(),em=$('td-e').value.trim(),er=$('td-merr'),b=m.querySelector('button');
    if(!okName(nm))return err(er,'Please add your first name.',$('td-n'));
    if(!okMail(em))return err(er,'Please check your email address.',$('td-e'));
    err(er,'');b.disabled=true;b.querySelector('span').textContent='Sending…';
    send({name:nm,email:em,website:url,services:'Free website teardown',dream:out.dataset.sum||'',botcheck:$('td-bc').value})
      .then(function(){m.hidden=true;$('td-ok').hidden=false;$('td-ok').focus()})
      .catch(function(){err(er,'That didn’t send. Please try again, or text us at 512-241-5531.')})
      .then(function(){b.disabled=false;b.querySelector('span').textContent='Send me the full teardown'});
  });
})();
