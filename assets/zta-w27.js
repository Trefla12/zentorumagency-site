/* Zentorum Agency · Web Wins signup on /27-things/. No dependencies. */
(function(){
  var EP='https://script.google.com/macros/s/AKfycbzsNUGEs45W60Yx-EF95xi5CX0CcK8MYEizo3FUSoJ8qrPrVDP-tZn1UMdAFfXO486b/exec';
  var f=document.getElementById('ww-f');if(!f)return;
  var t0=Date.now(),$=function(i){return document.getElementById(i)};
  var okName=function(n){return window.ZTA?ZTA.isName(n):n.trim().length>=2},okMail=function(e){return window.ZTA?ZTA.isEmail(e):/^\S+@\S+\.\S{2,}$/.test(e)};
  var err=function(m){var e=$('ww-err');e.textContent=m;e.hidden=!m};
  f.addEventListener('submit',function(ev){
    ev.preventDefault();
    var nm=$('ww-n').value.trim(),em=$('ww-e').value.trim(),b=f.querySelector('button[type=submit]');
    if(!okName(nm))return err('Please add your first name.');
    if(!okMail(em))return err('Please check your email address.');
    if(!$('ww-c').checked)return err('Please tick the box so we know you are happy to get the weekly tip.');
    err('');b.disabled=true;b.textContent='One moment…';
    var body={type:'webwins',name:nm,email:em,services:'Web Wins signup (27 things PDF)',dream:'type=webwins. Wants the free PDF "27 things your small-business website needs" and the weekly Web Wins tip. Consent given on /27-things/. Reply with the tip list or add to the mailing list.',contact:'Email',page:location.href.split('?')[0],referrer:(document.referrer||'').slice(0,200),t:Math.max(4100,Date.now()-t0),botcheck:$('ww-bc').value,sid:'ww'+Date.now().toString(36)+Math.random().toString(36).slice(2,8)};
    var done=function(){f.hidden=true;var o=$('ww-ok');o.hidden=false;o.setAttribute('tabindex','-1');o.focus()};
    var ac=new AbortController(),to=setTimeout(function(){ac.abort()},25000);
    fetch(EP,{method:'POST',body:JSON.stringify(body),redirect:'follow',signal:ac.signal}).then(function(r){return r.json().then(function(j){return{r:r,j:j}},function(){return{r:r,j:null}})}).then(function(x){
      /* success only on a real {ok:true} answer; anything else (HTTP error, HTML, {ok:false}) is a failure the visitor can retry */
      if(!x.r.ok||!x.j||x.j.ok!==true)throw new Error((x.j&&x.j.error)||'send');done()
    }).catch(function(){
      b.disabled=false;b.textContent='Try again';
      var e=$('ww-err');e.textContent='Sorry, that did not send, so you are not signed up yet. Please try again, or email ';
      var a=document.createElement('a');a.href='mailto:zentorum1@gmail.com?subject='+encodeURIComponent('Web Wins + free PDF')+'&body='+encodeURIComponent('Please send me the 27-things PDF and the weekly Web Wins tip. My name: '+nm);a.textContent='zentorum1@gmail.com';e.appendChild(a);e.appendChild(document.createTextNode(' and we will add you.'));e.hidden=false;
    }).then(function(){clearTimeout(to)});
  });
})();
