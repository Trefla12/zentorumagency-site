/* Zentorum Agency · /collab/ form: posts JSON to the same endpoint as the homepage form. */
(function(){
  var f=document.getElementById('collab');if(!f)return;
  var t0=Date.now(),msg=document.getElementById('c-msg'),btn=f.querySelector('button[type=submit]');
  function say(t,c){msg.textContent=t;msg.className='msg '+(c||'')}
  function bad(t,el){say(t,'err');if(window.ZTA&&ZTA.flag)ZTA.flag(f,el);el.focus()}
  function normUrl(v){
    v=v.trim();if(!v||/\s/.test(v))return '';
    if(!/^https?:\/\//i.test(v)){if(/^[a-z][a-z0-9+.-]*:/i.test(v)&&!/^[^/]+:\d+(\/|$)/.test(v))return '';v='https://'+v}
    try{var u=new URL(v);if(!/^https?:$/.test(u.protocol)||!/^([a-z0-9\u00a0-\uffff]([a-z0-9\u00a0-\uffff-]*[a-z0-9\u00a0-\uffff])?\.)+([a-z]{2,}|xn--[a-z0-9-]+)$/i.test(u.hostname))return '';return u.href}catch(e){return ''}
  }
  f.addEventListener('submit',function(e){
    e.preventDefault();
    var g=function(n){return (f.elements[n].value||'').trim()};
    var name=g('name'),email=g('email');
    if(!(window.ZTA?ZTA.isName(name):name.length>=2)){bad('Please tell us your name.',f.elements.name);return}
    if(!(window.ZTA?ZTA.isEmail(email):/^\S+@\S+\.\S{2,}$/.test(email))){bad('That email does not look right.',f.elements.email);return}
    var what=g('what'),site=g('portfolio');
    if(site){site=normUrl(site);if(!site){bad('That link does not look right. Try yourportfolio.com, or leave it empty.',f.elements.portfolio);return}}
    if(what.length<2||!/[A-Za-z\u00c0-\uffff]/.test(what)){bad('Please tell us what you do.',f.elements.what);return}
    if(window.ZTA&&ZTA.flag)ZTA.flag(f);
    var data={name:name,email:email,website:site.slice(0,120),services:('Collab: '+what).slice(0,200),dream:what,botcheck:f.elements.botcheck.value,page:location.href.split('?')[0],referrer:document.referrer.slice(0,200)};
    if(data.botcheck){done();return}
    btn.disabled=true;say('Sending...');
    var wait=Math.max(0,4100-(Date.now()-t0));
    setTimeout(function(){
      data.t=Date.now()-t0;
      var ac=new AbortController(),to=setTimeout(function(){ac.abort()},25000);
      fetch(f.dataset.endpoint,{method:'POST',body:JSON.stringify(data),signal:ac.signal,redirect:'follow'})
        .then(function(r){return r.json().then(function(j){return{r:r,j:j}},function(){return{r:r,j:{}}})})
        .then(function(x){if(!x.r.ok||!x.j.ok)throw new Error(x.j.error||'fail');done()})
        .catch(function(){btn.disabled=false;say('We could not send that just now. Please try again, or email zentorum1@gmail.com.','err')})
        .then(function(){clearTimeout(to)});
    },wait);
  });
  function done(){f.hidden=true;var ok=document.getElementById('c-ok');ok.hidden=false;ok.focus()}
})();
